import { FSComponent, GeoPoint, GeoPointSubject, NumberFormatter, Subject, UnitType } from 'msfssdk';
import { FacilitySearchType } from 'msfssdk/navigation';
import { UiView } from '../UiView';
import { WptInfoStore } from './WptInfoStore';
import { WptInfoController } from './WptInfoController';
import { FmsHEvent } from '../FmsHEvent';
import { Fms } from '../../FlightPlan/Fms';
import { WaypointInput } from '../UIControls/WaypointInput';
import { NumberUnitDisplay } from '../Common/NumberUnitDisplay';
/**
 * The PFD waypoint info popout.
 */
export class WptInfo extends UiView {
    constructor() {
        super(...arguments);
        this.inputSelectedIcao = Subject.create('');
        this.selectedWaypointSub = Subject.create(null);
        this.planePosSub = GeoPointSubject.createFromGeoPoint(new GeoPoint(NaN, NaN));
        this.planeHeadingSub = Subject.create(NaN);
        this.planePosConsumer = this.props.bus.getSubscriber().on('gps-position').whenChanged();
        this.planeHeadingConsumer = this.props.bus.getSubscriber().on('hdg_deg_true').withPrecision(1);
        this.planePosHandler = this.onPlanePosChanged.bind(this);
        this.planeHeadingHandler = this.onPlaneHeadingChanged.bind(this);
        this.store = new WptInfoStore(this.selectedWaypointSub, this.planePosSub);
        this.controller = new WptInfoController(this.store, this.selectedWaypointSub);
    }
    /** @inheritdoc */
    onInteractionEvent(evt) {
        switch (evt) {
            case FmsHEvent.CLR:
                this.close();
                return true;
            case FmsHEvent.ENT:
                this.onEnterPressed();
                return true;
        }
        return false;
    }
    /**
     * Executes actions when Enter is pressed.
     */
    onEnterPressed() {
        const matchedWaypoints = this.store.matchedWaypoints;
        const selectedWaypoint = this.store.waypoint.get();
        if (matchedWaypoints.length > 1) {
            const dialog = Fms.viewService.open(this.getWptDupDialogName(), true).setInput(matchedWaypoints);
            dialog.onAccept.on((sender, facility) => {
                this.onWptDupDialogAccept(facility);
            });
            dialog.onClose.on(() => { this.onWptDupDialogClose(); });
        }
        else if (selectedWaypoint) {
            this.accept(selectedWaypoint.facility);
        }
    }
    /**
     * A callback which is called when a waypoint duplicate dialog invoked by this view accepts.
     * @param facility The facility returned by the waypoint duplicate dialog.
     */
    onWptDupDialogAccept(facility) {
        facility && this.accept(facility);
    }
    /**
     * A callback which is called when a waypoint duplicate dialog invoked by this view closes.
     */
    onWptDupDialogClose() {
        // noop
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewOpened() {
        this.inputSelectedIcao.set('');
        this.planePosConsumer.handle(this.planePosHandler);
        this.planeHeadingConsumer.handle(this.planeHeadingHandler);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewClosed() {
        this.planePosConsumer.off(this.planePosHandler);
        this.planeHeadingConsumer.off(this.planeHeadingHandler);
    }
    /**
     * A callback which is called when the plane's current position changes.
     * @param pos The new position.
     */
    onPlanePosChanged(pos) {
        this.planePosSub.set(pos.lat, pos.long);
    }
    /**
     * A callback which is called when the plane's current true heading changes.
     * @param heading The new heading, in degrees.
     */
    onPlaneHeadingChanged(heading) {
        this.planeHeadingSub.set(heading);
    }
    /**
     * Renders a waypoint input component.
     * @returns a waypoint input component, as a VNode.
     */
    renderWaypointInput() {
        return (FSComponent.buildComponent(WaypointInput, { bus: this.props.bus, onRegister: this.register, selectedIcao: this.inputSelectedIcao, onMatchedWaypointsChanged: this.controller.matchedWaypointsChangedHandler, onWaypointChanged: this.controller.selectedWaypointChangedHandler, onInputEnterPressed: this.onEnterPressed.bind(this), planeHeading: this.planeHeadingSub, filter: FacilitySearchType.None }));
    }
    /**
     * Renders a component which displays the bearing to the store's selected waypoint.
     * @param cssClass CSS class(es) to apply to the root of the component.
     * @returns a component which displays the bearing to the store's selected waypoint, as a VNode.
     */
    renderBearing(cssClass) {
        return (FSComponent.buildComponent(NumberUnitDisplay, { value: this.store.bearing, displayUnit: Subject.create(UnitType.DEGREE), formatter: NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' }), class: cssClass }));
    }
    /**
     * Renders a component which displays the distance to the store's selected waypoint.
     * @param cssClass CSS class(es) to apply to the root of the component.
     * @returns a component which displays the distance to the store's selected waypoint, as a VNode.
     */
    renderDistance(cssClass) {
        return (FSComponent.buildComponent(NumberUnitDisplay, { value: this.store.distance, displayUnit: Subject.create(UnitType.NMILE), formatter: NumberFormatter.create({ precision: 0.1, maxDigits: 3, forceDecimalZeroes: false, nanString: '__._' }), class: cssClass }));
    }
}
