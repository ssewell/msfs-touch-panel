import { FacilityType, ICAO } from 'msfssdk/navigation';
import { MapCullableLocationTextLabel, MapSyncedCanvasLayer } from 'msfssdk/components/map';
import { MapWaypointRenderRole } from '../MapWaypointRenderer';
import { AirportSize, AirportWaypoint, FacilityWaypoint } from '../../Navigation/Waypoint';
import { MapAirportIcon, MapBlankWaypointIcon, MapIntersectionIcon, MapNdbIcon, MapUserWaypointIcon, MapVorIcon, MapWaypointHighlightIcon } from '../MapWaypointIcon';
/**
 * The map layer showing highlighted waypoints.
 */
export class MapWaypointHighlightLayer extends MapSyncedCanvasLayer {
    /** @inheritdoc */
    constructor(props) {
        super(props);
        this.registeredWaypoint = null;
        this.iconFactory = new WaypointIconFactory({
            highlightRingRadiusBuffer: this.props.styles.highlightRingRadiusBuffer,
            highlightRingStrokeWidth: this.props.styles.highlightRingStrokeWidth,
            highlightRingStrokeColor: this.props.styles.highlightRingStrokeColor,
            highlightRingOutlineWidth: this.props.styles.highlightRingOutlineWidth,
            highlightRingOutlineColor: this.props.styles.highlightRingOutlineColor,
            highlightBgColor: this.props.styles.highlightBgColor,
            airportIconPriority: Object.assign({}, this.props.styles.airportIconPriority),
            vorIconPriority: this.props.styles.vorIconPriority,
            ndbIconPriority: this.props.styles.ndbIconPriority,
            intIconPriority: this.props.styles.intIconPriority,
            userIconPriority: this.props.styles.userIconPriority,
            airportIconSize: Object.assign({}, this.props.styles.airportIconSize),
            vorIconSize: this.props.styles.vorIconSize,
            ndbIconSize: this.props.styles.ndbIconSize,
            intIconSize: this.props.styles.intIconSize,
            userIconSize: this.props.styles.userIconSize
        });
        this.labelFactory = new WaypointLabelFactory({
            airportLabelPriority: Object.assign({}, this.props.styles.airportLabelPriority),
            vorLabelPriority: this.props.styles.vorLabelPriority,
            ndbLabelPriority: this.props.styles.ndbLabelPriority,
            intLabelPriority: this.props.styles.intLabelPriority,
            userLabelPriority: this.props.styles.userLabelPriority,
            airportLabelOptions: {
                [AirportSize.Large]: Object.assign({}, this.props.styles.airportLabelOptions[AirportSize.Large]),
                [AirportSize.Medium]: Object.assign({}, this.props.styles.airportLabelOptions[AirportSize.Medium]),
                [AirportSize.Small]: Object.assign({}, this.props.styles.airportLabelOptions[AirportSize.Small])
            },
            vorLabelOptions: Object.assign({}, this.props.styles.vorLabelOptions),
            ndbLabelOptions: Object.assign({}, this.props.styles.ndbLabelOptions),
            intLabelOptions: Object.assign({}, this.props.styles.intLabelOptions),
            userLabelOptions: Object.assign({}, this.props.styles.userLabelOptions),
        });
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAttached() {
        super.onAttached();
        this.isInit = false;
        this.initWaypointRenderer();
        this.initModuleListener();
        this.isInit = true;
    }
    /**
     * Initializes the waypoint renderer.
     */
    initWaypointRenderer() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.props.waypointRenderer.setCanvasContext(MapWaypointRenderRole.Highlight, this.display.context);
        this.props.waypointRenderer.setIconFactory(MapWaypointRenderRole.Highlight, this.iconFactory);
        this.props.waypointRenderer.setLabelFactory(MapWaypointRenderRole.Highlight, this.labelFactory);
    }
    /**
     * Initializes the waypoint highlight listener.
     */
    initModuleListener() {
        this.props.model.getModule('waypointHighlight').waypoint.sub(this.onWaypointChanged.bind(this), true);
    }
    /**
     * A callback which is called when the highlighted waypoint changes.
     * @param waypoint The new highlighted waypoint.
     */
    onWaypointChanged(waypoint) {
        this.registeredWaypoint && this.props.waypointRenderer.deregister(this.registeredWaypoint, MapWaypointRenderRole.Highlight, 'waypoint-highlight-layer');
        waypoint && this.props.waypointRenderer.register(waypoint, MapWaypointRenderRole.Highlight, 'waypoint-highlight-layer');
        this.registeredWaypoint = waypoint;
    }
}
/**
 * A waypoint icon factory.
 */
class WaypointIconFactory {
    /**
     * Constructor.
     * @param styles Icon styling options used by this factory.
     */
    constructor(styles) {
        this.styles = styles;
        this.cache = new Map();
        this.highlightStyles = {
            ringRadiusBuffer: styles.highlightRingRadiusBuffer,
            strokeWidth: styles.highlightRingStrokeWidth,
            strokeColor: styles.highlightRingStrokeColor,
            outlineWidth: styles.highlightRingOutlineWidth,
            outlineColor: styles.highlightRingOutlineColor,
            bgColor: styles.highlightBgColor
        };
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    getIcon(waypoint) {
        let existing = this.cache.get(waypoint.uid);
        if (!existing) {
            existing = this.createIcon(waypoint);
            this.cache.set(waypoint.uid, existing);
        }
        return existing;
    }
    /**
     * Creates a new icon for a waypoint.
     * @param waypoint The waypoint for which to create an icon.
     * @returns a waypoint icon.
     */
    createIcon(waypoint) {
        const baseIcon = this.createBaseIcon(waypoint);
        return baseIcon
            ? new MapWaypointHighlightIcon(baseIcon, baseIcon.priority, this.highlightStyles)
            : new MapBlankWaypointIcon(waypoint, 0);
    }
    /**
     * Creates a new base icon for a waypoint.
     * @param waypoint The waypoint for which to create a base icon.
     * @returns a waypoint base icon.
     */
    createBaseIcon(waypoint) {
        if (waypoint instanceof AirportWaypoint) {
            return new MapAirportIcon(waypoint, this.styles.airportIconPriority[waypoint.size], this.styles.airportIconSize[waypoint.size], this.styles.airportIconSize[waypoint.size]);
        }
        else if (waypoint instanceof FacilityWaypoint) {
            switch (ICAO.getFacilityType(waypoint.facility.icao)) {
                case FacilityType.VOR:
                    return new MapVorIcon(waypoint, this.styles.vorIconPriority, this.styles.vorIconSize, this.styles.vorIconSize);
                case FacilityType.NDB:
                    return new MapNdbIcon(waypoint, this.styles.ndbIconPriority, this.styles.ndbIconSize, this.styles.ndbIconSize);
                case FacilityType.Intersection:
                    return new MapIntersectionIcon(waypoint, this.styles.intIconPriority, this.styles.intIconSize, this.styles.intIconSize);
                case FacilityType.USR:
                    return new MapUserWaypointIcon(waypoint, this.styles.userIconPriority, this.styles.userIconSize, this.styles.userIconSize);
            }
        }
        return null;
    }
}
/**
 * A waypoint label factory.
 */
class WaypointLabelFactory {
    /**
     * Constructor.
     * @param styles Icon styling options used by this factory.
     */
    constructor(styles) {
        this.styles = styles;
        this.cache = new Map();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    getLabel(waypoint) {
        let existing = this.cache.get(waypoint.uid);
        if (!existing) {
            existing = this.createLabel(waypoint);
            this.cache.set(waypoint.uid, existing);
        }
        return existing;
    }
    /**
     * Creates a new icon for a waypoint.
     * @param waypoint The waypoint for which to create an icon.
     * @returns a waypoint icon.
     */
    createLabel(waypoint) {
        let text = '';
        let priority = 0;
        let options;
        if (waypoint instanceof FacilityWaypoint) {
            text = ICAO.getIdent(waypoint.facility.icao);
            switch (ICAO.getFacilityType(waypoint.facility.icao)) {
                case FacilityType.Airport:
                    priority = this.styles.airportLabelPriority[waypoint.size];
                    options = this.styles.airportLabelOptions[waypoint.size];
                    break;
                case FacilityType.VOR:
                    priority = this.styles.vorLabelPriority;
                    options = this.styles.vorLabelOptions;
                    break;
                case FacilityType.NDB:
                    priority = this.styles.ndbLabelPriority;
                    options = this.styles.ndbLabelOptions;
                    break;
                case FacilityType.Intersection:
                    priority = this.styles.intLabelPriority;
                    options = this.styles.intLabelOptions;
                    break;
                case FacilityType.USR:
                    priority = this.styles.userLabelPriority;
                    options = this.styles.userLabelOptions;
                    break;
            }
        }
        return new MapCullableLocationTextLabel(text, priority, waypoint.location, false, options);
    }
}
