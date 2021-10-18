import { DebounceTimer, FSComponent, GeoPoint, Subject, UnitType, Vec2Math } from 'msfssdk';
import { Fms } from '../../../../Shared/FlightPlan/Fms';
import { MapFlightPlanLayer } from '../../../../Shared/Map/Layers/MapFlightPlanLayer';
import { MapMiniCompassLayer } from '../../../../Shared/Map/Layers/MapMiniCompassLayer';
import { MapRangeCompassLayer } from '../../../../Shared/Map/Layers/MapRangeCompassLayer';
import { MapRangeRingLayer } from '../../../../Shared/Map/Layers/MapRangeRingLayer';
import { MapFlightPlanFocusCalculator } from '../../../../Shared/Map/MapFlightPlanFocusCalculator';
import { MapFlightPlannerPlanDataProvider } from '../../../../Shared/Map/MapFlightPlannerPlanDataProvider';
import { MapOrientation } from '../../../../Shared/Map/Modules/MapOrientationModule';
import { NavMapComponent, NavMapRangeTargetRotationController } from '../../../../Shared/UI/NavMap/NavMapComponent';
import { MapPointerInfoLayer, MapPointerInfoLayerSize } from '../../../../Shared/Map/Layers/MapPointerInfoLayer';
import { MFDFPLMapCrosshairController } from './MFDFPLMapCrosshairController';
/**
 * The MFD flight plan map.
 */
export class MFDFPLMapComponent extends NavMapComponent {
    constructor() {
        super(...arguments);
        this.dtoFlightPlanLayerRef = FSComponent.createRef();
        this.miniCompassLayerRef = FSComponent.createRef();
        this.rangeRingLayerRef = FSComponent.createRef();
        this.rangeCompassLayerRef = FSComponent.createRef();
        this.pointerInfoLayerRef = FSComponent.createRef();
        this.dtoPlanDataProvider = new MapFlightPlannerPlanDataProvider(this.props.bus, this.props.flightPlanner);
        this.crosshairController = new MFDFPLMapCrosshairController(this.props.model);
    }
    /** @inheritdoc */
    createRangeTargetRotationController() {
        this.primaryPlanDataProvider = new MapFlightPlannerPlanDataProvider(this.props.bus, this.props.flightPlanner);
        return new MFDFPLMapRangeTargetRotationController(this.props.model, this.mapProjection, this.deadZone, NavMapRangeTargetRotationController.DEFAULT_MAP_RANGES, this.props.settingManager, this.rangeSettingManager, 'mfdMapRangeIndex', this.pointerBoundsSub, this.primaryPlanDataProvider, MFDFPLMapComponent.FLIGHT_PLAN_FOCUS_DEFAULT_RANGE_INDEX);
    }
    /** @inheritdoc */
    initEventBusHandlers() {
        super.initEventBusHandlers();
        const planProviderHandler = this.updateFlightPlanDataProviders.bind(this);
        const flightPlanEvents = this.props.bus.getSubscriber();
        flightPlanEvents.on('fplIndexChanged').handle(planProviderHandler);
        this.props.model.getModule('focus').isFocused.sub(planProviderHandler, true);
    }
    /** @inheritdoc */
    initLayers() {
        super.initLayers();
        this.attachLayer(this.dtoFlightPlanLayerRef.instance);
        this.attachLayer(this.miniCompassLayerRef.instance);
        this.attachLayer(this.rangeRingLayerRef.instance);
        this.attachLayer(this.rangeCompassLayerRef.instance);
        this.attachLayer(this.pointerInfoLayerRef.instance);
    }
    /**
     * Changes this map's range index.
     * @param delta The change in index to apply.
     * @returns The range index after the change.
     */
    changeRangeIndex(delta) {
        return this.rangeTargetRotationController.changeRangeIndex(delta);
    }
    /**
     * Updates this map's flight plan layer data providers.
     */
    updateFlightPlanDataProviders() {
        const activePlanIndex = this.props.flightPlanner.activePlanIndex;
        const isFlightPlanFocused = this.props.model.getModule('focus').isFocused.get();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.primaryPlanDataProvider.setPlanIndex(activePlanIndex === Fms.PRIMARY_PLAN_INDEX || isFlightPlanFocused ? Fms.PRIMARY_PLAN_INDEX : -1);
        this.dtoPlanDataProvider.setPlanIndex(activePlanIndex === Fms.DTO_RANDOM_PLAN_INDEX ? Fms.DTO_RANDOM_PLAN_INDEX : -1);
    }
    /**
     * Renders the flight plan layer.
     * @returns The rendered flight plan layer, as a VNode.
     */
    renderFlightPlanLayer() {
        const inactiveWaypointStyles = this.getFlightPlanLayerInactiveWaypointsStyles();
        const activeWaypointStyles = this.getFlightPlanLayerActiveWaypointsStyles();
        return (FSComponent.buildComponent("div", { style: 'position: absolute; left: 0; top: 0; width: 100%; height: 100%;' },
            FSComponent.buildComponent(MapFlightPlanLayer, { ref: this.flightPlanLayerRef, model: this.props.model, mapProjection: this.mapProjection, 
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                bus: this.props.bus, dataProvider: this.primaryPlanDataProvider, drawEntirePlan: this.props.drawEntireFlightPlan, waypointRenderer: this.waypointRenderer, textManager: this.textManager, inactiveWaypointStyles: inactiveWaypointStyles, activeWaypointStyles: activeWaypointStyles }),
            FSComponent.buildComponent(MapFlightPlanLayer, { ref: this.dtoFlightPlanLayerRef, model: this.props.model, mapProjection: this.mapProjection, bus: this.props.bus, dataProvider: this.dtoPlanDataProvider, drawEntirePlan: Subject.create(false), waypointRenderer: this.waypointRenderer, textManager: this.textManager, inactiveWaypointStyles: inactiveWaypointStyles, activeWaypointStyles: activeWaypointStyles })));
    }
    /** @inheritdoc */
    renderMiniCompassLayer() {
        return (FSComponent.buildComponent(MapMiniCompassLayer, { ref: this.miniCompassLayerRef, class: 'minicompass-layer', model: this.props.model, mapProjection: this.mapProjection, imgSrc: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/map_mini_compass.png' }));
    }
    /** @inheritdoc */
    renderRangeRingLayer() {
        return (FSComponent.buildComponent(MapRangeRingLayer, { ref: this.rangeRingLayerRef, model: this.props.model, mapProjection: this.mapProjection, showLabel: true, strokeWidth: 2, strokeStyle: 'white' }));
    }
    /** @inheritdoc */
    renderRangeCompassLayer() {
        return (FSComponent.buildComponent(MapRangeCompassLayer, { ref: this.rangeCompassLayerRef, model: this.props.model, mapProjection: this.mapProjection, bus: this.props.bus, showLabel: true, showHeadingBug: this.props.model.getModule('pointer').isActive.map(isActive => !isActive), arcStrokeWidth: 2, arcEndTickLength: 10, referenceArrowWidth: 15, referenceArrowHeight: 20, referenceTickWidth: 2, referenceTickHeight: 5, bearingTickMajorLength: 10, bearingTickMinorLength: 5, bearingLabelFont: 'Roboto-Bold', bearingLabelFontSize: 20, bearingLabelOutlineWidth: 6, bearingLabelRadialOffset: 0, headingBugWidth: 20, headingBugHeight: 10 }));
    }
    /** @inheritdoc */
    renderPointerInfoLayer() {
        return (FSComponent.buildComponent(MapPointerInfoLayer, { ref: this.pointerInfoLayerRef, model: this.props.model, mapProjection: this.mapProjection, size: MapPointerInfoLayerSize.Medium }));
    }
    /** @inheritdoc */
    renderTerrainScaleIndicator() {
        return null;
    }
}
MFDFPLMapComponent.FLIGHT_PLAN_FOCUS_DEFAULT_RANGE_INDEX = 17;
/**
 * A controller for handling map range, target, and rotation changes for the MFD navigation map.
 */
class MFDFPLMapRangeTargetRotationController extends NavMapRangeTargetRotationController {
    /**
     * Creates an instance of a MapRangeController.
     * @param mapModel The map model.
     * @param mapProjection The map projection.
     * @param deadZone The dead zone around the edge of the map projection window.
     * @param mapRanges An array of valid map ranges.
     * @param settingManager This controller's map settings manager.
     * @param rangeSettingManager This controller's map range settings manager.
     * @param rangeSettingName The name of this controller's map range setting.
     * @param pointerBounds A subscribable which provides the bounds of the area accessible to the map pointer. The
     * bounds should be expressed as `[left, top, right, bottom]` in pixels.
     * @param flightPlanDataProvider A provider of flight plan data for this controller.
     * @param flightPlanFocusDefaultRangeIndex The index of the map range to which this controller defaults when focusing
     * on the flight plan with a calculated focus range of zero.
     */
    constructor(mapModel, mapProjection, deadZone, mapRanges, settingManager, rangeSettingManager, rangeSettingName, pointerBounds, flightPlanDataProvider, flightPlanFocusDefaultRangeIndex) {
        super(mapModel, mapProjection, deadZone, mapRanges, settingManager, rangeSettingManager, rangeSettingName, pointerBounds);
        this.flightPlanDataProvider = flightPlanDataProvider;
        this.flightPlanFocusDefaultRangeIndex = flightPlanFocusDefaultRangeIndex;
        this.focusModule = this.mapModel.getModule('focus');
        this.focusCalculator = new MapFlightPlanFocusCalculator(this.mapProjection);
        this.focusRangeTarget = { range: 0, target: new GeoPoint(0, 0) };
        this.focusDebounceTimer = new DebounceTimer();
        this.focusMargins = new Float64Array([20, 20, 20, 20]);
        this.isFlightPlanFocusedChangedHandler = this.onIsFlightPlanFocusChanged.bind(this);
        this.flightPlanFocusChangedHandler = this.onFlightPlanFocusChanged.bind(this);
        this.flightPlanCalculatedHandler = this.onFlightPlanCalculated.bind(this);
        this.isIsFlightPlanFocusedListenerActive = false;
        this.areFlightPlanFocusListenersActive = false;
        this.skipFlightPlanFocusDebounce = false;
        this.useMapRangeSetting = true;
        this.updateRangeTargetFromFocusBound = this.updateRangeTargetFromFocus.bind(this);
        this.updateFocusMargins();
        this.focusModule.isActive.sub(this.onIsFlightPlanFocusActiveChanged.bind(this));
    }
    /**
     * Changes this controller's map range index.
     * @param delta The change in index to apply.
     * @returns The range index after the change.
     */
    changeRangeIndex(delta) {
        if (this.useMapRangeSetting) {
            const newIndex = Utils.Clamp(this.rangeSetting.value + delta, 0, this.mapRanges.length - 1);
            this.rangeSetting.value = newIndex;
            return newIndex;
        }
        else {
            const newIndex = Utils.Clamp(this.currentMapRangeIndex + delta, 0, this.mapRanges.length - 1);
            if (newIndex !== this.currentMapRangeIndex) {
                this.currentMapRangeIndex = newIndex;
                this.updateRangeFromIndex();
                this.scheduleProjectionUpdate();
            }
            return newIndex;
        }
    }
    /** @inheritdoc */
    onDeadZoneChanged() {
        super.onDeadZoneChanged();
        this.updateFocusMargins();
    }
    /**
     * Updates the flight plan focus margins.
     */
    updateFocusMargins() {
        this.focusMargins[0] = this.deadZone[0] + 20;
        this.focusMargins[1] = this.deadZone[1] + 20;
        this.focusMargins[2] = this.deadZone[2] + 20;
        this.focusMargins[3] = this.deadZone[3] + 20;
    }
    /** @inheritdoc */
    updateRangeIndex() {
        if (!this.useMapRangeSetting) {
            return;
        }
        super.updateRangeIndex();
    }
    /** @inheritdoc */
    convertToTrueRange(nominalRange) {
        const projectedHeight = this.mapProjection.getProjectedSize()[1];
        const correctedHeight = projectedHeight - this.deadZone[1] - this.deadZone[3];
        const orientation = this.mapModel.getModule('orientation').orientation.get();
        const factor = orientation === MapOrientation.NorthUp ? 4 : 3;
        return nominalRange.asUnit(UnitType.GA_RADIAN) * projectedHeight / correctedHeight * factor;
    }
    /** @inheritdoc */
    getDesiredTargetOffset() {
        const trueCenterOffsetX = (this.deadZone[0] - this.deadZone[2]) / 2;
        const trueCenterOffsetY = (this.deadZone[1] - this.deadZone[3]) / 2;
        const projectedSize = this.mapProjection.getProjectedSize();
        const relativeOffset = this.mapModel.getModule('orientation').orientation.get() === MapOrientation.NorthUp
            ? MFDFPLMapRangeTargetRotationController.NORTH_UP_TARGET_OFFSET_REL
            : MFDFPLMapRangeTargetRotationController.HDG_TRK_UP_TARGET_OFFSET_REL;
        return Vec2Math.set(relativeOffset[0] * projectedSize[0] + trueCenterOffsetX, relativeOffset[1] * projectedSize[1] + trueCenterOffsetY, MFDFPLMapRangeTargetRotationController.tempVec2_1);
    }
    /** @inheritdoc */
    updateOrientation() {
        if (this.focusModule.isFocused.get()) {
            this.orientationModule.orientation.set(MapOrientation.NorthUp);
        }
        else {
            super.updateOrientation();
        }
    }
    /**
     * Sets whether to sync the map range to the map range user setting.
     * @param use Whether to sync the map range to the map range user setting.
     */
    setUseMapRangeSetting(use) {
        if (use === this.useMapRangeSetting) {
            return;
        }
        this.useMapRangeSetting = use;
        if (use) {
            this.updateRangeIndex();
        }
    }
    /** @inheritdoc */
    onPointerActivated() {
        super.onPointerActivated();
        this.focusModule.isActive.set(false);
        this.updateIsFlightPlanFocusedListener();
    }
    /** @inheritdoc */
    onPointerDeactivated() {
        super.onPointerDeactivated();
        this.setUseMapRangeSetting(true);
        this.updateIsFlightPlanFocusedListener();
    }
    /**
     * Responds to changes in whether flight plan focus is active.
     * @param isActive Whether flight plan focus is active.
     */
    onIsFlightPlanFocusActiveChanged(isActive) {
        this.updateOrientation();
        this.updateAirplanePositionListeners();
        this.updateFlightPlanFocusListeners();
        this.setUseMapRangeSetting(!isActive && !this.pointerModule.isActive.get());
        if (!isActive) {
            this.focusDebounceTimer.clear();
        }
        this.scheduleProjectionUpdate();
    }
    /**
     * Responds to changes in whether the flight plan is focused.
     * @param isFocused Whether the flight plan is focused.
     */
    onIsFlightPlanFocusChanged(isFocused) {
        this.focusModule.isActive.set(isFocused);
    }
    /** @inheritdoc */
    updateAirplanePositionListeners() {
        this.setAirplanePositionListenersActive(!this.pointerModule.isActive.get() && !this.focusModule.isActive.get());
    }
    /**
     * Updates is flight plan focused listener.
     */
    updateIsFlightPlanFocusedListener() {
        this.setIsFlightPlanFocusedListenerActive(!this.pointerModule.isActive.get());
    }
    /**
     * Updates flight plan focus listeners.
     */
    updateFlightPlanFocusListeners() {
        this.setFlightPlanFocusListenersActive(this.focusModule.isActive.get());
    }
    /**
     * Activates or deactivates the is flight plan focused listener.
     * @param value Whether to activate the is flight plan focused listener.
     */
    setIsFlightPlanFocusedListenerActive(value) {
        if (value === this.isIsFlightPlanFocusedListenerActive) {
            return;
        }
        if (value) {
            this.focusModule.isFocused.sub(this.isFlightPlanFocusedChangedHandler, true);
        }
        else {
            this.focusModule.isFocused.unsub(this.isFlightPlanFocusedChangedHandler);
        }
        this.isIsFlightPlanFocusedListenerActive = value;
    }
    /**
     * Activates or deactivates flight plan focus listeners.
     * @param value Whether to activate flight plan focus listeners.
     */
    setFlightPlanFocusListenersActive(value) {
        if (value === this.areFlightPlanFocusListenersActive) {
            return;
        }
        if (value) {
            this.skipFlightPlanFocusDebounce = true;
            this.focusModule.focus.sub(this.flightPlanFocusChangedHandler, true);
            this.skipFlightPlanFocusDebounce = false;
            this.flightPlanDataProvider.planCalculated.on(this.flightPlanCalculatedHandler);
        }
        else {
            this.focusModule.focus.unsub(this.flightPlanFocusChangedHandler);
            this.flightPlanDataProvider.planCalculated.off(this.flightPlanCalculatedHandler);
        }
        this.areFlightPlanFocusListenersActive = value;
    }
    /**
     * Responds to changes in the flight plan focus.
     */
    onFlightPlanFocusChanged() {
        if (this.skipFlightPlanFocusDebounce) {
            this.updateRangeTargetFromFocus();
        }
        else {
            this.scheduleUpdateRangeTargetFromFocus();
        }
    }
    /**
     * A callback which is called when the flight plan is calculated.
     */
    onFlightPlanCalculated() {
        // only update from flight plan focus if the focus is not null and a valid range and target do not already exist.
        if (this.focusModule.isFocused.get() && this.focusModule.focus.get() !== null && isNaN(this.focusRangeTarget.range)) {
            this.updateRangeTargetFromFocus();
        }
    }
    /**
     * Schedules an update of the map target and range from the current flight plan focus after a debounce delay.
     */
    scheduleUpdateRangeTargetFromFocus() {
        this.focusDebounceTimer.schedule(this.updateRangeTargetFromFocusBound, MFDFPLMapRangeTargetRotationController.FOCUS_DEBOUNCE_DELAY);
    }
    /**
     * Updates the map target and range from the current flight plan focus.
     */
    updateRangeTargetFromFocus() {
        const targetRange = this.focusCalculator.calculateRangeTarget(this.focusModule.focus.get(), this.focusMargins, this.focusRangeTarget);
        if (isNaN(targetRange.range)) {
            return;
        }
        this.currentMapParameters.target.set(targetRange.target);
        // when flight plan is focused, we are guaranteed to be in North Up mode, so true range = nominal range * 4.
        const rangeIndex = targetRange.range > 0
            ? this.mapRanges.findIndex(range => range.asUnit(UnitType.GA_RADIAN) * 4 >= targetRange.range)
            : this.flightPlanFocusDefaultRangeIndex;
        this.currentMapRangeIndex = rangeIndex < 0 ? this.mapRanges.length - 1 : rangeIndex;
        this.updateRangeFromIndex();
        this.scheduleProjectionUpdate();
    }
    /** @inheritdoc */
    updateModules() {
        super.updateModules();
        const isNorthUp = this.mapModel.getModule('orientation').orientation.get() === MapOrientation.NorthUp;
        this.mapModel.getModule('rangeRing').show.set(isNorthUp);
        this.mapModel.getModule('rangeCompass').show.set(!isNorthUp);
    }
}
MFDFPLMapRangeTargetRotationController.NORTH_UP_TARGET_OFFSET_REL = new Float64Array(2);
MFDFPLMapRangeTargetRotationController.HDG_TRK_UP_TARGET_OFFSET_REL = new Float64Array([0, 1 / 6]);
MFDFPLMapRangeTargetRotationController.FOCUS_DEBOUNCE_DELAY = 500; // milliseconds
MFDFPLMapRangeTargetRotationController.tempVec2_1 = new Float64Array(2);
