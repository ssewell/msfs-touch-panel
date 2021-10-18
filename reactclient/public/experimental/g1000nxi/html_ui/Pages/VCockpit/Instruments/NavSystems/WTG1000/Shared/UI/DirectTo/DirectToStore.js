import { WaypointInfoStore } from '../Waypoint/WaypointInfoStore';
/** The store for the DTO view */
export class DirectToStore {
    /**
     * Constructor.
     * @param planePos A subscribable which provides the current airplane position for this store.
     */
    constructor(planePos) {
        this.planePos = planePos;
        this.waypointInfoStore = new WaypointInfoStore(undefined, planePos);
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** A subject which provides this store's selected waypoint. */
    get waypoint() {
        return this.waypointInfoStore.waypoint;
    }
}
