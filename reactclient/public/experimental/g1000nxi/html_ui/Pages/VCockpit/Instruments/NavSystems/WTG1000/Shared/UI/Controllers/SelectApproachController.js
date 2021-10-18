import { ComputedSubject, FSComponent, Subject } from 'msfssdk';
import { FacilityType, ICAO, LegType } from 'msfssdk/navigation';
import { Fms, ProcedureType } from '../../FlightPlan/Fms';
import { ContextMenuDialog } from '../Dialogs/ContextMenuDialog';
import { FmsUtils } from '../../FlightPlan/FmsUtils';
import { ApproachNameDisplay } from '../FPL/ApproachNameDisplay';
/** Select approach controller */
export class SelectApproachController {
    /**
     * Creates an instance of select approach controller.
     * @param store The store.
     * @param selectNextCb Callback when the next control should be focused.
     * @param fms Instance of FMS.
     * @param fplKey The FPL ViewService Key.
     * @param hasSequence If this instance of the controller should support a sequence display.
     */
    constructor(store, selectNextCb, fms, fplKey, hasSequence = false) {
        this.store = store;
        this.selectNextCb = selectNextCb;
        this.fms = fms;
        this.fplKey = fplKey;
        this.hasSequence = hasSequence;
        this.inputIcao = Subject.create('');
        this.canLoad = Subject.create(false);
        this.canActivate = Subject.create(false);
        this.canLoadOrText = ComputedSubject.create(false, (v) => { return v ? 'OR' : ''; });
        this.skipCourseReversal = false;
        /**
         * Handler method to handle when the facility in wpt input changed.
         * @param facility The facility selected in wpt input.
         */
        this.facilityChangedHandler = async (facility) => {
            this.store.clearFacility();
            if (facility !== undefined) {
                this.store.loadFacility(facility);
                this.skipCourseReversal = false;
            }
        };
        /**
         * Evaluates if the next select should be focused.
         * @param isRefresh If select event happened based on a data refresh.
         */
        this.gotoNextSelect = (isRefresh) => {
            if (!isRefresh) {
                this.selectNextCb();
            }
        };
        /**
         * Callback handler for when a minimums option is selected.
         * @param index The index of the option selected.
         */
        this.onMinimumsOptionSelected = (index) => {
            this.store.minimumsMode.set(index);
            Fms.g1000EvtPub.publishEvent('show_minimums', index === 1);
        };
        /** Callback handler for  when a minimums value is selected. */
        this.updateMinimumsValue = () => {
            Fms.g1000EvtPub.publishEvent('set_minimums', this.store.minimumsSubject.get());
        };
        /**
         * Callback handler for when a approach procedure is selected.
         * @param index The index of the procedure selected.
         * @param item The item selected.
         * @param isRefresh If select event happened based on a data refresh.
         */
        this.onApproachSelected = (index, item, isRefresh) => {
            this.store.selectedApproach.set(item);
            const validApproachSelected = !!item;
            this.canActivate.set(validApproachSelected);
            this.canLoad.set(validApproachSelected && this.fms.canApproachLoad());
            this.gotoNextSelect(isRefresh);
            this.buildSequence();
        };
        /**
         * Builds a approach procedure menu item.
         * @param proc The approach procedure.
         * @param index The index of the procedure.
         * @returns A menu item definition.
         */
        this.buildApprMenuItem = (proc, index) => {
            return {
                id: index.toString(), renderContent: () => (FSComponent.buildComponent(ApproachNameDisplay, { approach: Subject.create(proc.approach) })),
                estimatedWidth: proc.approach.name.length * ContextMenuDialog.CHAR_WIDTH
            };
        };
        /**
         * Callback handler for when a transition is selected.
         * @param index The index of the transition selected.
         * @param item The item selected.
         * @param isRefresh If select event happened based on a data refresh.
         */
        this.onTransSelected = (index, item, isRefresh) => {
            var _a;
            this.store.selectedTransIndex.set(index);
            this.buildSequence();
            if (this.hasSequence && this.checkForCourseReversal()) {
                const icao = (_a = this.store.sequence.tryGet(1)) === null || _a === void 0 ? void 0 : _a.get().leg.fixIcao;
                Fms.viewService.open('MessageDialog', true).setInput(this.getCourseReversalDialogDef(ICAO.getIdent(icao !== null && icao !== void 0 ? icao : ''))).onAccept.on((sender, accept) => {
                    this.skipCourseReversal = !accept;
                    if (this.skipCourseReversal) {
                        this.store.sequence.removeAt(1);
                    }
                    this.gotoNextSelect(isRefresh);
                });
            }
            else {
                this.gotoNextSelect(isRefresh);
            }
        };
        /**
         * Builds a trans menu item.
         * @param trans The transition.
         * @param index The index of the transition.
         * @returns A menu item definition.
         */
        this.buildTransMenuItem = (trans, index) => {
            var _a;
            const transition = (_a = this.store.selectedApproach.get()) === null || _a === void 0 ? void 0 : _a.approach.transitions[trans.transitionIndex];
            const name = !transition ? 'VECTORS' : transition.legs.length == 0 ? 'NOLEGS' : trans.name && trans.name.length > 0 ? trans.name : 'NONAME';
            return { id: index.toString(), renderContent: () => FSComponent.buildComponent("span", null, name), estimatedWidth: name.length * ContextMenuDialog.CHAR_WIDTH };
        };
        /** Callback handler for when load is pressed. */
        this.onLoadExecuted = () => {
            const selectedFacility = this.store.selectedFacility;
            const approach = this.store.selectedApproach.get();
            if (selectedFacility && approach) {
                const transIndex = this.store.transitions.get(this.store.selectedTransIndex.get()).transitionIndex;
                const legOffset = this.store.transitions.get(this.store.selectedTransIndex.get()).startIndex;
                this.handleExecute(false, selectedFacility, approach, transIndex, legOffset);
            }
        };
        /** Callback handler for when activate is pressed. */
        this.onActivateExecuted = () => {
            const selectedFacility = this.store.selectedFacility;
            const approach = this.store.selectedApproach.get();
            if (selectedFacility && approach) {
                const transIndex = this.store.transitions.get(this.store.selectedTransIndex.get()).transitionIndex;
                const legOffset = this.store.transitions.get(this.store.selectedTransIndex.get()).startIndex;
                this.handleExecute(true, selectedFacility, approach, transIndex, legOffset);
            }
        };
        /**
         * Renders the procedure warning vnode (when we need to pass HTML).
         * @param warningMessage The dialog message content.
         * @param warningTitle The dialog message title content.
         * @returns A VNode to be rendered in the MessageDialog.
         */
        this.renderProcedureWarningDialogContent = (warningMessage, warningTitle) => {
            return (FSComponent.buildComponent("div", null,
                warningTitle,
                FSComponent.buildComponent("p", null),
                warningMessage));
        };
        const fpl = this.fms.bus.getSubscriber();
        fpl.on('fplCalculated').handle((e) => {
            if (e.planIndex == 2) {
                const plan = this.fms.flightPlanner.getFlightPlan(2);
                if (plan.segmentCount > 0) {
                    const segment = plan.getSegment(0);
                    for (let i = 0; i < segment.legs.length; i++) {
                        const leg = this.store.sequence.tryGet(i);
                        if (leg !== undefined) {
                            leg.get().calculated = segment.legs[i].calculated;
                            leg.notify();
                        }
                    }
                }
            }
        });
        this.canLoad.sub(v => this.canLoadOrText.set(v));
    }
    /** Initialize the controller. */
    initialize() {
        var _a;
        const initIcao = (_a = this.getInitialICAO()) !== null && _a !== void 0 ? _a : '';
        this.inputIcao.set(initIcao);
        if (initIcao !== '') {
            setTimeout(() => {
                this.gotoNextSelect(false);
            }, 100);
        }
    }
    /** @inheritdoc */
    getInitialICAO() {
        let icao;
        const dtoTargetIcao = this.fms.getDirectToTargetIcao();
        if (dtoTargetIcao !== undefined && ICAO.isFacility(dtoTargetIcao) && ICAO.getFacilityType(dtoTargetIcao) === FacilityType.Airport) {
            icao = dtoTargetIcao;
        }
        else if (this.fms.hasPrimaryFlightPlan()) {
            const plan = this.fms.getPrimaryFlightPlan();
            icao = plan.destinationAirport;
            if (icao === undefined) {
                // get the LAST airport in the flight plan.
                // TODO: would be nice to be able to iterate thru legs in reverse order
                for (const leg of plan.legs()) {
                    if (leg.isInDirectToSequence) {
                        continue;
                    }
                    switch (leg.leg.type) {
                        case LegType.IF:
                        case LegType.TF:
                        case LegType.DF:
                        case LegType.CF:
                        case LegType.AF:
                        case LegType.RF:
                            if (ICAO.isFacility(leg.leg.fixIcao) && ICAO.getFacilityType(leg.leg.fixIcao) === FacilityType.Airport) {
                                icao = leg.leg.fixIcao;
                            }
                            break;
                    }
                }
            }
        }
        return icao;
    }
    /**
     * Builds the sequence list for the approach preview
     */
    buildSequence() {
        const approach = this.store.selectedApproach.get();
        if (!approach) {
            return;
        }
        const legs = [];
        if (this.store.selectedFacility !== undefined) {
            let previewPlanIndex = -1;
            if (approach.isVisualApproach) {
                previewPlanIndex = this.fms.buildProcedurePreviewPlan(this.store.selectedFacility, ProcedureType.VISUALAPPROACH, -1, -1, undefined, undefined, approach.approach.runwayNumber, approach.approach.runwayDesignator);
            }
            else {
                const selectedTransIndex = this.store.selectedTransIndex.get();
                const transIndex = selectedTransIndex > -1 ? this.store.transitions.get(selectedTransIndex).transitionIndex : -1;
                const legOffset = selectedTransIndex > -1 ? this.store.transitions.get(selectedTransIndex).startIndex : 0;
                previewPlanIndex = this.fms.buildProcedurePreviewPlan(this.store.selectedFacility, ProcedureType.APPROACH, approach.index, transIndex, undefined, undefined, undefined, legOffset !== undefined ? legOffset : 0);
            }
            const previewPlan = this.fms.getFlightPlan(previewPlanIndex);
            previewPlan.getSegment(0).legs.forEach((l) => {
                legs.push(Subject.create(l));
            });
            this.store.sequence.set(legs);
        }
    }
    /**
     * Checks for a course reversal in the procedure.
     * @returns true if there is an optional course reversal.
     */
    checkForCourseReversal() {
        const legs = this.store.sequence.getArray();
        if (legs && legs.length > 0) {
            const leg = legs[1].get();
            switch (leg.leg.type) {
                case LegType.HA:
                case LegType.HF:
                case LegType.HM:
                    return true;
            }
        }
        return false;
    }
    /**
     * Handles loading and executing the approach with appropriate warning messages.
     * @param activate Whether or not to activate this approach.
     * @param facility The facility for the approach.
     * @param approach The Approach List Item to execute with.
     * @param approachTransitionIndex The transition index for the approach procedure.
     * @param transStartIndex The transition start index, if specified.
     */
    handleExecute(activate, facility, approach, approachTransitionIndex, transStartIndex) {
        var _a;
        const trueApproachIndex = approach.index;
        if (!approach.isVisualApproach) {
            const procedure = approach.approach;
            const insertApproach = (skipReversal) => {
                if (!FmsUtils.isGpsApproach(procedure)) {
                    const input = {
                        renderContent: () => this.renderProcedureWarningDialogContent('GPS guidance is for monitoring only. Load approach?', '- NOT APPROVED FOR GPS -'),
                        confirmButtonText: 'YES',
                        hasRejectButton: true,
                        rejectButtonText: 'NO'
                    };
                    Fms.viewService.open('MessageDialog', true).setInput(input).onAccept.on((sender, accept) => {
                        if (accept) {
                            this.fms.insertApproach(facility, trueApproachIndex, approachTransitionIndex, undefined, undefined, transStartIndex, skipReversal);
                            if (activate) {
                                this.fms.activateApproach();
                            }
                            Fms.viewService.open(this.fplKey);
                        }
                    });
                }
                else {
                    this.fms.insertApproach(facility, trueApproachIndex, approachTransitionIndex, undefined, undefined, transStartIndex, skipReversal);
                    if (activate) {
                        this.fms.activateApproach();
                    }
                    Fms.viewService.open(this.fplKey);
                }
            };
            if (this.checkForCourseReversal() && !this.hasSequence) {
                const icao = (_a = this.store.sequence.tryGet(1)) === null || _a === void 0 ? void 0 : _a.get().leg.fixIcao;
                const input = this.getCourseReversalDialogDef(ICAO.getIdent(icao !== null && icao !== void 0 ? icao : ''));
                input.closeOnAccept = false;
                Fms.viewService.open('MessageDialog', true).setInput(input).onAccept.on((sender, accept) => {
                    const skipReversal = !accept;
                    insertApproach(skipReversal);
                });
            }
            else if (this.hasSequence) {
                insertApproach(this.skipCourseReversal);
            }
            else {
                insertApproach(false);
            }
        }
        else {
            const runwayNumber = approach.approach.runwayNumber;
            const RunwayDesignator = approach.approach.runwayDesignator;
            Fms.viewService.open('MessageDialog', true).setInput({ inputString: 'Obstacle clearance is not provided for visual approaches', hasRejectButton: true })
                .onAccept.on((sender, accept) => {
                if (accept) {
                    this.fms.insertApproach(facility, -1, -1, runwayNumber, RunwayDesignator);
                    if (activate) {
                        this.fms.activateApproach();
                    }
                    Fms.viewService.open(this.fplKey);
                }
            });
        }
    }
    /**
     * Gets the MenuDialogDefinition for a course reversal dialog message.
     * @param fixName The name of the fix where the course reversal is.
     * @returns A MessageDialogDefinition.
     */
    getCourseReversalDialogDef(fixName) {
        return { inputString: `Fly Course Reversal at ${fixName}?`, confirmButtonText: 'YES', hasRejectButton: true, rejectButtonText: 'NO' };
    }
}
