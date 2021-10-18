import { GeoPoint, NavMath, UnitType } from 'msfssdk';
import { AdditionalApproachType, AltitudeRestrictionType, FixTypeFlags, ICAO, LegType, RnavTypeFlags, RunwayUtils } from 'msfssdk/navigation';
import { FlightPlan } from 'msfssdk/flightplan';
/**
 * Utility Methods for the FMS.
 */
export class FmsUtils {
    /**
     * Utility method to return a one-way runway leg
     * @param airport The runway's parent airport.
     * @param oneWayRunway is the one wway runway object
     * @param isOriginRunway is a bool whether this is the origin or destination (origin = true, dest = false)
     * @returns a leg object for the runway
     */
    static buildRunwayLeg(airport, oneWayRunway, isOriginRunway) {
        const leg = FlightPlan.createLeg({
            lat: oneWayRunway.latitude,
            lon: oneWayRunway.longitude,
            type: isOriginRunway ? LegType.IF : LegType.TF,
            fixIcao: RunwayUtils.getRunwayFacilityIcao(airport, oneWayRunway),
            altitude1: oneWayRunway.elevation
        });
        return leg;
    }
    /**
     * Utility method to return a one-way runway leg from an approach runway leg definition
     * @param airport is the facility associated with the arrival
     * @param runwayIcao is the icao string for the runway waypoint in the final legs
     * @returns a leg object for the runway
     */
    static buildRunwayLegForApproach(airport, runwayIcao) {
        for (let i = 0; i < airport.runways.length; i++) {
            const match = RunwayUtils.getOneWayRunways(airport.runways[i], i).find((r) => {
                return (r.designation == ICAO.getIdent(runwayIcao));
            });
            if (match) {
                const leg = FlightPlan.createLeg({
                    lat: match.latitude,
                    lon: match.longitude,
                    type: LegType.TF,
                    fixIcao: runwayIcao
                });
                return leg;
            }
        }
        return undefined;
    }
    /**
     * Utility method to return a visual approach for a runway.
     * @param airport is the airport facility for the visual approach.
     * @param runway is the runway to build the visual approach for.
     * @param finalLegDistance is the distance from the runway to place the faf leg in NM.
     * @param initialLegDistance is the distance from the final leg to place the iaf leg in NM.
     * @param name is the optional name for the approach.
     * @param finalLegIdent is the optional name for the faf leg.
     * @param initialLegIdent is the optional name for the iaf leg.
     * @returns an approach procedure.
     */
    static buildVisualApproach(airport, runway, finalLegDistance, initialLegDistance, name, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    finalLegIdent, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    initialLegIdent) {
        const iafLatLon = FmsUtils.tempGeoPoint
            .set(runway.latitude, runway.longitude)
            .offset(NavMath.normalizeHeading(runway.course + 180), UnitType.NMILE.convertTo(initialLegDistance + finalLegDistance, UnitType.GA_RADIAN));
        const runwayCode = RunwayUtils.getRunwayCode(parseInt(runway.designation.substr(2)));
        const runwayLetter = isNaN(parseInt(runway.designation.substr(-1))) ? runway.designation.substr(-1) : ' ';
        if (initialLegIdent === undefined) {
            initialLegIdent = 'STRGHT';
        }
        const iafLeg = FlightPlan.createLeg({
            type: LegType.IF,
            fixIcao: `S${ICAO.getIdent(airport.icao).padStart(4, ' ')}${runwayCode}${runwayLetter}${initialLegIdent}`,
            course: runway.course,
            fixTypeFlags: FixTypeFlags.IAF,
            lat: iafLatLon.lat,
            lon: iafLatLon.lon,
        });
        const fafLatLon = FmsUtils.tempGeoPoint
            .set(runway.latitude, runway.longitude)
            .offset(NavMath.normalizeHeading(runway.course + 180), UnitType.NMILE.convertTo(finalLegDistance, UnitType.GA_RADIAN));
        if (finalLegIdent === undefined) {
            finalLegIdent = ' FINAL';
        }
        const fafLeg = FlightPlan.createLeg({
            type: LegType.TF,
            fixIcao: `S${ICAO.getIdent(airport.icao).padStart(4, ' ')}${runwayCode}${runwayLetter}${finalLegIdent}`,
            course: runway.course,
            fixTypeFlags: FixTypeFlags.FAF,
            lat: fafLatLon.lat,
            lon: fafLatLon.lon,
            altDesc: AltitudeRestrictionType.AtOrAbove,
            altitude1: runway.elevation + 110,
        });
        const runwayLeg = FmsUtils.buildRunwayLeg(airport, runway, false);
        runwayLeg.fixTypeFlags = FixTypeFlags.MAP;
        const finalLegs = [];
        finalLegs.push(iafLeg);
        finalLegs.push(fafLeg);
        finalLegs.push(runwayLeg);
        const missedLegLatLon = FmsUtils.tempGeoPoint
            .set(runway.latitude, runway.longitude)
            .offset(NavMath.normalizeHeading(runway.course), UnitType.NMILE.convertTo(5, UnitType.GA_RADIAN));
        const missedLeg = FlightPlan.createLeg({
            type: LegType.TF,
            fixIcao: `S${ICAO.getIdent(airport.icao).padStart(4, ' ')}${runwayCode}${runwayLetter}MANSEQ`,
            lat: missedLegLatLon.lat,
            lon: missedLegLatLon.lon,
        });
        const missedLegs = [];
        missedLegs.push(missedLeg);
        const proc = {
            name: name !== null && name !== void 0 ? name : `Visual RW${runway.designation}`,
            runway: runway.designation,
            icaos: [],
            transitions: [],
            finalLegs: finalLegs,
            missedLegs: missedLegs,
            approachType: AdditionalApproachType.APPROACH_TYPE_VISUAL,
            approachSuffix: '',
            runwayDesignator: runway.runwayDesignator,
            runwayNumber: runway.direction,
            rnavTypeFlags: RnavTypeFlags.None
        };
        return proc;
    }
    /**
     * Utility method to return all offset transitions from a transition.
     * @param approach is the facility approach
     * @param transitionIndex is the transition index to search.
     * @returns an array of TransitionListItems
     */
    static getOffsetTransitions(approach, transitionIndex) {
        const outputTransitions = [];
        const transition = approach.transitions[transitionIndex];
        outputTransitions.push({ name: ICAO.getIdent(transition.legs[0].fixIcao), transitionIndex: transitionIndex });
        for (let j = 1; j < transition.legs.length; j++) {
            const leg = transition.legs[j];
            if (leg.fixTypeFlags === FixTypeFlags.IAF) {
                const offsetTrans = { name: ICAO.getIdent(leg.fixIcao) + ' iaf', transitionIndex: transitionIndex, startIndex: j };
                outputTransitions.push(offsetTrans);
            }
        }
        return outputTransitions;
    }
    /**
     * Utility method to return a single RnavTypeFlag from multiple possible flags.
     * @param rnavTypeFlags The input RnavTypeFlags.
     * @returns A single RnavTypeFlag
     */
    static getBestRnavType(rnavTypeFlags) {
        if (rnavTypeFlags & RnavTypeFlags.LPV) {
            return RnavTypeFlags.LPV;
        }
        if (rnavTypeFlags & RnavTypeFlags.LNAVVNAV) {
            return RnavTypeFlags.LNAVVNAV;
        }
        if (rnavTypeFlags & RnavTypeFlags.LP) {
            return RnavTypeFlags.LP;
        }
        if (rnavTypeFlags & RnavTypeFlags.LNAV) {
            return RnavTypeFlags.LNAV;
        }
        return RnavTypeFlags.None;
    }
    /**
     * Utility method to check whether an approach is authorized for GPS guidance.
     * @param approach The approach procedure
     * @returns True if GPS guidance is authorized, false otherwise.
     */
    static isGpsApproach(approach) {
        switch (approach.approachType) {
            case ApproachType.APPROACH_TYPE_GPS:
            case ApproachType.APPROACH_TYPE_RNAV:
                return true;
        }
        return false;
    }
    /**
     * Utility method to check for an approach with a a tunable localizer.
     * @param approach The approach procedure
     * @returns True if a localizer needs to be tuned, otherwise false.
     */
    static isLocalizerApproach(approach) {
        switch (approach.approachType) {
            case ApproachType.APPROACH_TYPE_ILS:
            case ApproachType.APPROACH_TYPE_LDA:
            case ApproachType.APPROACH_TYPE_LOCALIZER:
            case ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE:
            case ApproachType.APPROACH_TYPE_SDF:
                return true;
        }
        return false;
    }
    /**
     * Gets an approach procedure from a flight plan.
     * @param plan A flight plan.
     * @param destination The detsination airport of the flight plan.
     * @returns The approach procedure from the flight plan, or undefined if the plan has no approach.
     */
    static getApproachFromPlan(plan, destination) {
        let approach = destination.approaches[plan.procedureDetails.approachIndex];
        if (!approach) {
            const visualRwyDesignation = plan.getUserData('visual_approach');
            if (visualRwyDesignation && plan.destinationAirport) {
                const runway = RunwayUtils.matchOneWayRunwayFromDesignation(destination, visualRwyDesignation);
                if (runway) {
                    approach = {
                        name: `VISUAL ${visualRwyDesignation}`,
                        runway: runway.designation,
                        icaos: [],
                        transitions: [],
                        finalLegs: [],
                        missedLegs: [],
                        approachType: AdditionalApproachType.APPROACH_TYPE_VISUAL,
                        approachSuffix: '',
                        runwayDesignator: runway.runwayDesignator,
                        runwayNumber: runway.direction,
                        rnavTypeFlags: RnavTypeFlags.None
                    };
                }
            }
        }
        return approach;
    }
    /**
     * Gets the name of a departure procedure as a string.
     * @param airport The airport to which the departure belongs.
     * @param departure A departure procedure definition.
     * @param transitionIndex The index of the departure enroute transition.
     * @param runway The runway of the departure, if any.
     * @returns The name of the departure procedure.
     */
    static getDepartureNameAsString(airport, departure, transitionIndex, runway) {
        let name = `${ICAO.getIdent(airport.icao)}–`;
        if (runway) {
            name += `RW${runway.designation}.`;
        }
        const transition = departure.enRouteTransitions[transitionIndex];
        if (transition !== undefined && transitionIndex > -1 && transition.legs.length > 0) {
            name += `${departure.name}.${ICAO.getIdent(transition.legs[transition.legs.length - 1].fixIcao)}`;
        }
        else if (departure.commonLegs.length > 0) {
            name += `${departure.name}.${ICAO.getIdent(departure.commonLegs[departure.commonLegs.length - 1].fixIcao)}`;
        }
        else {
            name += `${departure.name}`;
        }
        return name;
    }
    /**
     * Gets the name of a arrival procedure as a string.
     * @param airport The airport to which the departure belongs.
     * @param arrival An arrival procedure definition.
     * @param transitionIndex The index of the arrival enroute transition.
     * @param runway The runway of the arrival, if any.
     * @returns The name of the arrival procedure.
     */
    static getArrivalNameAsString(airport, arrival, transitionIndex, runway) {
        let name = `${ICAO.getIdent(airport.icao)}–`;
        const transition = arrival.enRouteTransitions[transitionIndex];
        if (transition !== undefined && transitionIndex > -1 && transition.legs.length > 0) {
            name += `${ICAO.getIdent(transition.legs[0].fixIcao)}.${arrival === null || arrival === void 0 ? void 0 : arrival.name}`;
        }
        else if (arrival.commonLegs.length > 0) {
            name += `${ICAO.getIdent(arrival.commonLegs[0].fixIcao)}.${arrival === null || arrival === void 0 ? void 0 : arrival.name}`;
        }
        else {
            name += `${arrival === null || arrival === void 0 ? void 0 : arrival.name}`;
        }
        if (runway) {
            name += `.RW${runway.designation}`;
        }
        return name;
    }
    /**
     * Utility method to analyze an approach for its name components and
     * pack them into a custom type.
     * @param proc The approach procedure.
     * @returns The name as an ApproachNameParts
     */
    static getApproachNameAsParts(proc) {
        let type;
        let subtype;
        let rnavType;
        switch (proc.approachType) {
            case ApproachType.APPROACH_TYPE_GPS:
                type = 'GPS';
                break;
            case ApproachType.APPROACH_TYPE_VOR:
                type = 'VOR';
                break;
            case ApproachType.APPROACH_TYPE_NDB:
                type = 'NDB';
                break;
            case ApproachType.APPROACH_TYPE_ILS:
                type = 'ILS';
                break;
            case ApproachType.APPROACH_TYPE_LOCALIZER:
                type = 'LOC';
                break;
            case ApproachType.APPROACH_TYPE_SDF:
                type = 'SDF';
                break;
            case ApproachType.APPROACH_TYPE_LDA:
                type = 'LDA';
                break;
            case ApproachType.APPROACH_TYPE_VORDME:
                type = 'VOR/DME';
                break;
            case ApproachType.APPROACH_TYPE_NDBDME:
                type = 'NDB/DME';
                break;
            case ApproachType.APPROACH_TYPE_RNAV:
                type = 'RNAV';
                subtype = 'GPS';
                break;
            case ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE:
                type = 'LOC BC';
                break;
            case AdditionalApproachType.APPROACH_TYPE_VISUAL:
                type = 'VISUAL';
                break;
            default:
                type = '???';
                break;
        }
        if (proc.approachType === ApproachType.APPROACH_TYPE_RNAV) {
            switch (FmsUtils.getBestRnavType(proc.rnavTypeFlags)) {
                case RnavTypeFlags.LNAV:
                    rnavType = 'LNAV+V';
                    break;
                case RnavTypeFlags.LP:
                    rnavType = 'LP+V';
                    break;
                case RnavTypeFlags.LNAVVNAV:
                    rnavType = 'LNAV/VNAV';
                    break;
                case RnavTypeFlags.LPV:
                    rnavType = 'LPV';
                    break;
            }
        }
        return {
            type: type,
            subtype: subtype,
            suffix: proc.approachSuffix ? proc.approachSuffix : undefined,
            runway: proc.runwayNumber === 0 ? undefined : RunwayUtils.getRunwayNameString(proc.runwayNumber, proc.runwayDesignator, true),
            flags: rnavType
        };
    }
    /**
     * Utility method that takes an approach and returns its name as a flat
     * string suitable for use in embedded text content.
     * @param approach The approach as an ApproaceProcedure
     * @returns The formatted name as a string.
     */
    static getApproachNameAsString(approach) {
        const parts = FmsUtils.getApproachNameAsParts(approach);
        let name = parts.type;
        parts.subtype && (name += `${parts.subtype}`);
        parts.suffix && (name += `${parts.runway ? ' ' : '–'}${parts.suffix}`);
        parts.runway && (name += ` ${parts.runway}`);
        parts.flags && (name += ` ${parts.flags}`);
        return name;
    }
    /**
     * Gets an approach frequency from the facility record.
     * @param facility The airport facility.
     * @param approachIndex The approach Index.
     * @returns The FacilityFrequency or undefined
     */
    static getApproachFrequency(facility, approachIndex) {
        const approach = facility === null || facility === void 0 ? void 0 : facility.approaches[approachIndex !== null && approachIndex !== void 0 ? approachIndex : -1];
        if (approach && (approach.approachType === ApproachType.APPROACH_TYPE_ILS
            || approach.approachType === ApproachType.APPROACH_TYPE_LOCALIZER
            || approach.approachType === ApproachType.APPROACH_TYPE_LDA
            || approach.approachType === ApproachType.APPROACH_TYPE_SDF)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const freq = RunwayUtils.getLocFrequency(facility, approach.runway);
            return freq;
        }
        else {
            return undefined;
        }
    }
}
FmsUtils.tempGeoPoint = new GeoPoint(0, 0);
