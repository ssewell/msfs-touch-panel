import { ArraySubject, Subject } from 'msfssdk';
import { ICAO, RunwayUtils } from 'msfssdk/navigation';
/**
 *
 */
export class SetRunwayStore {
    /**
     * Constructor.
     */
    constructor() {
        /** A subject which provides this store's airport. */
        this.airport = Subject.create(null);
        this._airportIdent = Subject.create('');
        /** An array of runways at this store's airport. */
        this.oneWayRunways = ArraySubject.create([]);
        this.airport.sub(this.onAirportChanged.bind(this));
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** The ident of this store's airport. */
    get airportIdent() {
        return this._airportIdent;
    }
    /**
     * A callback which is called when this store's airport changes.
     * @param airport The new airport.
     */
    onAirportChanged(airport) {
        var _a;
        this._airportIdent.set(airport ? ICAO.getIdent(airport.icao) : '');
        const runways = (_a = airport === null || airport === void 0 ? void 0 : airport.runways.reduce((acc, runway, index) => {
            acc.push(...RunwayUtils.getOneWayRunways(runway, index));
            return acc;
        }, []).sort(RunwayUtils.sortRunways)) !== null && _a !== void 0 ? _a : [];
        runways.unshift(RunwayUtils.createEmptyOneWayRunway());
        this.oneWayRunways.set(runways);
    }
}
