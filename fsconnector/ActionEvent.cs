﻿namespace MSFSTouchPanel.FSConnector
{
    public enum ActionEvent
    {
        KEY_SELECT_1,
        KEY_SELECT_2,
        KEY_SELECT_3,
        KEY_SELECT_4,

        KEY_TOGGLE_MASTER_BATTERY,
        KEY_TOGGLE_MASTER_ALTERNATOR,
        KEY_AVIONICS_MASTER_SET,
        KEY_TOGGLE_ELECT_FUEL_PUMP,
        KEY_ANTI_ICE_SET,
        KEY_PITOT_HEAT_TOGGLE,

        KEY_PANEL_LIGHTS_TOGGLE,
        KEY_TOGGLE_TAXI_LIGHTS,
        KEY_LANDING_LIGHTS_TOGGLE,
        KEY_TOGGLE_BEACON_LIGHTS,
        KEY_TOGGLE_NAV_LIGHTS,
        KEY_STROBES_TOGGLE,

        CUSTOM_XPNDR_DIGIT1_SELECT,
        CUSTOM_XPNDR_DIGIT2_SELECT,
        CUSTOM_XPNDR_DIGIT3_SELECT,
        CUSTOM_XPNDR_DIGIT4_SELECT,
        KEY_XPNDR_SET,

        KEY_AP_MASTER,
        KEY_TOGGLE_FLIGHT_DIRECTOR,
        KEY_AP_APR_HOLD,
        KEY_AP_NAV1_HOLD,
        KEY_YAW_DAMPER_TOGGLE,
        KEY_AP_WING_LEVELER, 
        KEY_AUTO_THROTTLE_ARM,
        KEY_AP_BC_HOLD,

        CUSTOM_ALTITUDE_BUG_SELECT,
        KEY_AP_ALT_VAR_INC,
        KEY_AP_ALT_VAR_DEC,
        KEY_AP_ALT_VAR_SET_ENGLISH,
        KEY_AP_PANEL_ALTITUDE_HOLD,
        KEY_AP_ALT_SYNC,

        CUSTOM_HEADING_BUG_SELECT,
        KEY_HEADING_BUG_INC,
        KEY_HEADING_BUG_DEC,
        KEY_HEADING_BUG_SET,
        KEY_AP_PANEL_HEADING_HOLD,
        KEY_HEADING_BUG_SYNC,

        CUSTOM_VSI_BUG_SELECT,
        KEY_AP_VS_HOLD,
        KEY_AP_VS_VAR_INC,
        KEY_AP_VS_VAR_DEC,
        KEY_AP_VS_VAR_SET_ENGLISH,

        CUSTOM_AIRSPEED_BUG_SELECT,
        KEY_FLIGHT_LEVEL_CHANGE,
        KEY_AP_SPD_VAR_INC,
        KEY_AP_SPD_VAR_DEC,
        KEY_AP_SPD_VAR_SET,

        KEY_TOGGLE_GPS_DRIVES_NAV1,
        KEY_AP_NAV_SELECT_SET,

        CUSTOM_BAROMETER_SELECT,
        KEY_KOHLSMAN_INC,
        KEY_KOHLSMAN_DEC,
        KEY_KOHLSMAN_SET,
        KEY_BAROMETRIC,

        CUSTOM_NAV1_SELECT,
        CUSTOM_NAV2_SELECT,
        KEY_NAV1_RADIO_WHOLE_INC,
        KEY_NAV1_RADIO_WHOLE_DEC,
        KEY_NAV1_RADIO_FRACT_INC,
        KEY_NAV1_RADIO_FRACT_DEC,
        KEY_NAV1_RADIO_SWAP,
        KEY_NAV1_STBY_SET,
        KEY_NAV2_RADIO_WHOLE_INC,
        KEY_NAV2_RADIO_WHOLE_DEC,
        KEY_NAV2_RADIO_FRACT_INC,
        KEY_NAV2_RADIO_FRACT_DEC,
        KEY_NAV2_RADIO_SWAP,
        KEY_NAV2_STBY_SET,
        KEY_NAV_RADIO,

        CUSTOM_ADF_DIGIT1_SELECT,
        CUSTOM_ADF_DIGIT2_SELECT,
        CUSTOM_ADF_DIGIT3_SELECT,
        CUSTOM_ADF_CARD_SELECT,
        KEY_ADF_100_INC,
        KEY_ADF_10_INC,
        KEY_ADF_1_INC,
        KEY_ADF_100_DEC,
        KEY_ADF_10_DEC,
        KEY_ADF_1_DEC,
        KEY_ADF_COMPLETE_SET,
        KEY_ADF_CARD_SET,
        KEY_ADF_CARD_INC,
        KEY_ADF_CARD_DEC,
        KEY_ADF1_RADIO_SWAP,

        CUSTOM_VOR1_SELECTED,
        CUSTOM_VOR2_SELECTED,
        KEY_VOR1_SET,
        KEY_VOR2_SET,
        KEY_VOR1_OBI_INC,
        KEY_VOR1_OBI_DEC,
        KEY_VOR2_OBI_INC,
        KEY_VOR2_OBI_DEC,
        KEY_DME1_TOGGLE,
        KEY_DME2_TOGGLE,

        CUSTOM_COM1_SELECT,
        CUSTOM_COM2_SELECT,
        KEY_COM1_TRANSMIT_SELECT,
        KEY_COM2_TRANSMIT_SELECT,
        KEY_COM_RADIO_WHOLE_INC,
        KEY_COM_RADIO_WHOLE_DEC,
        KEY_COM_RADIO_FRACT_INC,
        KEY_COM_RADIO_FRACT_DEC,
        KEY_COM_STBY_RADIO_SWAP,
        KEY_COM_STBY_RADIO_SET,
        KEY_COM2_RADIO_WHOLE_INC,
        KEY_COM2_RADIO_WHOLE_DEC,
        KEY_COM2_RADIO_FRACT_INC,
        KEY_COM2_RADIO_FRACT_DEC,
        KEY_COM2_RADIO_SWAP,
        KEY_COM2_STBY_RADIO_SET,

        KEY_XPNDR_1000_INC,
        KEY_XPNDR_100_INC,
        KEY_XPNDR_10_INC,
        KEY_XPNDR_1_INC,
        KEY_XPNDR_1000_DEC,
        KEY_XPNDR_100_DEC,
        KEY_XPNDR_10_DEC,
        KEY_XPNDR_1_DEC,

        KEY_ATC_MENU_1,
        KEY_ATC_MENU_2,
        KEY_ATC_MENU_3,
        KEY_ATC_MENU_4,
        KEY_ATC_MENU_5,
        KEY_ATC_MENU_6,
        KEY_ATC_MENU_7,
        KEY_ATC_MENU_8,
        KEY_ATC_MENU_9,
        KEY_ATC_MENU_0,

        KEY_SIM_RATE_INCR,
        KEY_SIM_RATE_DECR,

        NO_ACTION,

        // G1000 NXi
        CUSTOM_PFD_MAP_SELECTED,
        CUSTOM_MFD_MAP_SELECTED,
        CUSTOM_PFD_FMS_SELECTED,
        CUSTOM_MFD_FMS_SELECTED,

        CUSTOM_PFD_MENU_PUSH,
        CUSTOM_MFD_MENU_PUSH,

        CUSTOM_PFD_VOL1_KNOB_PUSH,
        CUSTOM_PFD_NAV_KNOB_PUSH,
        CUSTOM_PFD_VOL2_KNOB_PUSH,
        CUSTOM_PFD_COM_KNOB_PUSH,
        CUSTOM_PFD_CRS_KNOB_PUSH,

        CUSTOM_MFD_VOL1_KNOB_PUSH,
        CUSTOM_MFD_NAV_KNOB_PUSH,
        CUSTOM_MFD_VOL2_KNOB_PUSH,
        CUSTOM_MFD_COM_KNOB_PUSH,
        CUSTOM_MFD_CRS_KNOB_PUSH,

        AS1000_PFD_VOL_1_INC,
        AS1000_PFD_VOL_1_DEC,
        AS1000_PFD_VOL_2_INC,
        AS1000_PFD_VOL_2_DEC,
        AS1000_PFD_NAV_Switch,
        AS1000_PFD_NAV_Large_INC,
        AS1000_PFD_NAV_Large_DEC,
        AS1000_PFD_NAV_Small_INC,
        AS1000_PFD_NAV_Small_DEC,
        AS1000_PFD_NAV_Push,
        AS1000_PFD_COM_Switch_Long,
        AS1000_PFD_COM_Switch,
        AS1000_PFD_COM_Large_INC,
        AS1000_PFD_COM_Large_DEC,
        AS1000_PFD_COM_Small_INC,
        AS1000_PFD_COM_Small_DEC,
        AS1000_PFD_COM_Push,
        AS1000_PFD_BARO_INC,
        AS1000_PFD_BARO_DEC,
        AS1000_PFD_CRS_INC,
        AS1000_PFD_CRS_DEC,
        AS1000_PFD_CRS_PUSH,
        AS1000_PFD_SOFTKEYS_1,
        AS1000_PFD_SOFTKEYS_2,
        AS1000_PFD_SOFTKEYS_3,
        AS1000_PFD_SOFTKEYS_4,
        AS1000_PFD_SOFTKEYS_5,
        AS1000_PFD_SOFTKEYS_6,
        AS1000_PFD_SOFTKEYS_7,
        AS1000_PFD_SOFTKEYS_8,
        AS1000_PFD_SOFTKEYS_9,
        AS1000_PFD_SOFTKEYS_10,
        AS1000_PFD_SOFTKEYS_11,
        AS1000_PFD_SOFTKEYS_12,
        AS1000_PFD_DIRECTTO,
        AS1000_PFD_ENT_Push,
        AS1000_PFD_CLR_Long,
        AS1000_PFD_CLR,
        AS1000_PFD_MENU_Push,
        AS1000_PFD_FPL_Push,
        AS1000_PFD_PROC_Push,
        AS1000_PFD_FMS_Upper_INC,
        AS1000_PFD_FMS_Upper_DEC,
        AS1000_PFD_FMS_Upper_PUSH,
        AS1000_PFD_FMS_Lower_INC,
        AS1000_PFD_FMS_Lower_DEC,
        AS1000_PFD_RANGE_INC,
        AS1000_PFD_RANGE_DEC,
        AS1000_PFD_JOYSTICK_PUSH,
        AS1000_PFD_ActivateMapCursor,
        AS1000_PFD_DeactivateMapCursor,
        AS1000_PFD_JOYSTICK_RIGHT,
        AS1000_PFD_JOYSTICK_LEFT,
        AS1000_PFD_JOYSTICK_UP,
        AS1000_PFD_JOYSTICK_DOWN,
        AS1000_MFD_VOL_1_INC,
        AS1000_MFD_VOL_1_DEC,
        AS1000_MFD_VOL_2_INC,
        AS1000_MFD_VOL_2_DEC,
        AS1000_MFD_NAV_Switch,
        AS1000_MFD_NAV_Large_INC,
        AS1000_MFD_NAV_Large_DEC,
        AS1000_MFD_NAV_Small_INC,
        AS1000_MFD_NAV_Small_DEC,
        AS1000_MFD_NAV_Push,
        AS1000_MFD_COM_Switch_Long,
        AS1000_MFD_COM_Switch,
        AS1000_MFD_COM_Large_INC,
        AS1000_MFD_COM_Large_DEC,
        AS1000_MFD_COM_Small_INC,
        AS1000_MFD_COM_Small_DEC,
        AS1000_MFD_COM_Push,
        AS1000_MFD_BARO_INC,
        AS1000_MFD_BARO_DEC,
        AS1000_MFD_CRS_INC,
        AS1000_MFD_CRS_DEC,
        AS1000_MFD_CRS_PUSH,
        AS1000_MFD_SOFTKEYS_1,
        AS1000_MFD_SOFTKEYS_2,
        AS1000_MFD_SOFTKEYS_3,
        AS1000_MFD_SOFTKEYS_4,
        AS1000_MFD_SOFTKEYS_5,
        AS1000_MFD_SOFTKEYS_6,
        AS1000_MFD_SOFTKEYS_7,
        AS1000_MFD_SOFTKEYS_8,
        AS1000_MFD_SOFTKEYS_9,
        AS1000_MFD_SOFTKEYS_10,
        AS1000_MFD_SOFTKEYS_11,
        AS1000_MFD_SOFTKEYS_12,
        AS1000_MFD_DIRECTTO,
        AS1000_MFD_ENT_Push,
        AS1000_MFD_CLR_Long,
        AS1000_MFD_CLR,
        AS1000_MFD_MENU_Push,
        AS1000_MFD_FPL_Push,
        AS1000_MFD_PROC_Push,
        AS1000_MFD_FMS_Upper_INC,
        AS1000_MFD_FMS_Upper_DEC,
        AS1000_MFD_FMS_Upper_PUSH,
        AS1000_MFD_FMS_Lower_INC,
        AS1000_MFD_FMS_Lower_DEC,
        AS1000_MFD_RANGE_INC,
        AS1000_MFD_RANGE_DEC,
        AS1000_MFD_JOYSTICK_PUSH,
        AS1000_MFD_ActivateMapCursor,
        AS1000_MFD_DeactivateMapCursor,
        AS1000_MFD_JOYSTICK_RIGHT,
        AS1000_MFD_JOYSTICK_LEFT,
        AS1000_MFD_JOYSTICK_UP,
        AS1000_MFD_JOYSTICK_DOWN,
        AS1000_MID_COM_1_Push,
        AS1000_MID_COM_2_Push,
        AS1000_MID_COM_3_Push,
        AS1000_MID_COM_Mic_1_Push,
        AS1000_MID_COM_Mic_2_Push,
        AS1000_MID_COM_Mic_3_Push,
        AS1000_MID_COM_Swap_1_2_Push,
        AS1000_MID_TEL_Push,
        AS1000_MID_PA_Push,
        AS1000_MID_SPKR_Push,
        AS1000_MID_MKR_Mute_Push,
        AS1000_MID_HI_SENS_Push,
        AS1000_MID_DME_Push,
        AS1000_MID_NAV_1_Push,
        AS1000_MID_NAV_2_Push,
        AS1000_MID_ADF_Push,
        AS1000_MID_AUX_Push,
        AS1000_MID_MAN_SQ_Push,
        AS1000_MID_Play_Push,
        AS1000_MID_Isolate_Pilot_Push,
        AS1000_MID_Isolate_Copilot_Push,
        AS1000_MID_Pass_Copilot_INC,
        AS1000_MID_Pass_Copilot_DEC,
        AS1000_MID_Display_Backup_Push,


        // CJ4 Only
        WT_CJ4_AP_ALT_PRESSED,
        WT_CJ4_AP_APPR_PRESSED,
        WT_CJ4_AP_FD_TOGGLE,
        WT_CJ4_AP_FLC_PRESSED,
        WT_CJ4_AP_HDG_PRESSED,
        WT_CJ4_AP_NAV_PRESSED,
        WT_CJ4_AP_VNAV_PRESSED,
        WT_CJ4_AP_VS_PRESSED,
    }

    public enum SimActionType
    {
        None,
        Shared,
        Custom,
        HVar
    }
}
