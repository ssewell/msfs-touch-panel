import { ArraySubject, GeoPoint, GeoPointSubject, MagVar, Subject, UnitType } from 'msfssdk';
import { FacilityFrequencyType, FacilityType, FacilitySearchType, RunwaySurfaceType, RunwayUtils } from 'msfssdk/navigation';
/**
 * The kind of runways we can filter on for nearest display.  This is meant to be used
 * as a bitfield.  For the Soft/Hard combo, use SurfaceType.Soft | SurfaceType.Hard.
 **/
export var SurfaceType;
(function (SurfaceType) {
    SurfaceType[SurfaceType["Any"] = 1] = "Any";
    SurfaceType[SurfaceType["Hard"] = 2] = "Hard";
    SurfaceType[SurfaceType["Soft"] = 4] = "Soft";
    SurfaceType[SurfaceType["Water"] = 8] = "Water";
})(SurfaceType || (SurfaceType = {}));
/**
 * A filter to be injected into a NearestStore.  This will allow the filtering
 * of a list of airports based upon their longest runway and its surface type.
 * This includes result cacheing to optimize performance of repeated filters.
 * Search parameters may be tweaked, and doing so will automatically invalidate
 * the cache.
 */
export class AirportFilter {
    /**
     * Construct an airport filter.
     * @param minLength The minimum length in meters.
     * @param surfaceType The type of surfaces to look for.
     */
    constructor(minLength, surfaceType) {
        this.cache = new Map();
        this._minLength = minLength || UnitType.FOOT.convertTo(3000, UnitType.METER);
        this._surfaceType = surfaceType || SurfaceType.Hard;
    }
    /**
     * Perform the filter on a given list of airports.
     * @param airports An array of AirportFacilities.
     * @returns A list of airports meeting the filter criteria.
     */
    filter(airports) {
        const filtered = [];
        for (const airport of airports) {
            if (!airport) {
                continue;
            }
            let good = this.cache.get(airport.icao);
            if (good === undefined) {
                this.cache.set(airport.icao, good = this.filterAirport(airport));
            }
            if (good) {
                filtered.push(airport);
            }
        }
        return filtered;
    }
    /**
     * Filter a given airport using the current criteria.
     * @param airport The airport to filter.
     * @returns True if the filter is passed, else false.
     */
    filterAirport(airport) {
        const longest = airport.runways.sort((a, b) => b.length - a.length)[0];
        if (longest) {
            if (longest.length < this._minLength) {
                return false;
            }
            if (this.filterRunway(longest, this._surfaceType)) {
                return true;
            }
        }
        return false;
    }
    /**
     * See if a runway matches a given surface type.
     * @param runway The runway to check.
     * @param filter A bitfield of the surface types to allow.
     * @returns True if the runway passes the filter, else false.
     */
    filterRunway(runway, filter) {
        if (filter & SurfaceType.Any) {
            return true;
        }
        if (filter & SurfaceType.Soft && AirportFilter.surfacesSoft.includes(runway.surface)) {
            return true;
        }
        if (filter & SurfaceType.Hard && AirportFilter.surfacesHard.includes(runway.surface)) {
            return true;
        }
        if (filter & SurfaceType.Water && AirportFilter.surfacesWater.includes(runway.surface)) {
            return true;
        }
        return false;
    }
    /**
     * Set a new minimum length and clear the cache.
     * @param minLength The new minimum length in meters.
     */
    set minLength(minLength) {
        this._minLength = minLength;
        this.cache.clear();
    }
    /**
     * Get the current minimum length.
     * @returns The minimum length in meters.
     */
    get minLength() {
        return this._minLength;
    }
    /**
     * Set a new surface type filter and clear the cache.
     * @param surfaceType The new surface type options.
     */
    set surfaceType(surfaceType) {
        this._surfaceType = surfaceType;
        this.cache.clear();
    }
    /**
     * Get the current surface type filter.
     * @returns A bitfield of the surface types to allow.
     */
    get surfaceType() {
        return this._surfaceType;
    }
}
// These are best guesses as to the proper categorization.   They may need to
// be tweaked.
AirportFilter.surfacesHard = [
    RunwaySurfaceType.Asphalt,
    RunwaySurfaceType.Bituminous,
    RunwaySurfaceType.Brick,
    RunwaySurfaceType.Concrete,
    RunwaySurfaceType.Ice,
    RunwaySurfaceType.Macadam,
    RunwaySurfaceType.Paint,
    RunwaySurfaceType.Planks,
    RunwaySurfaceType.SteelMats,
    RunwaySurfaceType.Tarmac,
    RunwaySurfaceType.Urban,
];
AirportFilter.surfacesSoft = [
    RunwaySurfaceType.Coral,
    RunwaySurfaceType.Dirt,
    RunwaySurfaceType.Forest,
    RunwaySurfaceType.Grass,
    RunwaySurfaceType.GrassBumpy,
    RunwaySurfaceType.Gravel,
    RunwaySurfaceType.HardTurf,
    RunwaySurfaceType.LongGrass,
    RunwaySurfaceType.OilTreated,
    RunwaySurfaceType.Sand,
    RunwaySurfaceType.Shale,
    RunwaySurfaceType.ShortGrass,
    RunwaySurfaceType.Snow,
    RunwaySurfaceType.WrightFlyerTrack
];
AirportFilter.surfacesWater = [
    RunwaySurfaceType.WaterFSX,
    RunwaySurfaceType.Lake,
    RunwaySurfaceType.Ocean,
    RunwaySurfaceType.Pond,
    RunwaySurfaceType.River,
    RunwaySurfaceType.WasteWater,
    RunwaySurfaceType.Water
];
/** A nearest store. */
export class NearestStore {
    /**
     * Create a NearestStore.
     * @param loader A facility loader.
     * @param filter An instance of AirportFilter to use for filtration.
     */
    constructor(loader, filter) {
        this.planePos = GeoPointSubject.createFromGeoPoint(new GeoPoint(NaN, NaN));
        this.planeHeading = Subject.create(0);
        this.nearestFacilities = new Map();
        this.nearestAirports = new Map();
        this.nearestSubjects = new Array();
        this.nearestSubjectList = ArraySubject.create();
        this.airportCountSub = Subject.create(0);
        this.airportCount = this.airportCountSub;
        this.loader = loader;
        this.filter = filter || new AirportFilter();
        for (let i = 0; i < NearestStore.maxReturned; i++) {
            this.nearestSubjects.push(Subject.create({
                facility: null,
                distance: -1,
                bearing: -1,
                bestHdg: -1,
                bestLength: -1
            }));
            this.nearestSubjectList.insert(this.nearestSubjects[i]);
        }
        this.planePos.sub(pos => {
            if (isNaN(pos.lat) || isNaN(pos.lon)) {
                return;
            }
            this.searchNearest();
        });
    }
    /**
     * Update our nearest airport list.
     */
    searchNearest() {
        var _a;
        if (!this.session) {
            (_a = this.loader) === null || _a === void 0 ? void 0 : _a.startNearestSearchSession(FacilitySearchType.Airport).then(session => {
                this.session = session;
                this.searchNearest();
            });
        }
        else {
            const planePos = this.planePos.get();
            this.session.searchNearest(planePos.lat, planePos.lon, NearestStore.searchRange, NearestStore.maxFound)
                .then(results => { return this.updateNearestFacilities(results); })
                .then(() => {
                this.updateNearestAirports();
                this.updateNearestSubjectList();
            });
        }
    }
    /**
     * Update our nearest list with the latest search results.
     * @param results The results from a nearest search.
     * @returns A promise that resolves when the nearest list is updated.
     */
    updateNearestFacilities(results) {
        var _a;
        // The results of a search contains only the elements added or removed from the last
        // search in the session.   So we need to keep track of everythign that's been returned
        // in this session and add and delete as needed.
        for (const icao of results.removed) {
            this.nearestFacilities.delete(icao);
            this.nearestAirports.delete(icao);
        }
        // Get facility information for all the newly added airports.  The facility loader
        // caches search results internally, so we're not going to worry about optimizing
        // that here as well.
        const searches = new Array();
        for (const icao of results.added) {
            searches.push((_a = this.loader) === null || _a === void 0 ? void 0 : _a.getFacility(FacilityType.Airport, icao));
        }
        return new Promise((resolve) => {
            Promise.all(searches).then(facilities => {
                for (const facility of this.filter.filter(facilities)) {
                    if (facility) {
                        this.nearestFacilities.set(facility.icao, facility);
                    }
                }
                resolve();
            });
        });
    }
    /**
     * Onces the nearby facilities have been updated, we need to update our
     * set of NearbyAirports to account for distance/bearing changes.
     */
    updateNearestAirports() {
        for (const [icao, facility] of this.nearestFacilities.entries()) {
            const nearest = this.nearestAirports.get(icao);
            if (nearest) {
                this.nearestAirports.set(icao, this.updateNearbyAirport(nearest) || this.createNearbyAirport(facility));
            }
            else {
                this.nearestAirports.set(icao, this.createNearbyAirport(facility));
            }
        }
    }
    /**
     * Update our array of nearest airports sorted by distance.
     * @returns An array of nearby airports sorted by distance.
     */
    get nearestByDistance() {
        return [...this.nearestAirports.values()].sort((a, b) => {
            return a.distance - b.distance;
        }).slice(0, NearestStore.maxReturned);
    }
    /**
     * Get the contact frequency for an aiport.  Since this really isn't defined
     * in the scenery details, we implement a pretty simple algorithm for determining
     * it:  iterate through al the frequencies and return the first of a) tower,
     * b) unicom, c) mulicom, d) ctaf that is found.
     * @param airport An airport.
     * @returns frequency The best frequency to use.
     */
    getContactFrequency(airport) {
        const priority = new Map([[FacilityFrequencyType.Tower, 1],
            [FacilityFrequencyType.Unicom, 2],
            [FacilityFrequencyType.Multicom, 3],
            [FacilityFrequencyType.CTAF, 4]]);
        const foundFreqs = new Array();
        const usableTypes = [FacilityFrequencyType.Tower, FacilityFrequencyType.Unicom, FacilityFrequencyType.Multicom, FacilityFrequencyType.CTAF];
        for (const freq of airport.frequencies) {
            if (usableTypes.includes(freq.type)) {
                foundFreqs.push(freq);
            }
        }
        if (foundFreqs.length === 0) {
            return undefined;
        }
        else {
            return foundFreqs.sort((a, b) => {
                return (priority.get(a.type) || 5) - (priority.get(b.type) || 5);
            })[0];
        }
    }
    /**
     * Create a NearbyAirport from an AirportFacility.
     * @param facility The AirportFacility record.
     * @returns The populated NearbyAirport
     */
    createNearbyAirport(facility) {
        const bestRunway = facility.runways.sort((a, b) => b.length - a.length)[0];
        const bestRwyApps = RunwayUtils.getProceduresForRunway(facility.approaches, bestRunway);
        let bestApproach = 'VFR';
        for (const approach of bestRwyApps) {
            switch (approach.name.substring(0, 3)) {
                case 'ILS':
                    bestApproach = 'ILS';
                    break;
                case 'LOC':
                    if (bestApproach !== 'ILS') {
                        bestApproach = 'LOC';
                    }
                    break;
                case 'RNA':
                    if (bestApproach != 'ILS' && bestApproach !== 'LOC') {
                        bestApproach = 'RNA';
                    }
                    break;
                case 'VOR':
                    if (bestApproach !== 'ILS' && bestApproach !== 'LOC' && bestApproach !== 'RNA') {
                        bestApproach = 'VOR';
                    }
                    break;
                case 'NDB':
                    if (bestApproach !== 'ILS' && bestApproach !== 'LOC' && bestApproach !== 'RNA' && bestApproach !== 'VOR') {
                        bestApproach = 'NDB';
                    }
                    break;
            }
        }
        const planePos = this.planePos.get();
        return {
            facility: facility,
            distance: UnitType.GA_RADIAN.convertTo(planePos.distance(facility.lat, facility.lon), UnitType.METER),
            bearing: MagVar.trueToMagnetic(planePos.bearingTo(facility), planePos),
            bestHdg: bestRunway.direction,
            bestLength: bestRunway.length,
            frequency: this.getContactFrequency(facility),
            bestApproach: bestApproach,
        };
    }
    /**
     * Update the dynamic data on a nearby airport.
     * @param airport The airport to update.
     * @returns An updated airport or undefined.
     */
    updateNearbyAirport(airport) {
        const facility = airport.facility && this.nearestFacilities.get(airport.facility.icao);
        if (facility) {
            const newAirport = {
                facility: {},
                distance: -1,
                bearing: -1,
                bestHdg: -1,
                bestLength: -1,
            };
            const planePos = this.planePos.get();
            Object.assign(newAirport, airport);
            newAirport.distance = UnitType.GA_RADIAN.convertTo(planePos.distance(facility.lat, facility.lon), UnitType.METER);
            newAirport.bearing = MagVar.trueToMagnetic(planePos.bearingTo(facility), planePos);
            return newAirport;
        }
        else {
            return undefined;
        }
    }
    /**
     * Update the nearest list with the current nearby airports.
     */
    updateNearestSubjectList() {
        let airportCount = 0;
        const nearestSorted = this.nearestByDistance;
        for (let i = 0; i < NearestStore.maxReturned; i++) {
            if (i < nearestSorted.length) {
                this.nearestSubjects[i].set(nearestSorted[i]);
                airportCount++;
            }
            else {
                this.nearestSubjects[i].set({
                    facility: null,
                    distance: -1,
                    bearing: -1,
                    bestHdg: -1,
                    bestLength: -1
                });
            }
        }
        this.airportCountSub.set(airportCount);
    }
}
// G1000 has a 200nm search radius.
NearestStore.searchRange = UnitType.NMILE.convertTo(200, UnitType.METER);
NearestStore.maxFound = 200;
NearestStore.maxReturned = 25;
