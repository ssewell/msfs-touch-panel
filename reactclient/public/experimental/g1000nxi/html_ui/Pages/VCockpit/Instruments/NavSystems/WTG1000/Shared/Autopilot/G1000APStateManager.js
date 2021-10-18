import { SimVarValueType } from 'msfssdk/data';
import { NavSourceType } from 'msfssdk/instruments';
import { APLateralModes, APModeType, APStateManager, APVerticalModes } from 'msfssdk/autopilot';
/**
 * A G1000 NXi autopilot state manager.
 */
export class G1000APStateManager extends APStateManager {
    constructor() {
        super(...arguments);
        this.vsLastPressed = 0;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAPListenerRegistered() {
        super.onAPListenerRegistered();
        const hEvent = this.bus.getSubscriber();
        hEvent.on('hEvent').handle((e) => {
            if (e === 'AS1000_VNAV_TOGGLE') {
                this.toggleVnav();
            }
        });
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    setupKeyIntercepts() {
        //alt modes
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_ALT_HOLD', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_ALT_HOLD_ON', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_ALT_HOLD_OFF', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_PANEL_ALTITUDE_HOLD', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_PANEL_ALTITUDE_ON', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_PANEL_ALTITUDE_OFF', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_PANEL_ALTITUDE_SET', 1);
        //vs modes
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_PANEL_VS_HOLD', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_PANEL_VS_ON', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_PANEL_VS_OFF', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_PANEL_VS_SET', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_VS_HOLD', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_VS_ON', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_VS_OFF', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_VS_SET', 1);
        //pitch modes
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_ATT_HOLD', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_ATT_HOLD_ON', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_ATT_HOLD_OFF', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_PITCH_LEVELER', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_PITCH_LEVELER_ON', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_PITCH_LEVELER_OFF', 1);
        //roll modes
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_BANK_HOLD', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_BANK_HOLD_ON', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_BANK_HOLD_OFF', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_WING_LEVELER', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_WING_LEVELER_ON', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_WING_LEVELER_OFF', 1);
        //flc modes
        Coherent.call('INTERCEPT_KEY_EVENT', 'FLIGHT_LEVEL_CHANGE', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'FLIGHT_LEVEL_CHANGE_ON', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'FLIGHT_LEVEL_CHANGE_OFF', 1);
        //nav modes
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_NAV1_HOLD', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_NAV1_HOLD_ON', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_NAV1_HOLD_OFF', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_NAV_SELECT_SET', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'TOGGLE_GPS_DRIVES_NAV1', 1);
        //hdg modes
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_HDG_HOLD', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_HDG_HOLD_ON', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_HDG_HOLD_OFF', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_PANEL_HEADING_HOLD', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_PANEL_HEADING_ON', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_PANEL_HEADING_OFF', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_PANEL_HEADING_SET', 1);
        //bank modes
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_BANK_HOLD', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_BANK_HOLD_ON', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_BANK_HOLD_OFF', 1);
        //appr modes
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_LOC_HOLD', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_LOC_HOLD_ON', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_LOC_HOLD_OFF', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_APR_HOLD', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_APR_HOLD_ON', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_APR_HOLD_OFF', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_BC_HOLD', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_BC_HOLD_ON', 1);
        Coherent.call('INTERCEPT_KEY_EVENT', 'AP_BC_HOLD_OFF', 1);
        //baro set intercept
        Coherent.call('INTERCEPT_KEY_EVENT', 'BAROMETRIC', 0);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    handleKeyIntercepted(key, index, value) {
        const controlEventPub = this.bus.getPublisher();
        switch (key) {
            case 'AP_NAV1_HOLD':
                this.sendApModeEvent(APModeType.LATERAL, APLateralModes.NAV);
                break;
            case 'AP_NAV1_HOLD_ON':
                this.sendApModeEvent(APModeType.LATERAL, APLateralModes.NAV, true);
                break;
            case 'AP_NAV1_HOLD_OFF':
                this.sendApModeEvent(APModeType.LATERAL, APLateralModes.NAV, false);
                break;
            case 'AP_LOC_HOLD':
                this.sendApModeEvent(APModeType.LATERAL, APLateralModes.LOC);
                break;
            case 'AP_LOC_HOLD_ON':
                this.sendApModeEvent(APModeType.LATERAL, APLateralModes.LOC, true);
                break;
            case 'AP_LOC_HOLD_OFF':
                this.sendApModeEvent(APModeType.LATERAL, APLateralModes.LOC, false);
                break;
            case 'AP_APR_HOLD':
                this.sendApModeEvent(APModeType.APPROACH);
                break;
            case 'AP_APR_HOLD_ON':
                this.sendApModeEvent(APModeType.APPROACH, undefined, true);
                break;
            case 'AP_APR_HOLD_OFF':
                this.sendApModeEvent(APModeType.APPROACH, undefined, false);
                break;
            case 'AP_BC_HOLD':
                this.sendApModeEvent(APModeType.LATERAL, APLateralModes.BC);
                break;
            case 'AP_BC_HOLD_ON':
                this.sendApModeEvent(APModeType.LATERAL, APLateralModes.BC, true);
                break;
            case 'AP_BC_HOLD_OFF':
                this.sendApModeEvent(APModeType.LATERAL, APLateralModes.BC, false);
                break;
            case 'AP_HDG_HOLD':
            case 'AP_PANEL_HEADING_HOLD':
                this.sendApModeEvent(APModeType.LATERAL, APLateralModes.HEADING);
                break;
            case 'AP_PANEL_HEADING_ON':
            case 'AP_HDG_HOLD_ON':
                this.sendApModeEvent(APModeType.LATERAL, APLateralModes.HEADING, true);
                break;
            case 'AP_PANEL_HEADING_OFF':
            case 'AP_HDG_HOLD_OFF':
                this.sendApModeEvent(APModeType.LATERAL, APLateralModes.HEADING, false);
                break;
            case 'AP_PANEL_HEADING_SET':
                if (value !== undefined) {
                    this.sendApModeEvent(APModeType.LATERAL, APLateralModes.HEADING, value === 1 ? true : false);
                }
                break;
            case 'AP_BANK_HOLD':
            case 'AP_BANK_HOLD_ON':
                this.sendApModeEvent(APModeType.LATERAL, APLateralModes.ROLL, true);
                break;
            case 'AP_WING_LEVELER':
                this.sendApModeEvent(APModeType.LATERAL, APLateralModes.LEVEL);
                break;
            case 'AP_WING_LEVELER_ON':
                this.sendApModeEvent(APModeType.LATERAL, APLateralModes.LEVEL, true);
                break;
            case 'AP_WING_LEVELER_OFF':
                this.sendApModeEvent(APModeType.LATERAL, APLateralModes.LEVEL, false);
                break;
            case 'AP_PANEL_VS_HOLD':
            case 'AP_VS_HOLD':
                this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.VS);
                break;
            case 'AP_PANEL_VS_ON':
            case 'AP_VS_ON':
                this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.VS, true);
                break;
            case 'AP_PANEL_VS_OFF':
            case 'AP_VS_OFF':
                this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.VS, false);
                break;
            case 'AP_PANEL_VS_SET':
            case 'AP_VS_SET':
                // TODO Remove this when the Bravo default mapping is fixed.
                if (value !== undefined && this.vsLastPressed < Date.now() - 100) {
                    this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.VS, value === 1 ? true : false);
                }
                this.vsLastPressed = Date.now();
                break;
            case 'AP_ALT_HOLD':
            case 'AP_PANEL_ALTITUDE_HOLD':
                this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.ALT);
                break;
            case 'AP_ALT_HOLD_ON':
            case 'AP_PANEL_ALTITUDE_ON':
                this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.ALT, true);
                break;
            case 'AP_ALT_HOLD_OFF':
            case 'AP_PANEL_ALTITUDE_OFF':
                this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.ALT, false);
                break;
            case 'AP_PANEL_ALTITUDE_SET':
                if (value !== undefined) {
                    this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.ALT, value === 1 ? true : false);
                }
                break;
            case 'FLIGHT_LEVEL_CHANGE':
                this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.FLC);
                break;
            case 'FLIGHT_LEVEL_CHANGE_ON':
                this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.FLC, true);
                break;
            case 'FLIGHT_LEVEL_CHANGE_OFF':
                this.sendApModeEvent(APModeType.VERTICAL, APVerticalModes.FLC, false);
                break;
            case 'AP_NAV_SELECT_SET':
                if (value !== undefined && value >= 1 && value <= 2) {
                    controlEventPub.pub('cdi_src_set', { type: NavSourceType.Nav, index: value }, true);
                }
                break;
            case 'TOGGLE_GPS_DRIVES_NAV1':
                controlEventPub.pub('cdi_src_gps_toggle', true, true);
                break;
            case 'BAROMETRIC':
                controlEventPub.pub('baro_set', true, true);
                break;
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onBeforeInitialize() {
        SimVar.SetSimVarValue('L:WT1000_AP_G1000_INSTALLED', SimVarValueType.Bool, true);
    }
}
