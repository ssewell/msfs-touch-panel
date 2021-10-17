using MSFSTouchPanel.FSConnector;
using MSFSTouchPanel.FsuipcAgent;
using System.Threading;

namespace MSFSTouchPanel.SimConnectAgent
{
    public class ActionLogicFsuipc
    {
        static ActionLogicFsuipc() {  }

        public static void ExecuteCalculatorCodeHVar(FsuipcProvider fsuipcProvider, ActionEvent simConnectEventId, int executionCount)
        {
            if(executionCount == 1)
                fsuipcProvider.ExecuteCalculatorCodeHVar(simConnectEventId.ToString());
            else
            {
                for (int i = 0; i < executionCount; i++)
                {
                    fsuipcProvider.ExecuteCalculatorCodeHVar(simConnectEventId.ToString());
                    Thread.Sleep(100);
                }
            }
        }
    }
}
