import { ComputedSubject, FSComponent } from 'msfssdk';
import { FacilityType, ICAO } from 'msfssdk/navigation';
import { UiControl } from '../UiControl';
import { WaypointIcon } from '../Waypoint/WaypointIcon';
import { WaypointRegion } from '../Waypoint/WaypointRegion';
import './WptDupListItem.css';
/**
 * An item in a list of duplicate facility waypoints. Displays the type of the waypoint, an icon, and the region in
 * which the waypoint is located.
 */
export class WptDupListItem extends UiControl {
    /** @inheritdoc */
    constructor(props) {
        super(props);
        this.iconRef = FSComponent.createRef();
        this.regionContainerRef = FSComponent.createRef();
        this.regionRef = FSComponent.createRef();
        this.waypointChangedHandler = this.onWaypointChanged.bind(this);
        this.facilityTypeSub = ComputedSubject.create(null, (waypoint) => {
            return waypoint ? WptDupListItem.FACILITY_TYPE_TEXT[ICAO.getFacilityType(waypoint.facility.icao)] : '';
        });
        this.props.waypoint.sub(this.waypointChangedHandler, true);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    getHighlightElement() {
        return this.regionContainerRef.instance;
    }
    /**
     * A callback which is called when this item's waypoint changes.
     * @param waypoint The new waypoint.
     */
    onWaypointChanged(waypoint) {
        this.facilityTypeSub.set(waypoint);
    }
    /**
     * Renders this control.
     * @returns this control's VNode.
     */
    renderControl() {
        var _a;
        return (FSComponent.buildComponent("div", { class: `wpt-dup-listitem ${(_a = this.props.class) !== null && _a !== void 0 ? _a : ''}` },
            FSComponent.buildComponent("div", { class: 'wpt-dup-listitem-type' }, this.facilityTypeSub),
            FSComponent.buildComponent(WaypointIcon, { ref: this.iconRef, waypoint: this.props.waypoint, class: 'wpt-dup-listitem-icon' }),
            FSComponent.buildComponent("div", { ref: this.regionContainerRef, class: 'wpt-dup-listitem-region-container' },
                FSComponent.buildComponent(WaypointRegion, { ref: this.regionRef, waypoint: this.props.waypoint, class: 'wpt-dup-listitem-region' }))));
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    destroy() {
        this.iconRef.instance.destroy();
        this.regionRef.instance.destroy();
        this.props.waypoint.unsub(this.waypointChangedHandler);
    }
}
WptDupListItem.FACILITY_TYPE_TEXT = {
    [FacilityType.Airport]: 'APT',
    [FacilityType.VOR]: 'VOR',
    [FacilityType.NDB]: 'NDB',
    [FacilityType.Intersection]: 'INT',
    [FacilityType.USR]: 'USR',
    [FacilityType.RWY]: 'RWY',
    [FacilityType.VIS]: 'VIS'
};
