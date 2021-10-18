import { BitFlags, FSComponent, GeoPoint, Subject, UnitType } from 'msfssdk';
import { MapComponent, MapCullableTextLabelManager, MapCullableTextLayer, MapOwnAirplaneLayer, MapProjectionChangeType } from 'msfssdk/components/map';
import { MapOrientationIndicator } from '../../Map/Indicators/MapOrientationIndicator';
import { MapFlightPlanLayer } from '../../Map/Layers/MapFlightPlanLayer';
import { MapActiveFlightPlanDataProvider } from '../../Map/MapActiveFlightPlanDataProvider';
import { MapMiniCompassLayer } from '../../Map/Layers/MapMiniCompassLayer';
import { MapTrafficIntruderLayer } from '../../Map/Layers/MapTrafficIntruderLayer';
import { MapWaypointRenderer } from '../../Map/MapWaypointRenderer';
import { MapWaypointStyles } from '../../Map/MapWaypointStyles';
import { MapOrientation } from '../../Map/Modules/MapOrientationModule';
import { MapRangeSettings } from '../../Map/MapRangeSettings';
import { MapTrafficController } from '../../Map/Controllers/MapTrafficController';
import { TrafficUserSettings } from '../../Traffic/TrafficUserSettings';
import { TrafficMapRangeLayer } from './TrafficMapRangeLayer';
import { TrafficMapOperatingModeIndicator } from './TrafficMapOperatingModeIndicator';
import { TCASOperatingMode } from 'msfssdk/traffic';
import { TrafficMapAltitudeModeIndicator } from './TrafficMapAltitudeModeIndicator';
import { MapTrafficAltitudeRestrictionMode } from '../../Map/Modules/MapTrafficModule';
import { TrafficMapStandbyBannerIndicator } from './TrafficMapStandbyBannerIndicator';
import './TrafficMapComponent.css';
/**
 * A traffic map component.
 */
export class TrafficMapComponent extends MapComponent {
    /** @inheritdoc */
    constructor(props) {
        super(props);
        this.rootRef = FSComponent.createRef();
        this.flightPlanLayerRef = FSComponent.createRef();
        this.textLayerRef = FSComponent.createRef();
        this.rangeLayerRef = FSComponent.createRef();
        this.intruderLayerRef = FSComponent.createRef();
        this.ownAirplaneLayerRef = FSComponent.createRef();
        this.miniCompassLayerRef = FSComponent.createRef();
        this.textManager = new MapCullableTextLabelManager();
        this.waypointRenderer = new MapWaypointRenderer(this.textManager);
        this.trafficSettingManager = TrafficUserSettings.getManager(this.props.bus);
        this.rangeSettingManager = MapRangeSettings.getManager(this.props.bus);
        this.trafficController = new MapTrafficController(this.props.model, TrafficUserSettings.getManager(this.props.bus));
        this.rangeTargetRotationController = this.createRangeTargetRotationController();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
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
        this.trafficController.init();
    }
    /**
     * Initializes this map's layers.
     */
    initLayers() {
        this.attachLayer(this.flightPlanLayerRef.instance);
        this.attachLayer(this.textLayerRef.instance);
        this.attachLayer(this.rangeLayerRef.instance);
        this.attachLayer(this.intruderLayerRef.instance);
        this.attachLayer(this.ownAirplaneLayerRef.instance);
        this.attachLayer(this.miniCompassLayerRef.instance);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onProjectedSizeChanged() {
        this.setRootSize(this.mapProjection.getProjectedSize());
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
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        var _a;
        return (FSComponent.buildComponent("div", { ref: this.rootRef, class: `traffic-map ${(_a = this.props.class) !== null && _a !== void 0 ? _a : ''}` },
            FSComponent.buildComponent(MapFlightPlanLayer, { ref: this.flightPlanLayerRef, model: this.props.model, mapProjection: this.mapProjection, bus: this.props.bus, dataProvider: new MapActiveFlightPlanDataProvider(this.props.bus, this.props.flightPlanner), drawEntirePlan: Subject.create(false), waypointRenderer: this.waypointRenderer, textManager: this.textManager, inactiveWaypointStyles: this.getFlightPlanLayerInactiveWaypointsStyles(), activeWaypointStyles: this.getFlightPlanLayerActiveWaypointsStyles() }),
            FSComponent.buildComponent(MapCullableTextLayer, { ref: this.textLayerRef, model: this.props.model, mapProjection: this.mapProjection, manager: this.textManager }),
            FSComponent.buildComponent(TrafficMapRangeLayer, { ref: this.rangeLayerRef, model: this.props.model, mapProjection: this.mapProjection, strokeWidth: 2, strokeColor: 'white', strokeDash: [4, 4], majorTickSize: 10, minorTickSize: 5 }),
            FSComponent.buildComponent(MapTrafficIntruderLayer, { ref: this.intruderLayerRef, model: this.props.model, mapProjection: this.mapProjection, bus: this.props.bus, fontSize: this.props.trafficIntruderLayerProps.fontSize, iconSize: this.props.trafficIntruderLayerProps.iconSize, useOuterRangeMaxScale: true }),
            FSComponent.buildComponent(MapOwnAirplaneLayer, { ref: this.ownAirplaneLayerRef, model: this.props.model, mapProjection: this.mapProjection, imageFilePath: this.props.ownAirplaneLayerProps.imageFilePath, iconSize: this.props.ownAirplaneLayerProps.iconSize, iconAnchor: this.props.ownAirplaneLayerProps.iconAnchor }),
            FSComponent.buildComponent(MapMiniCompassLayer, { ref: this.miniCompassLayerRef, class: 'minicompass-layer', model: this.props.model, mapProjection: this.mapProjection, imgSrc: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/map_mini_compass.png' }),
            FSComponent.buildComponent(MapOrientationIndicator, { orientation: this.props.model.getModule('orientation').orientation, text: {
                    [MapOrientation.NorthUp]: 'NORTH UP',
                    [MapOrientation.TrackUp]: 'TRK UP',
                    [MapOrientation.HeadingUp]: 'HDG UP'
                }, isVisible: Subject.create(true) }),
            this.renderIndicatorGroups(),
            FSComponent.buildComponent(TrafficMapStandbyBannerIndicator, { operatingMode: this.props.model.getModule('traffic').operatingMode, isOnGround: this.props.model.getModule('ownAirplaneProps').isOnGround })));
    }
    /**
     * Gets inactive waypoint styles for the flight plan layer.
     * @returns Inactive waypoint styles for the flight plan layer.
     */
    getFlightPlanLayerInactiveWaypointsStyles() {
        return MapWaypointStyles.getFlightPlanStyles(false, 1, 20);
    }
    /**
     * Gets active waypoint styles for the flight plan layer.
     * @returns Active waypoint styles for the flight plan layer.
     */
    getFlightPlanLayerActiveWaypointsStyles() {
        return MapWaypointStyles.getFlightPlanStyles(true, 2, 21);
    }
    /**
     * Renders this map's indicator groups.
     * @returns An array of this map's indicator groups.
     */
    renderIndicatorGroups() {
        return [
            this.renderTopRightIndicatorGroup()
        ];
    }
    /**
     * Renders the top-right indicator group.
     * @returns The top-right indicator group.
     */
    renderTopRightIndicatorGroup() {
        return (FSComponent.buildComponent("div", { class: 'trafficmap-indicators-top-right' }, this.renderTopRightIndicators()));
    }
    /**
     * Renders indicators in the top-right indicator group.
     * @returns Indicators in the top-right indicator group.
     */
    renderTopRightIndicators() {
        return [
            this.renderOperatingModeIndicator(),
            this.renderAltitudeModeIndicator()
        ];
    }
    /**
     * Renders the traffic system operating mode indicator.
     * @returns The traffic system operating mode indicator.
     */
    renderOperatingModeIndicator() {
        const trafficModule = this.props.model.getModule('traffic');
        return (FSComponent.buildComponent(TrafficMapOperatingModeIndicator, { operatingMode: trafficModule.operatingMode, text: {
                [TCASOperatingMode.Standby]: 'TAS: STANDBY',
                [TCASOperatingMode.TAOnly]: 'TAS: OPERATING',
                [TCASOperatingMode.TA_RA]: 'TAS: OPERATING'
            } }));
    }
    /**
     * Renders the traffic altitude restriction mode indicator.
     * @returns The traffic altitude restriction mode indicator.
     */
    renderAltitudeModeIndicator() {
        const trafficModule = this.props.model.getModule('traffic');
        return (FSComponent.buildComponent(TrafficMapAltitudeModeIndicator, { altitudeRestrictionMode: trafficModule.altitudeRestrictionMode, text: {
                [MapTrafficAltitudeRestrictionMode.Above]: 'ABOVE',
                [MapTrafficAltitudeRestrictionMode.Below]: 'BELOW',
                [MapTrafficAltitudeRestrictionMode.Normal]: 'NORMAL',
                [MapTrafficAltitudeRestrictionMode.Unrestricted]: 'UNRESTRICTED'
            } }));
    }
}
TrafficMapComponent.tempGeoPoint_1 = new GeoPoint(0, 0);
/**
 * A controller for handling map range, target, and rotation changes.
 */
export class TrafficMapRangeTargetRotationController {
    /**
     * Creates an instance of a MapRangeController.
     * @param mapModel The map model.
     * @param mapProjection The map projection.
     * @param mapRanges An array of valid map ranges.
     * @param rangeSettingManager This controller's map range settings manager.
     * @param rangeSettingName The name of this controller's map range setting.
     */
    constructor(mapModel, mapProjection, mapRanges, rangeSettingManager, rangeSettingName) {
        this.mapModel = mapModel;
        this.mapProjection = mapProjection;
        this.mapRanges = mapRanges;
        this.rangeSettingManager = rangeSettingManager;
        this.rangeSettingName = rangeSettingName;
        this.innerRangeIndexMap = this.mapRanges.map((range, index, array) => {
            while (--index >= 0) {
                if (array[index].compare(range) < 0) {
                    return index;
                }
            }
            return -1;
        });
        this.currentMapRangeIndex = TrafficMapRangeTargetRotationController.DEFAULT_MAP_RANGE_INDEX;
        this.needUpdate = false;
        this.currentMapParameters = {
            range: 0,
            target: new GeoPoint(0, 0),
            rotation: 0
        };
        this.rangeModule = this.mapModel.getModule('range');
        this.airplanePropsModule = this.mapModel.getModule('ownAirplaneProps');
        this.trafficModule = this.mapModel.getModule('traffic');
        this.rangeSetting = this.rangeSettingManager.getSetting(this.rangeSettingName);
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
        this.scheduleUpdate();
    }
    /**
     * Initializes settings listeners.
     */
    initSettingsListeners() {
        this.rangeSettingManager.whenSettingChanged(this.rangeSettingName).handle(this.onRangeSettingChanged.bind(this));
    }
    /**
     * Initializes module listeners.
     */
    initModuleListeners() {
        this.airplanePropsModule.position.sub(this.onAirplanePositionChanged.bind(this));
        this.airplanePropsModule.hdgTrue.sub(this.onAirplaneRotationChanged.bind(this));
    }
    /**
     * Initializes this controller's state.
     */
    initState() {
        this.updateTarget();
        this.updateRotation();
    }
    /**
     * Updates the range index.
     */
    updateRangeIndex() {
        const newIndex = Utils.Clamp(this.rangeSetting.value, 0, this.mapRanges.length - 1);
        if (newIndex !== this.currentMapRangeIndex) {
            this.currentMapRangeIndex = newIndex;
            this.updateRangeFromIndex();
            this.scheduleUpdate();
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
     * Updates the map target.
     */
    updateTarget() {
        const ppos = this.airplanePropsModule.position.get();
        this.currentMapParameters.target.set(ppos);
    }
    /**
     * Updates the map rotation.
     */
    updateRotation() {
        this.currentMapParameters.rotation = -this.airplanePropsModule.hdgTrue.get() * Avionics.Utils.DEG2RAD;
    }
    /**
     * A callback which is called when the map projection changes.
     * @param mapProjection The map projection that changed.
     * @param changeFlags The types of changes made to the projection.
     */
    onMapProjectionChanged(mapProjection, changeFlags) {
        if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize)) {
            this.onProjectedSizeChanged();
        }
    }
    /**
     * A callback which is called when the size of the projected map window changes.
     */
    onProjectedSizeChanged() {
        this.updateRangeFromIndex();
        this.scheduleUpdate();
    }
    /**
     * A callback which is called when the range setting changes.
     */
    onRangeSettingChanged() {
        this.updateRangeIndex();
    }
    /**
     * A callback which is called when the airplane's position changes.
     */
    onAirplanePositionChanged() {
        this.updateTarget();
        this.scheduleUpdate();
    }
    /**
     * A callback which is called when the airplane's heading changes.
     */
    onAirplaneRotationChanged() {
        this.updateRotation();
        this.scheduleUpdate();
    }
    /**
     * Schedules an update.
     */
    scheduleUpdate() {
        this.needUpdate = true;
    }
    /**
     * Updates this controller.
     */
    update() {
        if (!this.needUpdate) {
            return;
        }
        this.updateModules();
        this.updateMapProjection();
        this.needUpdate = false;
    }
    /**
     * Updates map model modules.
     */
    updateModules() {
        this.rangeModule.setNominalRangeIndex(this.currentMapRangeIndex);
        this.trafficModule.outerRangeIndex.set(this.currentMapRangeIndex);
        this.trafficModule.innerRangeIndex.set(this.innerRangeIndexMap[this.currentMapRangeIndex]);
    }
    /**
     * Updates the map projection with the latest range, target, and rotation values.
     */
    updateMapProjection() {
        this.mapProjection.set(this.currentMapParameters);
    }
}
TrafficMapRangeTargetRotationController.DEFAULT_RANGES = [
    ...[
        500,
        500,
        500,
        1000,
        1000,
        1000,
        2000,
        2000
    ].map(value => UnitType.FOOT.createNumber(value)),
    ...[
        1,
        1,
        2,
        2,
        6,
        6,
        12,
        12,
        24,
        24,
        40,
        40,
        40,
        40,
        40,
        40,
        40,
        40,
        40,
        40
    ].map(value => UnitType.NMILE.createNumber(value))
];
TrafficMapRangeTargetRotationController.DEFAULT_MAP_RANGE_INDEX = 11;
