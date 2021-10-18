import { GeoPoint, Subject, UnitType } from 'msfssdk';
import { NavSourceType } from 'msfssdk/instruments';
import { FacilityType, FixTypeFlags, ICAO, RunwayUtils, LegType, FacilityLoader, AltitudeRestrictionType, FacilityRespository, RnavTypeFlags, AdditionalApproachType } from 'msfssdk/navigation';
import { ActiveLegType, FlightPlan, FlightPlanSegmentType, FlightPathCalculator } from 'msfssdk/flightplan';
import { FmsUtils } from './FmsUtils';
export var DirectToState;
(function (DirectToState) {
    DirectToState[DirectToState["NONE"] = 0] = "NONE";
    DirectToState[DirectToState["TOEXISTING"] = 1] = "TOEXISTING";
    DirectToState[DirectToState["TORANDOM"] = 2] = "TORANDOM";
})(DirectToState || (DirectToState = {}));
export var ProcedureType;
(function (ProcedureType) {
    ProcedureType[ProcedureType["DEPARTURE"] = 0] = "DEPARTURE";
    ProcedureType[ProcedureType["ARRIVAL"] = 1] = "ARRIVAL";
    ProcedureType[ProcedureType["APPROACH"] = 2] = "APPROACH";
    ProcedureType[ProcedureType["VISUALAPPROACH"] = 3] = "VISUALAPPROACH";
})(ProcedureType || (ProcedureType = {}));
export var AirwayLegType;
(function (AirwayLegType) {
    AirwayLegType[AirwayLegType["NONE"] = 0] = "NONE";
    AirwayLegType[AirwayLegType["ENTRY"] = 1] = "ENTRY";
    AirwayLegType[AirwayLegType["EXIT"] = 2] = "EXIT";
    AirwayLegType[AirwayLegType["ONROUTE"] = 3] = "ONROUTE";
    AirwayLegType[AirwayLegType["EXIT_ENTRY"] = 4] = "EXIT_ENTRY";
})(AirwayLegType || (AirwayLegType = {}));
/**
 * A fms menu system tracker.
 */
export class Fms {
    /**
     * Initialize an instance of the FMS.
     * @param bus is the event bus
     * @param flightPlanner is the flight planner
     * @param viewService the popout menu service
     * @param g1000EvtPub is the G1000 Control Publisher
     * @param autopilot is the optional autopilot.
     */
    constructor(bus, flightPlanner, viewService, g1000EvtPub, autopilot) {
        this.bus = bus;
        this.flightPlanner = flightPlanner;
        this.autopilot = autopilot;
        this.ppos = new GeoPoint(0, 0);
        this.facRepo = FacilityRespository.getRepository(this.bus);
        this.facLoader = new FacilityLoader(this.facRepo);
        this.calculator = new FlightPathCalculator(this.facLoader, { defaultClimbRate: 300, defaultSpeed: 85, bankAngle: 15 });
        this.approachDetails = {
            approachLoaded: false,
            approachType: ApproachType.APPROACH_TYPE_UNKNOWN,
            approachRnavType: RnavTypeFlags.None,
            approachIsActive: false
        };
        this.approachFrequency = Subject.create(undefined);
        this._lastApproachFrequencyEventValue = undefined;
        this.cdiSource = { type: NavSourceType.Gps, index: 1 };
        this.missedApproachActive = false;
        /**
         * Sets the approach details when an approach_details_set event is received from the bus.
         * @param approachDetails The approachDetails received from the bus.
         */
        this.onApproachDetailsSet = (approachDetails) => {
            if (approachDetails !== this.approachDetails) {
                this.approachDetails = approachDetails;
            }
        };
        if (viewService) {
            Fms.viewService = viewService;
        }
        if (g1000EvtPub) {
            Fms.g1000EvtPub = g1000EvtPub;
        }
        this.bus.getSubscriber().on('gps-position').atFrequency(1).handle(pos => this.ppos.set(pos.lat, pos.long));
        this.bus.getSubscriber().on('cdi_select').handle(source => this.cdiSource = source);
        const planEvents = this.bus.getSubscriber();
        planEvents.on('fplActiveLegChange').handle(data => this.onActiveLegChanged(data.type, data.planIndex));
        planEvents.on('fplLoaded').handle(() => this.checkApproachState());
        this.approachFrequency.sub((v) => {
            if (v !== this._lastApproachFrequencyEventValue) {
                g1000EvtPub.publishEvent('approach_freq_set', v);
            }
        });
        const g1000Events = this.bus.getSubscriber();
        g1000Events.on('approach_freq_set').handle((v) => {
            this._lastApproachFrequencyEventValue = v;
            this.approachFrequency.set(v);
        });
        g1000Events.on('activate_missed_approach').handle(v => {
            this.missedApproachActive = v;
            if (this.missedApproachActive) {
                Fms.g1000EvtPub.publishEvent('suspend', false);
                this.setApproachDetails(undefined, undefined, undefined, false);
            }
        });
        g1000Events.on('approach_details_set').handle(this.onApproachDetailsSet);
    }
    /**
     * Initializes the primary flight plan. Does nothing if the primary flight plan already exists.
     */
    async initPrimaryFlightPlan() {
        if (this.flightPlanner.hasFlightPlan(Fms.PRIMARY_PLAN_INDEX)) {
            return;
        }
        this.flightPlanner.createFlightPlan(Fms.PRIMARY_PLAN_INDEX);
        await this.emptyPrimaryFlightPlan();
    }
    /**
     * Gets a specified flightplan, or by default the primary flight plan.
     * @param index The index of the flight plan.
     * @returns the requested flight plan
     * @throws Error if no flight plan exists at the specified index.
     */
    getFlightPlan(index = Fms.PRIMARY_PLAN_INDEX) {
        return this.flightPlanner.getFlightPlan(index);
    }
    /**
     * Checks whether the primary flight plan exists.
     * @returns Whether the primary flight plan exists.
     */
    hasPrimaryFlightPlan() {
        return this.flightPlanner.hasFlightPlan(Fms.PRIMARY_PLAN_INDEX);
    }
    /**
     * Gets the primary flight plan.
     * @returns The primary flight plan.
     * @throws Error if the primary flight plan does not exist.
     */
    getPrimaryFlightPlan() {
        return this.flightPlanner.getFlightPlan(Fms.PRIMARY_PLAN_INDEX);
    }
    /**
     * Checks whether the Direct To Random flight plan exists.
     * @returns Whether the Direct To Random flight plan exists.
     */
    hasDirectToFlightPlan() {
        return this.flightPlanner.hasFlightPlan(Fms.DTO_RANDOM_PLAN_INDEX);
    }
    /**
     * Gets the Direct To Random flight plan.
     * @returns The Direct To Random flight plan.
     * @throws Error if the Direct To Random flight plan does not exist.
     */
    getDirectToFlightPlan() {
        return this.flightPlanner.getFlightPlan(Fms.DTO_RANDOM_PLAN_INDEX);
    }
    /**
     * Gets the procedure preview flight plan.
     * @returns The procedure preview flight plan.
     * @throws Error if the procedure preview flight plan does not exist.
     */
    getProcPreviewFlightPlan() {
        return this.flightPlanner.getFlightPlan(Fms.PROC_PREVIEW_PLAN_INDEX);
    }
    /**
     * Handles when a flight plan active leg changes.
     * @param legType The type of flight plan active leg change.
     * @param planIndex The index of the plan whose active leg changed.
     */
    onActiveLegChanged(legType, planIndex) {
        if (legType === ActiveLegType.Lateral && planIndex === 0) {
            const activePlan = this.flightPlanner.getActiveFlightPlan();
            if (activePlan.length > 0 && !this.missedApproachActive) {
                const activeSegment = activePlan.getSegment(activePlan.getSegmentIndex(Math.max(0, activePlan.activeLateralLeg)));
                if (activeSegment.segmentType === FlightPlanSegmentType.Approach && activePlan.activeLateralLeg - activeSegment.offset > 0) {
                    this.setApproachDetails(undefined, undefined, undefined, true);
                }
                else {
                    this.setApproachDetails(undefined, undefined, undefined, false);
                }
            }
            else {
                this.setApproachDetails(undefined, undefined, undefined, false);
            }
            if (!this.missedApproachActive && activePlan.activeLateralLeg < activePlan.length - 1 && activePlan.getLeg(activePlan.activeLateralLeg).isInMissedApproachSequence) {
                Fms.g1000EvtPub.publishEvent('activate_missed_approach', true);
            }
        }
    }
    /**
     * A method to check the current approach state.
     */
    async checkApproachState() {
        const plan = this.getFlightPlan();
        let approachLoaded = false;
        let approachIsActive = false;
        let approachType;
        let approachRnavType;
        if (plan.destinationAirport && (plan.procedureDetails.approachIndex > -1 || plan.getUserData('visual_approach') !== undefined)) {
            approachLoaded = true;
            if (plan.length > 0 && plan.activeLateralLeg < plan.length && plan.activeLateralLeg > 0) {
                const segment = plan.getSegment(plan.getSegmentIndex(plan.activeLateralLeg));
                approachIsActive = segment.segmentType === FlightPlanSegmentType.Approach;
            }
            if (plan.procedureDetails.approachIndex > -1) {
                const facility = await this.facLoader.getFacility(FacilityType.Airport, plan.destinationAirport);
                const approach = facility.approaches[plan.procedureDetails.approachIndex];
                if (approach) {
                    approachType = approach.approachType;
                    approachRnavType = FmsUtils.getBestRnavType(approach.rnavTypeFlags);
                }
            }
            else {
                approachType = AdditionalApproachType.APPROACH_TYPE_VISUAL;
                approachRnavType = RnavTypeFlags.None;
            }
        }
        this.setApproachDetails(approachLoaded, approachType, approachRnavType, approachIsActive);
    }
    /**
     * Removes the direct to existing legs from the primary flight plan. If a direct to existing is currently active,
     * this will effectively cancel it.
     * @param lateralLegIndex The index of the leg to set as the active lateral leg after the removal operation. Defaults
     * to the index of the current active primary flight plan leg.
     */
    removeDirectToExisting(lateralLegIndex) {
        const plan = this.getFlightPlan();
        const directToData = plan.directToData;
        if (directToData && directToData.segmentIndex > -1) {
            plan.removeLeg(directToData.segmentIndex, directToData.segmentLegIndex + 1, true);
            plan.removeLeg(directToData.segmentIndex, directToData.segmentLegIndex + 1, true);
            plan.removeLeg(directToData.segmentIndex, directToData.segmentLegIndex + 1, true);
            const activateIndex = lateralLegIndex !== null && lateralLegIndex !== void 0 ? lateralLegIndex : plan.activeLateralLeg;
            const adjustedActivateIndex = activateIndex - Utils.Clamp(activateIndex - (plan.getSegment(directToData.segmentIndex).offset + directToData.segmentLegIndex), 0, 3);
            plan.setDirectToData(-1, true);
            plan.setLateralLeg(adjustedActivateIndex);
            plan.calculate(Math.min(0, plan.activeLateralLeg));
        }
    }
    /**
     * Checks whether a leg in the primary flight plan is a valid direct to target.
     * @param segmentIndex The index of the segment in which the leg resides.
     * @param segmentLegIndex The index of the leg in its segment.
     * @returns Whether the leg is a valid direct to target.
     */
    canDirectTo(segmentIndex, segmentLegIndex) {
        const plan = this.getFlightPlan();
        const segment = plan.getSegment(segmentIndex);
        const leg = segment.legs[segmentLegIndex];
        if (leg.leg.fixIcao === '' || leg.leg.fixIcao === ICAO.emptyIcao) {
            return false;
        }
        switch (leg.leg.type) {
            case LegType.IF:
            case LegType.TF:
            case LegType.DF:
            case LegType.CF:
            case LegType.AF:
            case LegType.RF:
                return true;
        }
        return false;
    }
    /**
     * Gets the current Direct To State.
     * @returns the DirectToState.
     */
    getDirectToState() {
        if (this.flightPlanner.activePlanIndex == 1 && this.getFlightPlan(1).getSegment(0).segmentType === FlightPlanSegmentType.RandomDirectTo) {
            return DirectToState.TORANDOM;
        }
        else {
            const plan = this.getFlightPlan();
            const directDataExists = plan.directToData.segmentIndex > -1 && plan.directToData.segmentLegIndex > -1;
            if (directDataExists && plan.segmentCount >= plan.directToData.segmentIndex
                && plan.getLegIndexFromLeg(plan.getSegment(plan.directToData.segmentIndex).legs[plan.directToData.segmentLegIndex]) === plan.activeLateralLeg - 3) {
                return DirectToState.TOEXISTING;
            }
        }
        return DirectToState.NONE;
    }
    /**
     * Gets the ICAO string of the current Direct To target.
     * @returns The ICAO string of the current Direct To target, or undefined if Direct To is not active.
     */
    getDirectToTargetIcao() {
        var _a;
        return (_a = this.getDirectToLeg()) === null || _a === void 0 ? void 0 : _a.fixIcao;
    }
    /**
     * Gets the current DTO Target Flight Plan Leg.
     * @returns the FlightPlanLeg.
     */
    getDirectToLeg() {
        switch (this.getDirectToState()) {
            case DirectToState.TORANDOM: {
                const plan = this.getDirectToFlightPlan();
                return plan.getSegment(0).legs[2].leg;
            }
            case DirectToState.TOEXISTING: {
                const plan = this.getFlightPlan();
                return plan.getSegment(plan.directToData.segmentIndex).legs[plan.directToData.segmentLegIndex + 3].leg;
            }
        }
        return undefined;
    }
    /**
     * Checks if a segment is the first enroute segment that is not an airway.
     * @param segmentIndex is the segment index of the segment to check
     * @returns whether or not the segment is the first enroute segment that is not an airway.
     */
    isFirstEnrouteSegment(segmentIndex) {
        const plan = this.getFlightPlan();
        for (let i = 0; i < plan.segmentCount; i++) {
            const segment = plan.getSegment(i);
            if (segment.segmentType === FlightPlanSegmentType.Enroute && !segment.airway) {
                return i === segmentIndex;
            }
        }
        return false;
    }
    /**
     * Adds a user facility.
     * @param userFacility the facility to add.
     */
    addUserFacility(userFacility) {
        this.facRepo.add(userFacility);
    }
    /**
     * Removes a user facility.
     * @param userFacility the facility to remove.
     */
    removeUserFacility(userFacility) {
        this.facRepo.remove(userFacility);
    }
    /**
     * Adds a visual or runway facility from the FlightPlanLeg.
     * @param leg the leg to build the facility from.
     * @param visualRunwayDesignation is the visual runway this facility belongs to.
     */
    addVisualFacilityFromLeg(leg, visualRunwayDesignation) {
        const fac = {
            icao: leg.fixIcao,
            lat: leg.lat !== undefined ? leg.lat : 0,
            lon: leg.lon !== undefined ? leg.lon : 0,
            approach: `VISUAL ${visualRunwayDesignation}`,
            city: '',
            name: `${visualRunwayDesignation} - ${ICAO.getIdent(leg.fixIcao)}`,
            region: '',
            magvar: 0
        };
        this.facRepo.add(fac);
    }
    /**
     * Method to insert a waypoint to the flightplan.
     * @param segmentIndex is index of the segment to add the waypoint to
     * @param facility is the new facility to add a leg to.
     * @param legIndex is the index to insert the waypoint (if none, append)
     * @returns whether the waypoint was successfully inserted.
     */
    insertWaypoint(segmentIndex, facility, legIndex) {
        var _a;
        const leg = FlightPlan.createLeg({
            type: LegType.TF,
            fixIcao: facility.icao
        });
        const plan = this.getFlightPlan();
        const segment = plan.getSegment(segmentIndex);
        const prevLeg = plan.getPrevLeg(segmentIndex, legIndex !== null && legIndex !== void 0 ? legIndex : Infinity);
        const nextLeg = plan.getNextLeg(segmentIndex, legIndex === undefined ? Infinity : legIndex - 1);
        // Make sure we are not inserting a duplicate leg
        if ((prevLeg && this.isDuplicateLeg(prevLeg.leg, leg)) || (nextLeg && this.isDuplicateLeg(leg, nextLeg.leg))) {
            return false;
        }
        // Deal with whether this insert is in an airway segment
        if (segment.airway) {
            //check to see if this insert will leave more than 1 airway leg
            if (!legIndex || segment.legs.length - legIndex < 3) {
                // we don't need another airway segment,
                // we just need to add the inserted segment, the remaining airway segments into the next enroute segment
                const nextSegment = plan.getSegment(segmentIndex + 1);
                if (nextSegment.airway || nextSegment.segmentType !== FlightPlanSegmentType.Enroute) {
                    //the next segment is an airway, arrival, approach or destination, so we need to add an enroute segment
                    this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex + 1);
                }
                //now we can add the new leg into the next enroute segment
                this.planAddLeg(segmentIndex + 1, leg);
                //get the legs after the insert index from the first airway segment, if any, and move them to the second airway segment
                legIndex = legIndex ? legIndex : segment.legs.length - 1;
                const legsToMove = [];
                const legsLength = segment.legs.length;
                for (let i = legIndex; i < legsLength; i++) {
                    legsToMove.push(segment.legs[i].leg);
                }
                for (let j = legsLength - 1; j >= legIndex; j--) {
                    this.planRemoveLeg(segmentIndex, j, true, true);
                }
                for (let k = 0; k < legsToMove.length; k++) {
                    this.planAddLeg(segmentIndex + 1, legsToMove[k]);
                }
            }
            else {
                //we need to create a new airway segment
                //split the segment into three
                this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex + 1);
                this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex + 1);
                const newAirwaySegment = plan.getSegment(segmentIndex + 2);
                //add the leg to the new enroute segment (between the old and new airway segments)
                this.planAddLeg(segmentIndex + 1, leg);
                //get the legs after the insert index from the first airway segment, if any, and move them to the second airway segment
                legIndex = legIndex ? legIndex : segment.legs.length - 1;
                const legsToMove = [];
                const legsLength = segment.legs.length;
                for (let i = legIndex; i < legsLength; i++) {
                    legsToMove.push(segment.legs[i].leg);
                }
                for (let j = legsLength - 1; j >= legIndex; j--) {
                    this.planRemoveLeg(segmentIndex, j, true, true);
                }
                this.planAddLeg(segmentIndex + 1, legsToMove[0]);
                for (let k = 1; k < legsToMove.length; k++) {
                    this.planAddLeg(segmentIndex + 2, legsToMove[k]);
                }
                const airway = (_a = segment.airway) === null || _a === void 0 ? void 0 : _a.split('.');
                segment.airway = airway && airway[0] ? airway[0] + '.' + segment.legs[legIndex - 1].name : segment.airway;
                plan.setAirway(segmentIndex, segment.airway);
                newAirwaySegment.airway = airway && airway[0] ? airway[0] + '.' + newAirwaySegment.legs[newAirwaySegment.legs.length - 1].name : segment.airway;
                plan.setAirway(segmentIndex + 2, newAirwaySegment.airway);
            }
            return true;
        }
        this.planAddLeg(segmentIndex, leg, legIndex);
        return true;
    }
    /**
     * Method to delete a waypoint from the flightplan.
     * @param segmentIndex is the index of the segment containing the leg to delete.
     * @param legIndex is the index of the leg to delete in the segment.
     * @returns whether the waypoint was successfully deleted.
     */
    deleteWaypoint(segmentIndex, legIndex) {
        return this.planRemoveLeg(segmentIndex, legIndex);
    }
    /**
     * Gets the airway leg type of a flight plan leg.
     * @param plan The flight plan containing the query leg.
     * @param segmentIndex The index of the flight plan segment containing the query leg.
     * @param segmentLegIndex The index of the query leg in its segment.
     * @returns The airway leg type of the query leg.
     */
    getAirwayLegType(plan, segmentIndex, segmentLegIndex) {
        const segment = plan.getSegment(segmentIndex);
        const segmentIsAirway = segment.airway !== undefined;
        const nextSegmentIsAirway = segmentIndex + 1 < plan.segmentCount && plan.getSegment(segmentIndex + 1).airway !== undefined;
        const legIsLast = segmentLegIndex == segment.legs.length - 1;
        if ((segmentIsAirway && legIsLast && nextSegmentIsAirway)) {
            return AirwayLegType.EXIT_ENTRY;
        }
        if ((legIsLast && nextSegmentIsAirway)) {
            return AirwayLegType.ENTRY;
        }
        if (segmentIsAirway) {
            if (legIsLast) {
                return AirwayLegType.EXIT;
            }
            return AirwayLegType.ONROUTE;
        }
        return AirwayLegType.NONE;
    }
    /**
     * Method to get the distance of an airway segment.
     * @param segmentIndex is the index of the segment of the airway.
     * @returns the cumulative distance for the airway segment.
     */
    getAirwayDistance(segmentIndex) {
        var _a, _b, _c, _d;
        const plan = this.getFlightPlan();
        const segment = plan.getSegment(segmentIndex);
        const entrySegment = plan.getSegment(segmentIndex - 1);
        const entryCumulativeDistance = (_b = (_a = entrySegment.legs[entrySegment.legs.length - 1]) === null || _a === void 0 ? void 0 : _a.calculated) === null || _b === void 0 ? void 0 : _b.cumulativeDistance;
        const exitCumulativeDistance = (_d = (_c = segment.legs[segment.legs.length - 1]) === null || _c === void 0 ? void 0 : _c.calculated) === null || _d === void 0 ? void 0 : _d.cumulativeDistance;
        return exitCumulativeDistance && entryCumulativeDistance ? exitCumulativeDistance - entryCumulativeDistance : -1;
    }
    /**
     * Method to add a new origin airport and runway to the flight plan.
     * @param airport is the facility of the origin airport.
     * @param runway is the onewayrunway
     */
    setOrigin(airport, runway) {
        const plan = this.getFlightPlan();
        const segmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Departure);
        if (airport) {
            plan.setOriginAirport(airport.icao);
            plan.setOriginRunway(runway);
            this.planClearSegment(segmentIndex, FlightPlanSegmentType.Departure);
            this.planAddOriginDestinationLeg(true, segmentIndex, airport, runway);
            const prevLeg = plan.getPrevLeg(segmentIndex, 1);
            const nextLeg = plan.getNextLeg(segmentIndex, 0);
            if (prevLeg && nextLeg && this.isDuplicateLeg(prevLeg.leg, nextLeg.leg)) {
                this.planRemoveDuplicateLeg(prevLeg, nextLeg);
            }
        }
        else {
            plan.removeOriginAirport();
            this.setApproachDetails(false, ApproachType.APPROACH_TYPE_UNKNOWN, RnavTypeFlags.None, false);
            this.planClearSegment(segmentIndex, FlightPlanSegmentType.Departure);
        }
        plan.calculate(0);
    }
    /**
     * Method to add a new destination airport and runway to the flight plan.
     * @param airport is the facility of the destination airport.
     * @param runway is the selected runway at the destination facility.
     */
    setDestination(airport, runway) {
        const plan = this.getFlightPlan();
        const destSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Destination);
        if (airport) {
            plan.setDestinationAirport(airport.icao);
            plan.setDestinationRunway(runway);
            this.planClearSegment(destSegmentIndex, FlightPlanSegmentType.Destination);
            const hasArrival = plan.procedureDetails.arrivalIndex > -1;
            const hasApproach = plan.procedureDetails.approachIndex > -1;
            if (!hasArrival && !hasApproach) {
                this.planAddOriginDestinationLeg(false, destSegmentIndex, airport, runway);
            }
        }
        else {
            plan.removeDestinationAirport();
            this.planClearSegment(destSegmentIndex, FlightPlanSegmentType.Destination);
        }
        plan.calculate(0);
    }
    /**
     * Method to remove runway or airport legs from segments where they shouldn't exist.
     */
    removeDestLegFromSegments() {
        const plan = this.getFlightPlan();
        const destination = plan.destinationAirport;
        const hasArrival = plan.procedureDetails.arrivalIndex > -1;
        const hasApproach = plan.procedureDetails.approachIndex > -1 || plan.getUserData('visual_approach');
        const destinationSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Destination);
        const destinationSegment = plan.getSegment(destinationSegmentIndex);
        if (hasApproach && destination) {
            if (hasArrival) {
                const arrivalSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Arrival);
                const arrival = plan.getSegment(arrivalSegmentIndex);
                const lastArrivalLegIcao = arrival.legs[arrival.legs.length - 1].leg.fixIcao;
                if (lastArrivalLegIcao === destination || lastArrivalLegIcao.search('R') === 0) {
                    this.planRemoveLeg(arrivalSegmentIndex, arrival.legs.length - 1);
                }
            }
            if (destinationSegment.legs.length > 0) {
                this.planClearSegment(destinationSegmentIndex, FlightPlanSegmentType.Destination);
            }
        }
        else if (hasArrival && destination) {
            if (destinationSegment.legs.length > 0) {
                this.planClearSegment(destinationSegmentIndex, FlightPlanSegmentType.Destination);
            }
        }
    }
    /**
     * Method to ensure only one segment of a specific type exists in the flight plan and optionally insert it if needed.
     * @param segmentType is the segment type we want to evaluate.
     * @param insert is whether to insert the segment if missing
     * @returns segmentIndex of the only segment of this type in the flight plan.
     */
    ensureOnlyOneSegmentOfType(segmentType, insert = true) {
        const plan = this.getFlightPlan();
        let segmentIndex;
        const selectedSegments = plan.segmentsOfType(segmentType);
        const segmentIndexArray = [];
        for (const element of selectedSegments) {
            segmentIndexArray.push(element.segmentIndex);
        }
        if (segmentIndexArray.length === 0) {
            if (insert) {
                segmentIndex = this.planInsertSegmentOfType(segmentType);
            }
            else {
                segmentIndex = -1;
            }
        }
        else if (segmentIndexArray.length > 1) {
            for (let i = 0; i < segmentIndexArray.length; i++) {
                this.planRemoveSegment(segmentIndexArray[i]);
            }
            segmentIndex = this.planInsertSegmentOfType(segmentType);
        }
        else {
            segmentIndex = segmentIndexArray[0];
        }
        return segmentIndex;
    }
    /**
     * Method to invert the flightplan.
     */
    invertFlightplan() {
        var _a;
        const plan = this.getFlightPlan();
        const activeLegIcao = plan.getLeg(plan.activeLateralLeg).leg.fixIcao;
        if (plan.directToData.segmentIndex >= 0 && plan.directToData.segmentLegIndex >= 0) {
            this.removeDirectToExisting();
        }
        if (!Simplane.getIsGrounded() && activeLegIcao) {
            this.buildRandomDirectTo(activeLegIcao);
        }
        const newOriginIcao = plan.destinationAirport;
        const newDestinationIcao = plan.originAirport;
        const lastEnrouteSegmentIndex = this.findLastEnrouteSegmentIndex(plan);
        if (lastEnrouteSegmentIndex === 1 && plan.getSegment(1).legs.length > 0) {
            //case for when there is only 1 enroute segment and it has at least 1 waypoint, a simple reversal is all that's required.
            const segment = Object.assign({}, plan.getSegment(1));
            this.emptyPrimaryFlightPlan();
            for (let l = segment.legs.length - 1; l >= 0; l--) {
                plan.addLeg(1, segment.legs[l].leg);
            }
        }
        else if (lastEnrouteSegmentIndex > 1) {
            //case for when there is more than 1 enroute segment we know we have to deal with airways
            const legs = [];
            for (let i = 1; i <= lastEnrouteSegmentIndex; i++) {
                //create a temporary list of legs that looks like what a flight plan import looks like with ICAO and the airway
                //we fly FROM the leg on.
                const oldSegment = plan.getSegment(i);
                const airway = oldSegment.airway ? (_a = oldSegment.airway) === null || _a === void 0 ? void 0 : _a.split('.')[0] : undefined;
                for (const leg of oldSegment.legs) {
                    const legListItem = { icao: leg.leg.fixIcao, airway: airway };
                    legs.push(legListItem);
                }
            }
            //after the array of legs is complete, we just reverse it
            legs.reverse();
            this.emptyPrimaryFlightPlan();
            let currentSegment = 1;
            let lastLegWasAirway = false;
            //last we go through each leg and use the same logic we use for the flight plan import to go through each leg and create airway
            //segments as appropriate for these legs.
            for (let i = 0; i < legs.length; i++) {
                const wpt = legs[i];
                const segment = plan.getSegment(currentSegment);
                if (wpt.airway) {
                    const leg = FlightPlan.createLeg({
                        type: LegType.TF,
                        fixIcao: wpt.icao
                    });
                    plan.addLeg(currentSegment, leg);
                    if (!lastLegWasAirway) {
                        plan.insertSegment(currentSegment + 1, FlightPlanSegmentType.Enroute, wpt.airway);
                        currentSegment += 1;
                    }
                    for (let j = i + 1; j < legs.length; j++) {
                        i++;
                        const airwayLeg = FlightPlan.createLeg({
                            type: LegType.TF,
                            fixIcao: legs[j].icao
                        });
                        plan.addLeg(currentSegment, airwayLeg);
                        if (legs[j].airway !== wpt.airway) {
                            lastLegWasAirway = legs[j].airway ? true : false;
                            break;
                        }
                    }
                    plan.setAirway(currentSegment, wpt.airway + '.' + ICAO.getIdent(legs[i].icao));
                    currentSegment += 1;
                    plan.insertSegment(currentSegment, FlightPlanSegmentType.Enroute, lastLegWasAirway ? legs[i].airway : undefined);
                }
                else {
                    let leg = undefined;
                    leg = FlightPlan.createLeg({
                        type: LegType.TF,
                        fixIcao: wpt.icao
                    });
                    if (leg) {
                        plan.addLeg(currentSegment, leg);
                        if (lastLegWasAirway) {
                            plan.setAirway(currentSegment, segment.airway + '.' + ICAO.getIdent(wpt.icao));
                            currentSegment += 1;
                            plan.insertSegment(currentSegment, FlightPlanSegmentType.Enroute);
                        }
                        lastLegWasAirway = false;
                    }
                }
            }
            if (plan.getSegment(currentSegment).airway) {
                currentSegment += 1;
                plan.insertSegment(currentSegment, FlightPlanSegmentType.Enroute);
            }
        }
        else {
            this.emptyPrimaryFlightPlan();
        }
        if (newOriginIcao) {
            this.facLoader.getFacility(FacilityType.Airport, newOriginIcao).then((facility) => {
                this.setOrigin(facility);
            });
        }
        if (newDestinationIcao) {
            this.facLoader.getFacility(FacilityType.Airport, newDestinationIcao).then((facility) => {
                this.setDestination(facility);
            });
        }
        this.setApproachDetails(false, ApproachType.APPROACH_TYPE_UNKNOWN, RnavTypeFlags.None, false);
        plan.calculate(0);
    }
    /**
     * Method to add or replace a departure procedure in the flight plan.
     * @param facility is the facility that contains the procedure to add.
     * @param departureIndex is the index of the departure
     * @param departureRunwayIndex is the index of the runway transition
     * @param enrouteTransitionIndex is the index of the enroute transition
     * @param oneWayRunway is the one way runway to set as the origin leg.
     */
    insertDeparture(facility, departureIndex, departureRunwayIndex, enrouteTransitionIndex, oneWayRunway) {
        const plan = this.getFlightPlan();
        plan.setDeparture(facility.icao, departureIndex, enrouteTransitionIndex, departureRunwayIndex);
        const segmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Departure);
        this.planClearSegment(segmentIndex, FlightPlanSegmentType.Departure);
        const insertProcedureObject = this.buildDepartureLegs(facility, departureIndex, enrouteTransitionIndex, departureRunwayIndex, oneWayRunway);
        if (oneWayRunway) {
            plan.setOriginAirport(facility.icao);
            plan.setOriginRunway(oneWayRunway);
        }
        else if (plan.originAirport == facility.icao && plan.procedureDetails.originRunway) {
            const originLeg = FmsUtils.buildRunwayLeg(facility, plan.procedureDetails.originRunway, true);
            insertProcedureObject.procedureLegs.splice(0, 1, originLeg);
        }
        else {
            plan.setOriginAirport(facility.icao);
        }
        insertProcedureObject.procedureLegs.forEach(l => this.planAddLeg(segmentIndex, l));
        const nextLeg = plan.getNextLeg(segmentIndex, Infinity);
        const depSegment = plan.getSegment(segmentIndex);
        const lastDepLeg = depSegment.legs[depSegment.legs.length - 1];
        if (nextLeg && lastDepLeg && this.isDuplicateLeg(lastDepLeg.leg, nextLeg.leg)) {
            this.planRemoveDuplicateLeg(lastDepLeg, nextLeg);
        }
        plan.calculate(0);
    }
    /**
     * Method to insert the arrival legs.
     * @param facility is the facility to build legs from.
     * @param procedureIndex is the procedure index to build legs from.
     * @param enrouteTransitionIndex is the enroute transition index to build legs from.
     * @param runwayTransitionIndex is the runway transition index to build legs from.
     * @param oneWayRunway is the one way runway, if one is specified in the procedure.
     * @returns InsertProcedureObject to insert into the flight plan.
     */
    buildDepartureLegs(facility, procedureIndex, enrouteTransitionIndex, runwayTransitionIndex, oneWayRunway) {
        const departure = facility.departures[procedureIndex];
        const enRouteTransition = departure.enRouteTransitions[enrouteTransitionIndex];
        const runwayTransition = departure.runwayTransitions[runwayTransitionIndex];
        const insertProcedureObject = { procedureLegs: [] };
        let originLeg;
        if (oneWayRunway) {
            originLeg = FmsUtils.buildRunwayLeg(facility, oneWayRunway, true);
        }
        else {
            originLeg = FlightPlan.createLeg({
                lat: facility.lat,
                lon: facility.lon,
                type: LegType.IF,
                fixIcao: facility.icao
            });
        }
        insertProcedureObject.procedureLegs.push(originLeg);
        if (runwayTransition !== undefined && runwayTransition.legs.length > 0) {
            runwayTransition.legs.forEach((leg) => {
                insertProcedureObject.procedureLegs.push(FlightPlan.createLeg(leg));
            });
        }
        for (let i = 0; i < departure.commonLegs.length; i++) {
            const leg = FlightPlan.createLeg(departure.commonLegs[i]);
            if (i == 0 && insertProcedureObject.procedureLegs.length > 0 &&
                this.isDuplicateIFLeg(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg)) {
                insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1] =
                    this.mergeDuplicateLegData(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg);
                continue;
            }
            insertProcedureObject.procedureLegs.push(leg);
        }
        if (enRouteTransition) {
            for (let i = 0; i < enRouteTransition.legs.length; i++) {
                const leg = FlightPlan.createLeg(enRouteTransition.legs[i]);
                if (i == 0 && insertProcedureObject.procedureLegs.length > 0 &&
                    this.isDuplicateIFLeg(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg)) {
                    insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1] =
                        this.mergeDuplicateLegData(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg);
                    continue;
                }
                insertProcedureObject.procedureLegs.push(enRouteTransition.legs[i]);
            }
        }
        return insertProcedureObject;
    }
    /**
     * Method to add or replace an arrival procedure in the flight plan.
     * @param facility is the facility that contains the procedure to add.
     * @param arrivalIndex is the index of the arrival procedure.
     * @param arrivalRunwayTransitionIndex is the index of the arrival runway transition.
     * @param enrouteTransitionIndex is the index of the enroute transition.
     * @param oneWayRunway is the one way runway to set as the destination leg.
     */
    insertArrival(facility, arrivalIndex, arrivalRunwayTransitionIndex, enrouteTransitionIndex, oneWayRunway) {
        const plan = this.getFlightPlan();
        plan.setArrival(facility.icao, arrivalIndex, enrouteTransitionIndex, arrivalRunwayTransitionIndex);
        if (plan.length > 0 && plan.procedureDetails.approachIndex < 0 && plan.destinationAirport) {
            if (!this.moveDirectToDestinationLeg(plan, FlightPlanSegmentType.Enroute)) {
                if (plan.getLeg(plan.activeLateralLeg).leg.fixIcao === plan.destinationAirport && plan.destinationAirport !== facility.icao && plan.activeLateralLeg === plan.length - 1) {
                    const lastEnrouteSegmentIndex = this.findLastEnrouteSegmentIndex(plan);
                    const newDestinationLeg = FlightPlan.createLeg({ fixIcao: plan.destinationAirport, type: LegType.TF });
                    this.planAddLeg(lastEnrouteSegmentIndex, newDestinationLeg);
                }
            }
        }
        if (plan.procedureDetails.approachIndex < 0) {
            plan.setDestinationAirport(facility.icao);
            plan.setDestinationRunway(oneWayRunway);
        }
        const segmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Arrival);
        if (plan.getSegment(segmentIndex).legs.length > 0) {
            this.planClearSegment(segmentIndex, FlightPlanSegmentType.Arrival);
        }
        const insertProcedureObject = this.buildArrivalLegs(facility, arrivalIndex, enrouteTransitionIndex, arrivalRunwayTransitionIndex, oneWayRunway);
        let directTargetLeg;
        let handleDirectToDestination = false;
        const directToState = this.getDirectToState();
        if (plan.procedureDetails.approachIndex > -1) {
            insertProcedureObject.procedureLegs.pop();
        }
        else if (directToState === DirectToState.TOEXISTING) {
            directTargetLeg = this.getDirectToLeg();
            if ((directTargetLeg === null || directTargetLeg === void 0 ? void 0 : directTargetLeg.fixIcao) === plan.destinationAirport &&
                (directTargetLeg === null || directTargetLeg === void 0 ? void 0 : directTargetLeg.fixIcao) === insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1].fixIcao) {
                insertProcedureObject.procedureLegs.pop();
                handleDirectToDestination = true;
            }
        }
        insertProcedureObject.procedureLegs.forEach(l => this.planAddLeg(segmentIndex, l));
        const arrSegment = plan.getSegment(segmentIndex);
        const prevLeg = plan.getPrevLeg(segmentIndex, 0);
        const firstArrLeg = arrSegment.legs[0];
        if (prevLeg && firstArrLeg && this.isDuplicateLeg(prevLeg.leg, firstArrLeg.leg)) {
            this.planRemoveDuplicateLeg(prevLeg, firstArrLeg);
        }
        this.removeDestLegFromSegments();
        const nextLeg = plan.getNextLeg(segmentIndex, Infinity);
        const lastArrLeg = arrSegment.legs[arrSegment.legs.length - 1];
        if (nextLeg && lastArrLeg && this.isDuplicateLeg(lastArrLeg.leg, nextLeg.leg)) {
            this.planRemoveDuplicateLeg(lastArrLeg, nextLeg);
        }
        if (handleDirectToDestination) {
            this.moveDirectToDestinationLeg(plan, FlightPlanSegmentType.Arrival, segmentIndex);
            this.activateLeg(segmentIndex, arrSegment.legs.length - 1);
        }
        else if (directToState === DirectToState.TOEXISTING && directTargetLeg && directTargetLeg.fixIcao === plan.destinationAirport) {
            this.removeDirectToExisting();
            this.buildRandomDirectTo(plan.destinationAirport);
        }
        plan.calculate(0);
    }
    /**
     * Method to insert the arrival legs.
     * @param facility is the facility to build legs from.
     * @param procedureIndex is the procedure index to build legs from.
     * @param enrouteTransitionIndex is the enroute transition index to build legs from.
     * @param runwayTransitionIndex is the runway transition index to build legs from.
     * @param oneWayRunway is the one way runway, if one is specified in the procedure.
     * @returns InsertProcedureObject to insert into the flight plan.
     */
    buildArrivalLegs(facility, procedureIndex, enrouteTransitionIndex, runwayTransitionIndex, oneWayRunway) {
        const arrival = facility.arrivals[procedureIndex];
        const enRouteTransition = arrival.enRouteTransitions[enrouteTransitionIndex];
        const runwayTransition = arrival.runwayTransitions[runwayTransitionIndex];
        const insertProcedureObject = { procedureLegs: [] };
        if (enRouteTransition !== undefined && enRouteTransition.legs.length > 0) {
            enRouteTransition.legs.forEach((leg) => {
                insertProcedureObject.procedureLegs.push(FlightPlan.createLeg(leg));
            });
        }
        for (let i = 0; i < arrival.commonLegs.length; i++) {
            const leg = FlightPlan.createLeg(arrival.commonLegs[i]);
            if (i == 0 && insertProcedureObject.procedureLegs.length > 0 &&
                this.isDuplicateIFLeg(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg)) {
                insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1] =
                    this.mergeDuplicateLegData(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg);
                continue;
            }
            insertProcedureObject.procedureLegs.push(leg);
        }
        if (runwayTransition) {
            for (let i = 0; i < runwayTransition.legs.length; i++) {
                const leg = FlightPlan.createLeg(runwayTransition.legs[i]);
                if (i == 0 && insertProcedureObject.procedureLegs.length > 0 &&
                    this.isDuplicateIFLeg(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg)) {
                    insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1] =
                        this.mergeDuplicateLegData(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg);
                    continue;
                }
                insertProcedureObject.procedureLegs.push(leg);
            }
        }
        const destinationLeg = oneWayRunway
            ? FmsUtils.buildRunwayLeg(facility, oneWayRunway, false)
            : FlightPlan.createLeg({
                lat: facility.lat,
                lon: facility.lon,
                type: LegType.TF,
                fixIcao: facility.icao
            });
        insertProcedureObject.procedureLegs.push(destinationLeg);
        this.tryInsertIFLeg(insertProcedureObject);
        return insertProcedureObject;
    }
    /**
     * Method to move a direct to destination to a specified target segment.
     * @param plan is the primary flight plan.
     * @param targetSegmentType is the target segment type.
     * @param arrivalSegmentIndex is the arrival segment index
     * @returns whether a direct to destination was moved.
     */
    moveDirectToDestinationLeg(plan, targetSegmentType, arrivalSegmentIndex) {
        if (this.getDirectToState() === DirectToState.TOEXISTING) {
            const directTargetSegmentIndex = targetSegmentType === FlightPlanSegmentType.Arrival ? arrivalSegmentIndex : this.findLastEnrouteSegmentIndex(plan);
            if (directTargetSegmentIndex !== undefined && directTargetSegmentIndex > 0 && plan.getLeg(plan.activeLateralLeg).leg.fixIcao === plan.destinationAirport) {
                const destinationLeg = Object.assign({}, plan.getSegment(plan.directToData.segmentIndex).legs[plan.directToData.segmentLegIndex].leg);
                const directTargetLeg = Object.assign({}, plan.getLeg(plan.activeLateralLeg).leg);
                const directOriginLeg = Object.assign({}, plan.getLeg(plan.activeLateralLeg - 1).leg);
                const discoLeg = Object.assign({}, plan.getLeg(plan.activeLateralLeg - 2).leg);
                const newDirectLegIndex = plan.getSegment(directTargetSegmentIndex).legs.length;
                plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex);
                plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex);
                plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex);
                plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex);
                plan.setDirectToData(directTargetSegmentIndex, newDirectLegIndex);
                plan.addLeg(directTargetSegmentIndex, destinationLeg);
                plan.addLeg(directTargetSegmentIndex, discoLeg, undefined, true);
                plan.addLeg(directTargetSegmentIndex, directOriginLeg, undefined, true);
                const newActiveLeg = plan.addLeg(directTargetSegmentIndex, directTargetLeg, undefined, true);
                plan.setLateralLeg(plan.getLegIndexFromLeg(newActiveLeg));
                plan.calculate(plan.activeLateralLeg);
                return true;
            }
        }
        return false;
    }
    /**
     * Method to find the last enroute segment of the supplied flight plan.
     * @param plan is the flight plan to find the last enroute segment in.
     * @returns a segment index.
     */
    findLastEnrouteSegmentIndex(plan) {
        let enrouteSegmentFound = 0;
        for (let i = 1; i < plan.segmentCount; i++) {
            const segment = plan.getSegment(i);
            if (segment.segmentType === FlightPlanSegmentType.Enroute) {
                enrouteSegmentFound = i;
            }
        }
        return enrouteSegmentFound;
    }
    /**
     * Method manage the destination leg in the last enroute segment.
     * @param plan is the flight plan.
     * @param currentDestination is the currently set destination airport icao.
     */
    manageAirportLeg(plan, currentDestination) {
        if (plan.procedureDetails.arrivalIndex > -1 || !currentDestination || Simplane.getIsGrounded()) {
            //if we don't have a destination set, or an arrival is selected, don't add the airport to enroute
            return;
        }
        const lastEnrouteSegmentIndex = this.findLastEnrouteSegmentIndex(plan);
        const segment = plan.getSegment(lastEnrouteSegmentIndex);
        const lastLegIndex = segment.legs.length - 1;
        if (currentDestination && (lastLegIndex < 0 || segment.legs[lastLegIndex].leg.fixIcao !== currentDestination)) {
            //if a destination is set, AND either (a) the last enroute segment is empty OR (b) the last enroute segment isn't empty and
            //the last leg of the last enroute segment is not already the current destination
            this.planAddLeg(lastEnrouteSegmentIndex, FlightPlan.createLeg({ fixIcao: currentDestination, type: LegType.TF }));
        }
    }
    /**
     * Method to check whether an approach can load, or only activate.
     * @returns true if the approach can be loaded and not activated, otherwise the approach can only be immediatly activated.
     */
    canApproachLoad() {
        const plan = this.getFlightPlan();
        if (plan.length > 0) {
            const activeSegment = plan.getSegment(plan.getSegmentIndex(plan.activeLateralLeg));
            if (activeSegment.segmentType !== FlightPlanSegmentType.Approach && plan.length > 1) {
                return true;
            }
        }
        return false;
    }
    /**
     * Method to add or replace an approach procedure in the flight plan.
     * @param facility is the facility that contains the procedure to add.
     * @param approachIndex is the index of the approach procedure.
     * @param approachTransitionIndex is the index of the approach transition.
     * @param visualRunwayNumber is the visual runway number, if any.
     * @param visualRunwayDesignator is the visual runway designator, if any.
     * @param transStartIndex is the starting leg index for the transition, if any.
     * @param skipCourseReversal Whether to skip the course reversal.
     */
    insertApproach(facility, approachIndex, approachTransitionIndex, visualRunwayNumber, visualRunwayDesignator, transStartIndex, skipCourseReversal) {
        var _a, _b;
        const plan = this.getFlightPlan();
        let visualRunway;
        if (visualRunwayNumber !== undefined && visualRunwayDesignator !== undefined) {
            visualRunway = RunwayUtils.matchOneWayRunway(facility, visualRunwayNumber, visualRunwayDesignator);
            plan.setUserData('visual_approach', `${visualRunway === null || visualRunway === void 0 ? void 0 : visualRunway.designation}`);
        }
        if (!visualRunway && plan.getUserData('visual_approach')) {
            plan.deleteUserData('visual_approach');
        }
        plan.setApproach(facility.icao, approachIndex, approachTransitionIndex);
        if (plan.procedureDetails.arrivalIndex < 0) {
            if (!this.moveDirectToDestinationLeg(plan, FlightPlanSegmentType.Enroute)) {
                this.manageAirportLeg(plan, plan.destinationAirport);
            }
        }
        plan.setDestinationAirport(facility.icao);
        const segmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Approach);
        if (plan.getSegment(segmentIndex).legs.length > 0) {
            this.planClearSegment(segmentIndex, FlightPlanSegmentType.Approach);
        }
        const insertProcedureObject = this.buildApproachLegs(facility, approachIndex, approachTransitionIndex, visualRunway, transStartIndex, skipCourseReversal);
        if (insertProcedureObject.runway) {
            plan.setDestinationRunway(insertProcedureObject.runway);
        }
        let haveAddedMap = false;
        insertProcedureObject.procedureLegs.forEach((l) => {
            let isMissedLeg = false;
            if (visualRunway !== undefined) {
                this.addVisualFacilityFromLeg(l, visualRunway.designation);
                if (haveAddedMap) {
                    isMissedLeg = true;
                }
                if (l.fixTypeFlags & FixTypeFlags.MAP) {
                    haveAddedMap = true;
                }
            }
            this.planAddLeg(segmentIndex, l, undefined, false, isMissedLeg);
        });
        let skipDestinationLegCheck = false;
        if (this.getDirectToState() === DirectToState.TOEXISTING) {
            if (((_a = this.getDirectToLeg()) === null || _a === void 0 ? void 0 : _a.fixIcao) === plan.destinationAirport) {
                skipDestinationLegCheck = true;
            }
        }
        if (!skipDestinationLegCheck) {
            this.removeDestLegFromSegments();
        }
        const prevLeg = plan.getPrevLeg(segmentIndex, 0);
        const firstAppLeg = plan.getSegment(segmentIndex).legs[0];
        if (prevLeg && firstAppLeg && this.isDuplicateLeg(prevLeg.leg, firstAppLeg.leg)) {
            this.planRemoveDuplicateLeg(prevLeg, firstAppLeg);
        }
        // Adds missed approach legs
        if (!visualRunway && insertProcedureObject.procedureLegs.length > 0) {
            const missedLegs = (_b = facility.approaches[approachIndex].missedLegs) !== null && _b !== void 0 ? _b : [];
            if (missedLegs.length > 0) {
                let maphIndex = -1;
                for (let m = missedLegs.length - 1; m >= 0; m--) {
                    switch (missedLegs[m].type) {
                        case LegType.HA:
                        case LegType.HF:
                        case LegType.HM:
                            maphIndex = m - 1;
                            break;
                    }
                }
                for (let n = 0; n < missedLegs.length; n++) {
                    const newLeg = FlightPlan.createLeg(missedLegs[n]);
                    if (maphIndex >= 0 && n === maphIndex) {
                        newLeg.fixTypeFlags |= FixTypeFlags.MAHP;
                        this.planAddLeg(segmentIndex, newLeg, undefined, false, true);
                    }
                    else {
                        this.planAddLeg(segmentIndex, newLeg, undefined, false, true);
                    }
                }
            }
        }
        const approachType = visualRunway ? AdditionalApproachType.APPROACH_TYPE_VISUAL : facility.approaches[approachIndex].approachType;
        const rnavTypeFlag = visualRunway ? RnavTypeFlags.None : FmsUtils.getBestRnavType(facility.approaches[approachIndex].rnavTypeFlags);
        this.setApproachDetails(true, approachType, rnavTypeFlag, false);
        plan.calculate();
        this.loadApproachFrequency(facility, approachIndex);
        this.setLocFrequency(1);
        this.setLocFrequency(2);
    }
    /**
     * Method to insert the approach legs.
     * @param facility The facility to build legs from.
     * @param approachIndex The approach procedure index to build legs from.
     * @param approachTransitionIndex The transition index to build legs from.
     * @param visualRunway If this is a visual approach, the visual approach one way runway object.
     * @param transStartIndex The starting leg index for the transition, if any.
     * @param skipCourseReversal Whether to skip the course reversal.
     * @returns procedurelegs array to insert into the flight plan.
     */
    buildApproachLegs(facility, approachIndex, approachTransitionIndex, visualRunway, transStartIndex, skipCourseReversal) {
        const isVisual = visualRunway ? true : false;
        const approach = isVisual && visualRunway !== undefined ? FmsUtils.buildVisualApproach(facility, visualRunway, 1, 2.5) : facility.approaches[approachIndex];
        const transition = !isVisual ? approach.transitions[approachTransitionIndex] : undefined;
        const insertProcedureObject = { procedureLegs: [] };
        if (transition !== undefined && transition.legs.length > 0) {
            const startIndex = transStartIndex !== undefined ? transStartIndex : 0;
            for (let t = startIndex; t < transition.legs.length; t++) {
                insertProcedureObject.procedureLegs.push(FlightPlan.createLeg(transition.legs[t]));
            }
        }
        const finalLegs = approach.finalLegs;
        for (let i = 0; i < finalLegs.length; i++) {
            const leg = FlightPlan.createLeg(finalLegs[i]);
            if (i === 0 && insertProcedureObject.procedureLegs.length > 0 &&
                this.isDuplicateIFLeg(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg)) {
                insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1] =
                    this.mergeDuplicateLegData(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg);
                continue;
            }
            if (!isVisual && leg.fixIcao.search('R') === 0) {
                const approachRunway = RunwayUtils.matchOneWayRunway(facility, approach.runwayNumber, approach.runwayDesignator);
                if (approachRunway) {
                    insertProcedureObject.runway = approachRunway;
                    const runwayLeg = FmsUtils.buildRunwayLeg(facility, approachRunway, false);
                    insertProcedureObject.procedureLegs.push(runwayLeg);
                }
            }
            else if (isVisual && i === finalLegs.length - 1) {
                insertProcedureObject.runway = visualRunway;
                insertProcedureObject.procedureLegs.push(leg);
                if (approach.missedLegs.length > 0) {
                    insertProcedureObject.procedureLegs.push(approach.missedLegs[0]);
                }
            }
            else {
                insertProcedureObject.procedureLegs.push(leg);
            }
        }
        if (!isVisual) {
            this.tryInsertIFLeg(insertProcedureObject);
            this.tryReconcileIAFLeg(insertProcedureObject);
            this.manageVerticalAngleInfo(insertProcedureObject);
            this.tryCleanupHold(insertProcedureObject);
            if (skipCourseReversal) {
                this.tryRemoveCourseReversal(insertProcedureObject);
            }
            this.tryInsertMap(insertProcedureObject);
            if (!insertProcedureObject.runway && approach.runway) {
                insertProcedureObject.runway = RunwayUtils.matchOneWayRunway(facility, approach.runwayNumber, approach.runwayDesignator);
            }
            return insertProcedureObject;
        }
        return insertProcedureObject;
    }
    /**
     * Manages the altitude constraints for FAF legs where vertical angle info is also provided.
     * @param proc A procedure object.
     * @returns the procedure object, after it has been changed.
     */
    manageVerticalAngleInfo(proc) {
        proc.procedureLegs.forEach(leg => {
            if (leg.fixTypeFlags === FixTypeFlags.FAF && leg.altitude2 > 0) {
                const alt = leg.altitude1 <= leg.altitude2 ? leg.altitude1 : leg.altitude2;
                leg.altDesc = AltitudeRestrictionType.AtOrAbove;
                leg.altitude1 = alt;
                leg.altitude2 = 0;
            }
        });
        return proc;
    }
    /**
     * Inserts an IF leg at the beginning of a procedure if it begins with a leg type which defines a fixed origin.
     * @param proc A procedure object.
     * @returns the procedure object, after it has been changed.
     */
    tryInsertIFLeg(proc) {
        const firstLeg = proc.procedureLegs[0];
        let icao;
        switch (firstLeg === null || firstLeg === void 0 ? void 0 : firstLeg.type) {
            case LegType.HA:
            case LegType.HF:
            case LegType.HM:
            case LegType.PI:
            case LegType.FD:
            case LegType.FC:
                icao = firstLeg.fixIcao;
                break;
            case LegType.FM:
            case LegType.VM:
                icao = firstLeg.originIcao;
                break;
        }
        if (icao && icao !== ICAO.emptyIcao) {
            proc.procedureLegs.unshift(FlightPlan.createLeg({
                type: LegType.IF,
                fixIcao: icao,
                fixTypeFlags: firstLeg.fixTypeFlags & (FixTypeFlags.IF | FixTypeFlags.IAF)
            }));
            if ((firstLeg === null || firstLeg === void 0 ? void 0 : firstLeg.type) === LegType.HF || (firstLeg === null || firstLeg === void 0 ? void 0 : firstLeg.type) === LegType.PI) {
                proc.procedureLegs[0].altDesc = firstLeg.altDesc;
                proc.procedureLegs[0].altitude1 = firstLeg.altitude1;
                proc.procedureLegs[0].altitude2 = firstLeg.altitude2;
            }
            // need to remove IF/IAF flags from the original first leg (now the second leg)
            const replacementLeg = FlightPlan.createLeg(proc.procedureLegs[1]);
            replacementLeg.fixTypeFlags = replacementLeg.fixTypeFlags & ~(FixTypeFlags.IF | FixTypeFlags.IAF);
            proc.procedureLegs[1] = replacementLeg;
        }
        return proc;
    }
    /**
     * Checks the approach legs for an IAF fix type flag, and if one exists, amend the approach to ensure that
     * the IAF is not on a hold/pt leg and that we do not add legs prior to the IAF except in cases where we needed to add
     * an IF leg type.
     * @param proc A procedure object.
     * @returns the procedure object, after it has been changed.
     */
    tryReconcileIAFLeg(proc) {
        let iafIndex = -1;
        for (let i = 0; i < proc.procedureLegs.length; i++) {
            const leg = proc.procedureLegs[i];
            if (leg.fixTypeFlags === FixTypeFlags.IAF) {
                iafIndex = i;
                switch (leg.type) {
                    case LegType.HA:
                    case LegType.HF:
                    case LegType.HM:
                    case LegType.PI:
                    case LegType.FD:
                    case LegType.FC:
                        if (iafIndex > 0) {
                            leg.fixTypeFlags &= ~FixTypeFlags.IAF;
                            proc.procedureLegs[iafIndex - 1].fixTypeFlags |= FixTypeFlags.IAF;
                            iafIndex--;
                        }
                }
                break;
            }
        }
        return proc;
    }
    /**
     * Inserts a MAP fix type flag if none exists on the approach.
     * @param proc A procedure object.
     * @returns the procedure object, after it has been changed.
     */
    tryInsertMap(proc) {
        let addMap = true;
        let runwayIndex = -1;
        for (let i = 0; i < proc.procedureLegs.length; i++) {
            const leg = proc.procedureLegs[i];
            if (leg.fixTypeFlags === FixTypeFlags.MAP) {
                addMap = false;
                break;
            }
            if (leg.fixIcao.search('R') === 0) {
                runwayIndex = i;
                break;
            }
        }
        if (addMap && runwayIndex > -1) {
            proc.procedureLegs[runwayIndex].fixTypeFlags = FixTypeFlags.MAP;
        }
        return proc;
    }
    /**
     * Method to remove the duplicate leg after the hold leg.
     * @param proc A procedure object.
     * @returns the procedure object, after it has been changed.
     */
    tryCleanupHold(proc) {
        for (let i = 0; i < proc.procedureLegs.length; i++) {
            const leg = proc.procedureLegs[i];
            if (leg.type === LegType.HF) {
                const next = proc.procedureLegs[i + 1];
                if (leg.fixIcao === next.fixIcao && next.type === LegType.IF) {
                    proc.procedureLegs.splice(i + 1, 1);
                }
            }
        }
        return proc;
    }
    /**
     * Method to remove a course reversal in an approach procedure.
     * @param proc A procedure object.
     * @returns the procedure object, after it has been changed.
     */
    tryRemoveCourseReversal(proc) {
        let canRemove = false;
        if (proc.procedureLegs.length > 2) {
            const leg = proc.procedureLegs[1];
            switch (leg.type) {
                case LegType.HA:
                case LegType.HF:
                case LegType.HM:
                case LegType.PI:
                    canRemove = true;
            }
        }
        if (canRemove) {
            proc.procedureLegs.splice(1, 1);
        }
        return proc;
    }
    /**
     * Method to remove the departure from the flight plan.
     */
    async removeDeparture() {
        const plan = this.getFlightPlan();
        const segmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Departure);
        plan.setDeparture();
        this.planClearSegment(segmentIndex, FlightPlanSegmentType.Departure);
        if (plan.originAirport) {
            const airport = await this.facLoader.getFacility(FacilityType.Airport, plan.originAirport);
            const updatedSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Departure);
            this.planAddOriginDestinationLeg(true, updatedSegmentIndex, airport, plan.procedureDetails.originRunway);
            const prevLeg = plan.getPrevLeg(updatedSegmentIndex, 1);
            const nextLeg = plan.getNextLeg(updatedSegmentIndex, 0);
            if (prevLeg && nextLeg && this.isDuplicateLeg(prevLeg.leg, nextLeg.leg)) {
                this.planRemoveDuplicateLeg(prevLeg, nextLeg);
            }
        }
        plan.calculate(0);
    }
    /**
     * Method to remove the arrival from the flight plan.
     */
    async removeArrival() {
        const plan = this.getFlightPlan();
        const segmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Arrival);
        plan.setArrival();
        this.planRemoveSegment(segmentIndex);
        if (plan.procedureDetails.approachIndex < 0 && plan.destinationAirport) {
            const airport = await this.facLoader.getFacility(FacilityType.Airport, plan.destinationAirport);
            const destSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Destination);
            this.planAddOriginDestinationLeg(false, destSegmentIndex, airport, plan.procedureDetails.destinationRunway);
        }
        const prevLeg = plan.getPrevLeg(segmentIndex, 0);
        const nextLeg = plan.getNextLeg(segmentIndex, -1);
        if (prevLeg && nextLeg && this.isDuplicateLeg(prevLeg.leg, nextLeg.leg)) {
            this.planRemoveDuplicateLeg(prevLeg, nextLeg);
        }
        plan.calculate(0);
    }
    /**
     * Method to remove the approach from the flight plan.
     */
    async removeApproach() {
        this.loadApproachFrequency();
        this.setApproachDetails(false, ApproachType.APPROACH_TYPE_UNKNOWN, RnavTypeFlags.None, false);
        const plan = this.getFlightPlan();
        const hasArrival = plan.procedureDetails.arrivalIndex >= 0;
        const segmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Approach);
        if (hasArrival) {
            const lastEnrouteSegmentIndex = this.findLastEnrouteSegmentIndex(plan);
            const segment = plan.getSegment(lastEnrouteSegmentIndex);
            const lastLegIndex = segment && segment.legs.length > 0 ? segment.legs.length - 1 : 0;
            if (plan.destinationAirport && segment.legs[lastLegIndex] && segment.legs[lastLegIndex].leg.fixIcao === plan.destinationAirport) {
                this.planRemoveLeg(lastEnrouteSegmentIndex, lastLegIndex);
            }
            plan.setDestinationRunway();
            if (plan.procedureDetails.arrivalFacilityIcao && plan.procedureDetails.arrivalFacilityIcao !== plan.destinationAirport) {
                const arrivalFacility = await this.facLoader.getFacility(FacilityType.Airport, plan.procedureDetails.arrivalFacilityIcao);
                this.setDestination(arrivalFacility);
            }
        }
        plan.setApproach();
        this.planRemoveSegment(segmentIndex);
        if (plan.destinationAirport) {
            const airport = await this.facLoader.getFacility(FacilityType.Airport, plan.destinationAirport);
            const destLegSegmentIndex = hasArrival
                ? this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Arrival)
                : this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Destination);
            this.planAddOriginDestinationLeg(false, destLegSegmentIndex, airport, plan.procedureDetails.destinationRunway);
        }
        const prevLeg = plan.getPrevLeg(segmentIndex, 0);
        const nextLeg = plan.getNextLeg(segmentIndex, -1);
        if (prevLeg && nextLeg && this.isDuplicateLeg(prevLeg.leg, nextLeg.leg)) {
            this.planRemoveDuplicateLeg(prevLeg, nextLeg);
        }
        if (plan.getUserData('visual_approach')) {
            plan.deleteUserData('visual_approach');
        }
        plan.calculate(0);
    }
    /**
     * Method to activate a leg in the flight plan.
     * @param segmentIndex is the index of the segment containing the leg to activate.
     * @param legIndex is the index of the leg in the selected segment activate.
     * @param fplnIndex is the index of the flight plan in which to activate the leg.
     */
    activateLeg(segmentIndex, legIndex, fplnIndex = 0) {
        const plan = this.getFlightPlan(fplnIndex);
        const indexInFlightplan = plan.getSegment(segmentIndex).offset + legIndex;
        if (fplnIndex === 0 && this.flightPlanner.activePlanIndex > 0) {
            this.flightPlanner.setActivePlanIndex(0);
        }
        if (this.missedApproachActive) {
            const segment = plan.getSegment(segmentIndex);
            if (segment.legs[legIndex] && !segment.legs[legIndex].isInMissedApproachSequence) {
                Fms.g1000EvtPub.publishEvent('activate_missed_approach', false);
            }
        }
        if ((fplnIndex !== 0 && this.getDirectToState() === DirectToState.TOEXISTING)
            || (fplnIndex === 0 && (segmentIndex < plan.directToData.segmentIndex || (segmentIndex === plan.directToData.segmentIndex && legIndex <= plan.directToData.segmentLegIndex)))) {
            this.removeDirectToExisting(indexInFlightplan);
            if (fplnIndex !== 0) {
                plan.setLateralLeg(indexInFlightplan);
                plan.calculate(Math.max(0, indexInFlightplan - 1));
            }
        }
        else {
            plan.setLateralLeg(indexInFlightplan);
            plan.calculate(Math.max(0, indexInFlightplan - 1));
        }
        Fms.g1000EvtPub.publishEvent('suspend', false);
    }
    /**
     * Method to check if there is a currently loaded approach to be activated.
     * @returns whether the approach can activate
     */
    canApproachActivate() {
        const plan = this.getFlightPlan();
        if (plan.destinationAirport !== undefined && plan.procedureDetails.approachIndex > -1) {
            return true;
        }
        else if (plan.destinationAirport !== undefined) {
            const approachSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Approach, false);
            if (approachSegmentIndex > 0 && plan.getSegment(approachSegmentIndex).legs.length > 0) {
                return true;
            }
        }
        return false;
    }
    /**
     * Method to activate the approach.
     */
    activateApproach() {
        if (this.canApproachActivate()) {
            const approachSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Approach, false);
            this.createDirectToExisting(approachSegmentIndex, 0);
        }
        this.setLocFrequency(1, true);
        this.setLocFrequency(2, true);
    }
    /**
     * Method to check if there is a currently loaded missed approach to be activated.
     * @returns whether the approach can activate
     */
    canMissedApproachActivate() {
        const plan = this.getFlightPlan();
        if (this.cdiSource.type === NavSourceType.Gps && plan && plan.activeLateralLeg < plan.length - 1 && plan.segmentCount > 0) {
            const segmentIndex = plan.getSegmentIndex(plan.activeLateralLeg);
            if (segmentIndex > 0) {
                const segment = plan.getSegment(segmentIndex);
                if (segment.segmentType === FlightPlanSegmentType.Approach && segment.legs[segment.legs.length - 1].isInMissedApproachSequence) {
                    for (let i = 0; i < segment.legs.length; i++) {
                        const leg = segment.legs[i];
                        if (leg.leg.fixTypeFlags === FixTypeFlags.FAF) {
                            if (plan.activeLateralLeg - segment.offset >= i) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
    /**
     * Method to activate the missed approach.
     */
    activateMissedApproach() {
        if (this.canMissedApproachActivate()) {
            Fms.g1000EvtPub.publishEvent('activate_missed_approach', true);
        }
    }
    /**
     * Method to create a direct to a random waypoint just from the fixIcao.
     * @param icao is the desired fixIcao.
     */
    async buildRandomDirectTo(icao) {
        if (ICAO.isFacility(icao)) {
            const type = ICAO.getFacilityType(icao);
            const fac = await this.facLoader.getFacility(type, icao);
            this.createDirectToRandom(fac);
        }
    }
    /**
     * Method to create a direct to a waypoint. This method will also then call activateLeg.
     * @param waypoint is the facility for the DTO destination to be added.
     * @param course is the course for this direct to, if specified.
     */
    createDirectToRandom(waypoint, course) {
        const plan = this.flightPlanner.createFlightPlan(1);
        plan.setLateralLeg(0);
        for (let i = plan.segmentCount - 1; i >= 0; i--) {
            if (plan.getSegment(i) !== undefined) {
                plan.removeSegment(i);
            }
        }
        plan.insertSegment(0, FlightPlanSegmentType.RandomDirectTo, undefined, true);
        const segment = plan.getSegment(0);
        if (course) {
            //do something
        }
        if (segment) {
            const discoLeg = FlightPlan.createLeg({ type: LegType.Discontinuity });
            const dtoOriginLeg = this.createDTOOriginLeg(this.ppos);
            const dtoTargetLeg = this.createDTODirectLeg(waypoint.icao);
            plan.addLeg(0, discoLeg, 0, true);
            plan.addLeg(0, dtoOriginLeg, 1, true);
            plan.addLeg(0, dtoTargetLeg, 2, true);
            plan.calculate(0);
            if (this.flightPlanner.activePlanIndex !== 1) {
                this.flightPlanner.setActivePlanIndex(1);
            }
            Fms.g1000EvtPub.publishEvent('suspend', false);
        }
    }
    /**
     * Method to create a direct to an existing waypoint in the plan. This method will also then call activateLeg.
     * @param segmentIndex is the index of the segment containing the leg to activate as direct to.
     * @param legIndex is the index of the leg in the specified segment to activate as direct to.
     * @param course is the course for this direct to, if specified.
     */
    createDirectToExisting(segmentIndex, legIndex, course) {
        const plan = this.getFlightPlan();
        const segment = plan.getSegment(segmentIndex);
        const leg = segment.legs[legIndex];
        let legIndexDelta = 0;
        if (plan.directToData.segmentIndex > -1 && plan.directToData.segmentLegIndex > -1) {
            legIndexDelta -= plan.directToData.segmentIndex === segmentIndex && legIndex > plan.directToData.segmentLegIndex ? 3 : 0;
            if (this.getDirectToState() === DirectToState.TOEXISTING) {
                this.removeDirectToExisting();
            }
            else {
                plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex + 1);
                plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex + 1);
                plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex + 1);
            }
        }
        plan.setDirectToData(segmentIndex, legIndex + legIndexDelta);
        if (course) {
            //do something
        }
        if (segment && leg) {
            const discoLeg = FlightPlan.createLeg({ type: LegType.Discontinuity });
            const dtoOriginLeg = this.createDTOOriginLeg(this.ppos);
            const dtoTargetLeg = this.createDTODirectLeg(leg.leg.fixIcao, leg.leg);
            plan.addLeg(segmentIndex, discoLeg, legIndex + legIndexDelta + 1, true);
            plan.addLeg(segmentIndex, dtoOriginLeg, legIndex + legIndexDelta + 2, true);
            plan.addLeg(segmentIndex, dtoTargetLeg, legIndex + legIndexDelta + 3, true);
            this.activateLeg(segmentIndex, legIndex + legIndexDelta + 3);
        }
    }
    /**
     * Creates a Direct-To origin IF leg.
     * @param ppos The current plane position.
     * @returns a Direct-To origin IF leg.
     */
    createDTOOriginLeg(ppos) {
        return FlightPlan.createLeg({
            type: LegType.IF,
            lat: ppos.lat,
            lon: ppos.lon
        });
    }
    /**
     * Creates a Direct-To DF leg.
     * @param icao is the icao.
     * @param leg The FlightPlanLeg.
     * @returns a Direct-To DF leg.
     */
    createDTODirectLeg(icao, leg) {
        const planeHeading = SimVar.GetSimVarValue('PLANE HEADING DEGREES TRUE', 'degrees');
        if (leg) {
            const directLeg = Object.assign({}, leg);
            directLeg.type = LegType.DF;
            directLeg.course = planeHeading === 0 ? 360 : planeHeading;
            return directLeg;
        }
        else {
            return FlightPlan.createLeg({
                type: LegType.DF,
                fixIcao: icao,
                course: planeHeading === 0 ? 360 : planeHeading
            });
        }
    }
    /**
     * Empties the primary flight plan.
     */
    async emptyPrimaryFlightPlan() {
        if (!this.flightPlanner.hasFlightPlan(Fms.PRIMARY_PLAN_INDEX)) {
            return;
        }
        const plan = this.flightPlanner.getFlightPlan(Fms.PRIMARY_PLAN_INDEX);
        const directToState = this.getDirectToState();
        if (directToState === DirectToState.TOEXISTING || (directToState !== DirectToState.TORANDOM && !Simplane.getIsGrounded() && plan.activeLateralLeg > 0)) {
            const directToIcao = plan.getLeg(plan.activeLateralLeg).leg.fixIcao;
            if (directToIcao) {
                const facType = ICAO.getFacilityType(directToIcao);
                const fac = await this.facLoader.getFacility(facType, directToIcao);
                this.createDirectToRandom(fac);
            }
        }
        for (let i = plan.segmentCount - 1; i >= 0; i--) {
            this.planRemoveSegment(i);
        }
        plan.addSegment(0, FlightPlanSegmentType.Departure);
        plan.addSegment(1, FlightPlanSegmentType.Enroute);
        plan.addSegment(2, FlightPlanSegmentType.Destination);
        this.setOrigin(undefined, undefined);
        this.setDestination(undefined, undefined);
        plan.setDirectToData(-1);
        this.setApproachDetails(false, ApproachType.APPROACH_TYPE_UNKNOWN, RnavTypeFlags.None, false);
        plan.setLateralLeg(0);
        plan.setVerticalLeg(0);
        plan.setCalculatingLeg(0);
        plan.calculate(0);
    }
    /**
     * Builds a temporary flight plan to preview the approach in the MFD Select Procedure pages.
     * @param facility The airport facility to load the approach from
     * @param procType The type of procedure to preview.
     * @param procIndex The procedure index selected.
     * @param transIndex The transition index selected.
     * @param oneWayRunway The one way runway to build the preview with, if any.
     * @param rwyTransIndex The runway transition index selected, if any.
     * @param visualRunwayNumber is the visual runway number, if any.
     * @param visualRunwayDesignator is the visual runway designator, if any.
     * @param transStartIndex The transition start offset, if any.
     * @returns the index of the temporary flight plan.
     */
    buildProcedurePreviewPlan(facility, procType, procIndex, transIndex, oneWayRunway, rwyTransIndex, visualRunwayNumber, visualRunwayDesignator, transStartIndex) {
        var _a;
        this.flightPlanner.deleteFlightPlan(Fms.PROC_PREVIEW_PLAN_INDEX);
        const plan = this.flightPlanner.createFlightPlan(Fms.PROC_PREVIEW_PLAN_INDEX);
        let procedureLegObject;
        switch (procType) {
            case ProcedureType.APPROACH:
                procedureLegObject = this.buildApproachLegs(facility, procIndex, transIndex, undefined, transStartIndex !== undefined ? transStartIndex : 0);
                plan.addSegment(0, FlightPlanSegmentType.Approach, undefined, false);
                break;
            case ProcedureType.ARRIVAL:
                {
                    const runwayIndex = rwyTransIndex !== null && rwyTransIndex !== void 0 ? rwyTransIndex : -1;
                    procedureLegObject = this.buildArrivalLegs(facility, procIndex, transIndex, runwayIndex, oneWayRunway);
                    plan.addSegment(0, FlightPlanSegmentType.Arrival, undefined, false);
                }
                break;
            case ProcedureType.DEPARTURE:
                {
                    const runwayIndex = rwyTransIndex !== null && rwyTransIndex !== void 0 ? rwyTransIndex : -1;
                    procedureLegObject = this.buildDepartureLegs(facility, procIndex, transIndex, runwayIndex, oneWayRunway);
                    plan.addSegment(0, FlightPlanSegmentType.Departure, undefined, false);
                }
                break;
            case ProcedureType.VISUALAPPROACH:
                if (visualRunwayNumber !== undefined && visualRunwayDesignator !== undefined) {
                    const visualRunway = RunwayUtils.matchOneWayRunway(facility, visualRunwayNumber, visualRunwayDesignator);
                    procedureLegObject = this.buildApproachLegs(facility, -1, -1, visualRunway);
                    plan.addSegment(0, FlightPlanSegmentType.Approach, undefined, false);
                }
                break;
        }
        if (procedureLegObject && procedureLegObject.procedureLegs.length > 0) {
            if (procedureLegObject.procedureLegs[0].type !== LegType.IF) {
                const replacementLeg = FlightPlan.createLeg({
                    type: LegType.IF,
                    fixIcao: procedureLegObject.procedureLegs[0].fixIcao,
                    fixTypeFlags: procedureLegObject.procedureLegs[0].fixTypeFlags,
                });
                procedureLegObject.procedureLegs.splice(0, 1, replacementLeg);
            }
            procedureLegObject.procedureLegs.forEach((l) => {
                plan.addLeg(0, l, undefined, undefined, undefined, false);
            });
            if (procType === ProcedureType.APPROACH) {
                // Adds missed approach legs
                if (!visualRunwayNumber && !visualRunwayDesignator && procedureLegObject.procedureLegs.length > 0) {
                    const missedLegs = (_a = facility.approaches[procIndex].missedLegs) !== null && _a !== void 0 ? _a : [];
                    if (missedLegs && missedLegs.length > 0) {
                        let maphIndex = -1;
                        for (let m = missedLegs.length - 1; m >= 0; m--) {
                            switch (missedLegs[m].type) {
                                case LegType.HA:
                                case LegType.HF:
                                case LegType.HM:
                                    maphIndex = m - 1;
                                    break;
                            }
                        }
                        for (let n = 0; n < missedLegs.length; n++) {
                            const newLeg = FlightPlan.createLeg(missedLegs[n]);
                            if (maphIndex > 0 && n === maphIndex) {
                                newLeg.fixTypeFlags |= FixTypeFlags.MAHP;
                                plan.addLeg(0, newLeg, undefined, false, true, false);
                            }
                            else {
                                plan.addLeg(0, newLeg, undefined, false, true, false);
                            }
                        }
                    }
                }
            }
            plan.calculate(0);
            return 2;
        }
        else {
            return -1;
        }
    }
    /**
     * Builds a temporary flight plan to preview an airway entry.
     * @param airway The airway object.
     * @param entry The entry intersection facility.
     * @param exit The exit intersection facility.
     * @returns the index of the temporary flight plan.
     */
    buildAirwayPreviewSegment(airway, entry, exit) {
        this.flightPlanner.deleteFlightPlan(Fms.PROC_PREVIEW_PLAN_INDEX);
        const plan = this.flightPlanner.createFlightPlan(Fms.PROC_PREVIEW_PLAN_INDEX);
        const airwayLegObject = this.buildAirwayLegs(airway, entry, exit);
        plan.insertSegment(0, FlightPlanSegmentType.Enroute, airway.name, false);
        if (airwayLegObject.procedureLegs.length > 0) {
            airwayLegObject.procedureLegs.forEach((l) => {
                plan.addLeg(0, l, undefined, undefined, undefined, false);
            });
            plan.calculate(0, true);
        }
        return Fms.PROC_PREVIEW_PLAN_INDEX;
    }
    /**
     * Adds an airway and airway segment to the flight plan.
     * @param airway The airway object.
     * @param entry The entry intersection facility.
     * @param exit The exit intersection facility.
     * @param segmentIndex Is the segment index for the entry leg.
     * @param legIndex Is the leg index of the entry leg in the segment of the
     */
    insertAirwaySegment(airway, entry, exit, segmentIndex, legIndex) {
        const plan = this.getFlightPlan();
        const airwaySegmentIndex = this.prepareAirwaySegment(`${airway.name}.${ICAO.getIdent(exit.icao)}`, segmentIndex, legIndex);
        const airwayLegObject = this.buildAirwayLegs(airway, entry, exit);
        const airwayLegs = airwayLegObject.procedureLegs;
        for (let i = 1; i < airwayLegs.length; i++) {
            this.planAddLeg(airwaySegmentIndex, airwayLegs[i]);
        }
        // handle duplicates
        const airwaySegment = plan.getSegment(airwaySegmentIndex);
        const lastLeg = airwaySegment.legs[airwaySegment.legs.length - 1];
        const nextLeg = plan.getNextLeg(airwaySegmentIndex + 1, -1);
        if (lastLeg && nextLeg && this.isDuplicateLeg(lastLeg.leg, nextLeg.leg)) {
            const nextLegIndex = plan.getLegIndexFromLeg(nextLeg);
            const nextLegSegmentIndex = plan.getSegmentIndex(nextLegIndex);
            const nextLegSegment = plan.getSegment(nextLegSegmentIndex);
            if (this.getAirwayLegType(plan, nextLegSegmentIndex, nextLegIndex - nextLegSegment.offset) === AirwayLegType.ENTRY) {
                // the duplicated leg is an airway entry -> remove the segment containing it (the segment is guaranteed to
                // contain just the one leg)
                this.planRemoveSegment(nextLegSegmentIndex);
            }
            else {
                this.planRemoveDuplicateLeg(lastLeg, nextLeg);
            }
        }
        plan.calculate(0, true);
    }
    /**
     * Prepares a new, empty airway segment in the primary flight plan which is ready to accept airway legs. Also
     * modifies the segment containing the entry leg, if necessary, either splitting it following the entry leg if it is
     * a non-airway enroute segment, or removing all legs following the entry leg if it is an airway segment. If the
     * entry leg is the last leg in its segment, a new non-airway enroute segment will be inserted after the entry leg
     * segment if the entry leg segment is the last segment in the flight plan or if the following segment is not an
     * enroute segment. If the entry leg is the entry for an existing airway segment, the existing airway segment will be
     * removed.
     * @param airwayName The name of the airway.
     * @param entrySegmentIndex The index of the segment containing the airway entry leg.
     * @param entrySegmentLegIndex The index of the airway entry leg in its segment.
     * @returns The index of the new airway segment.
     */
    prepareAirwaySegment(airwayName, entrySegmentIndex, entrySegmentLegIndex) {
        const plan = this.getPrimaryFlightPlan();
        const entrySegment = plan.getSegment(entrySegmentIndex);
        const nextSegment = entrySegmentIndex + 1 < plan.segmentCount ? plan.getSegment(entrySegmentIndex + 1) : undefined;
        let airwaySegmentIndex = entrySegmentIndex + 1;
        let removeLegsSegmentIndex = -1;
        let removeLegsFromIndex = -1;
        if (entrySegment.airway !== undefined) {
            // the entry leg is within an existing airway segment -> remove all legs in the same segment after the entry leg
            removeLegsSegmentIndex = entrySegmentIndex;
            removeLegsFromIndex = entrySegmentLegIndex + 1;
        }
        else if (entrySegmentLegIndex === entrySegment.legs.length - 1 && (nextSegment === null || nextSegment === void 0 ? void 0 : nextSegment.airway) !== undefined) {
            // the entry leg is the entry leg for an existing airway segment -> remove all legs from the existing airway segment
            removeLegsSegmentIndex = entrySegmentIndex + 1;
            removeLegsFromIndex = 0;
        }
        // remove legs as required
        if (removeLegsSegmentIndex >= 0) {
            const removeLegsSegment = plan.getSegment(removeLegsSegmentIndex);
            if (plan.directToData.segmentIndex === removeLegsSegmentIndex && plan.directToData.segmentLegIndex >= removeLegsFromIndex) {
                this.removeDirectToExisting();
            }
            if (this.getAirwayLegType(plan, removeLegsSegmentIndex, removeLegsSegment.legs.length - 1) === AirwayLegType.EXIT_ENTRY) {
                // preserve the airway entry leg
                const lastLeg = removeLegsSegment.legs[removeLegsSegment.legs.length - 1];
                this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, removeLegsSegmentIndex + 1);
                this.planAddLeg(removeLegsSegmentIndex + 1, lastLeg.leg, 0);
            }
            if (removeLegsFromIndex > 0) {
                while (removeLegsSegment.legs.length > removeLegsFromIndex) {
                    this.planRemoveLeg(removeLegsSegmentIndex, entrySegment.legs.length - 1, true, true);
                }
            }
            else {
                this.planRemoveSegment(removeLegsSegmentIndex);
            }
        }
        if (entrySegment.legs.length - 1 > entrySegmentLegIndex) {
            // entry leg is not the last leg in its segment -> split the segment after the entry leg
            airwaySegmentIndex = this.splitSegment(plan, entrySegmentIndex, entrySegmentLegIndex);
        }
        else if (plan.getSegment(entrySegmentIndex).segmentType === FlightPlanSegmentType.Enroute
            && ((nextSegment === null || nextSegment === void 0 ? void 0 : nextSegment.segmentType) !== FlightPlanSegmentType.Enroute)) {
            // entry leg is the last leg in its segment and the following segment doesn't exist or is not an enroute segment
            plan.insertSegment(airwaySegmentIndex, FlightPlanSegmentType.Enroute);
        }
        plan.insertSegment(airwaySegmentIndex, FlightPlanSegmentType.Enroute, airwayName);
        return airwaySegmentIndex;
    }
    /**
     * Splits a segment into two segments if type is enroute; if departure, remove legs after the legIndex, else do nothing.
     * @param plan is the flight plan to edit.
     * @param segmentIndex Is the segment index for the entry leg.
     * @param legIndex Is the leg index of the entry leg in the segment of the
     * @returns the segment number of the new airway segment if one was created, else the current segment or if no action was taken.
     */
    splitSegment(plan, segmentIndex, legIndex) {
        const segment = plan.getSegment(segmentIndex);
        if (segment.segmentType === FlightPlanSegmentType.Enroute) {
            const nextSegmentIndex = this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex + 1);
            for (let i = legIndex + 1; i < segment.legs.length; i++) {
                const leg = segment.legs[i].leg;
                this.planRemoveLeg(segmentIndex, i);
                this.planAddLeg(nextSegmentIndex, leg);
            }
            return nextSegmentIndex;
        }
        else if (segment.segmentType === FlightPlanSegmentType.Departure) {
            for (let i = legIndex + 1; i < segment.legs.length; i++) {
                this.planRemoveLeg(segmentIndex, i);
            }
        }
        return segmentIndex;
    }
    /**
     * Builds a legs for an airway.
     * @param airway The airway object.
     * @param entry The entry intersection facility.
     * @param exit The exit intersection facility.
     * @returns the InsertProcedureObject.
     */
    buildAirwayLegs(airway, entry, exit) {
        const insertAirwayObject = { procedureLegs: [] };
        const waypoints = airway.waypoints;
        const entryIndex = waypoints.findIndex((w) => w.icao === entry.icao);
        const exitIndex = waypoints.findIndex((w) => w.icao === exit.icao);
        const ascending = exitIndex > entryIndex;
        if (ascending) {
            for (let i = entryIndex; i <= exitIndex; i++) {
                const leg = FlightPlan.createLeg({
                    fixIcao: waypoints[i].icao,
                    type: i === entryIndex ? LegType.IF : LegType.TF
                });
                insertAirwayObject.procedureLegs.push(leg);
            }
        }
        else {
            for (let i = entryIndex; i >= exitIndex; i--) {
                const leg = FlightPlan.createLeg({
                    fixIcao: waypoints[i].icao,
                    type: i === entryIndex ? LegType.IF : LegType.TF
                });
                insertAirwayObject.procedureLegs.push(leg);
            }
        }
        return insertAirwayObject;
    }
    /**
     * Method to remove an airway from the flight plan.
     * @param segmentIndex is the segment index of the airway to remove.
     */
    removeAirway(segmentIndex) {
        const plan = this.getFlightPlan();
        let combineSegments = false;
        const nextSegmentIsAirway = plan.getSegment(segmentIndex + 1).airway;
        if (segmentIndex > 0) {
            const priorSegmentEnrouteNonAirway = plan.getSegment(segmentIndex - 1).segmentType === FlightPlanSegmentType.Enroute
                && plan.getSegment(segmentIndex - 1).airway === undefined;
            const nextSegmentEnrouteNonAirway = plan.getSegment(segmentIndex + 1).segmentType === FlightPlanSegmentType.Enroute
                && plan.getSegment(segmentIndex + 1).airway === undefined;
            if (priorSegmentEnrouteNonAirway && nextSegmentEnrouteNonAirway) {
                combineSegments = true;
            }
            let entryLeg = undefined;
            if (nextSegmentIsAirway) {
                const segment = plan.getSegment(segmentIndex);
                entryLeg = segment.legs[segment.legs.length - 1].leg;
            }
            this.planRemoveSegment(segmentIndex);
            if (combineSegments) {
                this.mergeSegments(plan, segmentIndex - 1);
            }
            if (priorSegmentEnrouteNonAirway && entryLeg !== undefined) {
                this.planAddLeg(segmentIndex - 1, entryLeg);
            }
            else if (entryLeg !== undefined) {
                const newSegmentIndex = this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex);
                this.planAddLeg(newSegmentIndex, entryLeg);
            }
        }
        plan.calculate(0, true);
    }
    /**
     * Merges the legs of two consecutive segments into a single segment. All legs in the second segment are moved to the
     * first, and the second segment is removed from the flight plan.
     * @param plan The flight plan to modify.
     * @param segmentIndex The index of the first segment to merge.
     */
    mergeSegments(plan, segmentIndex) {
        const segmentToGrow = plan.getSegment(segmentIndex);
        const segmentToRemove = plan.getSegment(segmentIndex + 1);
        const segmentToGrowOrigLength = segmentToGrow.legs.length;
        segmentToRemove.legs.forEach((l) => {
            plan.addLeg(segmentIndex, l.leg, undefined, l.isInDirectToSequence);
        });
        if (plan.directToData.segmentIndex === segmentIndex + 1) {
            plan.setDirectToData(segmentIndex, segmentToGrowOrigLength + plan.directToData.segmentLegIndex);
        }
        this.planRemoveSegment(segmentIndex + 1);
    }
    /**
     * Adds a hold leg to a segment.
     * @param segmentIndex The segment to add to.
     * @param legIndex The index of the leg.
     * @param holdLeg The hold leg to add.
     */
    addHold(segmentIndex, legIndex, holdLeg) {
        this.planAddLeg(segmentIndex, holdLeg, legIndex + 1);
    }
    /**
     * Returns the index of the last element in the array where predicate is true, and -1
     * otherwise.
     * @param array The source array to search in
     * @param predicate find calls predicate once for each element of the array, in descending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
     * @param defaultReturn is the default value
     * @returns either the index or the default if the predicate criteria is not met
     */
    findLastSegmentIndex(array, predicate, defaultReturn = -1) {
        let l = array.length;
        while (l--) {
            if (predicate(array[l], l, array)) {
                return array[l].segmentIndex;
            }
        }
        return defaultReturn;
    }
    /**
     * Adds a leg to the flight plan.
     * @param segmentIndex The segment to add the leg to.
     * @param leg The leg to add to the plan.
     * @param index The index of the leg in the segment to insert. Will add to the end of the segment if ommitted.
     * @param isInDirectToSequence Whether the new leg is in a direct to sequence.
     * @param isInMissedSequence Whether the new leg is in a missed approach sequence.
     * @param notify Whether or not to send notifications after the operation.
     */
    planAddLeg(segmentIndex, leg, index, isInDirectToSequence = false, isInMissedSequence = false, notify = true) {
        const plan = this.getFlightPlan();
        const dtoLegIndex = plan.directToData.segmentLegIndex;
        const dtoSegmentIndex = plan.directToData.segmentIndex;
        if (dtoSegmentIndex >= 0
            && (segmentIndex < dtoSegmentIndex
                || (segmentIndex === dtoSegmentIndex && index !== undefined && index <= dtoLegIndex))) {
            this.removeDirectToExisting();
        }
        const segment = plan.getSegment(segmentIndex);
        const addIndex = index ? index : Math.max(segment.legs.length - 1, 0);
        if (segment.segmentType === FlightPlanSegmentType.Approach && (addIndex > 0) && segment.legs[addIndex - 1].isInMissedApproachSequence) {
            isInMissedSequence = true;
        }
        plan.addLeg(segmentIndex, leg, index, isInDirectToSequence, isInMissedSequence, notify);
        plan.calculate(plan.activeLateralLeg - 1);
        const activeSegmentIndex = plan.getSegmentIndex(plan.activeLateralLeg);
        if (activeSegmentIndex !== -1) {
            const activeLegIndex = plan.activeLateralLeg - plan.getSegment(activeSegmentIndex).offset;
            if (segmentIndex < activeSegmentIndex || (index && segmentIndex == activeSegmentIndex && index < activeLegIndex)) {
                plan.setLateralLeg(plan.activeLateralLeg + 1);
            }
        }
        else {
            console.error('planAddLeg: activeSegmentIndex was -1');
        }
    }
    /**
     * Removes a leg from the flight plan.
     * @param segmentIndex The segment to add the leg to.
     * @param index The index of the leg in the segment to remove.
     * @param notify Whether or not to send notifications after the operation. True by default.
     * @param skipDupCheck Whether to skip checking for duplicates. False by default.
     * @param skipCancelDirectTo Whether to skip canceling a direct to existing if the removed leg is equal to or is
     * located before the direct to target. False by default.
     * @returns whether a leg was removed.
     */
    planRemoveLeg(segmentIndex, index, notify = true, skipDupCheck = false, skipCancelDirectTo = false) {
        const plan = this.getFlightPlan();
        const removeLegGlobalIndex = plan.getSegment(segmentIndex).offset + index;
        const prevLeg = plan.getPrevLeg(segmentIndex, index);
        const nextLeg = plan.getNextLeg(segmentIndex, index);
        const isDirectToExistingActive = this.getDirectToState() === DirectToState.TOEXISTING;
        let removed = false;
        const airwayLegType = this.getAirwayLegType(plan, segmentIndex, index);
        if (airwayLegType !== AirwayLegType.NONE) {
            removed = this.removeLegAirwayHandler(plan, airwayLegType, segmentIndex, index);
        }
        else {
            removed = plan.removeLeg(segmentIndex, index, notify) !== null ? true : false;
        }
        if (!removed) {
            return false;
        }
        const dtoLegIndex = plan.directToData.segmentLegIndex;
        const dtoSegmentIndex = plan.directToData.segmentIndex;
        if (!skipCancelDirectTo
            && dtoSegmentIndex >= 0
            && (segmentIndex < dtoSegmentIndex
                || (segmentIndex === dtoSegmentIndex && index <= dtoLegIndex))) {
            // Need to adjust direct to data to compensate for removed leg.
            if (segmentIndex === dtoSegmentIndex) {
                plan.directToData.segmentLegIndex--;
            }
            if (isDirectToExistingActive && segmentIndex === dtoSegmentIndex && index === dtoLegIndex) {
                const directIcao = plan.getSegment(plan.directToData.segmentIndex).legs[plan.directToData.segmentLegIndex + 3].leg.fixIcao;
                this.buildRandomDirectTo(directIcao);
            }
            this.removeDirectToExisting(plan.activeLateralLeg - 1);
        }
        else if (removeLegGlobalIndex < plan.activeLateralLeg || plan.activeLateralLeg >= plan.length) {
            plan.setLateralLeg(plan.activeLateralLeg - 1);
        }
        // Detect if we have created consecutive duplicate legs. If we have, we need to delete one of them.
        if (!skipDupCheck && prevLeg && nextLeg && this.isDuplicateLeg(prevLeg.leg, nextLeg.leg)) {
            this.planRemoveDuplicateLeg(prevLeg, nextLeg);
        }
        if (!skipDupCheck && this.checkIfRemoveLeftEmptySegmentToDelete(plan, segmentIndex)) {
            this.planRemoveSegment(segmentIndex);
        }
        plan.calculate(plan.activeLateralLeg - 1);
        return true;
    }
    /**
     * Method to handle a remove leg request t.
     * @param plan is the flight plan.
     * @param airwayLegType is the airwayLegType returned from the checkIfAirwayLeg method.
     * @param segmentIndex The segment we are removing from.
     * @param index is the leg index in the segment we are removing.
     * @returns whether this handler processed the remove request.
     */
    removeLegAirwayHandler(plan, airwayLegType, segmentIndex, index) {
        var _a, _b;
        switch (airwayLegType) {
            case AirwayLegType.ONROUTE:
                if (plan.getSegment(segmentIndex + 1).airway) {
                    const segment = plan.getSegment(segmentIndex);
                    const leg = segment.legs[segment.legs.length - 1].leg;
                    this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex + 1);
                    this.planAddLeg(segmentIndex + 1, leg);
                }
                this.removeAirway(segmentIndex);
                return true;
            case AirwayLegType.ENTRY:
                if (plan.getSegment(segmentIndex).segmentType === FlightPlanSegmentType.Enroute) {
                    const segment = plan.getSegment(segmentIndex + 1);
                    const leg = segment.legs[0].leg;
                    plan.removeLeg(segmentIndex + 1, 0);
                    this.planAddLeg(segmentIndex, leg);
                }
                else if (plan.getSegment(segmentIndex).segmentType === FlightPlanSegmentType.Departure) {
                    this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex + 1);
                    const segment = plan.getSegment(segmentIndex + 2);
                    const leg = segment.legs[0].leg;
                    plan.removeLeg(segmentIndex + 2, 0);
                    this.planAddLeg(segmentIndex + 1, leg);
                }
                return plan.removeLeg(segmentIndex, index) !== null ? true : false;
            case AirwayLegType.EXIT: {
                if (index < 1) {
                    this.removeAirway(segmentIndex);
                    return true;
                }
                else {
                    const segment = plan.getSegment(segmentIndex);
                    const airway = (_a = segment.airway) === null || _a === void 0 ? void 0 : _a.split('.');
                    segment.airway = airway && airway[0] ? airway[0] + '.' + segment.legs[index - 1].name : segment.airway;
                    plan.setAirway(segmentIndex, segment.airway);
                    return plan.removeLeg(segmentIndex, index) !== null ? true : false;
                }
            }
            case AirwayLegType.EXIT_ENTRY: {
                const segment = plan.getSegment(segmentIndex + 1);
                const leg = segment.legs[0].leg;
                this.planRemoveLeg(segmentIndex + 1, 0);
                if (index < 1) {
                    this.removeAirway(segmentIndex);
                }
                else {
                    plan.removeLeg(segmentIndex, index);
                    this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex + 1);
                    const firstAirwaySegment = plan.getSegment(segmentIndex);
                    const airway = (_b = firstAirwaySegment.airway) === null || _b === void 0 ? void 0 : _b.split('.');
                    firstAirwaySegment.airway = airway && airway[0] ? airway[0] + '.' + firstAirwaySegment.legs[index - 1].name : firstAirwaySegment.airway;
                    plan.setAirway(segmentIndex, firstAirwaySegment.airway);
                }
                this.planAddLeg(segmentIndex + 1, leg);
                return true;
            }
        }
        return false;
    }
    /**
     * Checks if a remove left an empty segment that also needs to be removed.
     * @param plan is the flight plan
     * @param segmentIndex The segment to add the leg to.
     * @returns whether to remove the segment.
     */
    checkIfRemoveLeftEmptySegmentToDelete(plan, segmentIndex) {
        const segment = plan.getSegment(segmentIndex);
        let nextSegment;
        if (segmentIndex < plan.segmentCount - 1) {
            nextSegment = plan.getSegment(segmentIndex + 1);
        }
        if (segment.legs.length < 1) {
            switch (segment.segmentType) {
                case FlightPlanSegmentType.Enroute:
                    if (nextSegment && nextSegment.segmentType === FlightPlanSegmentType.Enroute) {
                        return true;
                    }
                    break;
                //TODO: Add more cases as appropriate
            }
        }
        return false;
    }
    /**
     * Adds an appropriate origin or destination leg (either an airport or runway fix) to the primary flight plan. Origin
     * legs are added to the beginning of the specified segment. Destination legs are added to the end of the specified
     * segment.
     * @param isOrigin Whether to add an origin leg.
     * @param segmentIndex The index of the segment to which to add the leg.
     * @param airport The origin airport.
     * @param runway The origin runway.
     */
    planAddOriginDestinationLeg(isOrigin, segmentIndex, airport, runway) {
        let leg;
        if (runway) {
            leg = FmsUtils.buildRunwayLeg(airport, runway, isOrigin);
        }
        else {
            leg = FlightPlan.createLeg({
                lat: airport.lat,
                lon: airport.lon,
                type: isOrigin ? LegType.IF : LegType.TF,
                fixIcao: airport.icao,
                altitude1: airport.runways[0].elevation + UnitType.FOOT.convertTo(50, UnitType.METER)
            });
        }
        if (leg) {
            this.planAddLeg(segmentIndex, leg, isOrigin ? 0 : undefined);
            if (!isOrigin) {
                const plan = this.getFlightPlan();
                const lastEnrouteSegmentIndex = this.findLastEnrouteSegmentIndex(plan);
                const lastEnrouteSegment = plan.getSegment(lastEnrouteSegmentIndex);
                for (let i = lastEnrouteSegment.legs.length - 1; i >= 0; i--) {
                    if (lastEnrouteSegment.legs[i].leg.fixIcao === airport.icao) {
                        this.planRemoveLeg(lastEnrouteSegmentIndex, i, true, true);
                    }
                }
            }
        }
    }
    /**
     * Method to add a segment to the flightplan.
     * @param segmentType is the FlightPlanSegmentType.
     * @param index is the optional segment index to insert the segment.
     * @returns the segment index of the inserted segment.
     */
    planInsertSegmentOfType(segmentType, index) {
        const plan = this.getFlightPlan();
        let segmentIndex = -1;
        if (index) {
            segmentIndex = index - 1;
        }
        else {
            const segments = [];
            for (const segment of plan.segments()) {
                segments.push(segment);
            }
            switch (segmentType) {
                case FlightPlanSegmentType.Origin:
                    break;
                case FlightPlanSegmentType.Departure:
                    segmentIndex = 0;
                    break;
                case FlightPlanSegmentType.Arrival:
                    segmentIndex = this.findLastSegmentIndex(segments, (v) => {
                        return v.segmentType === FlightPlanSegmentType.Enroute;
                    }, 2);
                    break;
                case FlightPlanSegmentType.Approach:
                    segmentIndex = this.findLastSegmentIndex(segments, (v) => {
                        return v.segmentType === FlightPlanSegmentType.Enroute || v.segmentType === FlightPlanSegmentType.Arrival;
                    }, 2);
                    break;
                case FlightPlanSegmentType.MissedApproach:
                    segmentIndex = this.findLastSegmentIndex(segments, (v) => {
                        return v.segmentType === FlightPlanSegmentType.Approach;
                    }, 2);
                    break;
                case FlightPlanSegmentType.Destination:
                    segmentIndex = this.findLastSegmentIndex(segments, (v) => {
                        return v.segmentType === FlightPlanSegmentType.Enroute || v.segmentType === FlightPlanSegmentType.Arrival
                            || v.segmentType === FlightPlanSegmentType.Approach;
                    }, 5);
                    break;
                default:
                    segmentIndex = this.findLastSegmentIndex(segments, (v) => {
                        return v.segmentType === FlightPlanSegmentType.Enroute || v.segmentType === FlightPlanSegmentType.Arrival
                            || v.segmentType === FlightPlanSegmentType.Approach || v.segmentType === FlightPlanSegmentType.Destination;
                    }, 1);
                    segmentIndex--;
                    break;
            }
        }
        return this.planInsertSegment(segmentIndex + 1, segmentType).segmentIndex;
    }
    /**
     * Method to remove all legs from a segment.
     * @param segmentIndex is the index of the segment to delete all legs from.
     * @param segmentType is the type if segment to delete all legs from, if known.
     */
    planClearSegment(segmentIndex, segmentType) {
        this.planRemoveSegment(segmentIndex);
        this.planInsertSegment(segmentIndex, segmentType);
    }
    /**
     * Inserts a segment into the flight plan at the specified index and
     * reflows the subsequent segments.
     * @param segmentIndex The index to insert the flight plan segment.
     * @param segmentType The type of segment this will be.
     * @param airway The airway this segment is made up of, if any
     * @param notify Whether or not to send notifications after the operation.
     * @returns The new flight plan segment.
     */
    planInsertSegment(segmentIndex, segmentType = FlightPlanSegmentType.Enroute, airway, notify = true) {
        const plan = this.getFlightPlan();
        const segment = plan.insertSegment(segmentIndex, segmentType, airway, notify);
        plan.calculate(plan.activeLateralLeg - 1);
        if (plan.directToData.segmentIndex >= 0 && segmentIndex <= plan.directToData.segmentIndex) {
            plan.setDirectToData(plan.directToData.segmentIndex + 1, plan.directToData.segmentLegIndex);
        }
        return segment;
    }
    /**
     * Removes a segment from the flight plan and reflows the segments following
     * the removed segment, not leaving an empty segment at the specified index.
     * @param segmentIndex The index of the segment to remove.
     * @param notify Whether or not to send notifications after the operation.
     */
    planRemoveSegment(segmentIndex, notify = true) {
        const plan = this.getFlightPlan();
        const segment = plan.getSegment(segmentIndex);
        const activeSegmentIndex = plan.getSegmentIndex(plan.activeLateralLeg);
        if (plan.directToData.segmentIndex >= 0) {
            if (segmentIndex < plan.directToData.segmentIndex) {
                plan.setDirectToData(plan.directToData.segmentIndex - 1, plan.directToData.segmentLegIndex);
            }
            else if (segmentIndex === plan.directToData.segmentIndex) {
                plan.setDirectToData(-1);
            }
        }
        if (activeSegmentIndex === segmentIndex && !Simplane.getIsGrounded() && plan.length > 1) {
            const directIcao = plan.getLeg(plan.activeLateralLeg).leg.fixIcao;
            this.removeDirectToExisting();
            if (this.getDirectToState() !== DirectToState.TORANDOM) {
                this.buildRandomDirectTo(directIcao);
            }
        }
        plan.setLateralLeg(plan.activeLateralLeg - Utils.Clamp(plan.activeLateralLeg - segment.offset, 0, segment.legs.length));
        plan.removeSegment(segmentIndex, notify);
        plan.calculate(plan.activeLateralLeg - 1);
    }
    /**
     * Checks whether of two consecutive flight plan legs, the second is a duplicate of the first. The second leg is
     * considered a duplicate if and only if it is an IF, TF, or DF leg with the same terminator fix as the first leg,
     * which is also an IF, TF, or DF leg.
     * @param leg1 The first leg.
     * @param leg2 The second leg.
     * @returns whether the second leg is a duplicate of the first.
     */
    isDuplicateLeg(leg1, leg2) {
        if (leg2.type !== LegType.IF
            && leg2.type !== LegType.DF
            && leg2.type !== LegType.TF) {
            return false;
        }
        return (leg1.type === LegType.IF
            || leg1.type === LegType.TF
            || leg1.type === LegType.DF)
            && leg1.fixIcao === leg2.fixIcao;
    }
    /**
     * Checks whether of two consecutive flight plan legs, the second is an IF leg and is a duplicate of the first. The
     * IF leg is considered a duplicate if and only if its fix is the same as the fix at which the first leg terminates.
     * @param leg1 The first leg.
     * @param leg2 The second leg.
     * @returns whether the second leg is an duplicate IF leg of the first.
     */
    isDuplicateIFLeg(leg1, leg2) {
        if (leg2.type !== LegType.IF) {
            return false;
        }
        if (leg1.type !== LegType.TF
            && leg1.type !== LegType.DF
            && leg1.type !== LegType.RF
            && leg1.type !== LegType.CF
            && leg1.type !== LegType.AF
            && leg1.type !== LegType.IF) {
            return false;
        }
        return leg1.fixIcao === leg2.fixIcao;
    }
    /**
     * Merges two duplicate legs such that the new merged leg contains the fix type and altitude data from the source leg
     * and all other data is derived from the target leg.
     * @param target The target leg.
     * @param source The source leg.
     * @returns the merged leg.
     */
    mergeDuplicateLegData(target, source) {
        const merged = FlightPlan.createLeg(target);
        merged.fixTypeFlags |= source.fixTypeFlags;
        merged.altDesc = source.altDesc;
        merged.altitude1 = source.altitude1;
        merged.altitude2 = source.altitude2;
        return merged;
    }
    /**
     * Deletes one of two consecutive duplicate legs. If one leg is in a procedure and the other is not, the leg that is
     * not in a procedure will be deleted. If the legs are in different procedures, the earlier leg will be deleted.
     * Otherwise, the later leg will be deleted. If the deleted leg is the target leg of a direct to, the legs in the
     * direct to sequence will be copied and moved to immediately follow the duplicate leg that was not deleted.
     * @param leg1 The first duplicate leg.
     * @param leg2 The second duplicate leg.
     * @returns the leg that was deleted, or null if neither leg was deleted.
     * @throws Error if direct to legs could not be updated.
     */
    planRemoveDuplicateLeg(leg1, leg2) {
        const plan = this.getFlightPlan();
        const leg1Segment = plan.getSegmentFromLeg(leg1);
        const leg1Index = plan.getLegIndexFromLeg(leg1);
        const leg2Segment = plan.getSegmentFromLeg(leg2);
        const leg2Index = plan.getLegIndexFromLeg(leg2);
        if (!leg1Segment || !leg2Segment) {
            return null;
        }
        const isLeg1DirectToLeg = leg1.isInDirectToSequence;
        const isLeg2DirectToLeg = leg2.isInDirectToSequence;
        const dupDirectToLeg = isLeg1DirectToLeg ? leg1
            : isLeg2DirectToLeg ? leg2
                : null;
        if (dupDirectToLeg) {
            if (dupDirectToLeg.leg.type === LegType.IF) {
                // Technically this should never happen.
                return null;
            }
            else {
                // If one of the duplicates is the second leg in a direct to sequence, then the true duplicated leg is the
                // target leg of the DTO. In this case, we call this method with the DTO target leg replacing the DTO leg.
                const dtoTargetLeg = plan.getSegment(plan.directToData.segmentIndex).legs[plan.directToData.segmentLegIndex];
                return isLeg1DirectToLeg ? this.planRemoveDuplicateLeg(dtoTargetLeg, leg2) : this.planRemoveDuplicateLeg(leg1, dtoTargetLeg);
            }
        }
        const isLeg1InProc = leg1Segment.segmentType !== FlightPlanSegmentType.Enroute;
        const isLeg2InProc = leg2Segment.segmentType !== FlightPlanSegmentType.Enroute;
        let toDeleteSegment;
        let toDeleteIndex;
        let toDeleteLeg;
        if (!isLeg1InProc && isLeg2InProc || (isLeg1InProc && isLeg2InProc && leg1Segment !== leg2Segment)) {
            toDeleteSegment = leg1Segment;
            toDeleteIndex = leg1Index - leg1Segment.offset;
            toDeleteLeg = leg1;
        }
        else {
            toDeleteSegment = leg2Segment;
            toDeleteIndex = leg2Index - leg2Segment.offset;
            leg1.leg = this.mergeDuplicateLegData(leg1.leg, leg2.leg);
            toDeleteLeg = leg2;
        }
        if (toDeleteIndex >= 0) {
            const dtoTargetLeg = plan.directToData.segmentIndex < 0 ? null : plan.getSegment(plan.directToData.segmentIndex).legs[plan.directToData.segmentLegIndex];
            const needMoveDtoLegs = toDeleteLeg === dtoTargetLeg;
            if (needMoveDtoLegs) {
                const isDtoExistingActive = this.getDirectToState() === DirectToState.TOEXISTING;
                // If the removed leg was the target leg of a DTO existing, we need to shift the DTO legs to target the leg
                // that was not removed.
                const oldDiscoLeg = plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex + 1);
                const oldDtoLeg1 = plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex + 1);
                const oldDtoLeg2 = plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex + 1);
                if (!oldDtoLeg1 || !oldDtoLeg2 || !oldDiscoLeg) {
                    throw new Error(`Fms: Could not remove direct to legs starting at segment index ${plan.directToData.segmentIndex}, leg index ${plan.directToData.segmentLegIndex} during duplicate leg resolution.`);
                }
                const preservedLeg = toDeleteLeg === leg1 ? leg2 : leg1;
                const preservedLegIndex = plan.getLegIndexFromLeg(preservedLeg);
                const newTargetSegmentIndex = plan.getSegmentIndex(preservedLegIndex);
                const newTargetSegmentLegIndex = preservedLegIndex - plan.getSegment(newTargetSegmentIndex).offset;
                plan.setDirectToData(newTargetSegmentIndex, newTargetSegmentLegIndex);
                plan.addLeg(newTargetSegmentIndex, FlightPlan.createLeg(oldDiscoLeg.leg), newTargetSegmentLegIndex + 1, true);
                plan.addLeg(newTargetSegmentIndex, FlightPlan.createLeg(oldDtoLeg1.leg), newTargetSegmentLegIndex + 2, true);
                plan.addLeg(newTargetSegmentIndex, FlightPlan.createLeg(oldDtoLeg2.leg), newTargetSegmentLegIndex + 3, true);
                if (isDtoExistingActive) {
                    plan.setLateralLeg(preservedLegIndex + 3);
                }
            }
            const success = this.planRemoveLeg(toDeleteSegment.segmentIndex, toDeleteIndex, true, false, needMoveDtoLegs);
            if (success) {
                return toDeleteLeg;
            }
        }
        return null;
    }
    /**
     * Loads an approach frequency into the fms.
     * @param facility The airport facility.
     * @param approachIndex The approach Index.
     */
    loadApproachFrequency(facility, approachIndex) {
        this.approachFrequency.set(FmsUtils.getApproachFrequency(facility, approachIndex));
    }
    /**
     * Loads an approach frequency into the fms.
     * @param radioIndex The radio index to set (1 or 2).
     * @param forceNotify resets the subject to force a cross-instrument notification.
     */
    setLocFrequency(radioIndex, forceNotify = false) {
        const setActive = this.cdiSource.type === NavSourceType.Gps || this.cdiSource.index !== radioIndex;
        const approachFrequency = this.approachFrequency.get();
        if (forceNotify) {
            this.approachFrequency.set(undefined);
            this.approachFrequency.set(approachFrequency);
        }
        if (approachFrequency !== undefined && radioIndex > 0 && radioIndex < 3) {
            SimVar.SetSimVarValue(`K:NAV${radioIndex}_STBY_SET_HZ`, 'Hz', approachFrequency.freqMHz * 1000000);
            if (setActive) {
                SimVar.SetSimVarValue(`K:NAV${radioIndex}_RADIO_SWAP`, 'Bool', 1);
            }
        }
    }
    /**
     * Sets the approach details for the loaded approach and sends an event across the bus.
     * @param approachLoaded Whether an approach is loaded.
     * @param approachType The approach type.
     * @param approachRnavType The approach RNAV type.
     * @param approachIsActive Whether the approach is active.
     */
    setApproachDetails(approachLoaded, approachType, approachRnavType, approachIsActive) {
        const approachDetails = {
            approachLoaded: approachLoaded !== undefined ? approachLoaded : this.approachDetails.approachLoaded,
            approachType: approachType !== undefined ? approachType : this.approachDetails.approachType,
            approachRnavType: approachRnavType !== undefined ? approachRnavType : this.approachDetails.approachRnavType,
            approachIsActive: approachIsActive !== undefined ? approachIsActive : this.approachDetails.approachIsActive
        };
        if (approachDetails.approachIsActive && !approachDetails.approachLoaded) {
            this.checkApproachState();
            return;
        }
        if (approachDetails !== this.approachDetails) {
            this.approachDetails = approachDetails;
            Fms.g1000EvtPub.publishEvent('approach_details_set', this.approachDetails);
        }
    }
}
Fms.PRIMARY_PLAN_INDEX = 0;
Fms.DTO_RANDOM_PLAN_INDEX = 1;
Fms.PROC_PREVIEW_PLAN_INDEX = 2;
