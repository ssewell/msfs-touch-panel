import { GeoPoint, UnitType } from 'msfssdk';
import { AltitudeRestrictionType, FacilityType, FixTypeFlags, ICAO, LegType } from 'msfssdk/navigation';
import { FlightPlan, FlightPlanSegment, FlightPlanSegmentType } from 'msfssdk/flightplan';
import { Fms } from '../FlightPlan/Fms';
/**
 * Handles the calculation of the VNAV flight path.
 */
export class VNavPathCalculator {
    /**
     * Creates an instance of the VNavPathCalculator.
     * @param bus The EventBus to use with this instance.
     * @param flightPlanner The flight planner to use with this instance.
     */
    constructor(bus, flightPlanner) {
        this.bus = bus;
        this.flightPlanner = flightPlanner;
        this.flightPathAngle = 3;
        this.maxFlightPathAngle = 6;
        this.segments = [];
        this.constraints = [];
        this.destLegIndex = 0;
        this.fafLegIndex = 0;
        this.discontinuityIndex = -1;
        this.missedApproachStartIndex = -1;
        this.isSuspended = false;
        this.cursor = {
            segment: new FlightPlanSegment(-1, -1, []),
            legIndex: -1,
            legDefinition: {
                leg: FlightPlan.createLeg({}),
                isInDirectToSequence: false,
                isInMissedApproachSequence: false
            },
            index: 0
        };
        this.currentAltitude = 0;
        this.lpvFpa = 0;
        const fpl = bus.getSubscriber();
        fpl.on('fplCopied').handle(e => e.planIndex === 0 && this.onPlanChanged());
        fpl.on('fplCreated').handle(e => e.planIndex === 0 && this.onPlanChanged());
        fpl.on('fplLegChange').handle(e => e.planIndex === 0 && this.onPlanChanged());
        fpl.on('fplLoaded').handle(e => e.planIndex === 0 && this.onPlanChanged());
        fpl.on('fplSegmentChange').handle(e => e.planIndex === 0 && this.onPlanChanged());
        fpl.on('fplIndexChanged').handle(this.onPlanChanged.bind(this));
        fpl.on('fplCalculated').handle(e => e.planIndex === 0 && this.computeVnavPath());
        bus.getSubscriber().on('alt').handle(alt => this.currentAltitude = UnitType.FOOT.convertTo(alt, UnitType.METER));
        bus.getSubscriber().on('suspChanged').handle(v => this.isSuspended = v);
    }
    /**
     * Gets a VNAV leg from the plan.
     * @param index The index of the leg to get.
     * @returns The requested VNAV leg.
     * @throws Not found if the index is not valid.
     */
    getLeg(index) {
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (index >= segment.offset && index < segment.offset + segment.legs.length) {
                return segment.legs[index - segment.offset];
            }
        }
        throw new Error(`Leg with index ${index} not found`);
    }
    /**
     * Gets a VNAV leg from the plan from a specified segment.
     * @param segmentIndex The segment index of the leg to get.
     * @param legIndex The index of the leg to get within the specified segment.
     * @returns The requested VNAV leg.
     * @throws Not found if the index is not valid.
     */
    getLegFromSegment(segmentIndex, legIndex) {
        const segment = this.segments[segmentIndex];
        const leg = segment.legs[legIndex];
        if (segment && leg) {
            return leg;
        }
        else {
            throw new Error(`Leg from segment ${segmentIndex} index ${legIndex} not found`);
        }
    }
    /**
     * Gets a VNAV leg from the plan from a specified segment.
     * @returns The vnav segments.
     * @throws Not found if the index is not valid.
     */
    getSegments() {
        return this.segments;
    }
    /**
     * Gets the VNAV desired altitude.
     * @param index The leg index to get the target for.
     * @param distanceAlongLeg The distance along the leg the aircraft is presently.
     * @returns The current VNAV desired altitude.
     */
    getDesiredAltitude(index, distanceAlongLeg) {
        const priorConstraint = this.getIsPriorConstraintPathEnd(index);
        if (priorConstraint && priorConstraint.nextVnavEligibleLegIndex && index < priorConstraint.nextVnavEligibleLegIndex) {
            return priorConstraint.altitude;
        }
        const leg = this.getLeg(index);
        return leg.altitude + this.altitudeForDistance(leg.fpa, leg.distance - distanceAlongLeg);
    }
    /**
     * Gets the current LPV distance.
     * @param index The current leg index.
     * @param distanceAlongLeg The distance along the leg the aircraft is presently.
     * @param ppos The current position from LNAV Data State
     * @returns The current LPV distance.
     */
    getLpvDistance(index, distanceAlongLeg, ppos) {
        let globalLegIndex = 0;
        let distance = 0;
        const plan = this.flightPlanner.getFlightPlan(Fms.PRIMARY_PLAN_INDEX);
        const destLeg = plan.getLeg(this.destLegIndex);
        if (index <= this.destLegIndex) {
            for (let segmentIndex = 0; segmentIndex < this.segments.length; segmentIndex++) {
                const segment = this.segments[segmentIndex];
                for (let legIndex = 0; legIndex < segment.legs.length; legIndex++) {
                    const leg = segment.legs[legIndex];
                    if (globalLegIndex <= this.destLegIndex) {
                        if (index === globalLegIndex) {
                            distance += leg.distance - distanceAlongLeg;
                        }
                        else if (globalLegIndex > index) {
                            distance += segment.legs[legIndex].distance;
                        }
                    }
                    globalLegIndex++;
                }
            }
            if (ICAO.isFacility(destLeg.leg.fixIcao)
                && ICAO.getFacilityType(destLeg.leg.fixIcao) !== FacilityType.RWY
                && plan.procedureDetails.destinationRunway !== undefined
                && destLeg.calculated && destLeg.calculated.endLat !== undefined && destLeg.calculated.endLon !== undefined) {
                const runway = plan.procedureDetails.destinationRunway;
                const runwayGeoPoint = new GeoPoint(runway.latitude, runway.longitude);
                if (index === this.destLegIndex && this.isSuspended) {
                    distance = UnitType.GA_RADIAN.convertTo(runwayGeoPoint.distance(ppos), UnitType.METER);
                }
                else {
                    distance += UnitType.GA_RADIAN.convertTo(runwayGeoPoint.distance(destLeg.calculated.endLat, destLeg.calculated.endLon), UnitType.METER);
                }
            }
        }
        return distance;
    }
    /**
     * Gets the LPV desired altitude.
     * @param distance The current LPV distance.
     * @returns The current LPV desired altitude.
     */
    getDesiredLpvAltitude(distance) {
        return this.getLpvRunwayAltitude() + this.altitudeForDistance(this.lpvFpa, distance + 100);
    }
    /**
     * Gets the LPV runway altitude.
     * @returns The LPV runway altitude.
     */
    getLpvRunwayAltitude() {
        const plan = this.flightPlanner.getFlightPlan(Fms.PRIMARY_PLAN_INDEX);
        const destLeg = plan.getLeg(this.destLegIndex);
        let destAltitude = destLeg.leg.altitude1;
        if (ICAO.isFacility(destLeg.leg.fixIcao)
            && ICAO.getFacilityType(destLeg.leg.fixIcao) !== FacilityType.RWY
            && plan.procedureDetails.destinationRunway !== undefined) {
            destAltitude = plan.procedureDetails.destinationRunway.elevation;
        }
        return destAltitude;
    }
    /**
     * Gets the VNAV target altitude for the given leg index.
     * @param index The index of the leg.
     * @returns The next VNAV target altitude, or undefined if none exists.
     */
    getTargetAltitude(index) {
        const priorConstraint = this.getIsPriorConstraintPathEnd(index);
        if (priorConstraint && priorConstraint.nextVnavEligibleLegIndex && index < priorConstraint.nextVnavEligibleLegIndex) {
            return priorConstraint.altitude;
        }
        let i = this.constraints.length - 1;
        while (i >= 0) {
            const constraint = this.constraints[i];
            if (index <= constraint.index && constraint.isTarget && !constraint.isBeyondFaf) {
                return constraint.altitude;
            }
            i--;
        }
    }
    /**
     * Gets the VNAV TOD/BOD details.
     * @param index The current leg index.
     * @param distanceAlongLeg The distance the plane is along the current leg.
     * @returns The distance the plane is from the next TOD.
     */
    todBodDetails(index, distanceAlongLeg) {
        const details = {
            todLegIndex: -1,
            bodLegIndex: -1,
            distanceFromLegEnd: 0,
            distanceFromTod: 0,
            distanceFromBod: 0,
            currentConstraintIndex: -1
        };
        let globalIndex = 0;
        const constraint = this.getConstraintFromLegIndex(index);
        details.currentConstraintIndex = constraint && constraint.index ? constraint.index : -1;
        const priorConstraint = this.getIsPriorConstraintPathEnd(index);
        if (priorConstraint !== undefined && priorConstraint.nextVnavEligibleLegIndex && priorConstraint.nextVnavEligibleLegIndex > index) {
            return details;
        }
        for (let i = 0; i < this.segments.length && details.bodLegIndex === -1; i++) {
            const segment = this.segments[i];
            for (let l = 0; l < segment.legs.length; l++) {
                const leg = segment.legs[l];
                if (globalIndex >= index) {
                    if (details.todLegIndex === -1) {
                        if (index === globalIndex) {
                            details.distanceFromTod = leg.distance - distanceAlongLeg;
                        }
                        else {
                            details.distanceFromTod += leg.distance;
                        }
                        if (leg.todDistance !== undefined && leg.altitude <= this.currentAltitude) {
                            details.todLegIndex = globalIndex;
                            details.distanceFromTod -= leg.todDistance;
                            details.distanceFromLegEnd = leg.todDistance;
                        }
                    }
                    if (leg.isBod) {
                        details.bodLegIndex = globalIndex;
                        const plan = this.flightPlanner.getFlightPlan(Fms.PRIMARY_PLAN_INDEX);
                        const currentLeg = plan.getLeg(plan.activeLateralLeg);
                        let bodDistanceInMeters = 0;
                        if (plan.activeLateralLeg === globalIndex && currentLeg.calculated) {
                            bodDistanceInMeters = currentLeg.calculated.distanceWithTurns - distanceAlongLeg;
                        }
                        else if (plan.activeLateralLeg < globalIndex) {
                            const bodLeg = plan.getLeg(globalIndex);
                            if (bodLeg.calculated && currentLeg.calculated && bodLeg.calculated.cumulativeDistanceWithTurns && currentLeg.calculated.cumulativeDistanceWithTurns) {
                                bodDistanceInMeters = (bodLeg.calculated.cumulativeDistanceWithTurns - currentLeg.calculated.cumulativeDistanceWithTurns)
                                    + (currentLeg.calculated.distanceWithTurns - distanceAlongLeg);
                            }
                        }
                        details.distanceFromBod = bodDistanceInMeters;
                        if (details.todLegIndex < index) {
                            details.distanceFromTod = 0;
                        }
                        return details;
                    }
                }
                globalIndex++;
            }
        }
        if (details.todLegIndex < index) {
            details.distanceFromTod = 0;
        }
        return details;
    }
    /**
     * Gets and returns the FAF altitude.
     * @returns the FAF constraint altitude.
     */
    getFafAltitude() {
        return this.getLeg(this.fafLegIndex).altitude;
    }
    /**
     * Gets and returns the FAF Leg Index.
     * @returns the FAF Leg Index.
     */
    getFafLegIndex() {
        return this.fafLegIndex;
    }
    /**
     * Gets and returns whether the input leg index is a path end.
     * @param legIndex is the global leg index to check.
     * @returns whether the input leg index is a path end.
     */
    getIsPathEnd(legIndex) {
        const constraintIndex = this.constraints.findIndex(c => c.index === legIndex);
        if (constraintIndex > -1 && this.constraints[constraintIndex].isPathEnd) {
            return true;
        }
        return false;
    }
    /**
     * Gets and returns the current constraint altitude.
     * @param index is the global leg index to check.
     * @returns the altitude or undefined.
     */
    getCurrentConstraintAltitude(index) {
        const priorConstraint = this.getIsPriorConstraintPathEnd(index);
        const currentConstraint = this.getConstraintFromLegIndex(index);
        if (priorConstraint && priorConstraint.nextVnavEligibleLegIndex && index < priorConstraint.nextVnavEligibleLegIndex) {
            return priorConstraint.altitude;
        }
        else {
            return currentConstraint && currentConstraint.altitude ? currentConstraint.altitude : undefined;
        }
    }
    /**
     * Gets and returns the next constraint altitude.
     * @param index is the global leg index to check.
     * @returns the altitude or undefined.
     */
    getNextConstraintAltitude(index) {
        const currentConstraint = this.getConstraintFromLegIndex(index);
        return currentConstraint && currentConstraint.altitude ? currentConstraint.altitude : undefined;
    }
    /**
     * Calculates the LPV flight path angle using the destination elevation
     * and FAF altitude restriction.
     * @param plan The plan to calculate from.
     * @param fafIndex The leg index of the FAF.
     * @param destIndex The leg index of the destination.
     */
    calcLpvFpa(plan, fafIndex, destIndex) {
        // TODO: make smarter - don't calc FPA if RNAV approach isn't loaded.
        if (plan.length < 2 || fafIndex > plan.length || destIndex > plan.length) {
            return;
        }
        const fafLeg = plan.getLeg(fafIndex);
        const destLeg = plan.getLeg(destIndex);
        let fafToDestDistance = 0;
        for (let i = fafIndex + 1; i <= destIndex; i++) {
            const leg = plan.getLeg(i);
            if (leg.calculated !== undefined) {
                fafToDestDistance += leg.calculated.distance;
            }
        }
        let destAltitude = destLeg.leg.altitude1;
        if (ICAO.isFacility(destLeg.leg.fixIcao)
            && ICAO.getFacilityType(destLeg.leg.fixIcao) !== FacilityType.RWY
            && plan.procedureDetails.destinationRunway !== undefined
            && destLeg.calculated && destLeg.calculated.endLat !== undefined && destLeg.calculated.endLon !== undefined) {
            const runway = plan.procedureDetails.destinationRunway;
            const runwayGeoPoint = new GeoPoint(runway.latitude, runway.longitude);
            destAltitude = runway.elevation;
            fafToDestDistance += UnitType.GA_RADIAN.convertTo(runwayGeoPoint.distance(destLeg.calculated.endLat, destLeg.calculated.endLon), UnitType.METER);
        }
        this.lpvFpa = this.getFpa(fafToDestDistance + 225, fafLeg.leg.altitude1 - destAltitude + 15);
    }
    /**
     * Fills the VNAV plan leg and constraint segment distances.
     */
    fillLegAndConstraintDistances() {
        this.iterateReverse(cursor => { var _a, _b; return this.segments[cursor.segment.segmentIndex].legs[cursor.legIndex].distance = (_b = (_a = cursor.legDefinition.calculated) === null || _a === void 0 ? void 0 : _a.distanceWithTurns) !== null && _b !== void 0 ? _b : 0; });
        for (let constraintIndex = 0; constraintIndex < this.constraints.length; constraintIndex++) {
            const constraint = this.constraints[constraintIndex];
            constraint.distance = 0;
            for (let legIndex = 0; legIndex < constraint.legs.length; legIndex++) {
                constraint.distance += constraint.legs[legIndex].distance;
            }
        }
    }
    /**
     * Computes the flight path angles for each constraint segment.
     */
    computeFlightPathAngles() {
        let isCurrentlyDirect = false;
        for (let i = 0; i < this.constraints.length; i++) {
            const currentConstraint = this.constraints[i];
            const nextConstraint = this.constraints[i + 1];
            if (currentConstraint.type !== 'direct') {
                currentConstraint.fpa = this.flightPathAngle;
            }
            currentConstraint.isTarget = isCurrentlyDirect ? false : true;
            if (currentConstraint.index === this.fafLegIndex) {
                currentConstraint.isTarget = true;
            }
            if (currentConstraint.index > this.fafLegIndex) {
                currentConstraint.isBeyondFaf = true;
            }
            if (nextConstraint !== undefined && nextConstraint.type !== 'dep' && !nextConstraint.isPathEnd) {
                const directFpa = this.getFpa(currentConstraint.distance, nextConstraint.altitude - currentConstraint.altitude);
                const endAltitude = currentConstraint.altitude + this.altitudeForDistance(this.flightPathAngle, currentConstraint.distance);
                const todDistance = this.distanceForAltitude(this.flightPathAngle, nextConstraint.altitude - currentConstraint.altitude);
                currentConstraint.todDistance = todDistance;
                //If going direct is within a half a degree of the default FPA, or if we were unable to meet
                //the next constraint, go direct
                if (Math.abs(directFpa - this.flightPathAngle) <= 0.5 || endAltitude < nextConstraint.altitude) {
                    currentConstraint.fpa = directFpa;
                    isCurrentlyDirect = true;
                    currentConstraint.todDistance = currentConstraint.distance;
                }
                else if (currentConstraint.altitude === nextConstraint.altitude || currentConstraint.isBeyondFaf) {
                    currentConstraint.fpa = 0;
                    isCurrentlyDirect = false;
                }
                else {
                    isCurrentlyDirect = false;
                }
            }
            else {
                isCurrentlyDirect = false;
            }
            //If the constraint is a vertical direct, check if an FPA > 3 is required and, if so, attempt to set the max FPA
            if (currentConstraint.type === 'direct' && !nextConstraint && currentConstraint.fpa === 0) {
                const plan = this.flightPlanner.getActiveFlightPlan();
                const directTargetSegment = plan.directToData.segmentIndex;
                const directTargetLegIndex = plan.directToData.segmentLegIndex;
                let distance = 0;
                for (let l = 0; l < currentConstraint.legs.length; l++) {
                    const leg = currentConstraint.legs[l];
                    distance += leg.distance;
                    if (leg.segmentIndex === directTargetSegment && leg.legIndex === directTargetLegIndex) {
                        break;
                    }
                }
                const fpaRequired = this.getFpa(distance, 50 + this.currentAltitude - currentConstraint.altitude);
                currentConstraint.fpa = Utils.Clamp(fpaRequired, 3, this.maxFlightPathAngle);
                currentConstraint.todDistance = this.distanceForAltitude(currentConstraint.fpa, this.currentAltitude - currentConstraint.altitude);
            }
        }
    }
    /**
     * Computes the VNAV descent path.
     */
    computeVnavPath() {
        this.fillLegAndConstraintDistances();
        this.computeFlightPathAngles();
        for (let constraintIndex = 0; constraintIndex < this.constraints.length; constraintIndex++) {
            const constraint = this.constraints[constraintIndex];
            let todDistance = constraint.todDistance;
            let altitude = constraint.altitude;
            //If the next constraint altitude is going to bust our current altitude, adjust the
            //constraint segment TOD distance to match our current altitude
            const nextAlt = constraint.altitude + this.altitudeForDistance(constraint.fpa, constraint.distance);
            if (nextAlt > this.currentAltitude) {
                todDistance = this.distanceForAltitude(constraint.fpa, this.currentAltitude - altitude);
            }
            for (let legIndex = 0; legIndex < constraint.legs.length; legIndex++) {
                const leg = constraint.legs[legIndex];
                leg.fpa = constraint.index <= this.fafLegIndex ? constraint.fpa : 0;
                leg.altitude = altitude;
                altitude += this.altitudeForDistance(leg.fpa, leg.distance);
                if (legIndex === 0) {
                    leg.isAdvisory = false;
                }
                else {
                    leg.isAdvisory = true;
                }
                if (legIndex === 0 && constraint.isTarget) {
                    leg.isBod = true;
                }
                else {
                    leg.isBod = false;
                }
                if (leg.distance >= todDistance && !constraint.isBeyondFaf) {
                    leg.todDistance = todDistance;
                }
                else {
                    leg.todDistance = undefined;
                    todDistance -= leg.distance;
                }
            }
        }
        this.calcLpvFpa(this.flightPlanner.getFlightPlan(Fms.PRIMARY_PLAN_INDEX), this.fafLegIndex, this.destLegIndex);
        this.notify();
    }
    /**
     * Resets the VNAV plan segments, legs, and constraints based on the new plan.
     */
    onPlanChanged() {
        this.fafLegIndex = this.getFafIndex();
        this.constraints.length = 0;
        let currentConstraintAlt = 0;
        let forceNextConstraintAsTarget = false;
        let vnavIneligibleIndex = -1;
        let currentConstraint = this.createConstraint(0, 0, '$DEST', 'dest');
        let currentSegmentIndex = -1;
        this.segments.length = 0;
        this.discontinuityIndex = -1;
        const plan = this.flightPlanner.getFlightPlan(Fms.PRIMARY_PLAN_INDEX);
        for (const segment of plan.segments()) {
            this.segments[segment.segmentIndex] = {
                offset: segment.offset,
                legs: []
            };
        }
        this.destLegIndex = Math.max(0, plan.length - 1);
        this.missedApproachStartIndex = this.destLegIndex;
        this.destLegIndex = Math.max(0, plan.length - 1);
        this.missedApproachStartIndex = this.destLegIndex;
        this.iterateReverse(cursor => {
            var _a, _b;
            if (cursor.segment.segmentIndex !== currentSegmentIndex) {
                currentSegmentIndex = cursor.segment.segmentIndex;
            }
            if (cursor.legDefinition.leg.type === LegType.Discontinuity) {
                this.discontinuityIndex = cursor.segment.offset + cursor.legIndex;
                if (currentConstraint.altitude < this.currentAltitude) {
                    currentConstraint.type = 'direct';
                }
            }
            const leg = this.createLeg(cursor.segment.segmentIndex, cursor.legIndex, (_a = cursor.legDefinition.name) !== null && _a !== void 0 ? _a : '');
            if (cursor.segment.segmentType === FlightPlanSegmentType.Approach) {
                //Check if the leg is part of the missed approach
                if (cursor.legDefinition.isInMissedApproachSequence) {
                    this.missedApproachStartIndex = cursor.segment.offset + cursor.legIndex;
                }
                //Check if the leg is the destination leg
                if (!cursor.legDefinition.isInMissedApproachSequence && this.missedApproachStartIndex === cursor.segment.offset + cursor.legIndex + 1) {
                    this.destLegIndex = cursor.segment.offset + cursor.legIndex;
                }
            }
            //If the current leg has a valid constraint, create a new constraint segment
            if (cursor.legDefinition.leg.altDesc !== AltitudeRestrictionType.Unused && this.discontinuityIndex < 0 && !cursor.legDefinition.isInMissedApproachSequence) {
                const constraintAlt = this.getConstraintAltitude(cursor.legDefinition.leg);
                //Only create constraint segments if the previous constraint is lower or the same, in order to reject
                //climb constraints
                if (constraintAlt >= currentConstraintAlt) {
                    //If we happen to be in the destination segment (i.e. the end of the plan)
                    //set the alt to the next constraint alt so that the segment is flat
                    if (currentConstraint.type === 'dest') {
                        currentConstraint.altitude = constraintAlt;
                    }
                    const dep = cursor.segment.segmentType === FlightPlanSegmentType.Departure ? true : false;
                    currentConstraint = this.createConstraint(cursor.segment.offset + cursor.legIndex, constraintAlt, (_b = cursor.legDefinition.name) !== null && _b !== void 0 ? _b : '', (dep ? 'dep' : 'normal'));
                    if (forceNextConstraintAsTarget) {
                        currentConstraint.isTarget = true;
                        currentConstraint.isPathEnd = true;
                        currentConstraint.nextVnavEligibleLegIndex = vnavIneligibleIndex + 1;
                        forceNextConstraintAsTarget = false;
                        vnavIneligibleIndex = -1;
                    }
                    if (cursor.segment.offset + cursor.legIndex === this.fafLegIndex) {
                        currentConstraint.isTarget = true;
                        currentConstraint.isPathEnd = true;
                    }
                    this.constraints.push(currentConstraint);
                    currentConstraintAlt = constraintAlt;
                }
            }
            currentConstraint.legs.push(leg);
            this.segments[cursor.segment.segmentIndex].legs.unshift(leg);
            if (this.discontinuityIndex < 0) {
                switch (cursor.legDefinition.leg.type) {
                    case LegType.HA:
                    case LegType.HM:
                    case LegType.HF:
                    case LegType.VM:
                    case LegType.FM:
                    case LegType.PI:
                        forceNextConstraintAsTarget = true;
                        if (vnavIneligibleIndex < 0) {
                            vnavIneligibleIndex = cursor.segment.offset + cursor.legIndex;
                        }
                }
            }
        });
        this.calcLpvFpa(plan, this.fafLegIndex, this.destLegIndex);
    }
    /**
     * Gets the FAF index in the plan.
     * @returns The FAF index in the plan.
     */
    getFafIndex() {
        const plan = this.flightPlanner.getFlightPlan(Fms.PRIMARY_PLAN_INDEX);
        let fafIndex = plan.length - 2;
        this.iterateReverse(cursor => {
            if (cursor.legDefinition.leg.fixTypeFlags & FixTypeFlags.FAF) {
                fafIndex = cursor.legIndex + cursor.segment.offset;
                return;
            }
        });
        return fafIndex;
    }
    /**
     * Gets an increase in altitude for a given flight path angle and
     * lateral distance.
     * @param fpa The flight path angle to use, in degrees.
     * @param distance The lateral distance.
     * @returns The increase in altitude.
     */
    altitudeForDistance(fpa, distance) {
        return Math.tan(UnitType.DEGREE.convertTo(fpa, UnitType.RADIAN)) * distance;
    }
    /**
     * Gets a lateral distance for a given altitude increase and flight
     * path angle.
     * @param fpa The flight path angle to use, in degrees.
     * @param altitude The increase in altitude.
     * @returns The lateral distance.
     */
    distanceForAltitude(fpa, altitude) {
        return altitude / Math.tan(UnitType.DEGREE.convertTo(fpa, UnitType.RADIAN));
    }
    /**
     * Gets the flight path angle for a given distance and altitude.
     * @param distance The distance to get the angle for.
     * @param altitude The altitude to get the angle for.
     * @returns The required flight path angle, in degrees.
     */
    getFpa(distance, altitude) {
        return UnitType.RADIAN.convertTo(Math.atan(altitude / distance), UnitType.DEGREE);
    }
    /**
     * Gets the leg index for the current constraint.
     * @param index The current leg index.
     * @returns Index if the current constraint, or -1 if none is found.
     */
    getCurrentConstraintIndex(index) {
        for (let c = this.constraints.length - 1; c >= 0; c--) {
            const constraintIndex = this.constraints[c].index;
            if (constraintIndex >= index) {
                return constraintIndex;
            }
        }
        return -1;
    }
    /**
     * Gets the VNAV Constraint that contains the supplied leg index.
     * @param legIndex The flight plan leg index to find the constraint for.
     * @returns The VNAV Constraint that contains the input leg index.
     */
    getConstraintFromLegIndex(legIndex) {
        if (this.constraints.length > 0) {
            const constraintIndex = this.constraints.findIndex(c => c.index === this.getCurrentConstraintIndex(legIndex));
            return this.constraints[constraintIndex];
        }
        return undefined;
    }
    /**
     * Gets the first VNAV Constraint Altitude.
     * @returns The first VNAV constraint altitude in the plan.
     */
    getFirstDescentConstraintAltitude() {
        if (this.constraints.length > 0) {
            for (let i = this.constraints.length - 1; i >= 0; i--) {
                const constraint = this.constraints[i];
                if (constraint.type !== 'dep') {
                    return constraint.altitude;
                }
            }
        }
        return undefined;
    }
    /**
     * Checks if the prior constraint was a path end.
     * @param index The current leg index.
     * @returns Whether the prior constraint was a path end.
     */
    getIsPriorConstraintPathEnd(index) {
        for (let c = 0; c < this.constraints.length; c++) {
            if (this.constraints[c].index < index) {
                return this.constraints[c];
            }
        }
        return undefined;
    }
    /**
     * Gets the constraint for a leg altitude restriction.
     * @param leg The leg to get the constraint for.
     * @returns The altitude constraint.
     */
    getConstraintAltitude(leg) {
        switch (leg.altDesc) {
            case AltitudeRestrictionType.At:
            case AltitudeRestrictionType.AtOrAbove:
            case AltitudeRestrictionType.AtOrBelow:
                return leg.altitude1;
            case AltitudeRestrictionType.Between:
                return leg.altitude2;
        }
        return Number.POSITIVE_INFINITY;
    }
    /**
     * Iterates through the active flight plan in reverse order.
     * @param each The function to call for each flight plan leg.
     */
    iterateReverse(each) {
        const plan = this.flightPlanner.getFlightPlan(Fms.PRIMARY_PLAN_INDEX);
        let segmentIndex = plan.segmentCount - 1;
        let index = 0;
        while (segmentIndex >= 0) {
            const segment = plan.getSegment(segmentIndex);
            let legIndex = segment.legs.length - 1;
            while (legIndex >= 0) {
                this.cursor.legDefinition = segment.legs[legIndex];
                this.cursor.legIndex = legIndex;
                this.cursor.segment = segment;
                this.cursor.index = index;
                each(this.cursor);
                legIndex--;
                index++;
            }
            segmentIndex--;
        }
    }
    /**
     * Creates a new empty constraint.
     * @param index The leg index of the constraint.
     * @param altitude The altitude of the constraint.
     * @param name The name of the leg for the constraint.
     * @param type The type of constraint.
     * @returns A new empty constraint.
     */
    createConstraint(index, altitude, name, type = 'normal') {
        return {
            index,
            altitude,
            name,
            isTarget: false,
            isPathEnd: false,
            todDistance: 0,
            distance: 0,
            fpa: 0,
            legs: [],
            type,
            isBeyondFaf: false
        };
    }
    /**
     * Creates a new VNAV plan leg.
     * @param segmentIndex The segment index for the leg.
     * @param legIndex The index of the leg within the segment.
     * @param name The name of the leg.
     * @returns A new VNAV plan leg.
     */
    createLeg(segmentIndex, legIndex, name) {
        return {
            segmentIndex,
            legIndex,
            fpa: 0,
            altitude: 0,
            isUserDefined: false,
            distance: 0,
            isBod: false,
            isAdvisory: true,
            name
        };
    }
    /**
     * Sends an event on the fpl bus that the vertical plan has been updated.
     */
    notify() {
        this.bus.pub('vnavUpdated', true, false);
    }
}
