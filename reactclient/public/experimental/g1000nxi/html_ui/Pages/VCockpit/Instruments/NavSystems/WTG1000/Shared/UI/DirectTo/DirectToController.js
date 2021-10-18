import { Subject } from 'msfssdk';
import { LegType } from 'msfssdk/navigation';
import { DirectToState } from '../../FlightPlan/Fms';
import { FacilityWaypoint } from '../../Navigation/Waypoint';
/** The controller for the DTO view */
export class DirectToController {
    /**
     * Creates an instance of direct to controller.
     * @param store is the Direct To Store
     * @param fms is the Direct To Controller
     */
    constructor(store, fms) {
        this.store = store;
        this.fms = fms;
        this.inputIcao = Subject.create('');
        this.canActivate = Subject.create(false);
        this.directToExisting = undefined;
        /**
         * A function which handles changes in waypoint input's selected waypoint.
         * @param waypoint The selected waypoint.
         */
        this.waypointChangedHandler = async (waypoint) => {
            var _a;
            const facility = waypoint instanceof FacilityWaypoint ? waypoint.facility : null;
            if ((facility === null || facility === void 0 ? void 0 : facility.icao) !== ((_a = this.directToExisting) === null || _a === void 0 ? void 0 : _a.icao)) {
                this.directToExisting = undefined;
                const plan = this.fms.getFlightPlan();
                for (let i = 0; i < plan.length; i++) {
                    const leg = plan.getLeg(i);
                    if (leg.leg.fixIcao === (facility === null || facility === void 0 ? void 0 : facility.icao) && leg.leg.type !== LegType.FC && leg.leg.type !== LegType.FD && leg.leg.type !== LegType.PI) {
                        const segmentIndex = plan.getSegmentIndex(i);
                        const segment = plan.getSegment(segmentIndex);
                        const directToExisting = {
                            segmentIndex: segmentIndex,
                            legIndex: i - segment.offset,
                            icao: facility === null || facility === void 0 ? void 0 : facility.icao
                        };
                        this.directToExisting = directToExisting;
                    }
                }
            }
            this.store.waypoint.set(waypoint);
            this.canActivate.set(!!facility);
        };
        // ---- ACTION CALLBACKS
        this.onActivateSelected = () => {
            const selectedWaypoint = this.store.waypoint.get();
            const facility = selectedWaypoint instanceof FacilityWaypoint ? selectedWaypoint.facility : null;
            if (facility) {
                if (this.directToExisting !== undefined && this.directToExisting.segmentIndex !== undefined && this.directToExisting.legIndex !== undefined) {
                    this.fms.createDirectToExisting(this.directToExisting.segmentIndex, this.directToExisting.legIndex);
                }
                else {
                    this.fms.createDirectToRandom(facility);
                }
                this.directToExisting = undefined;
            }
        };
    }
    /**
     * Initializes the direct to target based on input data. If the input data is defined, the target will be set to that
     * defined by the input data. If the input data is undefined, an attempt will be made to set the target to the
     * following, in order:
     * * The current active direct to target.
     * * The current active flight plan leg.
     * * The next leg in the primary flight plan, following the active leg, that is a valid direct to target.
     * * The previous leg in the primary flight plan, before the active leg, that is a valid direct to target.
     * @param dtoData The input data.
     */
    initializeTarget(dtoData) {
        this.directToExisting = undefined;
        let targetIcao = '';
        if ((dtoData === null || dtoData === void 0 ? void 0 : dtoData.legIndex) !== undefined && (dtoData === null || dtoData === void 0 ? void 0 : dtoData.segmentIndex) !== undefined) {
            this.directToExisting = dtoData;
            targetIcao = dtoData.icao;
        }
        else {
            const dtoState = this.fms.getDirectToState();
            if (dtoState === DirectToState.TOEXISTING) {
                const plan = this.fms.getPrimaryFlightPlan();
                this.directToExisting = {
                    icao: plan.getLeg(plan.activeLateralLeg).leg.fixIcao,
                    segmentIndex: plan.directToData.segmentIndex,
                    legIndex: plan.directToData.segmentLegIndex
                };
                targetIcao = this.directToExisting.icao;
            }
            else if (dtoState === DirectToState.TORANDOM) {
                const plan = this.fms.getDirectToFlightPlan();
                targetIcao = plan.getLeg(plan.activeLateralLeg).leg.fixIcao;
            }
            else if (this.fms.hasPrimaryFlightPlan()) {
                const plan = this.fms.getPrimaryFlightPlan();
                const activeLegIndex = plan.activeLateralLeg;
                let dtoExisting;
                // search forwards in plan for valid DTO target
                const len = plan.length;
                for (let i = activeLegIndex; i < len; i++) {
                    const segmentIndex = plan.getSegmentIndex(i);
                    const segmentLegIndex = i - plan.getSegment(segmentIndex).offset;
                    if (this.fms.canDirectTo(segmentIndex, segmentLegIndex)) {
                        dtoExisting = DirectToController.createDtoExistingData(plan, segmentIndex, segmentLegIndex);
                        break;
                    }
                }
                if (!dtoExisting) {
                    // search backwards in plan for valid DTO target
                    for (let i = activeLegIndex - 1; i >= 0; i--) {
                        const segmentIndex = plan.getSegmentIndex(i);
                        const segmentLegIndex = i - plan.getSegment(segmentIndex).offset;
                        if (this.fms.canDirectTo(segmentIndex, segmentLegIndex)) {
                            dtoExisting = DirectToController.createDtoExistingData(plan, segmentIndex, segmentLegIndex);
                            break;
                        }
                    }
                }
                if (dtoExisting) {
                    this.directToExisting = dtoExisting;
                    targetIcao = dtoExisting.icao;
                }
            }
        }
        this.inputIcao.set(targetIcao);
    }
    /**
     * Creates a direct to existing data object for a flight plan leg.
     * @param plan A flight plan.
     * @param segmentIndex The index of the segment in which the leg resides.
     * @param segmentLegIndex The index of the leg in its segment.
     * @returns A direct to existing data object.
     */
    static createDtoExistingData(plan, segmentIndex, segmentLegIndex) {
        return {
            icao: plan.getSegment(segmentIndex).legs[segmentLegIndex].leg.fixIcao,
            segmentIndex,
            legIndex: segmentLegIndex
        };
    }
}
