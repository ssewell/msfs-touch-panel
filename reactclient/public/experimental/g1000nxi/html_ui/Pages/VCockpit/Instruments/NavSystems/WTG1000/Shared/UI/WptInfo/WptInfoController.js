/**
 * Wpt info controller
 */
export class WptInfoController {
    /**
     * Creates an instance of wpt info controller.
     * @param store The store.
     * @param selectedWaypoint The subject which provides the waypoint info component's selected waypoint.
     */
    constructor(store, selectedWaypoint) {
        this.store = store;
        this.selectedWaypoint = selectedWaypoint;
        /**
         * A function which handles changes in waypoint input's matched waypoints.
         * @param waypoints The matched waypoints.
         */
        this.matchedWaypointsChangedHandler = this.onMatchedWaypointsChanged.bind(this);
        /**
         * A function which handles changes in waypoint input's selected waypoint.
         * @param waypoint The selected waypoint.
         */
        this.selectedWaypointChangedHandler = this.onSelectedWaypointChanged.bind(this);
        this.onMatchedWaypointsChanged([]);
    }
    /**
     * A callback which is called when the waypoint input's matched waypoints change.
     * @param waypoints The matched waypoints.
     */
    onMatchedWaypointsChanged(waypoints) {
        this.store.setMatchedWaypoints(waypoints);
        if (waypoints.length > 1) {
            this.store.prompt.set('Press "ENT" for dups');
        }
        else {
            this.store.prompt.set('Press "ENT" to accept');
        }
    }
    /**
     * A callback which is called when the waypoint input's selected waypoint changes.
     * @param waypoint The selected waypoint.
     */
    onSelectedWaypointChanged(waypoint) {
        this.selectedWaypoint.set(waypoint);
    }
}
