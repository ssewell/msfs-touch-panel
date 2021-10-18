import { Subject, ArraySubject } from 'msfssdk';
import { RunwayUtils } from 'msfssdk/navigation';
/** The data store for SelectProcedure pages */
export class SelectProcedureStore {
    constructor() {
        this.selectedProcIndex = Subject.create(-1);
        this.selectedRwyIndex = Subject.create(-1);
        this.selectedTransIndex = Subject.create(-1);
        this.procedures = ArraySubject.create();
        this.runways = ArraySubject.create();
        this.transitions = ArraySubject.create();
        this.sequence = ArraySubject.create();
        // /**
        //  * Gets the enroute transitions of the selected procedure.
        //  * @returns The enroute transitions.
        //  */
        // public abstract getTransitions(): readonly EnrouteTransition[];
    }
    /**
     * Sets the data to display the facility.
     * @param facility The airport facility to be shown.
     */
    loadFacility(facility) {
        this.selectedFacility = facility;
        this.procedures.clear();
        this.runways.clear();
        this.transitions.clear();
        this.procedures.set(this.getProcedures());
    }
    /**
     * Empties the display content when no facility is selected
     */
    clearFacility() {
        this.selectedFacility = undefined;
        this.procedures.clear();
        this.runways.clear();
        this.transitions.clear();
    }
    /**
     * Gets the one-way runway from the selected procedure runway
     * @returns the OneWayRunway object or undefined
     */
    getOneWayRunway() {
        if (this.selectedFacility !== undefined && this.selectedRwyIndex.get() > -1) {
            const procRunway = this.getRunwayString(this.procedures.get(this.selectedProcIndex.get()).runwayTransitions[this.selectedRwyIndex.get()]);
            const oneWayRunway = RunwayUtils.matchOneWayRunwayFromDesignation(this.selectedFacility, procRunway);
            if (oneWayRunway !== undefined) {
                return oneWayRunway;
            }
        }
        return undefined;
    }
    /**
     * Gets a runway designation string from the runway transition.
     * @param runwayTransition is the runway transition object
     * @returns The runway designation string.
     */
    getRunwayString(runwayTransition) {
        if (runwayTransition !== undefined) {
            return RunwayUtils.getRunwayNameString(runwayTransition.runwayNumber, runwayTransition.runwayDesignation);
        }
        return '';
    }
    /**
     * Gets the runways of the selected procedure.
     * @returns The runways.
     */
    getRunways() {
        const rwys = this.procedures.get(this.selectedProcIndex.get()).runwayTransitions;
        return rwys;
    }
    /**
     * Gets the enroute transitions of the selected procedure.
     * @returns The enroute transitions.
     */
    getTransitions() {
        const transitions = [];
        const defaultTranstion = { name: this.getTransitionName(-1), legs: [] };
        transitions.push(defaultTranstion);
        const procedureTransitions = this.procedures.get(this.selectedProcIndex.get()).enRouteTransitions;
        for (let i = 0; i < procedureTransitions.length; i++) {
            const transition = procedureTransitions[i];
            transitions.push({ name: this.getTransitionName(i), legs: transition.legs });
        }
        return transitions;
    }
}
