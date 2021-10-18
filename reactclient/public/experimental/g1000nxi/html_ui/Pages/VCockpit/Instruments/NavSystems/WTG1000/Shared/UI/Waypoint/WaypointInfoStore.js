import { GeoPoint, UnitType, GeoPointSubject, NumberUnitSubject, ComputedSubject, Subject, NavMath, MagVar } from 'msfssdk';
import { ICAO } from 'msfssdk/navigation';
import { Regions } from '../../Navigation/Regions';
import { AirportWaypoint, FacilityWaypoint } from '../../Navigation/Waypoint';
/**
 * A store for commonly used waypoint info.
 */
export class WaypointInfoStore {
    /**
     * Constructor.
     * @param waypoint A subscribable which provides this store's waypoint. If not defined, this store's waypoint can
     * still be set via its .waypoint Subject.
     * @param planePos A subscribable which provides the current airplane position for this store. If not defined, then
     * this store will not provide distance- or bearing-to-waypoint information.
     */
    constructor(waypoint, planePos) {
        this.planePos = planePos;
        /** This store's current waypoint. */
        this.waypoint = Subject.create(null);
        this._location = GeoPointSubject.createFromGeoPoint(WaypointInfoStore.NULL_LOCATION.copy());
        this._name = ComputedSubject.create(null, (waypoint) => {
            if (waypoint) {
                if (waypoint instanceof FacilityWaypoint && waypoint.facility.name !== '') {
                    return Utils.Translate(waypoint.facility.name);
                }
            }
            return '__________';
        });
        this._region = ComputedSubject.create(null, (waypoint) => {
            if (waypoint instanceof FacilityWaypoint) {
                if (waypoint instanceof AirportWaypoint) {
                    // airports don't have region codes in their ICAO strings, we will try to grab the code from the first 2
                    // letters of the ident. However, some airports (e.g. in the US and those w/o 4-letter idents) don't use the
                    // region code for the ident, so we need a third fallback, which is to just display the city name instead.
                    const airport = waypoint.facility;
                    const ident = ICAO.getIdent(airport.icao).trim();
                    let text = ident.length === 4 ? Regions.getName(ident.substr(0, 2)) : '';
                    if (text === '' && airport.city !== '') {
                        text = airport.city.split(', ').map(name => Utils.Translate(name)).join(', ');
                    }
                    if (text) {
                        return text;
                    }
                }
                else {
                    return Regions.getName(waypoint.facility.icao.substr(1, 2));
                }
            }
            return '__________';
        });
        this._city = ComputedSubject.create(null, (waypoint) => {
            if (waypoint instanceof FacilityWaypoint && waypoint.facility.city !== '') {
                return waypoint.facility.city.split(', ').map(name => Utils.Translate(name)).join(', ');
            }
            return '__________';
        });
        this._distance = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(NaN));
        this._bearing = NumberUnitSubject.createFromNumberUnit(UnitType.DEGREE.createNumber(NaN));
        waypoint && waypoint.sub(wpt => { this.waypoint.set(wpt); }, true);
        this.waypoint.sub(this.onWaypointChanged.bind(this), true);
        planePos && planePos.sub(this.onPlanePosChanged.bind(this), true);
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** The location of this store's current waypoint. */
    get location() {
        return this._location;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** The name of this store's current waypoint. */
    get name() {
        return this._name;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** The region of this store's current waypoint. */
    get region() {
        return this._region;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** The city associated with this store's current waypoint. */
    get city() {
        return this._city;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** The distance from the airplane to this store's current waypoint. */
    get distance() {
        return this._distance;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** The true bearing from the airplane to this store's current waypoint. */
    get bearing() {
        return this._bearing;
    }
    /**
     * A callback which is called when this store's waypoint changes.
     * @param waypoint The new waypoint.
     */
    onWaypointChanged(waypoint) {
        var _a, _b;
        const planePos = (_b = (_a = this.planePos) === null || _a === void 0 ? void 0 : _a.get()) !== null && _b !== void 0 ? _b : WaypointInfoStore.NULL_LOCATION;
        this.updateLocation(waypoint);
        this.updateName(waypoint);
        this.updateRegion(waypoint);
        this.updateCity(waypoint);
        this.updateDistance(waypoint, planePos);
        this.updateBearing(waypoint, planePos);
    }
    /**
     * A callback which is called when this store's plane position changes.
     * @param planePos The new plane position.
     */
    onPlanePosChanged(planePos) {
        const waypoint = this.waypoint.get();
        if (waypoint) {
            this.updateDistance(waypoint, planePos);
            this.updateBearing(waypoint, planePos);
        }
    }
    /**
     * Updates this store's location information.
     * @param waypoint The store's current waypoint.
     */
    updateLocation(waypoint) {
        var _a;
        this._location.set((_a = waypoint === null || waypoint === void 0 ? void 0 : waypoint.location) !== null && _a !== void 0 ? _a : WaypointInfoStore.NULL_LOCATION);
    }
    /**
     * Updates this store's name information.
     * @param waypoint The store's current waypoint.
     */
    updateName(waypoint) {
        this._name.set(waypoint);
    }
    /**
     * Updates this store's region information.
     * @param waypoint The store's current waypoint.
     */
    updateRegion(waypoint) {
        this._region.set(waypoint);
    }
    /**
     * Updates this store's city information.
     * @param waypoint The store's current waypoint.
     */
    updateCity(waypoint) {
        this._city.set(waypoint);
    }
    /**
     * Updates this store's distance-to-waypoint information.
     * @param waypoint The store's current waypoint.
     * @param planePos The current position of the airplane.
     */
    updateDistance(waypoint, planePos) {
        if (!waypoint || isNaN(planePos.lat) || isNaN(planePos.lon)) {
            this._distance.set(NaN);
            return;
        }
        this._distance.set(waypoint.location.distance(planePos), UnitType.GA_RADIAN);
    }
    /**
     * Updates this store's bearing-to-waypoint information.
     * @param waypoint The store's current waypoint.
     * @param planePos The current position of the airplane.
     */
    updateBearing(waypoint, planePos) {
        if (!waypoint || isNaN(planePos.lat) || isNaN(planePos.lon)) {
            this._bearing.set(NaN);
            return;
        }
        const brg = NavMath.normalizeHeading(Math.round(planePos.bearingTo(waypoint.location) - MagVar.get(planePos)));
        this._bearing.set(brg === 0 ? 360 : brg);
    }
}
WaypointInfoStore.NULL_LOCATION = new GeoPoint(NaN, NaN);
