import { FSComponent, Subject } from 'msfssdk';
import { MapRangeSettings } from '../../../../Shared/Map/MapRangeSettings';
import { MapDeclutterSettingMode, MapUserSettings } from '../../../../Shared/Map/MapUserSettings';
import { NavMapModel } from '../../../../Shared/UI/NavMap/NavMapModel';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { MFDUiPage } from '../MFDUiPage';
import { MFDNavMapComponent } from './MFDNavMapComponent';
import './MFDNavMapPage.css';
import { MapPointerController } from '../../../../Shared/Map/Controllers/MapPointerController';
/**
 * A page which displays the navigation map.
 */
export class MFDNavMapPage extends MFDUiPage {
    /** @inheritdoc */
    constructor(props) {
        super(props);
        this.mapRef = FSComponent.createRef();
        this.mapModel = NavMapModel.createModel(this.props.tas);
        this.pointerModule = this.mapModel.getModule('pointer');
        this.mapSettingManager = MapUserSettings.getMfdManager(this.props.bus);
        this.mapRangeSettingManager = MapRangeSettings.getManager(this.props.bus);
        this.mapRangeSetting = this.mapRangeSettingManager.getSetting('mfdMapRangeIndex');
        this.pageMenuItems = [
            {
                id: 'map-settings',
                renderContent: () => FSComponent.buildComponent("span", null, "Map Settings"),
                action: () => {
                    this.props.viewService.open('MapSettings', false);
                }
            },
            {
                id: 'declutter',
                renderContent: () => FSComponent.buildComponent("span", null,
                    "Declutter (Current Detail ",
                    MFDNavMapPage.DECLUTTER_TEXT[this.mapSettingManager.getSetting('mapDeclutter').value],
                    ")"),
                action: () => {
                    const setting = this.mapSettingManager.getSetting('mapDeclutter');
                    switch (setting.value) {
                        case MapDeclutterSettingMode.All:
                            setting.value = MapDeclutterSettingMode.Level3;
                            break;
                        case MapDeclutterSettingMode.Level3:
                            setting.value = MapDeclutterSettingMode.Level2;
                            break;
                        case MapDeclutterSettingMode.Level2:
                            setting.value = MapDeclutterSettingMode.Level1;
                            break;
                        case MapDeclutterSettingMode.Level1:
                            setting.value = MapDeclutterSettingMode.All;
                            break;
                    }
                }
            },
            {
                id: 'measure-brg-dist',
                renderContent: () => FSComponent.buildComponent("span", null, "Measure Bearing/Distance"),
                isEnabled: false
            },
            {
                id: 'charts',
                renderContent: () => FSComponent.buildComponent("span", null, "Charts"),
                isEnabled: false
            },
            {
                id: 'hide-vsd',
                renderContent: () => FSComponent.buildComponent("span", null, "Hide VSD"),
                isEnabled: false
            },
        ];
        this._title.set('Map – Navigation Map');
    }
    /** @inheritdoc */
    onAfterRender() {
        super.onAfterRender();
        this.mapPointerController = new MapPointerController(this.mapModel, this.mapRef.instance.mapProjection);
        this.mapRef.instance.sleep();
    }
    /** @inheritdoc */
    onInteractionEvent(evt) {
        var _a;
        switch (evt) {
            case FmsHEvent.RANGE_DEC:
                this.changeMapRangeIndex(-1);
                return true;
            case FmsHEvent.RANGE_INC:
                this.changeMapRangeIndex(1);
                return true;
            case FmsHEvent.JOYSTICK_PUSH:
                (_a = this.mapPointerController) === null || _a === void 0 ? void 0 : _a.togglePointerActive();
                return true;
        }
        return this.handleMapPointerMoveEvent(evt) || super.onInteractionEvent(evt);
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
     * @param evt The event.
     * @returns Whether the event was handled.
     */
    handleMapPointerMoveEvent(evt) {
        var _a, _b, _c, _d;
        if (!this.pointerModule.isActive.get()) {
            return false;
        }
        switch (evt) {
            case FmsHEvent.JOYSTICK_LEFT:
                (_a = this.mapPointerController) === null || _a === void 0 ? void 0 : _a.movePointer(-MFDNavMapPage.POINTER_MOVE_INCREMENT, 0);
                return true;
            case FmsHEvent.JOYSTICK_UP:
                (_b = this.mapPointerController) === null || _b === void 0 ? void 0 : _b.movePointer(0, -MFDNavMapPage.POINTER_MOVE_INCREMENT);
                return true;
            case FmsHEvent.JOYSTICK_RIGHT:
                (_c = this.mapPointerController) === null || _c === void 0 ? void 0 : _c.movePointer(MFDNavMapPage.POINTER_MOVE_INCREMENT, 0);
                return true;
            case FmsHEvent.JOYSTICK_DOWN:
                (_d = this.mapPointerController) === null || _d === void 0 ? void 0 : _d.movePointer(0, MFDNavMapPage.POINTER_MOVE_INCREMENT);
                return true;
        }
        return false;
    }
    /** @inheritdoc */
    onViewOpened() {
        this.props.menuSystem.clear();
        this.props.menuSystem.pushMenu('navmap-root');
        this.mapRef.instance.wake();
    }
    /** @inheritdoc */
    onViewClosed() {
        var _a;
        super.onViewClosed();
        (_a = this.mapPointerController) === null || _a === void 0 ? void 0 : _a.setPointerActive(false);
        this.mapRef.instance.sleep();
    }
    /** @inheritdoc */
    onMenuPressed() {
        this.props.menuSystem.pushMenu('empty');
        const pageMenu = this.props.viewService.open('PageMenuDialog');
        pageMenu.setMenuItems(this.pageMenuItems);
        pageMenu.onClose.on(() => { this.props.menuSystem.back(); });
        return true;
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("div", { ref: this.viewContainerRef, class: 'mfd-page' },
            FSComponent.buildComponent(MFDNavMapComponent, { ref: this.mapRef, model: this.mapModel, bus: this.props.bus, updateFreq: MFDNavMapPage.UPDATE_FREQ, projectedWidth: 876, projectedHeight: 734, deadZone: new Float64Array([0, 56, 0, 0]), flightPlanner: this.props.flightPlanner, airspaceSearcher: this.props.airspaceSearcher, id: 'mfd_navmap', bingId: 'mfd_page_map', settingManager: MapUserSettings.getMfdManager(this.props.bus), ownAirplaneLayerProps: {
                    imageFilePath: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/own_airplane_icon.svg',
                    iconSize: 40,
                    iconAnchor: new Float64Array([0.5, 0])
                }, trafficIntruderLayerProps: {
                    fontSize: 16,
                    iconSize: 30
                }, drawEntireFlightPlan: Subject.create(false), class: 'mfd-navmap' })));
    }
}
MFDNavMapPage.DECLUTTER_TEXT = {
    [MapDeclutterSettingMode.All]: 'All',
    [MapDeclutterSettingMode.Level3]: '3',
    [MapDeclutterSettingMode.Level2]: '2',
    [MapDeclutterSettingMode.Level1]: '1',
};
MFDNavMapPage.UPDATE_FREQ = 30; // Hz
MFDNavMapPage.POINTER_MOVE_INCREMENT = 5; // pixels
