import { ComputedSubject, Subject } from 'msfssdk';
import { ICAO, FacilityLoader, FacilityRespository } from 'msfssdk/navigation';
import { FacilityWaypointCache } from '../../Navigation/FacilityWaypointCache';
/**
 * Waypoint input store
 */
export class WaypointInputStore {
    /**
     * Creates an instance of waypoint input store.
     * @param bus The event bus.
     * @param searchFilter This store's search filter for ICAOSearch.
     * @param onWaypointChanged A function which is called when this store's selected waypoint changes.
     * @param onFacilityChanged A function which is called when this store's selected facility changes.
     * @param onMatchedWaypointsChanged A function which is called when this store's matched waypoints changes.
     */
    constructor(bus, searchFilter, onWaypointChanged, onFacilityChanged, onMatchedWaypointsChanged) {
        this.searchFilter = searchFilter;
        this.onWaypointChanged = onWaypointChanged;
        this.onFacilityChanged = onFacilityChanged;
        this.onMatchedWaypointsChanged = onMatchedWaypointsChanged;
        this.nameEmptyStr = '_______________';
        this.cityEmptyStr = '________________';
        this.displayWaypoint = {
            icao: '',
            name: ComputedSubject.create(this.nameEmptyStr, (v) => {
                return (v === '') ? this.nameEmptyStr : Utils.Translate(v);
            }),
            city: ComputedSubject.create('', (v) => {
                if (v === '') {
                    return this.cityEmptyStr;
                }
                const separatedCity = v.split(', ');
                return separatedCity.length > 1 ? Utils.Translate(separatedCity[0]) + ' ' + Utils.Translate(separatedCity[1]).substr(0, 2).toUpperCase() : Utils.Translate(v);
            }),
        };
        /** A subject which provides the currently selected waypoint. */
        this.selectedWaypoint = Subject.create(null);
        /** A subject which provides the input text value which should be displayed. */
        this.inputValue = Subject.create('');
        this._matchedIcaos = [];
        this._matchedWaypoints = [];
        this.loadIcaosOpId = 0;
        this.facRepo = FacilityRespository.getRepository(bus);
        this.facLoader = new FacilityLoader(this.facRepo);
        this.facWaypointCache = FacilityWaypointCache.getCache();
        this.selectedWaypoint.sub(waypoint => {
            this.onWaypointChanged && this.onWaypointChanged(waypoint);
            this.onFacilityChanged && this.onFacilityChanged(waypoint === null || waypoint === void 0 ? void 0 : waypoint.facility);
        });
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** An array of ICAO strings which have matched the input. */
    get matchedIcaos() {
        return this._matchedIcaos;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** An array of facilities which have matched the input. */
    get matchedWaypoints() {
        return this._matchedWaypoints;
    }
    /**
     * Executes the icao search.
     * @param searchStr The search string.
     * @returns An array of the found ICAOs.
     */
    doSearch(searchStr) {
        return this.facLoader.searchByIdent(this.searchFilter, searchStr);
    }
    /**
     * Loads and display the facility data for the currently found ICAO
     * @param icaos The ICAO to load.
     * @returns a Promise which fulfills with whether the ICAO data was successfully loaded.
     */
    async loadIcaoData(icaos) {
        if (icaos.length === this._matchedIcaos.length && icaos.every((icao, index) => icao === this._matchedIcaos[index])) {
            return false;
        }
        const opId = ++this.loadIcaosOpId;
        let matchedWaypoints;
        try {
            matchedWaypoints = await Promise.all(icaos.map(async (icao) => this.facWaypointCache.get(await this.facLoader.getFacility(ICAO.getFacilityType(icao), icao))));
        }
        catch (e) {
            icaos = [];
        }
        if (opId !== this.loadIcaosOpId) {
            return false;
        }
        this._matchedIcaos = [...icaos];
        this._matchedWaypoints = matchedWaypoints !== null && matchedWaypoints !== void 0 ? matchedWaypoints : [];
        this.onMatchedWaypointsChanged && this.onMatchedWaypointsChanged(this.matchedWaypoints);
        if (this._matchedWaypoints.length > 0) {
            this.setWaypoint(this._matchedWaypoints[0]);
        }
        else {
            this.clearWaypoint();
        }
        return true;
    }
    /**
     * Sets the selected and displayed waypoint.
     * @param waypoint A facility waypoint.
     */
    setWaypoint(waypoint) {
        this.selectedWaypoint.set(waypoint);
        this.displayWaypoint.icao = waypoint.facility.icao;
        this.displayWaypoint.city.set(waypoint.facility.city);
        this.displayWaypoint.name.set(waypoint.facility.name);
    }
    /**
     * Clears the selected and displayed waypoint.
     */
    clearWaypoint() {
        this.selectedWaypoint.set(null);
        if (this.displayWaypoint.icao !== '') {
            this.displayWaypoint.icao = '';
            this.displayWaypoint.city.set('');
            this.displayWaypoint.name.set('');
        }
    }
}
