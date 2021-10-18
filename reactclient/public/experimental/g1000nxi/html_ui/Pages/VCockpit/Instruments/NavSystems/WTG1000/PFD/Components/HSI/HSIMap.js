import { DisplayComponent, FSComponent, NodeReference, Subject } from 'msfssdk';
import { NavMapModel } from '../../../Shared/UI/NavMap/NavMapModel';
import { CompassRose } from './CompassRose';
import { CourseNeedles } from './CourseNeedles';
import { HSIMapCourseDeviation } from './HSIMapCourseDeviation';
import { TurnRateIndicator } from './TurnRateIndicator';
import { HSINavMapComponent } from './HSINavMapComponent';
import { MapOrientation } from '../../../Shared/Map/Modules/MapOrientationModule';
import { MapRangeSettings } from '../../../Shared/Map/MapRangeSettings';
import { MapUserSettings } from '../../../Shared/Map/MapUserSettings';
import './HSIMap.css';
import './HSIShared.css';
/**
 * An HSI component with a moving map.
 */
export class HSIMap extends DisplayComponent {
    /** @inheritdoc */
    constructor(props) {
        super(props);
        this.el = new NodeReference();
        this.rotatingEl = new NodeReference();
        this.compassRoseComponent = FSComponent.createRef();
        this.headingElement = FSComponent.createRef();
        this.turnRateIndicator = FSComponent.createRef();
        this.headingBugElement = FSComponent.createRef();
        this.courseNeedlesElement = FSComponent.createRef();
        this.bearingPointer1Element = FSComponent.createRef();
        this.bearingPointer2Element = FSComponent.createRef();
        this.deviationElement = FSComponent.createRef();
        this.mapRef = FSComponent.createRef();
        this.mapModel = NavMapModel.createModel(this.props.tas);
        this.mapRangeSettingManager = MapRangeSettings.getManager(this.props.bus);
        this.mapRangeSetting = this.mapRangeSettingManager.getSetting('pfdMapRangeIndex');
        /**
         * Updates the rotating elements container.
         * @param heading The heading to rotate to.
         */
        this.updateRotatingElements = (heading) => {
            this.rotatingEl.instance.style.transform = `rotate3d(0, 0, 1, ${-heading}deg)`;
            if (this.headingElement.instance !== null) {
                const hdg = Math.round(heading) == 0 ? 360 : Math.round(heading);
                this.headingElement.instance.textContent = `${hdg}°`.padStart(4, '0');
            }
        };
        this.mapModel.getModule('orientation').orientation.set(MapOrientation.HeadingUp);
    }
    /**
     * A callback called when the component finishes rendering.
     */
    onAfterRender() {
        this.setVisible(false);
        this.registerWithController();
        const adc = this.props.bus.getSubscriber();
        const ap = this.props.bus.getSubscriber();
        const hEvents = this.props.bus.getSubscriber();
        adc.on('hdg_deg')
            .withPrecision(1)
            .handle(this.updateRotatingElements);
        ap.on('heading_select')
            .withPrecision(0)
            .handle(this.updateSelectedHeadingDisplay.bind(this));
        adc.on('delta_heading_rate')
            .withPrecision(1)
            .handle(rate => this.turnRateIndicator.instance.setTurnRate(rate));
        hEvents.on('hEvent').handle(this.onInteractionEvent.bind(this));
        if (this.bearingPointer1Element.instance !== null) {
            this.bearingPointer1Element.instance.style.display = 'none';
        }
        if (this.bearingPointer2Element.instance !== null) {
            this.bearingPointer2Element.instance.style.display = 'none';
        }
        if (this.compassRoseComponent.getOrDefault() !== null) {
            this.compassRoseComponent.instance.setCircleVisible(false);
        }
    }
    /**
     * A callback which is called when an interaction event occurs.
     * @param hEvent An interaction event.
     */
    onInteractionEvent(hEvent) {
        if (!this.mapRef.instance.isAwake) {
            return;
        }
        switch (hEvent) {
            case 'AS1000_PFD_RANGE_INC':
                this.changeMapRangeIndex(1);
                break;
            case 'AS1000_PFD_RANGE_DEC':
                this.changeMapRangeIndex(-1);
                break;
        }
    }
    /**
     * Changes the MFD map range index setting.
     * @param delta The change in index to apply.
     */
    changeMapRangeIndex(delta) {
        const newIndex = Utils.Clamp(this.mapRangeSetting.value + delta, 0, MapRangeSettings.DEFAULT_RANGES.length - 1);
        this.mapRangeSetting.value = newIndex;
    }
    /**
     * Updates the heading indicator when the heading changes.
     * @param selHdg deg The new heading value.
     */
    updateSelectedHeadingDisplay(selHdg) {
        if (this.headingBugElement.instance !== null) {
            this.headingBugElement.instance.style.transform = `rotate3d(0, 0, 1, ${selHdg}deg)`;
        }
    }
    /**
     * Sets whether or not the HSI with map is visible.
     * @param isVisible Whether or not the component is visible.
     */
    setVisible(isVisible) {
        this.el.instance.style.display = isVisible ? '' : 'none';
        isVisible ? this.mapRef.instance.wake() : this.mapRef.instance.sleep();
    }
    /**
     * Registers the course needles instance with the HSI Controller.
     */
    registerWithController() {
        this.props.controller.courseNeedleRefs.hsiMap = this.courseNeedlesElement;
        this.props.controller.hsiMapDeviationRef = this.deviationElement;
    }
    /**
     * Renders the HSIMap component.
     * @returns The rendered component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "hsi-map-container", ref: this.el },
            FSComponent.buildComponent(HSINavMapComponent, { ref: this.mapRef, model: this.mapModel, bus: this.props.bus, updateFreq: 5, projectedWidth: 350, projectedHeight: 350, flightPlanner: this.props.flightPlanner, airspaceSearcher: this.props.airspaceSearcher, id: 'pfd_hsi_map', bingId: 'pfd_map', ownAirplaneLayerProps: {
                    imageFilePath: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/own_airplane_icon.svg',
                    iconSize: 30,
                    iconAnchor: new Float64Array([0.5, 0])
                }, trafficIntruderLayerProps: {
                    fontSize: 16,
                    iconSize: 30
                }, drawEntireFlightPlan: Subject.create(false), class: 'pfd-hsimap', settingManager: MapUserSettings.getPfdManager(this.props.bus) }),
            FSComponent.buildComponent(HSIMapCourseDeviation, { ref: this.deviationElement, controller: this.props.controller }),
            FSComponent.buildComponent("div", { class: "hsi-map-hdg-box" },
                FSComponent.buildComponent("span", { ref: this.headingElement }, "360")),
            FSComponent.buildComponent("div", { class: 'hsi-map-rotating-elements', ref: this.rotatingEl },
                FSComponent.buildComponent(CompassRose, { ref: this.compassRoseComponent, size: 350, margin: 0, gradient: true }),
                FSComponent.buildComponent("div", { class: 'hsi-map-bearing-pointer', ref: this.bearingPointer1Element },
                    FSComponent.buildComponent("svg", { viewBox: "0 0 386 340" },
                        FSComponent.buildComponent("path", { d: "M 175 20 l 0 7 l -16 16 M 175 27 l 16 16 M 175 27 l 0 25 z M 175 290 l 0 40", fill: "none", stroke: "cyan", "stroke-width": "2px" }))),
                FSComponent.buildComponent("div", { class: 'hsi-map-bearing-pointer', ref: this.bearingPointer2Element },
                    FSComponent.buildComponent("svg", { viewBox: "0 0 386 340" },
                        FSComponent.buildComponent("path", { d: "M 175 20 l 0 7 l -16 16 M 175 27 l 16 16 M 170 32 l 0 20 M 180 32 l 0 20 M 170 290 l 0 32 l 10 0 l 0 -32 M 175 322 l 0 8", fill: "none", stroke: "cyan", "stroke-width": "2px" }))),
                FSComponent.buildComponent("div", { class: "hsi-map-hdg-bug", ref: this.headingBugElement },
                    FSComponent.buildComponent("svg", null,
                        FSComponent.buildComponent("path", { d: "M 175 175 m 0 -160 l 4 -9 l 8 0 l 0 12 l -24 0 l 0 -12 l 8 0 l 4 9 z", fill: "cyan", stroke: "black", "stroke-width": "1px" }))),
                FSComponent.buildComponent(CourseNeedles, { hsiMap: true, ref: this.courseNeedlesElement, controller: this.props.controller })),
            FSComponent.buildComponent(TurnRateIndicator, { hsiMap: true, ref: this.turnRateIndicator })));
    }
}
