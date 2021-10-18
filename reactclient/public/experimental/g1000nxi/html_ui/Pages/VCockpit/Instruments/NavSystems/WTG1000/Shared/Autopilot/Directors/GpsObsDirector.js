/// <reference types="msfstypes/JS/simvar" />
import { GeoCircle, GeoPoint, NavMath, Subject, UnitType, LinearServo } from 'msfssdk';
import { SimVarValueType } from 'msfssdk/data';
import { DirectorState } from 'msfssdk/autopilot';
import { LNavVars } from '../LNavSimVars';
/**
 * A director that handles OBS Lateral Navigation.
 */
export class GpsObsDirector {
    /**
     * Creates an instance of the GPS OBS Director.
     * @param bus The event bus to use with this instance.
     * @param aircraftState Is the current aircraft state.
     */
    constructor(bus, aircraftState) {
        this.bus = bus;
        this.aircraftState = aircraftState;
        this.obsSetting = 0;
        this.obsActive = false;
        this.xtk = undefined;
        this.magvar = 0;
        this.obsLeg = Subject.create(undefined);
        this.geoPointCache = [new GeoPoint(0, 0)];
        this.geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];
        this.currentBankRef = 0;
        this.bankServo = new LinearServo(10);
        const hEvent = bus.getSubscriber();
        hEvent.on('hEvent').handle((e) => {
            if (e === 'AS1000_PFD_CRS_INC' || e === 'AS1000_MFD_CRS_INC') {
                this.incrementObs(true);
            }
            else if (e === 'AS1000_PFD_CRS_DEC' || e === 'AS1000_MFD_CRS_DEC') {
                this.incrementObs(false);
            }
        });
        const nav = this.bus.getSubscriber();
        nav.on('gps_obs_active').whenChanged().handle((state) => {
            var _a, _b;
            this.obsActive = state;
            if (this.obsActive) {
                const dtk = (_b = (_a = this.obsLeg.get()) === null || _a === void 0 ? void 0 : _a.calculated) === null || _b === void 0 ? void 0 : _b.initialDtk;
                if (dtk !== undefined) {
                    this.obsSetting = dtk;
                }
                else if (this.obsSetting < 0 || this.obsSetting > 360) {
                    this.obsSetting = 0;
                }
                SimVar.SetSimVarValue('K:GPS_OBS_SET', SimVarValueType.Degree, this.obsSetting);
            }
            if (!this.obsActive) {
                this.deactivate();
            }
        });
        nav.on('gps_obs_value').whenChanged().handle((value) => {
            this.obsSetting = value;
        });
        const adc = this.bus.getSubscriber();
        adc.on('magvar').whenChanged().handle((v) => {
            this.magvar = v;
        });
        this.state = DirectorState.Inactive;
    }
    /**
     * Activates the LNAV director.
     */
    activate() {
        this.state = DirectorState.Active;
    }
    /**
     * Arms the LNAV director.
     */
    arm() {
        this.state = DirectorState.Armed;
    }
    /**
     * Deactivates the LNAV director.
     */
    deactivate() {
        if (this.onDeactivate !== undefined) {
            this.onDeactivate();
        }
        this.state = DirectorState.Inactive;
    }
    /**
     * Increments or Decrements the OBS Setting for GPS if in GPS OBS MODE.
     * @param increment is whether to increment (or decrement) the value.
     */
    incrementObs(increment) {
        if (this.obsActive) {
            if (increment) {
                SimVar.SetSimVarValue('K:GPS_OBS_INC', SimVarValueType.Number, 0);
            }
            else {
                SimVar.SetSimVarValue('K:GPS_OBS_DEC', SimVarValueType.Number, 0);
            }
        }
    }
    /**
     * Updates the lateral director.
     */
    update() {
        if (this.obsActive) {
            if (this.obsSetting >= 0 && this.obsSetting <= 360) {
                SimVar.SetSimVarValue(LNavVars.DTK, 'degrees', Math.floor(this.obsSetting));
            }
            this.getObsXtk();
            if (this.xtk !== undefined) {
                SimVar.SetSimVarValue(LNavVars.XTK, 'nautical miles', this.xtk);
            }
        }
        if (this.state === DirectorState.Active) {
            this.navigateFlightPath();
        }
    }
    /**
     * Gets the current obs xtk.
     */
    getObsXtk() {
        var _a, _b;
        const leg = this.obsLeg.get();
        if (((_a = leg === null || leg === void 0 ? void 0 : leg.calculated) === null || _a === void 0 ? void 0 : _a.endLat) !== undefined && ((_b = leg === null || leg === void 0 ? void 0 : leg.calculated) === null || _b === void 0 ? void 0 : _b.endLon) !== undefined) {
            const start = this.geoPointCache[0].set(leg.calculated.endLat, leg.calculated.endLon);
            const obsTrue = NavMath.normalizeHeading(this.obsSetting + this.magvar);
            const path = this.geoCircleCache[0].setAsGreatCircle(start, obsTrue);
            this.xtk = UnitType.GA_RADIAN.convertTo(path.distance(this.aircraftState.pos), UnitType.NMILE);
        }
        else {
            this.xtk = undefined;
        }
    }
    /**
     * Navigates the provided leg flight path.
     */
    navigateFlightPath() {
        if (this.xtk === undefined) {
            this.deactivate();
            return;
        }
        const absInterceptAngle = Math.min(Math.pow(Math.abs(this.xtk) * 20, 1.35) + (Math.abs(this.xtk) * 50), 45);
        const interceptAngle = this.xtk < 0 ? absInterceptAngle : -1 * absInterceptAngle;
        const obsTrue = NavMath.normalizeHeading(this.obsSetting + this.magvar);
        const bankAngle = this.desiredBank(NavMath.normalizeHeading(obsTrue + interceptAngle), this.xtk);
        if (this.state === DirectorState.Active) {
            this.setBank(bankAngle);
        }
    }
    /**
     * Tries to activate when armed.
     * @returns whether OBS can activate
     */
    canActivate() {
        if (this.xtk !== undefined && Math.abs(this.xtk) < 1) {
            return true;
        }
        return false;
    }
    /**
     * Gets a desired bank from a desired track.
     * @param desiredTrack The desired track.
     * @param xtk The cross track.
     * @returns The desired bank angle.
     */
    desiredBank(desiredTrack, xtk) {
        const turnDirection = NavMath.getTurnDirection(this.aircraftState.track, desiredTrack);
        const headingDiff = Math.abs(NavMath.diffAngle(this.aircraftState.track, desiredTrack));
        let baseBank = Math.min(1.25 * headingDiff, 25);
        if (baseBank <= 2.5) {
            baseBank = NavMath.clamp(xtk * 100, -2.5, 2.5);
        }
        else {
            baseBank *= (turnDirection === 'left' ? 1 : -1);
        }
        return baseBank;
    }
    /**
     * Sets the desired AP bank angle.
     * @param bankAngle The desired AP bank angle.
     */
    setBank(bankAngle) {
        if (isFinite(bankAngle)) {
            this.currentBankRef = this.bankServo.drive(this.currentBankRef, bankAngle);
            SimVar.SetSimVarValue('AUTOPILOT BANK HOLD REF', 'degrees', this.currentBankRef);
        }
    }
}
