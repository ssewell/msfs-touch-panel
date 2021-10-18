/// <reference types="msfstypes/JS/Avionics" />
import { FSComponent, SubscribableArrayEventType, UnitType } from 'msfssdk';
import { FacilityType, ICAO } from 'msfssdk/navigation';
import { OriginDestChangeType, PlanChangeType, FlightPlanSegmentType } from 'msfssdk/flightplan';
import { DirectToState } from '../../FlightPlan/Fms';
import { ActiveLegStates } from '../UIControls/FplActiveLegArrow';
/**
 * The scroll mode for FPL.
 */
export var ScrollMode;
(function (ScrollMode) {
    ScrollMode[ScrollMode["MANUAL"] = 0] = "MANUAL";
    ScrollMode[ScrollMode["AUTO"] = 1] = "AUTO";
})(ScrollMode || (ScrollMode = {}));
/**
 * Controller for FPLDetails
 */
export class FPLDetailsController {
    /**
     * Constructor
     * @param store the store instance
     * @param fms the fms
     * @param bus the bus
     * @param scrollToActiveLegCb the callback for scroll to active leg
     */
    constructor(store, fms, bus, scrollToActiveLegCb) {
        this.store = store;
        this.fms = fms;
        this.bus = bus;
        this.scrollToActiveLegCb = scrollToActiveLegCb;
        this.sectionRefs = [];
        this.originRef = FSComponent.createRef();
        this.legArrowRef = FSComponent.createRef();
        this.hasVnav = false;
        this.isInitialized = false;
        this.airwaysCollapsed = false;
        this.scrollMode = ScrollMode.MANUAL;
        /** First time this view is loaded, we need to force scroll to the active leg */
        this.didInitScroll = false;
        if (this.fms.autopilot) {
            this.hasVnav = true;
        }
    }
    /** Initializes fpldetails controller */
    initialize() {
        this.store.activeLegState.sub(() => {
            this.onActiveLegStateChange();
        });
        this.store.activeLeg.sub(() => {
            this.onActiveLegStateChange();
        });
        this.store.segments.sub((index, type) => {
            if (type === SubscribableArrayEventType.Removed) {
                this.sectionRefs.splice(index, 1);
            }
        });
        //Attempt to load the first flight plan on construction
        this.onFlightPlanLoaded({ planIndex: 0 });
        //this.initActiveLeg();
        this.isInitialized = true;
        this.bus.getSubscriber().on('alt').atFrequency(1).handle(alt => this.store.currentAltitude = alt);
        const ap = this.bus.getSubscriber();
        ap.on('alt_select').withPrecision(0).handle((sAlt) => {
            this.store.selectedAltitude = sAlt;
        });
        const fpl = this.bus.getSubscriber();
        fpl.on('fplSegmentChange').handle(this.onSegmentChange.bind(this));
        fpl.on('fplLegChange').handle(this.onLegChange.bind(this));
        fpl.on('fplActiveLegChange').handle(this.updateActiveLegState.bind(this));
        fpl.on('fplOriginDestChanged').handle(this.onOriginDestChanged.bind(this));
        fpl.on('fplCalculated').handle(this.onPlanCalculated.bind(this));
        fpl.on('fplLoaded').handle(this.onFlightPlanLoaded.bind(this));
        fpl.on('fplIndexChanged').handle(this.onPlanIndexChanged.bind(this));
        fpl.on('fplProcDetailsChanged').handle(this.onProcDetailsChanged.bind(this));
        fpl.on('vnavUpdated').handle(this.onVnavUpdated.bind(this));
        fpl.on('fplDirectToDataChanged').handle(this.updateActiveLegState.bind(this));
    }
    /**
     * A method to initialize the active leg.
     * TODO: REMOVE THIS WHEN THE ROOT PROBLEM IS FIXED
     */
    initActiveLeg() {
        this.updateActiveLegState();
    }
    /**
     * A method to initialize the dto leg.
     * TODO: REMOVE THIS WHEN THE ROOT PROBLEM IS FIXED
     */
    initDtoLeg() {
        if (this.fms.flightPlanner.activePlanIndex == 1) {
            const e = {
                planIndex: 1
            };
            this.onPlanIndexChanged(e);
        }
    }
    /**
     * A callback fired when a proc details event is received from the bus.
     * @param e The event that was captured.
     */
    onProcDetailsChanged(e) {
        var _a;
        if (e.planIndex == 0 && e.details.arrivalFacilityIcao !== ((_a = this.store.facilityInfo.arrivalFacility) === null || _a === void 0 ? void 0 : _a.icao)) {
            if (e.details.arrivalFacilityIcao !== undefined) {
                this.store.loader.getFacility(FacilityType.Airport, e.details.arrivalFacilityIcao)
                    .then(facility => {
                    this.store.facilityInfo.arrivalFacility = facility;
                    this.updateSectionsHeaderEmptyRow();
                });
            }
            else {
                this.store.facilityInfo.arrivalFacility = undefined;
                this.updateSectionsHeaderEmptyRow();
            }
        }
        else if (e.planIndex == 0) {
            this.updateSectionsHeaderEmptyRow();
        }
    }
    /**
     * A callback fired when a vnav updated message is recevied from the bus.
     * @param e The event that was captured.
     */
    onVnavUpdated(e) {
        var _a, _b;
        if (this.hasVnav && this.fms.autopilot !== undefined && e === true) {
            const vnav = this.fms.autopilot.directors.vnavDirector;
            const segments = vnav.calculator.getSegments();
            let maxAltitude = UnitType.FOOT.convertTo(Math.max(this.store.selectedAltitude, Math.round(this.store.currentAltitude / 100) * 100), UnitType.METER);
            let minAltitude = vnav.calculator.getFirstDescentConstraintAltitude();
            if (segments && segments.length > 0) {
                //start with segment 1 to skip departure segment for now
                for (let i = 1; i < (segments === null || segments === void 0 ? void 0 : segments.length); i++) {
                    const section = (_a = this.sectionRefs[i]) === null || _a === void 0 ? void 0 : _a.instance;
                    if (section !== undefined) {
                        for (let j = 0; j < segments[i].legs.length; j++) {
                            const segment = segments[i];
                            if (segment !== undefined) {
                                const vnavLeg = segments[i].legs[j];
                                if (vnavLeg) {
                                    if (vnavLeg.altitude && vnavLeg.isAdvisory && vnavLeg.altitude > maxAltitude) {
                                        const newAltitude = minAltitude ? Math.max(minAltitude, maxAltitude) : maxAltitude;
                                        section.setLegAltitude(j, vnavLeg, newAltitude);
                                    }
                                    else {
                                        section.setLegAltitude(j, vnavLeg);
                                    }
                                    if (!vnavLeg.isAdvisory) {
                                        maxAltitude = vnavLeg.altitude;
                                        minAltitude = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (this.fms.getDirectToState() === DirectToState.TOEXISTING) {
                const plan = this.fms.getFlightPlan();
                const vnavLeg = vnav.calculator.getLeg(plan.activeLateralLeg);
                (_b = this.sectionRefs[plan.directToData.segmentIndex]) === null || _b === void 0 ? void 0 : _b.instance.setLegAltitude(plan.directToData.segmentLegIndex, vnavLeg);
            }
        }
    }
    /**
     * A callback fired when a new plan is loaded.
     * @param e The event that was captured.
     */
    onFlightPlanLoaded(e) {
        const plan = this.fms.flightPlanner.getFlightPlan(e.planIndex);
        if (plan.originAirport !== undefined) {
            this.onOriginDestChanged({ planIndex: e.planIndex, airport: plan.originAirport, type: OriginDestChangeType.OriginAdded });
        }
        for (let i = 0; i < plan.segmentCount; i++) {
            const segment = plan.getSegment(i);
            this.onSegmentChange({ planIndex: e.planIndex, segmentIndex: i, segment: segment, type: PlanChangeType.Added });
            for (let l = 0; l < segment.legs.length; l++) {
                this.onLegChange({
                    planIndex: e.planIndex,
                    segmentIndex: i, legIndex: l, leg: segment.legs[l], type: PlanChangeType.Added
                });
            }
        }
        if (plan.procedureDetails.arrivalIndex > -1) {
            this.onProcDetailsChanged({ planIndex: e.planIndex, details: plan.procedureDetails });
        }
        if (plan.destinationAirport !== undefined) {
            this.onOriginDestChanged({ planIndex: e.planIndex, airport: plan.destinationAirport, type: OriginDestChangeType.DestinationAdded });
        }
        if (e.planIndex === this.fms.flightPlanner.activePlanIndex) {
            this.updateActiveLegState();
        }
    }
    /**
     * A callback fired when the plan index changes (used for handling direct to display).
     * @param e The event that was captured.
     */
    onPlanIndexChanged(e) {
        if (e.planIndex === 1 && this.isInitialized) {
            const plan = this.fms.getDirectToFlightPlan();
            const segment = plan.getSegment(0);
            if (segment.segmentType === FlightPlanSegmentType.RandomDirectTo) {
                this.originRef.instance.onDirectToRandomActive(ICAO.getIdent(segment.legs[2].leg.fixIcao));
            }
            else {
                this.originRef.instance.removeDirectToRandom(this.fms.getFlightPlan(0));
            }
        }
        else if (this.isInitialized) {
            const plan = this.fms.getFlightPlan(0);
            this.originRef.instance.removeDirectToRandom(plan);
        }
        this.updateActiveLegState();
    }
    /**
     * A callback fired when the plan is calculated.
     * @param e The event that was captured.
     */
    onPlanCalculated(e) {
        var _a;
        if (e.planIndex !== 0) {
            return;
        }
        const plan = this.fms.flightPlanner.getFlightPlan(e.planIndex);
        let sectionIndex = 0;
        for (const segment of plan.segments()) {
            const section = (_a = this.sectionRefs[sectionIndex]) === null || _a === void 0 ? void 0 : _a.instance;
            if (section !== undefined) {
                for (let i = 0; i < segment.legs.length; i++) {
                    const calc = segment.legs[i].calculated;
                    calc && section.updateFromLegCalculations(i);
                }
            }
            else {
                console.warn(`onPlanCalculated: Found no section ref for segment ${segment.segmentIndex} !`);
            }
            sectionIndex++;
        }
        //this.updateActiveLegState();
    }
    /**
     * A callback fired when the origin or destination is updated.
     * @param e The event that was captured.
     */
    onOriginDestChanged(e) {
        if (e.planIndex !== 0) {
            return;
        }
        switch (e.type) {
            case OriginDestChangeType.OriginAdded:
                if (e.airport !== undefined) {
                    this.store.loader.getFacility(FacilityType.Airport, e.airport)
                        .then(facility => {
                        this.store.facilityInfo.originFacility = facility;
                        this.updateSectionsHeaderEmptyRow();
                    });
                }
                break;
            case OriginDestChangeType.DestinationAdded:
                if (e.airport !== undefined) {
                    this.store.loader.getFacility(FacilityType.Airport, e.airport)
                        .then(facility => {
                        this.store.facilityInfo.destinationFacility = facility;
                        this.updateSectionsHeaderEmptyRow();
                    });
                }
                break;
            case OriginDestChangeType.OriginRemoved:
                this.store.facilityInfo.originFacility = undefined;
                this.updateSectionsHeaderEmptyRow();
                break;
            case OriginDestChangeType.DestinationRemoved:
                this.store.facilityInfo.destinationFacility = undefined;
                this.updateSectionsHeaderEmptyRow();
                break;
        }
        this.originRef.instance.onOriginDestChanged(e);
    }
    /**
     * Manages the state of the active/direct leg indications based on the store.activeLegState subject state.
     */
    onActiveLegStateChange() {
        var _a;
        this.clearActiveWaypoints();
        const state = this.store.activeLegState.get();
        const plan = this.fms.getFlightPlan();
        const activeLeg = this.store.activeLeg.get();
        const section = (_a = this.sectionRefs[activeLeg.segmentIndex]) === null || _a === void 0 ? void 0 : _a.instance;
        this.legArrowRef.instance.updateArrows(state, activeLeg, plan);
        switch (state) {
            case ActiveLegStates.NORMAL:
            case ActiveLegStates.EXISTING_DIRECT:
                section && section.setActiveLeg(activeLeg.legIndex);
                break;
        }
        if (!this.didInitScroll || this.scrollMode === ScrollMode.AUTO) {
            this.scrollToActiveLegCb();
            this.didInitScroll = true;
        }
        this.manageCollapsedAirways(plan);
        this.notifyActiveLegState(plan);
    }
    /**
     * Updates the active leg state subjects.
     */
    updateActiveLegState() {
        const plan = this.fms.getFlightPlan();
        const directToState = this.fms.getDirectToState();
        if (directToState === DirectToState.TORANDOM) {
            this.store.activeLegState.set(ActiveLegStates.RANDOM_DIRECT);
            return;
        }
        else if (directToState === DirectToState.TOEXISTING) {
            this.store.activeLegState.set(ActiveLegStates.EXISTING_DIRECT);
            const activeLeg = { legIndex: plan.directToData.segmentLegIndex, segmentIndex: plan.directToData.segmentIndex };
            this.store.activeLeg.set(activeLeg);
            return;
        }
        else if (plan.activeLateralLeg < plan.length) {
            this.store.activeLegState.set(ActiveLegStates.NORMAL);
            const leg = plan.getLeg(plan.activeLateralLeg);
            const activeSegment = plan.getSegmentFromLeg(leg);
            if (activeSegment) {
                const activeLegIndexInSegment = plan.activeLateralLeg - activeSegment.offset;
                const activeLeg = { legIndex: activeLegIndexInSegment, segmentIndex: activeSegment.segmentIndex };
                this.store.activeLeg.set(activeLeg);
                return;
            }
        }
        this.store.activeLegState.set(ActiveLegStates.NONE);
    }
    /**
     * A callback fired when a flight plan leg changes.
     * @param e The event that was captured.
     */
    onLegChange(e) {
        var _a, _b;
        if (e.planIndex !== 0) {
            return;
        }
        const section = (_a = this.sectionRefs[e.segmentIndex]) === null || _a === void 0 ? void 0 : _a.instance;
        switch (e.type) {
            case PlanChangeType.Added: {
                const plan = this.fms.getFlightPlan();
                const segment = plan.getSegment(e.segmentIndex);
                const leg = segment.legs[e.legIndex];
                const isAirwayLeg = segment.airway !== undefined;
                const isExitLeg = isAirwayLeg && (leg === null || leg === void 0 ? void 0 : leg.name) === ((_b = segment.airway) === null || _b === void 0 ? void 0 : _b.split('.')[1]);
                if (this.hasVnav) {
                    section && leg && section.addLeg(e.legIndex, {
                        legDefinition: leg, isActive: false, isDirectTo: false,
                        targetAltitude: -1, isAdvisory: true, isAirwayFix: isAirwayLeg, isAirwayExitFix: isExitLeg
                    });
                }
                else {
                    section && leg && section.addLeg(e.legIndex, {
                        legDefinition: leg, isActive: false, isDirectTo: false,
                        isAirwayFix: isAirwayLeg, isAirwayExitFix: isExitLeg
                    });
                }
                break;
            }
            case PlanChangeType.Removed:
                section && section.removeLeg(e.legIndex);
                break;
        }
    }
    /**
     * A callback fired when a flight plan segment changes.
     * @param e The event that was captured.
     */
    onSegmentChange(e) {
        var _a, _b, _c, _d;
        if (e.planIndex !== 0) {
            return;
        }
        switch (e.type) {
            case PlanChangeType.Added: {
                if (e.segmentIndex < this.sectionRefs.length) {
                    this.store.segments.removeAt(e.segmentIndex);
                }
                e.segment && this.store.segments.insert(e.segment, e.segmentIndex);
                break;
            }
            case PlanChangeType.Inserted: {
                e.segment && this.store.segments.insert(e.segment, e.segmentIndex);
                for (let s = e.segmentIndex; s < this.store.segments.length; s++) {
                    const section = (_a = this.sectionRefs[s]) === null || _a === void 0 ? void 0 : _a.instance;
                    if (section !== undefined) {
                        section.segmentIndex.set(s);
                    }
                }
                break;
            }
            case PlanChangeType.Removed:
                this.store.segments.removeAt(e.segmentIndex);
                for (let s = e.segmentIndex; s < this.store.segments.length; s++) {
                    const section = (_b = this.sectionRefs[s]) === null || _b === void 0 ? void 0 : _b.instance;
                    if (section !== undefined) {
                        section.segmentIndex.set(s);
                    }
                }
                break;
            case PlanChangeType.Changed: {
                const section = (_c = this.sectionRefs[e.segmentIndex]) === null || _c === void 0 ? void 0 : _c.instance;
                if (section !== undefined && e.segment) {
                    section.segmentIndex.set(e.segmentIndex);
                }
                const prevSection = (_d = this.sectionRefs[e.segmentIndex - 1]) === null || _d === void 0 ? void 0 : _d.instance;
                if (prevSection !== undefined) {
                    prevSection.segmentIndex.set(e.segmentIndex - 1);
                }
                break;
            }
        }
        this.updateSectionsHeaderEmptyRow();
    }
    /**
     * Updates all section headers and empty rows.
     */
    updateSectionsHeaderEmptyRow() {
        for (let i = 0; i < this.sectionRefs.length; i++) {
            const sectionRef = this.sectionRefs[i];
            if (sectionRef) {
                sectionRef.instance.updateHeader();
                sectionRef.instance.updateEmptyRowVisibility();
            }
        }
    }
    /**
     * A method called to collapse the airways.
     */
    collapseAirways() {
        var _a;
        this.airwaysCollapsed = !this.airwaysCollapsed;
        const plan = this.fms.getFlightPlan();
        const activeSegmentIndex = plan.getSegmentIndex(plan.activeLateralLeg);
        for (let i = 1; i < plan.segmentCount; i++) {
            if (i === activeSegmentIndex) {
                continue;
            }
            const segment = plan.getSegment(i);
            if (segment.segmentType === FlightPlanSegmentType.Enroute && segment.airway !== undefined) {
                const section = (_a = this.sectionRefs[i]) === null || _a === void 0 ? void 0 : _a.instance;
                if (section !== undefined) {
                    section.collapseLegs(this.airwaysCollapsed);
                    continue;
                }
            }
        }
    }
    /**
     * A method called to manage collapsed airways when the active segment changes.
     * @param plan is the flight plan
     */
    manageCollapsedAirways(plan) {
        var _a, _b;
        const activeSegmentIndex = plan.getSegmentIndex(plan.activeLateralLeg);
        const fromSegmentIndex = plan.getSegmentIndex(plan.activeLateralLeg - 1);
        for (let i = 1; i < plan.segmentCount; i++) {
            const segment = plan.getSegment(i);
            if ((i === activeSegmentIndex || i === fromSegmentIndex) && segment.segmentType === FlightPlanSegmentType.Enroute) {
                const section = (_a = this.sectionRefs[i]) === null || _a === void 0 ? void 0 : _a.instance;
                if (section !== undefined) {
                    section.collapseLegs(false);
                }
            }
            else if (segment.segmentType === FlightPlanSegmentType.Enroute && segment.airway !== undefined) {
                const section = (_b = this.sectionRefs[i]) === null || _b === void 0 ? void 0 : _b.instance;
                if (section !== undefined) {
                    section.collapseLegs(this.airwaysCollapsed);
                }
            }
        }
    }
    /**
     * Notifies this controller's sections of the flight plan's active leg state.
     * @param plan The flight plan.
     */
    notifyActiveLegState(plan) {
        var _a;
        if (plan.length > 0 && plan.segmentCount > 2) {
            const activeSegmentIndex = Utils.Clamp(plan.getSegmentIndex(plan.activeLateralLeg), 0, plan.segmentCount);
            let activeLegIndex = plan.activeLateralLeg - plan.getSegment(activeSegmentIndex).offset;
            if (this.fms.getDirectToState() === DirectToState.TOEXISTING) {
                activeLegIndex -= 3;
            }
            for (let i = 0; i < plan.segmentCount; i++) {
                const section = (_a = this.sectionRefs[i]) === null || _a === void 0 ? void 0 : _a.instance;
                if (section !== undefined) {
                    section.onActiveLegChanged(activeSegmentIndex, activeLegIndex);
                }
            }
        }
    }
    /**
     * Sets all legs in the displayed plan to inactive.
     */
    clearActiveWaypoints() {
        this.sectionRefs.forEach((section) => {
            section.instance.cancelAllActiveLegs();
        });
    }
}
