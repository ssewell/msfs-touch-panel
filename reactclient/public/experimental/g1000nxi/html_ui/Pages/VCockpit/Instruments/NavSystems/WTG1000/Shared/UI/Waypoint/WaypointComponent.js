import { DisplayComponent } from 'msfssdk';
/**
 * An abstract component which is bound to a waypoint.
 */
export class WaypointComponent extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.waypointChangedHandler = this.onWaypointChanged.bind(this);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAfterRender() {
        this.props.waypoint.sub(this.waypointChangedHandler, true);
    }
    /**
     * A callback which is called when this component's waypoint changes.
     * @param waypoint The new waypoint.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onWaypointChanged(waypoint) {
        // noop
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    destroy() {
        this.props.waypoint.unsub(this.waypointChangedHandler);
    }
}
