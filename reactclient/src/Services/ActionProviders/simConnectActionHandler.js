import { simConnectPost } from './simConnectPost';
import { simConnectActionType } from './simConnectActionType';

export const simActions = {
    ATC: {
        select: (index) => simConnectPost(simConnectActionType.Shared['ATC_MENU_' + index], 1)
    },

    Autopilot: {
        apMaster: () => simConnectPost(simConnectActionType.Shared.AP_MASTER, 1),
        flightDirector: () => simConnectPost(simConnectActionType.Shared.AP_FLIGHT_DIRECTOR, 1),
        cdi: () => simConnectPost(simConnectActionType.Shared.AP_CDI, 1),
        nav: () => simConnectPost(simConnectActionType.Shared.AP_NAV, 1),
        yawDamper: () => simConnectPost(simConnectActionType.Shared.AP_YAW_DAMPER, 1),
        autoThrottle: () => simConnectPost(simConnectActionType.Shared.AP_AUTO_THROTTLE, 1),
        approach: () => simConnectPost(simConnectActionType.Shared.AP_APPROACH, 1),
        backCourse: () => simConnectPost(simConnectActionType.Shared.AP_BACK_COURSE, 1),
        vnav: () => simConnectPost(simConnectActionType.NO_ACTION, 1),
        leveler: () => simConnectPost(simConnectActionType.Shared.AP_WING_LEVELER, 1),

        Altitude: {
            hold: () => simConnectPost(simConnectActionType.Shared.AP_ALTITUDE_HOLD, 1),
            select: () => simConnectPost(simConnectActionType.Shared.AP_ALTITUDE_SELECT, 1),
            set: (value) => simConnectPost(simConnectActionType.Shared.AP_ALTITUDE_SET, value),
            sync: (value) => simConnectPost(simConnectActionType.Shared.AP_ALTITUDE_SYNC, value),
        },
        Heading: {
            hold: () => simConnectPost(simConnectActionType.Shared.AP_HEADING_HOLD, 1),
            select: () => simConnectPost(simConnectActionType.Shared.AP_HEADING_SELECT, 1),
            set: (value) => simConnectPost(simConnectActionType.Shared.AP_HEADING_SET, value),
            sync: (value) => simConnectPost(simConnectActionType.Shared.AP_HEADING_SYNC, value),
        },
        VS: {
            hold: () => simConnectPost(simConnectActionType.Shared.AP_VS_HOLD, 1),
            select: () => simConnectPost(simConnectActionType.Shared.AP_VS_SELECT, 1),
            set: (value) => simConnectPost(simConnectActionType.Shared.AP_VS_SET, value),
            increase: () => simConnectPost(simConnectActionType.Shared.AP_VS_VAR_INC, 1),
            decrease: () => simConnectPost(simConnectActionType.Shared.AP_VS_VAR_DEC, 1),
        },
        FLC: {
            hold: () => simConnectPost(simConnectActionType.Shared.AP_FLC_HOLD, 1),
            select: () => simConnectPost(simConnectActionType.Shared.AP_FLC_SELECT, 1),
            set: (value) => simConnectPost(simConnectActionType.Shared.AP_FLC_SET, value)
        }
    },

    Barometer: {
        select: () => simConnectPost(simConnectActionType.Shared.BAROMETER_SELECT, 1),
        set: (value) => simConnectPost(simConnectActionType.Shared.BAROMETER_SET, value)
    },

    Communication: {
        COM1: {
            select: () => simConnectPost(simConnectActionType.Shared.COM1_SELECT, 1),
            set: (value) => simConnectPost(simConnectActionType.Shared.COM1_STBY_SET, value),
            swap: () => simConnectPost(simConnectActionType.Shared.COM1_SWAP, 1),
            toggle: (value) => simConnectPost(simConnectActionType.Shared.COM1_TRANSMIT_SELECT, value)
        },
        COM2: {
            select: () => simConnectPost(simConnectActionType.Shared.COM2_SELECT, 1),
            set: (value) => simConnectPost(simConnectActionType.Shared.COM2_STBY_SET, value),
            swap: () => simConnectPost(simConnectActionType.Shared.COM2_SWAP, 1),
            toggle: (value) => simConnectPost(simConnectActionType.Shared.COM2_TRANSMIT_SELECT, value)
        }
    },

    Electrical: {
        Master: {
            battery: (value) => simConnectPost(simConnectActionType.Shared.BATTERY_MASTER, value),
            alternator: (value) => simConnectPost(simConnectActionType.Shared.ALTERNATOR_MASTER, value)
        },
        Avionic: {
            master: (value) => simConnectPost(simConnectActionType.Shared.AVIONICS_MASTER, value),
            fuelPump: (value) => simConnectPost(simConnectActionType.Shared.FUEL_PUMP, value),
            pitotHeat: (value) => simConnectPost(simConnectActionType.Shared.PITOT_HEAT, value),
            deIce: (value) => simConnectPost(simConnectActionType.Shared.DEICE, value)
        },
        Light: {
            beacon: (value) => simConnectPost(simConnectActionType.Shared.LIGHT_BEACON, value),
            landing: (value) => simConnectPost(simConnectActionType.Shared.LIGHT_LANDING, value),
            taxi: (value) => simConnectPost(simConnectActionType.Shared.LIGHT_TAXI, value),
            nav: (value) => simConnectPost(simConnectActionType.Shared.LIGHT_NAV, value),
            strobe: (value) => simConnectPost(simConnectActionType.Shared.LIGHT_STROBE, value),
            panel: (value) => simConnectPost(simConnectActionType.Shared.LIGHT_PANEL, value)
        }
    },

    Navigation: {
        NAV1: {
            select: () => simConnectPost(simConnectActionType.Shared.NAV1_SELECT, 1),
            set: (value) => simConnectPost(simConnectActionType.Shared.NAV1_STBY_SET, value),
            swap: () => simConnectPost(simConnectActionType.Shared.NAV1_SWAP, 1),
            cdi: () => simConnectPost(simConnectActionType.Shared.AP_CDI, 1)               // move to different category?
        },
        NAV2: {
            select: () => simConnectPost(simConnectActionType.Shared.NAV2_SELECT, 1),
            set: (value) => simConnectPost(simConnectActionType.Shared.NAV2_STBY_SET, value),
            swap: () => simConnectPost(simConnectActionType.Shared.NAV2_SWAP, 1),
            cdi: () => simConnectPost(simConnectActionType.Shared.AP_CDI, 1)               // move to different category?
        },
        ADF: {
            select: (digitIndex) => simConnectPost(simConnectActionType.Shared['ADF_DIGIT' + (digitIndex + 1) + '_SELECT'], 1),
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

                simConnectPost(simConnectActionType.Shared.ADF_COMPLETE_SET, adfValue);
            },
            swap: () => simConnectPost(simConnectActionType.Shared.ADF1_RADIO_SWAP, 1),
            cardSelect: () => simConnectPost(simConnectActionType.Shared.ADF_CARD_SELECT, 1),
            cardSet: (value) => simConnectPost(simConnectActionType.Shared.ADF_CARD_SET, value)
        },
        OBS1: {
            select: () => simConnectPost(simConnectActionType.Shared.OBS1_SELECT, 1),
            set: (value) => simConnectPost(simConnectActionType.Shared.OBS1_SET, value)
        },
        OBS2: {
            select: () => simConnectPost(simConnectActionType.Shared.OBS2_SELECT, 1),
            set: (value) => simConnectPost(simConnectActionType.Shared.OBS2_SET, value)
        },
        DME1: {
            toggle: () => simConnectPost(simConnectActionType.Shared.DME_NAV1, 1),
        },
        DME2: {
            toggle: () => simConnectPost(simConnectActionType.Shared.DME_NAV2, 1),
        }
    },

    Transponder: {
        select: (digitIndex) => simConnectPost(simConnectActionType.Shared['XPNDR_DIGIT' + (digitIndex + 1) + '_SELECT'], 1),
        set: (digitIndex, value, xpndrValue) => {
            let xpndr = xpndrValue.split('');
            xpndr[digitIndex] = value;
            xpndr = Number(xpndr.join(''));
            simConnectPost(simConnectActionType.Shared.XPNDR_SET, xpndr);
        }
    },

    SimRate : {
        increase: () => simConnectPost(simConnectActionType.Shared.SIM_RATE_INCREASE, 1),
        decrease: () => simConnectPost(simConnectActionType.Shared.SIM_RATE_DECREASE, 1),
    },

    ProfileSpecific:
    {
        // ******************** G1000 NXi ******************************
        G1000NXi: {
            PFD: {
                Volume: {
                    vol1Select: () => simConnectPost(simConnectActionType.G1000NXi.PFD_VOL1_SELECT, 1),
                    vol2Select: () => simConnectPost(simConnectActionType.G1000NXi.PFD_VOL2_SELECT, 1),
                },
                COM: {
                    select: () => simConnectPost(simConnectActionType.G1000NXi.PFD_COM_SELECT, 1),
                    swap: () => simConnectPost(simConnectActionType.G1000NXi.PFD_COM_SWAP, 1),
                },
                NAV: {
                    select: () => simConnectPost(simConnectActionType.G1000NXi.PFD_NAV_SELECT, 1),
                    swap: () => simConnectPost(simConnectActionType.G1000NXi.PFD_NAV_SWAP, 1),
                },
                CRS: {
                    select: () => simConnectPost(simConnectActionType.G1000NXi.PFD_CRS_SELECT, 1),
                },
                HEADING: {
                    select: () => simConnectPost(simConnectActionType.G1000NXi.PFD_HEADING_SELECT, 1),
                },
                Menu: {
                    directTo: () => simConnectPost(simConnectActionType.G1000NXi.PFD_DIRECTTO, 1),
                    flightPlan: () => simConnectPost(simConnectActionType.G1000NXi.PFD_FLIGHTPLAN, 1),
                    procedure: () => simConnectPost(simConnectActionType.G1000NXi.PFD_PROCEDURE, 1),
                    menu: () => simConnectPost(simConnectActionType.G1000NXi.PFD_MENU, 1),
                    clear: () => simConnectPost(simConnectActionType.G1000NXi.PFD_CLEAR, 1),
                    enter: () => simConnectPost(simConnectActionType.G1000NXi.PFD_ENTER, 1),
                },
                FMS: {
                    select: () => simConnectPost(simConnectActionType.G1000NXi.PFD_FMS_SELECT, 1),
                    upperInc: () => simConnectPost(simConnectActionType.G1000NXi.PFD_FMS_UPPER_INC, 1),
                    upperDec: () => simConnectPost(simConnectActionType.G1000NXi.PFD_FMS_UPPER_DEC, 1),
                    lowerInc: () => simConnectPost(simConnectActionType.G1000NXi.PFD_FMS_LOWER_INC, 1),
                    lowerDec: () => simConnectPost(simConnectActionType.G1000NXi.PFD_FMS_LOWER_DEC, 1),
                    upperPush: () => simConnectPost(simConnectActionType.G1000NXi.PFD_FMS_UPPER_PUSH, 1),
                },
                MAP: {
                    select: () => {
                        simConnectPost(simConnectActionType.G1000NXi.PFD_JOYSTICK_PUSH, 1);
                        setTimeout(() => simConnectPost(simConnectActionType.G1000NXi.PFD_MAP_SELECT, 1), 250);
                    },
                    rangeInc: () => simConnectPost(simConnectActionType.G1000NXi.PFD_MAP_RANGE_INCREASE, 1),
                    rangeDec: () => simConnectPost(simConnectActionType.G1000NXi.PFD_MAP_RANGE_DECREASE, 1),
                    joystickPush: () => simConnectPost(simConnectActionType.G1000NXi.PFD_JOYSTICK_PUSH, 1),
                    joystickUp: () => simConnectPost(simConnectActionType.G1000NXi.PFD_JOYSTICK_UP, 1),
                    joystickDown: () => simConnectPost(simConnectActionType.G1000NXi.PFD_JOYSTICK_DOWN, 1),
                    joystickLeft: () => simConnectPost(simConnectActionType.G1000NXi.PFD_JOYSTICK_LEFT, 1),
                    joystickRight: () => simConnectPost(simConnectActionType.G1000NXi.PFD_JOYSTICK_RIGHT, 1),
                },
                SoftKey: {
                    select: (digit) => {
                        simConnectPost(simConnectActionType.G1000NXi['PFD_SOFTKEY_' + digit], 1);
                    },
                }
            },
            MID: {
                com1mic: () => simConnectPost(simConnectActionType.G1000NXi.MID_COM_MIC_1, 1),
                com2mic: () => simConnectPost(simConnectActionType.G1000NXi.MID_COM_MIC_2, 1),
                com12swap: () => simConnectPost(simConnectActionType.G1000NXi.MID_COM_SWAP, 1),
                com1: () => simConnectPost(simConnectActionType.G1000NXi.MID_COM_1, 1),
                com2: () => simConnectPost(simConnectActionType.G1000NXi.MID_COM_2, 1),
                adf: () => simConnectPost(simConnectActionType.G1000NXi.MID_ADF, 1),
                dme: () => simConnectPost(simConnectActionType.G1000NXi.MID_DME, 1),
                nav1: () => simConnectPost(simConnectActionType.G1000NXi.MID_NAV_1, 1),
                nav2: () => simConnectPost(simConnectActionType.G1000NXi.MID_NAV_2, 1),
                aux: () => simConnectPost(simConnectActionType.G1000NXi.MID_AUX, 1),
            },
            MFD: {
                Volume: {
                    vol1Select: () => simConnectPost(simConnectActionType.G1000NXi.MFD_VOL1_SELECT, 1),
                    vol2Select: () => simConnectPost(simConnectActionType.G1000NXi.MFD_VOL2_SELECT, 1),
                },
                COM: {
                    select: () => simConnectPost(simConnectActionType.G1000NXi.MFD_COM_SELECT, 1),
                    swap: () => simConnectPost(simConnectActionType.G1000NXi.MFD_COM_SWAP, 1),
                },
                NAV: {
                    select: () => simConnectPost(simConnectActionType.G1000NXi.MFD_NAV_SELECT, 1),
                    swap: () => simConnectPost(simConnectActionType.G1000NXi.MFD_NAV_SWAP, 1),
                },
                CRS: {
                    select: () => simConnectPost(simConnectActionType.G1000NXi.MFD_CRS_SELECT, 1),
                },
                HEADING: {
                    select: () => simConnectPost(simConnectActionType.G1000NXi.MFD_HEADING_SELECT, 1),
                },
                Menu: {
                    directTo: () => simConnectPost(simConnectActionType.G1000NXi.MFD_DIRECTTO, 1),
                    flightPlan: () => simConnectPost(simConnectActionType.G1000NXi.MFD_FLIGHTPLAN, 1),
                    procedure: () => simConnectPost(simConnectActionType.G1000NXi.MFD_PROCEDURE, 1),
                    menu: () => simConnectPost(simConnectActionType.G1000NXi.MFD_MENU, 1),
                    clear: () => simConnectPost(simConnectActionType.G1000NXi.MFD_CLEAR, 1),
                    enter: () => simConnectPost(simConnectActionType.G1000NXi.MFD_ENTER, 1),
                },
                FMS: {
                    select: () => simConnectPost(simConnectActionType.G1000NXi.MFD_FMS_SELECT, 1),
                    upperInc: () => simConnectPost(simConnectActionType.G1000NXi.MFD_FMS_UPPER_INC, 1),
                    upperDec: () => simConnectPost(simConnectActionType.G1000NXi.MFD_FMS_UPPER_DEC, 1),
                    lowerInc: () => simConnectPost(simConnectActionType.G1000NXi.MFD_FMS_LOWER_INC, 1),
                    lowerDec: () => simConnectPost(simConnectActionType.G1000NXi.MFD_FMS_LOWER_DEC, 1),
                    upperPush: () => simConnectPost(simConnectActionType.G1000NXi.MFD_FMS_UPPER_PUSH, 1),
                },
                MAP: {
                    select: () => {
                        simConnectPost(simConnectActionType.G1000NXi.MFD_JOYSTICK_PUSH, 1);
                        setTimeout(() => simConnectPost(simConnectActionType.G1000NXi.MFD_MAP_SELECT, 1), 250);
                    },
                    rangeInc: () => simConnectPost(simConnectActionType.G1000NXi.MFD_MAP_RANGE_INCREASE, 1),
                    rangeDec: () => simConnectPost(simConnectActionType.G1000NXi.MFD_MAP_RANGE_DECREASE, 1),
                    joystickPush: () => simConnectPost(simConnectActionType.G1000NXi.MFD_JOYSTICK_PUSH, 1),
                    joystickUp: () => simConnectPost(simConnectActionType.G1000NXi.MFD_JOYSTICK_UP, 1),
                    joystickDown: () => simConnectPost(simConnectActionType.G1000NXi.MFD_JOYSTICK_DOWN, 1),
                    joystickLeft: () => simConnectPost(simConnectActionType.G1000NXi.MFD_JOYSTICK_LEFT, 1),
                    joystickRight: () => simConnectPost(simConnectActionType.G1000NXi.MFD_JOYSTICK_RIGHT, 1),
                },
                SoftKey: {
                    select: (digit) => {
                        simConnectPost(simConnectActionType.G1000NXi['MFD_SOFTKEY_' + digit], 1);
                    },
                }
            }
        }
    }
}