using MSFSTouchPanel.FSConnector;
using System;
using System.Threading.Tasks;

namespace MSFSTouchPanel.SimConnectAgent
{
    public class ActionLogicSimConnect
    {
        public static ActionEvent ExecuteSimConnectCommand(SimConnector simConnector, ActionEvent actionEvent, string dataValue)
        {
            string tmpValue;
            
            ActionEvent currentSelectedAction = ActionEvent.NO_ACTION;
            uint commandData;

            switch (actionEvent)
            {
                case ActionEvent.KEY_HEADING_BUG_SYNC:
                    actionEvent = ActionEvent.KEY_HEADING_BUG_SET;
                    commandData = Convert.ToUInt32(dataValue);
                    break;
                case ActionEvent.KEY_AP_ALT_SYNC:
                    actionEvent = ActionEvent.KEY_AP_ALT_VAR_SET_ENGLISH;
                    commandData = Convert.ToUInt32(dataValue);
                    break;
                case ActionEvent.KEY_COM_STBY_RADIO_SET:
                case ActionEvent.KEY_COM2_STBY_RADIO_SET:
                    tmpValue = Convert.ToInt32(Convert.ToDouble(dataValue) * 1000).ToString().Substring(1, 4);
                    commandData = Convert.ToUInt32("0x" + tmpValue, 16);
                    break;
                case ActionEvent.KEY_NAV1_STBY_SET:
                case ActionEvent.KEY_NAV2_STBY_SET:
                    tmpValue = Convert.ToInt32(Convert.ToDouble(dataValue) * 100).ToString();
                    commandData = Convert.ToUInt32("0x" + tmpValue, 16);
                    break;
                case ActionEvent.KEY_XPNDR_SET:
                    commandData = Convert.ToUInt32(dataValue, 16);
                    break;
                case ActionEvent.KEY_AP_PANEL_ALTITUDE_HOLD:
                    currentSelectedAction = ActionEvent.CUSTOM_ALTITUDE_BUG_SELECT;
                    commandData = Convert.ToUInt32(dataValue);
                    break;
                case ActionEvent.KEY_AP_PANEL_HEADING_HOLD:
                    currentSelectedAction = ActionEvent.CUSTOM_HEADING_BUG_SELECT;
                    commandData = Convert.ToUInt32(dataValue);
                    break;
                case ActionEvent.KEY_AP_VS_HOLD:
                    currentSelectedAction = ActionEvent.CUSTOM_VSI_BUG_SELECT;
                    commandData = Convert.ToUInt32(dataValue);
                    break;
                case ActionEvent.KEY_FLIGHT_LEVEL_CHANGE:
                    currentSelectedAction = ActionEvent.CUSTOM_AIRSPEED_BUG_SELECT;
                    commandData = Convert.ToUInt32(dataValue);
                    break;
                case ActionEvent.KEY_KOHLSMAN_SET:
                    // convert Hg to millibars * 16
                    commandData = Convert.ToUInt32(Convert.ToDouble(dataValue) * 33.8639 * 16);
                    break;
                case ActionEvent.KEY_ADF_COMPLETE_SET:
                    tmpValue = Convert.ToString(dataValue + "0000");
                    commandData = Convert.ToUInt32("0x" + tmpValue, 16);
                    break;
                default:
                    if(Convert.ToInt32(dataValue) < 0)
                        commandData = UInt32.MaxValue - Convert.ToUInt32(Math.Abs(Convert.ToInt32(dataValue))); 
                    else
                        commandData = Convert.ToUInt32(dataValue);
                    break;
            }
            
            simConnector.TransmitActionEvent(actionEvent, commandData);

            return currentSelectedAction;
        }
    }
}
