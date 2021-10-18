import { BitFlags, GeoPoint, UnitType, Vec2Math } from 'msfssdk';
import { FacilityType, ICAO, FacilitySearchType, FacilityLoader, FacilityRespository } from 'msfssdk/navigation';
import { MapCullableLocationTextLabel, MapProjectionChangeType, MapSyncedCanvasLayer } from 'msfssdk/components/map';
import { FacilityWaypointCache } from '../../Navigation/FacilityWaypointCache';
import { MapWaypointRenderRole } from '../MapWaypointRenderer';
import { AirportSize, AirportWaypoint, FacilityWaypoint } from '../../Navigation/Waypoint';
import { MapAirportIcon, MapBlankWaypointIcon, MapIntersectionIcon, MapNdbIcon, MapVorIcon } from '../MapWaypointIcon';
// TODO: This entire layer (and how the map renders waypoints) will need to be refactored eventually.
/**
 * The map layer showing waypoints.
 */
export class MapWaypointsLayer extends MapSyncedCanvasLayer {
    /** @inheritdoc */
    constructor(props) {
        super(props);
        this.facLoader = new FacilityLoader(FacilityRespository.getRepository(this.props.bus), this.onFacilityLoaderInitialized.bind(this));
        this.facWaypointCache = FacilityWaypointCache.getCache();
        this.searchRadius = 0;
        this.searchMargin = 0;
        this.icaosToShow = new Set();
        this.isAirportVisible = {
            [AirportSize.Large]: false,
            [AirportSize.Medium]: false,
            [AirportSize.Small]: false
        };
        this.isVorVisible = false;
        this.isNdbVisible = false;
        this.isIntersectionVisible = false;
        this.iconFactory = new WaypointIconFactory({
            airportIconPriority: Object.assign({}, this.props.styles.airportIconPriority),
            vorIconPriority: this.props.styles.vorIconPriority,
            ndbIconPriority: this.props.styles.ndbIconPriority,
            intIconPriority: this.props.styles.intIconPriority,
            airportIconSize: Object.assign({}, this.props.styles.airportIconSize),
            vorIconSize: this.props.styles.vorIconSize,
            ndbIconSize: this.props.styles.ndbIconSize,
            intIconSize: this.props.styles.intIconSize,
        });
        this.labelFactory = new WaypointLabelFactory({
            airportLabelPriority: Object.assign({}, this.props.styles.airportLabelPriority),
            vorLabelPriority: this.props.styles.vorLabelPriority,
            ndbLabelPriority: this.props.styles.ndbLabelPriority,
            intLabelPriority: this.props.styles.intLabelPriority,
            airportLabelOptions: {
                [AirportSize.Large]: Object.assign({}, this.props.styles.airportLabelOptions[AirportSize.Large]),
                [AirportSize.Medium]: Object.assign({}, this.props.styles.airportLabelOptions[AirportSize.Medium]),
                [AirportSize.Small]: Object.assign({}, this.props.styles.airportLabelOptions[AirportSize.Small])
            },
            vorLabelOptions: Object.assign({}, this.props.styles.vorLabelOptions),
            ndbLabelOptions: Object.assign({}, this.props.styles.ndbLabelOptions),
            intLabelOptions: Object.assign({}, this.props.styles.intLabelOptions)
        });
    }
    /**
     * A callback called when the facility loaded finishes initialization.
     */
    onFacilityLoaderInitialized() {
        Promise.all([
            this.facLoader.startNearestSearchSession(FacilitySearchType.Airport),
            this.facLoader.startNearestSearchSession(FacilitySearchType.Vor),
            this.facLoader.startNearestSearchSession(FacilitySearchType.Ndb),
            this.facLoader.startNearestSearchSession(FacilitySearchType.Intersection)
        ]).then((value) => {
            const [airportSession, vorSession, ndbSession, intSession] = value;
            const callback = this.processSearchResults.bind(this);
            this.facilitySearches = {
                airport: new MapWaypointsLayer.NearestSearch(airportSession, MapWaypointsLayer.SEARCH_AIRPORT_LIMIT, callback),
                vor: new MapWaypointsLayer.NearestSearch(vorSession, MapWaypointsLayer.SEARCH_VOR_LIMIT, callback),
                ndb: new MapWaypointsLayer.NearestSearch(ndbSession, MapWaypointsLayer.SEARCH_NDB_LIMIT, callback),
                intersection: new MapWaypointsLayer.NearestSearch(intSession, MapWaypointsLayer.SEARCH_INTERSECTION_LIMIT, callback)
            };
            if (this.isInit) {
                this.tryRefreshAllSearches(this.props.mapProjection.getCenter(), this.searchRadius);
            }
        });
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAttached() {
        super.onAttached();
        this.isInit = false;
        this.initVisibilityFlags();
        this.initWaypointRenderer();
        this.updateSearchRadius();
        this.isInit = true;
        this.tryRefreshAllSearches(this.props.mapProjection.getCenter(), this.searchRadius);
    }
    /**
     * Initializes waypoint visibility flags and listeners.
     */
    initVisibilityFlags() {
        const waypointsModule = this.props.model.getModule('waypoints');
        waypointsModule.airportShow[AirportSize.Large].sub(this.updateAirportVisibility.bind(this, AirportSize.Large), true);
        waypointsModule.airportShow[AirportSize.Medium].sub(this.updateAirportVisibility.bind(this, AirportSize.Medium), true);
        waypointsModule.airportShow[AirportSize.Small].sub(this.updateAirportVisibility.bind(this, AirportSize.Small), true);
        waypointsModule.vorShow.sub(this.updateVorVisibility.bind(this), true);
        waypointsModule.ndbShow.sub(this.updateNdbVisibility.bind(this), true);
        waypointsModule.intShow.sub(this.updateIntersectionVisibility.bind(this), true);
    }
    /**
     * Updates airport waypoint visibility.
     * @param size The airport size class to update.
     */
    updateAirportVisibility(size) {
        const waypointsModule = this.props.model.getModule('waypoints');
        const wasAnyAirportVisible = this.isAirportVisible[AirportSize.Large]
            || this.isAirportVisible[AirportSize.Medium]
            || this.isAirportVisible[AirportSize.Small];
        this.isAirportVisible[size] = waypointsModule.airportShow[size].get();
        if (!wasAnyAirportVisible && this.isAirportVisible[size]) {
            this.tryRefreshIntersectionSearch(this.props.mapProjection.getCenter(), this.searchRadius);
        }
    }
    /**
     * Updates VOR waypoint visibility.
     */
    updateVorVisibility() {
        const waypointsModule = this.props.model.getModule('waypoints');
        this.isVorVisible = waypointsModule.vorShow.get();
        if (this.isVorVisible) {
            this.tryRefreshVorSearch(this.props.mapProjection.getCenter(), this.searchRadius);
        }
    }
    /**
     * Updates NDB waypoint visibility.
     */
    updateNdbVisibility() {
        const waypointsModule = this.props.model.getModule('waypoints');
        this.isNdbVisible = waypointsModule.ndbShow.get();
        if (this.isNdbVisible) {
            this.tryRefreshNdbSearch(this.props.mapProjection.getCenter(), this.searchRadius);
        }
    }
    /**
     * Updates intersection waypoint visibility.
     */
    updateIntersectionVisibility() {
        const waypointsModule = this.props.model.getModule('waypoints');
        this.isIntersectionVisible = waypointsModule.intShow.get();
        if (this.isIntersectionVisible) {
            this.tryRefreshIntersectionSearch(this.props.mapProjection.getCenter(), this.searchRadius);
        }
    }
    /**
     * Initializes the waypoint renderer.
     */
    initWaypointRenderer() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.props.waypointRenderer.setCanvasContext(MapWaypointRenderRole.Normal, this.display.context);
        this.props.waypointRenderer.setIconFactory(MapWaypointRenderRole.Normal, this.iconFactory);
        this.props.waypointRenderer.setLabelFactory(MapWaypointRenderRole.Normal, this.labelFactory);
        this.props.waypointRenderer.setVisibilityHandler(MapWaypointRenderRole.Normal, this.isWaypointVisible.bind(this));
    }
    /**
     * Checks whether a waypoint is visible.
     * @param waypoint A waypoint.
     * @returns whether the waypoint is visible.
     */
    isWaypointVisible(waypoint) {
        if (waypoint instanceof FacilityWaypoint) {
            switch (ICAO.getFacilityType(waypoint.facility.icao)) {
                case FacilityType.Airport:
                    return this.isAirportVisible[waypoint.size];
                case FacilityType.VOR:
                    return this.isVorVisible;
                case FacilityType.NDB:
                    return this.isNdbVisible;
                case FacilityType.Intersection:
                    return this.isIntersectionVisible;
            }
        }
        return false;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onMapProjectionChanged(mapProjection, changeFlags) {
        super.onMapProjectionChanged(mapProjection, changeFlags);
        if (BitFlags.isAny(changeFlags, MapProjectionChangeType.Range | MapProjectionChangeType.ProjectedSize)) {
            this.updateSearchRadius();
            this.tryRefreshAllSearches(mapProjection.getCenter(), this.searchRadius);
        }
        else if (BitFlags.isAll(changeFlags, MapProjectionChangeType.Center)) {
            this.tryRefreshAllSearches(mapProjection.getCenter(), this.searchRadius);
        }
    }
    /**
     * Updates the desired nearest facility search radius based on the current map projection.
     */
    updateSearchRadius() {
        const mapHalfDiagRange = Vec2Math.abs(this.props.mapProjection.getProjectedSize()) * this.props.mapProjection.getProjectedResolution() / 2;
        this.searchRadius = mapHalfDiagRange * MapWaypointsLayer.SEARCH_RADIUS_OVERDRAW_FACTOR;
        this.searchMargin = mapHalfDiagRange * (MapWaypointsLayer.SEARCH_RADIUS_OVERDRAW_FACTOR - 1);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onUpdated(time, elapsed) {
        this.updateSearches(elapsed);
    }
    /**
     * Updates this layer's facility searches.
     * @param elapsed The elapsed time, in milliseconds, since the last update.
     */
    updateSearches(elapsed) {
        if (!this.facilitySearches) {
            return;
        }
        this.facilitySearches.airport.update(elapsed);
        this.facilitySearches.vor.update(elapsed);
        this.facilitySearches.ndb.update(elapsed);
        this.facilitySearches.intersection.update(elapsed);
    }
    /**
     * Attempts to refresh all of the nearest facility searches.
     * @param center The center of the search area.
     * @param radius The radius of the search area, in great-arc radians.
     */
    tryRefreshAllSearches(center, radius) {
        this.tryRefreshAirportSearch(center, radius);
        this.tryRefreshVorSearch(center, radius);
        this.tryRefreshNdbSearch(center, radius);
        this.tryRefreshIntersectionSearch(center, radius);
    }
    /**
     * Attempts to refresh the nearest airport search. The search will only be refreshed if at least one size class of
     * airport is currently visible and the desired search radius is different from the last refreshed search radius or
     * the desired search center is outside of the margin of the last refreshed search center.
     * @param center The center of the search area.
     * @param radius The radius of the search area, in great-arc radians.
     */
    tryRefreshAirportSearch(center, radius) {
        if (!this.facilitySearches
            || !(this.isAirportVisible[AirportSize.Large] || this.isAirportVisible[AirportSize.Medium] || this.isAirportVisible[AirportSize.Small])) {
            return;
        }
        const search = this.facilitySearches.airport;
        if (search.lastRadius !== radius || search.lastCenter.distance(center) >= this.searchMargin) {
            search.scheduleRefresh(center, radius, MapWaypointsLayer.SEARCH_DEBOUNCE_DELAY);
        }
    }
    /**
     * Attempts to refresh the nearest VOR search. The search will only be refreshed if VORs are currently visible and
     * the desired search radius is different from the last refreshed search radius or the desired search center is
     * outside of the margin of the last refreshed search center.
     * @param center The center of the search area.
     * @param radius The radius of the search area, in great-arc radians.
     */
    tryRefreshVorSearch(center, radius) {
        if (!this.facilitySearches || !this.isVorVisible) {
            return;
        }
        const search = this.facilitySearches.vor;
        if (search.lastRadius !== radius || search.lastCenter.distance(center) >= this.searchMargin) {
            search.scheduleRefresh(center, radius, MapWaypointsLayer.SEARCH_DEBOUNCE_DELAY);
        }
    }
    /**
     * Attempts to refresh the nearest NDB search. The search will only be refreshed if NDB are currently visible and
     * the desired search radius is different from the last refreshed search radius or the desired search center is
     * outside of the margin of the last refreshed search center.
     * @param center The center of the search area.
     * @param radius The radius of the search area, in great-arc radians.
     */
    tryRefreshNdbSearch(center, radius) {
        if (!this.facilitySearches || !this.isNdbVisible) {
            return;
        }
        const search = this.facilitySearches.ndb;
        if (search.lastRadius !== radius || search.lastCenter.distance(center) >= this.searchMargin) {
            search.scheduleRefresh(center, radius, MapWaypointsLayer.SEARCH_DEBOUNCE_DELAY);
        }
    }
    /**
     * Attempts to refresh the nearest intersection search. The search will only be refreshed if intersections are
     * currently visible and the desired search radius is different from the last refreshed search radius or the desired
     * search center is outside of the margin of the last refreshed search center.
     * @param center The center of the search area.
     * @param radius The radius of the search area, in great-arc radians.
     */
    tryRefreshIntersectionSearch(center, radius) {
        if (!this.facilitySearches || !this.isIntersectionVisible) {
            return;
        }
        const search = this.facilitySearches.intersection;
        if (search.lastRadius !== radius || search.lastCenter.distance(center) >= this.searchMargin) {
            search.scheduleRefresh(center, radius, MapWaypointsLayer.SEARCH_DEBOUNCE_DELAY);
        }
    }
    /**
     * Processes nearest facility search results. New facilities are registered, while removed facilities are deregistered.
     * @param results Nearest facility search results.
     */
    processSearchResults(results) {
        if (!results) {
            return;
        }
        const numAdded = results.added.length;
        for (let i = 0; i < numAdded; i++) {
            const icao = results.added[i];
            if (icao === undefined || icao === ICAO.emptyIcao) {
                continue;
            }
            this.registerFacility(icao);
        }
        const numRemoved = results.removed.length;
        for (let i = 0; i < numRemoved; i++) {
            const icao = results.removed[i];
            if (icao === undefined || icao === ICAO.emptyIcao) {
                continue;
            }
            this.deregisterFacility(icao);
        }
    }
    /**
     * Registers a facility with this layer. Registered facilities are drawn to this layer using a waypoint renderer.
     * @param icao The ICAO string of the facility to register.
     */
    registerFacility(icao) {
        this.icaosToShow.add(icao);
        this.facLoader.getFacility(ICAO.getFacilityType(icao), icao).then(facility => {
            if (!this.icaosToShow.has(icao)) {
                return;
            }
            const waypoint = this.facWaypointCache.get(facility);
            this.props.waypointRenderer.register(waypoint, MapWaypointRenderRole.Normal, 'waypoints-layer');
        });
    }
    /**
     * Deregisters a facility from this layer.
     * @param icao The ICAO string of the facility to deregister.
     */
    deregisterFacility(icao) {
        this.icaosToShow.delete(icao);
        this.facLoader.getFacility(ICAO.getFacilityType(icao), icao).then(facility => {
            if (this.icaosToShow.has(icao)) {
                return;
            }
            const waypoint = this.facWaypointCache.get(facility);
            this.props.waypointRenderer.deregister(waypoint, MapWaypointRenderRole.Normal, 'waypoints-layer');
        });
    }
}
MapWaypointsLayer.SEARCH_RADIUS_OVERDRAW_FACTOR = Math.SQRT2;
MapWaypointsLayer.SEARCH_AIRPORT_LIMIT = 500;
MapWaypointsLayer.SEARCH_VOR_LIMIT = 250;
MapWaypointsLayer.SEARCH_NDB_LIMIT = 250;
MapWaypointsLayer.SEARCH_INTERSECTION_LIMIT = 500;
MapWaypointsLayer.SEARCH_DEBOUNCE_DELAY = 500; // milliseconds
/**
 * A nearest facility search for MapWaypointLayer.
 */
MapWaypointsLayer.NearestSearch = class {
    /**
     * Constructor.
     * @param session The session used by this search.
     * @param maxSearchItems The maximum number of items this search returns.
     * @param refreshCallback A callback which is called every time the search refreshes.
     */
    constructor(session, maxSearchItems, refreshCallback) {
        this.session = session;
        this.maxSearchItems = maxSearchItems;
        this.refreshCallback = refreshCallback;
        this._lastCenter = new GeoPoint(0, 0);
        this._lastRadius = 0;
        this.refreshDebounceTimer = 0;
        this.isRefreshScheduled = false;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /**
     * The center of this search's last refresh.
     */
    get lastCenter() {
        return this._lastCenter.readonly;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /**
     * The radius of this search's last refresh, in great-arc radians.
     */
    get lastRadius() {
        return this._lastRadius;
    }
    /**
     * Schedules a refresh of this search.  If a refresh was previously scheduled but not yet executed, this new
     * scheduled refresh will replace the old one.
     * @param center The center of the search area.
     * @param radius The radius of the search area, in great-arc radians.
     * @param delay The delay, in milliseconds, before the refresh is executed.
     */
    scheduleRefresh(center, radius, delay) {
        this._lastCenter.set(center);
        this._lastRadius = radius;
        this.refreshDebounceTimer = delay;
        this.isRefreshScheduled = true;
    }
    /**
     * Updates this search. Executes any pending refreshes if their delay timers have expired.
     * @param elapsed The elapsed time, in milliseconds, since the last update.
     */
    update(elapsed) {
        if (!this.isRefreshScheduled) {
            return;
        }
        this.refreshDebounceTimer = Math.max(0, this.refreshDebounceTimer - elapsed);
        if (this.refreshDebounceTimer === 0) {
            this.refresh();
            this.isRefreshScheduled = false;
        }
    }
    /**
     * Refreshes this search.
     * @returns a Promise which is fulfilled with the search results when the refresh completes.
     */
    async refresh() {
        const results = await this.session.searchNearest(this._lastCenter.lat, this._lastCenter.lon, UnitType.GA_RADIAN.convertTo(this._lastRadius, UnitType.METER), this.maxSearchItems);
        this.refreshCallback(results);
    }
};
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
            }
        }
        return new MapBlankWaypointIcon(waypoint, 0);
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
            }
        }
        return new MapCullableLocationTextLabel(text, priority, waypoint.location, false, options);
    }
}
