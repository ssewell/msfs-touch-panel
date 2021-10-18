import { APLateralModes, APVerticalModes } from 'msfssdk/autopilot';
import { LNavDirector } from './Directors/LNavDirector';
import { VNavDirector } from './Directors/VNavDirector';
import { VNavPathCalculator } from './VNavPathCalculator';
import { APAltCapDirector } from './Directors/APAltCapDirector';
import { APAltDirector } from './Directors/APAltDirector';
import { APFLCDirector } from './Directors/APFLCDirector';
import { APHdgDirector } from './Directors/APHdgDirector';
import { APPitchDirector } from './Directors/APPitchDirector';
import { APRollDirector } from './Directors/APRollDirector';
import { APVSDirector } from './Directors/APVSDirector';
import { APNavDirector } from './Directors/APNavDirector';
import { APGPDirector } from './Directors/APGPDirector';
import { APGSDirector } from './Directors/APGSDirector';
import { G1000NavToNavManager } from './G1000NavToNavManager';
import { APLvlDirector } from './Directors/APLvlDirector';
/**
 * A G1000 NXi autopilot configuration.
 */
export class G1000APConfig {
    /**
     * Instantiates the AP Config for the Autopilot.
     * @param bus is an instance of the Event Bus.
     * @param flightPlanner is an instance of the flight planner.
     */
    constructor(bus, flightPlanner) {
        this.bus = bus;
        this.flightPlanner = flightPlanner;
        this.defaultLateralMode = APLateralModes.ROLL;
        this.defaultVerticalMode = APVerticalModes.PITCH;
    }
    /** @inheritdoc */
    createHeadingDirector(apValues) {
        return new APHdgDirector(this.bus, apValues);
    }
    /** @inheritdoc */
    createRollDirector() {
        return new APRollDirector(this.bus);
    }
    /** @inheritdoc */
    createWingLevelerDirector() {
        return new APLvlDirector(this.bus);
    }
    /** @inheritdoc */
    createGpssDirector() {
        return new LNavDirector(this.bus, this.flightPlanner);
    }
    /** @inheritdoc */
    createVorDirector(apValues) {
        return new APNavDirector(this.bus, apValues, APLateralModes.VOR);
    }
    /** @inheritdoc */
    createLocDirector(apValues) {
        return new APNavDirector(this.bus, apValues, APLateralModes.LOC);
    }
    /** @inheritdoc */
    createBcDirector() {
        return undefined;
    }
    /** @inheritdoc */
    createPitchDirector(apValues) {
        return new APPitchDirector(this.bus, apValues);
    }
    /** @inheritdoc */
    createVsDirector(apValues) {
        return new APVSDirector(this.bus, apValues);
    }
    /** @inheritdoc */
    createFlcDirector(apValues) {
        return new APFLCDirector(this.bus, apValues);
    }
    /** @inheritdoc */
    createAltHoldDirector(apValues) {
        return new APAltDirector(this.bus, apValues);
    }
    /** @inheritdoc */
    createAltCapDirector(apValues) {
        return new APAltCapDirector(this.bus, apValues);
    }
    /** @inheritdoc */
    createVNavDirector(apValues) {
        var _a;
        return (_a = this.vnavDirector) !== null && _a !== void 0 ? _a : (this.vnavDirector = new VNavDirector(this.bus, this.flightPlanner, new VNavPathCalculator(this.bus, this.flightPlanner), apValues));
    }
    /** @inheritdoc */
    createGpDirector(apValues) {
        return new APGPDirector(this.bus, apValues, this.createVNavDirector(apValues));
    }
    /** @inheritdoc */
    createGsDirector(apValues) {
        return new APGSDirector(this.bus, apValues);
    }
    /** @inheritdoc */
    createNavToNavManager(apValues) {
        return new G1000NavToNavManager(this.bus, apValues);
    }
}
