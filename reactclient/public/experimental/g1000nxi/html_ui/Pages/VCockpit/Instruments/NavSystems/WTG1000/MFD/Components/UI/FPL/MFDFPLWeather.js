import { ComputedSubject, DisplayComponent, FSComponent } from 'msfssdk';
import { FlightPlanSegmentType } from 'msfssdk/flightplan';
import { FacilityType, ICAO, LegType } from 'msfssdk/navigation';
/**
 * Displays METAR information based on the currently selected flight plan element.
 */
export class MFDFPLWeather extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.textSub = ComputedSubject.create(undefined, metar => {
            var _a;
            return (_a = metar === null || metar === void 0 ? void 0 : metar.metarString) !== null && _a !== void 0 ? _a : '';
        });
        this.opId = 0;
    }
    /** @inheritdoc */
    onAfterRender() {
        this.props.selection.sub(selection => {
            var _a, _b;
            let icao = '';
            if (selection) {
                if ('leg' in selection) {
                    // selection is a LegDefinition
                    icao = this.getNominalIcaoFromLeg(selection);
                }
                else {
                    // selection is a FlightPlanSegment
                    const plan = this.props.fms.getPrimaryFlightPlan();
                    if (selection.segmentType === FlightPlanSegmentType.Departure && plan.procedureDetails.departureIndex < 0) {
                        icao = (_a = plan.originAirport) !== null && _a !== void 0 ? _a : '';
                    }
                    else if (selection.segmentType === FlightPlanSegmentType.Destination) {
                        icao = (_b = plan.destinationAirport) !== null && _b !== void 0 ? _b : '';
                    }
                }
            }
            if (ICAO.isFacility(icao) && ICAO.getFacilityType(icao) === FacilityType.Airport) {
                this.updateMetarFromAirport(ICAO.getIdent(icao));
            }
            else {
                this.updateMetarFromAirport('');
            }
        }, true);
    }
    /**
     * Gets the ICAO of a flight plan leg's nominal facility.
     * @param leg A flight plan leg.
     * @returns The ICAO of the flight plan leg's nominal facility.
     */
    getNominalIcaoFromLeg(leg) {
        switch (leg.leg.type) {
            case LegType.IF:
            case LegType.TF:
            case LegType.CF:
            case LegType.DF:
            case LegType.RF:
                return leg.leg.fixIcao;
            default:
                return '';
        }
    }
    /**
     * Updates this component's METAR with one from a specified airport.
     * @param ident The ident of the airport from which to retrieve a METAR, or an empty string if no METAR should be
     * retrieved.
     */
    async updateMetarFromAirport(ident) {
        if (ident === '') {
            this.textSub.set(undefined);
            return;
        }
        const opId = ++this.opId;
        const metar = await this.props.facLoader.getMetar(ident);
        if (opId !== this.opId) {
            return;
        }
        this.textSub.set(metar);
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("div", { class: 'mfd-fpl-weather' }, this.textSub));
    }
}
