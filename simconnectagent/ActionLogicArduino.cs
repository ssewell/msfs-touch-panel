using MSFSTouchPanel.ArduinoAgent;
using MSFSTouchPanel.FSConnector;
using MSFSTouchPanel.FsuipcAgent;
using System;

namespace MSFSTouchPanel.SimConnectAgent
{
    public class ActionLogicArduino
    {
        public static void ExecuteCommand(SimConnector simConnector, FsuipcProvider fsuipcProvider, ActionEvent clientAction, InputAction encoderAction, InputName encoderName, int accelerationOverride)
        {
            ActionParam actionParam = null;

            switch (clientAction)
            {
                case ActionEvent.CUSTOM_NAV1_SELECT:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.KEY_NAV1_RADIO_WHOLE_INC,
                            Encoder1CCW = ActionEvent.KEY_NAV1_RADIO_WHOLE_DEC,
                            Encoder1Switch = ActionEvent.KEY_NAV1_RADIO_SWAP,
                            Encoder2CW = ActionEvent.KEY_NAV1_RADIO_FRACT_INC,
                            Encoder2CCW = ActionEvent.KEY_NAV1_RADIO_FRACT_DEC,
                            Encoder2Switch = ActionEvent.KEY_NAV1_RADIO_SWAP
                        });
                    break;
                case ActionEvent.CUSTOM_NAV2_SELECT:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.KEY_NAV2_RADIO_WHOLE_INC,
                            Encoder1CCW = ActionEvent.KEY_NAV2_RADIO_WHOLE_DEC,
                            Encoder1Switch = ActionEvent.KEY_NAV2_RADIO_SWAP,
                            Encoder2CW = ActionEvent.KEY_NAV2_RADIO_FRACT_INC,
                            Encoder2CCW = ActionEvent.KEY_NAV2_RADIO_FRACT_DEC,
                            Encoder2Switch = ActionEvent.KEY_NAV2_RADIO_SWAP
                        });
                    break;
                case ActionEvent.CUSTOM_COM1_SELECT:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.KEY_COM_RADIO_WHOLE_INC,
                            Encoder1CCW = ActionEvent.KEY_COM_RADIO_WHOLE_DEC,
                            Encoder1Switch = ActionEvent.KEY_COM_STBY_RADIO_SWAP,
                            Encoder2CW = ActionEvent.KEY_COM_RADIO_FRACT_INC,
                            Encoder2CCW = ActionEvent.KEY_COM_RADIO_FRACT_DEC,
                            Encoder2Switch = ActionEvent.KEY_COM_STBY_RADIO_SWAP
                        });
                    break;
                case ActionEvent.CUSTOM_COM2_SELECT:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.KEY_COM2_RADIO_WHOLE_INC,
                            Encoder1CCW = ActionEvent.KEY_COM2_RADIO_WHOLE_DEC,
                            Encoder1Switch = ActionEvent.KEY_COM2_RADIO_SWAP,
                            Encoder2CW = ActionEvent.KEY_COM2_RADIO_FRACT_INC,
                            Encoder2CCW = ActionEvent.KEY_COM2_RADIO_FRACT_DEC,
                            Encoder2Switch = ActionEvent.KEY_COM2_RADIO_SWAP
                        });
                    break;
                case ActionEvent.CUSTOM_ALTITUDE_BUG_SELECT:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.KEY_AP_ALT_VAR_INC,
                            Encoder1CCW = ActionEvent.KEY_AP_ALT_VAR_DEC,
                            Encoder1Switch = ActionEvent.KEY_AP_ALT_VAR_SET_ENGLISH,
                            Encoder2CW = ActionEvent.KEY_AP_ALT_VAR_INC,
                            Encoder2CCW = ActionEvent.KEY_AP_ALT_VAR_DEC,
                            Encoder2Switch = ActionEvent.KEY_AP_ALT_VAR_SET_ENGLISH
                        },
                        new ActionDataForEncoder()
                        {
                            Encoder1CW = 1000,
                            Encoder1CCW = 1000,
                            Encoder1Switch = Convert.ToInt32(simConnector.SimData.PLANE_ALTITUDE),
                            Encoder2CW = 100,
                            Encoder2CCW = 100,
                            Encoder2Switch = Convert.ToInt32(simConnector.SimData.PLANE_ALTITUDE)
                        });
                    break;
                case ActionEvent.CUSTOM_HEADING_BUG_SELECT:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.KEY_HEADING_BUG_INC,
                            Encoder1CCW = ActionEvent.KEY_HEADING_BUG_DEC,
                            Encoder1Switch = ActionEvent.KEY_HEADING_BUG_SET,
                            Encoder2CW = ActionEvent.KEY_HEADING_BUG_INC,
                            Encoder2CCW = ActionEvent.KEY_HEADING_BUG_DEC,
                            Encoder2Switch = ActionEvent.KEY_HEADING_BUG_SET
                        },
                        new ActionDataForEncoder()
                        {
                            Encoder1Switch = Convert.ToInt32(simConnector.SimData.PLANE_HEADING_DEGREES_MAGNETIC),
                            Encoder2Switch = Convert.ToInt32(simConnector.SimData.PLANE_HEADING_DEGREES_MAGNETIC)
                        });
                    break;
                case ActionEvent.CUSTOM_VSI_BUG_SELECT:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.KEY_AP_VS_VAR_INC,
                            Encoder1CCW = ActionEvent.KEY_AP_VS_VAR_DEC,
                            Encoder2CW = ActionEvent.KEY_AP_VS_VAR_INC,
                            Encoder2CCW = ActionEvent.KEY_AP_VS_VAR_DEC,
                        });
                    break;
                case ActionEvent.CUSTOM_AIRSPEED_BUG_SELECT:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.KEY_AP_SPD_VAR_INC,
                            Encoder1CCW = ActionEvent.KEY_AP_SPD_VAR_DEC,
                            Encoder1Switch = ActionEvent.KEY_AP_SPD_VAR_SET,
                            Encoder2CW = ActionEvent.KEY_AP_SPD_VAR_INC,
                            Encoder2CCW = ActionEvent.KEY_AP_SPD_VAR_DEC,
                            Encoder2Switch = ActionEvent.KEY_AP_SPD_VAR_SET,
                        },
                        new ActionDataForEncoder()
                        {
                            Encoder1Switch = Convert.ToInt32(simConnector.SimData.AIRSPEED_INDICATED),
                            Encoder2Switch = Convert.ToInt32(simConnector.SimData.AIRSPEED_INDICATED)
                        });
                    break;
                case ActionEvent.CUSTOM_XPNDR_DIGIT1_SELECT:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.KEY_XPNDR_1000_INC,
                            Encoder1CCW = ActionEvent.KEY_XPNDR_1000_DEC,
                            Encoder2CW = ActionEvent.KEY_XPNDR_1000_INC,
                            Encoder2CCW = ActionEvent.KEY_XPNDR_1000_DEC,
                        });
                    break;
                case ActionEvent.CUSTOM_XPNDR_DIGIT2_SELECT:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.KEY_XPNDR_100_INC,
                            Encoder1CCW = ActionEvent.KEY_XPNDR_100_DEC,
                            Encoder2CW = ActionEvent.KEY_XPNDR_100_INC,
                            Encoder2CCW = ActionEvent.KEY_XPNDR_100_DEC,
                        });
                    break;
                case ActionEvent.CUSTOM_XPNDR_DIGIT3_SELECT:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.KEY_XPNDR_10_INC,
                            Encoder1CCW = ActionEvent.KEY_XPNDR_10_DEC,
                            Encoder2CW = ActionEvent.KEY_XPNDR_10_INC,
                            Encoder2CCW = ActionEvent.KEY_XPNDR_10_DEC,
                        });
                    break;
                case ActionEvent.CUSTOM_XPNDR_DIGIT4_SELECT:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.KEY_XPNDR_1_INC,
                            Encoder1CCW = ActionEvent.KEY_XPNDR_1_DEC,
                            Encoder2CW = ActionEvent.KEY_XPNDR_1_INC,
                            Encoder2CCW = ActionEvent.KEY_XPNDR_1_DEC,
                        });
                    break;
                case ActionEvent.CUSTOM_BAROMETER_SELECT:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                       new ActionForEncoder()
                       {
                           Encoder1CW = ActionEvent.KEY_KOHLSMAN_INC,
                           Encoder1CCW = ActionEvent.KEY_KOHLSMAN_DEC,
                           Encoder2CW = ActionEvent.KEY_KOHLSMAN_INC,
                           Encoder2CCW = ActionEvent.KEY_KOHLSMAN_DEC,
                       });
                    break;
                case ActionEvent.CUSTOM_ADF_DIGIT1_SELECT:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                       new ActionForEncoder()
                       {
                           Encoder1CW = ActionEvent.KEY_ADF_100_INC,
                           Encoder1CCW = ActionEvent.KEY_ADF_100_DEC,
                           Encoder2CW = ActionEvent.KEY_ADF_100_INC,
                           Encoder2CCW = ActionEvent.KEY_ADF_100_DEC,
                       });
                    break;
                case ActionEvent.CUSTOM_ADF_DIGIT2_SELECT:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                       new ActionForEncoder()
                       {
                           Encoder1CW = ActionEvent.KEY_ADF_10_INC,
                           Encoder1CCW = ActionEvent.KEY_ADF_10_DEC,
                           Encoder2CW = ActionEvent.KEY_ADF_10_INC,
                           Encoder2CCW = ActionEvent.KEY_ADF_10_DEC,
                       });
                    break;
                case ActionEvent.CUSTOM_ADF_DIGIT3_SELECT:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                       new ActionForEncoder()
                       {
                           Encoder1CW = ActionEvent.KEY_ADF_1_INC,
                           Encoder1CCW = ActionEvent.KEY_ADF_1_DEC,
                           Encoder2CW = ActionEvent.KEY_ADF_1_INC,
                           Encoder2CCW = ActionEvent.KEY_ADF_1_DEC,
                       });
                    break;
                case ActionEvent.CUSTOM_ADF_CARD_SELECT:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                       new ActionForEncoder()
                       {
                           Encoder1CW = ActionEvent.KEY_ADF_CARD_INC,
                           Encoder1CCW = ActionEvent.KEY_ADF_CARD_DEC,
                           Encoder2CW = ActionEvent.KEY_ADF_CARD_INC,
                           Encoder2CCW = ActionEvent.KEY_ADF_CARD_DEC,
                       });
                    break;
                case ActionEvent.CUSTOM_VOR1_SELECTED:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                       new ActionForEncoder()
                       {
                           Encoder1CW = ActionEvent.KEY_VOR1_OBI_INC,
                           Encoder1CCW = ActionEvent.KEY_VOR1_OBI_DEC,
                           Encoder2CW = ActionEvent.KEY_VOR1_OBI_INC,
                           Encoder2CCW = ActionEvent.KEY_VOR1_OBI_DEC,
                       });
                    break;
                case ActionEvent.CUSTOM_VOR2_SELECTED:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                       new ActionForEncoder()
                       {
                           Encoder1CW = ActionEvent.KEY_VOR2_OBI_INC,
                           Encoder1CCW = ActionEvent.KEY_VOR2_OBI_DEC,
                           Encoder2CW = ActionEvent.KEY_VOR2_OBI_INC,
                           Encoder2CCW = ActionEvent.KEY_VOR2_OBI_DEC,
                       });
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
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.Fsuipc,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.AS1000_PFD_FMS_Lower_INC,
                            Encoder1CCW = ActionEvent.AS1000_PFD_FMS_Lower_DEC,
                            Encoder1Switch = ActionEvent.AS1000_PFD_FMS_Upper_PUSH,
                            Encoder2CW = ActionEvent.AS1000_PFD_FMS_Upper_INC,
                            Encoder2CCW = ActionEvent.AS1000_PFD_FMS_Upper_DEC,
                            Encoder2Switch = ActionEvent.AS1000_PFD_FMS_Upper_PUSH
                        });
                    break;
                case ActionEvent.CUSTOM_PFD_MAP_SELECTED:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.Fsuipc,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.AS1000_PFD_RANGE_INC,
                            Encoder1CCW = ActionEvent.AS1000_PFD_RANGE_DEC,
                            Encoder2CW = ActionEvent.AS1000_PFD_RANGE_INC,
                            Encoder2CCW = ActionEvent.AS1000_PFD_RANGE_DEC,
                            Joystick1Up = ActionEvent.AS1000_PFD_JOYSTICK_UP,
                            Joystick1Down = ActionEvent.AS1000_PFD_JOYSTICK_DOWN,
                            Joystick1Left = ActionEvent.AS1000_PFD_JOYSTICK_LEFT,
                            Joystick1Right = ActionEvent.AS1000_PFD_JOYSTICK_RIGHT,
                            Joystick1Switch = ActionEvent.AS1000_PFD_JOYSTICK_PUSH
                        });
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
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.Fsuipc,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.AS1000_MFD_FMS_Lower_INC,
                            Encoder1CCW = ActionEvent.AS1000_MFD_FMS_Lower_DEC,
                            Encoder1Switch = ActionEvent.AS1000_MFD_FMS_Upper_PUSH,
                            Encoder2CW = ActionEvent.AS1000_MFD_FMS_Upper_INC,
                            Encoder2CCW = ActionEvent.AS1000_MFD_FMS_Upper_DEC,
                            Encoder2Switch = ActionEvent.AS1000_MFD_FMS_Upper_PUSH
                        });
                    break;
                case ActionEvent.CUSTOM_MFD_MAP_SELECTED:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.Fsuipc,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.AS1000_MFD_RANGE_INC,
                            Encoder1CCW = ActionEvent.AS1000_MFD_RANGE_DEC,
                            Encoder2CW = ActionEvent.AS1000_MFD_RANGE_INC,
                            Encoder2CCW = ActionEvent.AS1000_MFD_RANGE_DEC,
                            Joystick1Up = ActionEvent.AS1000_MFD_JOYSTICK_UP,
                            Joystick1Down = ActionEvent.AS1000_MFD_JOYSTICK_DOWN,
                            Joystick1Left = ActionEvent.AS1000_MFD_JOYSTICK_LEFT,
                            Joystick1Right = ActionEvent.AS1000_MFD_JOYSTICK_RIGHT,
                            Joystick1Switch = ActionEvent.AS1000_MFD_JOYSTICK_PUSH
                        });
                    break;
                case ActionEvent.CUSTOM_PFD_NAV_KNOB_PUSH:
                case ActionEvent.CUSTOM_MFD_NAV_KNOB_PUSH:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.Fsuipc,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.AS1000_PFD_NAV_Large_INC,
                            Encoder1CCW = ActionEvent.AS1000_PFD_NAV_Large_DEC,
                            Encoder1Switch = ActionEvent.AS1000_PFD_NAV_Push,
                            Encoder2CW = ActionEvent.AS1000_PFD_NAV_Small_INC,
                            Encoder2CCW = ActionEvent.AS1000_PFD_NAV_Small_DEC,
                            Encoder2Switch = ActionEvent.AS1000_PFD_NAV_Switch
                        });
                    break;
                case ActionEvent.CUSTOM_PFD_COM_KNOB_PUSH:
                case ActionEvent.CUSTOM_MFD_COM_KNOB_PUSH:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.Fsuipc,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.AS1000_PFD_COM_Large_INC,
                            Encoder1CCW = ActionEvent.AS1000_PFD_COM_Large_DEC,
                            Encoder1Switch = ActionEvent.AS1000_PFD_COM_Push,
                            Encoder2CW = ActionEvent.AS1000_PFD_COM_Small_INC,
                            Encoder2CCW = ActionEvent.AS1000_PFD_COM_Small_DEC,
                            Encoder2Switch = ActionEvent.AS1000_PFD_COM_Switch
                        });
                    break;
                case ActionEvent.CUSTOM_PFD_CRS_KNOB_PUSH:
                case ActionEvent.CUSTOM_MFD_CRS_KNOB_PUSH:
                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.Fsuipc,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.AS1000_PFD_CRS_INC,
                            Encoder1CCW = ActionEvent.AS1000_PFD_CRS_DEC,
                            Encoder1Switch = ActionEvent.AS1000_PFD_CRS_PUSH,
                            Encoder2CW = ActionEvent.AS1000_PFD_BARO_INC,
                            Encoder2CCW = ActionEvent.AS1000_PFD_BARO_DEC,
                            Encoder2Switch = ActionEvent.AS1000_PFD_CRS_PUSH
                        });
                    break;
                case ActionEvent.CUSTOM_PFD_HEADING_KNOB_PUSH:
                case ActionEvent.CUSTOM_MFD_HEADING_KNOB_PUSH:
                    var increaseHeadingData = (simConnector.SimData.AUTOPILOT_HEADING_LOCK_DIR + 10) % 360;
                    var decreaseHeadingData = simConnector.SimData.AUTOPILOT_HEADING_LOCK_DIR - 10;
                    if (decreaseHeadingData < 0) decreaseHeadingData = 360 + decreaseHeadingData;

                    actionParam = GetEncoderAction(encoderName, encoderAction, ActionEventType.SimConnect,
                        new ActionForEncoder()
                        {
                            Encoder1CW = ActionEvent.KEY_HEADING_BUG_INC,
                            Encoder1CCW = ActionEvent.KEY_HEADING_BUG_DEC,
                            Encoder1Switch = ActionEvent.KEY_HEADING_BUG_SET,
                            Encoder2CW = ActionEvent.KEY_HEADING_BUG_SET,
                            Encoder2CCW = ActionEvent.KEY_HEADING_BUG_SET,
                            Encoder2Switch = ActionEvent.KEY_HEADING_BUG_SET
                        },
                        new ActionDataForEncoder()
                        {
                            Encoder1Switch = Convert.ToInt32(simConnector.SimData.PLANE_HEADING_DEGREES_MAGNETIC),
                            Encoder2CW = Convert.ToInt32(increaseHeadingData),
                            Encoder2CCW = Convert.ToInt32(decreaseHeadingData),
                            Encoder2Switch = Convert.ToInt32(simConnector.SimData.PLANE_HEADING_DEGREES_MAGNETIC)
                        });

                    if(actionParam != null)
                        actionParam.Acceleration = 1;

                    break;
                case ActionEvent.CUSTOM_PFD_VOL1_KNOB_PUSH:
                case ActionEvent.CUSTOM_PFD_VOL2_KNOB_PUSH:
                    break;
            }


            actionParam.Acceleration = accelerationOverride;
            RunAction(simConnector, fsuipcProvider, actionParam);
        }

        private static void RunAction(SimConnector simConnector, FsuipcProvider fsuipcProvider, ActionParam actionParam)
        {
            if (actionParam != null && actionParam.ActionEvent != ActionEvent.NO_ACTION)
            {
                switch (actionParam.ActionEventType)
                {
                    case ActionEventType.SimConnect:
                        simConnector.TransmitActionEvent(actionParam.ActionEvent, actionParam.CommandData, actionParam.Acceleration);
                        break;
                    case ActionEventType.Fsuipc:
                        ActionLogicFsuipc.ExecuteCalculatorCodeHVar(fsuipcProvider, actionParam.ActionEvent, actionParam.Acceleration);
                        break;
                }
            }
        }

        private static ActionParam GetEncoderAction(InputName encoderName, InputAction encoderAction, ActionEventType actionEventType, ActionForEncoder actionForEncoder, ActionDataForEncoder actionDataForEncoder = null)
        {
            var actionParam = new ActionParam() { ActionEventType = actionEventType };

            switch (encoderName)
            {
                case InputName.Encoder1:
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionParam.ActionEvent = actionForEncoder.Encoder1CW;
                            actionParam.CommandData = actionDataForEncoder == null ? 1 : Convert.ToUInt32(actionDataForEncoder.Encoder1CW);
                            break;
                        case InputAction.CCW:
                            actionParam.ActionEvent = actionForEncoder.Encoder1CCW;
                            actionParam.CommandData = actionDataForEncoder == null ? 1 : Convert.ToUInt32(actionDataForEncoder.Encoder1CCW);
                            break;
                        case InputAction.SW:
                            actionParam.ActionEvent = actionForEncoder.Encoder1Switch;
                            actionParam.CommandData = actionDataForEncoder == null ? 1 : Convert.ToUInt32(actionDataForEncoder.Encoder1Switch);
                            break;
                    }
                    break;
                case InputName.Encoder2:
                    switch (encoderAction)
                    {
                        case InputAction.CW:
                            actionParam.ActionEvent = actionForEncoder.Encoder2CW;
                            actionParam.CommandData = actionDataForEncoder == null ? 1 : Convert.ToUInt32(actionDataForEncoder.Encoder2CW);
                            break;
                        case InputAction.CCW:
                            actionParam.ActionEvent = actionForEncoder.Encoder2CCW;
                            actionParam.CommandData = actionDataForEncoder == null ? 1 : Convert.ToUInt32(actionDataForEncoder.Encoder2CCW);
                            break;
                        case InputAction.SW:
                            actionParam.ActionEvent = actionForEncoder.Encoder2Switch;
                            actionParam.CommandData = actionDataForEncoder == null ? 1 : Convert.ToUInt32(actionDataForEncoder.Encoder2Switch);
                            break;
                    }
                    break;
                case InputName.Joystick:
                    switch (encoderAction)
                    {
                        case InputAction.UP:
                            actionParam.ActionEvent = actionForEncoder.Joystick1Up;
                            actionParam.CommandData = actionDataForEncoder == null ? 1 : Convert.ToUInt32(actionDataForEncoder.Joystick1Up);
                            break;
                        case InputAction.DOWN:
                            actionParam.ActionEvent = actionForEncoder.Joystick1Down;
                            actionParam.CommandData = actionDataForEncoder == null ? 1 : Convert.ToUInt32(actionDataForEncoder.Joystick1Down);
                            break;
                        case InputAction.LEFT:
                            actionParam.ActionEvent = actionForEncoder.Joystick1Left;
                            actionParam.CommandData = actionDataForEncoder == null ? 1 : Convert.ToUInt32(actionDataForEncoder.Joystick1Left);
                            break;
                        case InputAction.RIGHT:
                            actionParam.ActionEvent = actionForEncoder.Joystick1Right;
                            actionParam.CommandData = actionDataForEncoder == null ? 1 : Convert.ToUInt32(actionDataForEncoder.Joystick1Right);
                            break;
                    }
                    break;
            }

            return actionParam;
        }
    }

    public class ActionParam
    {
        public ActionParam()
        {
            ActionEvent = ActionEvent.NO_ACTION;
            CommandData = 1;
            Acceleration = 1;
        }

        public ActionEventType ActionEventType { get; set; }

        public ActionEvent ActionEvent { get; set; }

        public UInt32 CommandData { get; set; }

        public int Acceleration { get; set; }
    }

    public class ActionForEncoder
    {
        public ActionForEncoder()
        {
            Encoder1CW = ActionEvent.NO_ACTION;
            Encoder1CCW = ActionEvent.NO_ACTION;
            Encoder1Switch = ActionEvent.NO_ACTION;
            Encoder2CW = ActionEvent.NO_ACTION;
            Encoder2CCW = ActionEvent.NO_ACTION;
            Encoder2Switch = ActionEvent.NO_ACTION;
            Joystick1Up = ActionEvent.NO_ACTION;
            Joystick1Down = ActionEvent.NO_ACTION;
            Joystick1Left = ActionEvent.NO_ACTION;
            Joystick1Right = ActionEvent.NO_ACTION;
            Joystick1Switch = ActionEvent.NO_ACTION;
        }

        public ActionEvent Encoder1CW { get; set; }
        public ActionEvent Encoder1CCW { get; set; }
        public ActionEvent Encoder1Switch { get; set; }
        public ActionEvent Encoder2CW { get; set; }
        public ActionEvent Encoder2CCW { get; set; }
        public ActionEvent Encoder2Switch { get; set; }
        public ActionEvent Joystick1Up { get; set; }
        public ActionEvent Joystick1Down { get; set; }
        public ActionEvent Joystick1Left { get; set; }
        public ActionEvent Joystick1Right { get; set; }
        public ActionEvent Joystick1Switch { get; set; }
    }

    public class ActionDataForEncoder
    {
        public ActionDataForEncoder()
        {
            Encoder1CW = 1;
            Encoder1CCW = 1;
            Encoder1Switch = 1;
            Encoder2CW = 1;
            Encoder2CCW = 1;
            Encoder2Switch = 1;
            Joystick1Up = 1;
            Joystick1Down = 1;
            Joystick1Left = 1;
            Joystick1Right = 1;
            Joystick1Switch = 1;
        }

        public int Encoder1CW { get; set; }
        public int Encoder1CCW { get; set; }
        public int Encoder1Switch { get; set; }
        public int Encoder2CW { get; set; }
        public int Encoder2CCW { get; set; }
        public int Encoder2Switch { get; set; }
        public int Joystick1Up { get; set; }
        public int Joystick1Down { get; set; }
        public int Joystick1Left { get; set; }
        public int Joystick1Right { get; set; }
        public int Joystick1Switch { get; set; }
    }
}
