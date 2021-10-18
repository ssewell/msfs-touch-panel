import { Subject } from 'msfssdk';
/**
 * A module for the map crosshair.
 */
export class MapCrosshairModule {
    constructor() {
        this.show = Subject.create(false);
    }
}
