import { FmsUtils } from '../../FlightPlan/FmsUtils';
import { FPLStringHeader } from './FPLStringHeader';
/**
 * An FPL section header for arrivals.
 */
export class FPLHeaderArrival extends FPLStringHeader {
    /** @inheritdoc */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setCollapsed(setCollapsed) {
        //noop
    }
    /** @inheritdoc */
    updateName() {
        var _a;
        let name;
        const plan = this.props.fms.getPrimaryFlightPlan();
        const arrival = (_a = this.props.facilities.arrivalFacility) === null || _a === void 0 ? void 0 : _a.arrivals[plan.procedureDetails.arrivalIndex];
        if (arrival) {
            name = FmsUtils.getArrivalNameAsString(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.props.facilities.arrivalFacility, arrival, plan.procedureDetails.arrivalTransitionIndex, plan.procedureDetails.destinationRunway);
        }
        else {
            name = '';
        }
        this.textSub.set(name);
    }
}
