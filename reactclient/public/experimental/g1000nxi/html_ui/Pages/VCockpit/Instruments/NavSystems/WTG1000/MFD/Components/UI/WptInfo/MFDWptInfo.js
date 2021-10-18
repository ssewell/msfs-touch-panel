import { FSComponent, Subject } from 'msfssdk';
import { LatLonDisplay } from 'msfssdk/components/common';
import { GroupBox } from '../GroupBox';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { WptInfo } from '../../../../Shared/UI/WptInfo/WptInfo';
import { MFDWptDupDialog } from '../WptDup/MFDWptDupDialog';
import { WaypointMapComponent, WaypointMapRangeTargetRotationController } from '../../../../Shared/UI/WaypointMap/WaypointMapComponent';
import { WaypointMapModel } from '../../../../Shared/UI/WaypointMap/WaypointMapModel';
import { MapPointerController } from '../../../../Shared/Map/Controllers/MapPointerController';
import './MFDWptInfo.css';
/**
 * The MFD waypoint info popout.
 */
export class MFDWptInfo extends WptInfo {
    constructor() {
        super(...arguments);
        this.mapRef = FSComponent.createRef();
        this.mapModel = this.createMapModel();
        this.pointerModule = this.mapModel.getModule('pointer');
        this.mapRangeIndexSub = Subject.create(WaypointMapRangeTargetRotationController.DEFAULT_MAP_RANGE_INDEX);
    }
    /**
     * Creates the model for this component's map.
     * @returns a map model.
     */
    createMapModel() {
        return WaypointMapModel.createModel();
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
        const currentIndex = this.mapRangeIndexSub.get();
        const newIndex = Utils.Clamp(currentIndex + delta, 0, WaypointMapRangeTargetRotationController.DEFAULT_MAP_RANGES.length - 1);
        if (currentIndex !== newIndex) {
            (_a = this.mapPointerController) === null || _a === void 0 ? void 0 : _a.targetPointer();
            this.mapRangeIndexSub.set(newIndex);
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
                (_a = this.mapPointerController) === null || _a === void 0 ? void 0 : _a.movePointer(-MFDWptInfo.POINTER_MOVE_INCREMENT, 0);
                return true;
            case FmsHEvent.JOYSTICK_UP:
                (_b = this.mapPointerController) === null || _b === void 0 ? void 0 : _b.movePointer(0, -MFDWptInfo.POINTER_MOVE_INCREMENT);
                return true;
            case FmsHEvent.JOYSTICK_RIGHT:
                (_c = this.mapPointerController) === null || _c === void 0 ? void 0 : _c.movePointer(MFDWptInfo.POINTER_MOVE_INCREMENT, 0);
                return true;
            case FmsHEvent.JOYSTICK_DOWN:
                (_d = this.mapPointerController) === null || _d === void 0 ? void 0 : _d.movePointer(0, MFDWptInfo.POINTER_MOVE_INCREMENT);
                return true;
        }
        return false;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    getWptDupDialogName() {
        return MFDWptDupDialog.name;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onWptDupDialogClose() {
        this.close();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewOpened() {
        super.onViewOpened();
        this.mapRef.instance.wake();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewClosed() {
        var _a;
        super.onViewClosed();
        (_a = this.mapPointerController) === null || _a === void 0 ? void 0 : _a.setPointerActive(false);
        this.mapRef.instance.sleep();
        this.mapRangeIndexSub.set(WaypointMapRangeTargetRotationController.DEFAULT_MAP_RANGE_INDEX);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent("div", { class: 'popout-dialog mfd-wptinfo', ref: this.viewContainerRef },
            FSComponent.buildComponent("h1", null, this.props.title),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Ident, Facility, City" }, this.renderWaypointInput()),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Map", class: 'mfd-wptinfo-map-box' },
                FSComponent.buildComponent(WaypointMapComponent, { ref: this.mapRef, model: this.mapModel, bus: this.props.bus, updateFreq: 15, projectedWidth: 285, projectedHeight: 300, id: 'mfd_wptinfo_map', rangeIndex: this.mapRangeIndexSub, waypoint: this.store.waypoint, ownAirplaneLayerProps: {
                        imageFilePath: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/own_airplane_icon.svg',
                        iconSize: 40,
                        iconAnchor: new Float64Array([0.5, 0])
                    } })),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Location" },
                FSComponent.buildComponent("div", { class: 'mfd-wptinfo-loc' },
                    FSComponent.buildComponent("div", { class: 'mfd-wptinfo-loc-field mfd-wptinfo-loc-bearing' },
                        FSComponent.buildComponent("div", { class: 'mfd-wptinfo-loc-title' }, "BRG"),
                        this.renderBearing('mfd-wptinfo-loc-value')),
                    FSComponent.buildComponent("div", { class: 'mfd-wptinfo-loc-field mfd-wptinfo-loc-distance' },
                        FSComponent.buildComponent("div", { class: 'mfd-wptinfo-loc-title' }, "DIS"),
                        this.renderDistance('mfd-wptinfo-loc-value')),
                    FSComponent.buildComponent("div", { class: 'mfd-wptinfo-loc-region' }, this.store.region),
                    FSComponent.buildComponent(LatLonDisplay, { location: this.store.location, class: 'mfd-wptinfo-loc-latlon' }))),
            FSComponent.buildComponent("div", { class: "mfd-wptinfo-bottom-prompt" }, this.store.prompt)));
    }
}
MFDWptInfo.POINTER_MOVE_INCREMENT = 2; // pixels
