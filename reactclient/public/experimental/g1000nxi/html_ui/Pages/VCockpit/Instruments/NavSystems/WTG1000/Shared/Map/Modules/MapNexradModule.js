import { Subject } from 'msfssdk';
/**
 * A module for map weather radar mode data.
 */
export class MapNexradModule {
    constructor() {
        this.showNexrad = Subject.create(false);
    }
}
