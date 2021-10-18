import { NavProcessorConfig, NavSourceType } from 'msfssdk/instruments';
/**
 * A configuration for the G1000 NavProcessor, including a custrom simvar
 * publisher configured with your LNav simvars for GPS data publishing.
 */
export class NPConfig extends NavProcessorConfig {
    /**
     * Create an NPConfig.
     * @param bus The event bus
     * @param planner A flight planner for LNav data
     */
    constructor(bus, planner) {
        super();
        this.numGps = 0;
        this.numAdf = 1;
        this.courseIncEvents.add('AS1000_PFD_CRS_INC');
        this.courseIncEvents.add('AS1000_MFD_CRS_INC');
        this.courseDecEvents.add('AS1000_PFD_CRS_DEC');
        this.courseDecEvents.add('AS1000_MFD_CRS_DEC');
        this.additionalSources.push(new LNavNavSource(bus, planner));
    }
}
/** A custom nav data source that provides info from our flight plan manager. */
export class LNavNavSource {
    /**
     * Create an LNavNavSource.
     * @param bus An event bus.
     * @param planner The flight planner.
     */
    constructor(bus, planner) {
        this.srcId = { type: NavSourceType.Gps, index: 1 };
        this.hasCdi = true;
        this.hasDme = true;
        this.hasGlideslope = false;
        this.hasLocalizer = false;
        this.signal = null;
        this.activeCdi = false;
        this.isLocalizerFrequency = false;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.validHander = (valid, source) => { };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.identHandler = (ident, source) => { };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.brgHandler = (brg, source) => { };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.distHandler = (dist, source) => { };
        this._activeForCount = 0;
        this._dist = null;
        this._brg = null;
        this._ident = null;
        this._valid = false;
        this.planner = planner;
        const fpl = bus.getSubscriber();
        const lnav = bus.getSubscriber();
        fpl.on('fplActiveLegChange').handle((change) => {
            this.onLegChange(change);
        });
        lnav.on('lnavDis').withPrecision(1).handle((dist) => {
            this.distance = dist;
        });
        lnav.on('lnavBrgMag').whenChangedBy(1).handle((brg) => {
            this.bearing = brg;
        });
    }
    /**
     * Get the validity of the source.
     * @returns Whether the source is valid.
     */
    get valid() {
        return this._valid;
    }
    /**
     * Set the validity of the source.
     * @param valid Whether the source is valid.
     */
    set valid(valid) {
        this._valid = valid;
        this.validHander(this.valid, this.srcId);
    }
    /**
     * Get the distance to the active waypoint.
     * @returns The distance in nm or null.
     */
    get distance() {
        return this._dist;
    }
    /**
     * Set the tistance to the active waypoint.
     * @param dist The distance in nm or null.
     */
    set distance(dist) {
        this._dist = dist;
        this.activeBrg && this.distHandler(this.distance, this.srcId);
    }
    /**
     * Get the bearing to the current waypoint.
     * @returns The bearing in degrees or null.
     */
    get bearing() {
        return this._brg;
    }
    /**
     * Set the bearing to the current waypoint.
     * @param brg The bearing in degrees.
     */
    set bearing(brg) {
        this._brg = brg;
        this.activeBrg && this.brgHandler(this.bearing, this.srcId);
    }
    /**
     * Get the ident of the current waypoint.
     * @returns The ident as a string or null.
     */
    get ident() {
        return this._ident;
    }
    /**
     * Set the ident of the current waypoint.
     * @param ident The ident as a string or null.
     */
    set ident(ident) {
        this._ident = ident;
        if (ident === null) {
            this.valid = false;
        }
        else {
            this.valid = true;
        }
        this.activeBrg && this.identHandler(this.ident, this.srcId);
    }
    /**
     * Get active bearing status.
     * @returns Whether we are active for bearing data.
     */
    get activeBrg() {
        return this._activeForCount > 0;
    }
    /**
     * Set active bearing status.
     */
    set activeBrg(active) {
        if (active) {
            this._activeForCount++;
        }
        else if (this._activeForCount > 0) {
            this._activeForCount--;
        }
        if (!this.activeBrg) {
            this.brgHandler(null, this.srcId);
            this.distHandler(null, this.srcId);
            this.identHandler(null, this.srcId);
        }
        else {
            this.brgHandler(this.bearing, this.srcId);
            this.distHandler(this.distance, this.srcId);
            // See if we need to update our ident info before displaying.
            const plan = this.planner.hasActiveFlightPlan() ? this.planner.getActiveFlightPlan() : undefined;
            if (plan && plan.length > 0 && plan.activeLateralLeg < plan.length) {
                const ident = plan.getLeg(plan.activeLateralLeg).name;
                if (ident) {
                    this.ident = ident;
                }
            }
            this.identHandler(this.ident, this.srcId);
        }
    }
    /**
     * Handle a change in the active leg.
     * @param change The change event.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onLegChange(change) {
        const plan = this.planner.getActiveFlightPlan();
        if (plan.length > 0 && plan.activeLateralLeg < plan.length) {
            const leg = plan.getLeg(plan.activeLateralLeg);
            this.ident = leg.name ? leg.name : null;
        }
    }
}
