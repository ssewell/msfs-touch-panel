import { Subject } from 'msfssdk';
/**
 * A module which defines a highlighted waypoint.
 */
export class MapWaypointHighlightModule {
    constructor() {
        /** The highlighted waypoint. */
        this.waypoint = Subject.create(null);
    }
}
