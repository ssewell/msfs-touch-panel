import { Subject } from 'msfssdk';
import { APLockType } from 'msfssdk/instruments';
import { VNavApproachGuidanceMode, VNavPathMode } from 'msfssdk/autopilot';
/** The state of the altitude alerter. */
export var AltAlertState;
(function (AltAlertState) {
    /** Disabled Mode */
    AltAlertState[AltAlertState["DISABLED"] = 0] = "DISABLED";
    /** Armed Mode. */
    AltAlertState[AltAlertState["ARMED"] = 1] = "ARMED";
    /** Within 1000 feet of preselected altitude. */
    AltAlertState[AltAlertState["WITHIN_1000"] = 2] = "WITHIN_1000";
    /** Within 200 feet of preselected altitude. */
    AltAlertState[AltAlertState["WITHIN_200"] = 3] = "WITHIN_200";
    /** Captured the preselected altitude. */
    AltAlertState[AltAlertState["CAPTURED"] = 4] = "CAPTURED";
    /**Outside of the 200ft deviation zone */
    AltAlertState[AltAlertState["DEVIATION_200"] = 5] = "DEVIATION_200";
})(AltAlertState || (AltAlertState = {}));
/** Class to manage the altitude alerter on the PFD Altimeter */
export class AltitudeAlertController {
    /**
     * Instantiates an instance of the AltitudeAlertController
     * @param bus is the event bus
     */
    constructor(bus) {
        this.bus = bus;
        this.isOnGround = false;
        this.alerterState = Subject.create(AltAlertState.DISABLED);
        this.approachActive = false;
        this.altitudeLocked = false;
        this.altitude = 0;
        this.selectedAltitude = 0;
        this.targetAltitude = 0;
        const adc = this.bus.getSubscriber();
        const ap = this.bus.getSubscriber();
        const vnav = this.bus.getSubscriber();
        const g1000 = this.bus.getSubscriber();
        adc.on('on_ground').handle((g) => { this.isOnGround = g; });
        vnav.on('vnavApproachMode').whenChanged().handle((mode) => {
            switch (mode) {
                case VNavApproachGuidanceMode.GSActive:
                case VNavApproachGuidanceMode.GPActive:
                    this.altitudeLocked = false;
                    this.approachActive = true;
                    break;
                default:
                    this.approachActive = false;
            }
        });
        vnav.on('vnavPathMode').whenChanged().handle((mode) => {
            if (mode === VNavPathMode.PathActive) {
                this.altitudeLocked = false;
                this.approachActive = false;
            }
        });
        // vnav.on('vnavAltCaptureType').whenChanged().handle(type => this.onVNavUpdate(this.vnavPathMode, type, this.approachMode));
        ap.on('ap_lock_set').whenChanged().handle((lock) => {
            switch (lock) {
                case APLockType.Alt:
                    this.altitudeLocked = true;
                    this.approachActive = false;
                    break;
                case APLockType.Flc:
                case APLockType.Vs:
                case APLockType.Glideslope:
                case APLockType.Pitch:
                    this.altitudeLocked = false;
                    this.approachActive = false;
                    break;
            }
        });
        ap.on('alt_select').whenChanged().handle(() => {
            this.alerterState.set(AltAlertState.ARMED);
        });
        g1000.on('alt_alert_cancel').handle((d) => {
            if (d) {
                this.alerterState.set(AltAlertState.DISABLED);
            }
        });
    }
    /**
     * A method called to update the altitude alerter
     */
    updateAltitudeAlerter() {
        if (this.isOnGround || this.approachActive) {
            this.alerterState.set(AltAlertState.DISABLED);
            return;
        }
        const state = this.alerterState.get();
        if (state === AltAlertState.ARMED) {
            this.targetAltitude = this.selectedAltitude;
        }
        const deltaAlt = Math.abs(this.targetAltitude - this.altitude);
        switch (state) {
            case AltAlertState.ARMED:
                if (deltaAlt < 210) {
                    this.alerterState.set(AltAlertState.WITHIN_200);
                }
                else if (deltaAlt < 1010) {
                    this.alerterState.set(AltAlertState.WITHIN_1000);
                }
                break;
            case AltAlertState.WITHIN_1000:
                if (this.targetAltitude != this.selectedAltitude) {
                    this.alerterState.set(AltAlertState.ARMED);
                }
                else if (deltaAlt < 210) {
                    this.alerterState.set(AltAlertState.WITHIN_200);
                }
                break;
            case AltAlertState.WITHIN_200:
                if (this.targetAltitude !== this.selectedAltitude) {
                    this.alerterState.set(AltAlertState.ARMED);
                }
                else if (deltaAlt < 100) {
                    this.alerterState.set(AltAlertState.CAPTURED);
                }
                break;
            case AltAlertState.CAPTURED:
                if (this.targetAltitude != this.selectedAltitude && !this.altitudeLocked) {
                    this.alerterState.set(AltAlertState.ARMED);
                }
                else if (deltaAlt > 210 && this.altitudeLocked) {
                    this.alerterState.set(AltAlertState.DEVIATION_200);
                }
                break;
            case AltAlertState.DEVIATION_200:
                if (this.targetAltitude != this.selectedAltitude && !this.altitudeLocked) {
                    this.alerterState.set(AltAlertState.ARMED);
                }
                else if (deltaAlt < 210) {
                    this.alerterState.set(AltAlertState.WITHIN_200);
                }
                break;
        }
    }
}
