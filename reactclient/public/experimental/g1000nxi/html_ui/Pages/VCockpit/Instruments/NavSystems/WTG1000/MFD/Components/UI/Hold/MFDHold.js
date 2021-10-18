import { FSComponent, NavMath, Subject } from 'msfssdk';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { ActionButton } from '../../../../Shared/UI/UIControls/ActionButton';
import { ArrowToggle } from '../../../../Shared/UI/UIControls/ArrowToggle';
import { NumberInput } from '../../../../Shared/UI/UIControls/NumberInput';
import { TimeDistanceInput } from '../../../../Shared/UI/UIControls/TimeDistanceInput';
import { Hold } from '../../../../Shared/UI/Hold/Hold';
import { WaypointMapComponent, WaypointMapRangeTargetRotationController } from '../../../../Shared/UI/WaypointMap/WaypointMapComponent';
import { WaypointMapModel } from '../../../../Shared/UI/WaypointMap/WaypointMapModel';
import { GroupBox } from '../GroupBox';
import './MFDHold.css';
/**
 * A class that displays the MFD hold dialog.
 */
export class MFDHold extends Hold {
    constructor() {
        super(...arguments);
        this.mapRef = FSComponent.createRef();
        this.mapModel = this.createMapModel();
        this.mapRangeIndexSub = Subject.create(WaypointMapRangeTargetRotationController.DEFAULT_MAP_RANGE_INDEX);
    }
    /** @inheritdoc */
    onAfterRender() {
        super.onAfterRender();
        this.mapRef.instance.sleep();
    }
    /** @inheritdoc */
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
    /** @inheritdoc */
    onViewOpened() {
        super.onViewOpened();
        this.controller.reset();
        this.mapRef.instance.wake();
    }
    /** @inheritdoc */
    onViewClosed() {
        super.onViewClosed();
        this.mapRef.instance.sleep();
        this.mapRangeIndexSub.set(WaypointMapRangeTargetRotationController.DEFAULT_MAP_RANGE_INDEX);
    }
    /**
     * Changes the MFD map range index setting.
     * @param delta The change in index to apply.
     */
    changeMapRangeIndex(delta) {
        const newIndex = Utils.Clamp(this.mapRangeIndexSub.get() + delta, 0, WaypointMapRangeTargetRotationController.DEFAULT_MAP_RANGES.length - 1);
        this.mapRangeIndexSub.set(newIndex);
    }
    /**
     * Creates the model for this component's map.
     * @returns a map model.
     */
    createMapModel() {
        return WaypointMapModel.createModel();
    }
    /**
     * Renders the MFD hold dialog.
     * @returns The rendered VNode.
     */
    render() {
        const icao = this.store.indexes.map(indexes => { var _a; return (_a = this.props.fms.getFlightPlan().getSegment(indexes.segmentIndex).legs[indexes.legIndex].name) !== null && _a !== void 0 ? _a : ''; });
        const directionString = this.createDirectionStringSubscribable();
        return (FSComponent.buildComponent("div", { class: 'popout-dialog mfd-hold', ref: this.viewContainerRef },
            FSComponent.buildComponent("h1", null, this.props.title),
            FSComponent.buildComponent(GroupBox, { title: 'Direction, Course', onRegister: this.register },
                FSComponent.buildComponent("div", { class: 'mfd-hold-gridcontainer' },
                    FSComponent.buildComponent("div", null,
                        "Hold ",
                        FSComponent.buildComponent("span", null, directionString),
                        " of"),
                    FSComponent.buildComponent("div", null, icao),
                    FSComponent.buildComponent("div", null,
                        "Course ",
                        FSComponent.buildComponent(NumberInput, { class: 'mfd-hold-course', minValue: 1, maxValue: 360, wrap: true, dataSubject: this.store.course, increment: 1, onRegister: this.register, formatter: (v) => `${NavMath.normalizeHeading(v).toFixed(0).padStart(3, '0')}°` })),
                    FSComponent.buildComponent("div", null,
                        FSComponent.buildComponent(ArrowToggle, { class: 'mfd-hold-inbound', options: ['Inbound', 'Outbound'], dataref: this.store.isInbound, onRegister: this.register })))),
            FSComponent.buildComponent(GroupBox, { title: 'Leg Time, Distance', onRegister: this.register },
                FSComponent.buildComponent("div", { class: 'mfd-hold-gridcontainer' },
                    FSComponent.buildComponent("div", null,
                        "Leg ",
                        FSComponent.buildComponent(ArrowToggle, { class: 'mfd-hold-time', options: ['Time', 'Distance'], dataref: this.store.isTime, onRegister: this.register })),
                    FSComponent.buildComponent("div", null,
                        FSComponent.buildComponent(TimeDistanceInput, { ref: this.distanceInput, class: 'mfd-hold-distance', timeSubject: this.store.time, distanceSubject: this.store.distance, onRegister: this.register })))),
            FSComponent.buildComponent(GroupBox, { title: 'Turns', onRegister: this.register },
                FSComponent.buildComponent("div", { class: 'mfd-hold-gridcontainer' },
                    FSComponent.buildComponent("div", null, "Turn Direction"),
                    FSComponent.buildComponent("div", null,
                        FSComponent.buildComponent(ArrowToggle, { class: 'mfd-hold-direction', options: ['Left', 'Right'], dataref: this.store.turnDirection, onRegister: this.register })))),
            FSComponent.buildComponent(GroupBox, { title: 'Map', onRegister: this.register, class: 'mfd-hold-map-box' },
                FSComponent.buildComponent(WaypointMapComponent, { ref: this.mapRef, model: this.mapModel, bus: this.props.bus, updateFreq: 4, projectedWidth: 285, projectedHeight: 300, id: 'mfd_wptinfo_map', rangeIndex: this.mapRangeIndexSub, waypoint: this.store.waypoint, ownAirplaneLayerProps: {
                        imageFilePath: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/own_airplane_icon.svg',
                        iconSize: 40,
                        iconAnchor: new Float64Array([0.5, 0])
                    } })),
            FSComponent.buildComponent(ActionButton, { class: 'mfd-hold-load', text: 'Load?', onExecute: () => { this.controller.accept(); this.close(); }, onRegister: this.register })));
    }
}
