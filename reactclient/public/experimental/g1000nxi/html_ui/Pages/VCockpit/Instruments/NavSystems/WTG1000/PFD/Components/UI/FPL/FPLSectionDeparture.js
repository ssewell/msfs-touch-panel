import { FSComponent } from 'msfssdk';
import { ICAO } from 'msfssdk/navigation';
import { FlightPlanSegmentType } from 'msfssdk/flightplan';
import { Fms } from '../../../../Shared/FlightPlan/Fms';
import { List } from '../../../../Shared/UI/List';
import { FPLEmptyRow } from '../../../../Shared/UI/FPL/FPLEmptyRow';
import { FPLHeaderDeparture } from '../../../../Shared/UI/FPL/FPLHeaderDeparture';
import { FPLSection } from './FPLSection';
import { FmsUtils } from '../../../../Shared/FlightPlan/FmsUtils';
/**
 * Render the departure phase of the flight plan.
 */
export class FPLDeparture extends FPLSection {
    constructor() {
        super(...arguments);
        /** @inheritdoc */
        this.onUpperKnobLeg = (node) => {
            const legIndex = this.listRef.instance.getListItemIndex(node);
            const plan = this.props.fms.getFlightPlan();
            const origin = plan.originAirport;
            if (origin && legIndex === 0) {
                Fms.viewService.open('SetRunway', true).setInput(this.props.facilities.originFacility)
                    .onAccept.on((sender, data) => {
                    this.props.fms.setOrigin(this.props.facilities.originFacility, data);
                });
            }
            else {
                this.onUpperKnobLegBase(node);
            }
        };
        /** Callback firing when upper knob event on the header is fired. */
        this.onUpperKnobEmptyRow = () => {
            const plan = this.props.fms.getFlightPlan();
            const origin = plan.originAirport;
            if (!origin || origin === undefined) {
                Fms.viewService.open('WptInfo', true)
                    .onAccept.on((sender, fac) => {
                    // check if its airportfacility interface
                    if ('bestApproach' in fac) {
                        this.props.fms.setOrigin(fac);
                        Fms.viewService.open('SetRunway', true).setInput(fac)
                            .onAccept.on((subSender, data) => {
                            this.props.fms.setOrigin(this.props.facilities.originFacility, data);
                        });
                    }
                    else {
                        const firstEnrSegment = this.props.fms.getFlightPlan().segmentsOfType(FlightPlanSegmentType.Enroute).next().value;
                        if (firstEnrSegment) {
                            this.props.fms.insertWaypoint(firstEnrSegment.segmentIndex, fac, 0);
                        }
                    }
                });
            }
        };
        /**
         * Callback firing when CLR on the header is pressed.
         * @returns true if CLR is handeled, false if not.
         */
        this.onClrHeader = () => {
            const plan = this.props.fms.getPrimaryFlightPlan();
            const airport = this.props.facilities.originFacility;
            const departure = airport === null || airport === void 0 ? void 0 : airport.departures[plan.procedureDetails.departureIndex];
            if (departure) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const name = FmsUtils.getDepartureNameAsString(airport, departure, plan.procedureDetails.departureTransitionIndex, plan.procedureDetails.originRunway);
                Fms.viewService.open('MessageDialog', true).setInput({ inputString: `Remove ${name} from flight plan?`, hasRejectButton: true })
                    .onAccept.on((sender, accept) => {
                    if (accept) {
                        this.props.fms.removeDeparture();
                        return true;
                    }
                });
            }
            return false;
        };
        /** @inheritdoc */
        this.onClrLeg = (node) => {
            const legIndex = this.listRef.instance.getListItemIndex(node);
            const plan = this.props.fms.getFlightPlan();
            const origin = plan.originAirport;
            if (origin && legIndex == 0) {
                Fms.viewService.open('MessageDialog', true).setInput({ inputString: `Remove ${ICAO.getIdent(origin)}?`, hasRejectButton: true })
                    .onAccept.on((sender, accept) => {
                    if (accept) {
                        this.props.fms.setOrigin(undefined);
                        return true;
                    }
                });
            }
            else {
                return this.onClrLegBase(node);
            }
            return false;
        };
    }
    /** @inheritdoc */
    getEmptyRowVisbility() {
        const plan = this.props.fms.getFlightPlan(0);
        const origin = plan.originAirport;
        const hasRunway = plan.procedureDetails.originRunway != undefined;
        return !hasRunway && (!origin || origin == '');
    }
    /** @inheritdoc */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    collapseLegs(setHidden) {
        //noop
    }
    /** @inheritdoc */
    onHeaderFocused() {
        var _a;
        super.onHeaderFocused();
        let focus;
        if (this.segment && this.segment.segmentType === FlightPlanSegmentType.Departure) {
            focus = ((_a = this.segment) === null || _a === void 0 ? void 0 : _a.legs.length) ? this.segment.legs : this.getFlightPlanFocusWhenEmpty();
        }
        else {
            // Only an origin airport exists.
            const origin = this.props.facilities.originFacility;
            focus = origin !== null && origin !== void 0 ? origin : this.getFlightPlanFocusWhenEmpty();
        }
        this.props.onFlightPlanFocusSelected && this.props.onFlightPlanFocusSelected(focus);
    }
    /**
     * Render the departure section.
     * @returns A VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { id: 'fpln-departure' },
            FSComponent.buildComponent(FPLHeaderDeparture, { ref: this.headerRef, onRegister: this.register, facilities: this.props.facilities, fms: this.props.fms, onClr: this.onClrHeader, onFocused: this.onHeaderFocused.bind(this) }),
            FSComponent.buildComponent(List, { ref: this.listRef, onRegister: this.register, data: this.legs, renderItem: this.renderItem, onItemSelected: this.onLegItemSelected.bind(this), scrollContainer: this.props.scrollContainer }),
            FSComponent.buildComponent(FPLEmptyRow, { onRegister: this.register, ref: this.emptyRowRef, onUpperKnobInc: this.onUpperKnobEmptyRow, onFocused: this.onEmptyRowFocused.bind(this) })));
    }
}
