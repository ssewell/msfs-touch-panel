import { FSComponent } from 'msfssdk';
import { FlightPlanSegmentType } from 'msfssdk/flightplan';
import { Fms } from '../../../../Shared/FlightPlan/Fms';
import { List } from '../../../../Shared/UI/List';
import { FPLEmptyRow } from '../../../../Shared/UI/FPL/FPLEmptyRow';
import { FPLHeaderEnroute } from '../../../../Shared/UI/FPL/FPLHeaderEnroute';
import { FPLSection } from './FPLSection';
/** Render the enroute phase of the flight plan. */
export class FPLEnroute extends FPLSection {
    constructor() {
        super(...arguments);
        this.isCollapsed = false;
        /**
         * Callback firing when CLR on the header is pressed.
         * @returns true if CLR is handeled, false if not.
         */
        this.onClrHeader = () => {
            if (this.segment !== undefined && this.segment.airway !== undefined) {
                Fms.viewService.open('MessageDialog', true).setInput({ inputString: `Remove ${this.segment.airway} from flight plan?`, hasRejectButton: true })
                    .onAccept.on((sender, accept) => {
                    if (accept) {
                        this.props.fms.removeAirway(this.segmentIndex.get());
                        return true;
                    }
                });
            }
            return false;
        };
    }
    /** @inheritdoc */
    getEmptyRowVisbility() {
        var _a;
        let showEmptyRow = true;
        const plan = this.props.fms.getFlightPlan();
        const segmentIndex = this.segmentIndex.get();
        if (((_a = this.segment) === null || _a === void 0 ? void 0 : _a.airway) !== undefined) {
            showEmptyRow = false;
        }
        else if (segmentIndex + 1 < plan.segmentCount && plan.getSegment(segmentIndex + 1).airway !== undefined) {
            showEmptyRow = false;
        }
        return showEmptyRow;
    }
    /**
     * Adds a leg to the flight plan display segment.
     * @param index The index to add at.
     * @param leg The leg to add.
     */
    addLeg(index, leg) {
        super.addLeg(index, leg);
        this.updateHeader();
        this.updateAirwayLegs();
    }
    /**
     * Removes a leg from the flight plan display segment.
     * @param index The index to remove at.
     */
    removeLeg(index) {
        super.removeLeg(index);
        this.updateHeader();
        this.updateAirwayLegs();
    }
    /**
     * Updates this section's airway legs.
     */
    updateAirwayLegs() {
        var _a, _b;
        if (((_a = this.segment) === null || _a === void 0 ? void 0 : _a.airway) === undefined) {
            return;
        }
        for (let l = 0; l < this.legs.length; l++) {
            const leg = this.legs.tryGet(l);
            if (leg) {
                const info = { isAirwayFix: true };
                leg.apply({ isAirwayFix: true });
                if (leg.get().legDefinition.name == ((_b = this.segment) === null || _b === void 0 ? void 0 : _b.airway.split('.')[1])) {
                    info.isAirwayExitFix = true;
                }
                leg.apply(info);
            }
        }
    }
    /**
     * Method called to collapse or uncollapse this section.
     * @param setCollapsed is whether to set the legs hidden or not
     */
    collapseLegs(setCollapsed) {
        for (let i = 0; i < this.legs.getArray().length; i++) {
            const leg = this.legs.tryGet(i);
            if (leg !== undefined) {
                leg.apply({ isCollapsed: setCollapsed });
            }
        }
        this.isCollapsed = setCollapsed;
        this.headerRef.instance.setCollapsed(setCollapsed);
    }
    /** @inheritdoc */
    onHeaderFocused() {
        var _a, _b, _c;
        super.onHeaderFocused();
        let focus = null;
        if (((_a = this.segment) === null || _a === void 0 ? void 0 : _a.airway) === undefined) {
            const plan = this.props.fms.getFlightPlan();
            for (const segment of plan.segmentsOfType(FlightPlanSegmentType.Enroute)) {
                if (segment.legs.length > 0) {
                    (focus !== null && focus !== void 0 ? focus : (focus = [])).push(...segment.legs);
                }
            }
        }
        else {
            focus = (_c = (_b = this.segment) === null || _b === void 0 ? void 0 : _b.legs) !== null && _c !== void 0 ? _c : null;
        }
        this.props.onFlightPlanFocusSelected && this.props.onFlightPlanFocusSelected(focus);
    }
    /**
     * Render an enroute container.
     * @returns a VNode
     */
    render() {
        return (FSComponent.buildComponent("div", { id: 'fpln-enroute' },
            FSComponent.buildComponent(FPLHeaderEnroute, { ref: this.headerRef, onRegister: this.register, facilities: this.props.facilities, fms: this.props.fms, onClr: this.onClrHeader, segmentIndex: this.segmentIndex, onFocused: this.onHeaderFocused.bind(this) }),
            FSComponent.buildComponent(List, { ref: this.listRef, onRegister: this.register, data: this.legs, renderItem: this.renderItem, onItemSelected: this.onLegItemSelected.bind(this), scrollContainer: this.props.scrollContainer }),
            FSComponent.buildComponent(FPLEmptyRow, { onRegister: this.register, ref: this.emptyRowRef, onUpperKnobInc: this.onUpperKnobLegBase, onFocused: this.onEmptyRowFocused.bind(this) })));
    }
}
