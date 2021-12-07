import { simConnectPost } from './simConnectPost';

const ACTION_TYPE = {
    Shared: 'Shared',
    Custom: 'Custom',
    HVar: 'HVar',
    None: 'None'
}

export const simActions = {
    ATC: {
        select: (index) => simConnectPost(ACTION_TYPE.Shared, 'ATC_MENU_' + index, 1)
    },

    Autopilot: {
        apMaster: () => simConnectPost(ACTION_TYPE.Shared, 'AP_MASTER', 1),
        flightDirector: () => simConnectPost(ACTION_TYPE.Shared, 'TOGGLE_FLIGHT_DIRECTOR', 1),
        cdi: () => simConnectPost(ACTION_TYPE.Shared, 'TOGGLE_GPS_DRIVES_NAV1', 1),
        nav: () => simConnectPost(ACTION_TYPE.Shared, 'AP_NAV1_HOLD', 1),
        yawDamper: () => simConnectPost(ACTION_TYPE.Shared, 'YAW_DAMPER_TOGGLE', 1),
        autoThrottle: () => simConnectPost(ACTION_TYPE.Shared, 'AUTO_THROTTLE_ARM', 1),
        approach: () => simConnectPost(ACTION_TYPE.Shared, 'AP_APR_HOLD', 1),
        backCourse: () => simConnectPost(ACTION_TYPE.Shared, 'AP_BC_HOLD', 1),
        vnav: () => simConnectPost(ACTION_TYPE.None, 'NO_ACTION', 1),
        leveler: () => simConnectPost(ACTION_TYPE.Shared, 'AP_WING_LEVELER', 1),

        Altitude: {
            hold: () => simConnectPost(ACTION_TYPE.Shared, 'AP_PANEL_ALTITUDE_HOLD', 1),
            select: () => simConnectPost(ACTION_TYPE.Custom, 'ALTITUDE_BUG_SELECT', 1),
            set: (value) => simConnectPost(ACTION_TYPE.Shared, 'AP_ALT_VAR_SET_ENGLISH', value),
            sync: (value) => simConnectPost(ACTION_TYPE.Shared, 'AP_ALT_SYNC', value),
        },
        Heading: {
            hold: () => simConnectPost(ACTION_TYPE.Shared, 'AP_PANEL_HEADING_HOLD', 1),
            select: () => simConnectPost(ACTION_TYPE.Custom, 'HEADING_BUG_SELECT', 1),
            set: (value) => simConnectPost(ACTION_TYPE.Shared, 'HEADING_BUG_SET', value),
            sync: (value) => simConnectPost(ACTION_TYPE.Shared, 'HEADING_BUG_SYNC', value),
        },
        VS: {
            hold: () => simConnectPost(ACTION_TYPE.Shared, 'AP_VS_HOLD', 1),
            select: () => simConnectPost(ACTION_TYPE.Custom, 'VSI_BUG_SELECT', 1),
            set: (value) => simConnectPost(ACTION_TYPE.Shared, 'AP_VS_VAR_SET_ENGLISH', value),
            increase: () => simConnectPost(ACTION_TYPE.Shared, 'AP_VS_VAR_INC', 1),
            decrease: () => simConnectPost(ACTION_TYPE.Shared, 'AP_VS_VAR_DEC', 1),
        },
        FLC: {
            hold: () => simConnectPost(ACTION_TYPE.Shared, 'FLIGHT_LEVEL_CHANGE', 1),
            select: () => simConnectPost(ACTION_TYPE.Custom, 'AIRSPEED_BUG_SELECT', 1),
            set: (value) => simConnectPost(ACTION_TYPE.Shared, 'AP_SPD_VAR_SET', value),
            increase: () => simConnectPost(ACTION_TYPE.Shared, 'AP_SPD_VAR_INC', 1),
            decrease: () => simConnectPost(ACTION_TYPE.Shared, 'AP_SPD_VAR_DEC', 1),
        }
    },

    Barometer: {
        select: () => simConnectPost(ACTION_TYPE.Custom, 'BAROMETER_SELECT', 1),
        set: (value) => simConnectPost(ACTION_TYPE.Shared, 'KOHLSMAN_SET', value)
    },

    Communication: {
        COM1: {
            select: () => simConnectPost(ACTION_TYPE.Custom, 'COM1_SELECT', 1),
            set: (value) => simConnectPost(ACTION_TYPE.Shared, 'COM_STBY_RADIO_SET', value),
            swap: () => simConnectPost(ACTION_TYPE.Shared, 'COM_STBY_RADIO_SWAP', 1),
            toggle: (value) => simConnectPost(ACTION_TYPE.Shared, 'COM1_TRANSMIT_SELECT', value)
        },
        COM2: {
            select: () => simConnectPost(ACTION_TYPE.Custom, 'COM2_SELECT', 1),
            set: (value) => simConnectPost(ACTION_TYPE.Shared, 'COM2_STBY_RADIO_SET', value),
            swap: () => simConnectPost(ACTION_TYPE.Shared, 'COM2_RADIO_SWAP', 1),
            toggle: (value) => simConnectPost(ACTION_TYPE.Shared, 'COM2_TRANSMIT_SELECT', value)
        }
    },

    Electrical: {
        Master: {
            battery: (value) => simConnectPost(ACTION_TYPE.Shared, 'TOGGLE_MASTER_BATTERY' , value),
            alternator: (value) => simConnectPost(ACTION_TYPE.Shared, 'TOGGLE_MASTER_ALTERNATOR', value)
        },
        Avionic: {
            master: (value) => simConnectPost(ACTION_TYPE.Shared, 'AVIONICS_MASTER_SET', value),
            fuelPump: (value) => simConnectPost(ACTION_TYPE.Shared, 'TOGGLE_ELECT_FUEL_PUMP', value),
            pitotHeat: (value) => simConnectPost(ACTION_TYPE.Shared, 'PITOT_HEAT_TOGGLE', value),
            deIce: (value) => simConnectPost(ACTION_TYPE.Shared, 'ANTI_ICE_SET', value)
        },
        Light: {
            beacon: (value) => simConnectPost(ACTION_TYPE.Shared, 'TOGGLE_BEACON_LIGHTS' , value),
            landing: (value) => simConnectPost(ACTION_TYPE.Shared, 'LANDING_LIGHTS_TOGGLE', value),
            taxi: (value) => simConnectPost(ACTION_TYPE.Shared, 'TOGGLE_TAXI_LIGHTS', value),
            nav: (value) => simConnectPost(ACTION_TYPE.Shared, 'TOGGLE_NAV_LIGHTS', value),
            strobe: (value) => simConnectPost(ACTION_TYPE.Shared, 'STROBES_TOGGLE', value),
            panel: (value) => simConnectPost(ACTION_TYPE.Shared, 'PANEL_LIGHTS_TOGGLE', value)
        }
    },

    Navigation: {
        NAV1: {
            select: () => simConnectPost(ACTION_TYPE.Custom, 'NAV1_SELECT', 1),
            set: (value) => simConnectPost(ACTION_TYPE.Shared, 'NAV1_STBY_SET', value),
            swap: () => simConnectPost(ACTION_TYPE.Shared, 'NAV1_RADIO_SWAP', 1),
        },
        NAV2: {
            select: () => simConnectPost(ACTION_TYPE.Custom, 'NAV2_SELECT', 1),
            set: (value) => simConnectPost(ACTION_TYPE.Shared, 'NAV2_STBY_SET', value),
            swap: () => simConnectPost(ACTION_TYPE.Shared, 'NAV2_RADIO_SWAP', 1),
        },
        ADF: {
            select: (digitIndex) => simConnectPost(ACTION_TYPE.Custom, 'ADF_DIGIT' + (digitIndex + 1) + '_SELECT', 1),
            set: (digitIndex, value, adfValue) => {
                switch (digitIndex) {
                    case 0:
                        adfValue = value + adfValue.substring(adfValue.length - 2);
                        break;
                    case 1:
                        adfValue = adfValue.substring(0, adfValue.length - 2) + value + adfValue.substring(adfValue.length - 1);
                        break;
                    case 2:
                        adfValue = adfValue.substring(0, adfValue.length - 1) + value;
                        break;
                    default:
                }

                simConnectPost(ACTION_TYPE.Shared, 'ADF_COMPLETE_SET', adfValue);
            },
            swap: () => simConnectPost(ACTION_TYPE.Shared, 'ADF1_RADIO_SWAP', 1),
            cardSelect: () => simConnectPost(ACTION_TYPE.Custom, 'ADF_CARD_SELECT', 1),
            cardSet: (value) => simConnectPost(ACTION_TYPE.Shared, 'ADF_CARD_SET', value)
        },
        OBS1: {
            select: () => simConnectPost(ACTION_TYPE.Custom, 'VOR1_SELECTED' , 1),
            set: (value) => simConnectPost(ACTION_TYPE.Shared, 'VOR1_SET' , value)
        },
        OBS2: {
            select: () => simConnectPost(ACTION_TYPE.Custom, 'VOR2_SELECTED', 1),
            set: (value) => simConnectPost(ACTION_TYPE.Shared, 'VOR2_SET', value)
        },
        DME1: {
            toggle: () => simConnectPost(ACTION_TYPE.Shared, 'DME1_TOGGLE', 1),
        },
        DME2: {
            toggle: () => simConnectPost(ACTION_TYPE.Shared, 'DME2_TOGGLE', 1),
        }
    },

    Transponder: {
        select: (digitIndex) => simConnectPost(ACTION_TYPE.Custom, 'XPNDR_DIGIT' + (digitIndex + 1) + '_SELECT', 1),
        set: (digitIndex, value, xpndrValue) => {
            let xpndr = xpndrValue.split('');
            xpndr[digitIndex] = value;
            xpndr = Number(xpndr.join(''));
            simConnectPost(ACTION_TYPE.Shared, 'XPNDR_SET', xpndr);
        }
    },

    SimRate : {
        increase: () => simConnectPost(ACTION_TYPE.Shared, 'SIM_RATE_INCR', 1),
        decrease: () => simConnectPost(ACTION_TYPE.Shared, 'SIM_RATE_DECR', 1),
    },

    ProfileSpecific:
    {
        // ******************** G1000 NXi ******************************
        G1000NXi: {
            PFD: {
                Volume: {
                    vol1Select: () => simConnectPost(ACTION_TYPE.Custom, 'PFD_VOL1_KNOB_PUSH', 1),
                    vol2Select: () => simConnectPost(ACTION_TYPE.Custom, 'PFD_VOL2_KNOB_PUSH', 1),
                },
                COM: {
                    select: () => simConnectPost(ACTION_TYPE.Custom, 'PFD_COM_KNOB_PUSH', 1),
                    swap: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_COM_Switch', 1),
                },
                NAV: {
                    select: () => simConnectPost(ACTION_TYPE.Custom, 'PFD_NAV_KNOB_PUSH', 1),
                    swap: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_NAV_Switch', 1),
                },
                CRS: {
                    select: () => simConnectPost(ACTION_TYPE.Custom, 'PFD_CRS_KNOB_PUSH', 1),
                },
                HEADING: {
                    select: () => simConnectPost(ACTION_TYPE.Custom, 'PFD_HEADING_KNOB_PUSH', 1),
                },
                Menu: {
                    directTo: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_DIRECTTO', 1),
                    flightPlan: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_FPL_Push', 1),
                    procedure: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_PROC_Push', 1),
                    menu: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_MENU_Push', 1),
                    clear: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_CLR', 1),
                    enter: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_ENT_Push', 1),
                },
                FMS: {
                    select: () => simConnectPost(ACTION_TYPE.Custom, 'PFD_FMS_SELECTED', 1),
                    upperInc: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_FMS_Upper_INC', 1),
                    upperDec: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_FMS_Upper_DEC', 1),
                    lowerInc: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_FMS_Lower_INC', 1),
                    lowerDec: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_FMS_Lower_DEC', 1),
                    upperPush: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_FMS_Upper_PUSH', 1),
                },
                MAP: {
                    select: () => {
                        simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_JOYSTICK_PUSH', 1);
                        setTimeout(() => simConnectPost(ACTION_TYPE.Custom, 'PFD_MAP_SELECTED', 1), 250);
                    },
                    rangeInc: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_RANGE_INC', 1),
                    rangeDec: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_RANGE_DEC', 1),
                    joystickPush: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_JOYSTICK_PUSH', 1),
                    joystickUp: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_JOYSTICK_UP', 1),
                    joystickDown: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_JOYSTICK_DOWN', 1),
                    joystickLeft: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_JOYSTICK_LEFT', 1),
                    joystickRight: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_JOYSTICK_RIGHT', 1),
                },
                SoftKey: {
                    select: (digit) => {
                        simConnectPost(ACTION_TYPE.HVar, 'AS1000_PFD_SOFTKEYS_' + digit, 1);
                    },
                }
            },
            MID: {
                com1mic: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MID_COM_Mic_1_Push', 1),
                com2mic: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MID_COM_Mic_2_Push', 1),
                com12swap: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MID_COM_Swap_1_2_Push', 1),
                com1: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MID_COM_1_Push', 1),
                com2: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MID_COM_2_Push' , 1),
                adf: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MID_ADF_Push' , 1),
                dme: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MID_DME_Push', 1),
                nav1: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MID_NAV_1_Push', 1),
                nav2: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MID_NAV_2_Push', 1),
                aux: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MID_AUX_Push', 1),
            },
            MFD: {
                Volume: {
                    vol1Select: () => simConnectPost(ACTION_TYPE.Custom, 'MFD_VOL1_KNOB_PUSH', 1),
                    vol2Select: () => simConnectPost(ACTION_TYPE.Custom, 'MFD_VOL2_KNOB_PUSH', 1),
                },
                COM: {
                    select: () => simConnectPost(ACTION_TYPE.Custom, 'MFD_COM_KNOB_PUSH', 1),
                    swap: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_COM_Switch', 1),
                },
                NAV: {
                    select: () => simConnectPost(ACTION_TYPE.Custom, 'MFD_NAV_KNOB_PUSH', 1),
                    swap: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_NAV_Switch', 1),
                },
                CRS: {
                    select: () => simConnectPost(ACTION_TYPE.Custom, 'MFD_CRS_KNOB_PUSH', 1),
                },
                HEADING: {
                    select: () => simConnectPost(ACTION_TYPE.Custom, 'MFD_HEADING_KNOB_PUSH', 1),
                },
                Menu: {
                    directTo: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_DIRECTTO', 1),
                    flightPlan: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_FPL_Push', 1),
                    procedure: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_PROC_Push', 1),
                    menu: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_MENU_Push', 1),
                    clear: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_CLR', 1),
                    enter: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_ENT_Push', 1),
                },
                FMS: {
                    select: () => simConnectPost(ACTION_TYPE.Custom, 'MFD_FMS_SELECTED', 1),
                    upperInc: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_FMS_Upper_INC', 1),
                    upperDec: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_FMS_Upper_DEC', 1),
                    lowerInc: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_FMS_Lower_INC', 1),
                    lowerDec: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_FMS_Lower_DEC', 1),
                    upperPush: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_FMS_Upper_PUSH', 1),
                },
                MAP: {
                    select: () => {
                        simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_JOYSTICK_PUSH', 1);
                        setTimeout(() => simConnectPost(ACTION_TYPE.Custom, 'MFD_MAP_SELECTED', 1), 250);
                    },
                    rangeInc: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_RANGE_INC', 1),
                    rangeDec: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_RANGE_DEC', 1),
                    joystickPush: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_JOYSTICK_PUSH', 1),
                    joystickUp: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_JOYSTICK_UP', 1),
                    joystickDown: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_JOYSTICK_DOWN', 1),
                    joystickLeft: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_JOYSTICK_LEFT', 1),
                    joystickRight: () => simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_JOYSTICK_RIGHT', 1),
                },
                SoftKey: {
                    select: (digit) => {
                        simConnectPost(ACTION_TYPE.HVar, 'AS1000_MFD_SOFTKEYS_' + digit, 1);
                    },
                }
            },
        },

        // A320 and A32NX
        A320: {
            MCDU: {
                buttonSelect: (btn) => { 
                    simConnectPost(ACTION_TYPE.HVar, 'A320_Neo_CDU_1_BTN_' + btn, 1);
                },
            }
        }
    }
}