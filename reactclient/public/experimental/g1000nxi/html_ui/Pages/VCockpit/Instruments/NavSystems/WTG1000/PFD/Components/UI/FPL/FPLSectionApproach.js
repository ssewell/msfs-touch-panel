import { FSComponent, Subject } from 'msfssdk';
import { Fms } from '../../../../Shared/FlightPlan/Fms';
import { List } from '../../../../Shared/UI/List';
import { FPLHeaderApproach } from '../../../../Shared/UI/FPL/FPLHeaderApproach';
import { FPLSection } from './FPLSection';
import { ApproachNameDisplay } from '../../../../Shared/UI/FPL/ApproachNameDisplay';
import { FmsUtils } from '../../../../Shared/FlightPlan/FmsUtils';
/**
 * Render the approach phase of a flight plan.
 */
export class FPLApproach extends FPLSection {
    constructor() {
        super(...arguments);
        /**
         * Callback for when CLR is pressed on the header.
         * @returns true if event was handled, false otherwise.
         */
        this.onClrHeader = () => {
            const plan = this.props.fms.getPrimaryFlightPlan();
            const airport = this.props.facilities.destinationFacility;
            const approach = airport ? FmsUtils.getApproachFromPlan(plan, airport) : undefined;
            if (approach) {
                Fms.viewService.open('MessageDialog', true).setInput({
                    renderContent: () => {
                        return (FSComponent.buildComponent("div", { style: 'display: inline-block;' },
                            "Remove ",
                            FSComponent.buildComponent(ApproachNameDisplay, { approach: Subject.create(approach) }),
                            " from flight plan?"));
                    },
                    hasRejectButton: true
                })
                    .onAccept.on((sender, accept) => {
                    if (accept) {
                        this.props.fms.removeApproach();
                        return true;
                    }
                });
            }
            return false;
        };
    }
    /** @inheritdoc */
    getEmptyRowVisbility() {
        return false;
    }
    /** @inheritdoc */
    onHeaderFocused() {
        var _a;
        super.onHeaderFocused();
        const focus = ((_a = this.segment) === null || _a === void 0 ? void 0 : _a.legs.length) ? this.segment.legs : this.getFlightPlanFocusWhenEmpty();
        this.props.onFlightPlanFocusSelected && this.props.onFlightPlanFocusSelected(focus);
    }
    /** @inheritdoc */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    collapseLegs(setHidden) {
        //noop
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("div", { id: 'fpln-approach' },
            FSComponent.buildComponent(FPLHeaderApproach, { ref: this.headerRef, onRegister: this.register, onClr: this.onClrHeader, fms: this.props.fms, facilities: this.props.facilities, onFocused: this.onHeaderFocused.bind(this) }),
            FSComponent.buildComponent(List, { ref: this.listRef, onRegister: this.register, data: this.legs, renderItem: this.renderItem, onItemSelected: this.onLegItemSelected.bind(this), scrollContainer: this.props.scrollContainer })));
    }
}
