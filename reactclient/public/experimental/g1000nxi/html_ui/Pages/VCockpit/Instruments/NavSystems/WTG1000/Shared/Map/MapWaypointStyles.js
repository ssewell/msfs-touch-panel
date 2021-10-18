import { AirportSize } from '../Navigation/Waypoint';
/**
 * A utility class for generating Garmin-based waypoint styles.
 */
export class MapWaypointStyles {
    /**
     * Gets styles for waypoints rendered in a normal role.
     * @param baseIconPriority The base waypoint icon render priority. Icon priorities are guaranteed to fall in the
     * range `[baseIconPriority, baseIconPriority + 1)`.
     * @param baseLabelPriority The base waypoint label render priority. Label priorities are guaranteed to fall in the
     * range `[baseLabelPriority, baseLabelPriority + 1)`.
     * @param scale The linear scale of the styles. The larger the value, the larger the rendered icons and labels.
     * Defaults to 1.
     * @returns styles for waypoints rendered in a normal role.
     */
    static getNormalStyles(baseIconPriority, baseLabelPriority, scale = 1) {
        return {
            airportIconPriority: {
                [AirportSize.Large]: baseIconPriority + 0.8,
                [AirportSize.Medium]: baseIconPriority + 0.79,
                [AirportSize.Small]: baseIconPriority + 0.78
            },
            vorIconPriority: baseIconPriority + 0.7,
            ndbIconPriority: baseIconPriority + 0.6,
            intIconPriority: baseIconPriority + 0.5,
            airportIconSize: {
                [AirportSize.Large]: 26 * scale,
                [AirportSize.Medium]: 26 * scale,
                [AirportSize.Small]: 26 * scale
            },
            vorIconSize: 32 * scale,
            ndbIconSize: 32 * scale,
            intIconSize: 32 * scale,
            airportLabelPriority: {
                [AirportSize.Large]: baseLabelPriority + 0.8,
                [AirportSize.Medium]: baseLabelPriority + 0.79,
                [AirportSize.Small]: baseLabelPriority + 0.78
            },
            vorLabelPriority: baseLabelPriority + 0.7,
            ndbLabelPriority: baseLabelPriority + 0.6,
            intLabelPriority: baseLabelPriority + 0.5,
            airportLabelOptions: {
                [AirportSize.Large]: MapWaypointStyles.createNormalLabelOptions(new Float64Array([0, -12 * scale]), 20 * scale),
                [AirportSize.Medium]: MapWaypointStyles.createNormalLabelOptions(new Float64Array([0, -12 * scale]), 16 * scale),
                [AirportSize.Small]: MapWaypointStyles.createNormalLabelOptions(new Float64Array([0, -12 * scale]), 16 * scale)
            },
            vorLabelOptions: MapWaypointStyles.createNormalLabelOptions(new Float64Array([0, -8 * scale]), 16 * scale),
            ndbLabelOptions: MapWaypointStyles.createNormalLabelOptions(new Float64Array([0, -8 * scale]), 16 * scale),
            intLabelOptions: MapWaypointStyles.createNormalLabelOptions(new Float64Array([0, -5 * scale]), 16 * scale),
        };
    }
    /**
     * Creates initialization options for waypoint labels rendered in a normal role.
     * @param offset The label offset, in pixels.
     * @param fontSize The font size of the label, in pixels.
     * @returns initialization options for waypoint labels rendered in a normal role.
     */
    static createNormalLabelOptions(offset, fontSize) {
        return {
            anchor: new Float64Array([0.5, 1]),
            offset,
            fontSize,
            fontOutlineWidth: 6
        };
    }
    /**
     * Gets styles for waypoints rendered as part of a flight plan.
     * @param active Whether to get styles for active waypoints.
     * @param baseIconPriority The base waypoint icon render priority. Icon priorities are guaranteed to fall in the
     * range `[baseIconPriority, baseIconPriority + 1)`.
     * @param baseLabelPriority The base waypoint label render priority. Label priorities are guaranteed to fall in the
     * range `[baseLabelPriority, baseLabelPriority + 1)`.
     * @param scale The linear scale of the styles. The larger the value, the larger the rendered icons and labels.
     * Defaults to 1.
     * @returns styles for waypoints rendered as part of a flight plan.
     */
    static getFlightPlanStyles(active, baseIconPriority, baseLabelPriority, scale = 1) {
        const createLabelOptions = active
            ? MapWaypointStyles.createFlightPlanActiveLabelOptions.bind(this)
            : MapWaypointStyles.createFlightPlanInactiveLabelOptions.bind(this);
        return {
            airportIconPriority: {
                [AirportSize.Large]: baseIconPriority + 0.8,
                [AirportSize.Medium]: baseIconPriority + 0.79,
                [AirportSize.Small]: baseIconPriority + 0.78
            },
            vorIconPriority: baseIconPriority + 0.7,
            ndbIconPriority: baseIconPriority + 0.6,
            intIconPriority: baseIconPriority + 0.5,
            rwyIconPriority: baseIconPriority + 0.4,
            userIconPriority: baseIconPriority + 0.9,
            fpIconPriority: baseIconPriority + 0.1,
            airportIconSize: {
                [AirportSize.Large]: 26 * scale,
                [AirportSize.Medium]: 26 * scale,
                [AirportSize.Small]: 26 * scale
            },
            vorIconSize: 32 * scale,
            ndbIconSize: 32 * scale,
            intIconSize: 32 * scale,
            rwyIconSize: 32 * scale,
            userIconSize: 32 * scale,
            fpIconSize: 8 * scale,
            airportLabelPriority: {
                [AirportSize.Large]: baseLabelPriority + 0.8,
                [AirportSize.Medium]: baseLabelPriority + 0.79,
                [AirportSize.Small]: baseLabelPriority + 0.78
            },
            vorLabelPriority: baseLabelPriority + 0.7,
            ndbLabelPriority: baseLabelPriority + 0.6,
            intLabelPriority: baseLabelPriority + 0.5,
            rwyLabelPriority: baseLabelPriority + 0.4,
            userLabelPriority: baseLabelPriority + 0.9,
            fpLabelPriority: baseLabelPriority + 0.1,
            airportLabelOptions: {
                [AirportSize.Large]: createLabelOptions(new Float64Array([0, -15 * scale]), 20 * scale),
                [AirportSize.Medium]: createLabelOptions(new Float64Array([0, -15 * scale]), 16 * scale),
                [AirportSize.Small]: createLabelOptions(new Float64Array([0, -15 * scale]), 16 * scale)
            },
            vorLabelOptions: createLabelOptions(new Float64Array([0, -11 * scale]), 16 * scale),
            ndbLabelOptions: createLabelOptions(new Float64Array([0, -11 * scale]), 16 * scale),
            intLabelOptions: createLabelOptions(new Float64Array([0, -8 * scale]), 16 * scale),
            rwyLabelOptions: createLabelOptions(new Float64Array([0, -8 * scale]), 16 * scale),
            userLabelOptions: createLabelOptions(new Float64Array([0, -12 * scale]), 16 * scale),
            fpLabelOptions: createLabelOptions(new Float64Array([0, -8 * scale]), 16 * scale),
        };
    }
    /**
     * Creates initialization options for labels for inactive waypoints rendered as part of a flight plan.
     * @param offset The label offset, in pixels.
     * @param fontSize The font size of the label, in pixels.
     * @returns initialization options for labels for inactive waypoints rendered as part of a flight plan.
     */
    static createFlightPlanInactiveLabelOptions(offset, fontSize) {
        return {
            anchor: new Float64Array([0.5, 1]),
            offset,
            font: 'Roboto-Bold',
            fontSize,
            fontColor: 'black',
            fontOutlineWidth: 0,
            showBg: true,
            bgPadding: [1, 1, 1, 1],
            bgColor: 'white',
            bgOutlineWidth: 1,
            bgOutlineColor: 'black'
        };
    }
    /**
     * Creates initialization options for labels for inactive waypoints rendered as part of a flight plan.
     * @param offset The label offset, in pixels.
     * @param fontSize The font size of the label, in pixels.
     * @returns initialization options for labels for inactive waypoints rendered as part of a flight plan.
     */
    static createFlightPlanActiveLabelOptions(offset, fontSize) {
        return {
            anchor: new Float64Array([0.5, 1]),
            offset,
            font: 'Roboto-Bold',
            fontSize,
            fontColor: 'magenta',
            fontOutlineWidth: 0,
            showBg: true,
            bgPadding: [1, 1, 1, 1],
            bgOutlineWidth: 1
        };
    }
    /**
     * Gets styles for waypoints rendered as highlighted.
     * @param baseIconPriority The base waypoint icon render priority. Icon priorities are guaranteed to fall in the
     * range `[baseIconPriority, baseIconPriority + 1)`.
     * @param baseLabelPriority The base waypoint label render priority. Label priorities are guaranteed to fall in the
     * range `[baseLabelPriority, baseLabelPriority + 1)`.
     * @param scale The linear scale of the styles. The larger the value, the larger the rendered icons and labels.
     * Defaults to 1.
     * @returns styles for waypoints rendered as highlighted.
     */
    static getHighlightStyles(baseIconPriority, baseLabelPriority, scale = 1) {
        return {
            highlightRingRadiusBuffer: 0,
            highlightRingStrokeWidth: 2,
            highlightRingStrokeColor: 'white',
            highlightRingOutlineWidth: 0,
            highlightRingOutlineColor: 'black',
            highlightBgColor: '#3c3c3c',
            airportIconPriority: {
                [AirportSize.Large]: baseIconPriority + 0.8,
                [AirportSize.Medium]: baseIconPriority + 0.79,
                [AirportSize.Small]: baseIconPriority + 0.78
            },
            vorIconPriority: baseIconPriority + 0.7,
            ndbIconPriority: baseIconPriority + 0.6,
            intIconPriority: baseIconPriority + 0.5,
            userIconPriority: baseIconPriority + 0.9,
            airportIconSize: {
                [AirportSize.Large]: 26 * scale,
                [AirportSize.Medium]: 26 * scale,
                [AirportSize.Small]: 26 * scale
            },
            vorIconSize: 32 * scale,
            ndbIconSize: 32 * scale,
            intIconSize: 32 * scale,
            userIconSize: 32 * scale,
            airportLabelPriority: {
                [AirportSize.Large]: baseLabelPriority + 0.8,
                [AirportSize.Medium]: baseLabelPriority + 0.79,
                [AirportSize.Small]: baseLabelPriority + 0.78
            },
            vorLabelPriority: baseLabelPriority + 0.7,
            ndbLabelPriority: baseLabelPriority + 0.6,
            intLabelPriority: baseLabelPriority + 0.5,
            userLabelPriority: baseLabelPriority + 0.9,
            airportLabelOptions: {
                [AirportSize.Large]: MapWaypointStyles.createHighlightLabelOptions(new Float64Array([0, -17 * scale]), 20 * scale),
                [AirportSize.Medium]: MapWaypointStyles.createHighlightLabelOptions(new Float64Array([0, -17 * scale]), 16 * scale),
                [AirportSize.Small]: MapWaypointStyles.createHighlightLabelOptions(new Float64Array([0, -17 * scale]), 16 * scale)
            },
            vorLabelOptions: MapWaypointStyles.createHighlightLabelOptions(new Float64Array([0, -17 * scale]), 16 * scale),
            ndbLabelOptions: MapWaypointStyles.createHighlightLabelOptions(new Float64Array([0, -17 * scale]), 16 * scale),
            intLabelOptions: MapWaypointStyles.createHighlightLabelOptions(new Float64Array([0, -17 * scale]), 16 * scale),
            userLabelOptions: MapWaypointStyles.createHighlightLabelOptions(new Float64Array([0, -17 * scale]), 16 * scale)
        };
    }
    /**
     * Creates initialization options for labels for highlighted waypoints.
     * @param offset The label offset, in pixels.
     * @param fontSize The font size of the label, in pixels.
     * @returns initialization options for labels for highlighted waypoints.
     */
    static createHighlightLabelOptions(offset, fontSize) {
        return {
            anchor: new Float64Array([0.5, 1]),
            offset,
            font: 'Roboto-Bold',
            fontSize,
            fontColor: 'black',
            fontOutlineWidth: 0,
            showBg: true,
            bgPadding: [1, 1, 1, 1],
            bgColor: 'white',
            bgOutlineWidth: 1,
            bgOutlineColor: 'black'
        };
    }
}
