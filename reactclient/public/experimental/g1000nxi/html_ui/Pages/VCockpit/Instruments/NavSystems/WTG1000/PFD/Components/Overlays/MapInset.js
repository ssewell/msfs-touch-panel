import { FSComponent, DisplayComponent, NodeReference, Subject } from 'msfssdk';
import { NavMapModel } from '../../../Shared/UI/NavMap/NavMapModel';
import { PFDInsetNavMapComponent } from './PFDInsetNavMapComponent';
import { MapRangeSettings } from '../../../Shared/Map/MapRangeSettings';
import { PfdMapLayoutSettingMode, PFDUserSettings } from '../../PFDUserSettings';
import { MapUserSettings } from '../../../Shared/Map/MapUserSettings';
import './MapInset.css';
import { MapPointerController } from '../../../Shared/Map/Controllers/MapPointerController';
/**
 * The PFD map inset overlay.
 */
export class MapInset extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.el = new NodeReference();
        this.mapRef = FSComponent.createRef();
        this.mapModel = NavMapModel.createModel(this.props.tas);
        this.pointerModule = this.mapModel.getModule('pointer');
        this.mapRangeSettingManager = MapRangeSettings.getManager(this.props.bus);
        this.mapRangeSetting = this.mapRangeSettingManager.getSetting('pfdMapRangeIndex');
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        this.mapPointerController = new MapPointerController(this.mapModel, this.mapRef.instance.mapProjection);
        this.setVisible(false);
        PFDUserSettings.getManager(this.props.bus).whenSettingChanged('mapLayout').handle((mode) => {
            this.setVisible(mode === PfdMapLayoutSettingMode.Inset || mode === PfdMapLayoutSettingMode.TFC);
        });
        const hEvents = this.props.bus.getSubscriber();
        hEvents.on('hEvent').handle(this.onInteractionEvent.bind(this));
    }
    /**
     * Sets whether or not the inset map is visible.
     * @param isVisible Whether or not the map is visible.
     */
    setVisible(isVisible) {
        var _a;
        if (isVisible) {
            this.el.instance.style.display = '';
            this.mapRef.instance.wake();
        }
        else {
            this.el.instance.style.display = 'none';
            (_a = this.mapPointerController) === null || _a === void 0 ? void 0 : _a.setPointerActive(false);
            this.mapRef.instance.sleep();
        }
    }
    /**
     * A callback which is called when an interaction event occurs.
     * @param hEvent An interaction event.
     */
    onInteractionEvent(hEvent) {
        var _a;
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
            case 'AS1000_PFD_JOYSTICK_PUSH':
                (_a = this.mapPointerController) === null || _a === void 0 ? void 0 : _a.togglePointerActive();
                break;
            default:
                this.handleMapPointerMoveEvent(hEvent);
        }
    }
    /**
     * Changes the MFD map range index setting.
     * @param delta The change in index to apply.
     */
    changeMapRangeIndex(delta) {
        var _a;
        const newIndex = Utils.Clamp(this.mapRangeSetting.value + delta, 0, MapRangeSettings.DEFAULT_RANGES.length - 1);
        if (this.mapRangeSetting.value !== newIndex) {
            (_a = this.mapPointerController) === null || _a === void 0 ? void 0 : _a.targetPointer();
            this.mapRangeSetting.value = newIndex;
        }
    }
    /**
     * Handles events that move the map pointer.
     * @param hEvent An interaction event.
     */
    handleMapPointerMoveEvent(hEvent) {
        var _a, _b, _c, _d;
        if (!this.pointerModule.isActive.get()) {
            return;
        }
        switch (hEvent) {
            case 'AS1000_PFD_JOYSTICK_LEFT':
                (_a = this.mapPointerController) === null || _a === void 0 ? void 0 : _a.movePointer(-MapInset.POINTER_MOVE_INCREMENT, 0);
                break;
            case 'AS1000_PFD_JOYSTICK_UP':
                (_b = this.mapPointerController) === null || _b === void 0 ? void 0 : _b.movePointer(0, -MapInset.POINTER_MOVE_INCREMENT);
                break;
            case 'AS1000_PFD_JOYSTICK_RIGHT':
                (_c = this.mapPointerController) === null || _c === void 0 ? void 0 : _c.movePointer(MapInset.POINTER_MOVE_INCREMENT, 0);
                break;
            case 'AS1000_PFD_JOYSTICK_DOWN':
                (_d = this.mapPointerController) === null || _d === void 0 ? void 0 : _d.movePointer(0, MapInset.POINTER_MOVE_INCREMENT);
                break;
        }
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "map-inset", ref: this.el },
            FSComponent.buildComponent(PFDInsetNavMapComponent, { ref: this.mapRef, model: this.mapModel, bus: this.props.bus, updateFreq: 4, projectedWidth: 242, projectedHeight: 230, flightPlanner: this.props.flightPlanner, airspaceSearcher: this.props.airspaceSearcher, id: 'pfd_inset_map', bingId: 'pfd_map', ownAirplaneLayerProps: {
                    imageFilePath: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/own_airplane_icon.svg',
                    iconSize: 30,
                    iconAnchor: new Float64Array([0.5, 0])
                }, trafficIntruderLayerProps: {
                    fontSize: 16,
                    iconSize: 30
                }, drawEntireFlightPlan: Subject.create(false), class: 'pfd-insetmap', settingManager: MapUserSettings.getPfdManager(this.props.bus) })));
    }
}
MapInset.POINTER_MOVE_INCREMENT = 2; // pixels
