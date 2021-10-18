import { ArraySubject, Subject } from 'msfssdk';
import { FacilityLoader, FacilityRespository } from 'msfssdk/navigation';
import { ActiveLegStates } from '../UIControls/FplActiveLegArrow';
/**
 * The store class for FPLDetails
 */
export class FPLDetailsStore {
    /**
     * Constructor.
     * @param bus The event bus.
     */
    constructor(bus) {
        /** Information on our origin, arrival and destination facilities to save lookups. */
        this.facilityInfo = {
            originFacility: undefined,
            destinationFacility: undefined,
            arrivalFacility: undefined
        };
        this.segments = ArraySubject.create();
        this.activeLeg = Subject.create({ segmentIndex: 0, legIndex: 0 });
        this.activeLegState = Subject.create(ActiveLegStates.NONE);
        this.currentAltitude = 0;
        this.selectedAltitude = 0;
        this.loader = new FacilityLoader(FacilityRespository.getRepository(bus));
    }
}
