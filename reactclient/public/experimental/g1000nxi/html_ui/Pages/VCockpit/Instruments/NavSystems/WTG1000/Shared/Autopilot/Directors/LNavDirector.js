/// <reference types="msfstypes/JS/simvar" />
import { GeoCircle, GeoPoint, NavMath, UnitType, LinearServo, MagVar } from 'msfssdk';
import { FixTypeFlags, LegType } from 'msfssdk/navigation';
import { NavSourceType } from 'msfssdk/instruments';
import { ActiveLegType, PlanChangeType, FlightPathUtils } from 'msfssdk/flightplan';
import { DirectorState, ArcTurnController } from 'msfssdk/autopilot';
import { LNavVars } from '../LNavSimVars';
import { GpsObsDirector } from './GpsObsDirector';
export var TurnMode;
(function (TurnMode) {
    TurnMode[TurnMode["None"] = 0] = "None";
    TurnMode[TurnMode["Ingress"] = 1] = "Ingress";
    TurnMode[TurnMode["Egress"] = 2] = "Egress";
})(TurnMode || (TurnMode = {}));
/**
 * A class that handles lateral navigation.
 */
export class LNavDirector {
    /**
     * Creates an instance of the LateralDirector.
     * @param bus The event bus to use with this instance.
     * @param flightPlanner The flight planner to use with this instance.
     */
    constructor(bus, flightPlanner) {
        this.bus = bus;
        this.flightPlanner = flightPlanner;
        this.vec3Cache = [new Float64Array(3), new Float64Array(3)];
        this.geoPointCache = [new GeoPoint(0, 0)];
        this.geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];
        this.previousLegIndex = 0;
        /** The current active leg index. */
        this.currentLegIndex = 0;
        /** The current flight path vector index. */
        this.currentVectorIndex = 0;
        this.dtk = 0;
        this.xtk = 0;
        this.turnMode = TurnMode.None;
        this.isSuspended = false;
        this.suspendedLegIndex = 0;
        this.missedApproachActive = false;
        this.currentBankRef = 0;
        this.arcController = new ArcTurnController();
        this.bankServo = new LinearServo(10);
        this.lnavData = {
            vectorIndex: 0,
            turnMode: TurnMode.None,
            courseToSteer: 0
        };
        this.bearingToEnd = 0;
        this.canArm = false;
        this.trackAtActivation = 0;
        this.isInterceptingFromArmedState = false;
        this.aircraftState = {
            tas: 0,
            track: 0,
            magvar: 0,
            windSpeed: 0,
            windDirection: 0,
            pos: new GeoPoint(0, 0),
            hdgTrue: 0
        };
        this.obsDirector = new GpsObsDirector(this.bus, this.aircraftState);
        this.obsDirector.onDeactivate = () => {
            this.isSuspended = false;
            SimVar.SetSimVarValue(LNavVars.DTK, 'degrees', this.dtk);
        };
        const adc = bus.getSubscriber();
        const controls = bus.getSubscriber();
        const plan = bus.getSubscriber();
        this.publisher = bus.getPublisher();
        adc.on('ambient_wind_velocity').handle(w => this.aircraftState.windSpeed = w);
        adc.on('ambient_wind_direction').handle(wd => this.aircraftState.windDirection = wd);
        adc.on('magvar').handle(m => this.aircraftState.magvar = m);
        adc.on('tas').handle(tas => this.aircraftState.tas = tas);
        adc.on('hdg_deg_true').handle(hdg => this.aircraftState.hdgTrue = hdg);
        const nav = this.bus.getSubscriber();
        nav.on('cdi_select').handle((src) => {
            if (this.state !== DirectorState.Inactive && src.type !== NavSourceType.Gps) {
                this.deactivate();
            }
        });
        controls.on('suspend').handle(() => {
            this.trySetSuspended(false);
        });
        controls.on('activate_missed_approach').handle((v) => {
            this.missedApproachActive = v;
        });
        plan.on('fplActiveLegChange').handle(e => {
            if (e.type === ActiveLegType.Lateral) {
                this.currentVectorIndex = 0;
                this.turnMode = TurnMode.Ingress;
            }
        });
        plan.on('fplIndexChanged').handle(() => {
            this.currentVectorIndex = 0;
            this.turnMode = TurnMode.Ingress;
        });
        plan.on('fplSegmentChange').handle((e) => {
            if (e.type === PlanChangeType.Removed && (!this.flightPlanner.hasActiveFlightPlan() || this.flightPlanner.getActiveFlightPlan().length < 1)) {
                this.lnavData.vectorIndex = 0;
                this.lnavData.turnMode = TurnMode.None;
                this.lnavData.state = undefined;
                this.lnavData.currentLeg = undefined;
                this.lnavData.nextLeg = undefined;
            }
        });
        const gps = bus.getSubscriber();
        gps.on('gps-position').handle(lla => {
            this.aircraftState.pos.set(lla.lat, lla.long);
        });
        gps.on('track_deg_true').handle(t => this.aircraftState.track = t);
        this.state = DirectorState.Inactive;
    }
    /**
     * Activates the LNAV director.
     */
    activate() {
        this.isInterceptingFromArmedState = true;
        this.trackAtActivation = this.aircraftState.track;
        this.state = DirectorState.Active;
        if (this.onActivate !== undefined) {
            this.onActivate();
        }
        SimVar.SetSimVarValue('AUTOPILOT NAV1 LOCK', 'Bool', true);
    }
    /**
     * Arms the LNAV director.
     */
    arm() {
        if (this.state === DirectorState.Inactive) {
            this.isInterceptingFromArmedState = false;
            if (this.canArm) {
                this.state = DirectorState.Armed;
                if (this.onArm !== undefined) {
                    this.onArm();
                }
                SimVar.SetSimVarValue('AUTOPILOT NAV1 LOCK', 'Bool', true);
            }
        }
    }
    /**
     * Deactivates the LNAV director.
     */
    deactivate() {
        this.state = DirectorState.Inactive;
        if (this.obsDirector.state !== DirectorState.Inactive) {
            this.obsDirector.deactivate();
        }
        this.isInterceptingFromArmedState = false;
        SimVar.SetSimVarValue('AUTOPILOT NAV1 LOCK', 'Bool', false);
    }
    /**
     * Updates the lateral director.
     */
    update() {
        var _a, _b;
        const flightPlan = this.flightPlanner.hasActiveFlightPlan() ? this.flightPlanner.getActiveFlightPlan() : undefined;
        this.currentLegIndex = flightPlan ? flightPlan.activeLateralLeg : 0;
        if (flightPlan && this.currentLegIndex <= flightPlan.length - 1) {
            let leg = flightPlan.getLeg(this.currentLegIndex);
            let nextLeg = undefined;
            try {
                nextLeg = flightPlan.getLeg(this.currentLegIndex + 1);
            }
            catch ( /* Continue */_c) { /* Continue */ }
            this.calculateTracking(leg);
            if (this.currentLegIndex > flightPlan.length - 1) {
                return;
            }
            leg = flightPlan.getLeg(this.currentLegIndex);
            try {
                nextLeg = flightPlan.getLeg(this.currentLegIndex + 1);
            }
            catch ( /* Continue */_d) { /* Continue */ }
            const calcs = leg.calculated;
            this.calculateNextTracking(nextLeg === null || nextLeg === void 0 ? void 0 : nextLeg.calculated);
            this.lnavData.currentLeg = leg;
            this.lnavData.nextLeg = nextLeg;
            this.lnavData.vectorIndex = this.currentVectorIndex;
            this.lnavData.turnMode = this.turnMode;
            this.obsDirector.obsLeg.set(leg);
            if (this.obsDirector.obsActive) {
                this.isSuspended = true;
                this.suspendedLegIndex = this.currentLegIndex;
                if (this.state === DirectorState.Active && this.obsDirector.state !== DirectorState.Active) {
                    this.obsDirector.activate();
                    SimVar.SetSimVarValue('AUTOPILOT NAV1 LOCK', 'Bool', true);
                }
                if (this.state === DirectorState.Armed && this.obsDirector.canActivate()) {
                    this.obsDirector.activate();
                    this.state = DirectorState.Active;
                    if (this.onActivate !== undefined) {
                        this.onActivate();
                    }
                    SimVar.SetSimVarValue('AUTOPILOT NAV1 LOCK', 'Bool', true);
                }
                if (leg && ((_a = leg.calculated) === null || _a === void 0 ? void 0 : _a.endLat) && ((_b = leg.calculated) === null || _b === void 0 ? void 0 : _b.endLon) && this.aircraftState.pos) {
                    this.bearingToEnd = MagVar.trueToMagnetic(this.aircraftState.pos.bearingTo(leg.calculated.endLat, leg.calculated.endLon), this.aircraftState.pos);
                    SimVar.SetSimVarValue(LNavVars.Bearing, 'degrees', this.bearingToEnd);
                    const distance = this.aircraftState.pos.distance(leg.calculated.endLat, leg.calculated.endLon);
                    SimVar.SetSimVarValue(LNavVars.Distance, 'meters', UnitType.GA_RADIAN.convertTo(distance, UnitType.METER));
                }
                this.obsDirector.update();
                return;
            }
            if (calcs !== undefined) {
                this.canArm = true;
            }
            else {
                this.canArm = false;
            }
            if (this.state !== DirectorState.Inactive && calcs !== undefined) {
                this.navigateFlightPath(calcs);
            }
        }
        else {
            this.canArm = false;
        }
        if (this.state === DirectorState.Armed) {
            this.tryActivate();
        }
        this.lnavData.state = this.aircraftState;
        this.publisher.pub('dataChanged', this.lnavData, false);
    }
    /**
     * Calculates the tracking information for the next leg.
     * @param calcs The leg calculations for the next leg.
     */
    calculateNextTracking(calcs) {
        var _a;
        if (calcs !== undefined) {
            const vector = calcs.flightPath[0];
            if (vector !== undefined) {
                SimVar.SetSimVarValue(LNavVars.NextDTK, 'degrees', (_a = calcs.initialDtk) !== null && _a !== void 0 ? _a : 0);
                const circle = FlightPathUtils.setGeoCircleFromVector(vector, this.geoCircleCache[0]);
                SimVar.SetSimVarValue(LNavVars.NextXTK, 'nautical miles', UnitType.GA_RADIAN.convertTo(circle.distance(this.aircraftState.pos), UnitType.NMILE));
            }
        }
    }
    /**
     * Navigates the provided leg flight path.
     * @param calcs The legs calculations that has the provided flight path.
     */
    navigateFlightPath(calcs) {
        let absInterceptAngle;
        const naturalAbsInterceptAngle = Math.min(Math.pow(Math.abs(this.xtk) * 20, 1.35) + (Math.abs(this.xtk) * 50), 45);
        if (this.isInterceptingFromArmedState) {
            absInterceptAngle = Math.abs(NavMath.diffAngle(this.trackAtActivation, this.dtk));
            if (absInterceptAngle > naturalAbsInterceptAngle || absInterceptAngle < 5 || absInterceptAngle < Math.abs(NavMath.diffAngle(this.dtk, this.bearingToEnd))) {
                absInterceptAngle = naturalAbsInterceptAngle;
                this.isInterceptingFromArmedState = false;
            }
        }
        else {
            absInterceptAngle = naturalAbsInterceptAngle;
        }
        const interceptAngle = this.xtk < 0 ? absInterceptAngle : -1 * absInterceptAngle;
        this.lnavData.courseToSteer = NavMath.normalizeHeading(this.dtk + interceptAngle);
        let vector = calcs.flightPath[this.currentVectorIndex];
        let bankAngle = this.desiredBank(this.lnavData.courseToSteer, this.xtk);
        const isFirstVector = this.currentVectorIndex === 0;
        const isLastVector = this.currentVectorIndex === calcs.flightPath.length - 1;
        if (isFirstVector && this.turnMode === TurnMode.Ingress) {
            vector = calcs.ingressTurn;
        }
        else if (isLastVector && this.turnMode === TurnMode.Egress && !this.isSuspended) {
            vector = calcs.egressTurn;
        }
        if (vector !== undefined && !FlightPathUtils.isVectorGreatCircle(vector)) {
            bankAngle = this.adjustBankAngleForArc(vector, bankAngle);
        }
        if (this.state === DirectorState.Active) {
            this.setBank(bankAngle);
        }
    }
    /**
     * Adjusts the desired bank angle for arc vectors.
     * @param vector The arc vector to adjust for.
     * @param bankAngle The current starting input desired bank angle.
     * @returns The adjusted bank angle.
     */
    adjustBankAngleForArc(vector, bankAngle) {
        const circle = FlightPathUtils.setGeoCircleFromVector(vector, this.geoCircleCache[0]);
        const turnDirection = FlightPathUtils.getTurnDirectionFromCircle(circle);
        const radius = UnitType.GA_RADIAN.convertTo(FlightPathUtils.getTurnRadiusFromCircle(circle), UnitType.METER);
        const relativeWindHeading = NavMath.normalizeHeading(this.aircraftState.windDirection - this.aircraftState.hdgTrue);
        const headwind = this.aircraftState.windSpeed * Math.cos(relativeWindHeading * Avionics.Utils.DEG2RAD);
        const ppos = this.aircraftState.pos;
        const distance = UnitType.GA_RADIAN.convertTo(circle.distance(ppos), UnitType.METER);
        const bankAdjustment = this.arcController.getOutput(distance);
        const turnBankAngle = NavMath.bankAngle(this.aircraftState.tas - headwind, radius) * (turnDirection === 'left' ? 1 : -1);
        const turnRadius = NavMath.turnRadius(this.aircraftState.tas - headwind, 25);
        const bankBlendFactor = Math.max(1 - (Math.abs(UnitType.NMILE.convertTo(this.xtk, UnitType.METER)) / turnRadius), 0);
        bankAngle = (bankAngle * (1 - bankBlendFactor)) + (turnBankAngle * bankBlendFactor) + bankAdjustment;
        bankAngle = Math.min(Math.max(bankAngle, -25), 25);
        return bankAngle;
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
     * Calculates the tracking from the current leg.
     * @param leg The leg to calculate tracking from.
     */
    calculateTracking(leg) {
        var _a;
        const plan = this.flightPlanner.getActiveFlightPlan();
        let vector = (_a = leg.calculated) === null || _a === void 0 ? void 0 : _a.flightPath[this.currentVectorIndex];
        const calcs = leg.calculated;
        //Don't really need to fly the intial leg?
        if (leg.leg.type === LegType.IF && this.currentLegIndex === 0 && plan.length > 1) {
            this.currentLegIndex++;
            plan.setLateralLeg(this.currentLegIndex);
            plan.setCalculatingLeg(this.currentLegIndex);
            return;
        }
        if (vector !== undefined && calcs !== undefined) {
            const isFirstVector = this.currentVectorIndex === 0;
            const isLastVector = this.currentVectorIndex === calcs.flightPath.length - 1;
            if (isFirstVector && this.turnMode === TurnMode.Ingress) {
                vector = calcs.ingressTurn;
            }
            else if (isLastVector && this.turnMode === TurnMode.Egress && !this.isSuspended) {
                vector = calcs.egressTurn;
            }
            if (vector.radius === 0) {
                this.advanceVector(leg);
            }
            else {
                const circle = FlightPathUtils.setGeoCircleFromVector(vector, this.geoCircleCache[0]);
                const start = GeoPoint.sphericalToCartesian(vector.startLat, vector.startLon, this.vec3Cache[0]);
                const end = this.geoPointCache[0];
                const alongCirclePos = circle.closest(this.aircraftState.pos, this.vec3Cache[1]);
                this.xtk = UnitType.GA_RADIAN.convertTo(circle.distance(this.aircraftState.pos), UnitType.NMILE);
                this.dtk = circle.bearingAt(alongCirclePos);
                if (isLastVector && this.turnMode === TurnMode.None && calcs.egressTurn.radius > 0 && !this.isSuspended) {
                    end.set(calcs.egressTurn.startLat, calcs.egressTurn.startLon);
                }
                else {
                    end.set(vector.endLat, vector.endLon);
                }
                this.bearingToEnd = MagVar.trueToMagnetic(this.aircraftState.pos.bearingTo(end), this.aircraftState.pos);
                SimVar.SetSimVarValue(LNavVars.Bearing, 'degrees', this.bearingToEnd);
                if (FlightPathUtils.getAlongArcNormalizedDistance(circle, start, end, alongCirclePos) > 1) {
                    this.advanceVector(leg);
                }
            }
        }
        if (leg.calculated !== undefined && this.currentVectorIndex > leg.calculated.flightPath.length - 1 && plan.activeLateralLeg != plan.length - 1) {
            this.applyEndOfLegSuspends();
            if (!this.isSuspended) {
                this.currentLegIndex++;
                this.flightPlanner.getActiveFlightPlan().setLateralLeg(this.currentLegIndex);
                this.currentVectorIndex = 0;
                this.suspendedLegIndex = 0;
            }
            else {
                if (leg.leg.type === LegType.HM) {
                    this.currentVectorIndex = 0;
                }
            }
        }
        this.lnavData.courseToSteer = this.dtk;
    }
    /**
     * Applies suspends that apply at the end of a leg.
     */
    applyEndOfLegSuspends() {
        const plan = this.flightPlanner.getActiveFlightPlan();
        const leg = plan.getLeg(plan.activeLateralLeg);
        if (leg.leg.type === LegType.FM || leg.leg.type === LegType.VM) {
            this.trySetSuspended(true);
        }
        else if (plan.activeLateralLeg < plan.length - 1) {
            const nextLeg = plan.getLeg(plan.activeLateralLeg + 1);
            if (!this.missedApproachActive && (leg.leg.fixTypeFlags === FixTypeFlags.MAP || (!leg.isInMissedApproachSequence && nextLeg.isInMissedApproachSequence))) {
                this.trySetSuspended(true);
            }
        }
    }
    /**
     * Applies suspends that apply at the beginning of a leg.
     */
    applyStartOfLegSuspends() {
        const plan = this.flightPlanner.getActiveFlightPlan();
        const leg = plan.getLeg(plan.activeLateralLeg);
        if (leg.leg.type === LegType.HM || plan.activeLateralLeg === plan.length - 1) {
            this.trySetSuspended(true);
        }
    }
    /**
     * Advances the flight path vector along the flight path.
     * @param leg The definition of the leg being flown.
     */
    advanceVector(leg) {
        if (this.turnMode === TurnMode.Ingress) {
            this.turnMode = TurnMode.None;
            this.arcController.reset();
        }
        else if (this.turnMode === TurnMode.Egress) {
            this.advanceEgressToIngress();
        }
        else {
            if (this.hasEgressTurn(this.currentVectorIndex, leg)) {
                this.turnMode = TurnMode.Egress;
                this.flightPlanner.getFlightPlan(0).setCalculatingLeg(this.currentLegIndex + 1);
            }
            else {
                if (leg.calculated && this.currentVectorIndex === leg.calculated.flightPath.length - 1) {
                    this.advanceEgressToIngress();
                }
                else {
                    this.currentVectorIndex++;
                }
            }
        }
        if (leg.leg.type === LegType.HM && this.turnMode !== TurnMode.Egress) {
            if (leg.calculated && this.currentVectorIndex === leg.calculated.flightPath.length - 1) {
                this.flightPlanner.getFlightPlan(0).setCalculatingLeg(this.currentLegIndex - 1);
            }
            else {
                this.flightPlanner.getFlightPlan(0).setCalculatingLeg(this.currentLegIndex);
            }
        }
    }
    /**
     * Advances the end of a leg to the beginning of the next leg.
     */
    advanceEgressToIngress() {
        const plan = this.flightPlanner.getActiveFlightPlan();
        this.applyEndOfLegSuspends();
        if (!this.isSuspended) {
            if (this.currentLegIndex + 1 > plan.length - 1) {
                this.turnMode = TurnMode.None;
                return;
            }
            this.currentVectorIndex = 0;
            this.suspendedLegIndex = 0;
            plan.setLateralLeg(this.currentLegIndex + 1);
            plan.setCalculatingLeg(this.currentLegIndex + 1);
            const nextLeg = plan.getLeg(this.currentLegIndex + 1);
            if (this.hasIngressTurn(this.currentVectorIndex, nextLeg)) {
                this.turnMode = TurnMode.Ingress;
            }
            else {
                this.turnMode = TurnMode.None;
            }
            this.applyStartOfLegSuspends();
            this.currentLegIndex++;
        }
        else {
            const activeLeg = plan.getLeg(plan.activeLateralLeg);
            if (activeLeg.leg.type === LegType.HM) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.currentVectorIndex = activeLeg.calculated.flightPath.length - 4;
            }
        }
    }
    /**
     * Checks if a vector has an ingress turn.
     * @param vectorIndex The index of the vector.
     * @param leg The definition of the leg.
     * @returns Whether the vector has an ingress turn.
     */
    hasIngressTurn(vectorIndex, leg) {
        const calcs = leg.calculated;
        if (calcs !== undefined) {
            return vectorIndex === 0 && calcs.ingressTurn.radius !== 0;
        }
        return false;
    }
    /**
     * Checks if a vector has an egress turn.
     * @param vectorIndex The index of the vector.
     * @param leg The definition of the leg.
     * @returns Whether the vector has an egress turn.
     */
    hasEgressTurn(vectorIndex, leg) {
        const calcs = leg.calculated;
        if (calcs !== undefined && !this.isSuspended) {
            return vectorIndex === calcs.flightPath.length - 1 && calcs.egressTurn.radius !== 0;
        }
        return false;
    }
    /**
     * Sets flight plan advance in or out of SUSP.
     * @param isSuspended Whether or not advance is suspended.
     */
    trySetSuspended(isSuspended) {
        if (isSuspended && this.currentLegIndex === this.suspendedLegIndex) {
            return;
        }
        else if (isSuspended) {
            this.suspendedLegIndex = this.currentLegIndex;
        }
        if (this.isSuspended !== isSuspended) {
            this.publisher.pub('suspChanged', isSuspended, true, true);
            this.isSuspended = isSuspended;
        }
    }
    /**
     * Tries to activate when armed.
     */
    tryActivate() {
        const headingDiff = NavMath.diffAngle(this.aircraftState.track, this.dtk);
        if (Math.abs(this.xtk) < 0.6 && Math.abs(headingDiff) < 110) {
            this.activate();
        }
    }
}
