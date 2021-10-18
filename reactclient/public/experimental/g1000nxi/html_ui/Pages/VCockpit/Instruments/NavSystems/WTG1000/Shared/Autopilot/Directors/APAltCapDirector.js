/// <reference types="msfstypes/JS/simvar" />
import { MathUtils, UnitType } from 'msfssdk';
import { SimVarValueType } from 'msfssdk/data';
import { DirectorState } from 'msfssdk/autopilot';
/**
 * An altitude capture autopilot director.
 */
export class APAltCapDirector {
    /**
     * Creates an instance of the LateralDirector.
     * @param bus The event bus to use with this instance.
     * @param apValues are the ap selected values for the autopilot.
     */
    constructor(bus, apValues) {
        this.bus = bus;
        this.apValues = apValues;
        this.groundSpeed = 0;
        this.capturedAltitude = 0;
        this.indicatedAltitude = 0;
        this.verticalSpeed = 0;
        this.initialFpa = 0;
        this.selectedAltitude = 0;
        this.state = DirectorState.Inactive;
        this.bus.getSubscriber().on('ground_speed').withPrecision(0).handle((g) => {
            this.groundSpeed = g;
        });
        const adc = this.bus.getSubscriber();
        adc.on('alt').withPrecision(0).handle((alt) => {
            this.indicatedAltitude = alt;
        });
        adc.on('vs').withPrecision(0).handle((vs) => {
            this.verticalSpeed = vs;
        });
        this.apValues.capturedAltitude.sub((cap) => {
            this.capturedAltitude = Math.round(cap);
        });
        this.apValues.selectedAltitude.sub((alt) => {
            this.selectedAltitude = alt;
        });
    }
    /**
     * Activates this director.
     */
    activate() {
        this.state = DirectorState.Active;
        if (this.onActivate !== undefined) {
            this.onActivate();
        }
        this.setCaptureFpa(this.verticalSpeed);
        SimVar.SetSimVarValue('AUTOPILOT ALTITUDE LOCK', 'Bool', true);
    }
    /**
     * Arms this director.
     * This director has no armed mode, so it activates immediately.
     */
    arm() {
        this.state = DirectorState.Armed;
        if (this.onArm !== undefined) {
            this.onArm();
        }
    }
    /**
     * Deactivates this director.
     * @param captured is whether the altitude was captured.
     */
    deactivate(captured = false) {
        this.state = DirectorState.Inactive;
        if (!captured) {
            SimVar.SetSimVarValue('AUTOPILOT ALTITUDE LOCK', 'Bool', false);
        }
        //this.capturedAltitude = 0;
    }
    /**
     * Updates this director.
     */
    update() {
        if (this.state === DirectorState.Active) {
            this.captureAltitude(this.capturedAltitude);
        }
        if (this.state === DirectorState.Armed) {
            this.tryActivate();
        }
    }
    /**
     * Attempts to activate altitude capture.
     */
    tryActivate() {
        const deviationFromTarget = Math.abs(this.selectedAltitude - this.indicatedAltitude);
        if (deviationFromTarget <= Math.abs(this.verticalSpeed / 6)) {
            this.apValues.capturedAltitude.set(Math.round(this.selectedAltitude));
            this.activate();
        }
    }
    /**
     * Holds a captured altitude.
     * @param targetAltitude is the captured targed altitude
     */
    captureAltitude(targetAltitude) {
        const altCapDeviation = this.indicatedAltitude - targetAltitude;
        const altCapPitchPercentage = Math.min(Math.abs(altCapDeviation) / 100, 1);
        const desiredPitch = (this.initialFpa * altCapPitchPercentage);
        const aoa = SimVar.GetSimVarValue('INCIDENCE ALPHA', SimVarValueType.Degree);
        const targetPitch = aoa + MathUtils.clamp(desiredPitch, -6, 6);
        this.setPitch(targetPitch);
    }
    /**
     * Sets the initial capture FPA from the current vs value when capture is initiated.
     * @param vs target vertical speed.
     */
    setCaptureFpa(vs) {
        if (Math.abs(vs) < 400) {
            const altCapDeviation = this.indicatedAltitude - this.selectedAltitude;
            vs = altCapDeviation > 0 ? -400 : 400;
        }
        this.initialFpa = this.getFpa(UnitType.NMILE.convertTo(this.groundSpeed / 60, UnitType.FOOT), vs);
    }
    /**
     * Gets a desired fpa.
     * @param distance is the distance traveled per minute.
     * @param altitude is the vertical speed per minute.
     * @returns The desired pitch angle.
     */
    getFpa(distance, altitude) {
        return UnitType.RADIAN.convertTo(Math.atan(altitude / distance), UnitType.DEGREE);
    }
    /**
     * Sets the desired AP pitch angle.
     * @param targetPitch The desired AP pitch angle.
     */
    setPitch(targetPitch) {
        if (isFinite(targetPitch)) {
            SimVar.SetSimVarValue('AUTOPILOT PITCH HOLD REF', SimVarValueType.Degree, -targetPitch);
        }
    }
}
