import { BitFlags, FSComponent, NumberUnitSubject, Subject, UnitType, Vec2Math } from 'msfssdk';
import { MapLabeledRingLayer, MapLayer, MapProjectionChangeType, MapSyncedCanvasLayer } from 'msfssdk/components/map';
import { MapRangeDisplay } from '../../Map/MapRangeDisplay';
/**
 * A map layer which displays inner and outer range rings for traffic maps.
 */
export class TrafficMapRangeLayer extends MapLayer {
    constructor() {
        super(...arguments);
        this.tickLayerRef = FSComponent.createRef();
        this.innerRangeLayerRef = FSComponent.createRef();
        this.outerRangeLayerRef = FSComponent.createRef();
        this.rangeModule = this.props.model.getModule('range');
        this.trafficModule = this.props.model.getModule('traffic');
        this.innerRangeSub = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(0));
        this.outerRangeSub = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(0));
        this.innerLabel = null;
        this.outerLabel = null;
        this.needUpdateRings = false;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAttached() {
        this.tickLayerRef.instance.onAttached();
        this.innerRangeLayerRef.instance.onAttached();
        this.outerRangeLayerRef.instance.onAttached();
        this.initLabels();
        this.initStyles();
        this.initModuleListeners();
        this.innerRangeSub.sub(() => { this.needUpdateRings = true; });
        this.outerRangeSub.sub(() => { this.needUpdateRings = true; });
        this.needUpdateRings = true;
    }
    /**
     * Initializes the range display labels.
     */
    initLabels() {
        // TODO: Add customizable display unit support.
        this.innerLabel = this.innerRangeLayerRef.instance.createLabel(FSComponent.buildComponent(MapRangeDisplay, { range: this.innerRangeSub, displayUnit: Subject.create(UnitType.NMILE) }));
        this.innerLabel.setAnchor(new Float64Array([0.5, 0.5]));
        this.innerLabel.setRadialAngle(135 * Avionics.Utils.DEG2RAD);
        this.outerLabel = this.outerRangeLayerRef.instance.createLabel(FSComponent.buildComponent(MapRangeDisplay, { range: this.outerRangeSub, displayUnit: Subject.create(UnitType.NMILE) }));
        this.outerLabel.setAnchor(new Float64Array([0.5, 0.5]));
        this.outerLabel.setRadialAngle(135 * Avionics.Utils.DEG2RAD);
    }
    /**
     * Initializes ring styles.
     */
    initStyles() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.tickLayerRef.instance.display.context.fillStyle = this.props.strokeColor;
        this.innerRangeLayerRef.instance.setRingStrokeStyles(this.props.strokeWidth, this.props.strokeColor, this.props.strokeDash);
        this.outerRangeLayerRef.instance.setRingStrokeStyles(this.props.strokeWidth, this.props.strokeColor, this.props.strokeDash);
    }
    /**
     * Initializes modules listeners.
     */
    initModuleListeners() {
        const innerRangeCallback = this.updateInnerRange.bind(this);
        const outerRangeCallback = this.updateOuterRange.bind(this);
        this.rangeModule.nominalRanges.sub(innerRangeCallback);
        this.rangeModule.nominalRanges.sub(outerRangeCallback);
        this.trafficModule.innerRangeIndex.sub(innerRangeCallback);
        this.trafficModule.outerRangeIndex.sub(outerRangeCallback);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onMapProjectionChanged(mapProjection, changeFlags) {
        this.tickLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
        this.innerRangeLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
        this.outerRangeLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
        this.needUpdateRings = BitFlags.isAny(changeFlags, MapProjectionChangeType.TargetProjected | MapProjectionChangeType.ProjectedResolution);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onUpdated(time, elapsed) {
        this.tickLayerRef.instance.onUpdated(time, elapsed);
        if (this.needUpdateRings) {
            this.updateRings();
            this.needUpdateRings = false;
        }
        this.innerRangeLayerRef.instance.onUpdated(time, elapsed);
        this.outerRangeLayerRef.instance.onUpdated(time, elapsed);
    }
    /**
     * Updates the rings.
     */
    updateRings() {
        const center = this.props.mapProjection.getTargetProjected();
        const innerRadius = this.innerRangeSub.get().asUnit(UnitType.GA_RADIAN) / this.props.mapProjection.getProjectedResolution();
        const outerRadius = this.outerRangeSub.get().asUnit(UnitType.GA_RADIAN) / this.props.mapProjection.getProjectedResolution();
        if (innerRadius > 0) {
            this.innerRangeLayerRef.instance.setVisible(true);
            this.innerRangeLayerRef.instance.setRingPosition(center, innerRadius);
        }
        else {
            this.innerRangeLayerRef.instance.setVisible(false);
        }
        if (outerRadius > 0) {
            this.outerRangeLayerRef.instance.setVisible(true);
            this.outerRangeLayerRef.instance.setRingPosition(center, outerRadius);
        }
        else {
            this.outerRangeLayerRef.instance.setVisible(false);
        }
        this.updateTicks(center, innerRadius, outerRadius);
    }
    /**
     * Updates the ring tick marks.
     * @param center The projected center of the rings.
     * @param innerRadius The radius of the inner ring, in pixels.
     * @param outerRadius The radius of the outer ring, in pixels.
     */
    updateTicks(center, innerRadius, outerRadius) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const display = this.tickLayerRef.instance.display;
        display.clear();
        if (innerRadius > 0) {
            this.drawInnerTicks(display.context, center, innerRadius);
        }
        if (outerRadius > 0) {
            this.drawOuterTicks(display.context, center, outerRadius);
        }
    }
    /**
     * Draws the inner ring ticks to a canvas.
     * @param context A canvas 2D rendering context.
     * @param center The projected center of the inner ring.
     * @param radius The radius of the inner ring, in pixels.
     */
    drawInnerTicks(context, center, radius) {
        const step = Math.PI / 2;
        for (let i = 0; i < 4; i++) {
            const pos = Vec2Math.setFromPolar(radius, i * step, TrafficMapRangeLayer.vec2Cache[0]);
            this.drawTick(context, center[0] + pos[0], center[1] + pos[1], this.props.majorTickSize);
        }
    }
    /**
     * Draws the outer ring ticks to a canvas.
     * @param context A canvas 2D rendering context.
     * @param center The projected center of the outer ring.
     * @param radius The radius of the outer ring, in pixels.
     */
    drawOuterTicks(context, center, radius) {
        const step = Math.PI / 6;
        for (let i = 0; i < 12; i++) {
            const pos = Vec2Math.setFromPolar(radius, i * step, TrafficMapRangeLayer.vec2Cache[0]);
            this.drawTick(context, center[0] + pos[0], center[1] + pos[1], i % 3 === 0 ? this.props.majorTickSize : this.props.minorTickSize);
        }
    }
    /**
     * Draws a tick to a canvas.
     * @param context A canvas 2D rendering context.
     * @param x The x-coordinate of the center of the tick.
     * @param y The y-coordinate of the center of the tick.
     * @param size The size of the tick, in pixels.
     */
    drawTick(context, x, y, size) {
        context.fillRect(x - size / 2, y - size / 2, size, size);
    }
    /**
     * Updates the inner ring range.
     */
    updateInnerRange() {
        const range = this.rangeModule.nominalRanges.get()[this.trafficModule.innerRangeIndex.get()];
        this.innerRangeSub.set(range !== null && range !== void 0 ? range : 0);
    }
    /**
     * Updates the outer ring range.
     */
    updateOuterRange() {
        const range = this.rangeModule.nominalRanges.get()[this.trafficModule.outerRangeIndex.get()];
        this.outerRangeSub.set(range !== null && range !== void 0 ? range : 0);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent("div", null,
            FSComponent.buildComponent(MapSyncedCanvasLayer, { ref: this.tickLayerRef, model: this.props.model, mapProjection: this.props.mapProjection }),
            FSComponent.buildComponent(MapLabeledRingLayer, { ref: this.innerRangeLayerRef, model: this.props.model, mapProjection: this.props.mapProjection }),
            FSComponent.buildComponent(MapLabeledRingLayer, { ref: this.outerRangeLayerRef, model: this.props.model, mapProjection: this.props.mapProjection })));
    }
}
TrafficMapRangeLayer.vec2Cache = [new Float64Array(2)];
