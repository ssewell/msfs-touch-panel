import { FSComponent } from 'msfssdk';
import { MapUserSettings } from '../../../../Shared/Map/MapUserSettings';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { MapPointerController } from '../../../../Shared/Map/Controllers/MapPointerController';
import { MFDUiPage } from '../MFDUiPage';
import { MFDFPL } from './MFDFPL';
import { MFDFPLMapComponent } from './MFDFPLMapComponent';
import { MFDFPLMapModel } from './MFDFPLMapModel';
import './MFDFPLPage.css';
/**
 * A page which displays the flight plan map and active flight plan information.
 */
export class MFDFPLPage extends MFDUiPage {
    /** @inheritdoc */
    constructor(props) {
        super(props);
        this.mapRef = FSComponent.createRef();
        this.fplRef = FSComponent.createRef();
        this.mapModel = MFDFPLMapModel.createModel(this.props.tas);
        this.pointerModule = this.mapModel.getModule('pointer');
        this.focusModule = this.mapModel.getModule('focus');
        this._title.set('FPL – Active Flight Plan');
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAfterRender() {
        super.onAfterRender();
        this.mapPointerController = new MapPointerController(this.mapModel, this.mapRef.instance.mapProjection);
        this.mapRef.instance.sleep();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onInteractionEvent(evt) {
        var _a;
        // TODO: Move the close operations out of here into their respective views.
        switch (evt) {
            case FmsHEvent.UPPER_PUSH:
                this.toggleScroll();
                return true;
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
        const currentIndex = this.mapModel.getModule('range').nominalRangeIndex.get();
        const newIndex = this.mapRef.instance.changeRangeIndex(delta);
        if (currentIndex !== newIndex) {
            (_a = this.mapPointerController) === null || _a === void 0 ? void 0 : _a.targetPointer();
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
                (_a = this.mapPointerController) === null || _a === void 0 ? void 0 : _a.movePointer(-MFDFPLPage.POINTER_MOVE_INCREMENT, 0);
                return true;
            case FmsHEvent.JOYSTICK_UP:
                (_b = this.mapPointerController) === null || _b === void 0 ? void 0 : _b.movePointer(0, -MFDFPLPage.POINTER_MOVE_INCREMENT);
                return true;
            case FmsHEvent.JOYSTICK_RIGHT:
                (_c = this.mapPointerController) === null || _c === void 0 ? void 0 : _c.movePointer(MFDFPLPage.POINTER_MOVE_INCREMENT, 0);
                return true;
            case FmsHEvent.JOYSTICK_DOWN:
                (_d = this.mapPointerController) === null || _d === void 0 ? void 0 : _d.movePointer(0, MFDFPLPage.POINTER_MOVE_INCREMENT);
                return true;
        }
        return false;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewOpened() {
        this.props.menuSystem.clear();
        this.props.menuSystem.pushMenu('navmap-root');
        this.mapRef.instance.wake();
        this.fplRef.instance.onViewOpened();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewClosed() {
        var _a;
        super.onViewClosed();
        (_a = this.mapPointerController) === null || _a === void 0 ? void 0 : _a.setPointerActive(false);
        this.mapRef.instance.sleep();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewResumed() {
        super.onViewResumed();
        this.fplRef.instance.onViewResumed();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onFPLPressed() {
        this.props.viewService.open('NavMapPage');
        return true;
    }
    /** @inheritdoc */
    onScrollToggled(enabled) {
        this.focusModule.isFocused.set(enabled);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent("div", { ref: this.viewContainerRef, class: 'mfd-page' },
            FSComponent.buildComponent(MFDFPLMapComponent, { ref: this.mapRef, model: this.mapModel, bus: this.props.bus, updateFreq: MFDFPLPage.UPDATE_FREQ, projectedWidth: 440, projectedHeight: 734, deadZone: new Float64Array([0, 56, 0, 0]), flightPlanner: this.props.fms.flightPlanner, airspaceSearcher: this.props.airspaceSearcher, id: 'mfd_fplmap', bingId: 'mfd_page_map', settingManager: MapUserSettings.getMfdManager(this.props.bus), ownAirplaneLayerProps: {
                    imageFilePath: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/own_airplane_icon.svg',
                    iconSize: 40,
                    iconAnchor: new Float64Array([0.5, 0])
                }, trafficIntruderLayerProps: {
                    fontSize: 16,
                    iconSize: 30
                }, drawEntireFlightPlan: this.focusModule.isFocused, class: 'mfd-fplmap' }),
            FSComponent.buildComponent(MFDFPL, { ref: this.fplRef, onRegister: this.register, bus: this.props.bus, fms: this.props.fms, focus: this.focusModule.focus })));
    }
}
MFDFPLPage.UPDATE_FREQ = 30; // Hz
MFDFPLPage.POINTER_MOVE_INCREMENT = 5; // pixels
