import { Subject } from 'msfssdk';
/**
 * A module describing the map range ring.
 */
export class MapRangeRingModule {
    constructor() {
        /** Whether to show the range ring. */
        this.show = Subject.create(true);
    }
}
