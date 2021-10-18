import { FacilityType, ICAO, LegType } from 'msfssdk/navigation';
import { SelectProcedureController } from '../Controllers/SelectProcedureController';
import { SelectProcedureStore } from '../Controllers/SelectProcedureStore';
/** Controller for SelectArrival */
export class SelectArrivalController extends SelectProcedureController {
    constructor() {
        super(...arguments);
        this.onLoadExecute = () => {
            if (this.store.selectedFacility !== undefined) {
                this.fms.insertArrival(this.store.selectedFacility, this.store.selectedProcIndex.get(), this.store.selectedRwyIndex.get(), this.store.selectedTransIndex.get(), this.store.getOneWayRunway());
            }
        };
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
}
/** Store for SelectArrival */
export class SelectArrivalStore extends SelectProcedureStore {
    /** @inheritdoc */
    getProcedures() {
        var _a, _b;
        return (_b = (_a = this.selectedFacility) === null || _a === void 0 ? void 0 : _a.arrivals) !== null && _b !== void 0 ? _b : [];
    }
    /** @inheritdoc */
    getTransitionName(transitionIndex) {
        if (this.selectedFacility !== undefined) {
            const procedure = this.procedures.get(this.selectedProcIndex.get());
            if (transitionIndex == -1) {
                if (procedure.commonLegs.length > 0) {
                    /** For Arrivals, default transition name should be first leg icao - override in child method */
                    return ICAO.getIdent(procedure.commonLegs[0].fixIcao);
                }
                else {
                    const rwyTrans = procedure.runwayTransitions[this.selectedRwyIndex.get()];
                    /** For Arrivals, default transition name should be first leg icao - override in child method */
                    return ICAO.getIdent(rwyTrans.legs[0].fixIcao);
                }
            }
            else {
                const enrTrans = procedure.enRouteTransitions[transitionIndex];
                if (enrTrans.name.length > 0) {
                    return enrTrans.name;
                }
                else {
                    /** For Arrivals, default transition name should be first leg icao - override in child method */
                    return ICAO.getIdent(enrTrans.legs[0].fixIcao);
                }
            }
        }
        return 'NONE';
    }
}
