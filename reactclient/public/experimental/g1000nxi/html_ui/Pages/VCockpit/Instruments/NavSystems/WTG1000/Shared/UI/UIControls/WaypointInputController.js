import { ICAO } from 'msfssdk/navigation';
/**
 * Waypoint input controller
 */
export class WaypointInputController {
    /**
     * Creates an instance of waypoint input controller.
     * @param store The store associated with this controller.
     * @param selectedIcao A subject which provides an ICAO string for this controller's input component to bind.
     * @param onInputTextValueOverride A function which is called when the input text value needs to be overridden.
     */
    constructor(store, selectedIcao, onInputTextValueOverride) {
        this.store = store;
        this.selectedIcao = selectedIcao;
        this.onInputTextValueOverride = onInputTextValueOverride;
        this.icaoSearchDebounceTimer = null;
        this.searchOpId = 0;
        this.ignoreSelectedIcao = false;
        this.store.selectedWaypoint.sub((waypoint) => {
            var _a;
            this.ignoreSelectedIcao = true;
            const icao = (_a = waypoint === null || waypoint === void 0 ? void 0 : waypoint.facility.icao) !== null && _a !== void 0 ? _a : '';
            this.selectedIcao.set(icao);
            if (waypoint) {
                const ident = ICAO.getIdent(icao);
                // check if the current input value is a prefix of the suggested ident.
                if (ident.indexOf(this.store.inputValue.get()) === 0) {
                    this.store.inputValue.set(ident);
                    this.onInputTextValueOverride && this.onInputTextValueOverride(ident);
                }
            }
            this.ignoreSelectedIcao = false;
        });
        this.selectedIcao.sub((icao) => {
            if (this.ignoreSelectedIcao) {
                return;
            }
            this.searchOpId++;
            if (icao === '') {
                this.onInputTextValueOverride && this.onInputTextValueOverride('');
                this.store.loadIcaoData([]);
                this.store.inputValue.set('');
            }
            else {
                this.onInputTextValueOverride && this.onInputTextValueOverride(ICAO.getIdent(icao));
                this.store.loadIcaoData([icao]);
            }
        });
    }
    /**
     * Handler method to handle the input text from the input component.
     * @param value is the updated text from the input component.
     */
    onInputChanged(value) {
        this.store.inputValue.set(value);
        this.scheduleICAOSearch(value);
    }
    /**
     * Schedules an ICAO search. Cancels any pending ICAO searches which were scheduled earlier.
     * @param text The text to search against.
     */
    scheduleICAOSearch(text) {
        if (this.icaoSearchDebounceTimer !== null) {
            clearTimeout(this.icaoSearchDebounceTimer);
        }
        const opId = ++this.searchOpId;
        this.icaoSearchDebounceTimer = setTimeout(() => {
            this.icaoSearchDebounceTimer = null;
            this.executeICAOSearch(text, opId);
        }, WaypointInputController.ICAO_SEARCH_DEBOUNCE_DELAY);
    }
    /**
     * Executes an ICAO search.
     * @param text The text to search against.
     * @param opId The id of the search to complete.
     */
    async executeICAOSearch(text, opId) {
        if (this.isIcaoValid(text)) {
            try {
                if (opId === this.searchOpId) {
                    const searchText = text.trim();
                    let icaos = await this.store.doSearch(searchText);
                    if (opId !== this.searchOpId) {
                        return;
                    }
                    //One or more exact matches
                    let exactMatches = 0;
                    if (ICAO.getIdent(icaos[0]) === searchText) {
                        for (let i = 0; i < icaos.length; i++) {
                            if (ICAO.getIdent(icaos[i]) === searchText) {
                                exactMatches++;
                            }
                            else {
                                break;
                            }
                        }
                    }
                    if (exactMatches !== 0) {
                        icaos = icaos.slice(0, exactMatches);
                    }
                    else {
                        icaos.splice(1, icaos.length - 1);
                    }
                    this.store.loadIcaoData(icaos.length > 1 ? Array.from(new Set(icaos)) : icaos);
                }
            }
            catch (e) {
                // noop
            }
        }
        else {
            if (opId === this.searchOpId) {
                this.store.loadIcaoData([]);
            }
        }
    }
    /**
     * Validates the ICAO search input.
     * @param icao The value coming from the ICAO input.
     * @returns A {boolean} indicating if the input is valid for search.
     */
    isIcaoValid(icao) {
        if (icao.length > 0 && !icao.startsWith(' ')) {
            // check if there comes another whitespace before a letter
            let prevCharBlank = false;
            for (let i = 1; i < icao.length; i++) {
                const char = icao[i];
                const currentCharBlank = char === ' ';
                if (prevCharBlank && !currentCharBlank) {
                    return false;
                }
                prevCharBlank = currentCharBlank;
            }
            return true;
        }
        return false;
    }
}
WaypointInputController.ICAO_SEARCH_DEBOUNCE_DELAY = 250; // milliseconds
