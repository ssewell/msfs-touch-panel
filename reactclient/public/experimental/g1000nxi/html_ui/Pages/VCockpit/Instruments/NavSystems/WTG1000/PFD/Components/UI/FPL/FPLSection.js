import { FSComponent, ArraySubject, Subject } from 'msfssdk';
import { LegType } from 'msfssdk/navigation';
import { FlightPlanSegmentType } from 'msfssdk/flightplan';
import { Fms } from '../../../../Shared/FlightPlan/Fms';
import { PageMenuDialog } from '../../../../Shared/UI/Dialogs/PageMenuDialog';
import { UiControlGroup } from '../../../../Shared/UI/UiControlGroup';
import { FixInfo } from './FixInfo';
import { FmsUtils } from '../../../../Shared/FlightPlan/FmsUtils';
import { ApproachNameDisplay } from '../../../../Shared/UI/FPL/ApproachNameDisplay';
/**
 * A flight plan detail section, representing a single phase of flight.
 *
 * Individual sections that need to render a dynamic list of fixes can extend
 * this for useful functionality.  They will need to, at the minimum, define
 * the type of segment they are by storing a FlightPlanSegmentType in the
 * segmentType variable.
 *
 * An additional hook is provided for a callback that can be used to render
 * the header for the section dynamically based on the section's needs, since
 * that is something that varies by section type.
 *
 * Descendents must remember to call super.onAfterRender() in their own
 * onAfterRender if they want the magic to happen.
 */
export class FPLSection extends UiControlGroup {
    constructor() {
        super(...arguments);
        /** A reference to the header line for the section. */
        this.headerRef = FSComponent.createRef();
        this.emptyRowRef = FSComponent.createRef();
        this.segmentIndex = Subject.create(this.props.segmentIndex);
        this.legs = ArraySubject.create();
        this.listRef = FSComponent.createRef();
        /**
         * Callback for when UpperKnob event happens on a leg.
         * @param node The FixInfo element.
         */
        this.onUpperKnobLegBase = (node) => {
            const idx = (node instanceof FixInfo) ? this.listRef.instance.getListItemIndex(node) : undefined;
            Fms.viewService.open('WptInfo', true)
                .onAccept.on((sender, fac) => {
                this.props.fms.insertWaypoint(this.segmentIndex.get(), fac, idx);
            });
        };
        /**
         * Callback to onUpperKnob on legs for override by sections
         * @param node The FixInfo element.
         */
        this.onUpperKnobLeg = (node) => {
            this.onUpperKnobLegBase(node);
        };
        /**
         * Callback for when CLR event happens on a leg.
         * @param node The FixInfo element.
         * @returns A boolean indicating if the CLR was handled.
         */
        this.onClrLegBase = (node) => {
            const idx = this.listRef.instance.getListItemIndex(node);
            const displayLeg = this.legs.tryGet(idx);
            const isActive = displayLeg !== undefined && displayLeg.get().isActive;
            const selectedLeg = node.props.data.get().legDefinition;
            const isHoldOrPtLegType = [LegType.HM, LegType.HF, LegType.HA, LegType.PI].includes(selectedLeg.leg.type);
            if (selectedLeg !== undefined) {
                Fms.viewService.open('MessageDialog', true).setInput({ inputString: `Remove ${selectedLeg === null || selectedLeg === void 0 ? void 0 : selectedLeg.name}?`, hasRejectButton: true }).onAccept.on((sender, accept) => {
                    if (accept) {
                        if (isActive && !isHoldOrPtLegType && !Simplane.getIsGrounded()) {
                            this.props.fms.buildRandomDirectTo(selectedLeg.leg.fixIcao);
                        }
                        this.props.fms.deleteWaypoint(this.segmentIndex.get(), idx);
                        if (isActive && isHoldOrPtLegType) {
                            this.props.fms.activateLeg(this.segmentIndex.get(), idx);
                        }
                        return true;
                    }
                });
            }
            return false;
        };
        /**
         * Callback to onClr on legs for override by sections
         * @param node The FixInfo element.
         * @returns A boolean indicating if the CLR was handled.
         */
        this.onClrLeg = (node) => {
            return this.onClrLegBase(node);
        };
        /**
         * Renders a Leg in the flight plan.
         * @param data The data object for this leg.
         * @param registerFn The control register function.
         * @returns The rendered VNode.
         */
        this.renderItem = (data, registerFn) => {
            if (this.props.isExtendedView) {
                return FSComponent.buildComponent(FixInfo, { onRegister: registerFn, onUpperKnobInc: this.onUpperKnobLeg, onClr: this.onClrLeg, data: data, isExtended: true });
            }
            else {
                return FSComponent.buildComponent(FixInfo, { onRegister: registerFn, onUpperKnobInc: this.onUpperKnobLeg, onClr: this.onClrLeg, data: data });
            }
        };
    }
    /** @inheritdoc */
    onBeforeRender() {
        if (this.props.fms.getFlightPlan().getSegment(this.segmentIndex.get())) {
            this.segment = this.props.fms.getFlightPlan().getSegment(this.segmentIndex.get());
        }
        super.onBeforeRender();
        if (this.props.scrollContainer) {
            this.scrollController.registerScrollContainer(this.props.scrollContainer.instance);
        }
    }
    /**
     * Gets the ref to the list component for the section.
     * @returns list ref
     */
    getListRef() {
        return this.listRef;
    }
    /**
     * An event called when the dto button is pressed.
     * @returns True if the event was handled in this section.
     */
    onDirectTo() {
        try {
            if (this.hasSelection() && !this.isHeaderSelected() && this.segment !== undefined) {
                const canDirectTo = this.props.fms.canDirectTo(this.segmentIndex.get(), this.listRef.instance.getSelectedIndex());
                if (canDirectTo) {
                    const directToInputData = {
                        segmentIndex: this.segmentIndex.get(),
                        legIndex: this.listRef.instance.getSelectedIndex(),
                        icao: this.legs.get(this.listRef.instance.getSelectedIndex()).get().legDefinition.leg.fixIcao,
                    };
                    Fms.viewService.open('DirectTo', false).setInput(directToInputData);
                    return true;
                }
                else {
                    const selectedLeg = this.segment.legs[this.listRef.instance.getSelectedIndex()];
                    if (selectedLeg !== undefined) {
                        Fms.viewService.open('MessageDialog', true).setInput({ inputString: `Activate Leg to ${selectedLeg.name}?`, hasRejectButton: true }).onAccept.on((sender, accept) => {
                            if (accept) {
                                this.props.fms.activateLeg(this.segmentIndex.get(), this.listRef.instance.getSelectedIndex());
                            }
                        });
                    }
                    return true;
                }
            }
        }
        catch (error) {
            return false;
            // throw something?
        }
        return false;
    }
    /**
     * An event called when the menu button is pressed.
     * @returns True if the event was handled in this section.
     */
    onMenu() {
        if (this.hasSelection() && this.segment !== undefined) {
            const dialog = Fms.viewService.open(PageMenuDialog.name, true);
            const plan = this.props.fms.getFlightPlan();
            dialog.setMenuItems([
                {
                    id: 'activate-leg',
                    renderContent: () => FSComponent.buildComponent("span", null, "Activate Leg"),
                    isEnabled: !this.isHeaderSelected() && !this.isEmptyRowSelected(),
                    action: () => {
                        if (this.segment !== undefined) {
                            const selectedLegIndex = this.listRef.instance.getSelectedIndex();
                            const selectedLeg = this.segment.legs[selectedLegIndex];
                            if (selectedLeg !== undefined) {
                                Fms.viewService.open('MessageDialog', true).setInput({ inputString: `Activate Leg to ${selectedLeg.name}?`, hasRejectButton: true }).onAccept.on((sender, accept) => {
                                    if (accept) {
                                        this.props.fms.activateLeg(this.segmentIndex.get(), selectedLegIndex);
                                    }
                                });
                            }
                        }
                    }
                },
                {
                    id: 'load-airway',
                    renderContent: () => FSComponent.buildComponent("span", null, "Load Airway"),
                    isEnabled: this.canAirwayInsert(this.segmentIndex.get(), this.isEmptyRowSelected()),
                    action: () => {
                        const airwayInsertData = this.getAirwayInsertData(this.segmentIndex.get(), this.listRef.instance.getSelectedIndex(), this.isEmptyRowSelected());
                        Fms.viewService.open('SelectAirway', true).setInput(airwayInsertData);
                    }
                },
                {
                    id: 'collapse-airways',
                    renderContent: () => { var _a; return FSComponent.buildComponent("span", null, ((_a = this.props.detailsController) === null || _a === void 0 ? void 0 : _a.airwaysCollapsed) ? 'Expand Airways' : 'Collapse Airways'); },
                    isEnabled: true,
                    action: () => {
                        var _a;
                        (_a = this.props.detailsController) === null || _a === void 0 ? void 0 : _a.collapseAirways();
                    }
                },
                {
                    id: 'hold-waypoint', renderContent: () => FSComponent.buildComponent("span", null, "Hold At Waypoint"),
                    isEnabled: !this.isHeaderSelected() && !this.isEmptyRowSelected(),
                    action: () => {
                        Fms.viewService.open('HoldAt', true).setInput({ segmentIndex: this.segmentIndex.get(), legIndex: this.listRef.instance.getSelectedIndex() });
                    }
                },
                { id: 'hold-ppos', renderContent: () => FSComponent.buildComponent("span", null, "Hold At Present Position"), isEnabled: false },
                { id: 'create-atk', renderContent: () => FSComponent.buildComponent("span", null, "Create ATK Offset WPT"), isEnabled: false },
                {
                    id: 'delete-fpln', renderContent: () => FSComponent.buildComponent("span", null, "Delete Flight Plan"), isEnabled: true, action: () => {
                        this.props.fms.emptyPrimaryFlightPlan();
                    }
                },
                { id: 'store-fpln', renderContent: () => FSComponent.buildComponent("span", null, "Store Flight Plan"), isEnabled: false },
                {
                    id: 'invert-fpln', renderContent: () => FSComponent.buildComponent("span", null, "Invert Flight Plan"), isEnabled: true, action: () => {
                        this.props.fms.invertFlightplan();
                    }
                },
                { id: 'temp-comp', renderContent: () => FSComponent.buildComponent("span", null, "Temperature Compensation"), isEnabled: false },
                { id: 'usr-wpt', renderContent: () => FSComponent.buildComponent("span", null, "Create New User Waypoint"), isEnabled: false },
                {
                    id: 'remove-dep', renderContent: () => FSComponent.buildComponent("span", null, "Remove Departure"), isEnabled: plan.procedureDetails.departureIndex > -1, action: () => {
                        var _a;
                        const departure = (_a = this.props.facilities.originFacility) === null || _a === void 0 ? void 0 : _a.departures[plan.procedureDetails.departureIndex];
                        Fms.viewService.open('MessageDialog', true).setInput({ inputString: `Remove ${departure === null || departure === void 0 ? void 0 : departure.name} from flight plan?`, hasRejectButton: true }).onAccept.on((sender, accept) => {
                            if (accept) {
                                this.props.fms.removeDeparture();
                            }
                        });
                    }
                },
                {
                    id: 'remove-arr', renderContent: () => FSComponent.buildComponent("span", null, "Remove Arrival"), isEnabled: plan.procedureDetails.arrivalIndex > -1, action: () => {
                        var _a;
                        const arrival = (_a = this.props.facilities.arrivalFacility) === null || _a === void 0 ? void 0 : _a.arrivals[plan.procedureDetails.arrivalIndex];
                        Fms.viewService.open('MessageDialog', true).setInput({ inputString: `Remove ${arrival === null || arrival === void 0 ? void 0 : arrival.name} from flight plan?`, hasRejectButton: true }).onAccept.on((sender, accept) => {
                            if (accept) {
                                this.props.fms.removeArrival();
                            }
                        });
                    }
                },
                {
                    id: 'remove-app', renderContent: () => FSComponent.buildComponent("span", null, "Remove Approach"), isEnabled: this.isApproachLoaded(plan), action: () => {
                        Fms.viewService.open('MessageDialog', true).setInput({
                            renderContent: () => {
                                return (FSComponent.buildComponent("div", { style: 'display: inline-block;' },
                                    "Remove ",
                                    this.renderApproachName(plan),
                                    " from flight plan?"));
                            },
                            hasRejectButton: true
                        }).onAccept.on((sender, accept) => {
                            if (accept) {
                                this.props.fms.removeApproach();
                            }
                        });
                    }
                },
                { id: 'parallel-track', renderContent: () => FSComponent.buildComponent("span", null, "Parallel Track"), isEnabled: false },
                { id: 'closest-point', renderContent: () => FSComponent.buildComponent("span", null, "Closest Point Of FPL"), isEnabled: false }
            ]);
            return true;
        }
        return false;
    }
    // TODO Remove when all events converted
    /**
     * Checks if there is a highlighted element in this section
     * @protected
     * @returns A boolean indicating if an element is highlighted in this section.
     */
    hasSelection() {
        return this.isHeaderSelected() || this.listRef.instance.getSelectedIndex() > -1 || this.isEmptyRowSelected();
    }
    /**
     * Adds a leg to the flight plan display segment.
     * @param index The index to add at.
     * @param leg The leg to add.
     */
    addLeg(index, leg) {
        const currentLeg = this.legs.tryGet(index);
        if (currentLeg !== undefined && currentLeg.get().isActive) {
            currentLeg.apply({ isActive: false });
            leg.isActive = true;
        }
        this.legs.insert(Subject.create(leg), index);
        this.updateEmptyRowVisibility();
    }
    /**
     * Removes a leg from the flight plan display segment.
     * @param index The index to remove at.
     */
    removeLeg(index) {
        let currentLeg = this.legs.tryGet(index);
        const isActive = currentLeg !== undefined && currentLeg.get().isActive;
        this.legs.removeAt(index);
        currentLeg = this.legs.tryGet(index);
        if (currentLeg !== undefined && isActive) {
            currentLeg.apply({ isActive });
        }
        this.updateEmptyRowVisibility();
    }
    /**
     * Refreshes this section's header.
     */
    updateHeader() {
        this.headerRef.instance.update();
    }
    /**
     * Updates the visibility of this section's empty row.
     */
    updateEmptyRowVisibility() {
        const emptyRow = this.emptyRowRef.getOrDefault();
        if (emptyRow !== null) {
            emptyRow.setIsVisible(this.getEmptyRowVisbility());
        }
    }
    /**
     * A callback which responds to changes in the active flight plan leg.
     * @param activeSegmentIndex The index of the active leg segment.
     * @param activeLegIndex The index of the active leg in its segment.
     */
    onActiveLegChanged(activeSegmentIndex, activeLegIndex) {
        var _a;
        this.updateLegInfoVisibility(activeSegmentIndex, activeLegIndex);
        // Refresh flight plan focus if the header or empty row is focused
        if (this.headerRef.instance.getIsFocused()) {
            this.onHeaderFocused();
        }
        else if ((_a = this.emptyRowRef.getOrDefault()) === null || _a === void 0 ? void 0 : _a.getIsFocused()) {
            this.onEmptyRowFocused();
        }
    }
    /**
     * Updates this section's leg information visibility based on the current active flight plan leg.
     * @param activeSegmentIndex The index of the active leg segment.
     * @param activeLegIndex The index of the active leg in its segment.
     */
    updateLegInfoVisibility(activeSegmentIndex, activeLegIndex) {
        for (let l = 0; l < this.legs.length; l++) {
            const leg = this.legs.tryGet(l);
            if (leg) {
                if (this.segmentIndex.get() < activeSegmentIndex || (this.segmentIndex.get() === activeSegmentIndex && l < activeLegIndex)) {
                    leg.apply({ legIsBehind: true });
                }
                else if (leg.get().legIsBehind) {
                    leg.apply({ legIsBehind: false });
                }
                leg.notify();
            }
        }
    }
    /**
     * Sets the active leg in the flight plan display segment.
     * @param index The index of the leg to set as active.
     */
    setActiveLeg(index) {
        const legInfo = this.legs.tryGet(index);
        if (legInfo !== undefined) {
            legInfo.apply({ isActive: true });
        }
        // Set flight plan focus
        if (legInfo && this.listRef.instance.getSelectedItem() === legInfo && this.props.onFlightPlanFocusSelected) {
            this.props.onFlightPlanFocusSelected(this.getFlightPlanFocusFromLeg(legInfo.get().legDefinition));
        }
    }
    /**
     * Cancels an active leg display in the flight plan display segment.
     * @param index The index of the leg to set as inactive.
     */
    cancelActiveLeg(index) {
        const leg = this.legs.tryGet(index);
        if (leg !== undefined && leg.get().isActive) {
            leg.apply({ isActive: false });
        }
    }
    /**
     * Cancels all active leg displays in section.
     */
    cancelAllActiveLegs() {
        for (let i = 0; i < this.legs.length; i++) {
            const leg = this.legs.tryGet(i);
            if (leg !== undefined && leg.get().isActive) {
                leg.apply({ isActive: false });
            }
        }
    }
    /**
     * Returns the index of the active leg in this section.
     * @returns the index of the active lege, otherwise -1
     */
    getActiveLegIndex() {
        return this.legs.getArray().findIndex(leg => leg.get().isActive);
    }
    /**
     * Scrolls to the active leg.
     */
    scrollToActiveLeg() {
        this.scrollController.gotoIndex(1);
        this.listRef.instance.scrollToIndex(this.getActiveLegIndex());
    }
    /**
     * Ensures the active leg is in view.
     */
    ensureActiveLegInView() {
        this.listRef.instance.ensureIndexInView(this.getActiveLegIndex());
    }
    /**
     * Updates a given leg's row from the leg's current calculations.
     * @param index The index of the leg.
     */
    updateFromLegCalculations(index) {
        var _a;
        const leg = this.legs.tryGet(index);
        if (leg !== undefined) {
            if (((_a = this.segment) === null || _a === void 0 ? void 0 : _a.airway) && index === this.legs.length - 1) {
                leg.apply({ airwayDistance: this.props.fms.getAirwayDistance(this.segment.segmentIndex) });
            }
            else {
                leg.notify();
            }
        }
    }
    /**
     * Sets the leg altitude for a given leg.
     * @param index The index of the leg.
     * @param vnavLeg The vnav leg data.
     * @param revisedAltitude The optional replacement display altitude.
     */
    setLegAltitude(index, vnavLeg, revisedAltitude) {
        const leg = this.legs.tryGet(index);
        if (leg !== undefined) {
            leg.apply({ targetAltitude: revisedAltitude ? revisedAltitude : vnavLeg.altitude, isAdvisory: vnavLeg.isAdvisory });
        }
    }
    /**
     * Gets the number of legs in this section.
     * @returns the number of legs in this section.
     */
    getLegsLength() {
        if (this.legs) {
            return this.legs.length;
        }
        else {
            return 0;
        }
    }
    /**
     * Creates the SelectAirwayInputData when insert airway is selected.
     * @param segmentIndex The index of the segment.
     * @param selectedIndex The selected item index.
     * @param emptyRowSelected Whether the empty row is selected.
     * @returns the SelectAirwayInputData object
     */
    getAirwayInsertData(segmentIndex, selectedIndex, emptyRowSelected) {
        const plan = this.props.fms.getFlightPlan();
        if (emptyRowSelected) {
            const segment = plan.getSegment(segmentIndex);
            if (segment.legs && segment.legs.length < 1) {
                const previousSegment = plan.getSegment(segmentIndex - 1);
                const previousSegmentLastLeg = previousSegment.legs.length - 1;
                return { segmentIndex: segmentIndex - 1, legIndex: previousSegmentLastLeg };
            }
            else {
                const segmentLastLeg = segment.legs.length - 1;
                return { segmentIndex: segmentIndex, legIndex: segmentLastLeg };
            }
        }
        else if (selectedIndex === 0 && segmentIndex > 0) {
            const previousSegment = plan.getSegment(segmentIndex - 1);
            const previousSegmentLastLeg = previousSegment.legs.length - 1;
            return { segmentIndex: segmentIndex - 1, legIndex: previousSegmentLastLeg };
        }
        return { segmentIndex: segmentIndex, legIndex: selectedIndex - 1 };
    }
    /**
     * Checks whether an airway can be inserted from this selected index.
     * @param segmentIndex The index of the segment.
     * @param isEmptyRowSelected If an empty row is selected.
     * @returns the SelectAirwayInputData object
     */
    canAirwayInsert(segmentIndex, isEmptyRowSelected) {
        if (this.isHeaderSelected()) {
            return false;
        }
        const plan = this.props.fms.getFlightPlan();
        if (plan.getSegment(segmentIndex).segmentType !== FlightPlanSegmentType.Enroute) {
            return false;
        }
        if (isEmptyRowSelected) {
            const segment = plan.getSegment(segmentIndex);
            if (segment.legs.length > 0) {
                return true;
            }
        }
        const lastSegment = plan.getSegment(segmentIndex - 1);
        if (lastSegment.legs.length < 1 || lastSegment.legs[lastSegment.legs.length - 1].leg.fixIcao[0] === ' ') {
            return false;
        }
        return true;
    }
    /**
     * Checks if an approach is loaded.
     * @param plan The Flight Plan.
     * @returns A boolean indicating if an approach is loaded.
     */
    isApproachLoaded(plan) {
        if (plan.procedureDetails.approachIndex > -1) {
            return true;
        }
        if (plan.getUserData('visual_approach') && plan.destinationAirport) {
            return true;
        }
        return false;
    }
    /**
     * Gets the loaded approach name.
     * @param plan The Flight Plan.
     * @returns The approach name as a string.
     */
    renderApproachName(plan) {
        const approach = this.props.facilities.destinationFacility ? FmsUtils.getApproachFromPlan(plan, this.props.facilities.destinationFacility) : undefined;
        return (FSComponent.buildComponent(ApproachNameDisplay, { approach: Subject.create(approach !== null && approach !== void 0 ? approach : null) }));
    }
    // TODO remove when all events converted
    /**
     * Checks if the header of this section is selected.
     * @protected
     * @returns A boolean indicating if the header is selected.
     */
    isHeaderSelected() {
        var _a, _b;
        return (_b = (_a = this.headerRef.getOrDefault()) === null || _a === void 0 ? void 0 : _a.getIsFocused()) !== null && _b !== void 0 ? _b : false;
    }
    // TODO remove when all events converted
    /**
     * Checks if the empty row of this section is selected.
     * @protected
     * @returns A boolean indicating if the empty row is selected.
     */
    isEmptyRowSelected() {
        var _a, _b;
        return (_b = (_a = this.emptyRowRef.getOrDefault()) === null || _a === void 0 ? void 0 : _a.getIsFocused()) !== null && _b !== void 0 ? _b : false;
    }
    /**
     * A callback which is called when a leg selection changes.
     * @param item The selected item.
     */
    onLegItemSelected(item) {
        // If selection is null because this section has no existing legs, force focus the empty leg row if it exists.
        if (this.emptyRowRef.getOrDefault() && !item && this.listRef.instance.getIsFocused() && this.legs.length === 0) {
            this.scrollController.gotoIndex(2);
        }
        // Notify flight plan element selection
        if (item && this.props.onFlightPlanElementSelected) {
            this.props.onFlightPlanElementSelected(item.get().legDefinition);
        }
        // Notify flight plan focus
        if (item && this.props.onFlightPlanFocusSelected) {
            this.props.onFlightPlanFocusSelected(this.getFlightPlanFocusFromLeg(item.get().legDefinition));
        }
    }
    /**
     * Gets a flight plan focus from a selected flight plan leg.
     * @param leg The selected flight plan leg.
     * @returns The flight plan focus given the selected leg.
     */
    getFlightPlanFocusFromLeg(leg) {
        const plan = this.props.fms.getFlightPlan();
        if (plan.directToData.segmentIndex >= 0) {
            const dtoSegment = plan.getSegment(plan.directToData.segmentIndex);
            // If the DTO target leg is selected and the DTO is active, focus on the DTO leg instead to show the DTO path.
            if (dtoSegment.legs[plan.directToData.segmentLegIndex] === leg && dtoSegment.offset + plan.directToData.segmentLegIndex + 3 === plan.activeLateralLeg) {
                leg = dtoSegment.legs[plan.directToData.segmentLegIndex + 3];
            }
        }
        return [leg];
    }
    /**
     * A callback which is called when this section's header is focused.
     */
    onHeaderFocused() {
        var _a;
        this.props.onFlightPlanElementSelected && this.props.onFlightPlanElementSelected((_a = this.segment) !== null && _a !== void 0 ? _a : null);
    }
    /**
     * A callback which is called when this section's empty row is focused.
     */
    onEmptyRowFocused() {
        this.props.onFlightPlanElementSelected && this.props.onFlightPlanElementSelected(null);
        this.props.onFlightPlanFocusSelected && this.props.onFlightPlanFocusSelected(this.getFlightPlanFocusWhenEmpty());
    }
    /**
     * Gets a flight plan focus when empty.
     * @returns A flight plan focus.
     */
    getFlightPlanFocusWhenEmpty() {
        var _a;
        if (!this.segment) {
            return [];
        }
        // Try to focus on the leg immediately after where the empty leg row would insert a leg into the plan.
        // If such a leg does not exist, try to focus on the leg immediately before that position.
        const flightPlan = this.props.fms.getFlightPlan();
        const legToFocus = (_a = flightPlan.getNextLeg(this.segment.segmentIndex, this.segment.legs.length - 1)) !== null && _a !== void 0 ? _a : flightPlan.getPrevLeg(this.segment.segmentIndex, this.segment.legs.length);
        return legToFocus ? [legToFocus] : null;
    }
}
