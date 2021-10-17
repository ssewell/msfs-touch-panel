export const simConnectActionType = {
    NO_ACTION: { type: 'None', simAction: 'NO_ACTION' },

    Shared: {
        // Autopilot
        AP_MASTER: { type: 'Shared', simAction: 'AP_MASTER' },
        AP_FLIGHT_DIRECTOR: { type: 'Shared', simAction: 'TOGGLE_FLIGHT_DIRECTOR' },
        AP_CDI: { type: 'Shared', simAction: 'TOGGLE_GPS_DRIVES_NAV1' },
        AP_NAV: { type: 'Shared', simAction: 'AP_NAV1_HOLD' },
        AP_VNAV: { type: 'Shared', simAction: 'NO_ACTION' },
        AP_APPROACH: { type: 'Shared', simAction: 'AP_APR_HOLD' },
        AP_BACK_COURSE: { type: 'Shared', simAction: 'AP_BC_HOLD' },
        AP_YAW_DAMPER: { type: 'Shared', simAction: 'YAW_DAMPER_TOGGLE' },
        AP_WING_LEVELER: { type: 'Shared', simAction: 'AP_WING_LEVELER' },
        AP_AUTO_THROTTLE: { type: 'Shared', simAction: 'AUTO_THROTTLE_ARM' },

        AP_ALTITUDE_HOLD: { type: 'Shared', simAction: 'AP_PANEL_ALTITUDE_HOLD' },
        AP_HEADING_HOLD: { type: 'Shared', simAction: 'AP_PANEL_HEADING_HOLD' },
        AP_VS_HOLD: { type: 'Shared', simAction: 'AP_VS_HOLD' },
        AP_FLC_HOLD: { type: 'Shared', simAction: 'FLIGHT_LEVEL_CHANGE' },
        AP_HEADING_SYNC: { type: 'Shared', simAction: 'HEADING_BUG_SYNC' },
        AP_ALTITUDE_SYNC: { type: 'Shared', simAction: 'AP_ALT_SYNC' },

        AP_ALTITUDE_SELECT: { type: 'Custom', simAction: 'ALTITUDE_BUG_SELECT' },
        AP_HEADING_SELECT: { type: 'Custom', simAction: 'HEADING_BUG_SELECT' },
        AP_VS_SELECT: { type: 'Custom', simAction: 'VSI_BUG_SELECT' },
        AP_FLC_SELECT: { type: 'Custom', simAction: 'AIRSPEED_BUG_SELECT' },

        AP_ALTITUDE_SET: { type: 'Shared', simAction: 'AP_ALT_VAR_SET_ENGLISH' },
        AP_HEADING_SET: { type: 'Shared', simAction: 'HEADING_BUG_SET' },
        AP_VS_SET: { type: 'Shared', simAction: 'AP_VS_VAR_SET_ENGLISH' },

        AP_VS_VAR_INC: { type: 'Shared', simAction: 'AP_VS_VAR_INC' },
        AP_VS_VAR_DEC: { type: 'Shared', simAction: 'AP_VS_VAR_DEC' },

        AP_FLC_SET: { type: 'Shared', simAction: 'AP_SPD_VAR_SET' },

        // COM
        COM1_SELECT: { type: 'Custom', simAction: 'COM1_SELECT' },
        COM2_SELECT: { type: 'Custom', simAction: 'COM2_SELECT' },
        COM1_STBY_SET: { type: 'Shared', simAction: 'COM_STBY_RADIO_SET' },
        COM2_STBY_SET: { type: 'Shared', simAction: 'COM2_STBY_RADIO_SET' },
        COM1_SWAP: { type: 'Shared', simAction: 'COM_STBY_RADIO_SWAP' },
        COM2_SWAP: { type: 'Shared', simAction: 'COM2_RADIO_SWAP' },
        COM1_TRANSMIT_SELECT: { type: 'Shared', simAction: 'COM1_TRANSMIT_SELECT' },
        COM2_TRANSMIT_SELECT: { type: 'Shared', simAction: 'COM2_TRANSMIT_SELECT' },

        // NAV
        NAV1_SELECT: { type: 'Custom', simAction: 'NAV1_SELECT' },
        NAV2_SELECT: { type: 'Custom', simAction: 'NAV2_SELECT' },
        NAV1_STBY_SET: { type: 'Shared', simAction: 'NAV1_STBY_SET' },
        NAV2_STBY_SET: { type: 'Shared', simAction: 'NAV2_STBY_SET' },
        NAV1_SWAP: { type: 'Shared', simAction: 'NAV1_RADIO_SWAP' },
        NAV2_SWAP: { type: 'Shared', simAction: 'NAV2_RADIO_SWAP' },

        ADF_DIGIT1_SELECT: { type: 'Custom', simAction: 'ADF_DIGIT1_SELECT' },
        ADF_DIGIT2_SELECT: { type: 'Custom', simAction: 'ADF_DIGIT2_SELECT' },
        ADF_DIGIT3_SELECT: { type: 'Custom', simAction: 'ADF_DIGIT3_SELECT' },
        ADF_COMPLETE_SET: { type: 'Shared', simAction: 'ADF_COMPLETE_SET' },
        ADF_CARD_SELECT: { type: 'Custom', simAction: 'ADF_CARD_SELECT' },
        ADF_CARD_SET: { type: 'Shared', simAction: 'ADF_CARD_SET' },
        ADF1_RADIO_SWAP: { type: 'Shared', simAction: 'ADF1_RADIO_SWAP' },

        OBS1_SELECT: { type: 'Custom', simAction: 'VOR1_SELECTED' },
        OBS2_SELECT: { type: 'Custom', simAction: 'VOR2_SELECTED' },
        OBS1_SET: { type: 'Shared', simAction: 'VOR1_SET' },
        OBS2_SET: { type: 'Shared', simAction: 'VOR2_SET' },

        DME_NAV1: { type: 'Shared', simAction: 'DME1_TOGGLE' },
        DME_NAV2: { type: 'Shared', simAction: 'DME2_TOGGLE' },

        // Transponder
        XPNDR_DIGIT1_SELECT: { type: 'Custom', simAction: 'XPNDR_DIGIT1_SELECT' },
        XPNDR_DIGIT2_SELECT: { type: 'Custom', simAction: 'XPNDR_DIGIT2_SELECT' },
        XPNDR_DIGIT3_SELECT: { type: 'Custom', simAction: 'XPNDR_DIGIT3_SELECT' },
        XPNDR_DIGIT4_SELECT: { type: 'Custom', simAction: 'XPNDR_DIGIT4_SELECT' },
        XPNDR_SET: { type: 'Shared', simAction: 'XPNDR_SET' },

        // Barometer
        BAROMETER_SELECT: { type: 'Custom', simAction: 'BAROMETER_SELECT' },
        BAROMETER_INC: { type: 'Shared', simAction: 'KOHLSMAN_INC' },
        BAROMETER_DEC: { type: 'Shared', simAction: 'KOHLSMAN_DEC' },
        BAROMETER_SET: { type: 'Shared', simAction: 'KOHLSMAN_SET' },

        // Electrical
        BATTERY_MASTER: { type: 'Shared', simAction: 'TOGGLE_MASTER_BATTERY' },
        ALTERNATOR_MASTER: { type: 'Shared', simAction: 'TOGGLE_MASTER_ALTERNATOR' },
        AVIONICS_MASTER: { type: 'Shared', simAction: 'AVIONICS_MASTER_SET' },
        FUEL_PUMP: { type: 'Shared', simAction: 'TOGGLE_ELECT_FUEL_PUMP' },
        DEICE: { type: 'Shared', simAction: 'ANTI_ICE_SET' },
        PITOT_HEAT: { type: 'Shared', simAction: 'PITOT_HEAT_TOGGLE' },

        LIGHT_TAXI: { type: 'Shared', simAction: 'TOGGLE_TAXI_LIGHTS' },
        LIGHT_LANDING: { type: 'Shared', simAction: 'LANDING_LIGHTS_TOGGLE' },
        LIGHT_BEACON: { type: 'Shared', simAction: 'TOGGLE_BEACON_LIGHTS' },
        LIGHT_NAV: { type: 'Shared', simAction: 'TOGGLE_NAV_LIGHTS' },
        LIGHT_STROBE: { type: 'Shared', simAction: 'STROBES_TOGGLE' },
        LIGHT_PANEL: { type: 'Shared', simAction: 'PANEL_LIGHTS_TOGGLE' },

        // ATC
        ATC_MENU_1: { type: 'Shared', simAction: 'ATC_MENU_1' },
        ATC_MENU_2: { type: 'Shared', simAction: 'ATC_MENU_2' },
        ATC_MENU_3: { type: 'Shared', simAction: 'ATC_MENU_3' },
        ATC_MENU_4: { type: 'Shared', simAction: 'ATC_MENU_4' },
        ATC_MENU_5: { type: 'Shared', simAction: 'ATC_MENU_5' },
        ATC_MENU_6: { type: 'Shared', simAction: 'ATC_MENU_6' },
        ATC_MENU_7: { type: 'Shared', simAction: 'ATC_MENU_7' },
        ATC_MENU_8: { type: 'Shared', simAction: 'ATC_MENU_8' },
        ATC_MENU_9: { type: 'Shared', simAction: 'ATC_MENU_9' },
        ATC_MENU_0: { type: 'Shared', simAction: 'ATC_MENU_0' },

        // SIMULATION RATE
        SIM_RATE_INCREASE: { type: 'Shared', simAction: 'SIM_RATE_INCR' },
        SIM_RATE_DECREASE: { type: 'Shared', simAction: 'SIM_RATE_DECR' }
    },

    G1000NXi: {
        // Override
        CDI: { type: 'HVar', simAction: 'AS1000_PFD_SOFTKEYS_6' },

        ADF_SELECT: { type: 'HVar', simAction: 'AS1000_MID_ADF_Push' },
        DME_SELECT: { type: 'HVar', simAction: 'AS1000_MID_DME_Push' },
        DME_NAV1_SELECT: { type: 'HVar', simAction: 'AS1000_MID_NAV_1_Push' },
        DME_NAV2_SELECT: { type: 'HVar', simAction: 'AS1000_MID_NAV_2_Push' },

        // Unique
        PFD_MENU: { type: 'HVar', simAction: 'AS1000_PFD_MENU_Push' },
        PFD_DIRECTTO: { type: 'HVar', simAction: 'AS1000_PFD_DIRECTTO' },
        PFD_FLIGHTPLAN: { type: 'HVar', simAction: 'AS1000_PFD_FPL_Push' },
        PFD_PROCEDURE: { type: 'HVar', simAction: 'AS1000_PFD_PROC_Push' },
        PFD_CLEAR: { type: 'HVar', simAction: 'AS1000_PFD_CLR' },
        PFD_ENTER: { type: 'HVar', simAction: 'AS1000_PFD_ENT_Push' },
        PFD_MAP_SELECT: { type: 'Custom', simAction: 'PFD_MAP_SELECTED' },
        PFD_FMS_SELECT: { type: 'Custom', simAction: 'PFD_FMS_SELECTED' },
        PFD_BARO_INC: { type: 'HVar', simAction: 'AS1000_PFD_BARO_INC' },
        PFD_BARO_DEC: { type: 'HVar', simAction: 'AS1000_PFD_BARO_DEC' },
        PFD_SOFTKEY_1: { type: 'HVar', simAction: 'AS1000_PFD_SOFTKEYS_1' },
        PFD_SOFTKEY_2: { type: 'HVar', simAction: 'AS1000_PFD_SOFTKEYS_2' },
        PFD_SOFTKEY_3: { type: 'HVar', simAction: 'AS1000_PFD_SOFTKEYS_3' },
        PFD_SOFTKEY_4: { type: 'HVar', simAction: 'AS1000_PFD_SOFTKEYS_4' },
        PFD_SOFTKEY_5: { type: 'HVar', simAction: 'AS1000_PFD_SOFTKEYS_5' },
        PFD_SOFTKEY_6: { type: 'HVar', simAction: 'AS1000_PFD_SOFTKEYS_6' },
        PFD_SOFTKEY_7: { type: 'HVar', simAction: 'AS1000_PFD_SOFTKEYS_7' },
        PFD_SOFTKEY_8: { type: 'HVar', simAction: 'AS1000_PFD_SOFTKEYS_8' },
        PFD_SOFTKEY_9: { type: 'HVar', simAction: 'AS1000_PFD_SOFTKEYS_9' },
        PFD_SOFTKEY_10: { type: 'HVar', simAction: 'AS1000_PFD_SOFTKEYS_10' },
        PFD_SOFTKEY_11: { type: 'HVar', simAction: 'AS1000_PFD_SOFTKEYS_11' },
        PFD_SOFTKEY_12: { type: 'HVar', simAction: 'AS1000_PFD_SOFTKEYS_12' },
        PFD_FMS_UPPER_INC: { type: 'HVar', simAction: 'AS1000_PFD_FMS_Upper_INC' },
        PFD_FMS_UPPER_DEC: { type: 'HVar', simAction: 'AS1000_PFD_FMS_Upper_DEC' },
        PFD_FMS_LOWER_INC: { type: 'HVar', simAction: 'AS1000_PFD_FMS_Lower_INC' },
        PFD_FMS_LOWER_DEC: { type: 'HVar', simAction: 'AS1000_PFD_FMS_Lower_DEC' },
        PFD_FMS_UPPER_PUSH: { type: 'HVar', simAction: 'AS1000_PFD_FMS_Upper_PUSH' },
        PFD_MAP_RANGE_INCREASE: { type: 'HVar', simAction: 'AS1000_PFD_RANGE_INC' },
        PFD_MAP_RANGE_DECREASE: { type: 'HVar', simAction: 'AS1000_PFD_RANGE_DEC' },
        PFD_JOYSTICK_PUSH: { type: 'HVar', simAction: 'AS1000_PFD_JOYSTICK_PUSH' },
        PFD_JOYSTICK_UP: { type: 'HVar', simAction: 'AS1000_PFD_JOYSTICK_UP' },
        PFD_JOYSTICK_DOWN: { type: 'HVar', simAction: 'AS1000_PFD_JOYSTICK_DOWN' },
        PFD_JOYSTICK_LEFT: { type: 'HVar', simAction: 'AS1000_PFD_JOYSTICK_LEFT' },
        PFD_JOYSTICK_RIGHT: { type: 'HVar', simAction: 'AS1000_PFD_JOYSTICK_RIGHT' },
        
        PFD_VOL1_SELECT: { type: 'Custom', simAction: 'PFD_VOL1_KNOB_PUSH' },
        PFD_NAV_SELECT: { type: 'Custom', simAction: 'PFD_NAV_KNOB_PUSH' },
        PFD_NAV_SWAP: { type: 'HVar', simAction: 'AS1000_PFD_NAV_Switch' },
        PFD_VOL2_SELECT: { type: 'Custom', simAction: 'PFD_VOL2_KNOB_PUSH' },
        PFD_COM_SELECT: { type: 'Custom', simAction: 'PFD_COM_KNOB_PUSH' },
        PFD_COM_SWAP: { type: 'HVar', simAction: 'AS1000_PFD_COM_Switch' },
        PFD_CRS_SELECT: { type: 'Custom', simAction: 'PFD_CRS_KNOB_PUSH' },
    
        MFD_MENU: { type: 'HVar', simAction: 'AS1000_MFD_MENU_Push' },
        MFD_DIRECTTO: { type: 'HVar', simAction: 'AS1000_MFD_DIRECTTO' },
        MFD_FLIGHTPLAN: { type: 'HVar', simAction: 'AS1000_MFD_FPL_Push' },
        MFD_PROCEDURE: { type: 'HVar', simAction: 'AS1000_MFD_PROC_Push' },
        MFD_CLEAR: { type: 'HVar', simAction: 'AS1000_MFD_CLR' },
        MFD_ENTER: { type: 'HVar', simAction: 'AS1000_MFD_ENT_Push' },
        MFD_MAP_SELECT: { type: 'Custom', simAction: 'MFD_MAP_SELECTED' },
        MFD_FMS_SELECT: { type: 'Custom', simAction: 'MFD_FMS_SELECTED' },
        MFD_BARO_INC: { type: 'HVar', simAction: 'AS1000_MFD_BARO_INC' },
        MFD_BARO_DEC: { type: 'HVar', simAction: 'AS1000_MFD_BARO_DEC' },
        MFD_SOFTKEY_1: { type: 'HVar', simAction: 'AS1000_MFD_SOFTKEYS_1' },
        MFD_SOFTKEY_2: { type: 'HVar', simAction: 'AS1000_MFD_SOFTKEYS_2' },
        MFD_SOFTKEY_3: { type: 'HVar', simAction: 'AS1000_MFD_SOFTKEYS_3' },
        MFD_SOFTKEY_4: { type: 'HVar', simAction: 'AS1000_MFD_SOFTKEYS_4' },
        MFD_SOFTKEY_5: { type: 'HVar', simAction: 'AS1000_MFD_SOFTKEYS_5' },
        MFD_SOFTKEY_6: { type: 'HVar', simAction: 'AS1000_MFD_SOFTKEYS_6' },
        MFD_SOFTKEY_7: { type: 'HVar', simAction: 'AS1000_MFD_SOFTKEYS_7' },
        MFD_SOFTKEY_8: { type: 'HVar', simAction: 'AS1000_MFD_SOFTKEYS_8' },
        MFD_SOFTKEY_9: { type: 'HVar', simAction: 'AS1000_MFD_SOFTKEYS_9' },
        MFD_SOFTKEY_10: { type: 'HVar', simAction: 'AS1000_MFD_SOFTKEYS_10' },
        MFD_SOFTKEY_11: { type: 'HVar', simAction: 'AS1000_MFD_SOFTKEYS_11' },
        MFD_SOFTKEY_12: { type: 'HVar', simAction: 'AS1000_MFD_SOFTKEYS_12' },
        MFD_FMS_UPPER_INC: { type: 'HVar', simAction: 'AS1000_MFD_FMS_Upper_INC' },
        MFD_FMS_UPPER_DEC: { type: 'HVar', simAction: 'AS1000_MFD_FMS_Upper_DEC' },
        MFD_FMS_LOWER_INC: { type: 'HVar', simAction: 'AS1000_MFD_FMS_Lower_INC' },
        MFD_FMS_LOWER_DEC: { type: 'HVar', simAction: 'AS1000_MFD_FMS_Lower_DEC' },
        MFD_FMS_UPPER_PUSH: { type: 'HVar', simAction: 'AS1000_MFD_FMS_Upper_PUSH' },
        MFD_MAP_RANGE_INCREASE: { type: 'HVar', simAction: 'AS1000_MFD_RANGE_INC' },
        MFD_MAP_RANGE_DECREASE: { type: 'HVar', simAction: 'AS1000_MFD_RANGE_DEC' },
        MFD_JOYSTICK_PUSH: { type: 'HVar', simAction: 'AS1000_MFD_JOYSTICK_PUSH' },
        MFD_JOYSTICK_UP: { type: 'HVar', simAction: 'AS1000_MFD_JOYSTICK_UP' },
        MFD_JOYSTICK_DOWN: { type: 'HVar', simAction: 'AS1000_MFD_JOYSTICK_DOWN' },
        MFD_JOYSTICK_LEFT: { type: 'HVar', simAction: 'AS1000_MFD_JOYSTICK_LEFT' },
        MFD_JOYSTICK_RIGHT: { type: 'HVar', simAction: 'AS1000_MFD_JOYSTICK_RIGHT' },

        MFD_VOL1_SELECT: { type: 'Custom', simAction: 'MFD_VOL1_KNOB_PUSH' },
        MFD_NAV_SELECT: { type: 'Custom', simAction: 'MFD_NAV_KNOB_PUSH' },
        MFD_NAV_SWAP: { type: 'HVar', simAction: 'AS1000_PFD_NAV_Switch' },
        MFD_VOL2_SELECT: { type: 'Custom', simAction: 'MFD_VOL2_KNOB_PUSH' },
        MFD_COM_SELECT: { type: 'Custom', simAction: 'MFD_COM_KNOB_PUSH' },
        MFD_COM_SWAP: { type: 'HVar', simAction: 'AS1000_PFD_COM_Switch' },
        MFD_CRS_SELECT: { type: 'Custom', simAction: 'MFD_CRS_KNOB_PUSH' },
    }
}