import { NumberUnitSubject, SubEvent, Subject, UnitType } from 'msfssdk';
import { VNavPathMode } from 'msfssdk/autopilot';
import { ActiveLegType } from 'msfssdk/flightplan';
/**
 * A map flight plan layer data provider which provides a displayed flight plan from a flight planner.
 */
export class MapFlightPlannerPlanDataProvider {
    /**
     * Constructor.
     * @param bus The event bus.
     * @param planner The flight planner.
     */
    constructor(bus, planner) {
        this.bus = bus;
        this.planner = planner;
        this.planSub = Subject.create(null);
        this.plan = this.planSub;
        this.planModified = new SubEvent();
        this.planCalculated = new SubEvent();
        this.activeLegIndexSub = Subject.create(0);
        this.activeLateralLegIndex = this.activeLegIndexSub;
        this.activeLNavLegVectorIndexSub = Subject.create(0);
        this.activeLNavLegVectorIndex = this.activeLNavLegVectorIndexSub;
        this.isLNavSuspendedSub = Subject.create(false);
        this.isLNavSuspended = this.isLNavSuspendedSub;
        this.vnavPathModeSub = Subject.create(VNavPathMode.None);
        this.vnavPathMode = this.vnavPathModeSub;
        this.vnavTodLegIndexSub = Subject.create(-1);
        this.vnavTodLegIndex = this.vnavTodLegIndexSub;
        this.vnavTodLegDistanceSub = NumberUnitSubject.createFromNumberUnit(UnitType.METER.createNumber(0));
        this.vnavTodLegDistance = this.vnavTodLegDistanceSub;
        this.vnavBodLegIndexSub = Subject.create(-1);
        this.vnavBodLegIndex = this.vnavBodLegIndexSub;
        this.obsCourseSub = Subject.create(undefined);
        this.obsCourse = this.obsCourseSub;
        this.planIndex = -1;
        this.activeLNavLegVectorIndexValue = 0;
        this.isLNavSuspendedValue = false;
        this.vnavPathModeValue = VNavPathMode.None;
        this.vnavTodLegIndexValue = -1;
        this.vnavTodLegDistanceMeters = 0;
        this.vnavBodLegIndexValue = -1;
        this.isObsActive = false;
        this.obsCourseValue = 0;
        const plannerEvents = bus.getSubscriber();
        plannerEvents.on('fplCreated').handle(data => { data.planIndex === this.planIndex && this.updatePlan(); });
        plannerEvents.on('fplDeleted').handle(data => { data.planIndex === this.planIndex && this.updatePlan(); });
        plannerEvents.on('fplLoaded').handle(data => { data.planIndex === this.planIndex && this.updatePlan(); });
        plannerEvents.on('fplIndexChanged').handle(() => { this.updateActivePlanRelatedSubs(); });
        plannerEvents.on('fplLegChange').handle(data => { data.planIndex === this.planIndex && this.planModified.notify(this); });
        plannerEvents.on('fplSegmentChange').handle(data => { data.planIndex === this.planIndex && this.planModified.notify(this); });
        plannerEvents.on('fplOriginDestChanged').handle(data => { data.planIndex === this.planIndex && this.planModified.notify(this); });
        plannerEvents.on('fplActiveLegChange').handle(data => { data.planIndex === this.planIndex && data.type === ActiveLegType.Lateral && this.updateActiveLegIndex(); });
        plannerEvents.on('fplCalculated').handle(data => { data.planIndex === this.planIndex && this.planCalculated.notify(this); });
        const lnavEvents = bus.getSubscriber();
        lnavEvents.on('lnavCurrentVector').whenChanged().handle(index => {
            this.activeLNavLegVectorIndexValue = index;
            this.updateActiveLNavLegVectorIndex();
        });
        lnavEvents.on('suspChanged').whenChanged().handle(isSuspended => {
            this.isLNavSuspendedValue = isSuspended;
            this.updateIsLNavSuspended();
        });
        const vnavEvents = bus.getSubscriber();
        vnavEvents.on('vnavPathMode').whenChanged().handle(mode => {
            this.vnavPathModeValue = mode;
            this.updateVNavPathMode();
        });
        vnavEvents.on('vnavTodLegIndex').whenChanged().handle(legIndex => {
            this.vnavTodLegIndexValue = legIndex;
            this.updateVNavTodLegIndex();
        });
        vnavEvents.on('vnavTodLegDistance').withPrecision(0).handle(distance => {
            this.vnavTodLegDistanceMeters = distance;
            this.updateVNavTodLegDistance();
        });
        vnavEvents.on('vnavBodLegIndex').whenChanged().handle(legIndex => {
            this.vnavBodLegIndexValue = legIndex;
            this.updateVNavBodLegIndex();
        });
        const navEvents = this.bus.getSubscriber();
        navEvents.on('gps_obs_active').whenChanged().handle(isActive => {
            this.isObsActive = isActive;
            this.updateObsCourse();
        });
        navEvents.on('gps_obs_value').whenChanged().handle(course => {
            this.obsCourseValue = course;
            this.updateObsCourse();
        });
    }
    /**
     * Sets the index of the displayed plan.
     * @param index The index of the displayed plan.
     */
    setPlanIndex(index) {
        if (index === this.planIndex) {
            return;
        }
        this.planIndex = index;
        this.updatePlan();
        this.updateActivePlanRelatedSubs();
    }
    /**
     * Updates the displayed plan.
     */
    updatePlan() {
        if (this.planner.hasFlightPlan(this.planIndex)) {
            this.planSub.set(this.planner.getFlightPlan(this.planIndex));
        }
        else {
            this.planSub.set(null);
        }
    }
    /**
     * Updates subjects related to the active plan.
     */
    updateActivePlanRelatedSubs() {
        this.updateActiveLegIndex();
        this.updateActiveLNavLegVectorIndex();
        this.updateIsLNavSuspended();
        this.updateVNavPathMode();
        this.updateVNavTodLegIndex();
        this.updateVNavTodLegDistance();
        this.updateVNavBodLegIndex();
        this.updateObsCourse();
    }
    /**
     * Updates the active leg index.
     */
    updateActiveLegIndex() {
        const plan = this.plan.get();
        this.activeLegIndexSub.set(plan && this.planIndex === this.planner.activePlanIndex ? plan.activeLateralLeg : -1);
    }
    /**
     * Updates the active LNAV leg vector index.
     */
    updateActiveLNavLegVectorIndex() {
        this.activeLNavLegVectorIndexSub.set(this.planIndex === this.planner.activePlanIndex ? this.activeLNavLegVectorIndexValue : 0);
    }
    /**
     * Updates whether LNAV sequencing is suspended.
     */
    updateIsLNavSuspended() {
        this.isLNavSuspendedSub.set(this.planIndex === this.planner.activePlanIndex && this.isLNavSuspendedValue);
    }
    /**
     * Updates the current VNAV path mode.
     */
    updateVNavPathMode() {
        this.vnavPathModeSub.set(this.planIndex === this.planner.activePlanIndex ? this.vnavPathModeValue : VNavPathMode.None);
    }
    /**
     * Updates the index of the VNAV top-of-descent leg.
     */
    updateVNavTodLegIndex() {
        this.vnavTodLegIndexSub.set(this.planIndex === this.planner.activePlanIndex ? this.vnavTodLegIndexValue : -1);
    }
    /**
     * Updates the distance from the VNAV top-of-descent point to the end of the top-of-descent leg.
     */
    updateVNavTodLegDistance() {
        this.vnavTodLegDistanceSub.set(this.planIndex === this.planner.activePlanIndex ? this.vnavTodLegDistanceMeters : 0, UnitType.METER);
    }
    /**
     * Updates the index of the VNAV bottom-of-descent leg.
     */
    updateVNavBodLegIndex() {
        this.vnavBodLegIndexSub.set(this.planIndex === this.planner.activePlanIndex ? this.vnavBodLegIndexValue : -1);
    }
    /**
     * Updates the OBS course.
     */
    updateObsCourse() {
        this.obsCourseSub.set(this.planIndex === this.planner.activePlanIndex && this.isObsActive ? this.obsCourseValue : undefined);
    }
}
