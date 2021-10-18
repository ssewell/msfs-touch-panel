import { BitFlags, FSComponent, GeoPoint, UnitType, Vec2Math, VecNSubject } from 'msfssdk';
import { MapComponent, MapCullableTextLabelManager, MapCullableTextLayer, MapOwnAirplaneLayer, MapProjectionChangeType } from 'msfssdk/components/map';
import { MapBingLayer } from '../../Map/Layers/MapBingLayer';
import { MapMiniCompassLayer } from '../../Map/Layers/MapMiniCompassLayer';
import { MapRangeRingLayer } from '../../Map/Layers/MapRangeRingLayer';
import { MapWaypointHighlightLayer } from '../../Map/Layers/MapWaypointHighlightLayer';
import { MapWaypointsLayer } from '../../Map/Layers/MapWaypointsLayer';
import { MapWaypointRenderer } from '../../Map/MapWaypointRenderer';
import { MapWaypointStyles } from '../../Map/MapWaypointStyles';
import { MapOrientationIndicator } from '../../Map/Indicators/MapOrientationIndicator';
import { MapTerrainController } from '../../Map/Controllers/MapTerrainController';
import { MapUserSettings } from '../../Map/MapUserSettings';
import { MapWaypointsVisController } from '../../Map/Controllers/MapWaypointsVisController';
import { MapOrientation } from '../../Map/Modules/MapOrientationModule';
import { MapCrosshairController } from '../../Map/Controllers/MapCrosshairController';
import { MapCrosshairLayer } from '../../Map/Layers/MapCrosshairLayer';
import { MapPointerLayer } from '../../Map/Layers/MapPointerLayer';
import { MapPointerInfoLayer, MapPointerInfoLayerSize } from '../../Map/Layers/MapPointerInfoLayer';
/**
 * A G1000 waypoint info map component.
 */
export class WaypointMapComponent extends MapComponent {
    /** @inheritdoc */
    constructor(props) {
        super(props);
        this.rootRef = FSComponent.createRef();
        this.bingLayerRef = FSComponent.createRef();
        this.waypointsLayerRef = FSComponent.createRef();
        this.waypointHighlightLayerRef = FSComponent.createRef();
        this.textLayerRef = FSComponent.createRef();
        this.rangeRingLayerRef = FSComponent.createRef();
        this.crosshairLayerRef = FSComponent.createRef();
        this.ownAirplaneLayerRef = FSComponent.createRef();
        this.miniCompassLayerRef = FSComponent.createRef();
        this.pointerLayerRef = FSComponent.createRef();
        this.pointerInfoLayerRef = FSComponent.createRef();
        this.pointerBoundsSub = VecNSubject.createFromVector(new Float64Array([0, 0, this.props.projectedWidth, this.props.projectedHeight]));
        this.textManager = new MapCullableTextLabelManager();
        this.waypointRenderer = new MapWaypointRenderer(this.textManager);
        this.settingManager = MapUserSettings.getMfdManager(this.props.bus);
        this.terrainColorController = new MapTerrainController(this.props.model, this.settingManager, false);
        this.waypointsVisController = new MapWaypointsVisController(this.props.model, this.settingManager);
        this.crosshairController = new MapCrosshairController(this.props.model);
        this.updatePointerBounds();
        this.rangeTargetRotationController = new WaypointMapRangeTargetRotationController(this.props.model, this.mapProjection, WaypointMapRangeTargetRotationController.DEFAULT_MAP_RANGES, this.props.rangeIndex, this.props.waypoint, this.pointerBoundsSub);
    }
    /** @inheritdoc */
    onAfterRender() {
        super.onAfterRender();
        this.setRootSize(this.mapProjection.getProjectedSize());
        this.initEventBusHandlers();
        this.initWaypointHandler();
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
     * Initializes the focused waypoint handler.
     */
    initWaypointHandler() {
        this.props.waypoint.sub(this.onWaypointChanged.bind(this), true);
    }
    /**
     * Initializes model controllers.
     */
    initControllers() {
        this.terrainColorController.init();
        this.waypointsVisController.init();
        this.crosshairController.init();
    }
    /**
     * Initializes this map's layers.
     */
    initLayers() {
        this.attachLayer(this.bingLayerRef.instance);
        this.attachLayer(this.waypointsLayerRef.instance);
        this.attachLayer(this.waypointHighlightLayerRef.instance);
        this.attachLayer(this.textLayerRef.instance);
        this.attachLayer(this.rangeRingLayerRef.instance);
        this.attachLayer(this.crosshairLayerRef.instance);
        this.attachLayer(this.ownAirplaneLayerRef.instance);
        this.attachLayer(this.miniCompassLayerRef.instance);
        this.attachLayer(this.pointerLayerRef.instance);
        this.attachLayer(this.pointerInfoLayerRef.instance);
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
        const width = size[0];
        const height = size[1];
        this.pointerBoundsSub.set(width * 0.1, height * 0.1, width * 0.6, height * 0.9);
    }
    /**
     * A callback which is called when the focused waypoint changes.
     * @param waypoint The new focused waypoint.
     */
    onWaypointChanged(waypoint) {
        this.props.model.getModule('waypointHighlight').waypoint.set(waypoint);
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
        return (FSComponent.buildComponent("div", { ref: this.rootRef, class: `waypoint-map ${(_a = this.props.class) !== null && _a !== void 0 ? _a : ''}` },
            FSComponent.buildComponent(MapBingLayer, { ref: this.bingLayerRef, model: this.props.model, mapProjection: this.mapProjection, bingId: this.props.id }),
            FSComponent.buildComponent(MapWaypointsLayer, { ref: this.waypointsLayerRef, model: this.props.model, mapProjection: this.mapProjection, bus: this.props.bus, waypointRenderer: this.waypointRenderer, textManager: this.textManager, styles: this.getWaypointsLayerStyles() }),
            FSComponent.buildComponent(MapWaypointHighlightLayer, { ref: this.waypointHighlightLayerRef, model: this.props.model, mapProjection: this.mapProjection, waypointRenderer: this.waypointRenderer, textManager: this.textManager, styles: this.getWaypointHighlightLayerStyles() }),
            FSComponent.buildComponent(MapCullableTextLayer, { ref: this.textLayerRef, model: this.props.model, mapProjection: this.mapProjection, manager: this.textManager }),
            FSComponent.buildComponent(MapRangeRingLayer, { ref: this.rangeRingLayerRef, model: this.props.model, mapProjection: this.mapProjection, showLabel: true, strokeWidth: 2, strokeStyle: 'white' }),
            FSComponent.buildComponent(MapCrosshairLayer, { ref: this.crosshairLayerRef, model: this.props.model, mapProjection: this.mapProjection }),
            FSComponent.buildComponent(MapOwnAirplaneLayer, { ref: this.ownAirplaneLayerRef, model: this.props.model, mapProjection: this.mapProjection, imageFilePath: this.props.ownAirplaneLayerProps.imageFilePath, iconSize: this.props.ownAirplaneLayerProps.iconSize, iconAnchor: this.props.ownAirplaneLayerProps.iconAnchor }),
            FSComponent.buildComponent(MapMiniCompassLayer, { ref: this.miniCompassLayerRef, class: 'minicompass-layer', model: this.props.model, mapProjection: this.mapProjection, imgSrc: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/map_mini_compass.png' }),
            FSComponent.buildComponent(MapPointerInfoLayer, { ref: this.pointerInfoLayerRef, model: this.props.model, mapProjection: this.mapProjection, size: MapPointerInfoLayerSize.Medium }),
            FSComponent.buildComponent(MapOrientationIndicator, { orientation: this.props.model.getModule('orientation').orientation, text: {
                    [MapOrientation.NorthUp]: 'NORTH UP',
                    [MapOrientation.TrackUp]: 'TRK UP',
                    [MapOrientation.HeadingUp]: 'HDG UP'
                }, isVisible: this.props.model.getModule('pointer').isActive.map(isActive => !isActive) }),
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
     * Gets styles for the waypoint highlight layer.
     * @returns styles for the waypoint highlight layer.
     */
    getWaypointHighlightLayerStyles() {
        return MapWaypointStyles.getHighlightStyles(1, 20);
    }
}
/**
 * A controller for handling map range, target, and rotation changes.
 */
export class WaypointMapRangeTargetRotationController {
    /**
     * Creates an instance of a MapRangeController.
     * @param mapModel The map model.
     * @param mapProjection The map projection.
     * @param mapRanges An array of valid map ranges.
     * @param rangeIndex A subscribable which provides a range index for this controller to bind.
     * @param waypoint A subscribable which provides a waypoint for this controller to bind as the focused waypoint.
     * @param pointerBounds A subscribable which provides the bounds of the area accessible to the map pointer. The
     * bounds should be expressed as `[left, top, right, bottom]` in pixels.
     */
    constructor(mapModel, mapProjection, mapRanges, rangeIndex, waypoint, pointerBounds) {
        this.mapModel = mapModel;
        this.mapProjection = mapProjection;
        this.mapRanges = mapRanges;
        this.rangeIndex = rangeIndex;
        this.waypoint = waypoint;
        this.pointerBounds = pointerBounds;
        this.needUpdateProjection = false;
        this.needUpdatePointerScroll = false;
        this.currentMapParameters = {
            range: 0,
            target: new GeoPoint(0, 0),
            targetProjectedOffset: new Float64Array(2),
            rotation: 0
        };
        this.airplanePropsModule = this.mapModel.getModule('ownAirplaneProps');
        this.pointerModule = this.mapModel.getModule('pointer');
        this.airplanePositionChangedHandler = this.onAirplanePositionChanged.bind(this);
        this.pointerPositionChangedHandler = this.onPointerPositionChanged.bind(this);
        this.pointerTargetChangedHandler = this.onPointerTargetChanged.bind(this);
        this.pointerBoundsChangedHandler = this.onPointerBoundsChanged.bind(this);
        this.areAirplanePositionListenersActive = false;
    }
    /**
     * Executes this controller's first-run initialization code.
     */
    init() {
        this.mapModel.getModule('range').nominalRanges.set(this.mapRanges);
        this.rangeIndex.sub(this.onRangeIndexChanged.bind(this));
        this.mapProjection.addChangeListener(this.onMapProjectionChanged.bind(this));
        this.initModuleListeners();
        this.initState();
        this.scheduleProjectionUpdate();
    }
    /**
     * Initializes module listeners.
     */
    initModuleListeners() {
        this.waypoint.sub(this.onWaypointChanged.bind(this), true);
        this.mapModel.getModule('ownAirplaneProps').position.sub(this.onAirplanePositionChanged.bind(this));
        this.pointerModule.isActive.sub(this.onPointerActiveChanged.bind(this), true);
    }
    /**
     * Initializes this controller's state.
     */
    initState() {
        this.updateRangeFromIndex();
        this.updateTargetFromPPos();
    }
    /**
     * Updates the current range from the current range index.
     */
    updateRangeFromIndex() {
        const nominalRange = this.mapRanges[Utils.Clamp(this.rangeIndex.get(), 0, this.mapRanges.length - 1)];
        this.currentMapParameters.range = this.convertToTrueRange(nominalRange);
    }
    /**
     * Converts a nominal range to a true map range.
     * @param nominalRange The nominal range to convert.
     * @returns the true map range for the given nominal range, in great-arc radians.
     */
    convertToTrueRange(nominalRange) {
        return nominalRange.asUnit(UnitType.GA_RADIAN) * 4;
    }
    /**
     * Updates the map target based on the airplane's present position.
     */
    updateTargetFromPPos() {
        this.currentMapParameters.target.set(this.airplanePropsModule.position.get());
    }
    /**
     * Updates the map target based on the airplane's present position.
     */
    updateTargetFromWaypoint() {
        const waypoint = this.waypoint.get();
        if (waypoint) {
            this.currentMapParameters.target.set(waypoint.location);
            this.pointerModule.position.set(this.mapProjection.getTargetProjected());
        }
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
        this.scheduleProjectionUpdate();
    }
    /**
     * Responds to range index changes.
     */
    onRangeIndexChanged() {
        this.updateRangeFromIndex();
        this.scheduleProjectionUpdate();
    }
    /**
     * Responds to focused waypoint changes.
     */
    onWaypointChanged() {
        this.updateAirplanePositionListeners();
        this.updateTargetFromWaypoint();
        this.scheduleProjectionUpdate();
    }
    /**
     * Responds to airplane position changes.
     */
    onAirplanePositionChanged() {
        this.updateTargetFromPPos();
        this.scheduleProjectionUpdate();
    }
    /**
     * Responds to map pointer activation changes.
     * @param isActive Whether the map pointer is active.
     */
    onPointerActiveChanged(isActive) {
        this.updateAirplanePositionListeners();
        this.updatePointerListeners();
        if (!isActive) {
            this.updateTargetFromWaypoint();
        }
        this.scheduleProjectionUpdate();
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
        this.setAirplanePositionListenersActive(!this.waypoint.get() && !this.pointerModule.isActive.get());
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
        }
        else {
            this.airplanePropsModule.position.unsub(this.airplanePositionChangedHandler);
        }
        this.areAirplanePositionListenersActive = value;
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
     * Schedules an update.
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
        this.mapModel.getModule('range').setNominalRangeIndex(this.rangeIndex.get());
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
        const newTargetProjected = Vec2Math.add(this.mapProjection.getTargetProjected(), Vec2Math.set(scrollDeltaX, scrollDeltaY, WaypointMapRangeTargetRotationController.vec2Cache[0]), WaypointMapRangeTargetRotationController.vec2Cache[0]);
        this.mapProjection.invert(newTargetProjected, this.currentMapParameters.target);
        this.scheduleProjectionUpdate();
        this.needUpdatePointerScroll = false;
    }
}
WaypointMapRangeTargetRotationController.DEFAULT_MAP_RANGES = [
    ...[
        250,
        400,
        500,
        750,
        1000,
        1500,
        2500
    ].map(value => UnitType.FOOT.createNumber(value)),
    ...[
        0.5,
        0.75,
        1,
        1.5,
        2.5,
        4,
        5,
        7.5,
        10,
        15,
        25,
        40,
        50,
        75,
        100,
        150,
        250,
        400,
        500,
        750,
        1000
    ].map(value => UnitType.NMILE.createNumber(value))
];
WaypointMapRangeTargetRotationController.DEFAULT_MAP_RANGE_INDEX = 14;
WaypointMapRangeTargetRotationController.vec2Cache = [new Float64Array(2)];
