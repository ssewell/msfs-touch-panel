import { FSComponent, Subject } from 'msfssdk';
import { FacilityType, ICAO } from 'msfssdk/navigation';
import { ContextMenuDialog } from '../Dialogs/ContextMenuDialog';
/** The controller for SelectProcedure views. */
export class SelectAirwayController {
    /**
     * Creates a Select Airway Controller
     * @param store The store.
     * @param selectNextCb Callback when the next control should be focused.
     * @param fms The FMS instance.
     * @param exitSelectControlRef is the ref for the exit select control.
     */
    constructor(store, selectNextCb, fms, exitSelectControlRef) {
        this.store = store;
        this.selectNextCb = selectNextCb;
        this.fms = fms;
        this.exitSelectControlRef = exitSelectControlRef;
        this.inputIcao = Subject.create('');
        this.entrySubject = Subject.create('');
        this.canLoad = Subject.create(false);
        this.emptyListText = Subject.create('NONE');
        this.entryIndex = -1;
        this.entryIndexSubject = Subject.create(-1);
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
         * Callback handler for when an airway is selected.
         * @param index is the index of the item selected
         * @param airway The airway name selected.
         * @param isRefresh If select event happened based on a data refresh.
         */
        this.onAirwaySelected = (index, airway, isRefresh) => {
            this.emptyListText.set(index <= 0 ? 'NONE' : 'LOADING...');
            this.canLoad.set(false);
            this.store.exits.clear();
            this.store.sequence.clear();
            if (!isRefresh && index > 0) {
                this.store.loadAirway(airway, this.fms.facLoader).then(() => {
                    this.store.exits.set(this.store.getExits());
                    this.exitSelectControlRef.instance.SelectedValue.set(this.entryIndex);
                    this.entryIndexSubject.set(this.entryIndex);
                    this.gotoNextSelect(isRefresh);
                });
            }
        };
        /**
         * Builds an airway menu item.
         * @param airway The airway to build the menu item for.
         * @returns A menu item definition.
         */
        this.buildAirwayMenuItem = (airway) => {
            return { id: airway, renderContent: () => FSComponent.buildComponent("span", null, airway), estimatedWidth: airway.length * ContextMenuDialog.CHAR_WIDTH };
        };
        /**
         * Callback handler for when an enroute transition is selected.
         * @param index The index of the selected transition.
         * @param item The transition selected.
         * @param isRefresh If select event happened based on a data refresh.
         */
        this.onExitSelected = (index, item, isRefresh) => {
            this.store.selectedExit = item;
            if (!isRefresh) {
                this.store.buildSequence(this.fms);
                this.gotoNextSelect(isRefresh);
                this.canLoad.set(true);
            }
        };
        /**
         * Builds an airway exit menu item.
         * @param waypoint The intersection facility of the exit.
         * @param index The index of the airway.
         * @returns A menu item definition.
         */
        this.buildExitMenuItem = (waypoint, index) => {
            const isEnabled = waypoint.icao !== this.inputIcao.get();
            if (!isEnabled) {
                console.log('entry index: ' + index);
                this.entryIndex = index;
            }
            const ident = ICAO.getIdent(waypoint.icao);
            return {
                id: index.toString(),
                renderContent: () => FSComponent.buildComponent("span", null, ident),
                isEnabled: isEnabled,
                estimatedWidth: ident.length * ContextMenuDialog.CHAR_WIDTH
            };
        };
        /** Callback handler for when load is pressed. */
        this.onLoadSelected = () => {
            this.onLoadExecuted();
        };
        /** Callback handler for when load is pressed. */
        this.onLoadExecuted = () => {
            if (this.store.selectedFacility !== undefined && this.store.selectedAirway !== undefined && this.store.selectedExit !== undefined) {
                this.fms.insertAirwaySegment(this.store.selectedAirway, this.store.selectedFacility, this.store.selectedExit, this.store.inputSegment, this.store.inputLeg);
            }
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
    /**
     * Sets existing fix for Direct To Existing
     * @param inputData is the DirectToInputData
     */
    async setExistingFix(inputData) {
        if ((inputData === null || inputData === void 0 ? void 0 : inputData.legIndex) !== undefined && (inputData === null || inputData === void 0 ? void 0 : inputData.segmentIndex) !== undefined) {
            const plan = this.fms.getFlightPlan();
            const segment = plan.getSegment(inputData.segmentIndex);
            const fixIcao = segment.legs[inputData.legIndex].leg.fixIcao;
            this.inputIcao.set(fixIcao);
            this.entrySubject.set(ICAO.getIdent(this.inputIcao.get()));
            const fac = await this.getFacility(this.inputIcao.get());
            this.store.loadFacility(fac);
            this.gotoNextSelect(false);
        }
        else {
            this.inputIcao.set('');
        }
    }
    /** Initialize the controller. */
    initialize() {
        this.emptyListText.set('NONE');
        this.canLoad.set(false);
        this.store.clearFacility();
    }
    /** Get the facility.
     * @param icao is the intersection icao
     * @returns an Intersection Facility
     */
    async getFacility(icao) {
        const facility = await this.fms.facLoader.getFacility(FacilityType.Intersection, icao);
        return facility;
    }
}
