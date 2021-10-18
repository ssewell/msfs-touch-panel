import { FSComponent } from 'msfssdk';
import { ICAO } from 'msfssdk/navigation';
import { Fms } from '../../../../Shared/FlightPlan/Fms';
import { List } from '../../../../Shared/UI/List';
import { FPLEmptyRow } from '../../../../Shared/UI/FPL/FPLEmptyRow';
import { FPLHeaderDestination } from '../../../../Shared/UI/FPL/FPLHeaderDestination';
import { FPLSection } from './FPLSection';
/**
 * Render the destination info for a flight plan.
 */
export class FPLDestination extends FPLSection {
    constructor() {
        super(...arguments);
        /** @inheritdoc */
        this.onUpperKnobLegBase = (node) => {
            const legIndex = this.listRef.instance.getListItemIndex(node);
            const plan = this.props.fms.getFlightPlan();
            const destination = plan.destinationAirport;
            if (destination && legIndex == 0) {
                Fms.viewService.open('SetRunway', true).setInput(this.props.facilities.destinationFacility)
                    .onAccept.on((subSender, data) => {
                    this.props.fms.setDestination(this.props.facilities.destinationFacility, data);
                });
            }
        };
        /** Callback firing when upper knob event on the header is fired. */
        this.onUpperKnobEmptyRow = () => {
            const plan = this.props.fms.getFlightPlan();
            const destination = plan.destinationAirport;
            if (!destination || destination === undefined) {
                // EMPTY ROW
                Fms.viewService.open('WptInfo', true)
                    .onAccept.on((sender, fac) => {
                    this.props.fms.setDestination(fac);
                    Fms.viewService.open('SetRunway', true).setInput(fac).onAccept.on((subSender, data) => {
                        this.props.fms.setDestination(this.props.facilities.destinationFacility, data);
                    });
                });
            }
        };
        /** @inheritdoc */
        this.onClrLeg = (node) => {
            const legIndex = this.listRef.instance.getListItemIndex(node);
            const plan = this.props.fms.getFlightPlan();
            const destination = plan.destinationAirport;
            if (destination && legIndex == 0) {
                Fms.viewService.open('MessageDialog', true).setInput({ inputString: `Remove ${ICAO.getIdent(destination)}?`, hasRejectButton: true }).onAccept.on((sender, accept) => {
                    if (accept) {
                        this.props.fms.setDestination(undefined);
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
        const plan = this.props.fms.getFlightPlan();
        const destination = plan.destinationAirport;
        const hasRunway = plan.procedureDetails.destinationRunway != undefined;
        const noAppArr = plan.procedureDetails.arrivalIndex < 0 && plan.procedureDetails.approachIndex < 0;
        return noAppArr && !hasRunway && (!destination || destination == '');
    }
    /** @inheritdoc */
    onHeaderFocused() {
        super.onHeaderFocused();
        const destination = this.props.facilities.destinationFacility;
        const focus = destination !== null && destination !== void 0 ? destination : this.getFlightPlanFocusWhenEmpty();
        this.props.onFlightPlanFocusSelected && this.props.onFlightPlanFocusSelected(focus);
    }
    /** @inheritdoc */
    collapseLegs() {
        //noop
    }
    /**
     * Render a destination line.
     * @returns a VNode
     */
    render() {
        return (FSComponent.buildComponent("div", { id: 'fpln-destination' },
            FSComponent.buildComponent(FPLHeaderDestination, { ref: this.headerRef, onRegister: this.register, fms: this.props.fms, facilities: this.props.facilities, onFocused: this.onHeaderFocused.bind(this) }),
            FSComponent.buildComponent(List, { ref: this.listRef, onRegister: this.register, data: this.legs, renderItem: this.renderItem, onItemSelected: this.onLegItemSelected.bind(this), scrollContainer: this.props.scrollContainer }),
            FSComponent.buildComponent(FPLEmptyRow, { onRegister: this.register, ref: this.emptyRowRef, onUpperKnobInc: this.onUpperKnobEmptyRow, onFocused: this.onEmptyRowFocused.bind(this) })));
    }
}
