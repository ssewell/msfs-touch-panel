import { GeoCircle, GeoPoint, UnitType } from 'msfssdk';
import { FlightPathUtils } from 'msfssdk/flightplan';
/**
 * An abstract implementation of Waypoint.
 */
export class AbstractWaypoint {
    // eslint-disable-next-line jsdoc/require-jsdoc
    equals(other) {
        return this.uid === other.uid;
    }
}
/**
 * A waypoint with custom defined lat/lon coordinates.
 */
export class CustomWaypoint extends AbstractWaypoint {
    /**
     * Constructor.
     * @param lat The latitude of this waypoint.
     * @param lon The longitude of this waypoint.
     * @param uidPrefix The prefix of this waypoint's UID.
     */
    constructor(lat, lon, uidPrefix) {
        super();
        this._location = new GeoPoint(lat, lon);
        this._uid = `${uidPrefix}[${this.location.lat},${this.location.lon}]`;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    get location() {
        return this._location.readonly;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    get uid() {
        return this._uid;
    }
}
/**
 * A waypoint associated with a facility.
 */
export class FacilityWaypoint extends AbstractWaypoint {
    /**
     * Constructor.
     * @param facility The facility associated with this waypoint.
     */
    constructor(facility) {
        super();
        this.facility = facility;
        this._location = new GeoPoint(facility.lat, facility.lon);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    get location() {
        return this._location.readonly;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    get uid() {
        return this.facility.icao;
    }
}
/**
 * Airport size.
 */
export var AirportSize;
(function (AirportSize) {
    AirportSize["Large"] = "Large";
    AirportSize["Medium"] = "Medium";
    AirportSize["Small"] = "Small";
})(AirportSize || (AirportSize = {}));
/**
 * A waypoint associated with an airport.
 */
export class AirportWaypoint extends FacilityWaypoint {
    /**
     * Constructor.
     * @param airport The airport associated with this waypoint.
     */
    constructor(airport) {
        super(airport);
        this.longestRunway = AirportWaypoint.getLongestRunway(airport);
        this.size = AirportWaypoint.getAirportSize(airport, this.longestRunway);
    }
    /**
     * Gets the longest runway at an airport.
     * @param airport An airport.
     * @returns the longest runway at an airport, or null if the airport has no runways.
     */
    static getLongestRunway(airport) {
        if (airport.runways.length === 0) {
            return null;
        }
        return airport.runways.reduce((a, b) => a.length > b.length ? a : b);
    }
    /**
     * Gets the size of an airport.
     * @param airport An airport.
     * @param longestRunway The longest runway at the airport.
     * @returns the size of the airport.
     */
    static getAirportSize(airport, longestRunway) {
        if (!longestRunway) {
            return AirportSize.Small;
        }
        const longestRwyLengthFeet = UnitType.METER.convertTo(longestRunway.length, UnitType.FOOT);
        return longestRwyLengthFeet >= 8100 ? AirportSize.Large
            : (longestRwyLengthFeet >= 5000 || airport.towered) ? AirportSize.Medium
                : AirportSize.Small;
    }
}
/**
 * A flight path waypoint.
 */
export class FlightPathWaypoint extends CustomWaypoint {
    /**
     * Constructor.
     * @param lat The latitude of this waypoint.
     * @param lon The longitude of this waypoint.
     * @param ident The ident string of this waypoint.
     */
    constructor(lat, lon, ident) {
        super(lat, lon, `${FlightPathWaypoint.UID_PREFIX}_${ident}`);
        this.ident = ident;
    }
}
FlightPathWaypoint.UID_PREFIX = 'FLPTH';
/**
 * A VNAV TOD/BOD waypoint.
 */
export class VNavWaypoint extends AbstractWaypoint {
    /**
     * Constructor.
     * @param leg The leg that the VNAV waypoint is contained in.
     * @param distanceFromEnd The distance along the flight path from the end of the leg to the location of the waypoint,
     * in meters.
     * @param type The type of VNAV leg.
     */
    constructor(leg, distanceFromEnd, type) {
        super();
        this._uid = VNavWaypoint.uidMap[type];
        this._location = this.getWaypointLocation(leg, distanceFromEnd);
    }
    /**
     * Gets the waypoint's location in space.
     * @param leg The leg that the waypoint resides in.
     * @param distanceFromEnd The distance along the flight path from the end of the leg to the location of the waypoint,
     * in meters.
     * @returns The waypoint's location.
     */
    getWaypointLocation(leg, distanceFromEnd) {
        const out = new GeoPoint(0, 0);
        if (leg.calculated !== undefined) {
            let vectorIndex = leg.calculated.flightPath.length - 1;
            const ingressTurn = leg.calculated.ingressTurn;
            const egressTurn = leg.calculated.egressTurn;
            while (vectorIndex >= 0) {
                const vector = leg.calculated.flightPath[vectorIndex];
                const start = VNavWaypoint.vec3Cache[0];
                const end = VNavWaypoint.vec3Cache[1];
                if (vectorIndex === leg.calculated.flightPath.length - 1 && egressTurn.radius !== 0) {
                    if (egressTurn.distance >= distanceFromEnd) {
                        const egressCircle = FlightPathUtils.setGeoCircleFromVector(egressTurn, VNavWaypoint.geoCircleCache[0]);
                        const turnEnd = VNavWaypoint.geoPointCache[0].set(egressTurn.endLat, egressTurn.endLon);
                        return egressCircle.offsetDistanceAlong(turnEnd, UnitType.METER.convertTo(-distanceFromEnd, UnitType.GA_RADIAN), out);
                    }
                    else {
                        distanceFromEnd -= egressTurn.distance;
                        GeoPoint.sphericalToCartesian(egressTurn.startLat, egressTurn.startLon, end);
                    }
                }
                else {
                    GeoPoint.sphericalToCartesian(vector.endLat, vector.endLon, end);
                }
                if (vectorIndex === 0 && ingressTurn.radius !== 0) {
                    GeoPoint.sphericalToCartesian(ingressTurn.endLat, ingressTurn.endLon, start);
                }
                else {
                    GeoPoint.sphericalToCartesian(vector.startLat, vector.startLon, start);
                }
                const circle = FlightPathUtils.setGeoCircleFromVector(vector, VNavWaypoint.geoCircleCache[0]);
                const vectorDistance = UnitType.GA_RADIAN.convertTo(circle.distanceAlong(start, end), UnitType.METER);
                if (vectorDistance >= distanceFromEnd) {
                    return circle.offsetDistanceAlong(end, UnitType.METER.convertTo(-distanceFromEnd, UnitType.GA_RADIAN), out);
                }
                else {
                    distanceFromEnd -= vectorDistance;
                }
                if (vectorIndex === 0) {
                    if (ingressTurn.radius !== 0) {
                        if (ingressTurn.distance >= distanceFromEnd) {
                            const ingressCircle = FlightPathUtils.setGeoCircleFromVector(ingressTurn, VNavWaypoint.geoCircleCache[0]);
                            const turnEnd = VNavWaypoint.geoPointCache[0].set(ingressTurn.endLat, ingressTurn.endLon);
                            return ingressCircle.offsetDistanceAlong(turnEnd, UnitType.METER.convertTo(-distanceFromEnd, UnitType.GA_RADIAN), new GeoPoint(0, 0));
                        }
                        else {
                            return out.set(ingressTurn.startLat, ingressTurn.startLon);
                        }
                    }
                    else {
                        return out.set(vector.startLat, vector.startLon);
                    }
                }
                vectorIndex--;
            }
        }
        return out;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    get location() {
        return this._location.readonly;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    get uid() {
        return this._uid;
    }
}
VNavWaypoint.uidMap = { 'tod': 'vnav-tod', 'bod': 'vnav-bod' };
VNavWaypoint.vec3Cache = [new Float64Array(3), new Float64Array(3)];
VNavWaypoint.geoPointCache = [new GeoPoint(0, 0)];
VNavWaypoint.geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];
