import { ArraySubject, ComputedSubject, Subject } from 'msfssdk';
import { AdditionalApproachType, RnavTypeFlags, RunwayUtils } from 'msfssdk/navigation';
import { FmsUtils } from '../../FlightPlan/FmsUtils';
/** Select approach store */
export class SelectApproachStore {
    /**
     * Constructor.
     */
    constructor() {
        this.minimumsSubject = Subject.create(0);
        this.frequencySubject = ComputedSubject.create(undefined, (v) => {
            if (v !== undefined && v.freqMHz) {
                return v.freqMHz.toFixed(2);
            }
            return '___.__';
        });
        this.minsToggleOptions = ['Off', 'BARO']; //, 'TEMP COMP'];
        this.minimumsMode = Subject.create(0);
        this.selectedApproach = Subject.create(undefined);
        this.selectedTransIndex = Subject.create(-1);
        this._approaches = ArraySubject.create();
        this.approaches = this._approaches;
        this._transitions = ArraySubject.create();
        this.transitions = this._transitions;
        this.inputValue = Subject.create('');
        this.sequence = ArraySubject.create();
        this.selectedApproach.sub(this.onSelectedApproachChanged.bind(this));
    }
    /**
     * Sets the data to display the facility.
     * @param facility The airport facility to be shown.
     */
    loadFacility(facility) {
        this.selectedFacility = facility;
        this._approaches.clear();
        this._transitions.clear();
        this._approaches.set(this.getApproaches());
    }
    /**
     * Empties the display content when no facility is selected
     */
    clearFacility() {
        this.selectedFacility = undefined;
        this._approaches.clear();
        this._transitions.clear();
    }
    /**
     * Gets the approaches array.
     * @returns The approaches.
     */
    getApproaches() {
        if (this.selectedFacility !== undefined) {
            const ilsFound = new Set();
            for (const approach of this.selectedFacility.approaches) {
                if (approach.approachType == ApproachType.APPROACH_TYPE_ILS) {
                    ilsFound.add(approach.runway);
                }
            }
            const approaches = [];
            this.selectedFacility.approaches.forEach((approach, index) => {
                if (approach.approachType !== ApproachType.APPROACH_TYPE_LOCALIZER || !ilsFound.has(approach.runway)) {
                    approaches.push({
                        approach,
                        index,
                        isVisualApproach: false
                    });
                }
            });
            this.getVisualApproaches(this.selectedFacility).forEach(va => {
                approaches.push({
                    approach: va,
                    index: -1,
                    isVisualApproach: true
                });
            });
            return approaches;
        }
        return [];
    }
    /**
     * Gets the visual approaches for the facility.
     * @param facility is the facility.
     * @returns The Approach Procedures.
     */
    getVisualApproaches(facility) {
        const runways = [];
        for (let i = 0; i < facility.runways.length; i++) {
            RunwayUtils.getOneWayRunways(facility.runways[i], i).forEach(rw => { runways.push(rw); });
        }
        const approaches = [];
        runways.forEach(r => {
            approaches.push({
                name: `VISUAL ${r.designation}`,
                runway: r.designation,
                icaos: [],
                transitions: [],
                finalLegs: [],
                missedLegs: [],
                approachType: AdditionalApproachType.APPROACH_TYPE_VISUAL,
                approachSuffix: '',
                runwayDesignator: r.runwayDesignator,
                runwayNumber: r.direction,
                rnavTypeFlags: RnavTypeFlags.None
            });
        });
        return approaches;
    }
    /**
     * Responds to changes in the selected approach.
     */
    onSelectedApproachChanged() {
        this.refreshTransitions();
        this.refreshApproachFrequencyText();
    }
    /**
     * Refreshes the transitions array to reflect the transition list of the currently selected approach.
     */
    refreshTransitions() {
        var _a;
        const approach = (_a = this.selectedApproach.get()) === null || _a === void 0 ? void 0 : _a.approach;
        const transitions = [];
        if (approach) {
            for (let i = 0; i < approach.transitions.length; i++) {
                const listItems = FmsUtils.getOffsetTransitions(approach, i);
                listItems.forEach(item => transitions.push(item));
            }
            transitions.splice(0, 0, { name: 'VECTORS', transitionIndex: -1 });
        }
        this._transitions.set(transitions);
    }
    /**
     * Refreshes the approach frequency text to reflect the frequency of the currently selected approach.
     */
    refreshApproachFrequencyText() {
        const selectedApproach = this.selectedApproach.get();
        if (this.selectedFacility && selectedApproach) {
            this.frequencySubject.set(FmsUtils.getApproachFrequency(this.selectedFacility, selectedApproach.index));
        }
        else {
            this.frequencySubject.set(undefined);
        }
    }
}
