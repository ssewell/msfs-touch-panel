using MSFSTouchPanel.ArduinoAgent;
using MSFSTouchPanel.FSConnector;
using MSFSTouchPanel.FsuipcAgent;
using System;

namespace MSFSTouchPanel.SimConnectAgent
{
    public class ActionLogicArduino
    {
        public static void ExecuteCommand(SimConnector simConnector, FsuipcProvider fsuipcProvider, ActionEvent clientAction, InputAction encoderAction, InputName encoderName, int acceleration)
        {
            ActionEventType actionEventType = ActionEventType.SimConnect;
            ActionEvent actionEvent = ActionEvent.NO_ACTION;
            UInt32 commandData = 1;

            switch (clientAction)
            {
                case ActionEvent.CUSTOM_NAV1_SELECT:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.KEY_NAV1_RADIO_WHOLE_INC : ActionEvent.KEY_NAV1_RADIO_FRACT_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.KEY_NAV1_RADIO_WHOLE_DEC : ActionEvent.KEY_NAV1_RADIO_FRACT_DEC;
                            break;
                        case InputAction.SW:
                            actionEvent = ActionEvent.KEY_NAV1_RADIO_SWAP;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_NAV2_SELECT:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.KEY_NAV2_RADIO_WHOLE_INC : ActionEvent.KEY_NAV2_RADIO_FRACT_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.KEY_NAV2_RADIO_WHOLE_DEC : ActionEvent.KEY_NAV2_RADIO_FRACT_DEC;
                            break;
                        case InputAction.SW:
                            actionEvent = ActionEvent.KEY_NAV2_RADIO_SWAP;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_COM1_SELECT:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.KEY_COM_RADIO_WHOLE_INC : ActionEvent.KEY_COM_RADIO_FRACT_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.KEY_COM_RADIO_WHOLE_DEC : ActionEvent.KEY_COM_RADIO_FRACT_DEC;
                            break;
                        case InputAction.SW:
                            actionEvent = ActionEvent.KEY_COM_STBY_RADIO_SWAP;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_COM2_SELECT:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.KEY_COM2_RADIO_WHOLE_INC : ActionEvent.KEY_COM2_RADIO_FRACT_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.KEY_COM2_RADIO_WHOLE_DEC : ActionEvent.KEY_COM2_RADIO_FRACT_DEC;
                            break;
                        case InputAction.SW:
                            actionEvent = ActionEvent.KEY_COM2_RADIO_SWAP;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_ALTITUDE_BUG_SELECT:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = ActionEvent.KEY_AP_ALT_VAR_INC;
                            commandData = Convert.ToUInt32(encoderName == InputName.Encoder1 ? 1000 : 100);
                            break;
                        case InputAction.CCW:
                            actionEvent = ActionEvent.KEY_AP_ALT_VAR_DEC;
                            commandData = Convert.ToUInt32(encoderName == InputName.Encoder1 ? 1000 : 100);
                            break;
                        case InputAction.SW:
                            actionEvent = ActionEvent.KEY_AP_ALT_VAR_SET_ENGLISH;
                            commandData = Convert.ToUInt32(simConnector.SimData.PLANE_ALTITUDE);
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_HEADING_BUG_SELECT:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = ActionEvent.KEY_HEADING_BUG_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = ActionEvent.KEY_HEADING_BUG_DEC;
                            break;
                        case InputAction.SW:
                            actionEvent = ActionEvent.KEY_HEADING_BUG_SET;
                            commandData = Convert.ToUInt32(simConnector.SimData.PLANE_HEADING_DEGREES_MAGNETIC);
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_VSI_BUG_SELECT:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = ActionEvent.KEY_AP_VS_VAR_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = ActionEvent.KEY_AP_VS_VAR_DEC;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_AIRSPEED_BUG_SELECT:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = ActionEvent.KEY_AP_SPD_VAR_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = ActionEvent.KEY_AP_SPD_VAR_DEC;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_XPNDR_DIGIT1_SELECT:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = ActionEvent.KEY_XPNDR_1000_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = ActionEvent.KEY_XPNDR_1000_DEC;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_XPNDR_DIGIT2_SELECT:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = ActionEvent.KEY_XPNDR_100_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = ActionEvent.KEY_XPNDR_100_DEC;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_XPNDR_DIGIT3_SELECT:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = ActionEvent.KEY_XPNDR_10_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = ActionEvent.KEY_XPNDR_10_DEC;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_XPNDR_DIGIT4_SELECT:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = ActionEvent.KEY_XPNDR_1_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = ActionEvent.KEY_XPNDR_1_DEC;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_BAROMETER_SELECT:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = ActionEvent.KEY_KOHLSMAN_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = ActionEvent.KEY_KOHLSMAN_DEC;
                            break;
                        case InputAction.SW:
                            actionEvent = ActionEvent.KEY_BAROMETRIC;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_ADF_DIGIT1_SELECT:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = ActionEvent.KEY_ADF_100_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = ActionEvent.KEY_ADF_100_DEC;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_ADF_DIGIT2_SELECT:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = ActionEvent.KEY_ADF_10_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = ActionEvent.KEY_ADF_10_DEC;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_ADF_DIGIT3_SELECT:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = ActionEvent.KEY_ADF_1_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = ActionEvent.KEY_ADF_1_DEC;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_ADF_CARD_SELECT:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = ActionEvent.KEY_ADF_CARD_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = ActionEvent.KEY_ADF_CARD_DEC;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_VOR1_SELECTED:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = ActionEvent.KEY_VOR1_OBI_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = ActionEvent.KEY_VOR1_OBI_DEC;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_VOR2_SELECTED:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = ActionEvent.KEY_VOR2_OBI_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = ActionEvent.KEY_VOR2_OBI_DEC;
                            break;
                    }
                    break;


                // G1000 NXi
                case ActionEvent.CUSTOM_PFD_MENU_PUSH:
                case ActionEvent.AS1000_PFD_DIRECTTO:
                case ActionEvent.AS1000_PFD_FPL_Push:
                case ActionEvent.AS1000_PFD_PROC_Push:
                case ActionEvent.AS1000_PFD_MENU_Push:
                case ActionEvent.AS1000_PFD_ENT_Push:
                case ActionEvent.AS1000_PFD_CLR:
                case ActionEvent.AS1000_PFD_SOFTKEYS_1:
                case ActionEvent.AS1000_PFD_SOFTKEYS_2:
                case ActionEvent.AS1000_PFD_SOFTKEYS_3:
                case ActionEvent.AS1000_PFD_SOFTKEYS_4:
                case ActionEvent.AS1000_PFD_SOFTKEYS_5:
                case ActionEvent.AS1000_PFD_SOFTKEYS_6:
                case ActionEvent.AS1000_PFD_SOFTKEYS_7:
                case ActionEvent.AS1000_PFD_SOFTKEYS_8:
                case ActionEvent.AS1000_PFD_SOFTKEYS_9:
                case ActionEvent.AS1000_PFD_SOFTKEYS_10:
                case ActionEvent.AS1000_PFD_SOFTKEYS_11:
                case ActionEvent.AS1000_PFD_SOFTKEYS_12:
                case ActionEvent.AS1000_MID_COM_1_Push:
                case ActionEvent.AS1000_MID_COM_2_Push:
                case ActionEvent.AS1000_MID_COM_Mic_1_Push:
                case ActionEvent.AS1000_MID_COM_Mic_2_Push:
                case ActionEvent.AS1000_MID_COM_Swap_1_2_Push:
                case ActionEvent.AS1000_MID_ADF_Push:
                case ActionEvent.AS1000_MID_DME_Push:
                case ActionEvent.AS1000_MID_NAV_1_Push:
                case ActionEvent.AS1000_MID_NAV_2_Push:
                case ActionEvent.AS1000_MID_AUX_Push:
                case ActionEvent.CUSTOM_PFD_FMS_SELECTED:
                    actionEventType = ActionEventType.Fsuipc;
                    switch (encoderName)
                    {
                        case InputName.Encoder1:
                        case InputName.Encoder2:
                            switch (encoderAction)
                            {
                                case InputAction.CW:
                                    actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.AS1000_PFD_FMS_Lower_INC : ActionEvent.AS1000_PFD_FMS_Upper_INC;
                                    break;
                                case InputAction.CCW:
                                    actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.AS1000_PFD_FMS_Lower_DEC : ActionEvent.AS1000_PFD_FMS_Upper_DEC;
                                    break;
                                case InputAction.SW:
                                    actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.AS1000_PFD_CLR : ActionEvent.AS1000_PFD_ENT_Push;
                                    break;
                            }
                            break;
                        case InputName.Joystick:
                            switch (encoderAction)
                            {
                                case InputAction.UP:
                                case InputAction.LEFT:
                                    actionEvent = ActionEvent.AS1000_PFD_FMS_Lower_DEC;
                                    break;
                                case InputAction.DOWN:
                                case InputAction.RIGHT:
                                    actionEvent = ActionEvent.AS1000_PFD_FMS_Lower_INC;
                                    break;
                            }
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_PFD_MAP_SELECTED:
                    actionEventType = ActionEventType.Fsuipc;
                    switch (encoderName)
                    {
                        case InputName.Encoder1:
                            switch (encoderAction)
                            {
                                case InputAction.CW:
                                    actionEvent = ActionEvent.AS1000_PFD_RANGE_INC;
                                    break;
                                case InputAction.CCW:
                                    actionEvent = ActionEvent.AS1000_PFD_RANGE_DEC;
                                    break;
                            }
                            break;
                        case InputName.Joystick:
                            switch (encoderAction)
                            {
                                case InputAction.UP:
                                    actionEvent = ActionEvent.AS1000_PFD_JOYSTICK_UP;
                                    break;
                                case InputAction.DOWN:
                                    actionEvent = ActionEvent.AS1000_PFD_JOYSTICK_DOWN;
                                    break;
                                case InputAction.LEFT:
                                    actionEvent = ActionEvent.AS1000_PFD_JOYSTICK_LEFT;
                                    break;
                                case InputAction.RIGHT:
                                    actionEvent = ActionEvent.AS1000_PFD_JOYSTICK_RIGHT;
                                    break;
                            }
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_MFD_MENU_PUSH:
                case ActionEvent.AS1000_MFD_DIRECTTO:
                case ActionEvent.AS1000_MFD_FPL_Push:
                case ActionEvent.AS1000_MFD_PROC_Push:
                case ActionEvent.AS1000_MFD_MENU_Push:
                case ActionEvent.AS1000_MFD_ENT_Push:
                case ActionEvent.AS1000_MFD_CLR:
                case ActionEvent.AS1000_MFD_SOFTKEYS_1:
                case ActionEvent.AS1000_MFD_SOFTKEYS_2:
                case ActionEvent.AS1000_MFD_SOFTKEYS_3:
                case ActionEvent.AS1000_MFD_SOFTKEYS_4:
                case ActionEvent.AS1000_MFD_SOFTKEYS_5:
                case ActionEvent.AS1000_MFD_SOFTKEYS_6:
                case ActionEvent.AS1000_MFD_SOFTKEYS_7:
                case ActionEvent.AS1000_MFD_SOFTKEYS_8:
                case ActionEvent.AS1000_MFD_SOFTKEYS_9:
                case ActionEvent.AS1000_MFD_SOFTKEYS_10:
                case ActionEvent.AS1000_MFD_SOFTKEYS_11:
                case ActionEvent.AS1000_MFD_SOFTKEYS_12:
                case ActionEvent.CUSTOM_MFD_FMS_SELECTED:
                    actionEventType = ActionEventType.Fsuipc;
                    switch (encoderName)
                    {
                        case InputName.Encoder1:
                        case InputName.Encoder2:
                            switch (encoderAction)
                            {
                                case InputAction.CW:
                                    actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.AS1000_MFD_FMS_Lower_INC : ActionEvent.AS1000_MFD_FMS_Upper_INC;
                                    break;
                                case InputAction.CCW:
                                    actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.AS1000_MFD_FMS_Lower_DEC : ActionEvent.AS1000_MFD_FMS_Upper_DEC;
                                    break;
                                case InputAction.SW:
                                    actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.AS1000_MFD_CLR : ActionEvent.AS1000_MFD_ENT_Push;
                                    break;
                            }
                            break;
                        case InputName.Joystick:
                            switch (encoderAction)
                            {
                                case InputAction.UP:
                                case InputAction.LEFT:
                                    actionEvent = ActionEvent.AS1000_MFD_FMS_Lower_DEC;
                                    break;
                                case InputAction.DOWN:
                                case InputAction.RIGHT:
                                    actionEvent = ActionEvent.AS1000_MFD_FMS_Lower_INC;
                                    break;
                            }
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_MFD_MAP_SELECTED:
                    actionEventType = ActionEventType.Fsuipc;
                    switch (encoderName)
                    {
                        case InputName.Encoder1:
                            switch (encoderAction)
                            {
                                case InputAction.CW:
                                    actionEvent = ActionEvent.AS1000_MFD_RANGE_INC;
                                    break;
                                case InputAction.CCW:
                                    actionEvent = ActionEvent.AS1000_MFD_RANGE_DEC;
                                    break;
                            }
                            break;
                        case InputName.Joystick:
                            switch (encoderAction)
                            {
                                case InputAction.UP:
                                    actionEvent = ActionEvent.AS1000_MFD_JOYSTICK_UP;
                                    break;
                                case InputAction.DOWN:
                                    actionEvent = ActionEvent.AS1000_MFD_JOYSTICK_DOWN;
                                    break;
                                case InputAction.LEFT:
                                    actionEvent = ActionEvent.AS1000_MFD_JOYSTICK_LEFT;
                                    break;
                                case InputAction.RIGHT:
                                    actionEvent = ActionEvent.AS1000_MFD_JOYSTICK_RIGHT;
                                    break;
                            }
                            acceleration = 2;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_PFD_VOL1_KNOB_PUSH:
                    break;
                case ActionEvent.CUSTOM_PFD_VOL2_KNOB_PUSH:
                    break;
                case ActionEvent.CUSTOM_PFD_NAV_KNOB_PUSH:
                case ActionEvent.CUSTOM_MFD_NAV_KNOB_PUSH:
                    actionEventType = ActionEventType.Fsuipc;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.AS1000_PFD_NAV_Large_INC : ActionEvent.AS1000_PFD_NAV_Small_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.AS1000_PFD_NAV_Large_DEC : ActionEvent.AS1000_PFD_NAV_Small_DEC;
                            break;
                        case InputAction.SW:
                            actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.AS1000_PFD_NAV_Push : ActionEvent.AS1000_PFD_NAV_Switch;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_PFD_COM_KNOB_PUSH:
                case ActionEvent.CUSTOM_MFD_COM_KNOB_PUSH:
                    actionEventType = ActionEventType.Fsuipc;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.AS1000_PFD_COM_Large_INC : ActionEvent.AS1000_PFD_COM_Small_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.AS1000_PFD_COM_Large_DEC : ActionEvent.AS1000_PFD_COM_Small_DEC;
                            break;
                        case InputAction.SW:
                            actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.AS1000_PFD_COM_Push : ActionEvent.AS1000_PFD_COM_Switch;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_PFD_CRS_KNOB_PUSH:
                case ActionEvent.CUSTOM_MFD_CRS_KNOB_PUSH:
                    actionEventType = ActionEventType.Fsuipc;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.AS1000_PFD_CRS_INC : ActionEvent.AS1000_PFD_BARO_INC;
                            break;
                        case InputAction.CCW:
                            actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.AS1000_PFD_CRS_DEC : ActionEvent.AS1000_PFD_BARO_DEC;
                            break;
                    }
                    break;
                case ActionEvent.CUSTOM_PFD_HEADING_KNOB_PUSH:
                case ActionEvent.CUSTOM_MFD_HEADING_KNOB_PUSH:
                    actionEventType = ActionEventType.SimConnect;
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.KEY_HEADING_BUG_INC : ActionEvent.KEY_HEADING_BUG_SET;
                            acceleration = 1;
                            if (encoderName == InputName.Encoder2)
                            {
                                var heading = (simConnector.SimData.AUTOPILOT_HEADING_LOCK_DIR + 10) % 360;
                                commandData = Convert.ToUInt32(heading);
                            }
                            break;
                        case InputAction.CCW:
                            actionEvent = encoderName == InputName.Encoder1 ? ActionEvent.KEY_HEADING_BUG_DEC : ActionEvent.KEY_HEADING_BUG_SET;
                            acceleration = 1;
                            if (encoderName == InputName.Encoder2)
                            {
                                var heading = simConnector.SimData.AUTOPILOT_HEADING_LOCK_DIR - 10;
                                if (heading < 0) heading = 360 + heading;
                                commandData = Convert.ToUInt32(heading);
                            }
                            break;
                        case InputAction.SW:
                            actionEvent = ActionEvent.KEY_HEADING_BUG_SET;
                            commandData = Convert.ToUInt32(simConnector.SimData.PLANE_HEADING_DEGREES_MAGNETIC);
                            break;
                    }
                    break;
            }

            if (actionEvent != ActionEvent.NO_ACTION)
            {
                switch (actionEventType)
                {
                    case ActionEventType.SimConnect:
                        simConnector.TransmitActionEvent(actionEvent, commandData, acceleration > 3 ? 3 : acceleration);
                        break;
                    case ActionEventType.Fsuipc:
                        ActionLogicFsuipc.ExecuteCalculatorCodeHVar(fsuipcProvider, actionEvent, acceleration);
                        break;
                }
            }
        }
    }
}
