import { BitFlags, FSComponent, GeoPoint, UnitType, Vec2Math } from 'msfssdk';
import { MapLayer, MapProjectionChangeType, MapSyncedCanvasLayer } from 'msfssdk/components/map';
import { TCASAlertLevel, TCASOperatingMode } from 'msfssdk/traffic';
import { MapTrafficAlertLevelMode, MapTrafficMotionVectorMode } from '../Modules/MapTrafficModule';
import { MapTrafficIntruderOffScaleIndicatorMode } from '../Indicators/MapTrafficOffScaleIndicator';
/**
 * A map layer which displays traffic intruders.
 */
export class MapTrafficIntruderLayer extends MapLayer {
    constructor() {
        super(...arguments);
        this.iconLayerRef = FSComponent.createRef();
        this.trafficModule = this.props.model.getModule('traffic');
        this.intruderViews = {
            [TCASAlertLevel.None]: new Map(),
            [TCASAlertLevel.ProximityAdvisory]: new Map(),
            [TCASAlertLevel.TrafficAdvisory]: new Map(),
            [TCASAlertLevel.ResolutionAdvisory]: new Map()
        };
        this.isInit = false;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onVisibilityChanged(isVisible) {
        var _a;
        if (!isVisible) {
            (_a = this.props.offScaleIndicatorMode) === null || _a === void 0 ? void 0 : _a.set(MapTrafficIntruderOffScaleIndicatorMode.Off);
            if (this.isInit) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.iconLayerRef.instance.display.clear();
            }
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAttached() {
        this.iconLayerRef.instance.onAttached();
        this.trafficModule.operatingMode.sub(this.updateVisibility.bind(this));
        this.trafficModule.show.sub(this.updateVisibility.bind(this), true);
        this.initCanvasStyles();
        this.initIntruders();
        this.initTCASHandlers();
        this.isInit = true;
    }
    /**
     * Initializes canvas styles.
     */
    initCanvasStyles() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const iconContext = this.iconLayerRef.instance.display.context;
        iconContext.textAlign = 'center';
        iconContext.font = `${this.props.fontSize}px Roboto-Bold`;
    }
    /**
     * Initializes all currently existing TCAS intruders.
     */
    initIntruders() {
        const intruders = this.trafficModule.tcas.getIntruders();
        const len = intruders.length;
        for (let i = 0; i < len; i++) {
            this.onIntruderAdded(intruders[i]);
        }
    }
    /**
     * Initializes handlers to respond to TCAS events.
     */
    initTCASHandlers() {
        const tcasSub = this.props.bus.getSubscriber();
        tcasSub.on('tcas_intruder_added').handle(this.onIntruderAdded.bind(this));
        tcasSub.on('tcas_intruder_removed').handle(this.onIntruderRemoved.bind(this));
        tcasSub.on('tcas_intruder_alert_changed').handle(this.onIntruderAlertLevelChanged.bind(this));
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onMapProjectionChanged(mapProjection, changeFlags) {
        this.iconLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
        if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize)) {
            this.initCanvasStyles();
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc, @typescript-eslint/no-unused-vars
    onUpdated(time, elapsed) {
        if (!this.isVisible()) {
            return;
        }
        this.redrawIntruders();
    }
    /**
     * Redraws all tracked intruders.
     */
    redrawIntruders() {
        const showLabel = this.trafficModule.showIntruderLabel.get();
        const offScaleRange = this.props.useOuterRangeMaxScale ?
            this.props.model.getModule('range').nominalRanges.get()[this.trafficModule.outerRangeIndex.get()]
            : undefined;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const iconDisplay = this.iconLayerRef.instance.display;
        iconDisplay.clear();
        let offScaleRACount = 0;
        let offScaleTACount = 0;
        this.intruderViews[TCASAlertLevel.None].forEach(view => {
            view.draw(this.props.mapProjection, iconDisplay.context, showLabel, offScaleRange);
        });
        this.intruderViews[TCASAlertLevel.ProximityAdvisory].forEach(view => {
            view.draw(this.props.mapProjection, iconDisplay.context, showLabel, offScaleRange);
        });
        this.intruderViews[TCASAlertLevel.TrafficAdvisory].forEach(view => {
            view.draw(this.props.mapProjection, iconDisplay.context, showLabel, offScaleRange);
            if (view.isOffScale) {
                offScaleTACount++;
            }
        });
        this.intruderViews[TCASAlertLevel.ResolutionAdvisory].forEach(view => {
            view.draw(this.props.mapProjection, iconDisplay.context, showLabel, offScaleRange);
            if (view.isOffScale) {
                offScaleRACount++;
            }
        });
        if (this.props.offScaleIndicatorMode) {
            if (offScaleRACount > 0) {
                this.props.offScaleIndicatorMode.set(MapTrafficIntruderOffScaleIndicatorMode.RA);
            }
            else if (offScaleTACount > 0) {
                this.props.offScaleIndicatorMode.set(MapTrafficIntruderOffScaleIndicatorMode.TA);
            }
            else {
                this.props.offScaleIndicatorMode.set(MapTrafficIntruderOffScaleIndicatorMode.Off);
            }
        }
    }
    /**
     * Updates this layer's visibility.
     */
    updateVisibility() {
        this.setVisible(this.trafficModule.tcas.getOperatingMode() !== TCASOperatingMode.Standby && this.trafficModule.show.get());
    }
    /**
     * A callback which is called when a TCAS intruder is added.
     * @param intruder The new intruder.
     */
    onIntruderAdded(intruder) {
        const view = new MapTrafficIntruderView(intruder, this.props.model.getModule('ownAirplaneProps'), this.trafficModule, this.props.fontSize, this.props.iconSize);
        this.intruderViews[intruder.alertLevel.get()].set(intruder, view);
    }
    /**
     * A callback which is called when a TCAS intruder is removed.
     * @param intruder The removed intruder.
     */
    onIntruderRemoved(intruder) {
        this.intruderViews[intruder.alertLevel.get()].delete(intruder);
    }
    /**
     * A callback which is called when the alert level of a TCAS intruder is changed.
     * @param intruder The intruder.
     */
    onIntruderAlertLevelChanged(intruder) {
        let oldAlertLevel;
        let view = this.intruderViews[oldAlertLevel = TCASAlertLevel.None].get(intruder);
        view !== null && view !== void 0 ? view : (view = this.intruderViews[oldAlertLevel = TCASAlertLevel.ProximityAdvisory].get(intruder));
        view !== null && view !== void 0 ? view : (view = this.intruderViews[oldAlertLevel = TCASAlertLevel.TrafficAdvisory].get(intruder));
        view !== null && view !== void 0 ? view : (view = this.intruderViews[oldAlertLevel = TCASAlertLevel.ResolutionAdvisory].get(intruder));
        if (view) {
            this.intruderViews[oldAlertLevel].delete(intruder);
            this.intruderViews[intruder.alertLevel.get()].set(intruder, view);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent(MapSyncedCanvasLayer, { ref: this.iconLayerRef, model: this.props.model, mapProjection: this.props.mapProjection }));
    }
}
/**
 * A view representation of a TCAS intruder for MapTrafficIntruderLayer.
 */
class MapTrafficIntruderView {
    /**
     * Constructor.
     * @param intruder This view's associated intruder.
     * @param ownAirplaneProps The own airplane properties module for this view's parent map.
     * @param trafficModule The traffic module for this view's parent map.
     * @param fontSize This view's font size, in pixels.
     * @param iconSize This view's icon size, in pixels.
     */
    constructor(intruder, ownAirplaneProps, trafficModule, fontSize, iconSize) {
        this.intruder = intruder;
        this.ownAirplaneProps = ownAirplaneProps;
        this.trafficModule = trafficModule;
        this.fontSize = fontSize;
        this.iconSize = iconSize;
        this.projectedPos = new Float64Array(2);
        this._isOffScale = false;
        this.isVisible = false;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** Whether this view is off-scale. */
    get isOffScale() {
        return this._isOffScale;
    }
    /**
     * Draws this view.
     * @param projection The map projection.
     * @param context The canvas rendering context to which to draw this view.
     * @param showLabel Whether to show this view's label.
     * @param offScaleRange The maximum distance from the own airplane this view's intruder can be before it is
     * considered off-scale. If not defined, the map projection boundaries will be used to determine whether this view's
     * intruder is off-scale.
     */
    draw(projection, context, showLabel, offScaleRange) {
        this.updatePosition(projection, offScaleRange);
        this.updateVisibility(!!offScaleRange);
        if (this.isVisible) {
            this.drawIcon(context, projection, showLabel);
        }
    }
    /**
     * Updates this view's intruder's projected position and off-scale status.
     * @param projection The map projection.
     * @param offScaleRange The maximum distance from the own airplane this view's intruder can be before it is
     * considered off-scale. If not defined, the map projection boundaries will be used to determine whether this view's
     * intruder is off-scale.
     */
    updatePosition(projection, offScaleRange) {
        const ownAirplanePos = this.ownAirplaneProps.position.get();
        if (offScaleRange) {
            this.handleOffScaleRange(projection, ownAirplanePos, offScaleRange);
        }
        else {
            this.handleOffScaleMapProjection(projection);
        }
    }
    /**
     * Updates this view's intruder's projected position and off-scale status using the map projection boundaries to
     * define off-scale.
     * @param projection The map projection.
     */
    handleOffScaleMapProjection(projection) {
        projection.project(this.intruder.position, this.projectedPos);
        this._isOffScale = !projection.isInProjectedBounds(this.projectedPos);
    }
    /**
     * Updates this view's intruder's projected position and off-scale status using a specific range from the own
     * airplane to define off-scale.
     * @param projection The map projection.
     * @param ownAirplanePos The position of the own airplane.
     * @param offScaleRange The maximum distance from the own airplane this intruder can be before it is considered
     * off-scale.
     */
    handleOffScaleRange(projection, ownAirplanePos, offScaleRange) {
        const intruderPos = this.intruder.position;
        const horizontalSeparation = intruderPos.distance(ownAirplanePos);
        const offscaleRangeRad = offScaleRange.asUnit(UnitType.GA_RADIAN);
        if (horizontalSeparation > offscaleRangeRad) {
            this._isOffScale = true;
            projection.project(ownAirplanePos.offset(ownAirplanePos.bearingTo(intruderPos), offscaleRangeRad, MapTrafficIntruderView.geoPointCache[0]), this.projectedPos);
        }
        else {
            this._isOffScale = false;
            projection.project(intruderPos, this.projectedPos);
        }
    }
    /**
     * Updates the visibility of this view.
     * @param useOffScaleRange Whether off-scale is defined by distance from the own airplane.
     */
    updateVisibility(useOffScaleRange) {
        let isVisible = false;
        const alertLevel = this.intruder.alertLevel.get();
        const alertLevelMode = this.trafficModule.alertLevelMode.get();
        switch (alertLevel) {
            case TCASAlertLevel.ResolutionAdvisory:
                isVisible = true;
                break;
            case TCASAlertLevel.TrafficAdvisory:
                if (alertLevelMode === MapTrafficAlertLevelMode.TA_RA) {
                    isVisible = true;
                    break;
                }
            // eslint-disable-next-line no-fallthrough
            case TCASAlertLevel.ProximityAdvisory:
                if (alertLevelMode === MapTrafficAlertLevelMode.Advisories) {
                    isVisible = true;
                    break;
                }
            // eslint-disable-next-line no-fallthrough
            case TCASAlertLevel.None:
                if (alertLevelMode === MapTrafficAlertLevelMode.All) {
                    isVisible = true;
                }
        }
        if (alertLevel === TCASAlertLevel.ResolutionAdvisory || alertLevel === TCASAlertLevel.TrafficAdvisory) {
            isVisible && (isVisible = useOffScaleRange || !this._isOffScale);
        }
        else {
            const altitudeMeters = this.intruder.relativePositionVec[2];
            const isWithinAltitude = altitudeMeters <= this.trafficModule.altitudeRestrictionAbove.get().asUnit(UnitType.METER)
                && altitudeMeters >= -this.trafficModule.altitudeRestrictionBelow.get().asUnit(UnitType.METER);
            isVisible && (isVisible = !this._isOffScale && isWithinAltitude);
        }
        this.isVisible = isVisible;
    }
    /**
     * Draws this view's icon.
     * @param context The canvas rendering context to which to draw the icon.
     * @param projection The map projection.
     * @param showLabel Whether to show the icon label.
     */
    drawIcon(context, projection, showLabel) {
        const alertLevel = this.intruder.alertLevel.get();
        context.translate(this.projectedPos[0], this.projectedPos[1]);
        if (showLabel) {
            this.drawIconVSArrow(context, alertLevel);
            this.drawIconAltitudeLabel(context, alertLevel);
        }
        this.drawMotionVector(context, projection);
        this.drawIconBackground(context, projection, alertLevel);
        this.drawIconArrow(context, projection, alertLevel);
        context.resetTransform();
    }
    /**
     * Draws the icon's background.
     * @param context The canvas rendering context to which to draw the icon.
     * @param projection The map projection.
     * @param alertLevel The alert level assigned to this view's intruder.
     */
    drawIconBackground(context, projection, alertLevel) {
        if (alertLevel === TCASAlertLevel.None || alertLevel === TCASAlertLevel.ProximityAdvisory) {
            return;
        }
        context.strokeStyle = '#1a1d21';
        context.fillStyle = alertLevel === TCASAlertLevel.ResolutionAdvisory ? MapTrafficIntruderView.RA_COLOR : MapTrafficIntruderView.TA_COLOR;
        context.beginPath();
        context.arc(0, 0, 0.45 * this.iconSize, 0, 2 * Math.PI);
        context.fill();
        context.stroke();
        if (this._isOffScale) {
            const projectedAngle = Vec2Math.theta(Vec2Math.sub(this.projectedPos, projection.getTargetProjected(), MapTrafficIntruderView.vec2Cache[0]));
            context.beginPath();
            context.arc(0, 0, 0.45 * this.iconSize, projectedAngle - Math.PI / 2, projectedAngle + Math.PI / 2);
            context.fillStyle = 'black';
            context.fill();
        }
    }
    /**
     * Draws the icon's directional arrow.
     * @param context The canvas rendering context to which to draw the icon.
     * @param projection The map projection.
     * @param alertLevel The alert level assigned to this view's intruder.
     */
    drawIconArrow(context, projection, alertLevel) {
        context.save();
        context.rotate(this.intruder.groundTrack * Avionics.Utils.DEG2RAD + projection.getRotation());
        this.drawIconArrowBackground(context, alertLevel);
        this.drawIconArrowOutline(context, alertLevel);
        context.restore();
    }
    /**
     * Draws the icon's directional arrow background.
     * @param context The canvas rendering context to which to draw the icon.
     * @param alertLevel The alert level assigned to this view's intruder.
     */
    drawIconArrowBackground(context, alertLevel) {
        switch (alertLevel) {
            case TCASAlertLevel.None:
            case TCASAlertLevel.ProximityAdvisory:
                context.fillStyle = 'black';
                break;
            case TCASAlertLevel.TrafficAdvisory:
                context.fillStyle = MapTrafficIntruderView.TA_COLOR;
                break;
            case TCASAlertLevel.ResolutionAdvisory:
                context.fillStyle = MapTrafficIntruderView.RA_COLOR;
                break;
        }
        context.beginPath();
        context.moveTo(0, -0.3 * this.iconSize * 1.4);
        context.lineTo(0.212 * this.iconSize * 1.4, 0.212 * this.iconSize * 1.4);
        context.lineTo(0, 0.1 * this.iconSize * 1.4);
        context.lineTo(-0.212 * this.iconSize * 1.4, 0.212 * this.iconSize * 1.4);
        context.closePath();
        context.fill();
    }
    /**
     * Draws the icon's directional arrow outline.
     * @param context The canvas rendering context to which to draw the icon.
     * @param alertLevel The alert level assigned to this view's intruder.
     */
    drawIconArrowOutline(context, alertLevel) {
        context.lineWidth = Math.max(1, this.iconSize * 0.05);
        switch (alertLevel) {
            case TCASAlertLevel.None:
                context.strokeStyle = 'white';
                context.fillStyle = 'black';
                break;
            case TCASAlertLevel.ProximityAdvisory:
                context.strokeStyle = 'transparent';
                context.fillStyle = 'white';
                break;
            case TCASAlertLevel.TrafficAdvisory:
                context.strokeStyle = 'black';
                context.fillStyle = MapTrafficIntruderView.TA_COLOR;
                break;
            case TCASAlertLevel.ResolutionAdvisory:
                context.strokeStyle = 'black';
                context.fillStyle = MapTrafficIntruderView.RA_COLOR;
                break;
        }
        context.beginPath();
        context.moveTo(0, -0.3 * this.iconSize);
        context.lineTo(0.212 * this.iconSize, 0.212 * this.iconSize);
        context.lineTo(0, 0.1 * this.iconSize);
        context.lineTo(-0.212 * this.iconSize, 0.212 * this.iconSize);
        context.closePath();
        context.fill();
        context.stroke();
    }
    /**
     * Draws the icon's vertical speed indicator arrow.
     * @param context The canvas rendering context to which to draw the icon.
     * @param alertLevel The alert level assigned to this view's intruder.
     */
    drawIconVSArrow(context, alertLevel) {
        const showArrow = MapTrafficIntruderView.VERTICAL_SPEED_THRESHOLD.compare(Math.abs(this.intruder.velocityVec[2]), UnitType.MPS) <= 0;
        if (!showArrow) {
            return;
        }
        const vsSign = Math.sign(this.intruder.velocityVec[2]);
        context.beginPath();
        context.moveTo(0.67 * this.iconSize, -0.16 * this.iconSize * vsSign);
        context.lineTo(0.67 * this.iconSize, 0.16 * this.iconSize * vsSign);
        context.moveTo(0.55 * this.iconSize, -0.04 * this.iconSize * vsSign);
        context.lineTo(0.67 * this.iconSize, -0.18 * this.iconSize * vsSign);
        context.lineTo(0.79 * this.iconSize, -0.04 * this.iconSize * vsSign);
        context.lineWidth = Math.max(1, this.iconSize * 0.125);
        context.strokeStyle = 'black';
        context.stroke();
        context.lineWidth = Math.max(1, this.iconSize * 0.075);
        switch (alertLevel) {
            case TCASAlertLevel.None:
            case TCASAlertLevel.ProximityAdvisory:
                context.strokeStyle = 'white';
                break;
            case TCASAlertLevel.TrafficAdvisory:
                context.strokeStyle = MapTrafficIntruderView.TA_COLOR;
                break;
            case TCASAlertLevel.ResolutionAdvisory:
                context.strokeStyle = MapTrafficIntruderView.RA_COLOR;
                break;
        }
        context.stroke();
    }
    /**
     * Draws the icon's altitude label.
     * @param context The canvas rendering context to which to draw the icon.
     * @param alertLevel The alert level assigned to this view's intruder.
     */
    drawIconAltitudeLabel(context, alertLevel) {
        const isRelative = this.trafficModule.isAltitudeRelative.get();
        const isAltitudeAbove = this.intruder.relativePositionVec[2] >= 0;
        const altitudeFeet = this.trafficModule.isAltitudeRelative.get()
            ? UnitType.METER.convertTo(this.intruder.relativePositionVec[2], UnitType.FOOT)
            : this.intruder.altitude.asUnit(UnitType.FOOT);
        const altitudeRounded = Math.round(altitudeFeet / 100);
        const altitudeAbs = Math.abs(altitudeRounded);
        const prefix = altitudeRounded < 0 ? '−'
            : isRelative ? '+' : '';
        const altitudeText = `${prefix}${altitudeAbs}`;
        const textWidth = context.measureText(altitudeText).width;
        const textHeight = this.fontSize;
        // draw background
        context.fillStyle = 'black';
        if (isAltitudeAbove) {
            context.fillRect(-textWidth / 2 - 2, -0.5 * this.iconSize - textHeight - 2, textWidth + 4, textHeight + 2);
        }
        else {
            context.fillRect(-textWidth / 2 - 2, 0.5 * this.iconSize, textWidth + 4, textHeight + 2);
        }
        // draw text
        switch (alertLevel) {
            case TCASAlertLevel.None:
            case TCASAlertLevel.ProximityAdvisory:
                context.fillStyle = 'white';
                break;
            case TCASAlertLevel.TrafficAdvisory:
                context.fillStyle = MapTrafficIntruderView.TA_COLOR;
                break;
            case TCASAlertLevel.ResolutionAdvisory:
                context.fillStyle = MapTrafficIntruderView.RA_COLOR;
                break;
        }
        if (isAltitudeAbove) {
            context.textBaseline = 'bottom';
            context.fillText(altitudeText, 0, -0.5 * this.iconSize);
        }
        else {
            context.textBaseline = 'top';
            context.fillText(altitudeText, 0, 0.5 * this.iconSize);
        }
    }
    /**
     * Draws this view's motion vector.
     * @param context The canvas rendering context to which to draw the vector.
     * @param projection The map projection.
     */
    drawMotionVector(context, projection) {
        const vectorMode = this.trafficModule.motionVectorMode.get();
        if (vectorMode === MapTrafficMotionVectorMode.Off) {
            return;
        }
        const vector = vectorMode === MapTrafficMotionVectorMode.Absolute
            ? this.intruder.velocityVec
            : this.intruder.relativeVelocityVec;
        const alertLevel = this.intruder.alertLevel.get();
        if (alertLevel === TCASAlertLevel.None || alertLevel === TCASAlertLevel.ProximityAdvisory) {
            const color = vectorMode === MapTrafficMotionVectorMode.Absolute
                ? MapTrafficIntruderView.VECTOR_ABS_COLOR
                : MapTrafficIntruderView.VECTOR_REL_COLOR;
            this.drawNormalVector(projection, context, color, vector);
        }
        else {
            const color = alertLevel === TCASAlertLevel.ResolutionAdvisory ? MapTrafficIntruderView.RA_COLOR : MapTrafficIntruderView.TA_COLOR;
            this.drawTCAVector(projection, context, color, vector);
        }
    }
    /**
     * Draws a normal motion vector.
     * @param projection The map projection.
     * @param context The canvas rendering context to which to draw the vector.
     * @param color The color of the vector.
     * @param vector The vector to draw.
     */
    drawNormalVector(projection, context, color, vector) {
        context.lineWidth = MapTrafficIntruderView.VECTOR_STROKE_WIDTH;
        context.strokeStyle = color;
        context.setLineDash(MapTrafficIntruderView.VECTOR_EMPTY_LINE_DASH);
        context.beginPath();
        const distance = Vec2Math.abs(vector) * this.trafficModule.motionVectorLookahead.get().asUnit(UnitType.SECOND);
        const distanceView = distance / UnitType.GA_RADIAN.convertTo(projection.getProjectedResolution(), UnitType.METER);
        const track = -Vec2Math.theta(vector);
        const angle = track + projection.getRotation();
        const end = Vec2Math.setFromPolar(distanceView, angle, MapTrafficIntruderView.vec2Cache[0]);
        context.moveTo(0, 0);
        context.lineTo(end[0], end[1]);
        context.stroke();
    }
    /**
     * Draws a motion vector projected to TCA.
     * @param projection The map projection.
     * @param context The canvas rendering context to which to draw the vector.
     * @param color The color of the vector.
     * @param vector The vector to draw.
     */
    drawTCAVector(projection, context, color, vector) {
        const distanceToEnd = Vec2Math.abs(projection.getProjectedSize());
        if (distanceToEnd > 0) {
            context.lineWidth = MapTrafficIntruderView.VECTOR_STROKE_WIDTH;
            context.strokeStyle = color;
            context.setLineDash(MapTrafficIntruderView.VECTOR_LINE_DASH);
            context.beginPath();
            const track = -Vec2Math.theta(vector);
            const angle = track + projection.getRotation();
            const end = Vec2Math.setFromPolar(distanceToEnd, angle, MapTrafficIntruderView.vec2Cache[0]);
            context.moveTo(0, 0);
            context.lineTo(end[0], end[1]);
            context.stroke();
            context.setLineDash(MapTrafficIntruderView.VECTOR_EMPTY_LINE_DASH);
            const distanceToTCA = Vec2Math.abs(vector) * this.intruder.tca.asUnit(UnitType.SECOND);
            const distanceToTCAProjected = distanceToTCA / UnitType.GA_RADIAN.convertTo(projection.getProjectedResolution(), UnitType.METER);
            if (distanceToTCAProjected > 0) {
                context.beginPath();
                const tca = Vec2Math.setFromPolar(distanceToTCAProjected, angle, MapTrafficIntruderView.vec2Cache[0]);
                context.moveTo(0, 0);
                context.lineTo(tca[0], tca[1]);
                context.stroke();
            }
        }
    }
}
MapTrafficIntruderView.VERTICAL_SPEED_THRESHOLD = UnitType.FPM.createNumber(500);
MapTrafficIntruderView.TA_COLOR = '#ffdc24';
MapTrafficIntruderView.RA_COLOR = 'red';
MapTrafficIntruderView.VECTOR_STROKE_WIDTH = 2;
MapTrafficIntruderView.VECTOR_ABS_COLOR = 'white';
MapTrafficIntruderView.VECTOR_REL_COLOR = '#4ecc3d';
MapTrafficIntruderView.VECTOR_LINE_DASH = [5, 5];
MapTrafficIntruderView.VECTOR_EMPTY_LINE_DASH = [];
MapTrafficIntruderView.geoPointCache = [new GeoPoint(0, 0)];
MapTrafficIntruderView.vec2Cache = [new Float64Array(2)];
