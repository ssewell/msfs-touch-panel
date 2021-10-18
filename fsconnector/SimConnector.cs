using Microsoft.FlightSimulator.SimConnect;
using MSFSTouchPanel.Shared;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Dynamic;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;

namespace MSFSTouchPanel.FSConnector
{
    public class SimConnector
    {
        private const int MSFS_CONNECTION_RETRY_TIMEOUT = 1000;     // timeout to retry connection to MSFS via Simconnect in milliseconds
        private const int WM_USER_SIMCONNECT = 0x402;
        private SimConnect _simConnect;
        private System.Timers.Timer _timer;

        public event EventHandler<EventArgs<dynamic>> OnReceivedData;
        public event EventHandler OnConnected;
        public event EventHandler OnDisconnected;
        public event EventHandler<EventArgs<string>> OnException;
        public event EventHandler<EventArgs<string>> OnReceiveSystemEvent;

        public SimConnector()
        {
        }

        public void Start()
        {
            _timer = new System.Timers.Timer();
            _timer.Interval = MSFS_CONNECTION_RETRY_TIMEOUT;
            _timer.Enabled = true;
            _timer.Elapsed += (source, e) => 
            {
                try
                {
                    if (_simConnect == null)
                    {
                        _simConnect = new SimConnect("MSFS Touch Panel", Process.GetCurrentProcess().MainWindowHandle, WM_USER_SIMCONNECT, null, 0);
                        
                        _simConnect.OnRecvQuit += HandleOnRecvQuit;
                        _simConnect.OnRecvException += HandleOnRecvException;
                        _simConnect.OnRecvSimobjectDataBytype += HandleOnRecvSimobjectDataBytype;
                        _simConnect.OnRecvEvent += HandleOnReceiveEvent;

                        _simConnect.SubscribeToSystemEvent(SystemEvent.SIMSTART, "SimStart");
                        _simConnect.SubscribeToSystemEvent(SystemEvent.SIMSTOP, "SimStop");

                        // Setup the SimConnect data structure definition using SimConnectStruct and SimConnect data definitions
                        var definitions = DataDefinition.GetDefinition();
                        foreach (var (PropName, SimConnectName, SimConnectUnit, SimConnectDataType) in definitions)
                            _simConnect.AddToDataDefinition(SimConnectDefinition.SimConnectDataStruct, SimConnectName, SimConnectUnit, SimConnectDataType, 0.0f, SimConnect.SIMCONNECT_UNUSED);
                        _simConnect.RegisterDataDefineStruct<SimConnectStruct>(SimConnectDefinition.SimConnectDataStruct);

                        foreach (var item in Enum.GetValues(typeof(ActionEvent)))
                        {   
                            if(item.ToString().StartsWith("KEY_"))
                                _simConnect.MapClientEventToSimEvent((ActionEvent)item, item.ToString()[4..]);
                        }

                        _timer.Enabled = false;
                        OnConnected?.Invoke(this, null);
                    }
                }
                catch (COMException ex)
                {
                    // handle SimConnect instantiation error when MSFS is not connected
                }
            };
        }

        public void Stop()
        {
            _timer.Enabled = false;
            _simConnect = null;
        }

        public void StopAndReconnect()
        {
            _simConnect = null;
            _timer.Enabled = true;
        }

        public void RequestData()
        {
            if (_simConnect != null)
                try 
                {
                    _simConnect.RequestDataOnSimObjectType(DataRequest.REQUEST_1, SimConnectDefinition.SimConnectDataStruct, 0, SIMCONNECT_SIMOBJECT_TYPE.USER);
                }
                catch(Exception ex)
                {
                    if (ex.Message != "0xC00000B0")
                        OnException?.Invoke(this, new EventArgs<string>($"SimConnect request data exception: {ex.Message}"));
                }
        }

        public void ReceiveMessage()
        {
            if (_simConnect != null)
                try
                {
                    _simConnect.ReceiveMessage();
                }
                catch (Exception ex)
                {
                    if (ex.Message != "0xC00000B0")
                        OnException?.Invoke(this, new EventArgs<string>($"SimConnect receive message exception: {ex.Message}"));
                }
        }


        public void TransmitActionEvent(Enum eventID, uint data, int acceleration)
        {
            if (_simConnect != null)
            {
                try 
                {
                    for (var i = 0; i < acceleration; i++)
                    {
                        _simConnect.TransmitClientEvent(0U, eventID, data, NotificationGroup.GROUP0, SIMCONNECT_EVENT_FLAG.GROUPID_IS_PRIORITY);
                        Thread.Sleep(25);   // small delay to ease bombarding SimConnect
                    }
                }
                catch(Exception ex)
                {
                    var eventName = eventID.ToString()[4..];        // trim out KEY_ prefix
                    OnException?.Invoke(this, new EventArgs<string>($"SimConnect transmit event exception: EventName: {eventName} - {ex.Message}"));
                }
            }
        }

        public dynamic SimData { get; set; }

        private void HandleOnRecvQuit(SimConnect sender, SIMCONNECT_RECV data)
        {
            OnDisconnected?.Invoke(this, null);
        }

        private void HandleOnRecvException(SimConnect sender, SIMCONNECT_RECV_EXCEPTION data)
        {
            var exception = (SIMCONNECT_EXCEPTION)data.dwException;

            if (exception != SIMCONNECT_EXCEPTION.NAME_UNRECOGNIZED && exception != SIMCONNECT_EXCEPTION.EVENT_ID_DUPLICATE)
            {
                OnException?.Invoke(this, new EventArgs<string>($"MSFS Error - {exception}"));
            }
        }

        private void HandleOnRecvSimobjectDataBytype (SimConnect sender, SIMCONNECT_RECV_SIMOBJECT_DATA_BYTYPE data)
        {
            if (data.dwRequestID == 0)
            {
                try
                {
                    var simConnectStruct = (SimConnectStruct)data.dwData[0];
                    var simConnectStructFields = typeof(SimConnectStruct).GetFields();
                    var simData = new ExpandoObject();
                    
                    var definition = DataDefinition.GetDefinition();
                    int i = 0;
                    foreach (var item in definition)
                        simData.TryAdd(item.PropName, simConnectStructFields[i++].GetValue(simConnectStruct));

                    SimData = simData;

                    OnReceivedData?.Invoke(this, new EventArgs<dynamic>(simData));
                }
                catch(Exception ex) 
                {
                    Logger.ServerLog($"SimConnect receive data exception: {ex.Message}", LogLevel.ERROR);
                }
            }
            else
            {
                Logger.ServerLog($"SimConnect unknown request ID: {data.dwRequestID}", LogLevel.ERROR);
            }
        }

        private void HandleOnReceiveEvent(SimConnect sender, SIMCONNECT_RECV_EVENT data)
        {
            var eventId = ((SystemEvent)data.uEventID).ToString();
            OnReceiveSystemEvent?.Invoke(this, new EventArgs<string>(eventId));
        }

        
    }
}
