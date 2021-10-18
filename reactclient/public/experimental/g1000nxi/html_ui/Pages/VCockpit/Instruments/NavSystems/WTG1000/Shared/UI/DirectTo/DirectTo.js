import { FSComponent, GeoPoint, GeoPointSubject, NumberFormatter, Subject, UnitType } from 'msfssdk';
import { FacilitySearchType } from 'msfssdk/navigation';
import { NumberUnitDisplay } from '../Common/NumberUnitDisplay';
import { FmsHEvent } from '../FmsHEvent';
import { WaypointInput } from '../UIControls/WaypointInput';
import { UiView } from '../UiView';
import { DirectToController } from './DirectToController';
import { DirectToStore } from './DirectToStore';
/**
 * A view which provides control of the Direct-To function.
 */
export class DirectTo extends UiView {
    constructor() {
        super(...arguments);
        this.planePosSub = GeoPointSubject.createFromGeoPoint(new GeoPoint(NaN, NaN));
        this.planeHeadingSub = Subject.create(NaN);
        this.planePosConsumer = this.props.bus.getSubscriber().on('gps-position').whenChanged();
        this.planeHeadingConsumer = this.props.bus.getSubscriber().on('hdg_deg_true').withPrecision(1);
        this.planePosHandler = this.onPlanePosChanged.bind(this);
        this.planeHeadingHandler = this.onPlaneHeadingChanged.bind(this);
        this.store = new DirectToStore(this.planePosSub);
        this.controller = new DirectToController(this.store, this.props.fms);
        this.isOpen = false;
        /** @inheritdoc */
        this.gotoActivateButton = () => {
            this.scrollController.gotoNext();
        };
        /**
         * Callback for when the Hold button is pressed.
         */
        this.onHoldButtonPressed = () => {
            //Do stuff
        };
        /**
         * A callback which is called when the Load action is executed.
         */
        this.onLoadExecuted = () => {
            this.controller.onActivateSelected();
            this.close();
        };
    }
    /** @inheritdoc */
    onInputDataSet(directToInputData) {
        if (this.isOpen) {
            this.controller.initializeTarget(directToInputData);
        }
    }
    /** @inheritdoc */
    onInteractionEvent(evt) {
        switch (evt) {
            case FmsHEvent.DIRECTTO:
            case FmsHEvent.CLR:
                this.close();
                return true;
        }
        return false;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewOpened() {
        this.isOpen = true;
        this.planePosConsumer.handle(this.planePosHandler);
        this.planeHeadingConsumer.handle(this.planeHeadingHandler);
        this.controller.initializeTarget(this.inputData.get());
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewClosed() {
        this.isOpen = false;
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
        return (FSComponent.buildComponent(WaypointInput, { bus: this.props.bus, onRegister: this.register, onInputEnterPressed: this.gotoActivateButton, onWaypointChanged: this.controller.waypointChangedHandler, selectedIcao: this.controller.inputIcao, filter: FacilitySearchType.None }));
    }
    /**
     * Renders a component which displays the bearing to the store's selected waypoint.
     * @param cssClass CSS class(es) to apply to the root of the component.
     * @returns a component which displays the bearing to the store's selected waypoint, as a VNode.
     */
    renderBearing(cssClass) {
        return (FSComponent.buildComponent(NumberUnitDisplay, { value: this.store.waypointInfoStore.bearing, displayUnit: Subject.create(UnitType.DEGREE), formatter: NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' }), class: cssClass }));
    }
    /**
     * Renders a component which displays the distance to the store's selected waypoint.
     * @param cssClass CSS class(es) to apply to the root of the component.
     * @returns a component which displays the distance to the store's selected waypoint, as a VNode.
     */
    renderDistance(cssClass) {
        return (FSComponent.buildComponent(NumberUnitDisplay, { value: this.store.waypointInfoStore.distance, displayUnit: Subject.create(UnitType.NMILE), formatter: NumberFormatter.create({ precision: 0.1, maxDigits: 3, forceDecimalZeroes: false, nanString: '__._' }), class: cssClass }));
    }
}
