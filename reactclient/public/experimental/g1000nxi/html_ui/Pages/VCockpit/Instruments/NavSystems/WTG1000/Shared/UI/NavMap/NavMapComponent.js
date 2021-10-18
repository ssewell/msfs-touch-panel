/// <reference types="msfstypes/JS/Avionics" />
import { BitFlags, FSComponent, GeoPoint, Subject, UnitType, Vec2Math, VecNSubject } from 'msfssdk';
import { MapComponent, MapOwnAirplaneLayer, MapProjectionChangeType, MapCullableTextLayer, MapCullableTextLabelManager } from 'msfssdk/components/map';
import { AirspaceRenderManager } from '../../Map/AirspaceRenderManager';
import { MapWaypointRenderer } from '../../Map/MapWaypointRenderer';
import { MapBingLayer } from '../../Map/Layers/MapBingLayer';
import { MapWaypointsLayer } from '../../Map/Layers/MapWaypointsLayer';
import { MapAirspaceLayer } from '../../Map/Layers/MapAirspaceLayer';
import { MapFlightPlanLayer } from '../../Map/Layers/MapFlightPlanLayer';
import { MapActiveFlightPlanDataProvider } from '../../Map/MapActiveFlightPlanDataProvider';
import { MapDetailIndicator } from '../../Map/Indicators/MapDetailIndicator';
import { MapTrafficIntruderOffScaleIndicator, MapTrafficIntruderOffScaleIndicatorMode } from '../../Map/Indicators/MapTrafficOffScaleIndicator';
import { MapTrafficIntruderLayer } from '../../Map/Layers/MapTrafficIntruderLayer';
import { MapPointerLayer } from '../../Map/Layers/MapPointerLayer';
import { MapCrosshairLayer } from '../../Map/Layers/MapCrosshairLayer';
import { MapOrientation } from '../../Map/Modules/MapOrientationModule';
import { MapWaypointStyles } from '../../Map/MapWaypointStyles';
import { MapRangeDisplay } from '../../Map/MapRangeDisplay';
import { MapTrafficStatusIndicator } from '../../Map/Indicators/MapTrafficStatusIndicator';
import { MapOrientationSettingMode } from '../../Map/MapUserSettings';
import { MapRangeSettings } from '../../Map/MapRangeSettings';
import { MapDeclutterController } from '../../Map/Controllers/MapDeclutterController';
import { MapTerrainController } from '../../Map/Controllers/MapTerrainController';
import { MapWaypointsVisController } from '../../Map/Controllers/MapWaypointsVisController';
import { MapNexradController } from '../../Map/Controllers/MapNexradController';
import { MapOrientationIndicator } from '../../Map/Indicators/MapOrientationIndicator';
import { TrafficUserSettings } from '../../Traffic/TrafficUserSettings';
import { NavMapTrafficController } from './NavMapTrafficController';
import { MapCrosshairController } from '../../Map/Controllers/MapCrosshairController';
import './NavMapComponent.css';
/**
 * A G1000 navigation map component.
 */
export class NavMapComponent extends MapComponent {
    /**
     * Creates an instance of a NavMap.
     * @param props The properties of the nav map.
     */
    constructor(props) {
        super(props);
        this.rootRef = FSComponent.createRef();
        this.bingLayerRef = FSComponent.createRef();
        this.airspaceLayerRef = FSComponent.createRef();
        this.flightPlanLayerRef = FSComponent.createRef();
        this.navAidsLayerRef = FSComponent.createRef();
        this.textLayerRef = FSComponent.createRef();
        this.crosshairLayerRef = FSComponent.createRef();
        this.trafficIntruderLayerRef = FSComponent.createRef();
        this.ownAirplaneLayerRef = FSComponent.createRef();
        this.pointerLayerRef = FSComponent.createRef();
        this.deadZone = new Float64Array(4);
        this.pointerBoundsSub = VecNSubject.createFromVector(new Float64Array([0, 0, this.props.projectedWidth, this.props.projectedHeight]));
        this.textManager = new MapCullableTextLabelManager();
        this.waypointRenderer = new MapWaypointRenderer(this.textManager);
        this.trafficOffScaleModeSub = Subject.create(MapTrafficIntruderOffScaleIndicatorMode.Off);
        this.rangeSettingManager = MapRangeSettings.getManager(this.props.bus);
        this.declutterController = new MapDeclutterController(this.props.model.getModule('declutter'), this.props.settingManager);
        this.terrainColorController = new MapTerrainController(this.props.model, this.props.settingManager);
        this.waypointsVisController = new MapWaypointsVisController(this.props.model, this.props.settingManager);
        this.trafficController = new NavMapTrafficController(this.props.model, TrafficUserSettings.getManager(this.props.bus), this.props.settingManager);
        this.nexradController = new MapNexradController(this.props.model, this.props.settingManager);
        this.crosshairController = new MapCrosshairController(this.props.model);
        if (this.props.deadZone) {
            this.deadZone.set(this.props.deadZone);
        }
        this.updatePointerBounds();
        this.rangeTargetRotationController = this.createRangeTargetRotationController();
    }
    /**
     * Gets the size of the dead zone around this map's projected window, which is displayed but excluded in map range
     * calculations. Expressed as [left, top, right, bottom] in pixels.
     * @returns the size of the dead zone around this map's projected window.
     */
    getDeadZone() {
        return this.deadZone;
    }
    /**
     * Sets the size of the dead zone around this map's projected window. The dead zone is displayed but excluded in map
     * range calculations.
     * @param deadZone The new dead zone, expressed as [left, top, right, bottom] in pixels.
     */
    setDeadZone(deadZone) {
        if (this.deadZone.every((value, index) => value === deadZone[index])) {
            return;
        }
        this.deadZone.set(deadZone);
        this.onDeadZoneChanged();
    }
    /**
     * This method is called when the size of this map's dead zone changes.
     */
    onDeadZoneChanged() {
        this.rangeTargetRotationController.setDeadZone(this.deadZone);
        this.updatePointerBounds();
    }
    /** @inheritdoc */
    onAfterRender() {
        super.onAfterRender();
        this.setRootSize(this.mapProjection.getProjectedSize());
        this.initEventBusHandlers();
        this.rangeTargetRotationController.init();
        this.initControllers();
        this.initLayers();
    }
    /**
     * Sets the size of this map's root HTML element.
     * @param size The new size, in pixels.
     */
    setRootSize(size) {
        this.rootRef.instance.style.width = `${size[0]}px`;
        this.rootRef.instance.style.height = `${size[1]}px`;
    }
    /**
     * Initializes event bus handlers.
     */
    initEventBusHandlers() {
        this.props.model.getModule('ownAirplaneProps').beginSync(this.props.bus, this.props.updateFreq);
    }
    /**
     * Initializes model controllers.
     */
    initControllers() {
        this.declutterController.init();
        this.terrainColorController.init();
        this.waypointsVisController.init();
        this.trafficController.init();
        this.nexradController.init();
        this.crosshairController.init();
    }
    /**
     * Initializes this map's layers.
     */
    initLayers() {
        this.attachLayer(this.bingLayerRef.instance);
        this.attachLayer(this.airspaceLayerRef.instance);
        this.attachLayer(this.navAidsLayerRef.instance);
        this.attachLayer(this.flightPlanLayerRef.instance);
        this.attachLayer(this.textLayerRef.instance);
        this.attachLayer(this.crosshairLayerRef.instance);
        this.attachLayer(this.ownAirplaneLayerRef.instance);
        this.attachLayer(this.trafficIntruderLayerRef.instance);
        this.attachLayer(this.pointerLayerRef.instance);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onProjectedSizeChanged() {
        this.setRootSize(this.mapProjection.getProjectedSize());
        this.updatePointerBounds();
    }
    /**
     * Updates this map's pointer bounds.
     */
    updatePointerBounds() {
        const size = this.mapProjection.getProjectedSize();
        const minX = this.deadZone[0];
        const minY = this.deadZone[1];
        const maxX = size[0] - this.deadZone[2];
        const maxY = size[1] - this.deadZone[3];
        const width = maxX - minX;
        const height = maxY - minY;
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        this.pointerBoundsSub.set(Math.min(centerX, minX + width * 0.1), Math.min(centerY, minY + height * 0.1), Math.max(centerX, maxX - height * 0.1), Math.max(centerY, maxY - height * 0.1));
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onUpdated(time, elapsed) {
        this.updateRangeTargetRotationController();
        this.waypointRenderer.update(this.mapProjection);
        super.onUpdated(time, elapsed);
    }
    /**
     * Updates this map's range/target/rotation controller.
     */
    updateRangeTargetRotationController() {
        this.rangeTargetRotationController.update();
    }
    /** @inheritdoc */
    render() {
        var _a;
        let className = 'nav-map-container';
        if (this.props.class !== undefined) {
            className += ` ${this.props.class}`;
        }
        return (FSComponent.buildComponent("div", { ref: this.rootRef, class: className },
            FSComponent.buildComponent(MapBingLayer, { ref: this.bingLayerRef, model: this.props.model, mapProjection: this.mapProjection, bingId: (_a = this.props.bingId) !== null && _a !== void 0 ? _a : this.props.id }),
            FSComponent.buildComponent(MapAirspaceLayer, { ref: this.airspaceLayerRef, model: this.props.model, mapProjection: this.mapProjection, useBuffer: true, overdrawFactor: 1.2, airspaceSearcher: this.props.airspaceSearcher, airspaceRenderManager: new AirspaceRenderManager() }),
            FSComponent.buildComponent(MapWaypointsLayer, { ref: this.navAidsLayerRef, model: this.props.model, mapProjection: this.mapProjection, bus: this.props.bus, waypointRenderer: this.waypointRenderer, textManager: this.textManager, styles: this.getWaypointsLayerStyles() }),
            this.renderFlightPlanLayer(),
            FSComponent.buildComponent(MapCullableTextLayer, { ref: this.textLayerRef, model: this.props.model, mapProjection: this.mapProjection, manager: this.textManager }),
            this.renderRangeRingLayer(),
            this.renderRangeCompassLayer(),
            FSComponent.buildComponent(MapCrosshairLayer, { ref: this.crosshairLayerRef, model: this.props.model, mapProjection: this.mapProjection }),
            FSComponent.buildComponent(MapTrafficIntruderLayer, { ref: this.trafficIntruderLayerRef, model: this.props.model, mapProjection: this.mapProjection, bus: this.props.bus, fontSize: this.props.trafficIntruderLayerProps.fontSize, iconSize: this.props.trafficIntruderLayerProps.iconSize, useOuterRangeMaxScale: false, offScaleIndicatorMode: this.trafficOffScaleModeSub }),
            FSComponent.buildComponent(MapOwnAirplaneLayer, { ref: this.ownAirplaneLayerRef, model: this.props.model, mapProjection: this.mapProjection, imageFilePath: this.props.ownAirplaneLayerProps.imageFilePath, iconSize: this.props.ownAirplaneLayerProps.iconSize, iconAnchor: this.props.ownAirplaneLayerProps.iconAnchor }),
            this.renderMiniCompassLayer(),
            this.renderPointerInfoLayer(),
            this.renderIndicatorGroups(),
            FSComponent.buildComponent(MapPointerLayer, { ref: this.pointerLayerRef, model: this.props.model, mapProjection: this.mapProjection })));
    }
    /**
     * Gets styles for the waypoints layer.
     * @returns styles for the waypoints layer.
     */
    getWaypointsLayerStyles() {
        return MapWaypointStyles.getNormalStyles(1, 10);
    }
    /**
     * Gets inactive waypoint styles for the flight plan layer.
     * @returns inactive waypoint styles for the flight plan layer.
     */
    getFlightPlanLayerInactiveWaypointsStyles() {
        return MapWaypointStyles.getFlightPlanStyles(false, 1, 20);
    }
    /**
     * Gets active waypoint styles for the flight plan layer.
     * @returns active waypoint styles for the flight plan layer.
     */
    getFlightPlanLayerActiveWaypointsStyles() {
        return MapWaypointStyles.getFlightPlanStyles(true, 2, 21);
    }
    /**
     * Renders this map's indicator groups.
     * @returns an array of this map's indicator groups.
     */
    renderIndicatorGroups() {
        return [
            this.renderTopLeftIndicatorGroup(),
            this.renderBottomLeftIndicatorGroup(),
            this.renderBottomRightIndicatorGroup()
        ];
    }
    /**
     * Renders the top-left indicator group.
     * @returns the top-left indicator group.
     */
    renderTopLeftIndicatorGroup() {
        return (FSComponent.buildComponent("div", { class: 'navmap-indicators-top-left' }, this.renderTopLeftIndicators()));
    }
    /**
     * Renders indicators in the top-left indicator group.
     * @returns indicators in the top-left indicator group.
     */
    renderTopLeftIndicators() {
        return [
            this.renderOrientationIndicator()
        ];
    }
    /**
     * Renders the bottom-left indicator group.
     * @returns the bottom-left indicator group.
     */
    renderBottomLeftIndicatorGroup() {
        return (FSComponent.buildComponent("div", { class: 'navmap-indicators-bottom-left' }, this.renderBottomLeftIndicators()));
    }
    /**
     * Renders indicators in the bottom-left indicator group.
     * @returns indicators in the bottom-left indicator group.
     */
    renderBottomLeftIndicators() {
        return [
            this.renderDetailIndicator(),
            this.renderTrafficOffScaleIndicator()
        ];
    }
    /**
     * Renders the bottom-right indicator group.
     * @returns the bottom-right indicator group.
     */
    renderBottomRightIndicatorGroup() {
        return (FSComponent.buildComponent("div", { class: 'navmap-indicators-bottom-right' }, this.renderBottomRightIndicators()));
    }
    /**
     * Renders indicators in the bottom-right indicator group.
     * @returns indicators in the bottom-right indicator group.
     */
    renderBottomRightIndicators() {
        return [
            this.renderTrafficStatusIndicator(true),
            this.renderTerrainScaleIndicator()
        ];
    }
    /**
     * Renders the flight plan layer.
     * @returns The rendered flight plan layer, as a VNode.
     */
    renderFlightPlanLayer() {
        return (FSComponent.buildComponent(MapFlightPlanLayer, { ref: this.flightPlanLayerRef, model: this.props.model, mapProjection: this.mapProjection, bus: this.props.bus, dataProvider: new MapActiveFlightPlanDataProvider(this.props.bus, this.props.flightPlanner), drawEntirePlan: this.props.drawEntireFlightPlan, waypointRenderer: this.waypointRenderer, textManager: this.textManager, inactiveWaypointStyles: this.getFlightPlanLayerInactiveWaypointsStyles(), activeWaypointStyles: this.getFlightPlanLayerActiveWaypointsStyles() }));
    }
    /**
     * Renders the range indicator.
     * @returns The range indicator.
     */
    renderRangeIndicator() {
        // TODO: Add customizable display unit support.
        const rangeModule = this.props.model.getModule('range');
        return (FSComponent.buildComponent(MapRangeDisplay, { range: rangeModule.nominalRange, displayUnit: Subject.create(UnitType.NMILE) }));
    }
    /**
     * Renders the orientation indicator.
     * @returns The orientation indicator.
     */
    renderOrientationIndicator() {
        const orientationModule = this.props.model.getModule('orientation');
        return (FSComponent.buildComponent(MapOrientationIndicator, { orientation: orientationModule.orientation, text: {
                [MapOrientation.NorthUp]: 'NORTH UP',
                [MapOrientation.TrackUp]: 'TRK UP',
                [MapOrientation.HeadingUp]: 'HDG UP'
            }, isVisible: this.props.model.getModule('pointer').isActive.map(isActive => !isActive) }));
    }
    /**
     * Renders the detail indicator.
     * @returns The detail indicator.
     */
    renderDetailIndicator() {
        return (FSComponent.buildComponent(MapDetailIndicator, { declutterMode: this.props.model.getModule('declutter').mode, showTitle: true }));
    }
    /**
     * Renders the traffic status indicator.
     * @param showAltitudeRestrictionMode Whether the indicator should show the altitude restriction mode.
     * @returns The traffic status indicator.
     */
    renderTrafficStatusIndicator(showAltitudeRestrictionMode) {
        const trafficModule = this.props.model.getModule('traffic');
        return (FSComponent.buildComponent(MapTrafficStatusIndicator, { showAltitudeRestrictionMode: showAltitudeRestrictionMode, show: trafficModule.show, operatingMode: trafficModule.operatingMode, altitudeRestrictionMode: trafficModule.altitudeRestrictionMode }));
    }
    /**
     * Renders the traffic off-scale indicator.
     * @returns The traffic off-scale indicator.
     */
    renderTrafficOffScaleIndicator() {
        return (FSComponent.buildComponent(MapTrafficIntruderOffScaleIndicator, { mode: this.trafficOffScaleModeSub }));
    }
}
/**
 * A controller for handling map range, target, and rotation changes.
 */
export class NavMapRangeTargetRotationController {
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
     */
    constructor(mapModel, mapProjection, deadZone, mapRanges, settingManager, rangeSettingManager, rangeSettingName, pointerBounds) {
        this.mapModel = mapModel;
        this.mapProjection = mapProjection;
        this.mapRanges = mapRanges;
        this.settingManager = settingManager;
        this.rangeSettingManager = rangeSettingManager;
        this.rangeSettingName = rangeSettingName;
        this.pointerBounds = pointerBounds;
        this.deadZone = new Float64Array(4);
        this.currentMapRangeIndex = NavMapRangeTargetRotationController.DEFAULT_MAP_RANGE_INDEX;
        this.needUpdateProjection = false;
        this.needUpdatePointerScroll = false;
        this.currentMapParameters = {
            range: 0,
            target: new GeoPoint(0, 0),
            targetProjectedOffset: new Float64Array(2),
            rotation: 0
        };
        this.airplanePropsModule = this.mapModel.getModule('ownAirplaneProps');
        this.orientationModule = this.mapModel.getModule('orientation');
        this.pointerModule = this.mapModel.getModule('pointer');
        this.rangeSetting = this.rangeSettingManager.getSetting(this.rangeSettingName);
        this.orientationSetting = this.settingManager.getSetting('mapOrientation');
        this.autoNorthUpActiveSetting = this.settingManager.getSetting('mapAutoNorthUpActive');
        this.autoNorthUpRangeIndexSetting = this.settingManager.getSetting('mapAutoNorthUpRangeIndex');
        this.airplanePositionChangedHandler = this.onAirplanePositionChanged.bind(this);
        this.airplaneOnGroundChangedHandler = this.onAirplaneOnGroundChanged.bind(this);
        this.airplaneRotationChangedHandler = this.onAirplaneRotationChanged.bind(this);
        this.pointerPositionChangedHandler = this.onPointerPositionChanged.bind(this);
        this.pointerTargetChangedHandler = this.onPointerTargetChanged.bind(this);
        this.pointerBoundsChangedHandler = this.onPointerBoundsChanged.bind(this);
        this.areAirplanePositionListenersActive = false;
        this.currentAirplaneRotationSub = null;
        this.deadZone.set(deadZone);
    }
    /**
     * Executes this controller's first-run initialization code.
     */
    init() {
        this.mapModel.getModule('range').nominalRanges.set(this.mapRanges);
        this.updateRangeFromIndex();
        this.mapProjection.addChangeListener(this.onMapProjectionChanged.bind(this));
        this.initSettingsListeners();
        this.initModuleListeners();
        this.initState();
        this.scheduleProjectionUpdate();
    }
    /**
     * Initializes settings listeners.
     */
    initSettingsListeners() {
        this.rangeSettingManager.whenSettingChanged(this.rangeSettingName).handle(this.onRangeSettingChanged.bind(this));
        this.settingManager.whenSettingChanged('mapOrientation').handle(this.onOrientationSettingChanged.bind(this));
        this.settingManager.whenSettingChanged('mapAutoNorthUpActive').handle(this.onAutoNorthUpSettingChanged.bind(this));
        this.settingManager.whenSettingChanged('mapAutoNorthUpRangeIndex').handle(this.onAutoNorthUpSettingChanged.bind(this));
    }
    /**
     * Initializes module listeners.
     */
    initModuleListeners() {
        this.orientationModule.orientation.sub(this.onOrientationChanged.bind(this), true);
        this.pointerModule.isActive.sub(this.onPointerActiveChanged.bind(this), true);
    }
    /**
     * Initializes this controller's state.
     */
    initState() {
        this.updateTargetFromPPos();
        this.updateTargetOffset();
    }
    /**
     * Sets the size of this controller's dead zone. The dead zone is the area around the edges of the map excluded in
     * range calculations.
     * @param deadZone The new dead zone, expressed as [left, top, right, bottom] in pixels.
     */
    setDeadZone(deadZone) {
        if (this.deadZone.every((value, index) => value === deadZone[index])) {
            return;
        }
        this.deadZone.set(deadZone);
        this.onDeadZoneChanged();
    }
    /**
     * This method is called when the size of the dead zone changes.
     */
    onDeadZoneChanged() {
        this.updateRangeFromIndex();
        this.updateTargetOffset();
        this.scheduleProjectionUpdate();
    }
    /**
     * Updates the range index.
     */
    updateRangeIndex() {
        const newIndex = Utils.Clamp(this.rangeSetting.value, 0, this.mapRanges.length - 1);
        if (newIndex !== this.currentMapRangeIndex) {
            this.currentMapRangeIndex = newIndex;
            if (this.autoNorthUpActiveSetting.value) {
                this.updateOrientation();
            }
            this.updateRangeFromIndex();
            this.scheduleProjectionUpdate();
        }
    }
    /**
     * Updates the current range from the current range index.
     */
    updateRangeFromIndex() {
        const nominalRange = this.mapRanges[this.currentMapRangeIndex];
        this.currentMapParameters.range = this.convertToTrueRange(nominalRange);
    }
    /**
     * Updates the map target based on the airplane's present position.
     */
    updateTargetFromPPos() {
        const ppos = this.mapModel.getModule('ownAirplaneProps').position.get();
        this.currentMapParameters.target.set(ppos);
    }
    /**
     * Updates the target offset.
     */
    updateTargetOffset() {
        this.currentMapParameters.targetProjectedOffset.set(this.getDesiredTargetOffset());
    }
    /**
     * Updates the map orientation.
     */
    updateOrientation() {
        const orientationSettingMode = this.orientationSetting.value;
        let orientation;
        if (orientationSettingMode === MapOrientationSettingMode.NorthUp
            || (this.autoNorthUpActiveSetting.value && this.currentMapRangeIndex > this.autoNorthUpRangeIndexSetting.value)) {
            orientation = MapOrientation.NorthUp;
        }
        else if (orientationSettingMode === MapOrientationSettingMode.TrackUp && !this.airplanePropsModule.isOnGround.get()) {
            orientation = MapOrientation.TrackUp;
        }
        else {
            orientation = MapOrientation.HeadingUp;
        }
        this.orientationModule.orientation.set(orientation);
    }
    /**
     * Responds to map projection changes.
     * @param mapProjection The map projection that changed.
     * @param changeFlags The types of changes made to the projection.
     */
    onMapProjectionChanged(mapProjection, changeFlags) {
        if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize)) {
            this.onProjectedSizeChanged();
        }
    }
    /**
     * Responds to projected map window size changes.
     */
    onProjectedSizeChanged() {
        this.updateRangeFromIndex();
        this.updateTargetOffset();
        this.scheduleProjectionUpdate();
    }
    /**
     * Responds to range setting changes.
     */
    onRangeSettingChanged() {
        this.updateRangeIndex();
    }
    /**
     * Responds to orientation setting changes.
     */
    onOrientationSettingChanged() {
        this.updateOrientation();
    }
    /**
     * Responds to auto north up setting changes.
     */
    onAutoNorthUpSettingChanged() {
        this.updateOrientation();
    }
    /**
     * Responds to airplane position changes.
     */
    onAirplanePositionChanged() {
        this.updateTargetFromPPos();
        this.scheduleProjectionUpdate();
    }
    /**
     * Responds to airplane rotation changes.
     * @param angle The airplane rotation angle, in degrees.
     */
    onAirplaneRotationChanged(angle) {
        this.currentMapParameters.rotation = -angle * Avionics.Utils.DEG2RAD;
        this.scheduleProjectionUpdate();
    }
    /**
     * Responds to when the airplane is on the ground changes.
     */
    onAirplaneOnGroundChanged() {
        this.updateOrientation();
    }
    /**
     * Responds to map orientation changes.
     * @param orientation The map orientation.
     */
    onOrientationChanged(orientation) {
        if (orientation === MapOrientation.NorthUp) {
            this.currentMapParameters.rotation = 0;
        }
        this.updateAirplaneRotationListeners();
        this.updateRangeFromIndex();
        this.updateTargetOffset();
        this.scheduleProjectionUpdate();
    }
    /**
     * Responds to map pointer activation changes.
     * @param isActive Whether the map pointer is active.
     */
    onPointerActiveChanged(isActive) {
        this.updateAirplanePositionListeners();
        this.updateAirplaneRotationListeners();
        this.updatePointerListeners();
        this.scheduleProjectionUpdate();
        if (isActive) {
            this.onPointerActivated();
        }
        else {
            this.onPointerDeactivated();
        }
    }
    /**
     * Responds to map pointer activation.
     */
    onPointerActivated() {
        // noop
    }
    /**
     * Responds to map pointer deactivation.
     */
    onPointerDeactivated() {
        // noop
    }
    /**
     * Responds to map pointer position changes.
     */
    onPointerPositionChanged() {
        this.schedulePointerScrollUpdate();
    }
    /**
     * Responds to map pointer desired target changes.
     * @param target The desired target.
     */
    onPointerTargetChanged(target) {
        this.currentMapParameters.target.set(target);
        this.scheduleProjectionUpdate();
    }
    /**
     * Responds to map pointer bounds changes.
     */
    onPointerBoundsChanged() {
        const position = this.pointerModule.position.get();
        const bounds = this.pointerBounds.get();
        const clampedPositionX = Utils.Clamp(position[0], bounds[0], bounds[2]);
        const clampedPositionY = Utils.Clamp(position[1], bounds[1], bounds[3]);
        this.pointerModule.position.set(clampedPositionX, clampedPositionY);
    }
    /**
     * Updates listeners for airplane position and on ground status.
     */
    updateAirplanePositionListeners() {
        this.setAirplanePositionListenersActive(!this.pointerModule.isActive.get());
    }
    /**
     * Activates or deactivates airplane position listeners.
     * @param value Whether to activate airplane position listeners.
     */
    setAirplanePositionListenersActive(value) {
        if (value === this.areAirplanePositionListenersActive) {
            return;
        }
        if (value) {
            this.airplanePropsModule.position.sub(this.airplanePositionChangedHandler, true);
            this.airplanePropsModule.isOnGround.sub(this.airplaneOnGroundChangedHandler, true);
        }
        else {
            this.airplanePropsModule.position.unsub(this.airplanePositionChangedHandler);
            this.airplanePropsModule.isOnGround.unsub(this.airplaneOnGroundChangedHandler);
        }
        this.areAirplanePositionListenersActive = value;
    }
    /**
     * Updates listeners for airplane heading and ground track.
     */
    updateAirplaneRotationListeners() {
        var _a;
        if (this.currentAirplaneRotationSub) {
            this.currentAirplaneRotationSub.unsub(this.airplaneRotationChangedHandler);
            this.currentAirplaneRotationSub = null;
        }
        if (!this.pointerModule.isActive.get()) {
            const orientation = this.orientationModule.orientation.get();
            switch (orientation) {
                case MapOrientation.TrackUp:
                    this.currentAirplaneRotationSub = this.airplanePropsModule.trackTrue;
                    break;
                case MapOrientation.HeadingUp:
                    this.currentAirplaneRotationSub = this.airplanePropsModule.hdgTrue;
                    break;
            }
            (_a = this.currentAirplaneRotationSub) === null || _a === void 0 ? void 0 : _a.sub(this.airplaneRotationChangedHandler, true);
        }
    }
    /**
     * Updates the pointer position listener.
     */
    updatePointerListeners() {
        if (this.pointerModule.isActive.get()) {
            this.pointerBounds.sub(this.pointerBoundsChangedHandler);
            this.pointerModule.position.sub(this.pointerPositionChangedHandler);
            this.pointerModule.target.sub(this.pointerTargetChangedHandler, true);
        }
        else {
            this.pointerBounds.unsub(this.pointerBoundsChangedHandler);
            this.pointerModule.position.unsub(this.pointerPositionChangedHandler);
            this.pointerModule.target.unsub(this.pointerTargetChangedHandler);
        }
    }
    /**
     * Schedules an update to the map projection.
     */
    scheduleProjectionUpdate() {
        this.needUpdateProjection = true;
    }
    /**
     * Schedules an update to scrolling due to the pointer.
     */
    schedulePointerScrollUpdate() {
        this.needUpdatePointerScroll = true;
    }
    /**
     * Updates this controller.
     */
    update() {
        this.updateModules();
        this.updatePointerScroll();
        this.updateMapProjection();
    }
    /**
     * Updates map model modules.
     */
    updateModules() {
        this.mapModel.getModule('range').setNominalRangeIndex(this.currentMapRangeIndex);
    }
    /**
     * Updates the map projection with the latest range, target, and rotation values.
     */
    updateMapProjection() {
        if (!this.needUpdateProjection) {
            return;
        }
        this.mapProjection.set(this.currentMapParameters);
        this.needUpdateProjection = false;
    }
    /**
     * Updates scrolling due to the pointer.
     */
    updatePointerScroll() {
        if (!this.needUpdatePointerScroll) {
            return;
        }
        const position = this.pointerModule.position.get();
        const bounds = this.pointerBounds.get();
        const clampedPositionX = Utils.Clamp(position[0], bounds[0], bounds[2]);
        const clampedPositionY = Utils.Clamp(position[1], bounds[1], bounds[3]);
        const scrollDeltaX = position[0] - clampedPositionX;
        const scrollDeltaY = position[1] - clampedPositionY;
        if (scrollDeltaX === 0 && scrollDeltaY === 0) {
            return;
        }
        this.pointerModule.position.set(clampedPositionX, clampedPositionY);
        const newTargetProjected = Vec2Math.add(this.mapProjection.getTargetProjected(), Vec2Math.set(scrollDeltaX, scrollDeltaY, NavMapRangeTargetRotationController.vec2Cache[0]), NavMapRangeTargetRotationController.vec2Cache[0]);
        this.mapProjection.invert(newTargetProjected, this.currentMapParameters.target);
        this.scheduleProjectionUpdate();
        this.needUpdatePointerScroll = false;
    }
}
NavMapRangeTargetRotationController.DEFAULT_MAP_RANGES = MapRangeSettings.DEFAULT_RANGES;
NavMapRangeTargetRotationController.DEFAULT_MAP_RANGE_INDEX = 11;
NavMapRangeTargetRotationController.vec2Cache = [new Float64Array(2)];
