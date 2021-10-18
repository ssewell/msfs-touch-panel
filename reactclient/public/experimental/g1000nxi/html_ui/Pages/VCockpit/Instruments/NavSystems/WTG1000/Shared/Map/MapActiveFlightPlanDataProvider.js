import { MapFlightPlannerPlanDataProvider } from './MapFlightPlannerPlanDataProvider';
/**
 * A map flight plan layer data provider which provides the active flight plan to be displayed.
 */
export class MapActiveFlightPlanDataProvider {
    /**
     * Constructor.
     * @param bus The event bus.
     * @param planner The flight planner.
     */
    constructor(bus, planner) {
        this.bus = bus;
        this.planner = planner;
        this.provider = new MapFlightPlannerPlanDataProvider(this.bus, this.planner);
        this.plan = this.provider.plan;
        this.planModified = this.provider.planModified;
        this.planCalculated = this.provider.planCalculated;
        this.activeLateralLegIndex = this.provider.activeLateralLegIndex;
        this.activeLNavLegVectorIndex = this.provider.activeLNavLegVectorIndex;
        this.isLNavSuspended = this.provider.isLNavSuspended;
        this.vnavPathMode = this.provider.vnavPathMode;
        this.vnavTodLegIndex = this.provider.vnavTodLegIndex;
        this.vnavTodLegDistance = this.provider.vnavTodLegDistance;
        this.vnavBodLegIndex = this.provider.vnavBodLegIndex;
        this.obsCourse = this.provider.obsCourse;
        const plannerEvents = bus.getSubscriber();
        plannerEvents.on('fplIndexChanged').handle(data => { this.provider.setPlanIndex(data.planIndex); });
        this.provider.setPlanIndex(planner.activePlanIndex);
    }
}
