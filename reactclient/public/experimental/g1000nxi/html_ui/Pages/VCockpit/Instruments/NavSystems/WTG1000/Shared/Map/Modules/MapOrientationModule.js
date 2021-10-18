import { Subject } from 'msfssdk';
/**
 * Orientation types for a map.
 */
export var MapOrientation;
(function (MapOrientation) {
    MapOrientation[MapOrientation["NorthUp"] = 0] = "NorthUp";
    MapOrientation[MapOrientation["TrackUp"] = 1] = "TrackUp";
    MapOrientation[MapOrientation["HeadingUp"] = 2] = "HeadingUp";
})(MapOrientation || (MapOrientation = {}));
/**
 * A module describing the map orientation.
 */
export class MapOrientationModule {
    constructor() {
        /** The orientation of the map. */
        this.orientation = Subject.create(MapOrientation.HeadingUp);
        /** Whether auto-north-up is active. */
        this.autoNorthUpActive = Subject.create(true);
    }
}
