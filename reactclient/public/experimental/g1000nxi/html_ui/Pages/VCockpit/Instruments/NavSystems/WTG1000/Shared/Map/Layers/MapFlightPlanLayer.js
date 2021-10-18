import { FSComponent, GeoCircle, GeodesicResampler, GeoPoint, MagVar, UnitType } from 'msfssdk';
import { FacilityType, ICAO, LegType, FacilityLoader, FacilityRespository } from 'msfssdk/navigation';
import { FlightPlanSegmentType, FlightPathUtils } from 'msfssdk/flightplan';
import { VNavPathMode } from 'msfssdk/autopilot';
import { MapSyncedCanvasLayer, MapLayer, MapCullableLocationTextLabel, MapCachedCanvasLayer } from 'msfssdk/components/map';
import { MapWaypointRenderRole } from '../MapWaypointRenderer';
import { AirportSize, AirportWaypoint, CustomWaypoint, FacilityWaypoint, FlightPathWaypoint, VNavWaypoint } from '../../Navigation/Waypoint';
import { MapAirportIcon, MapBlankWaypointIcon, MapFlightPathWaypointIcon, MapIntersectionIcon, MapNdbIcon, MapRunwayWaypointIcon, MapUserWaypointIcon, MapVNavWaypointIcon, MapVorIcon } from '../MapWaypointIcon';
import { FacilityWaypointCache } from '../../Navigation/FacilityWaypointCache';
/**
 * A map layer which displays a flight plan.
 */
export class MapFlightPlanLayer extends MapLayer {
    /** @inheritdoc */
    constructor(props) {
        super(props);
        this.flightPathLayerRef = FSComponent.createRef();
        this.waypointLayerRef = FSComponent.createRef();
        this.resampler = new GeodesicResampler(Math.PI / 12, 1, 8);
        this.facLoader = new FacilityLoader(FacilityRespository.getRepository(this.props.bus));
        this.facWaypointCache = FacilityWaypointCache.getCache();
        this.legWaypointRecords = new Map();
        this.isRefreshWaypointsBusy = false;
        this.isObsActive = false;
        this.obsCourse = 0;
        this.needDrawRoute = false;
        this.needRefreshWaypoints = false;
        this.needRepickWaypoints = false;
        this.iconFactoryInactive = this.createWaypointIconFactory(this.props.inactiveWaypointStyles);
        this.labelFactoryInactive = this.createWaypointLabelFactory(this.props.inactiveWaypointStyles);
        this.iconFactoryActive = this.createWaypointIconFactory(this.props.activeWaypointStyles);
        this.labelFactoryActive = this.createWaypointLabelFactory(this.props.activeWaypointStyles);
        this.vnavIconFactory = new VNavWaypointIconFactory();
        this.vnavLabelFactory = new VNavWaypointLabelFactory();
    }
    /**
     * Creates a waypoint icon factory.
     * @param styles Styles the factory should use.
     * @returns a waypoint icon factory.
     */
    createWaypointIconFactory(styles) {
        return new WaypointIconFactory({
            airportIconPriority: Object.assign({}, styles.airportIconPriority),
            vorIconPriority: styles.vorIconPriority,
            ndbIconPriority: styles.ndbIconPriority,
            intIconPriority: styles.intIconPriority,
            rwyIconPriority: styles.rwyIconPriority,
            userIconPriority: styles.userIconPriority,
            fpIconPriority: styles.fpIconPriority,
            airportIconSize: Object.assign({}, styles.airportIconSize),
            vorIconSize: styles.vorIconSize,
            ndbIconSize: styles.ndbIconSize,
            intIconSize: styles.intIconSize,
            rwyIconSize: styles.rwyIconSize,
            userIconSize: styles.userIconSize,
            fpIconSize: styles.fpIconSize,
        });
    }
    /**
     * Creates a waypoint label factory.
     * @param styles Styles the factory should use.
     * @returns a waypoint label factory.
     */
    createWaypointLabelFactory(styles) {
        return new WaypointLabelFactory({
            airportLabelPriority: Object.assign({}, styles.airportLabelPriority),
            vorLabelPriority: styles.vorLabelPriority,
            ndbLabelPriority: styles.ndbLabelPriority,
            intLabelPriority: styles.intLabelPriority,
            rwyLabelPriority: styles.rwyLabelPriority,
            userLabelPriority: styles.userLabelPriority,
            fpLabelPriority: styles.fpLabelPriority,
            airportLabelOptions: {
                [AirportSize.Large]: Object.assign({}, styles.airportLabelOptions[AirportSize.Large]),
                [AirportSize.Medium]: Object.assign({}, styles.airportLabelOptions[AirportSize.Medium]),
                [AirportSize.Small]: Object.assign({}, styles.airportLabelOptions[AirportSize.Small])
            },
            vorLabelOptions: Object.assign({}, styles.vorLabelOptions),
            ndbLabelOptions: Object.assign({}, styles.ndbLabelOptions),
            intLabelOptions: Object.assign({}, styles.intLabelOptions),
            rwyLabelOptions: Object.assign({}, styles.rwyLabelOptions),
            userLabelOptions: Object.assign({}, styles.userLabelOptions),
            fpLabelOptions: Object.assign({}, styles.fpLabelOptions)
        });
    }
    /** @inheritdoc */
    onAttached() {
        super.onAttached();
        this.flightPathLayerRef.instance.onAttached();
        this.waypointLayerRef.instance.onAttached();
        this.initWaypointRenderer();
        this.initFlightPlanHandlers();
    }
    /**
     * Initializes the waypoint renderer.
     */
    initWaypointRenderer() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.props.waypointRenderer.setCanvasContext(MapWaypointRenderRole.FlightPlanInactive, this.waypointLayerRef.instance.display.context);
        this.props.waypointRenderer.setIconFactory(MapWaypointRenderRole.FlightPlanInactive, this.iconFactoryInactive);
        this.props.waypointRenderer.setLabelFactory(MapWaypointRenderRole.FlightPlanInactive, this.labelFactoryInactive);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.props.waypointRenderer.setCanvasContext(MapWaypointRenderRole.FlightPlanActive, this.waypointLayerRef.instance.display.context);
        this.props.waypointRenderer.setIconFactory(MapWaypointRenderRole.FlightPlanActive, this.iconFactoryActive);
        this.props.waypointRenderer.setLabelFactory(MapWaypointRenderRole.FlightPlanActive, this.labelFactoryActive);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.props.waypointRenderer.setCanvasContext(MapWaypointRenderRole.VNav, this.waypointLayerRef.instance.display.context);
        this.props.waypointRenderer.setIconFactory(MapWaypointRenderRole.VNav, this.vnavIconFactory);
        this.props.waypointRenderer.setLabelFactory(MapWaypointRenderRole.VNav, this.vnavLabelFactory);
    }
    /**
     * Initializes handlers to respond to flight plan events.
     */
    initFlightPlanHandlers() {
        this.props.drawEntirePlan.sub(() => { this.scheduleUpdates(true, true, true); });
        this.props.dataProvider.plan.sub(() => { this.scheduleUpdates(true, true, true); }, true);
        this.props.dataProvider.planModified.on(() => { this.scheduleUpdates(false, true, true); });
        this.props.dataProvider.planCalculated.on(() => {
            this.scheduleUpdates(true, true, false);
            this.onTodBodChanged();
        });
        this.props.dataProvider.activeLateralLegIndex.sub(() => { this.scheduleUpdates(true, true, true); });
        this.props.dataProvider.activeLNavLegVectorIndex.sub(() => { this.scheduleUpdates(true, false, false); });
        this.props.dataProvider.isLNavSuspended.sub(() => { this.scheduleUpdates(true, false, false); });
        this.props.dataProvider.vnavTodLegIndex.sub(() => { this.onTodBodChanged(); });
        this.props.dataProvider.vnavTodLegDistance.sub(() => { this.onTodBodChanged(); });
        this.props.dataProvider.vnavBodLegIndex.sub(() => { this.onTodBodChanged(); });
        this.props.dataProvider.obsCourse.sub((course) => {
            const isActive = course !== undefined;
            const needFullUpdate = isActive !== this.isObsActive;
            this.isObsActive = isActive;
            this.obsCourse = course !== null && course !== void 0 ? course : this.obsCourse;
            this.scheduleUpdates(this.isObsActive, needFullUpdate, needFullUpdate);
        });
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onMapProjectionChanged(mapProjection, changeFlags) {
        this.flightPathLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
        this.waypointLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onUpdated(time, elapsed) {
        this.flightPathLayerRef.instance.onUpdated(time, elapsed);
        this.updateFromFlightPathLayerInvalidation();
        this.updateRedrawRoute();
        this.updateRefreshWaypoints();
    }
    /**
     * Checks if the flight path layer's display canvas has been invalidated, and if so, clears it and schedules a redraw.
     */
    updateFromFlightPathLayerInvalidation() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const display = this.flightPathLayerRef.instance.display;
        this.needDrawRoute || (this.needDrawRoute = display.isInvalid);
        if (display.isInvalid) {
            display.clear();
            display.syncWithMapProjection(this.props.mapProjection, this.flightPathLayerRef.instance.getReferenceMargin());
        }
    }
    /**
     * Redraws the flight path if a redraw is scheduled.
     */
    updateRedrawRoute() {
        if (this.needDrawRoute) {
            this.drawRoute();
            this.needDrawRoute = false;
        }
    }
    /**
     * Refreshes this layer's flight plan leg waypoint records if a refresh is scheduled.
     */
    updateRefreshWaypoints() {
        if (this.needRefreshWaypoints && !this.isRefreshWaypointsBusy) {
            this.refreshWaypoints();
            this.needRefreshWaypoints = false;
            this.needRepickWaypoints = false;
        }
    }
    /**
     * Draws the flight path route.
     */
    drawRoute() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const display = this.flightPathLayerRef.instance.display;
        const context = display.context;
        display.clear();
        const flightPlan = this.props.dataProvider.plan.get();
        if (!flightPlan) {
            return;
        }
        const activeLegIndex = this.props.dataProvider.activeLateralLegIndex.get();
        const baseRouteInitialIndex = this.props.drawEntirePlan.get()
            ? 0
            : activeLegIndex >= 0
                ? this.isObsActive ? activeLegIndex : activeLegIndex - 1
                : flightPlan.length;
        this.drawBaseRoute(flightPlan, baseRouteInitialIndex, context);
        if (this.isObsActive) {
            this.drawObs(flightPlan, context);
        }
        else {
            this.drawRouteWithTurns(flightPlan, context);
        }
    }
    /**
     * Draws the flight plan route, including leg to leg turns.
     * @param flightPlan The flight plan to draw.
     * @param context The context to draw to.
     */
    drawRouteWithTurns(flightPlan, context) {
        var _a, _b;
        let legIndex = 0;
        const activeLegIndex = this.props.dataProvider.activeLateralLegIndex.get();
        const drawnActiveLegIndex = activeLegIndex >= 0 ? activeLegIndex : flightPlan.length;
        const firstIndex = this.props.drawEntirePlan.get() ? 0 : drawnActiveLegIndex - 1;
        let isInMissedApproach = false;
        const isMissedApproachActive = drawnActiveLegIndex < flightPlan.length && flightPlan.getLeg(drawnActiveLegIndex).isInMissedApproachSequence;
        context.beginPath();
        context.lineWidth = MapFlightPlanLayer.ROUTE_PRIOR_STROKE_WIDTH;
        context.strokeStyle = MapFlightPlanLayer.ROUTE_PRIOR_STROKE_COLOR;
        let activeLeg = null;
        for (const leg of flightPlan.legs()) {
            if (legIndex >= firstIndex && (!leg.isInDirectToSequence || legIndex === drawnActiveLegIndex)) {
                if (legIndex < drawnActiveLegIndex) {
                    if (leg.leg.type === LegType.HM || ((leg.leg.type === LegType.HF || leg.leg.type === LegType.HA) && ((_b = (_a = leg.calculated) === null || _a === void 0 ? void 0 : _a.flightPath.length) !== null && _b !== void 0 ? _b : 0) > 4)) {
                        this.drawLegWithTurns(leg, context, false, false, leg.calculated ? leg.calculated.flightPath.length - 4 : 0);
                    }
                    else {
                        this.drawLegWithTurns(leg, context);
                    }
                }
                else if (legIndex > drawnActiveLegIndex) {
                    if (!isInMissedApproach && !isMissedApproachActive && leg.isInMissedApproachSequence) {
                        context.stroke();
                        context.beginPath();
                        context.lineWidth = MapFlightPlanLayer.ROUTE_MISSED_APPROACH_STROKE_WIDTH;
                        context.strokeStyle = MapFlightPlanLayer.ROUTE_PRIOR_STROKE_COLOR;
                        isInMissedApproach = true;
                    }
                    if (leg.leg.type === LegType.HM) {
                        this.drawHold(leg, activeLeg, context);
                    }
                    else {
                        this.drawLegWithTurns(leg, context);
                    }
                }
                else {
                    context.stroke();
                    context.beginPath();
                    context.lineWidth = MapFlightPlanLayer.ROUTE_STROKE_WIDTH;
                    context.strokeStyle = 'white';
                    activeLeg = leg;
                }
            }
            legIndex++;
        }
        if (activeLeg) {
            context.stroke();
            context.beginPath();
            context.lineWidth = MapFlightPlanLayer.ROUTE_STROKE_WIDTH;
            context.strokeStyle = 'magenta';
            if (activeLeg.leg.type === LegType.HM) {
                this.drawHold(activeLeg, activeLeg, context);
            }
            else {
                this.drawLegWithTurns(activeLeg, context);
            }
        }
        context.stroke();
    }
    /**
     * Draws a flight plan leg, including leg to leg turns.
     * @param leg The leg to draw.
     * @param context The context to draw to.
     * @param skipIngress Skips drawing the ingress leg.
     * @param skipEgress Skips drawing the egress leg.
     * @param startIndex The index to start drawing the leg at.
     */
    drawLegWithTurns(leg, context, skipIngress = false, skipEgress = false, startIndex = 0) {
        const calculated = leg.calculated;
        if (calculated) {
            for (let i = startIndex; i < calculated.flightPath.length; i++) {
                const vector = calculated.flightPath[i];
                if (i === 0 && calculated.ingressTurn.radius !== 0) {
                    if (i === calculated.flightPath.length - 1 && calculated.egressTurn.radius !== 0) {
                        this.drawVectorSegment(vector, context, skipIngress ? undefined : calculated.ingressTurn, skipEgress ? undefined : calculated.egressTurn);
                    }
                    else {
                        this.drawVectorSegment(vector, context, skipIngress ? undefined : calculated.ingressTurn);
                    }
                }
                else if (i === calculated.flightPath.length - 1 && calculated.egressTurn.radius !== 0) {
                    this.drawVectorSegment(vector, context, undefined, skipEgress ? undefined : calculated.egressTurn);
                }
                else {
                    this.drawVectorSegment(vector, context);
                }
            }
        }
    }
    /**
     * Draws a hold leg.
     * @param leg The hold leg to draw.
     * @param activeLeg The current active leg.
     * @param context The context to draw to.
     */
    drawHold(leg, activeLeg, context) {
        var _a, _b;
        const inHold = leg.calculated !== undefined && this.props.dataProvider.activeLNavLegVectorIndex.get() >= leg.calculated.flightPath.length - 4;
        const isActiveLeg = leg === activeLeg;
        if (!isActiveLeg) {
            this.drawLegWithTurns(leg, context, false, true);
        }
        else {
            if (inHold && !this.props.dataProvider.isLNavSuspended.get()) {
                const startIndex = leg.calculated !== undefined ? ((_a = leg.calculated) === null || _a === void 0 ? void 0 : _a.flightPath.length) - 4 : 0;
                this.drawLegWithTurns(leg, context, true, false, startIndex);
            }
            else if (inHold) {
                const startIndex = leg.calculated !== undefined ? ((_b = leg.calculated) === null || _b === void 0 ? void 0 : _b.flightPath.length) - 4 : 0;
                this.drawLegWithTurns(leg, context, true, true, startIndex);
            }
            else {
                this.drawLegWithTurns(leg, context, false, true);
            }
        }
    }
    /**
     * Draws the flight plan route, without any leg to leg turns.
     * @param flightPlan The flight plan to draw.
     * @param initialIndex The index of the first flight plan leg to draw.
     * @param context The context to draw to.
     */
    drawBaseRoute(flightPlan, initialIndex, context) {
        context.beginPath();
        context.lineWidth = MapFlightPlanLayer.BASE_ROUTE_STROKE_WIDTH;
        context.strokeStyle = MapFlightPlanLayer.BASE_ROUTE_STROKE_COLOR;
        let legIndex = 0;
        for (const leg of flightPlan.legs()) {
            if (legIndex >= initialIndex && (!leg.isInDirectToSequence || legIndex === flightPlan.activeLateralLeg)) {
                this.drawLegWithoutTurns(leg, context);
            }
            legIndex++;
        }
        context.stroke();
    }
    /**
     * Draws the OBS route.
     * @param flightPlan The active flight plan.
     * @param context The context to draw to.
     */
    drawObs(flightPlan, context) {
        var _a, _b;
        const activeLegIndex = this.props.dataProvider.activeLateralLegIndex.get();
        const activeLeg = activeLegIndex >= 0 && activeLegIndex < flightPlan.length
            ? flightPlan.getLeg(flightPlan.activeLateralLeg)
            : null;
        if (((_a = activeLeg === null || activeLeg === void 0 ? void 0 : activeLeg.calculated) === null || _a === void 0 ? void 0 : _a.endLat) === undefined || ((_b = activeLeg === null || activeLeg === void 0 ? void 0 : activeLeg.calculated) === null || _b === void 0 ? void 0 : _b.endLon) === undefined) {
            return;
        }
        context.lineWidth = MapFlightPlanLayer.ROUTE_STROKE_WIDTH;
        const obsFix = MapFlightPlanLayer.geoPointCache[0].set(activeLeg.calculated.endLat, activeLeg.calculated.endLon);
        const obsLat = obsFix.lat;
        const obsLon = obsFix.lon;
        const obsCourseTrue = MagVar.magneticToTrue(this.obsCourse, obsLat, obsLon);
        const obsPath = MapFlightPlanLayer.geoCircleCache[0].setAsGreatCircle(obsFix, obsCourseTrue);
        const start = obsPath.offsetDistanceAlong(obsFix, UnitType.NMILE.convertTo(-500, UnitType.GA_RADIAN), MapFlightPlanLayer.geoPointCache[1]);
        const startLat = start.lat;
        const startLon = start.lon;
        const end = obsPath.offsetDistanceAlong(obsFix, UnitType.NMILE.convertTo(500, UnitType.GA_RADIAN), MapFlightPlanLayer.geoPointCache[1]);
        const endLat = end.lat;
        const endLon = end.lon;
        context.strokeStyle = 'magenta';
        context.beginPath();
        this.drawTrack(startLat, startLon, obsLat, obsLon, context);
        context.stroke();
        context.strokeStyle = 'white';
        context.beginPath();
        this.drawTrack(obsLat, obsLon, endLat, endLon, context);
        context.stroke();
    }
    /**
     * Draws a flight plan leg, excluding leg to leg turns.
     * @param leg The leg to draw.
     * @param context The context to draw to.
     */
    drawLegWithoutTurns(leg, context) {
        const calculated = leg.calculated;
        if (calculated !== undefined) {
            for (let i = 0; i < calculated.flightPath.length; i++) {
                const vector = calculated.flightPath[i];
                this.drawVectorSegment(vector, context);
            }
        }
    }
    /**
     * Refreshes this layer's flight plan leg waypoint records, keeping them up to date with the active flight plan.
     */
    async refreshWaypoints() {
        this.isRefreshWaypointsBusy = true;
        const flightPlan = this.props.dataProvider.plan.get();
        if (!flightPlan) {
            // Remove all waypoint records.
            for (const record of this.legWaypointRecords.values()) {
                record.destroy();
            }
            this.legWaypointRecords.clear();
            this.isRefreshWaypointsBusy = false;
            return;
        }
        const activeLegIndex = this.props.dataProvider.activeLateralLegIndex.get();
        const activeLeg = activeLegIndex >= 0 && activeLegIndex < flightPlan.length
            ? flightPlan.getLeg(activeLegIndex)
            : null;
        if (this.needRepickWaypoints) {
            const legsToDisplay = new Set();
            // Gather all legs to display.
            const firstLegIndex = this.props.drawEntirePlan.get()
                ? 0
                : activeLegIndex >= 0
                    ? this.isObsActive ? activeLegIndex : activeLegIndex - 2
                    : flightPlan.length;
            let legIndex = 0;
            for (const leg of flightPlan.legs()) {
                if (legIndex >= firstLegIndex && (!leg.isInDirectToSequence || legIndex === flightPlan.activeLateralLeg)) {
                    legsToDisplay.add(leg);
                }
                legIndex++;
            }
            // Remove records of legs that are no longer in the set of legs to display.
            for (const record of this.legWaypointRecords.values()) {
                if (legsToDisplay.has(record.leg)) {
                    legsToDisplay.delete(record.leg);
                }
                else {
                    record.destroy();
                    this.legWaypointRecords.delete(record.leg);
                }
            }
            // Create new records for legs to display that don't already have records.
            for (const leg of legsToDisplay) {
                const record = this.createLegWaypointsRecord(leg);
                this.legWaypointRecords.set(leg, record);
            }
        }
        const waypointRefreshes = [];
        for (const record of this.legWaypointRecords.values()) {
            waypointRefreshes.push(record.refresh(record.leg === activeLeg));
        }
        await Promise.all(waypointRefreshes);
        this.isRefreshWaypointsBusy = false;
    }
    /**
     * Creates a FlightPlanLegWaypointsRecord for a specified flight plan leg.
     * @param leg A flight plan leg.
     * @returns A FlightPlanLegWaypointsRecord for the specified flight plan leg.
     */
    createLegWaypointsRecord(leg) {
        switch (leg.leg.type) {
            case LegType.CD:
            case LegType.VD:
            case LegType.CR:
            case LegType.VR:
            case LegType.FC:
            case LegType.FD:
            case LegType.FA:
            case LegType.CA:
            case LegType.VA:
            case LegType.FM:
            case LegType.VM:
            case LegType.CI:
            case LegType.VI:
                return new FlightPathTerminatorWaypointsRecord(leg, this.props.waypointRenderer, this.facLoader);
            case LegType.PI:
                return new ProcedureTurnLegWaypointsRecord(leg, this.props.waypointRenderer, this.facLoader, this.facWaypointCache);
            default:
                return new FixIcaoWaypointsRecord(leg, this.props.waypointRenderer, this.facLoader, this.facWaypointCache);
        }
    }
    /**
     * Draws a segment of a vector to the flight plan layer.
     * @param vector The vector to draw.
     * @param context The canvas context to draw to.
     * @param turnBefore A turn to draw before the vector, if any.
     * @param turnAfter A turn to draw after the vector, if any.
     */
    drawVectorSegment(vector, context, turnBefore, turnAfter) {
        let currentLat = vector.startLat;
        let currentLon = vector.startLon;
        if (turnBefore !== undefined) {
            const turnCircle = FlightPathUtils.setGeoCircleFromVector(turnBefore, MapFlightPlanLayer.geoCircleCache[0]);
            const turnCenter = FlightPathUtils.getTurnCenterFromCircle(turnCircle, MapFlightPlanLayer.geoPointCache[0]);
            this.drawArc(turnBefore.startLat, turnBefore.startLon, turnBefore.endLat, turnBefore.endLon, turnCenter.lat, turnCenter.lon, FlightPathUtils.getTurnDirectionFromCircle(turnCircle), context);
            currentLat = turnBefore.endLat;
            currentLon = turnBefore.endLon;
        }
        let endLat = vector.endLat;
        let endLon = vector.endLon;
        if (turnAfter !== undefined) {
            endLat = turnAfter.startLat;
            endLon = turnAfter.startLon;
        }
        const circle = FlightPathUtils.setGeoCircleFromVector(vector, MapFlightPlanLayer.geoCircleCache[0]);
        if (FlightPathUtils.isVectorGreatCircle(vector)) {
            const distanceRad = UnitType.METER.convertTo(vector.distance, UnitType.GA_RADIAN);
            if (distanceRad >= Math.PI - GeoPoint.EQUALITY_TOLERANCE) {
                const startPoint = GeoPoint.sphericalToCartesian(vector.startLat, vector.startLon, MapFlightPlanLayer.vec3Cache[0]);
                const midPoint = circle.offsetDistanceAlong(startPoint, distanceRad, MapFlightPlanLayer.geoPointCache[0]);
                const midLat = midPoint.lat;
                const midLon = midPoint.lon;
                this.drawTrack(currentLat, currentLon, midLat, midLon, context);
                this.drawTrack(midLat, midLon, endLat, endLon, context);
            }
            else {
                this.drawTrack(currentLat, currentLon, endLat, endLon, context);
            }
        }
        else {
            const turnCenter = FlightPathUtils.getTurnCenterFromCircle(circle, MapFlightPlanLayer.geoPointCache[0]);
            this.drawArc(currentLat, currentLon, endLat, endLon, turnCenter.lat, turnCenter.lon, FlightPathUtils.getTurnDirectionFromCircle(circle), context);
        }
        if (turnAfter !== undefined) {
            const turnCircle = FlightPathUtils.setGeoCircleFromVector(turnAfter, MapFlightPlanLayer.geoCircleCache[0]);
            const turnCenter = FlightPathUtils.getTurnCenterFromCircle(turnCircle, MapFlightPlanLayer.geoPointCache[0]);
            this.drawArc(turnAfter.startLat, turnAfter.startLon, turnAfter.endLat, turnAfter.endLon, turnCenter.lat, turnCenter.lon, FlightPathUtils.getTurnDirectionFromCircle(turnCircle), context);
        }
    }
    /**
     * Draws a track vector.
     * @param sLat The starting lat.
     * @param sLon The starting lon.
     * @param eLat The ending lat.
     * @param eLon The ending lon.
     * @param context The context to draw to.
     */
    drawTrack(sLat, sLon, eLat, eLon, context) {
        const start = MapFlightPlanLayer.geoPointCache[0].set(sLat, sLon);
        const end = MapFlightPlanLayer.geoPointCache[1].set(eLat, eLon);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.resampler.resample(this.flightPathLayerRef.instance.display.geoProjection, start, end, this.drawResampledTrack.bind(this, context));
    }
    /**
     * Draws the path for a resampled point along a track vector.
     * @param context The context to draw to.
     * @param point The resampled point to draw.
     * @param projected The projected resampled point to draw.
     * @param index The index of the resampled point.
     */
    drawResampledTrack(context, point, projected, index) {
        if (index === 0) {
            context.moveTo(projected[0], projected[1]);
        }
        else {
            context.lineTo(projected[0], projected[1]);
        }
    }
    /**
     * Draws an arc vector.
     * @param sLat The starting lat.
     * @param sLon The starting lon.
     * @param eLat The ending lat.
     * @param eLon The ending lon.
     * @param cLat The center lat.
     * @param cLon The center lon.
     * @param turnDirection The turn direction of the arc.
     * @param context The context to draw to.
     */
    drawArc(sLat, sLon, eLat, eLon, cLat, cLon, turnDirection, context) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const projection = this.flightPathLayerRef.instance.display.geoProjection;
        const start = MapFlightPlanLayer.geoPointCache[0].set(sLat, sLon);
        const startProjected = projection.project(start, MapFlightPlanLayer.vec2Cache[0]);
        const x1 = startProjected[0];
        const y1 = startProjected[1];
        const end = MapFlightPlanLayer.geoPointCache[0].set(eLat, eLon);
        const endProjected = projection.project(end, MapFlightPlanLayer.vec2Cache[0]);
        const x2 = endProjected[0];
        const y2 = endProjected[1];
        const center = MapFlightPlanLayer.geoPointCache[0].set(cLat, cLon);
        const centerProjected = projection.project(center, MapFlightPlanLayer.vec2Cache[0]);
        const cx = centerProjected[0];
        const cy = centerProjected[1];
        const radiusPixels = Math.sqrt(Math.pow(cx - x1, 2) + Math.pow(cy - y1, 2));
        const startRadians = Math.atan2(y1 - cy, x1 - cx);
        const endRadians = Math.atan2(y2 - cy, x2 - cx);
        context.moveTo(x1, y1);
        context.arc(cx, cy, radiusPixels, startRadians, endRadians, turnDirection === 'left');
    }
    /**
     * Schedules flight plan drawing updates.
     * @param scheduleRedrawRoute Whether to schedule a redraw of the flight path.
     * @param scheduleRefreshWaypoints Whether to schedule a refresh of waypoints records.
     * @param scheduleRepickWaypoints Whether to schedule a repick of waypoints records.
     */
    scheduleUpdates(scheduleRedrawRoute, scheduleRefreshWaypoints, scheduleRepickWaypoints) {
        this.needDrawRoute || (this.needDrawRoute = scheduleRedrawRoute);
        this.needRefreshWaypoints || (this.needRefreshWaypoints = scheduleRefreshWaypoints);
        this.needRepickWaypoints || (this.needRepickWaypoints = scheduleRepickWaypoints);
    }
    /**
     * Recreates the TOD and BOD leg indexes when any values change.
     */
    onTodBodChanged() {
        const plan = this.props.dataProvider.plan.get();
        if (!plan) {
            this.todWaypoint && this.props.waypointRenderer.deregister(this.todWaypoint, MapWaypointRenderRole.VNav, 'flightplan-layer');
            this.bodWaypoint && this.props.waypointRenderer.deregister(this.bodWaypoint, MapWaypointRenderRole.VNav, 'flightplan-layer');
            this.todWaypoint = undefined;
            this.bodWaypoint = undefined;
            return;
        }
        const vnavPathMode = this.props.dataProvider.vnavPathMode.get();
        const todLegIndex = this.props.dataProvider.vnavTodLegIndex.get();
        const todLegEndDistance = this.props.dataProvider.vnavTodLegDistance.get();
        const bodLegIndex = this.props.dataProvider.vnavBodLegIndex.get();
        let registerNewTodBod = true;
        if (plan.segmentCount < 1 || plan.getSegment(0).segmentType === FlightPlanSegmentType.RandomDirectTo) {
            registerNewTodBod = false;
        }
        if (todLegIndex >= 0) {
            this.todWaypoint && this.props.waypointRenderer.deregister(this.todWaypoint, MapWaypointRenderRole.VNav, 'flightplan-layer');
            if (registerNewTodBod && isFinite(todLegEndDistance.number) && todLegIndex >= 0 && vnavPathMode !== VNavPathMode.PathActive && plan.length > 0) {
                try {
                    const leg = plan.getLeg(todLegIndex);
                    this.todWaypoint = new VNavWaypoint(leg, todLegEndDistance.asUnit(UnitType.METER), 'tod');
                    this.props.waypointRenderer.register(this.todWaypoint, MapWaypointRenderRole.VNav, 'flightplan-layer');
                }
                catch (_a) {
                    console.warn(`Invalid tod leg at: ${todLegIndex}`);
                }
            }
            else if (!isFinite(todLegEndDistance.number)) {
                this.todWaypoint = undefined;
                console.warn(`Invalid TOD leg end distance: ${todLegEndDistance}`);
            }
        }
        if (bodLegIndex >= 0) {
            this.bodWaypoint && this.props.waypointRenderer.deregister(this.bodWaypoint, MapWaypointRenderRole.VNav, 'flightplan-layer');
            if (registerNewTodBod && bodLegIndex >= 0 && plan.length > 0) {
                try {
                    const leg = plan.getLeg(bodLegIndex);
                    this.bodWaypoint = new VNavWaypoint(leg, 0, 'bod');
                    this.props.waypointRenderer.register(this.bodWaypoint, MapWaypointRenderRole.VNav, 'flightplan-layer');
                }
                catch (_b) {
                    console.warn(`Invalid bod leg at: ${bodLegIndex}`);
                }
            }
        }
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("div", { style: 'position: absolute; left: 0; top: 0; width: 100%; height: 100%;' },
            FSComponent.buildComponent(MapCachedCanvasLayer, { ref: this.flightPathLayerRef, model: this.props.model, mapProjection: this.props.mapProjection, useBuffer: true, overdrawFactor: Math.SQRT2 }),
            FSComponent.buildComponent(MapSyncedCanvasLayer, { ref: this.waypointLayerRef, model: this.props.model, mapProjection: this.props.mapProjection })));
    }
}
MapFlightPlanLayer.BASE_ROUTE_STROKE_WIDTH = 2;
MapFlightPlanLayer.BASE_ROUTE_STROKE_COLOR = 'rgba(204, 204, 204, 0.5)';
MapFlightPlanLayer.ROUTE_PRIOR_STROKE_WIDTH = 2;
MapFlightPlanLayer.ROUTE_PRIOR_STROKE_COLOR = '#cccccc';
MapFlightPlanLayer.ROUTE_STROKE_WIDTH = 4;
MapFlightPlanLayer.ROUTE_MISSED_APPROACH_STROKE_WIDTH = 1;
MapFlightPlanLayer.vec2Cache = [new Float64Array(2)];
MapFlightPlanLayer.vec3Cache = [new Float64Array(3)];
MapFlightPlanLayer.geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0)];
MapFlightPlanLayer.geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];
/**
 * An abstract implementation of FlightPlanLegWaypointsRecord.
 */
class AbstractFlightPlanLegWaypointsRecord {
    /**
     * Constructor.
     * @param leg The flight plan leg associated with this record.
     * @param waypointRenderer The renderer used to render this record's waypoints.
     * @param facLoader The facility loader used by this waypoint.
     */
    constructor(leg, waypointRenderer, facLoader) {
        this.leg = leg;
        this.waypointRenderer = waypointRenderer;
        this.facLoader = facLoader;
        this.uid = `flightplan-layer-wptrecord-${AbstractFlightPlanLegWaypointsRecord.uidSource++}`;
        this.isActive = false;
    }
    /**
     * Registers a waypoint with this record's waypoint renderer.
     * @param waypoint A waypoint.
     * @param role The role(s) under which the waypoint should be registered.
     */
    registerWaypoint(waypoint, role) {
        this.waypointRenderer.register(waypoint, role, this.uid);
    }
    /**
     * Removes a registration for a waypoint from this record's waypoint renderer.
     * @param waypoint A waypoint.
     * @param role The role(s) from which the waypoint should be deregistered.
     */
    deregisterWaypoint(waypoint, role) {
        this.waypointRenderer.deregister(waypoint, role, this.uid);
    }
}
AbstractFlightPlanLegWaypointsRecord.uidSource = 0;
/**
 * A record with a single waypoint based on its flight plan leg's fixIcao property.
 */
class FixIcaoWaypointsRecord extends AbstractFlightPlanLegWaypointsRecord {
    /**
     * Constructor.
     * @param leg The flight plan leg associated with this record.
     * @param waypointRenderer The renderer used to render this record's waypoints.
     * @param facLoader The facility loader used by this waypoint.
     * @param facWaypointCache The facility waypoint cache used by this record.
     */
    constructor(leg, waypointRenderer, facLoader, facWaypointCache) {
        super(leg, waypointRenderer, facLoader);
        this.facWaypointCache = facWaypointCache;
        this._waypoint = null;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /**
     * This record's waypoint.
     */
    get waypoint() {
        return this._waypoint;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    async refresh(isActive) {
        const icao = this.leg.leg.fixIcao;
        if (!this._waypoint && icao !== '' && icao !== ICAO.emptyIcao) {
            this._waypoint = await this.getFacilityWaypoint(icao);
            if (this._waypoint) {
                this.registerWaypoint(this._waypoint, MapWaypointRenderRole.FlightPlanInactive);
                if (this.isActive) {
                    this.registerWaypoint(this._waypoint, MapWaypointRenderRole.FlightPlanActive);
                }
            }
        }
        if (isActive !== this.isActive) {
            if (this._waypoint) {
                isActive
                    ? this.registerWaypoint(this._waypoint, MapWaypointRenderRole.FlightPlanActive)
                    : this.deregisterWaypoint(this._waypoint, MapWaypointRenderRole.FlightPlanActive);
            }
            this.isActive = isActive;
        }
    }
    /**
     * Gets a facility waypoint from an ICAO string.
     * @param icao A facility ICAO string.
     * @returns a facility waypoint, or null if one could not be created.
     */
    async getFacilityWaypoint(icao) {
        try {
            const facility = await this.facLoader.getFacility(ICAO.getFacilityType(icao), icao);
            return this.facWaypointCache.get(facility);
        }
        catch (e) {
            // noop
        }
        return null;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    destroy() {
        if (!this._waypoint) {
            return;
        }
        this.deregisterWaypoint(this._waypoint, MapWaypointRenderRole.FlightPlanInactive);
        this.isActive && this.deregisterWaypoint(this._waypoint, MapWaypointRenderRole.FlightPlanActive);
    }
}
/**
 * A record with a single flight path waypoint representing its flight plan leg's terminator fix.
 */
class FlightPathTerminatorWaypointsRecord extends AbstractFlightPlanLegWaypointsRecord {
    constructor() {
        super(...arguments);
        this._waypoint = null;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /**
     * This record's flight path waypoint.
     */
    get waypoint() {
        return this._waypoint;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    async refresh(isActive) {
        var _a, _b;
        const lastVector = (_a = this.leg.calculated) === null || _a === void 0 ? void 0 : _a.flightPath[this.leg.calculated.flightPath.length - 1];
        if (lastVector) {
            if (!this._waypoint || !this._waypoint.location.equals(lastVector.endLat, lastVector.endLon)) {
                this.cleanUpWaypoint();
                this._waypoint = new FlightPathWaypoint(lastVector.endLat, lastVector.endLon, (_b = this.leg.name) !== null && _b !== void 0 ? _b : '');
                this.registerWaypoint(this._waypoint, MapWaypointRenderRole.FlightPlanInactive);
                if (this.isActive) {
                    this.registerWaypoint(this._waypoint, MapWaypointRenderRole.FlightPlanActive);
                }
            }
        }
        else {
            this.cleanUpWaypoint();
        }
        if (isActive !== this.isActive) {
            if (this._waypoint) {
                isActive
                    ? this.registerWaypoint(this._waypoint, MapWaypointRenderRole.FlightPlanActive)
                    : this.deregisterWaypoint(this._waypoint, MapWaypointRenderRole.FlightPlanActive);
            }
            this.isActive = isActive;
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    destroy() {
        this.cleanUpWaypoint();
    }
    /**
     * Deregisters this record's waypoint, if it exists, from the waypoint renderer.
     */
    cleanUpWaypoint() {
        if (!this._waypoint) {
            return;
        }
        this.deregisterWaypoint(this._waypoint, MapWaypointRenderRole.FlightPlanInactive);
        this.isActive && this.deregisterWaypoint(this._waypoint, MapWaypointRenderRole.FlightPlanActive);
    }
}
/**
 * A record for procedure turn (PI) legs. Maintains two waypoints, both located at the PI leg's origin fix. The first
 * waypoint is a standard FacilityWaypoint which is never rendered in an active flight plan waypoint role. The second
 * is a ProcedureTurnWaypoint with an ident string equal to the PI leg's given name and which can be rendered in an
 * active flight plan waypoint role.
 */
class ProcedureTurnLegWaypointsRecord extends AbstractFlightPlanLegWaypointsRecord {
    /**
     * Constructor.
     * @param leg The flight plan leg associated with this record.
     * @param waypointRenderer The renderer used to render this record's waypoints.
     * @param facLoader The facility loader used by this waypoint.
     * @param facWaypointCache The facility waypoint cache used by this record.
     */
    constructor(leg, waypointRenderer, facLoader, facWaypointCache) {
        super(leg, waypointRenderer, facLoader);
        this.ptWaypoint = null;
        this.fixIcaoRecord = new FixIcaoWaypointsRecord(leg, waypointRenderer, facLoader, facWaypointCache);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    async refresh(isActive) {
        var _a;
        await this.fixIcaoRecord.refresh(false);
        if (!this.ptWaypoint && this.fixIcaoRecord.waypoint) {
            this.ptWaypoint = new ProcedureTurnLegWaypoint(this.fixIcaoRecord.waypoint.location.lat, this.fixIcaoRecord.waypoint.location.lon, (_a = this.leg.name) !== null && _a !== void 0 ? _a : '');
            this.registerWaypoint(this.ptWaypoint, MapWaypointRenderRole.FlightPlanInactive);
            if (this.isActive) {
                this.deregisterWaypoint(this.ptWaypoint, MapWaypointRenderRole.FlightPlanActive);
            }
        }
        if (isActive !== this.isActive) {
            if (this.ptWaypoint) {
                isActive
                    ? this.registerWaypoint(this.ptWaypoint, MapWaypointRenderRole.FlightPlanActive)
                    : this.deregisterWaypoint(this.ptWaypoint, MapWaypointRenderRole.FlightPlanActive);
            }
            this.isActive = isActive;
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    destroy() {
        this.fixIcaoRecord.destroy();
        if (!this.ptWaypoint) {
            return;
        }
        this.deregisterWaypoint(this.ptWaypoint, MapWaypointRenderRole.FlightPlanInactive);
        this.isActive && this.deregisterWaypoint(this.ptWaypoint, MapWaypointRenderRole.FlightPlanActive);
    }
}
/**
 * A waypoint marking a procedure turn leg.
 */
class ProcedureTurnLegWaypoint extends CustomWaypoint {
    /**
     * Constructor.
     * @param lat The latitude of this waypoint.
     * @param lon The longitude of this waypoint.
     * @param ident The ident string of this waypoint.
     */
    constructor(lat, lon, ident) {
        super(lat, lon, `${ProcedureTurnLegWaypoint.UID_PREFIX}_${ident}`);
        this.ident = ident;
    }
}
ProcedureTurnLegWaypoint.UID_PREFIX = 'PI';
/**
 * A waypoint icon factory.
 */
class WaypointIconFactory {
    /**
     * Constructor.
     * @param styles Icon styling options used by this factory.
     */
    constructor(styles) {
        this.styles = styles;
        this.cache = new Map();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    getIcon(waypoint) {
        let existing = this.cache.get(waypoint.uid);
        if (!existing) {
            existing = this.createIcon(waypoint);
            this.cache.set(waypoint.uid, existing);
        }
        return existing;
    }
    /**
     * Creates a new icon for a waypoint.
     * @param waypoint The waypoint for which to create an icon.
     * @returns a waypoint icon.
     */
    createIcon(waypoint) {
        if (waypoint instanceof AirportWaypoint) {
            return new MapAirportIcon(waypoint, this.styles.airportIconPriority[waypoint.size], this.styles.airportIconSize[waypoint.size], this.styles.airportIconSize[waypoint.size]);
        }
        else if (waypoint instanceof FacilityWaypoint) {
            switch (ICAO.getFacilityType(waypoint.facility.icao)) {
                case FacilityType.VOR:
                    return new MapVorIcon(waypoint, this.styles.vorIconPriority, this.styles.vorIconSize, this.styles.vorIconSize);
                case FacilityType.NDB:
                    return new MapNdbIcon(waypoint, this.styles.ndbIconPriority, this.styles.ndbIconSize, this.styles.ndbIconSize);
                case FacilityType.Intersection:
                    return new MapIntersectionIcon(waypoint, this.styles.intIconPriority, this.styles.intIconSize, this.styles.intIconSize);
                case FacilityType.USR:
                    return new MapUserWaypointIcon(waypoint, this.styles.userIconPriority, this.styles.userIconSize, this.styles.userIconSize);
                case FacilityType.RWY:
                    return new MapRunwayWaypointIcon(waypoint, this.styles.rwyIconPriority, this.styles.rwyIconSize, this.styles.rwyIconSize);
                case FacilityType.VIS:
                    return new MapFlightPathWaypointIcon(waypoint, this.styles.fpIconPriority, this.styles.fpIconSize, this.styles.fpIconSize);
            }
        }
        else if (waypoint instanceof FlightPathWaypoint) {
            return new MapFlightPathWaypointIcon(waypoint, this.styles.fpIconPriority, this.styles.fpIconSize, this.styles.fpIconSize);
        }
        return new MapBlankWaypointIcon(waypoint, 0);
    }
}
/**
 * A waypoint label factory.
 */
class WaypointLabelFactory {
    /**
     * Constructor.
     * @param styles Icon styling options used by this factory.
     */
    constructor(styles) {
        this.styles = styles;
        this.cache = new Map();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    getLabel(waypoint) {
        let existing = this.cache.get(waypoint.uid);
        if (!existing) {
            existing = this.createLabel(waypoint);
            this.cache.set(waypoint.uid, existing);
        }
        return existing;
    }
    /**
     * Creates a new icon for a waypoint.
     * @param waypoint The waypoint for which to create an icon.
     * @returns a waypoint icon.
     */
    createLabel(waypoint) {
        let text = '';
        let priority = 0;
        let options;
        if (waypoint instanceof FacilityWaypoint) {
            text = ICAO.getIdent(waypoint.facility.icao);
            switch (ICAO.getFacilityType(waypoint.facility.icao)) {
                case FacilityType.Airport:
                    priority = this.styles.airportLabelPriority[waypoint.size];
                    options = this.styles.airportLabelOptions[waypoint.size];
                    break;
                case FacilityType.VOR:
                    priority = this.styles.vorLabelPriority;
                    options = this.styles.vorLabelOptions;
                    break;
                case FacilityType.NDB:
                    priority = this.styles.ndbLabelPriority;
                    options = this.styles.ndbLabelOptions;
                    break;
                case FacilityType.Intersection:
                    priority = this.styles.intLabelPriority;
                    options = this.styles.intLabelOptions;
                    break;
                case FacilityType.USR:
                    priority = this.styles.userLabelPriority;
                    options = this.styles.userLabelOptions;
                    break;
                case FacilityType.RWY:
                    priority = this.styles.rwyLabelPriority;
                    options = this.styles.rwyLabelOptions;
                    break;
                case FacilityType.VIS:
                    priority = this.styles.intLabelPriority;
                    options = this.styles.intLabelOptions;
                    break;
            }
        }
        else if (waypoint instanceof FlightPathWaypoint || waypoint instanceof ProcedureTurnLegWaypoint) {
            text = waypoint.ident;
            priority = this.styles.fpLabelPriority;
            options = this.styles.fpLabelOptions;
        }
        return new MapCullableLocationTextLabel(text, priority, waypoint.location, true, options);
    }
}
/**
 * A waypoint icon factory for VNAV waypoints.
 */
class VNavWaypointIconFactory {
    // eslint-disable-next-line jsdoc/require-jsdoc
    getIcon(waypoint) {
        return new MapVNavWaypointIcon(waypoint, 4, 32, 32);
    }
}
/**
 * A waypoint label factory for VNAV waypoints.
 */
class VNavWaypointLabelFactory {
    // eslint-disable-next-line jsdoc/require-jsdoc
    getLabel(waypoint) {
        return new MapCullableLocationTextLabel(waypoint.uid === 'vnav-tod' ? 'TOD' : 'BOD', 1, waypoint.location, true, { anchor: new Float64Array([-0.2, -0.2]), fontSize: 16 });
    }
}
