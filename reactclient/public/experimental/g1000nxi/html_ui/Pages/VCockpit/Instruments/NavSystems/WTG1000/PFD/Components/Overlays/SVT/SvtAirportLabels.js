import { DisplayComponent, FSComponent, GeoPoint, GeoPointSubject, UnitType } from 'msfssdk';
import { FacilityRespository, FacilitySearchType } from 'msfssdk/navigation';
import { FacilityType, FacilityLoader } from 'msfssdk/navigation';
import { SvtProjectionUtils } from '../../../../Shared/UI/SvtProjectionUtils';
import { SvtAirportLabel } from './SvtAirportLabel';
import './SvtAirportLabels.css';
/**
 * The SvtAirportLabels component.
 */
export class SvtAirportLabels extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.planePos = GeoPointSubject.createFromGeoPoint(new GeoPoint(NaN, NaN));
        this.pxPerDegY = SvtProjectionUtils.projectYawPitch(0, 0.1 * Avionics.Utils.DEG2RAD, 0, new Float64Array(2))[1] * 10;
        this.loader = new FacilityLoader(FacilityRespository.getRepository(this.props.bus));
        this.nearestFacilities = new Map();
        this.facilityElements = new Map();
        this.containerRef = FSComponent.createRef();
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        this.planePos.sub(pos => {
            if (isNaN(pos.lat) || isNaN(pos.lon)) {
                return;
            }
            this.searchNearest();
        });
        this.props.bus.getSubscriber().on('gps-position').atFrequency(1).handle((pos) => {
            this.planePos.set(pos.lat, pos.long);
        });
    }
    /**
     * Updates the airport labels.
     * @param planeState The plane state info.
     */
    update(planeState) {
        // create if not already there
        this.nearestFacilities.forEach((facility, icao) => {
            if (!this.facilityElements.has(icao)) {
                const nodeRef = FSComponent.createRef();
                FSComponent.render(FSComponent.buildComponent(SvtAirportLabel, { ref: nodeRef, facility: facility }), this.containerRef.instance);
                this.facilityElements.set(icao, nodeRef);
            }
        });
        // update pos
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.facilityElements.forEach((nodeRef, icao) => {
            nodeRef.instance.update(this.planePos.get(), planeState);
        });
        this.containerRef.instance.style.transform = `translate3d(0px, ${planeState.pitch * this.pxPerDegY}px, 0px)`;
    }
    /**
     * Update our nearest airport list.
     */
    searchNearest() {
        var _a;
        if (!this.session) {
            (_a = this.loader) === null || _a === void 0 ? void 0 : _a.startNearestSearchSession(FacilitySearchType.Airport).then(session => {
                this.session = session;
                this.searchNearest();
            });
        }
        else {
            const planePos = this.planePos.get();
            this.session.searchNearest(planePos.lat, planePos.lon, SvtAirportLabels.searchRange, SvtAirportLabels.maxFound)
                .then(results => { return this.updateNearestFacilities(results); });
            // .then(() => {
            //   this.updateNearestAirports();
            //   this.updateNearestSubjectList();
            // });
        }
    }
    /**
     * Update our nearest list with the latest search results.
     * @param results The results from a nearest search.
     * @returns A promise that resolves when the nearest list is updated.
     */
    updateNearestFacilities(results) {
        // The results of a search contains only the elements added or removed from the last
        // search in the session.   So we need to keep track of everythign that's been returned
        // in this session and add and delete as needed.
        for (const icao of results.removed) {
            this.nearestFacilities.delete(icao);
            // this.nearestAirports.delete(icao);
        }
        // Get facility information for all the newly added airports.  The facility loader
        // caches search results internally, so we're not going to worry about optimizing
        // that here as well.
        const searches = new Array();
        for (const icao of results.added) {
            searches.push(this.loader.getFacility(FacilityType.Airport, icao));
        }
        return new Promise((resolve) => {
            Promise.all(searches).then(facilities => {
                for (const facility of facilities) {
                    if (facility) {
                        this.nearestFacilities.set(facility.icao, facility);
                    }
                }
                resolve();
            });
        });
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "svt-airport-labels-container", ref: this.containerRef }));
    }
}
SvtAirportLabels.searchRange = UnitType.NMILE.convertTo(40, UnitType.METER);
SvtAirportLabels.maxFound = 20;
