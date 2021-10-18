import { FSComponent } from 'msfssdk';
import { UiView } from '../../../Shared/UI/UiView';
import { NearestStore } from '../../../Shared/UI/Controllers/NearestStore';
import { NearestController } from '../../../Shared/UI/Controllers/NearestController';
import { ScrollBar } from '../../../Shared/UI/ScrollBar';
import { List } from '../../../Shared/UI/List';
import { FmsHEvent } from '../../../Shared/UI/FmsHEvent';
import { NearestAirportItem } from './NearestAirportItem';
import './Nearest.css';
/**
 * The PFD nearest airports popout.
 */
export class Nearest extends UiView {
    /**
     * Creates an instance of a nearest airport box.
     * @param props The props.
     */
    constructor(props) {
        super(props);
        this.nearestListContainerRef = FSComponent.createRef();
        this.noneMsgRef = FSComponent.createRef();
        this.planePosHandler = this.onGps.bind(this);
        this.planeHeadingHandler = this.onPlaneHeadingChanged.bind(this);
        this.buildNearestItem = (data, registerFn) => {
            return (FSComponent.buildComponent(NearestAirportItem, { onRegister: registerFn, data: data, planeHeading: this.store.planeHeading, directToHandler: this.controller.onDirectIdentHandler, frequencyHandler: this.controller.onEnterFreqHandler }));
        };
        this.store = new NearestStore(this.props.loader);
        this.publisher = this.props.publisher;
        this.controller = new NearestController(this.store, this.publisher);
        this.planePosConsumer = this.props.bus.getSubscriber().on('gps-position').atFrequency(1);
        this.planeHeadingConsumer = this.props.bus.getSubscriber().on('hdg_deg_true').atFrequency(1);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAfterRender() {
        this.store.airportCount.sub(this.onAirportCountChanged.bind(this), true);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onInteractionEvent(evt) {
        switch (evt) {
            case FmsHEvent.UPPER_PUSH:
                this.toggleScroll();
                return true;
            case FmsHEvent.CLR:
                this.close();
                return true;
        }
        return false;
    }
    /**
     * Set up the strobed update when the nearest popup is open.
     */
    onViewOpened() {
        this.setScrollEnabled(true);
        this.scrollController.gotoFirst();
        this.planePosConsumer.handle(this.planePosHandler);
        this.planeHeadingConsumer.handle(this.planeHeadingHandler);
    }
    /**
     * When the popup is closed, kill the update to save cycles.
     */
    onViewClosed() {
        this.planePosConsumer.off(this.planePosHandler);
        this.planeHeadingConsumer.off(this.planeHeadingHandler);
    }
    /**
     * Handle a GPS update.
     * @param pos The current LatLongAlt
     */
    onGps(pos) {
        this.store.planePos.set(pos.lat, pos.long);
    }
    /**
     * A callback which is called when the airplane's true heading changes.
     * @param heading The airplane's current true heading.
     */
    onPlaneHeadingChanged(heading) {
        this.store.planeHeading.set(heading);
    }
    /**
     * A callback which is called when the number of airports in the nearest list changes.
     * @param count The number of airports in the nearest list.
     */
    onAirportCountChanged(count) {
        if (count === 0) {
            this.noneMsgRef.instance.style.display = '';
        }
        else {
            this.noneMsgRef.instance.style.display = 'none';
        }
    }
    /**
     * Render the component.
     * @returns a VNode
     */
    render() {
        return (FSComponent.buildComponent("div", { class: 'popout-dialog pfd-nearest-airport', ref: this.viewContainerRef },
            FSComponent.buildComponent("h1", null, this.props.title),
            FSComponent.buildComponent("div", { class: 'nearest-airport-popout-container', ref: this.nearestListContainerRef },
                FSComponent.buildComponent(List, { onRegister: this.register, data: this.store.nearestSubjectList, renderItem: this.buildNearestItem, scrollContainer: this.nearestListContainerRef }),
                FSComponent.buildComponent("div", { ref: this.noneMsgRef, class: 'nearest-airport-none' },
                    "None within 200",
                    FSComponent.buildComponent("span", { class: 'nearest-airport-none-unit' }, "NM"))),
            FSComponent.buildComponent(ScrollBar, null)));
    }
}
