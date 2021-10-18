import { GeoCircle, GeoPoint, NavMath, Subject, UnitType } from 'msfssdk';
import { SimVarValueType } from 'msfssdk/data';
import { FlightPathUtils } from 'msfssdk/flightplan';
import { DirectorState, VNavMode, VNavPathMode, VNavAltCaptureType, APLateralModes, APVerticalModes } from 'msfssdk/autopilot';
import { TurnMode } from './LNavDirector';
import { VNavSimVars } from '../VNavSimVars';
import { Fms } from '../../FlightPlan/Fms';
import { AdditionalApproachType, RnavTypeFlags } from 'msfssdk/navigation';
/**
 * A VNAV path autopilot director.
 */
export class VNavDirector {
    /**
     * Creates an instance of the VNAV director.
     * @param bus The event bus to use with this instance.
     * @param flightPlanner The flight planner to use with this instance.
     * @param calculator The VNAV path calculator to use with this instance.
     * @param apValues are the autopilot ap values.
     */
    constructor(bus, flightPlanner, calculator, apValues) {
        this.bus = bus;
        this.flightPlanner = flightPlanner;
        this.calculator = calculator;
        this.apValues = apValues;
        this.mode = VNavMode.None;
        this._pathMode = VNavPathMode.None;
        this.state = DirectorState.Inactive;
        this.approachDetails = {
            approachLoaded: false,
            approachType: ApproachType.APPROACH_TYPE_UNKNOWN,
            approachRnavType: RnavTypeFlags.None,
            approachIsActive: false
        };
        this.vec3Cache = [new Float64Array(3), new Float64Array(3), new Float64Array(3), new Float64Array(3)];
        this.geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];
        this.currentAltitude = 0;
        this.currentGpsAltitude = 0;
        this.preselectedAltitude = 0;
        this.currentGroundSpeed = 0;
        this.capturedAltitude = 0;
        this.isAltCaptured = false;
        this.awaitingAltCap = -1;
        this.awaitingRearm = -1;
        /** The leg distance from the current leg to the constraint leg, not including the distance from ppos to the current leg target. */
        this.constraintDistance = -1;
        this.lpvDeviation = Subject.create(0);
        this.bus.getSubscriber().on('dataChanged').handle(data => this.lnavData = data);
        this.bus.getSubscriber().on('alt_select').handle(selected => this.preselectedAltitude = selected);
        this.bus.getSubscriber().on('approach_details_set').handle(d => {
            this.approachDetails = d;
            this.apValues.approachIsActive.set(d.approachLoaded && d.approachIsActive);
        });
        this.bus.getSubscriber().on('alt').handle(alt => this.currentAltitude = alt);
        const gnss = this.bus.getSubscriber();
        gnss.on('gps-position').handle(lla => this.currentGpsAltitude = lla.alt);
        gnss.on('ground_speed').handle(gs => this.currentGroundSpeed = gs);
        this.apValues.verticalActive.sub(mode => {
            if (mode === APVerticalModes.ALT && this.awaitingAltCap !== -1) {
                this.awaitingRearm = this.awaitingAltCap;
                this.awaitingAltCap = -1;
            }
            if (this.awaitingRearm > -1 && mode !== APVerticalModes.ALT && mode !== APVerticalModes.CAP) {
                this.awaitingRearm = -1;
                this.awaitingAltCap = -1;
            }
        });
        this.apValues.lateralActive.sub(mode => {
            if (mode === APLateralModes.LOC && this.pathMode === VNavPathMode.PathArmed) {
                this.awaitingAltCap = -1;
                this.awaitingRearm = -1;
                this.deactivate();
            }
        });
        SimVar.SetSimVarValue(VNavSimVars.TODDistance, SimVarValueType.Number, Number.MAX_SAFE_INTEGER);
        SimVar.SetSimVarValue(VNavSimVars.LPVVerticalDeviation, SimVarValueType.Number, Number.MAX_SAFE_INTEGER);
        SimVar.SetSimVarValue(VNavSimVars.PathMode, SimVarValueType.Number, VNavPathMode.None);
    }
    /**
     * Setter for pathMode that also sets the simvar
     * @param mode is the VNavPathMode to set.
     */
    set pathMode(mode) {
        if (mode !== this._pathMode) {
            this._pathMode = mode;
            SimVar.SetSimVarValue(VNavSimVars.PathMode, SimVarValueType.Number, this._pathMode);
        }
        if (this._pathMode === VNavPathMode.PathArmed) {
            this.state = DirectorState.Armed;
            this.isAltCaptured = false;
            this.onArm && this.onArm();
        }
        if (this._pathMode === VNavPathMode.PathActive) {
            this.state = DirectorState.Active;
            this.onActivate && this.onActivate();
        }
    }
    /**
     * Getter for pathMode that also sets the simvar
     * @returns the current VNavPathMode.
     */
    get pathMode() {
        return this._pathMode;
    }
    /**
     * Activates the VNAV director's calculations.
     * Does NOT enable any path following.
     */
    enable() {
        this.pathMode = VNavPathMode.None;
        this.state = DirectorState.Inactive;
    }
    /**
     * Activates the director.
     * We do not use this method in vnav director.
     * @throws an error if someone calls this method.
     */
    activate() {
        throw new Error('Activate Method in VNAV Director not supported.');
    }
    /**
     * Arms the VNAV Director.
     * This is called by the Autopilot when the VNAV button is pressed to an on state.
     */
    arm() {
        this.awaitingAltCap = -1;
        this.awaitingRearm = -1;
        this.state = DirectorState.Armed;
        this.pathMode = VNavPathMode.None;
    }
    /**
     * Deactivates the VNAV director.
     * This is called by the Autopilot when the VNAV button is pressed to an off state or when GP/GS activates.
     * This is called by the VNAV Director at the end of the path or if there is an invalid path or other error.
     */
    deactivate() {
        if (this.state !== DirectorState.Inactive) {
            this.pathMode = VNavPathMode.None;
            this.state = DirectorState.Inactive;
            this.isAltCaptured = false;
            if (this.awaitingAltCap === -1 && this.awaitingRearm === -1) {
                SimVar.SetSimVarValue('L:XMLVAR_VNAVButtonValue', 'Bool', 0);
            }
        }
    }
    /**
     * Method to call when VNAV Encounters a failed state.
     */
    failed() {
        if (this.state === DirectorState.Active) {
            this.state = DirectorState.Inactive;
            if (!this.isAltCaptured) {
                this.apValues.capturedAltitude.set(this.currentAltitude);
            }
            this.onDeactivate && this.onDeactivate();
        }
        else {
            this.deactivate();
        }
    }
    /**
     * Method called to delegate altitude capture to the Alt Cap Director.
     */
    onDelegateAltCap() {
        this.onDeactivate && this.onDeactivate();
    }
    /**
     * Updates the VNAV director.
     */
    update() {
        var _a, _b, _c, _d;
        if (this.lnavData !== undefined && this.flightPlanner.hasFlightPlan(Fms.PRIMARY_PLAN_INDEX)) {
            const plan = this.flightPlanner.getFlightPlan(Fms.PRIMARY_PLAN_INDEX);
            let desiredAltFeet = Number.POSITIVE_INFINITY;
            let targetAltitudeFeet;
            let verticalDeviation = Number.MAX_SAFE_INTEGER;
            let requiredVs = 0;
            const alongLegDistance = this.getAlongLegDistance(this.lnavData);
            if (this.lnavData.nextLeg !== undefined && plan.activeLateralLeg < plan.length) {
                const todBodDetails = this.calculator.todBodDetails(plan.activeLateralLeg, alongLegDistance);
                SimVar.SetSimVarValue(VNavSimVars.TODDistance, SimVarValueType.Number, todBodDetails.distanceFromTod);
                SimVar.SetSimVarValue(VNavSimVars.TODLegIndex, SimVarValueType.Number, todBodDetails.todLegIndex);
                SimVar.SetSimVarValue(VNavSimVars.TODDistanceInLeg, SimVarValueType.Number, todBodDetails.distanceFromLegEnd);
                SimVar.SetSimVarValue(VNavSimVars.BODLegIndex, SimVarValueType.Number, todBodDetails.bodLegIndex);
                SimVar.SetSimVarValue(VNavSimVars.BODDistance, SimVarValueType.Number, todBodDetails.distanceFromBod);
                SimVar.SetSimVarValue(VNavSimVars.CurrentConstraintLegIndex, SimVarValueType.Number, todBodDetails.currentConstraintIndex);
                const nextConstraintAltitude = this.calculator.getNextConstraintAltitude(plan.activeLateralLeg);
                if (nextConstraintAltitude === undefined) {
                    this.bus.getPublisher().pub('vnavNextConstraintAltitude', -1);
                }
                else {
                    this.bus.getPublisher().pub('vnavNextConstraintAltitude', UnitType.METER.convertTo(nextConstraintAltitude, UnitType.FOOT));
                }
                const constraintAltitude = this.calculator.getCurrentConstraintAltitude(plan.activeLateralLeg);
                const simvarAltitudeSet = constraintAltitude !== undefined ? UnitType.METER.convertTo(constraintAltitude, UnitType.FOOT) : -1;
                SimVar.SetSimVarValue(VNavSimVars.CurrentConstraintAltitude, SimVarValueType.Feet, simvarAltitudeSet);
                const desiredAltitude = this.calculator.getDesiredAltitude(plan.activeLateralLeg, alongLegDistance);
                desiredAltFeet = UnitType.METER.convertTo(desiredAltitude, UnitType.FOOT);
                this.setConstraintDistance(plan, todBodDetails.currentConstraintIndex);
                if (((_b = (_a = this.lnavData.currentLeg) === null || _a === void 0 ? void 0 : _a.calculated) === null || _b === void 0 ? void 0 : _b.distanceWithTurns) && constraintAltitude !== undefined) {
                    const distance = this.constraintDistance +
                        UnitType.METER.convertTo(((_d = (_c = this.lnavData.currentLeg) === null || _c === void 0 ? void 0 : _c.calculated) === null || _d === void 0 ? void 0 : _d.distanceWithTurns) - this.getAlongLegDistance(this.lnavData), UnitType.NMILE);
                    requiredVs = this.getRequiredVs(distance, constraintAltitude);
                }
            }
            else {
                this.failed();
            }
            if (plan.length > 0) {
                const finalLeg = plan.getLeg(plan.length - 1);
                const lpvDistance = this.manageGP(finalLeg, plan, alongLegDistance);
                verticalDeviation = desiredAltFeet - this.currentAltitude;
                SimVar.SetSimVarValue(VNavSimVars.VerticalDeviation, SimVarValueType.Feet, verticalDeviation);
                const targetAltitude = this.calculator.getTargetAltitude(plan.activeLateralLeg);
                if (targetAltitude !== undefined) {
                    targetAltitudeFeet = UnitType.METER.convertTo(targetAltitude, UnitType.FOOT);
                    SimVar.SetSimVarValue(VNavSimVars.TargetAltitude, SimVarValueType.Feet, targetAltitudeFeet);
                }
                else {
                    SimVar.SetSimVarValue(VNavSimVars.TargetAltitude, SimVarValueType.Feet, -1);
                }
                if (this.apValues.verticalActive.get() === APVerticalModes.GP ||
                    (this.apValues.approachHasGP.get() && this.state === DirectorState.Inactive && plan.activeLateralLeg >= this.calculator.getFafLegIndex())) {
                    requiredVs = this.getRequiredVs(UnitType.METER.convertTo(lpvDistance, UnitType.NMILE), this.calculator.getLpvRunwayAltitude(), this.currentGpsAltitude);
                }
                SimVar.SetSimVarValue(VNavSimVars.RequiredVS, SimVarValueType.Number, requiredVs);
                if (plan.activeLateralLeg === this.awaitingRearm) {
                    this.arm();
                }
                if (this.state !== DirectorState.Inactive && this.awaitingAltCap === -1 && this.awaitingRearm === -1) {
                    this.manageAltHold(targetAltitudeFeet);
                    this.trackVerticalPath(targetAltitudeFeet, verticalDeviation, plan);
                }
                else if (plan.activeLateralLeg < plan.length) {
                    const fpa = this.calculator.getLeg(plan.activeLateralLeg).fpa;
                    SimVar.SetSimVarValue(VNavSimVars.FPA, SimVarValueType.FPM, fpa);
                }
                else {
                    SimVar.SetSimVarValue(VNavSimVars.FPA, SimVarValueType.FPM, 0);
                }
            }
            else {
                // TODO: remove this once we have a better way to get LPV state - does an LPV exist or not
                SimVar.SetSimVarValue(VNavSimVars.LPVDistance, SimVarValueType.Number, Number.MAX_SAFE_INTEGER);
                this.lpvDeviation.set(-1001);
            }
        }
        else {
            this.failed();
        }
    }
    /**
     * Tracks the vertical path.
     * @param targetAltitude The current VNAV target altitude, if any.
     * @param verticalDeviation The current vertical deviation.
     * @param plan The active flight plan.
     */
    trackVerticalPath(targetAltitude, verticalDeviation, plan) {
        if (targetAltitude === undefined) {
            targetAltitude = Number.NEGATIVE_INFINITY;
        }
        if (plan.activeLateralLeg >= plan.length) {
            this.isAltCaptured = false;
            this.failed();
            return;
        }
        const targetIsSelectedAltitude = this.preselectedAltitude > targetAltitude;
        targetAltitude = Math.max(targetAltitude, this.preselectedAltitude);
        const deviationFromTarget = targetAltitude - this.currentAltitude;
        const fpaPercentage = Math.max(verticalDeviation / -100, -1) + 1;
        const fpa = this.calculator.getLeg(plan.activeLateralLeg).fpa;
        const desiredPitch = (fpa * fpaPercentage) * -1;
        SimVar.SetSimVarValue(VNavSimVars.FPA, SimVarValueType.FPM, fpa);
        if (this.pathMode === VNavPathMode.None) {
            if (this.preselectedAltitude + 75 < this.currentAltitude) {
                this.pathMode = VNavPathMode.PathArmed;
            }
            else {
                this.deactivate();
            }
        }
        if (!this.isAltCaptured && this.pathMode === VNavPathMode.PathActive && fpa === 0) {
            this.apValues.capturedAltitude.set(100 * Math.round(targetAltitude / 100));
            this.pathMode = VNavPathMode.PathArmed;
            this.onDelegateAltCap();
            if (UnitType.METER.convertTo(this.calculator.getFafAltitude(), UnitType.FOOT) === targetAltitude) {
                this.deactivate();
            }
        }
        if (this.pathMode === VNavPathMode.PathArmed || this.pathMode == VNavPathMode.PathActive) {
            if (verticalDeviation <= 100 && verticalDeviation >= -15 && this.pathMode === VNavPathMode.PathArmed) {
                if (Math.abs(deviationFromTarget) > 75 && (!this.isAltCaptured && fpa !== 0)) {
                    SimVar.SetSimVarValue('AUTOPILOT PITCH HOLD', 'Bool', 0);
                    this.pathMode = VNavPathMode.PathActive;
                }
            }
            if (!this.isAltCaptured && Math.abs(deviationFromTarget) <= 250 && this.pathMode == VNavPathMode.PathActive) {
                this.capturedAltitude = targetAltitude;
                this.apValues.capturedAltitude.set(Math.round(this.capturedAltitude));
                this.isAltCaptured = true;
            }
            if (this.isAltCaptured && this.pathMode === VNavPathMode.PathActive) {
                const altCapDeviation = Math.abs(this.capturedAltitude - this.currentAltitude);
                const captureActivationValue = Math.tan(UnitType.DEGREE.convertTo(fpa, UnitType.RADIAN)) * UnitType.NMILE.convertTo(this.currentGroundSpeed / 360, UnitType.FOOT);
                if (altCapDeviation < Math.abs(captureActivationValue)) {
                    if (!targetIsSelectedAltitude && !this.calculator.getIsPathEnd(plan.activeLateralLeg)) {
                        this.awaitingAltCap = plan.activeLateralLeg + 1;
                    }
                    this.onDelegateAltCap();
                    return;
                }
            }
            if (this.pathMode === VNavPathMode.PathActive) {
                //We need the instant AOA here so we're avoiding the bus
                const aoa = SimVar.GetSimVarValue('INCIDENCE ALPHA', SimVarValueType.Degree);
                const maximumPitch = this.isAltCaptured ? 6 : 0;
                const targetPitch = aoa + NavMath.clamp(desiredPitch, -6, maximumPitch);
                SimVar.SetSimVarValue('AUTOPILOT PITCH HOLD REF', SimVarValueType.Degree, -targetPitch);
            }
        }
    }
    /**
     * Manages the sim ALT hold.
     * @param targetAltitude The current VNAV target altitude, if any.
     */
    manageAltHold(targetAltitude) {
        if (targetAltitude !== undefined) {
            const targetAltFeet = targetAltitude;
            if (this.preselectedAltitude >= targetAltFeet) {
                SimVar.SetSimVarValue(VNavSimVars.CaptureType, SimVarValueType.Number, VNavAltCaptureType.Selected);
            }
            else {
                SimVar.SetSimVarValue(VNavSimVars.CaptureType, SimVarValueType.Number, VNavAltCaptureType.VNAV);
            }
        }
        else {
            SimVar.SetSimVarValue(VNavSimVars.TargetAltitude, SimVarValueType.Feet, -1);
            SimVar.SetSimVarValue(VNavSimVars.CaptureType, SimVarValueType.Number, VNavAltCaptureType.None);
        }
    }
    /**
     * Gets the distance along the current leg.
     * @param lnavData The current LNAV data.
     * @returns The distance along the current leg.
     */
    getAlongLegDistance(lnavData) {
        let distance = 0;
        if (lnavData.currentLeg && lnavData.currentLeg.calculated && lnavData.state) {
            const calcs = lnavData.currentLeg.calculated;
            if (lnavData.turnMode === TurnMode.Ingress && calcs.ingressTurn.radius > 0) {
                const circle = FlightPathUtils.setGeoCircleFromVector(calcs.ingressTurn, this.geoCircleCache[0]);
                return UnitType.GA_RADIAN.convertTo(FlightPathUtils.getAlongArcSignedDistance(circle, GeoPoint.sphericalToCartesian(calcs.ingressTurn.startLat, calcs.ingressTurn.startLon, this.vec3Cache[0]), GeoPoint.sphericalToCartesian(calcs.ingressTurn.endLat, calcs.ingressTurn.endLon, this.vec3Cache[1]), circle.closest(lnavData.state.pos, this.vec3Cache[2])), UnitType.METER);
            }
            if (lnavData.currentLeg.calculated.flightPath.length < 1) {
                return 0;
            }
            for (let index = 0; index <= lnavData.vectorIndex; index++) {
                const start = this.vec3Cache[0];
                const end = this.vec3Cache[1];
                const vector = calcs.flightPath[index];
                if (index === 0 && calcs.ingressTurn.radius !== 0) {
                    distance += calcs.ingressTurn.distance;
                    GeoPoint.sphericalToCartesian(calcs.ingressTurn.endLat, calcs.ingressTurn.endLon, start);
                }
                else {
                    GeoPoint.sphericalToCartesian(vector.startLat, vector.startLon, start);
                }
                if (index === calcs.flightPath.length - 1 && calcs.egressTurn.radius !== 0) {
                    GeoPoint.sphericalToCartesian(calcs.egressTurn.startLat, calcs.egressTurn.startLon, end);
                    const turnEnd = GeoPoint.sphericalToCartesian(calcs.egressTurn.endLat, calcs.egressTurn.endLon, this.vec3Cache[2]);
                    if (lnavData.turnMode === TurnMode.Egress) {
                        const circle = FlightPathUtils.setGeoCircleFromVector(calcs.egressTurn, this.geoCircleCache[0]);
                        distance += UnitType.GA_RADIAN.convertTo(FlightPathUtils.getAlongArcSignedDistance(circle, end, turnEnd, circle.closest(lnavData.state.pos, this.vec3Cache[3])), UnitType.METER);
                    }
                }
                else {
                    GeoPoint.sphericalToCartesian(vector.endLat, vector.endLon, end);
                }
                const circle = FlightPathUtils.setGeoCircleFromVector(vector, this.geoCircleCache[0]);
                distance += UnitType.GA_RADIAN.convertTo(FlightPathUtils.getAlongArcSignedDistance(circle, start, end, index === lnavData.vectorIndex && lnavData.turnMode !== TurnMode.Egress
                    ? circle.closest(lnavData.state.pos, this.vec3Cache[2])
                    : end), UnitType.METER);
            }
        }
        return distance;
    }
    /**
     * Manages the GP State and sets required data for GP guidance.
     * @param finalLeg The LegDefinition for the last flight plan leg.
     * @param plan The FlightPlan.
     * @param alongLegDistance The Along Leg Distance
     * @returns The LPV Distance
     */
    manageGP(finalLeg, plan, alongLegDistance) {
        var _a;
        let lpvDeviation = Number.POSITIVE_INFINITY;
        let lpvDistance = -1;
        let gpExists = false;
        let gpCalculated = false;
        if (this.approachDetails.approachLoaded && this.approachDetails.approachIsActive) {
            switch (this.approachDetails.approachType) {
                case ApproachType.APPROACH_TYPE_GPS:
                case ApproachType.APPROACH_TYPE_RNAV:
                case AdditionalApproachType.APPROACH_TYPE_VISUAL:
                    gpExists = true;
            }
        }
        if (gpExists && (finalLeg === null || finalLeg === void 0 ? void 0 : finalLeg.calculated) !== undefined && ((_a = this.lnavData) === null || _a === void 0 ? void 0 : _a.state) !== undefined) {
            lpvDistance = this.calculator.getLpvDistance(plan.activeLateralLeg, alongLegDistance, this.lnavData.state.pos);
            const desiredLPVAltitude = this.calculator.getDesiredLpvAltitude(lpvDistance);
            const desiredLPVAltitudeFeet = UnitType.METER.convertTo(desiredLPVAltitude, UnitType.FOOT);
            lpvDeviation = desiredLPVAltitudeFeet - this.currentGpsAltitude;
            this.lpvDeviation.set(lpvDeviation);
            gpCalculated = true;
        }
        else {
            this.lpvDeviation.set(-1001);
        }
        SimVar.SetSimVarValue(VNavSimVars.LPVVerticalDeviation, SimVarValueType.Feet, lpvDeviation);
        SimVar.SetSimVarValue(VNavSimVars.LPVDistance, SimVarValueType.Number, lpvDistance);
        this.apValues.approachHasGP.set(gpCalculated);
        return lpvDistance;
    }
    /**
     * Gets the current required vertical speed.
     * @param distance is the distance to the constraint.
     * @param targetAltitude is the target altitude for the constraint.
     * @param currentAltitude is the current altitude (defaults to baro alt)
     * @returns the required vs in fpm.
     */
    getRequiredVs(distance, targetAltitude, currentAltitude = this.currentAltitude) {
        if (targetAltitude > 0) {
            const deviation = currentAltitude - UnitType.METER.convertTo(targetAltitude, UnitType.FOOT);
            if (deviation > 0 && distance > 0) {
                const fpaRequired = UnitType.RADIAN.convertTo(Math.atan((deviation / UnitType.NMILE.convertTo(distance, UnitType.FOOT))), UnitType.DEGREE);
                return UnitType.NMILE.convertTo(this.currentGroundSpeed / 60, UnitType.FOOT) * Math.tan(UnitType.DEGREE.convertTo(-fpaRequired, UnitType.RADIAN));
            }
        }
        return 0;
    }
    /**
     * Sets the leg distance from the current leg to the constraint leg, not include the distance to the current active leg.
     * @param plan is the flight plan.
     * @param constraintLegIndex is the leg index of the current constraint.
     */
    setConstraintDistance(plan, constraintLegIndex) {
        if (constraintLegIndex !== undefined && constraintLegIndex > -1) {
            const currentLeg = plan.getLeg(plan.activeLateralLeg);
            const constraintLeg = plan.getLeg(constraintLegIndex);
            if (constraintLeg.calculated && currentLeg.calculated && constraintLeg.calculated.cumulativeDistanceWithTurns && currentLeg.calculated.cumulativeDistanceWithTurns) {
                const currentLegCumulativeNM = UnitType.METER.convertTo(currentLeg.calculated.cumulativeDistanceWithTurns, UnitType.NMILE);
                const bodCumulativeNM = UnitType.METER.convertTo(constraintLeg.calculated.cumulativeDistanceWithTurns, UnitType.NMILE);
                this.constraintDistance = (bodCumulativeNM - currentLegCumulativeNM);
                return;
            }
        }
        this.constraintDistance = -1;
    }
}
