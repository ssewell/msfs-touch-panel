import { FSComponent, Subject } from 'msfssdk';
import { ICAO } from 'msfssdk/navigation';
import { FmsUtils } from '../../FlightPlan/FmsUtils';
import { ApproachNameDisplay } from './ApproachNameDisplay';
import { FPLHeader } from './FPLHeader';
/**
 * An FPL section header for approaches.
 */
export class FPLHeaderApproach extends FPLHeader {
    constructor() {
        super(...arguments);
        this.airportSub = Subject.create(null);
        this.approachSub = Subject.create(null);
    }
    /** @inheritdoc */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setCollapsed(setCollapsed) {
        //noop
    }
    /** @inheritdoc */
    updateName() {
        const plan = this.props.fms.getPrimaryFlightPlan();
        const airport = this.props.facilities.destinationFacility;
        const approach = airport ? FmsUtils.getApproachFromPlan(plan, airport) : undefined;
        this.airportSub.set(airport !== null && airport !== void 0 ? airport : null);
        this.approachSub.set(approach !== null && approach !== void 0 ? approach : null);
        const nameLength = approach
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ? FmsUtils.getApproachNameAsString(approach).length + ICAO.getIdent(airport.icao).length + 1
            : 0;
        this.setEstimatedNameWidth(nameLength * FPLHeaderApproach.ESTIMATED_CHAR_WIDTH);
    }
    /** @inheritdoc */
    renderName() {
        return (FSComponent.buildComponent(ApproachNameDisplay, { approach: this.approachSub, airport: this.airportSub }));
    }
}
FPLHeaderApproach.ESTIMATED_CHAR_WIDTH = 13.2;
