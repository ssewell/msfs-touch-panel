import { FSComponent, GeoPoint, GeoPointSubject, NumberFormatter, Subject, UnitType } from 'msfssdk';
import { LatLonDisplay } from 'msfssdk/components/common';
import { ScrollBar } from '../../../../Shared/UI/ScrollBar';
import { WptDupDialog } from '../../../../Shared/UI/WptDup/WptDupDialog';
import { List } from '../../../../Shared/UI/List';
import { NumberUnitDisplay } from '../../../../Shared/UI/Common/NumberUnitDisplay';
import { WaypointComponent } from '../../../../Shared/UI/Waypoint/WaypointComponent';
import { WaypointInfoStore } from '../../../../Shared/UI/Waypoint/WaypointInfoStore';
import { GroupBox } from '../GroupBox';
import './MFDWptDupDialog.css';
/**
 * A dialog for selecting from a list of duplicate waypoints.
 */
export class MFDWptDupDialog extends WptDupDialog {
    constructor() {
        super(...arguments);
        this.selectedWaypointSub = Subject.create(null);
        this.planePosSub = GeoPointSubject.createFromGeoPoint(new GeoPoint(NaN, NaN));
        this.planePosConsumer = this.props.bus.getSubscriber().on('gps-position').whenChanged();
        this.planePosHandler = this.onPlanePosChanged.bind(this);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewOpened() {
        this.planePosConsumer.handle(this.planePosHandler);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewClosed() {
        this.planePosConsumer.off(this.planePosHandler);
    }
    /**
     * A callback which is called when the plane's current position changes.
     * @param pos The new position.
     */
    onPlanePosChanged(pos) {
        this.planePosSub.set(MFDWptDupDialog.tempGeoPoint.set(pos.lat, pos.long));
    }
    /**
     * A callback which is called when the selected waypoint changes.
     * @param waypoint The new selected waypoint.
     */
    onWaypointSelected(waypoint) {
        this.selectedWaypointSub.set(waypoint);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        const listContainerRef = FSComponent.createRef();
        return (FSComponent.buildComponent("div", { class: 'popout-dialog mfd-wpt-dup', ref: this.viewContainerRef },
            FSComponent.buildComponent("h1", null, this.props.title),
            FSComponent.buildComponent(GroupBox, { title: 'Waypoint' },
                FSComponent.buildComponent("div", { class: 'mfd-wpt-dup-ident' }, this.ident)),
            FSComponent.buildComponent(GroupBox, { title: 'Duplicates', class: 'mfd-wpt-dup-list-box' },
                FSComponent.buildComponent("div", { class: 'mfd-wpt-dup-list-wrapper' },
                    FSComponent.buildComponent("div", { class: 'mfd-wpt-dup-list-container', ref: listContainerRef },
                        FSComponent.buildComponent(List, { ref: this.listRef, onRegister: this.register, data: this.waypoints, renderItem: this.renderListItem.bind(this, 'mfd-wpt-dup-listitem'), onItemSelected: this.onWaypointSelected.bind(this), scrollContainer: listContainerRef, class: 'mfd-wpt-dup-list' })),
                    FSComponent.buildComponent(ScrollBar, null))),
            FSComponent.buildComponent(GroupBox, { title: 'Information', class: 'mfd-wpt-dup-info-box' },
                FSComponent.buildComponent(MFDWptDupInfo, { waypoint: this.selectedWaypointSub, planePos: this.planePosSub })),
            FSComponent.buildComponent("div", { class: 'mfd-wpt-dup-prompt' }, "Press \"ENT\" to select duplicate or \"CLR\" to cancel")));
    }
}
MFDWptDupDialog.tempGeoPoint = new GeoPoint(0, 0);
/**
 * Displays waypoint information in the MFD duplicate waypoints dialog.
 */
class MFDWptDupInfo extends WaypointComponent {
    constructor() {
        super(...arguments);
        this.store = new WaypointInfoStore(this.props.waypoint, this.props.planePos);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent("div", { class: 'mfd-wpt-dup-info' },
            FSComponent.buildComponent("div", { class: 'mfd-wpt-dup-info-city' }, this.store.city),
            FSComponent.buildComponent("div", { class: 'mfd-wpt-dup-info-name' }, this.store.name),
            FSComponent.buildComponent(LatLonDisplay, { location: this.store.location, class: 'mfd-wpt-dup-info-latlon' }),
            FSComponent.buildComponent(NumberUnitDisplay, { value: this.store.bearing, displayUnit: Subject.create(UnitType.DEGREE), formatter: NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' }), class: 'mfd-wpt-dup-info-bearing' }),
            FSComponent.buildComponent(NumberUnitDisplay, { value: this.store.distance, displayUnit: Subject.create(UnitType.NMILE), formatter: NumberFormatter.create({ precision: 0.1, maxDigits: 3, forceDecimalZeroes: false, nanString: '___' }), class: 'mfd-wpt-dup-info-distance' })));
    }
}
