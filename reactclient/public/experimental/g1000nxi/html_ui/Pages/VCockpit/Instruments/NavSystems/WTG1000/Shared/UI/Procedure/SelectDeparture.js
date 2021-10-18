import { FacilityType, ICAO, LegType } from 'msfssdk/navigation';
import { SelectProcedureController } from '../Controllers/SelectProcedureController';
import { SelectProcedureStore } from '../Controllers/SelectProcedureStore';
/** Controller for SelectDeparture */
export class SelectDepartureController extends SelectProcedureController {
    constructor() {
        super(...arguments);
        this.onLoadExecute = () => {
            if (this.store.selectedFacility !== undefined) {
                this.fms.insertDeparture(this.store.selectedFacility, this.store.selectedProcIndex.get(), this.store.selectedRwyIndex.get(), this.store.selectedTransIndex.get(), this.store.getOneWayRunway());
            }
        };
    }
    /** @inheritdoc */
    getInitialICAO() {
        let icao;
        if (this.fms.hasPrimaryFlightPlan()) {
            const plan = this.fms.getPrimaryFlightPlan();
            icao = plan.originAirport;
            if (icao === undefined) {
                // get the FIRST airport in the flight plan.
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
                    if (icao !== undefined) {
                        break;
                    }
                }
            }
        }
        return icao;
    }
}
/** Store for SelectDeparture */
export class SelectDepartureStore extends SelectProcedureStore {
    /** @inheritdoc */
    getProcedures() {
        var _a, _b;
        return (_b = (_a = this.selectedFacility) === null || _a === void 0 ? void 0 : _a.departures) !== null && _b !== void 0 ? _b : [];
    }
    /** @inheritdoc */
    getTransitionName(transitionIndex) {
        if (this.selectedFacility !== undefined) {
            const procedure = this.procedures.get(this.selectedProcIndex.get());
            if (transitionIndex == -1) {
                if (procedure.commonLegs.length > 0) {
                    const legsLen = procedure.commonLegs.length;
                    /** For Departures, default transition name should be last leg icao - override in child method */
                    return ICAO.getIdent(procedure.commonLegs[legsLen - 1].fixIcao);
                }
                else {
                    const rwyTrans = procedure.runwayTransitions[this.selectedRwyIndex.get()];
                    const legsLen = rwyTrans.legs.length;
                    /** For Departures, default transition name should be last leg icao - override in child method */
                    return ICAO.getIdent(rwyTrans.legs[legsLen - 1].fixIcao);
                }
            }
            else {
                const enrTrans = procedure.enRouteTransitions[transitionIndex];
                if (enrTrans.name.length > 0) {
                    return enrTrans.name;
                }
                else {
                    /** For Departures, default transition name should be last leg icao - override in child method */
                    const legsLen = enrTrans.legs.length;
                    return ICAO.getIdent(enrTrans.legs[legsLen - 1].fixIcao);
                }
            }
        }
        return 'NONE';
    }
}
