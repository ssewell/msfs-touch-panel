import { GeoPoint, UnitType } from 'msfssdk';
import { AirspaceType } from 'msfssdk/navigation';
import { MapCachedCanvasLayer } from 'msfssdk/components/map';
import { AirspaceRangeType } from '../Modules/MapAirspaceModule';
/**
 * A layer which draws airspaces.
 */
export class MapAirspaceLayer extends MapCachedCanvasLayer {
    /** @inheritdoc */
    constructor(props) {
        super(props);
        this.searchedAirspaces = [];
        this.lastSearchCenter = new GeoPoint(0, 0);
        this.lastScheduledSearchTime = 0;
        this.activeRenderProcess = null;
        this.searchDebounceTimer = 0;
        this.isSearchScheduled = false;
        this.renderDebounceTimer = 0;
        this.isRenderScheduled = false;
        this.needRefilterAirspaces = false;
        this.renderTaskQueueHandler = {
            // eslint-disable-next-line jsdoc/require-jsdoc
            onStarted() {
                // noop
            },
            // eslint-disable-next-line jsdoc/require-jsdoc
            canContinue(elapsedFrameCount, dispatchedTaskCount, timeElapsed) {
                return timeElapsed < MapAirspaceLayer.RENDER_TIME_BUDGET;
            },
            // eslint-disable-next-line jsdoc/require-jsdoc
            onPaused: this.onRenderPaused.bind(this),
            // eslint-disable-next-line jsdoc/require-jsdoc
            onFinished: this.onRenderFinished.bind(this),
            // eslint-disable-next-line jsdoc/require-jsdoc
            onAborted: this.onRenderAborted.bind(this)
        };
    }
    /** @inheritdoc */
    onAttached() {
        super.onAttached();
        this.initModuleListeners();
        this.scheduleSearchAirspaces(0);
    }
    /**
     * Initializes this layer's airspace module property listeners.
     */
    initModuleListeners() {
        const rangeModule = this.props.model.getModule('range');
        rangeModule.nominalRange.sub(this.onNominalRangeChanged.bind(this));
        rangeModule.nominalRanges.sub(this.onNominalRangeArrayChanged.bind(this));
        const airspaceModule = this.props.model.getModule('airspace');
        airspaceModule.show.sub(this.onShowChanged.bind(this));
        for (const type of Object.values(AirspaceRangeType)) {
            airspaceModule.maxRangeIndex[type].sub(this.onMaxRangeIndexChanged.bind(this, type));
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onMapProjectionChanged(mapProjection, changeFlags) {
        super.onMapProjectionChanged(mapProjection, changeFlags);
        const distance = mapProjection.getCenter().distance(this.lastSearchCenter);
        // sometimes the search will return no airspaces even when it should (usually at the very beginning of a flight),
        // so if the last search results were empty we will refresh the search periodically regardless of how far the last
        // search center is from the current map center.
        if ((this.searchedAirspaces.length === 0 && Date.now() - this.lastScheduledSearchTime >= MapAirspaceLayer.MIN_SEARCH_INTERVAL)
            || (MapAirspaceLayer.SEARCH_DISTANCE_THRESHOLD.compare(distance, UnitType.GA_RADIAN) <= 0)) {
            this.scheduleSearchAirspaces(MapAirspaceLayer.SEARCH_DEBOUNCE_DELAY);
        }
    }
    /**
     * Schedules an airspace search after a specified delay. If a search was previously scheduled but not yet executed,
     * this new scheduled search will replace the old one.
     * @param delay The delay, in milliseconds, before the search is executed.
     */
    scheduleSearchAirspaces(delay) {
        this.searchDebounceTimer = delay;
        this.isSearchScheduled = true;
        this.lastScheduledSearchTime = Date.now();
    }
    /**
     * Schedules a render. If a render was previously scheduled but not yet executed, this new scheduled search will
     * replace the old one.
     * @param delay The delay, in milliseconds, before the search is executed.
     */
    scheduleRender(delay) {
        this.renderDebounceTimer = delay;
        this.isRenderScheduled = true;
    }
    /**
     * Searches for airspaces around the map center. After the search is complete, the list of search results is filtered
     * and, if necessary, rendered.
     */
    async searchAirspaces() {
        const center = this.props.mapProjection.getCenter();
        this.lastSearchCenter.set(center);
        this.searchedAirspaces = await this.props.airspaceSearcher.search(center);
        this.refilterAirspaces();
    }
    /**
     * Filters the list of airspace search results to those that should be rendered and if necessary, renders the
     * filtered airspaces.
     */
    refilterAirspaces() {
        const airspaceModule = this.props.model.getModule('airspace');
        let needRender;
        if (airspaceModule.show.get()) {
            const mapRangeIndex = this.props.model.getModule('range').nominalRangeIndex.get();
            const airspaceMaxRangeIndex = airspaceModule.maxRangeIndex;
            const filteredAirspaces = this.searchedAirspaces.filter(airspace => {
                switch (airspace.type) {
                    case AirspaceType.ClassB:
                        return mapRangeIndex <= airspaceMaxRangeIndex[AirspaceRangeType.ClassB].get();
                    case AirspaceType.ClassC:
                        return mapRangeIndex <= airspaceMaxRangeIndex[AirspaceRangeType.ClassC].get();
                    case AirspaceType.ClassD:
                        return mapRangeIndex <= airspaceMaxRangeIndex[AirspaceRangeType.ClassD].get();
                    case AirspaceType.Restricted:
                        return mapRangeIndex <= airspaceMaxRangeIndex[AirspaceRangeType.Restricted].get();
                    case AirspaceType.MOA:
                        return mapRangeIndex <= airspaceMaxRangeIndex[AirspaceRangeType.MOA].get();
                    default:
                        return false;
                }
            });
            needRender = this.props.airspaceRenderManager.replaceRegisteredAirspaces(filteredAirspaces);
        }
        else {
            needRender = this.props.airspaceRenderManager.clearRegisteredAirspaces();
        }
        if (needRender && !this.isRenderScheduled) {
            this.scheduleRender(0);
        }
        this.needRefilterAirspaces = false;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onUpdated(time, elapsed) {
        super.onUpdated(time, elapsed);
        this.updateFromInvalidation();
        this.updateRefilter();
        this.updateScheduledSearch(time, elapsed);
        this.updateScheduledRender(elapsed);
    }
    /**
     * Checks if the display and buffer canvases have been invalidated, and if so, clears them and schedules a render.
     */
    updateFromInvalidation() {
        const display = this.display;
        const buffer = this.buffer;
        const shouldScheduleRender = display.isInvalid || (buffer.isInvalid && this.activeRenderProcess);
        if (display.isInvalid) {
            display.clear();
            display.syncWithMapProjection(this.props.mapProjection, this.getReferenceMargin());
        }
        if (buffer.isInvalid) {
            buffer.clear();
            buffer.syncWithMapProjection(this.props.mapProjection, this.getReferenceMargin());
        }
        if (shouldScheduleRender) {
            this.scheduleRender(MapAirspaceLayer.RENDER_DEBOUNCE_DELAY);
        }
    }
    /**
     * Checks if airspaces need to be refiltered, and if so, executes a refilter.
     */
    updateRefilter() {
        if (!this.needRefilterAirspaces) {
            return;
        }
        this.refilterAirspaces();
    }
    /**
     * If a search is scheduled, decrements the delay timer and if necessary, executes the search.
     * @param time The current time, as a UNIX timestamp.
     * @param elapsed The time elapsed, in milliseconds, since the last update.
     */
    updateScheduledSearch(time, elapsed) {
        if (!this.isSearchScheduled) {
            return;
        }
        this.searchDebounceTimer = Math.max(0, this.searchDebounceTimer - elapsed);
        if (this.searchDebounceTimer === 0) {
            this.searchAirspaces();
            this.isSearchScheduled = false;
        }
    }
    /**
     * If a render is scheduled, decrements the delay timer and if necessary, executes the render.
     * @param elapsed The time elapsed, in milliseconds, since the last update.
     */
    updateScheduledRender(elapsed) {
        if (!this.isRenderScheduled) {
            return;
        }
        this.renderDebounceTimer = Math.max(0, this.renderDebounceTimer - elapsed);
        if (this.renderDebounceTimer === 0) {
            this.startRenderProcess(true);
            this.isRenderScheduled = false;
        }
    }
    /**
     * Syncs this layer's display canvas instance with the current map projection and renders this layer's airspaces to
     * the display.
     * @param clearDisplay Whether to clear the display canvas before rendering.
     */
    startRenderProcess(clearDisplay) {
        const display = this.display;
        if (clearDisplay) {
            display.clear();
        }
        if (this.activeRenderProcess) {
            this.activeRenderProcess.abort();
        }
        const buffer = this.buffer;
        buffer.clear();
        buffer.syncWithMapProjection(this.props.mapProjection, this.getReferenceMargin());
        display.syncWithCanvasInstance(buffer);
        this.activeRenderProcess = this.props.airspaceRenderManager.prepareRenderProcess(display.geoProjection, buffer.context, this.renderTaskQueueHandler);
        this.activeRenderProcess.start();
    }
    /**
     * Cleans up the active render process.
     */
    cleanUpRender() {
        this.buffer.reset();
        this.activeRenderProcess = null;
    }
    /**
     * Renders airspaces from the buffer to the display.
     */
    renderAirspacesToDisplay() {
        this.display.clear();
        this.copyBufferToDisplay();
    }
    /**
     * This method is called when the airspace render process pauses.
     */
    onRenderPaused() {
        this.renderAirspacesToDisplay();
    }
    /**
     * This method is called when the airspace render process finishes.
     */
    onRenderFinished() {
        this.renderAirspacesToDisplay();
        this.cleanUpRender();
    }
    /**
     * This method is called when the airspace render process is aborted.
     */
    onRenderAborted() {
        this.cleanUpRender();
    }
    /**
     * This method is called when the nominal map range changes.
     */
    onNominalRangeChanged() {
        this.needRefilterAirspaces = true;
    }
    /**
     * This method is called when the array of nominal map ranges changes.
     */
    onNominalRangeArrayChanged() {
        this.needRefilterAirspaces = true;
    }
    /**
     * This method is called when the show airspace property changes.
     */
    onShowChanged() {
        this.needRefilterAirspaces = true;
    }
    /**
     * This method is called when an airspace maximum range index property changes.
     */
    onMaxRangeIndexChanged() {
        this.needRefilterAirspaces = true;
    }
}
/**
 * The minimum distance between the current map center and the last search center required to initiate a new search.
 */
MapAirspaceLayer.SEARCH_DISTANCE_THRESHOLD = UnitType.NMILE.createNumber(10);
MapAirspaceLayer.MIN_SEARCH_INTERVAL = 5000; // milliseconds
MapAirspaceLayer.RENDER_TIME_BUDGET = 0.2; // milliseconds per frame
MapAirspaceLayer.SEARCH_DEBOUNCE_DELAY = 500; // milliseconds
MapAirspaceLayer.RENDER_DEBOUNCE_DELAY = 500; // milliseconds
