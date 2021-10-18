import { Subject, ArraySubject } from 'msfssdk';
/** The data store for SelectProcedure pages */
export class SelectAirwayStore {
    constructor() {
        this.inputSegment = -1;
        this.inputLeg = -1;
        this.airways = ArraySubject.create();
        this.exits = ArraySubject.create();
        this.sequence = ArraySubject.create();
    }
    /**
     * Gets the airways array for this facility.
     * @returns The an array of unique airway names.
     */
    getFacilityAirways() {
        const airways = [];
        airways.push('NONE');
        if (this.selectedFacility !== undefined && this.selectedFacility.routes.length > 0) {
            this.selectedFacility.routes.forEach((route) => {
                airways.push(route.name);
            });
            const uniqueAirways = airways.filter((v, i, a) => a.indexOf(v) === i);
            return uniqueAirways;
        }
        return [];
    }
    /**
     * Gets the airway.
     * @param airwayName is the name of the airway as a string.
     * @param facLoader is an instance of the facility loader.
     */
    async loadAirway(airwayName, facLoader) {
        var _a, _b;
        const route = (_a = this.selectedFacility) === null || _a === void 0 ? void 0 : _a.routes.find((r) => r.name === airwayName);
        if (route !== undefined && this.selectedFacility !== undefined) {
            this.selectedAirway = await facLoader.getAirway(airwayName, route.type, (_b = this.selectedFacility) === null || _b === void 0 ? void 0 : _b.icao);
        }
    }
    /**
     * Builds the sequence list for the approach preview
     * @param fms is an instance of the FMS
     */
    buildSequence(fms) {
        if (this.selectedFacility !== undefined && this.selectedAirway !== undefined && this.selectedExit !== undefined) {
            const legs = [];
            const previewPlanIndex = fms.buildAirwayPreviewSegment(this.selectedAirway, this.selectedFacility, this.selectedExit);
            const previewPlan = fms.getFlightPlan(previewPlanIndex);
            previewPlan.getSegment(0).legs.forEach((l) => {
                legs.push(Subject.create(l));
            });
            this.sequence.set(legs);
        }
    }
    /**
     * Sets the data to display the facility.
     * @param facility The airport facility to be shown.
     */
    loadFacility(facility) {
        this.selectedFacility = facility;
        this.airways.clear();
        this.exits.clear();
        this.sequence.clear();
        this.airways.set(this.getFacilityAirways());
    }
    /**
     * Empties the display content when no facility is selected
     */
    clearFacility() {
        this.selectedFacility = undefined;
        this.airways.clear();
        this.exits.clear();
        this.sequence.clear();
    }
    /**
     * Gets the exits of the selected airway.
     * @returns The airway exits.
     */
    getExits() {
        var _a;
        const exits = [];
        if (this.selectedAirway !== undefined && this.selectedAirway.waypoints.length > 1) {
            (_a = this.selectedAirway) === null || _a === void 0 ? void 0 : _a.waypoints.forEach((waypoint) => {
                exits.push(waypoint);
            });
        }
        return exits;
    }
}
