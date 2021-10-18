import { Subject } from 'msfssdk';
/**
 *
 */
export class MapFlightPlanFocusModule {
    constructor() {
        /**
         * Whether focus is active.
         */
        this.isActive = Subject.create(false);
        /**
         * Whether the flight plan has focus.
         */
        this.isFocused = Subject.create(false);
        /**
         * The flight plan focus.
         */
        this.focus = Subject.create(null);
    }
}
