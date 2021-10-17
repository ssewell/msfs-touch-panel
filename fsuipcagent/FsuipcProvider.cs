using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Threading;
using FSUIPC;
using MSFSTouchPanel.Shared;
using Newtonsoft.Json;

namespace MSFSTouchPanel.FsuipcAgent
{
    public class FsuipcProvider
    {
        private MSFSVariableServices _fsuipc;
        private IntPtr _windowsHandle;

        public event EventHandler<EventArgs<string>> OnLVarReceived;

        public FsuipcProvider(IntPtr windowsHandle)
        {
            _windowsHandle = windowsHandle;
        }

        public void Start()
        {
            if (_fsuipc == null)
                Initialize();

            _fsuipc.Init(_windowsHandle);
            _fsuipc.Start();
            Thread.Sleep(2000);  // Allow time for FSUIPC to initialize with HVar and LVar

            _fsuipc.OnValuesChanged += HandleOnValuesChanged;
            _fsuipc.Reload();
        }

        public void Stop()
        {
            if (_fsuipc != null)
                _fsuipc.Stop();
        }

        public void ExecuteCalculatorCodeHVar(string action)
        {
            if(_fsuipc.HVars.Count == 0)
                Logger.ServerLog($"FSUIPC HVar is empty", LogLevel.ERROR);
            else
            {
                action = $"H:{action}";
                if (_fsuipc.HVars.Names.Exists(x => x == action))
                    _fsuipc.HVars[action].Set();
                else
                    Logger.ServerLog($"FSUIPC HVar value ({action}) does not exist", LogLevel.ERROR);

            }
        }

        private void Initialize()
        {
            _fsuipc = new MSFSVariableServices();
            _fsuipc.OnLogEntryReceived += (object sender, LogEventArgs e) => { Logger.ServerLog($"FSUIPC log entry - {e.LogEntry}", LogLevel.INFO); };
        }

        private void HandleOnValuesChanged(object sender, EventArgs e)
        {
            ExpandoObject lvars = new ExpandoObject();

            foreach (FsLVar fsLVar in _fsuipc.LVars) {

                if (fsLVar.Name.IndexOf("SOFTKEY") > -1)
                    lvars.TryAdd(fsLVar.Name, fsLVar.Value);
            }

            if(((IDictionary<string, object>)lvars).Count > 0)
            {
                var jsonData = JsonConvert.SerializeObject(lvars);
                OnLVarReceived?.Invoke(this, new EventArgs<string>(jsonData));
            }
        }
    }
}
