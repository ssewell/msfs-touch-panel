import { Subject } from 'msfssdk';
import { AirportSize } from '../../Navigation/Waypoint';
/**
 * A module describing the display of waypoints.
 */
export class MapWaypointsModule {
    constructor() {
        /** Whether to show airports. */
        this.airportShow = {
            [AirportSize.Large]: Subject.create(true),
            [AirportSize.Medium]: Subject.create(true),
            [AirportSize.Small]: Subject.create(true)
        };
        /** Whether to show VORs. */
        this.vorShow = Subject.create(true);
        /** Whether to show NDBs. */
        this.ndbShow = Subject.create(true);
        /** Whether to show intersections. */
        this.intShow = Subject.create(true);
    }
}
