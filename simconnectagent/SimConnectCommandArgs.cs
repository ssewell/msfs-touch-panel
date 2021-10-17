using MSFSTouchPanel.FSConnector;
using System;

namespace MSFSTouchPanel.SimConnectAgent
{
    public class SimConnectCommandArgs
    {
        public SimConnectCommandArgs()
        {
            SimConnectEventId = ActionEvent.NO_ACTION;
            CurrentSelectedAction = ActionEvent.NO_ACTION;
            DataValue = 1;
        }

        public ActionEvent SimConnectEventId { get; set; }

        public ActionEvent CurrentSelectedAction { get; set; }

        public UInt32 DataValue { get; set; }
    }
}
