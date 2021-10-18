import { Subject } from 'msfssdk';
/**
 * A module describing the map range compass.
 */
export class MapRangeCompassModule {
    constructor() {
        /** Whether to show the range compass. */
        this.show = Subject.create(true);
    }
}
