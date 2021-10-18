import { FSComponent, Subject } from 'msfssdk';
import { ContextMenuDialog } from '../Dialogs/ContextMenuDialog';
/** The controller for SelectProcedure views. */
export class SelectProcedureController {
    /**
     * Ctor
     * @param store The store.
     * @param selectNextCb Callback when the next control should be focused.
     * @param fms The FMS instance.
     * @param procType is the procedure type for this controller.
     */
    constructor(store, selectNextCb, fms, procType) {
        this.store = store;
        this.selectNextCb = selectNextCb;
        this.fms = fms;
        this.procType = procType;
        this.inputIcao = Subject.create('');
        this.canLoad = Subject.create(false);
        /**
         * Handler method to handle when the facility in wpt input changed.
         * @param facility The facility selected in wpt input.
         */
        this.facilityChangedHandler = async (facility) => {
            this.store.clearFacility();
            if (facility !== undefined) {
                this.store.loadFacility(facility);
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
         * Callback handler for when a procedure is selected.
         * @param index The index of the selected procedure.
         * @param item The procedure selected.
         * @param isRefresh If select event happened based on a data refresh.
         */
        this.onProcSelected = (index, item, isRefresh) => {
            this.store.selectedProcIndex.set(index);
            this.store.runways.set((index > -1) ? this.store.getRunways() : []);
            this.store.transitions.set((index > -1) ? this.store.getTransitions() : []);
            this.canLoad.set(this.store.selectedProcIndex.get() !== -1);
            this.buildSequence();
            this.gotoNextSelect(isRefresh);
        };
        /**
         * Builds a procedure menu item.
         * @param proc The procedure to build the menu item for.
         * @param index The index of the procedure.
         * @returns A menu item definition.
         */
        this.buildProcMenuItem = (proc, index) => {
            return { id: index.toString(), renderContent: () => FSComponent.buildComponent("span", null, proc.name), estimatedWidth: proc.name.length * ContextMenuDialog.CHAR_WIDTH };
        };
        /**
         * Callback handler for when a runway transition is selected.
         * @param index The index of the selected transition.
         * @param item The transition selected.
         * @param isRefresh If select event happened based on a data refresh.
         */
        this.onRwySelected = (index, item, isRefresh) => {
            this.store.selectedRwyIndex.set(index);
            this.buildSequence();
            this.gotoNextSelect(isRefresh);
        };
        /**
         * Builds a runway transition menu item.
         * @param rwyTrans The runway transition to build the menu item for.
         * @param index The index of the runway transition.
         * @returns A menu item definition.
         **/
        this.buildRwyMenuItem = (rwyTrans, index) => {
            const name = this.store.getRunwayString(rwyTrans);
            return { id: index.toString(), renderContent: () => FSComponent.buildComponent("span", null, name), estimatedWidth: name.length * ContextMenuDialog.CHAR_WIDTH };
        };
        /**
         * Callback handler for when an enroute transition is selected.
         * @param index The index of the selected transition.
         * @param item The transition selected.
         * @param isRefresh If select event happened based on a data refresh.
         */
        this.onTransSelected = (index, item, isRefresh) => {
            this.store.selectedTransIndex.set(index - 1);
            this.buildSequence();
            this.gotoNextSelect(isRefresh);
        };
        /**
         * Builds a enroute transition menu item.
         * @param trans The transition to build the menu item for.
         * @param index The index of the transition.
         * @returns A menu item definition.
         */
        this.buildTransMenuItem = (trans, index) => {
            const name = trans.name.trim().length < 1 ? 'NONE' : trans.name;
            return {
                id: index.toString(),
                renderContent: () => FSComponent.buildComponent("span", null, name),
                estimatedWidth: name.length * ContextMenuDialog.CHAR_WIDTH
            };
        };
        /** Callback handler for when load is pressed. */
        this.onLoadSelected = () => {
            this.onLoadExecute();
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
    }
    /** Initialize the controller. */
    initialize() {
        var _a;
        this.canLoad.set(false);
        const initIcao = (_a = this.getInitialICAO()) !== null && _a !== void 0 ? _a : '';
        this.inputIcao.set(initIcao);
        if (initIcao !== '') {
            setTimeout(() => {
                this.gotoNextSelect(false);
            }, 100);
        }
    }
    /**
     * Builds the sequence list for the approach preview
     */
    buildSequence() {
        if (this.store.selectedProcIndex.get() > -1) {
            const legs = [];
            if (this.store.selectedFacility !== undefined) {
                const previewPlanIndex = this.fms.buildProcedurePreviewPlan(this.store.selectedFacility, this.procType, this.store.selectedProcIndex.get(), this.store.selectedTransIndex.get(), this.store.getOneWayRunway(), this.store.selectedRwyIndex.get());
                const previewPlan = this.fms.getFlightPlan(previewPlanIndex);
                previewPlan.getSegment(0).legs.forEach((l) => {
                    legs.push(Subject.create(l));
                });
                this.store.sequence.set(legs);
            }
        }
    }
}
