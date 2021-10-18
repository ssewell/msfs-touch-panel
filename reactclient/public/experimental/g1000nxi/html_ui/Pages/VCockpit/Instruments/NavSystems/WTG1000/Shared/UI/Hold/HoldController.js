import { NavMath, UnitType } from 'msfssdk';
import { ICAO, LegType } from 'msfssdk/navigation';
import { FlightPlan } from 'msfssdk/flightplan';
import { FacilityWaypoint } from '../../Navigation/Waypoint';
/**
 * A controller for the Hold dialog.
 */
export class HoldController {
    /**
     * Creates an instance of a HoldController.
     * @param store The hold store to use with this instance.
     * @param fms The FMS to use with this instance.
     */
    constructor(store, fms) {
        this.store = store;
        this.fms = fms;
        store.indexes.sub(i => {
            const plan = this.fms.getFlightPlan();
            const def = plan.getSegment(i.segmentIndex).legs[i.legIndex];
            this.store.fixIcao.set(def.leg.fixIcao);
            try {
                this.fms.facLoader.getFacility(ICAO.getFacilityType(def.leg.fixIcao), def.leg.fixIcao)
                    .then(fac => this.store.waypoint.set(new FacilityWaypoint(fac)));
            }
            catch ( /** Continue */_a) { /** Continue */ }
        }, true);
    }
    /**
     * Resets the hold dialog data.
     */
    reset() {
        this.store.distance.set(4);
        this.store.time.set(60);
        this.store.isInbound.set(0);
        this.store.isTime.set(0);
        this.store.turnDirection.set(1);
        this.store.waypoint.set(null);
        this.store.fixIcao.set('');
    }
    /**
     * Accepts the currently defined hold and adds it to the flight plan.
     */
    accept() {
        const indexes = this.store.indexes.get();
        const isTime = this.store.isTime.get() === 0 ? true : false;
        const leg = FlightPlan.createLeg({
            type: LegType.HM,
            turnDirection: this.store.turnDirection.get() + 1,
            course: this.store.isInbound.get() === 1 ? NavMath.normalizeHeading(this.store.course.get() + 180) : this.store.course.get(),
            distance: isTime ? this.store.time.get().asUnit(UnitType.MINUTE) : this.store.distance.get().asUnit(UnitType.METER),
            distanceMinutes: isTime,
            fixIcao: this.store.fixIcao.get()
        });
        this.fms.addHold(indexes.segmentIndex, indexes.legIndex, leg);
        this.reset();
    }
    /**
     * Gets a hold direction UI string for a given inbound course.
     * @param course The inbound course to get the string for.
     * @returns A UI human readable course string.
     */
    getDirectionString(course) {
        if (course >= 0 && course < 22.5) {
            return 'South';
        }
        else if (course >= 22.5 && course < 67.5) {
            return 'Southwest';
        }
        else if (course >= 67.5 && course < 112.5) {
            return 'West';
        }
        else if (course >= 112.5 && course < 157.5) {
            return 'Northwest';
        }
        else if (course >= 157.5 && course < 202.5) {
            return 'North';
        }
        else if (course >= 202.5 && course < 247.5) {
            return 'Northeast';
        }
        else if (course >= 247.5 && course < 292.5) {
            return 'East';
        }
        else if (course >= 292.5 && course < 337.5) {
            return 'Southeast';
        }
        else {
            return 'South';
        }
    }
}
