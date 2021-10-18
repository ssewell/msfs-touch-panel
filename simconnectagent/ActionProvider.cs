using MSFSTouchPanel.ArduinoAgent;
using MSFSTouchPanel.FSConnector;
using MSFSTouchPanel.FsuipcAgent;
using MSFSTouchPanel.Shared;
using System;

namespace MSFSTouchPanel.SimConnectAgent
{
    public class ActionProvider
    {
        private ActionEvent _currentSelectedAction;
        private PlaneProfile _planeProfile;
        private SimConnector _simConnector;
        private FsuipcProvider _fsuipcProvider;
        private ArduinoProvider _arduinoProvider;

        private bool _isSimConnected;
        
        public ActionProvider(SimConnector simConnector, ArduinoProvider arduinoProvider, FsuipcProvider fsuipcProvider)
        {
            _currentSelectedAction = ActionEvent.NO_ACTION;
            _isSimConnected = false;

            _simConnector = simConnector;
            _fsuipcProvider = fsuipcProvider;
            _arduinoProvider = arduinoProvider;
        }

        public void Start()
        {
            _isSimConnected = true;
        }

        public void Stop()
        {
            _isSimConnected = false;
        }

        public void ExecAction(string action, SimActionType actionType, string value, int executionCount, PlaneProfile planeProfile)
        {
            _planeProfile = planeProfile;

            if (_isSimConnected && action != null)
            {
                try
                {
                    ActionEvent simConnectEventId;

                    switch (actionType)
                    {
                        case SimActionType.None:
                            // no action
                            break;
                        case SimActionType.Shared:
                            simConnectEventId = (ActionEvent)Enum.Parse(typeof(ActionEvent), $"KEY_{action}");
                            _currentSelectedAction = ActionLogicSimConnect.ExecuteSimConnectCommand(_simConnector, simConnectEventId, value);
                            break;
                        case SimActionType.HVar:
                            simConnectEventId = (ActionEvent)Enum.Parse(typeof(ActionEvent), action);
                            _currentSelectedAction = simConnectEventId;
                            ActionLogicFsuipc.ExecuteCalculatorCodeHVar(_fsuipcProvider, simConnectEventId, executionCount);
                            break;
                        case SimActionType.Custom:
                            simConnectEventId = (ActionEvent)Enum.Parse(typeof(ActionEvent), $"CUSTOM_{action}");
                            _currentSelectedAction = simConnectEventId;
                            break;
                        default:
                            simConnectEventId = (ActionEvent)Enum.Parse(typeof(ActionEvent), $"KEY_{action}");
                            _currentSelectedAction = ActionLogicSimConnect.ExecuteSimConnectCommand(_simConnector, simConnectEventId, value);
                            break;
                    }

                }
                catch (Exception e)
                {
                    Logger.ServerLog(e.Message, LogLevel.ERROR);
                }
            }
        }

        public void ArduinoInputHandler(object sender, EventArgs<ArduinoInputData> e)
        {
            if(e.Value.InputName == InputName.Keypad)
            {
                switch(e.Value.InputAction)
                {
                    case InputAction.Key1:
                        ActionLogicSimConnect.ExecuteSimConnectCommand(_simConnector, ActionEvent.KEY_ATC_MENU_1, "1");
                        break;
                    case InputAction.Key2:
                        ActionLogicSimConnect.ExecuteSimConnectCommand(_simConnector, ActionEvent.KEY_ATC_MENU_2, "1");
                        break;
                    case InputAction.Key3:
                        ActionLogicSimConnect.ExecuteSimConnectCommand(_simConnector, ActionEvent.KEY_ATC_MENU_3, "1");
                        break;
                    case InputAction.Key4:
                        ActionLogicSimConnect.ExecuteSimConnectCommand(_simConnector, ActionEvent.KEY_ATC_MENU_4, "1");
                        break;
                    case InputAction.Key5:
                        ActionLogicSimConnect.ExecuteSimConnectCommand(_simConnector, ActionEvent.KEY_ATC_MENU_5, "1");
                        break;
                    case InputAction.Key6:
                        ActionLogicSimConnect.ExecuteSimConnectCommand(_simConnector, ActionEvent.KEY_ATC_MENU_6, "1");
                        break;
                    case InputAction.Key7:
                        ActionLogicSimConnect.ExecuteSimConnectCommand(_simConnector, ActionEvent.KEY_ATC_MENU_7, "1");
                        break;
                    case InputAction.Key8:
                        ActionLogicSimConnect.ExecuteSimConnectCommand(_simConnector, ActionEvent.KEY_ATC_MENU_8, "1");
                        break;
                    case InputAction.Key9:
                        ActionLogicSimConnect.ExecuteSimConnectCommand(_simConnector, ActionEvent.KEY_ATC_MENU_9, "1");
                        break;
                    case InputAction.Key0:
                        ActionLogicSimConnect.ExecuteSimConnectCommand(_simConnector, ActionEvent.KEY_ATC_MENU_0, "1");
                        break;
                }
            }
            else if (_currentSelectedAction != ActionEvent.NO_ACTION)
                ActionLogicArduino.ExecuteCommand(_simConnector, _fsuipcProvider, _currentSelectedAction, e.Value.InputAction, e.Value.InputName, e.Value.Acceleration);
        }
    }
}