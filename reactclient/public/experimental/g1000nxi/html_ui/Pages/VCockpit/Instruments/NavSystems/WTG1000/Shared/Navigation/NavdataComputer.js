import { GeoCircle, GeoPoint, MagVar, NavMath, UnitType } from 'msfssdk';
import { SimVarValueType } from 'msfssdk/data';
import { FacilityType, FixTypeFlags, LegType, RnavTypeFlags, AdditionalApproachType } from 'msfssdk/navigation';
import { FlightPlanSegmentType, OriginDestChangeType, FlightPathUtils } from 'msfssdk/flightplan';
import { TurnMode } from '../Autopilot/Directors/LNavDirector';
import { CDIScaleLabel, LNavVars } from '../Autopilot/LNavSimVars';
/**
 * A class that calculates displayed lateral nav data information from
 * supplied lnav values.
 */
export class NavdataComputer {
    /**
     * Creates a new instance of the NavdataComputer.
     * @param bus The event bus to use with this instance.
     * @param flightPlanner The flight planner to use with this instance.
     * @param facilityLoader The facility loader to use with this instance.
     */
    constructor(bus, flightPlanner, facilityLoader) {
        this.bus = bus;
        this.flightPlanner = flightPlanner;
        this.facilityLoader = facilityLoader;
        this.vec3Cache = [new Float64Array(3)];
        this.geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0)];
        this.geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];
        this.obsAvailable = false;
        this.approachDetails = {
            approachLoaded: false,
            approachType: ApproachType.APPROACH_TYPE_UNKNOWN,
            approachRnavType: RnavTypeFlags.None,
            approachIsActive: false
        };
        this.bus.getSubscriber()
            .on('dataChanged')
            .handle(this.onDataChange.bind(this));
        this.bus.getSubscriber()
            .on('fplOriginDestChanged')
            .handle(this.flightPlanOriginDestChanged.bind(this));
        this.bus.getSubscriber()
            .on('approach_details_set')
            .handle(d => this.approachDetails = d);
    }
    /**
     * A callback fired when the LNAV data changes.
     * @param data The new LNAV data.
     */
    onDataChange(data) {
        if (data.state !== undefined) {
            const magVar = MagVar.get(data.state.pos);
            this.computeTrackingVars(data, magVar);
            this.computeCDIScaling(data);
            SimVar.SetSimVarValue(LNavVars.CurrentVector, 'number', data.vectorIndex);
            if (data.currentLeg) {
                this.setObsAvailable(data.currentLeg.leg.type);
            }
        }
    }
    /**
     * A callback fired when the origin or destination changes in the flight plan.
     * @param e The event that was captured.
     */
    flightPlanOriginDestChanged(e) {
        if (e.airport !== undefined) {
            this.facilityLoader.getFacility(FacilityType.Airport, e.airport).then(fac => {
                switch (e.type) {
                    case OriginDestChangeType.OriginAdded:
                        this.originFacility = fac;
                        break;
                    case OriginDestChangeType.DestinationAdded:
                        this.destinationFacility = fac;
                        break;
                }
            });
        }
        if (e.type === OriginDestChangeType.OriginRemoved) {
            this.originFacility = undefined;
        }
        if (e.type === OriginDestChangeType.DestinationRemoved) {
            this.destinationFacility = undefined;
        }
    }
    /**
     * Computes the nav tracking data, such as XTK, DTK, and distance to turn.
     * @param data The LNAV data to compute with.
     * @param magVar The computed current location magvar.
     */
    computeTrackingVars(data, magVar) {
        var _a;
        if (data.state !== undefined) {
            let xtk = 0;
            let dtk = 0;
            let distance = 0;
            let distanceToTurn = 0;
            let totalDistance = 0;
            if (data.turnMode === TurnMode.Egress && data.nextLeg !== undefined && data.nextLeg.calculated !== undefined) {
                const circle = FlightPathUtils.setGeoCircleFromVector(data.nextLeg.calculated.flightPath[0], this.geoCircleCache[0]);
                xtk = UnitType.GA_RADIAN.convertTo(circle.distance(data.state.pos), UnitType.NMILE);
                dtk = (_a = data.nextLeg.calculated.initialDtk) !== null && _a !== void 0 ? _a : 0;
                distance = this.getActiveDistance(data.nextLeg, data.state.pos);
                distanceToTurn = this.getDistanceToTurn(data.nextLeg, data.state.pos);
                SimVar.SetSimVarValue(LNavVars.DTK, 'degrees', dtk);
            }
            else if (data.currentLeg !== undefined && data.currentLeg.calculated !== undefined) {
                let vector = data.currentLeg.calculated.flightPath[data.vectorIndex];
                switch (data.currentLeg.leg.type) {
                    case LegType.DF:
                        vector = data.currentLeg.calculated.flightPath[data.currentLeg.calculated.flightPath.length - 1];
                        break;
                    case LegType.HM: {
                        const holdStartIndex = data.currentLeg.calculated.flightPath.length - 4;
                        if (data.vectorIndex < holdStartIndex + 2) {
                            vector = data.currentLeg.calculated.flightPath[holdStartIndex + 1];
                        }
                        else {
                            vector = data.currentLeg.calculated.flightPath[holdStartIndex + 3];
                        }
                    }
                }
                if (vector !== undefined) {
                    const circle = FlightPathUtils.setGeoCircleFromVector(vector, this.geoCircleCache[0]);
                    const alongTrackPos = circle.closest(data.state.pos, this.vec3Cache[0]);
                    xtk = UnitType.GA_RADIAN.convertTo(circle.distance(data.state.pos), UnitType.NMILE);
                    dtk = circle.bearingAt(alongTrackPos);
                    distance = this.getActiveDistance(data.currentLeg, data.state.pos);
                    distanceToTurn = this.getDistanceToTurn(data.currentLeg, data.state.pos);
                    totalDistance = this.getTotalDistance(distance);
                    SimVar.SetSimVarValue(LNavVars.DTK, 'degrees', NavMath.normalizeHeading(dtk - magVar));
                }
            }
            SimVar.SetSimVarValue(LNavVars.XTK, SimVarValueType.NM, xtk);
            SimVar.SetSimVarValue(LNavVars.Distance, SimVarValueType.Meters, distance);
            SimVar.SetSimVarValue(LNavVars.DistanceToTurn, SimVarValueType.Meters, distanceToTurn);
            SimVar.SetSimVarValue(LNavVars.DistanceToDestination, SimVarValueType.Meters, totalDistance);
        }
    }
    /**
     * Computes the CDI scaling for the given LNAV data.
     * @param data The LNAV data to compute with.
     */
    computeCDIScaling(data) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        let scaling = 2.0;
        let scalingLabel = CDIScaleLabel.Enroute;
        const flightPlan = this.flightPlanner.hasActiveFlightPlan() ? this.flightPlanner.getActiveFlightPlan() : undefined;
        if (data.state !== undefined && flightPlan && flightPlan.length > 0 && flightPlan.activeLateralLeg < flightPlan.length) {
            const activeSegment = flightPlan.getSegment(flightPlan.getSegmentIndex(flightPlan.activeLateralLeg));
            let previousLeg;
            try {
                previousLeg = flightPlan.getLeg(flightPlan.activeLateralLeg - 1);
            }
            catch ( /*Do nothing*/_j) { /*Do nothing*/ }
            //We are currently in the departure segment
            if (activeSegment.segmentType === FlightPlanSegmentType.Departure) {
                scaling = 0.3;
                scalingLabel = CDIScaleLabel.Departure;
                const prevLegType = previousLeg === null || previousLeg === void 0 ? void 0 : previousLeg.leg.type;
                if (prevLegType && prevLegType !== LegType.IF && prevLegType !== LegType.CA && prevLegType !== LegType.FA) {
                    scaling = 1.0;
                    scalingLabel = CDIScaleLabel.Terminal;
                }
            }
            //We are not in the departure segment any longer
            if (this.originFacility !== undefined && activeSegment.segmentType !== FlightPlanSegmentType.Departure) {
                const distance = UnitType.GA_RADIAN.convertTo(data.state.pos.distance(this.originFacility), UnitType.NMILE);
                scaling = 2.0 - NavMath.clamp(31 - distance, 0, 1);
                if (distance <= 30) {
                    scalingLabel = CDIScaleLabel.Terminal;
                }
            }
            //Check for distance to destination
            if (this.destinationFacility !== undefined && activeSegment.segmentType !== FlightPlanSegmentType.Departure) {
                const distance = UnitType.GA_RADIAN.convertTo(data.state.pos.distance(this.destinationFacility), UnitType.NMILE);
                scaling = 2.0 - NavMath.clamp(31 - distance, 0, 1);
                if (distance <= 30) {
                    scalingLabel = CDIScaleLabel.Terminal;
                }
            }
            //Check for distance from arrival start
            if (activeSegment.segmentType === FlightPlanSegmentType.Arrival && activeSegment.legs.length > 1) {
                const firstArrivalLeg = activeSegment.legs[1];
                //If we're going from the start of the arrival (i.e. the second leg)
                if (flightPlan.activeLateralLeg === activeSegment.offset + 1
                    && ((_a = firstArrivalLeg.calculated) === null || _a === void 0 ? void 0 : _a.startLat) !== undefined
                    && ((_b = firstArrivalLeg.calculated) === null || _b === void 0 ? void 0 : _b.startLon) !== undefined
                    && ((_c = firstArrivalLeg.calculated) === null || _c === void 0 ? void 0 : _c.endLat) !== undefined
                    && ((_d = firstArrivalLeg.calculated) === null || _d === void 0 ? void 0 : _d.endLon) !== undefined) {
                    const start = this.geoPointCache[0].set(firstArrivalLeg.calculated.startLat, firstArrivalLeg.calculated.startLon);
                    const end = this.geoPointCache[1].set(firstArrivalLeg.calculated.endLat, firstArrivalLeg.calculated.endLon);
                    const distance = NavMath.alongTrack(start, end, data.state.pos);
                    scaling = 2.0 - NavMath.clamp(distance, 0, 1);
                    if (distance >= 1) {
                        scalingLabel = CDIScaleLabel.Terminal;
                    }
                }
                else if (flightPlan.activeLateralLeg > activeSegment.offset + 1) {
                    scaling = 1.0;
                    scalingLabel = CDIScaleLabel.Terminal;
                }
            }
            //We are in the approach
            if (activeSegment.segmentType === FlightPlanSegmentType.Approach) {
                scaling = 1.0;
                scalingLabel = CDIScaleLabel.Terminal;
                const fafIndex = this.getFafIndex(activeSegment);
                if (fafIndex !== undefined && flightPlan.activeLateralLeg === fafIndex) {
                    const fafCalc = flightPlan.getLeg(fafIndex).calculated;
                    if ((fafCalc === null || fafCalc === void 0 ? void 0 : fafCalc.endLat) !== undefined && (fafCalc === null || fafCalc === void 0 ? void 0 : fafCalc.endLon) !== undefined) {
                        const distance = UnitType.GA_RADIAN.convertTo(data.state.pos.distance(fafCalc.endLat, fafCalc.endLon), UnitType.NMILE);
                        scaling = 1.0 - (0.7 * (NavMath.clamp(2 - distance, 0, 2) / 2));
                        if (distance <= 2) {
                            scalingLabel = this.getApproachCdiScale();
                        }
                    }
                }
                else if (((_f = (_e = data.currentLeg) === null || _e === void 0 ? void 0 : _e.calculated) === null || _f === void 0 ? void 0 : _f.endLat) && ((_h = (_g = data.currentLeg) === null || _g === void 0 ? void 0 : _g.calculated) === null || _h === void 0 ? void 0 : _h.endLon) && fafIndex !== undefined && flightPlan.activeLateralLeg > fafIndex) {
                    if (data.currentLeg && data.currentLeg.isInMissedApproachSequence) {
                        scaling = 1.0;
                        scalingLabel = CDIScaleLabel.MissedApproach;
                    }
                    else {
                        const legLength = data.currentLeg.calculated.distance;
                        const distance = UnitType.GA_RADIAN.convertTo(data.state.pos.distance(data.currentLeg.calculated.endLat, data.currentLeg.calculated.endLon), UnitType.NMILE);
                        scaling = 0.3 - (0.112 * (NavMath.clamp(legLength - distance, 0, legLength) / legLength));
                        scalingLabel = this.getApproachCdiScale();
                    }
                }
            }
        }
        SimVar.SetSimVarValue(LNavVars.CDIScale, SimVarValueType.NM, scaling);
        SimVar.SetSimVarValue(LNavVars.CDIScaleLabel, SimVarValueType.Number, scalingLabel);
    }
    /**
     * Gets the index of the FAF in a segment.
     * @param segment The segment to search.
     * @returns The index of the FAF if found.
     */
    getFafIndex(segment) {
        let fafLeg = segment.legs[segment.legs.length - 2];
        let fafIndex = segment.legs.length - 2;
        for (let i = 0; i < segment.legs.length; i++) {
            const leg = segment.legs[i];
            if (leg.leg.fixTypeFlags & FixTypeFlags.FAF) {
                fafLeg = leg;
                fafIndex = i;
                break;
            }
        }
        if (fafLeg !== undefined) {
            return segment.offset + fafIndex;
        }
    }
    /**
     * Gets the active distance from the plane position to the leg end.
     * @param leg The leg to get the distance for.
     * @param pos The current plane position.
     * @returns The distance, in meters.
     */
    getActiveDistance(leg, pos) {
        var _a;
        const finalVector = (_a = leg.calculated) === null || _a === void 0 ? void 0 : _a.flightPath[leg.calculated.flightPath.length - 1];
        if (finalVector !== undefined) {
            return UnitType.GA_RADIAN.convertTo(pos.distance(finalVector.endLat, finalVector.endLon), UnitType.METER);
        }
        return 0;
    }
    /**
     * Gets the total distance from the plane position to the destination leg.
     * @param activeDistance The distance from the present position to the current leg end.
     * @returns The distance, in meters.
     */
    getTotalDistance(activeDistance) {
        var _a, _b;
        const plan = this.flightPlanner.getActiveFlightPlan();
        const activeLegCumulativeDistance = plan.activeLateralLeg < plan.length
            ? (_a = plan.getLeg(plan.activeLateralLeg).calculated) === null || _a === void 0 ? void 0 : _a.cumulativeDistanceWithTurns
            : undefined;
        let lastLegIndex = Math.max(0, plan.length - 1);
        if (plan.length > 1) {
            const finalSegment = plan.getSegment(plan.getSegmentIndex(plan.length - 1));
            for (let i = finalSegment.legs.length - 1; i >= 0; i--) {
                const leg = finalSegment.legs[i];
                if (!leg.isInMissedApproachSequence) {
                    lastLegIndex = i + finalSegment.offset;
                    break;
                }
            }
        }
        const destinationLegCumulativeDistance = (_b = plan.getLeg(lastLegIndex).calculated) === null || _b === void 0 ? void 0 : _b.cumulativeDistanceWithTurns;
        if (destinationLegCumulativeDistance !== undefined && activeLegCumulativeDistance !== undefined && activeDistance >= 0) {
            return destinationLegCumulativeDistance - activeLegCumulativeDistance + activeDistance;
        }
        return 0;
    }
    /**
     * Gets the active distance from the plane position to the next leg turn.
     * @param leg The leg to get the distance for.
     * @param pos The current plane position.
     * @returns The distance, in meters.
     */
    getDistanceToTurn(leg, pos) {
        if (leg.calculated !== undefined) {
            if (leg.calculated.egressTurn.radius !== 0) {
                return UnitType.GA_RADIAN.convertTo(pos.distance(leg.calculated.egressTurn.startLat, leg.calculated.egressTurn.startLon), UnitType.METER);
            }
            else {
                return this.getActiveDistance(leg, pos);
            }
        }
        return 0;
    }
    /**
     * Checks and sets whether obs is available on the current leg and sends an event over the bus to update the softkeymenu.
     * @param currentLegType The current leg type.
     */
    setObsAvailable(currentLegType) {
        let newObsAvailable = false;
        switch (currentLegType) {
            case LegType.AF:
            case LegType.CD:
            case LegType.CF:
            case LegType.CR:
            case LegType.DF:
            case LegType.IF:
            case LegType.RF:
            case LegType.TF:
                newObsAvailable = true;
                break;
        }
        if (newObsAvailable !== this.obsAvailable) {
            this.obsAvailable = newObsAvailable;
            this.bus.getPublisher().pub('obs_available', this.obsAvailable, true, true);
        }
    }
    /**
     * Checks and returns the CDI Scale when in an approach.
     * @returns The CDIScaleLabel appropriate for the approach.
     */
    getApproachCdiScale() {
        switch (this.approachDetails.approachType) {
            case ApproachType.APPROACH_TYPE_GPS:
            case ApproachType.APPROACH_TYPE_RNAV:
                switch (this.approachDetails.approachRnavType) {
                    case RnavTypeFlags.LPV:
                        return CDIScaleLabel.LPV;
                    case RnavTypeFlags.LP:
                        return CDIScaleLabel.LPPlusV;
                    case RnavTypeFlags.LNAVVNAV:
                        return CDIScaleLabel.LNavVNav;
                }
                return CDIScaleLabel.LNavPlusV;
            case AdditionalApproachType.APPROACH_TYPE_VISUAL:
                return CDIScaleLabel.Visual;
            default:
                return CDIScaleLabel.Terminal;
        }
    }
}
