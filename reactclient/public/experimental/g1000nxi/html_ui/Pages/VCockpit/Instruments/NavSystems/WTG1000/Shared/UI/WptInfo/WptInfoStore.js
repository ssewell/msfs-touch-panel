import { Subject } from 'msfssdk';
import { WaypointInfoStore } from '../Waypoint/WaypointInfoStore';
/**
 * Wpt info store
 */
export class WptInfoStore extends WaypointInfoStore {
    constructor() {
        super(...arguments);
        this.prompt = Subject.create('');
        this._matchedWaypoints = [];
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** An array of waypoints which have matched the input. */
    get matchedWaypoints() {
        return this._matchedWaypoints;
    }
    /**
     * Set the list of matched waypoints.
     * @param waypoints An array of matched waypoints.
     */
    setMatchedWaypoints(waypoints) {
        this._matchedWaypoints = [...waypoints];
    }
}
