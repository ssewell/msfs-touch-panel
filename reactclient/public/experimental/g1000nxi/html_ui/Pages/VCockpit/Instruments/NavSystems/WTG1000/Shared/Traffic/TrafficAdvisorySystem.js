import { UnitType } from 'msfssdk';
import { AbstractTCASIntruder, AbstractTCASSensitivity, TCAS, TCASAlertLevel, TCASOperatingMode } from 'msfssdk/traffic';
import { CDIScaleLabel } from '../Autopilot/LNavSimVars';
import { TrafficOperatingModeSetting, TrafficUserSettings } from './TrafficUserSettings';
/**
 * Traffic Advisory System for the G1000.
 */
export class TrafficAdvisorySystem extends TCAS {
    constructor() {
        super(...arguments);
        this.operatingModeSetting = TrafficUserSettings.getManager(this.bus).getSetting('trafficOperatingMode');
        this.cdiScalingLabel = CDIScaleLabel.Enroute;
        this.operatingModeChangeTimer = null;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    createSensitivity() {
        return new TASSensitivity();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    init() {
        super.init();
        this.bus.getSubscriber().on('lnavCdiScalingLabel').whenChanged().handle(label => { this.cdiScalingLabel = label; });
        this.bus.getSubscriber().on('trafficOperatingMode').whenChanged().handle((value) => {
            this.operatingModeSub.set(value === TrafficOperatingModeSetting.Operating ? TCASOperatingMode.TAOnly : TCASOperatingMode.Standby);
        });
        this.operatingModeSub.sub(() => this.cancelOperatingModeChange());
        this.bus.getSubscriber().on('on_ground').whenChanged().handle(this.onGroundChanged.bind(this));
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    createIntruderEntry(contact) {
        return new TASIntruder(contact);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    updateIntruderAlertLevel(simTime, intruder) {
        intruder.updateAlertLevel(simTime, this.isOwnAirplaneOnGround);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    updateSensitivity() {
        // TODO: Add radar alt data for planes that have it
        this.sensitivity.update(this.ownAirplaneSubs.altitude.get(), this.cdiScalingLabel);
    }
    /**
     * A callback which is called when whether own airplane is on the ground changes.
     * @param isOnGround Whether own airplane is on the ground.
     */
    onGroundChanged(isOnGround) {
        this.cancelOperatingModeChange();
        if (isOnGround) {
            if (this.operatingModeSetting.value === TrafficOperatingModeSetting.Operating) {
                this.scheduleOperatingModeChange(TrafficOperatingModeSetting.Standby, TrafficAdvisorySystem.LANDING_STANDBY_DELAY);
            }
        }
        else {
            if (this.operatingModeSetting.value === TrafficOperatingModeSetting.Standby) {
                this.scheduleOperatingModeChange(TrafficOperatingModeSetting.Operating, TrafficAdvisorySystem.TAKEOFF_OPER_DELAY);
            }
        }
    }
    /**
     * Schedules a delayed operating mode change.
     * @param toMode The target operating mode.
     * @param delay The delay, in milliseconds.
     */
    scheduleOperatingModeChange(toMode, delay) {
        this.cancelOperatingModeChange();
        this.operatingModeChangeTimer = setTimeout(() => {
            this.operatingModeSetting.value = toMode;
            this.operatingModeChangeTimer = null;
        }, delay);
    }
    /**
     * Cancels the currently scheduled operating mode change, if one exists.
     */
    cancelOperatingModeChange() {
        if (this.operatingModeChangeTimer === null) {
            return;
        }
        clearTimeout(this.operatingModeChangeTimer);
        this.operatingModeChangeTimer = null;
    }
}
TrafficAdvisorySystem.TAKEOFF_OPER_DELAY = 8000; // milliseconds
TrafficAdvisorySystem.LANDING_STANDBY_DELAY = 24000; // milliseconds
/**
 * An intruder tracked by the the G1000 TAS.
 */
class TASIntruder extends AbstractTCASIntruder {
    constructor() {
        super(...arguments);
        this.lastHorizontalSep = UnitType.NMILE.createNumber(0);
        this.lastVerticalSep = UnitType.FOOT.createNumber(0);
        this.taOnTime = 0;
        this.taOffTime = 0;
    }
    /**
     * Updates this intruder's assigned alert level.
     * @param simTime The current sim time.
     * @param isOnGround Whether the own airplane is on the ground.
     */
    updateAlertLevel(simTime, isOnGround) {
        if (!this.isPredictionValid) {
            this.alertLevel.set(TCASAlertLevel.None);
        }
        let isTA = false;
        const currentTime = simTime;
        const currentAlertLevel = this.alertLevel.get();
        if (isOnGround) {
            // suppress traffic advisories while own aircraft is on the ground
            if (currentAlertLevel === TCASAlertLevel.TrafficAdvisory) {
                this.taOffTime = currentTime;
            }
        }
        else if (this.tcaNorm <= 1) {
            if (currentAlertLevel !== TCASAlertLevel.TrafficAdvisory) {
                const dt = currentTime - this.taOffTime;
                if (dt >= TASIntruder.TA_ON_HYSTERESIS) {
                    isTA = true;
                    this.taOnTime = currentTime;
                }
            }
            else {
                isTA = true;
            }
        }
        else if (currentAlertLevel === TCASAlertLevel.TrafficAdvisory) {
            const dt = currentTime - this.taOnTime;
            if (dt >= TASIntruder.TA_OFF_HYSTERESIS) {
                this.taOffTime = currentTime;
            }
            else {
                isTA = true;
            }
        }
        if (isTA) {
            this.alertLevel.set(TCASAlertLevel.TrafficAdvisory);
        }
        else {
            this.updateNonTAAlertLevel(simTime);
        }
    }
    /**
     * Updates this intruder's assigned alert level, assuming it does not quality for a traffic advisory.
     * @param simTime The current sim time.
     */
    updateNonTAAlertLevel(simTime) {
        this.predictSeparation(simTime, this.lastHorizontalSep, this.lastVerticalSep);
        if (this.lastHorizontalSep.number <= 6 // 6 nm
            && this.lastVerticalSep.number <= 1200 // 1200 ft
        ) {
            this.alertLevel.set(TCASAlertLevel.ProximityAdvisory);
        }
        else {
            this.alertLevel.set(TCASAlertLevel.None);
        }
    }
}
TASIntruder.TA_ON_HYSTERESIS = 2000; // ms
TASIntruder.TA_OFF_HYSTERESIS = 8000; // ms
/**
 * Sensitivity settings for the the G1000 TAS.
 */
class TASSensitivity extends AbstractTCASSensitivity {
    /**
     * Updates the sensitivity level.
     * @param altitude The indicated altitude of the own airplane.
     * @param cdiScalingLabel The CDI scaling sensitivity of the own airplane.
     * @param radarAltitude The radar altitude of the own airplane.
     */
    update(altitude, cdiScalingLabel, radarAltitude) {
        const altFeet = altitude.asUnit(UnitType.FOOT);
        const radarAltFeet = radarAltitude === null || radarAltitude === void 0 ? void 0 : radarAltitude.asUnit(UnitType.FOOT);
        let isApproach = false;
        switch (cdiScalingLabel) {
            case CDIScaleLabel.LNav:
            case CDIScaleLabel.LNavPlusV:
            case CDIScaleLabel.LNavVNav:
            case CDIScaleLabel.LP:
            case CDIScaleLabel.LPPlusV:
            case CDIScaleLabel.LPV:
            case CDIScaleLabel.MissedApproach:
                isApproach = true;
        }
        let level;
        if ((radarAltFeet === undefined || radarAltFeet > 2350)
            && (!isApproach && cdiScalingLabel !== CDIScaleLabel.Terminal)) {
            if (altFeet > 42000) {
                level = 6;
            }
            else if (altFeet > 20000) {
                level = 5;
            }
            else if (altFeet > 10000) {
                level = 4;
            }
            else if (altFeet > 5000) {
                level = 3;
            }
            else {
                level = 2;
            }
        }
        else if (cdiScalingLabel === CDIScaleLabel.Terminal
            || (radarAltFeet !== undefined && radarAltFeet > 1000)) {
            level = 1;
        }
        else {
            level = 0;
        }
        const parameters = TASSensitivity.LEVELS[level];
        this.lookaheadTime.set(parameters.lookaheadTime);
        this.protectedRadius.set(parameters.protectedRadius);
        this.protectedHeight.set(parameters.protectedHeight);
    }
}
TASSensitivity.LEVELS = [
    {
        lookaheadTime: 20,
        protectedRadius: 0.2,
        protectedHeight: 850
    },
    {
        lookaheadTime: 25,
        protectedRadius: 0.2,
        protectedHeight: 850
    },
    {
        lookaheadTime: 30,
        protectedRadius: 0.35,
        protectedHeight: 850
    },
    {
        lookaheadTime: 40,
        protectedRadius: 0.55,
        protectedHeight: 850
    },
    {
        lookaheadTime: 45,
        protectedRadius: 0.8,
        protectedHeight: 850
    },
    {
        lookaheadTime: 48,
        protectedRadius: 1.1,
        protectedHeight: 850
    },
    {
        lookaheadTime: 48,
        protectedRadius: 1.1,
        protectedHeight: 1200
    }
];
