import { FSComponent, Subject } from 'msfssdk';
import { DirectTo } from '../../../../Shared/UI/DirectTo/DirectTo';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { ActionButton } from '../../../../Shared/UI/UIControls/ActionButton';
import { WaypointMapComponent, WaypointMapRangeTargetRotationController } from '../../../../Shared/UI/WaypointMap/WaypointMapComponent';
import { WaypointMapModel } from '../../../../Shared/UI/WaypointMap/WaypointMapModel';
import { GroupBox } from '../GroupBox';
import './MFDDirectTo.css';
/**
 * The MFD direct-to popout.
 */
export class MFDDirectTo extends DirectTo {
    constructor() {
        super(...arguments);
        this.mapRef = FSComponent.createRef();
        this.mapModel = this.createMapModel();
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
    onInteractionEvent(evt) {
        switch (evt) {
            case FmsHEvent.RANGE_DEC:
                this.changeMapRangeIndex(-1);
                return true;
            case FmsHEvent.RANGE_INC:
                this.changeMapRangeIndex(1);
                return true;
        }
        return super.onInteractionEvent(evt);
    }
    /**
     * Changes the MFD map range index setting.
     * @param delta The change in index to apply.
     */
    changeMapRangeIndex(delta) {
        const newIndex = Utils.Clamp(this.mapRangeIndexSub.get() + delta, 0, WaypointMapRangeTargetRotationController.DEFAULT_MAP_RANGES.length - 1);
        this.mapRangeIndexSub.set(newIndex);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewOpened() {
        super.onViewOpened();
        this.mapRef.instance.wake();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewClosed() {
        super.onViewClosed();
        this.mapRef.instance.sleep();
        this.mapRangeIndexSub.set(WaypointMapRangeTargetRotationController.DEFAULT_MAP_RANGE_INDEX);
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: 'popout-dialog mfd-dto', ref: this.viewContainerRef },
            FSComponent.buildComponent("h1", null, this.props.title),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Ident, Facility, City" }, this.renderWaypointInput()),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "VNV" },
                FSComponent.buildComponent("div", { class: "mfd-dto-vnv-box" },
                    FSComponent.buildComponent("div", null,
                        "- - - - -",
                        FSComponent.buildComponent("span", { class: "size12" }, "FT")),
                    FSComponent.buildComponent("div", null,
                        "+0",
                        FSComponent.buildComponent("span", { class: "size12" }, "NM")))),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Map", class: 'mfd-dto-map-box' },
                FSComponent.buildComponent(WaypointMapComponent, { ref: this.mapRef, model: this.mapModel, bus: this.props.bus, updateFreq: 4, projectedWidth: 285, projectedHeight: 250, id: 'mfd_dto_map', rangeIndex: this.mapRangeIndexSub, waypoint: this.store.waypoint, ownAirplaneLayerProps: {
                        imageFilePath: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/own_airplane_icon.svg',
                        iconSize: 40,
                        iconAnchor: new Float64Array([0.5, 0])
                    } })),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Location" },
                FSComponent.buildComponent("div", { class: "mfd-dto-location" },
                    FSComponent.buildComponent("div", { class: 'mfd-dto-location-field mfd-dto-bearing' },
                        FSComponent.buildComponent("div", { class: 'mfd-dto-location-field-title' }, "BRG"),
                        this.renderBearing()),
                    FSComponent.buildComponent("div", { class: 'mfd-dto-location-field mfd-dto-distance' },
                        FSComponent.buildComponent("div", { class: 'mfd-dto-location-field-title' }, "DIS"),
                        this.renderDistance()))),
            FSComponent.buildComponent("div", { class: "mfd-dto-course-box" },
                FSComponent.buildComponent("div", { class: "mfd-dto-course-box-title" }, "Course"),
                FSComponent.buildComponent("div", null, "- - -\u00B0")),
            FSComponent.buildComponent("div", { class: "mfd-action-buttons mfd-dto-action-buttons" },
                FSComponent.buildComponent(ActionButton, { onRegister: this.register, isVisible: this.controller.canActivate, onExecute: this.onLoadExecuted, text: "Activate?" }))));
    }
}
