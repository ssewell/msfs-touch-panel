import { FSComponent, Subject, UnitType } from 'msfssdk';
import { MapLabeledRingLayer } from 'msfssdk/components/map';
import { MapRangeDisplay } from '../MapRangeDisplay';
/**
 * A map layer which draws a range ring around the map target.
 */
export class MapRangeRingLayer extends MapLabeledRingLayer {
    constructor() {
        super(...arguments);
        this.label = null;
        this.needUpdateRing = false;
    }
    /**
     * Updates this layer according to its current visibility.
     */
    updateFromVisibility() {
        super.updateFromVisibility();
        const isVisible = this.isVisible();
        if (isVisible) {
            this.needUpdateRing = true;
        }
    }
    /** @inheritdoc */
    onAttached() {
        super.onAttached();
        this.initLabel();
        this.initStyles();
        this.initModuleListeners();
        this.updateVisibility();
        this.needUpdateRing = true;
    }
    /**
     * Initializes the range display label.
     */
    initLabel() {
        if (!this.props.showLabel) {
            return;
        }
        // TODO: Add customizable display unit support.
        const rangeModule = this.props.model.getModule('range');
        this.label = this.createLabel(FSComponent.buildComponent(MapRangeDisplay, { range: rangeModule.nominalRange, displayUnit: Subject.create(UnitType.NMILE) }));
        this.label.setAnchor(new Float64Array([0.5, 0.5]));
        this.label.setRadialAngle(225 * Avionics.Utils.DEG2RAD);
    }
    /**
     * Initializes ring styles.
     */
    initStyles() {
        this.setRingStrokeStyles(this.props.strokeWidth, this.props.strokeStyle, this.props.strokeDash);
        this.setRingOutlineStyles(this.props.outlineWidth, this.props.outlineStyle, this.props.outlineDash);
    }
    /**
     * Initializes modules listeners.
     */
    initModuleListeners() {
        const rangeModule = this.props.model.getModule('range');
        rangeModule.nominalRange.sub(this.onRangeChanged.bind(this));
        const rangeRingModule = this.props.model.getModule('rangeRing');
        rangeRingModule.show.sub(this.onRangeRingShowChanged.bind(this));
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onMapProjectionChanged(mapProjection, changeFlags) {
        super.onMapProjectionChanged(mapProjection, changeFlags);
        if (!this.isVisible()) {
            return;
        }
        this.needUpdateRing = true;
    }
    /**
     * Updates this layer's visibility.
     */
    updateVisibility() {
        this.setVisible(this.props.model.getModule('rangeRing').show.get());
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onUpdated(time, elapsed) {
        if (this.needUpdateRing) {
            this.updateRing();
            this.needUpdateRing = false;
        }
        super.onUpdated(time, elapsed);
    }
    /**
     * Updates the ring.
     */
    updateRing() {
        const center = this.props.mapProjection.getTargetProjected();
        const radius = this.props.model.getModule('range').nominalRange.get().asUnit(UnitType.GA_RADIAN) / this.props.mapProjection.getProjectedResolution();
        this.setRingPosition(center, radius);
    }
    /**
     * A callback which is called when the nominal map range changes.
     * @param range The new nominal map range.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onRangeChanged(range) {
        if (!this.isVisible()) {
            return;
        }
        this.needUpdateRing = true;
    }
    /**
     * A callback which is called when the show range ring property changes.
     * @param show The new value of the show range ring property.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onRangeRingShowChanged(show) {
        this.updateVisibility();
    }
}
