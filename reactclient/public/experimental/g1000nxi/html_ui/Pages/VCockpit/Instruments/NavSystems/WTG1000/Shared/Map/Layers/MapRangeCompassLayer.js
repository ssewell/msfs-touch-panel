import { BitFlags, DisplayComponent, FSComponent, NavMath, Subject, UnitType, Vec2Math, Vec2Subject } from 'msfssdk';
import { MapCanvasLayer, MapLayer, MapProjectionChangeType, MapSyncedCanvasLayer } from 'msfssdk/components/map';
import { MapRangeDisplay } from '../MapRangeDisplay';
import { MapOrientation } from '../Modules/MapOrientationModule';
/**
 * A map layer which draws a range compass in front of the map target.
 */
export class MapRangeCompassLayer extends MapLayer {
    constructor() {
        super(...arguments);
        this.rootRef = FSComponent.createRef();
        this.arcLayerRef = FSComponent.createRef();
        this.roseLayerContainerRef = FSComponent.createRef();
        this.roseLayerRef = FSComponent.createRef();
        this.referenceMarkerContainerRef = FSComponent.createRef();
        this.roseLabelsLayerRef = FSComponent.createRef();
        this.headingIndicatorRef = FSComponent.createRef();
        this.rangeDisplayContainerRef = FSComponent.createRef();
        this.centerSubject = Vec2Subject.createFromVector(new Float64Array(2));
        this.radiusSubject = Subject.create(0);
        this.rotationSubject = Subject.create(0);
        this.isMagneticSubject = Subject.create(true);
        this.referenceMarkerTypeSub = Subject.create(MapRangeCompassReferenceMarkerType.TICK);
        this.needUpdateRootVisibility = false;
        this.needRedrawArc = true;
        this.needRedrawBearings = true;
        this.needRotateBearingTicks = true;
        this.needRechooseReferenceMarker = true;
        this.needRepositionReferenceMarker = true;
        this.needReclipTicks = true;
        this.needUpdateHeadingIndicatorVisibility = true;
        this.needRepositionLabel = true;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onVisibilityChanged(isVisible) {
        this.needUpdateRootVisibility = true;
        if (isVisible) {
            this.needRechooseReferenceMarker = true;
            this.updateParameters();
        }
    }
    /** @inheritdoc */
    onAttached() {
        super.onAttached();
        this.arcLayerRef.instance.onAttached();
        this.roseLayerRef.instance.onAttached();
        this.roseLabelsLayerRef.instance.onAttached();
        this.referenceMarkerContainerRef.instance.onAttached();
        this.headingIndicatorRef.instance.onAttached();
        this.initStyles();
        this.initListeners();
        this.updateVisibility();
        this.updateParameters();
    }
    /**
     * Initializes ring styles.
     */
    initStyles() {
        const bearingLabelLayerDisplay = this.roseLabelsLayerRef.instance.display;
        bearingLabelLayerDisplay.context.lineWidth = this.props.bearingLabelOutlineWidth * 2;
        bearingLabelLayerDisplay.context.strokeStyle = 'black';
        bearingLabelLayerDisplay.context.font = `${this.props.bearingLabelFontSize}px ${this.props.bearingLabelFont}`;
        bearingLabelLayerDisplay.context.fillStyle = 'white';
    }
    /**
     * Initializes listeners.
     */
    initListeners() {
        this.initParameterListeners();
        this.initModuleListeners();
        this.props.showHeadingBug.sub(() => {
            this.needRechooseReferenceMarker = true;
            this.needUpdateHeadingIndicatorVisibility = true;
        });
    }
    /**
     * Initializes parameter listeners.
     */
    initParameterListeners() {
        this.centerSubject.sub(this.onCenterChanged.bind(this));
        this.radiusSubject.sub(this.onRadiusChanged.bind(this));
        this.rotationSubject.sub(this.onRotationChanged.bind(this));
        this.isMagneticSubject.sub(this.onIsMagneticChanged.bind(this));
    }
    /**
     * Initializes modules listeners.
     */
    initModuleListeners() {
        const rangeModule = this.props.model.getModule('range');
        rangeModule.nominalRange.sub(this.onRangeChanged.bind(this));
        const orientationModule = this.props.model.getModule('orientation');
        orientationModule.orientation.sub(this.onOrientationChanged.bind(this));
        const rangeRingModule = this.props.model.getModule('rangeCompass');
        rangeRingModule.show.sub(this.onRangeCompassShowChanged.bind(this));
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onMapProjectionChanged(mapProjection, changeFlags) {
        this.arcLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
        this.roseLabelsLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
        if (this.props.showHeadingBug) {
            this.headingIndicatorRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
        }
        if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize)) {
            // resizing the map will cause synced canvas layers to clear themselves, so we need to force a redraw on these
            // layers.
            this.needRedrawArc = true;
            this.needRedrawBearings = true;
            // we also need to re-initialize the styles on these canvases since these are also cleared.
            this.initStyles();
        }
        if (!this.isVisible()) {
            return;
        }
        this.updateParameters();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onUpdated(time, elapsed) {
        if (this.needUpdateRootVisibility) {
            this.updateRootVisibility();
            this.needUpdateRootVisibility = false;
        }
        this.redraw();
        this.updateSubLayers(time, elapsed);
    }
    /**
     * Updates the visibility of this layer's root.
     */
    updateRootVisibility() {
        this.rootRef.instance.style.display = this.isVisible() ? 'block' : 'none';
    }
    /**
     * Redraws the compass.
     */
    redraw() {
        this.redrawArc();
        this.redrawBearings();
        this.updateReferenceMarker();
        this.updateHeadingIndicator();
        if (this.props.showLabel) {
            this.updateLabel();
        }
    }
    /**
     * Redraws the arc of the compass.
     */
    redrawArc() {
        if (!this.needRedrawArc) {
            return;
        }
        const arcLayerDisplay = this.arcLayerRef.instance.display;
        arcLayerDisplay.clear();
        const center = this.centerSubject.get();
        const radius = this.radiusSubject.get();
        const angularWidthRad = MapRangeCompassLayer.ARC_ANGULAR_WIDTH * Avionics.Utils.DEG2RAD;
        const startAngle = -Math.PI / 2 - angularWidthRad / 2;
        const endAngle = -Math.PI / 2 + angularWidthRad / 2;
        const leftTickStart = Vec2Math.add(Vec2Math.setFromPolar(radius + this.props.arcEndTickLength, startAngle, MapRangeCompassLayer.vec2Cache[0]), center, MapRangeCompassLayer.vec2Cache[0]);
        const leftTickEnd = Vec2Math.add(Vec2Math.setFromPolar(radius, startAngle, MapRangeCompassLayer.vec2Cache[1]), center, MapRangeCompassLayer.vec2Cache[1]);
        const rightTickStart = Vec2Math.add(Vec2Math.setFromPolar(radius, endAngle, MapRangeCompassLayer.vec2Cache[2]), center, MapRangeCompassLayer.vec2Cache[2]);
        const rightTickEnd = Vec2Math.add(Vec2Math.setFromPolar(radius + this.props.arcEndTickLength, endAngle, MapRangeCompassLayer.vec2Cache[3]), center, MapRangeCompassLayer.vec2Cache[3]);
        this.composeArcPath(center, radius, angularWidthRad, leftTickStart, leftTickEnd, rightTickStart, rightTickEnd);
        arcLayerDisplay.context.lineWidth = this.props.arcStrokeWidth;
        arcLayerDisplay.context.strokeStyle = 'white';
        arcLayerDisplay.context.stroke();
        this.needRedrawArc = false;
    }
    /**
     * Composes the path of the compass arc.
     * @param center The center of the compass, in pixels.
     * @param radius The radius of the compass, in pixels.
     * @param angularWidth The angular width of the arc, in radians.
     * @param leftTickStart The position of the start of the left end tick, in pixels.
     * @param leftTickEnd The position of the end of the left end tick, in pixels.
     * @param rightTickStart The position of the start of the right end tick, in pixels.
     * @param rightTickEnd The position of the end of the right end tick, in pixels.
     */
    composeArcPath(center, radius, angularWidth, leftTickStart, leftTickEnd, rightTickStart, rightTickEnd) {
        const arcLayerDisplay = this.arcLayerRef.instance.display;
        arcLayerDisplay.context.beginPath();
        arcLayerDisplay.context.moveTo(leftTickStart[0], leftTickStart[1]);
        arcLayerDisplay.context.lineTo(leftTickEnd[0], leftTickEnd[1]);
        arcLayerDisplay.context.arc(center[0], center[1], radius, (-angularWidth - Math.PI) / 2, (angularWidth - Math.PI) / 2);
        arcLayerDisplay.context.lineTo(rightTickEnd[0], rightTickEnd[1]);
    }
    /**
     * Redraws the bearing tick and labels.
     */
    redrawBearings() {
        if (!this.needRedrawBearings && !this.needRotateBearingTicks) {
            return;
        }
        this.roseLabelsLayerRef.instance.redraw();
        this.roseLayerRef.instance.updateRotation();
        this.needRotateBearingTicks = false;
        if (!this.needRedrawBearings && !this.needReclipTicks) {
            return;
        }
        if (this.needReclipTicks) {
            this.updateBearingTickClip();
        }
        this.roseLayerRef.instance.redraw();
        this.needRedrawBearings = false;
    }
    /**
     * Updates the bearing tick clip mask.
     */
    updateBearingTickClip() {
        const center = this.centerSubject.get();
        const radius = this.radiusSubject.get();
        const thick = this.props.arcStrokeWidth / 2;
        const innerToOuterLength = this.props.arcEndTickLength + thick + 5;
        const totalRadius = radius + this.props.arcEndTickLength + thick / 2 + 5;
        const leftAngle = -MapRangeCompassLayer.ARC_ANGULAR_WIDTH / 2 * Avionics.Utils.DEG2RAD - Math.PI / 2;
        const leftInner1 = Vec2Math.setFromPolar(radius - thick / 2, leftAngle, MapRangeCompassLayer.vec2Cache[0]);
        const leftInner2 = Vec2Math.setFromPolar(thick / 2, leftAngle - Math.PI / 2, MapRangeCompassLayer.vec2Cache[1]);
        const leftOuter = Vec2Math.setFromPolar(innerToOuterLength, leftAngle, MapRangeCompassLayer.vec2Cache[2]);
        const outerWidth = Math.abs(leftInner1[0] + leftInner2[0] + leftOuter[0]) * 2;
        this.roseLayerContainerRef.instance.style.webkitClipPath // the cast is to avoid typescript complaining webkitCliPath doesn't exist
            = `path('M${center[0]},${center[1]} l${leftInner1[0]},${leftInner1[1]} l${leftInner2[0]},${leftInner2[1]} l${leftOuter[0]},${leftOuter[1]} a${totalRadius},${totalRadius},0,0,1,${outerWidth},0 l${leftInner2[0]},${-leftInner2[1]} l${leftInner1[0]},${-leftInner1[1]} Z')`;
        this.needReclipTicks = false;
    }
    /**
     * Redraws the reference marker.
     */
    updateReferenceMarker() {
        if (!this.needRechooseReferenceMarker && !this.needRepositionReferenceMarker) {
            return;
        }
        if (this.needRechooseReferenceMarker) {
            const orientation = this.props.model.getModule('orientation').orientation.get();
            const type = (this.props.showHeadingBug.get() && orientation === MapOrientation.HeadingUp)
                ? MapRangeCompassReferenceMarkerType.ARROW
                : MapRangeCompassReferenceMarkerType.TICK;
            this.referenceMarkerTypeSub.set(type);
            this.needRechooseReferenceMarker = false;
        }
        if (!this.needRepositionReferenceMarker) {
            return;
        }
        this.referenceMarkerContainerRef.instance.reposition();
        this.needRepositionReferenceMarker = false;
    }
    /**
     * Updates the selected heading indicator.
     */
    updateHeadingIndicator() {
        if (!this.needUpdateHeadingIndicatorVisibility) {
            return;
        }
        const orientation = this.props.model.getModule('orientation').orientation.get();
        this.headingIndicatorRef.instance.setVisible(this.props.showHeadingBug.get() && orientation === MapOrientation.HeadingUp);
        this.needUpdateHeadingIndicatorVisibility = false;
    }
    /**
     * Updates the range display label.
     */
    updateLabel() {
        if (!this.needRepositionLabel) {
            return;
        }
        const center = this.centerSubject.get();
        const radius = this.radiusSubject.get();
        const pos = Vec2Math.add(Vec2Math.setFromPolar(radius, MapRangeCompassLayer.RANGE_LABEL_RADIAL_ANGLE * Avionics.Utils.DEG2RAD, MapRangeCompassLayer.vec2Cache[0]), center, MapRangeCompassLayer.vec2Cache[0]);
        this.rangeDisplayContainerRef.instance.style.left = `${pos[0]}px`;
        this.rangeDisplayContainerRef.instance.style.top = `${pos[1]}px`;
        this.needRepositionLabel = false;
    }
    /**
     * Updates this layer's sublayers.
     * @param time The current time as a UNIX timestamp.
     * @param elapsed The elapsed time, in milliseconds, since the last update.
     */
    updateSubLayers(time, elapsed) {
        this.arcLayerRef.instance.onUpdated(time, elapsed);
        this.roseLayerRef.instance.onUpdated(time, elapsed);
        this.roseLabelsLayerRef.instance.onUpdated(time, elapsed);
        this.referenceMarkerContainerRef.instance.onUpdated(time, elapsed);
        if (this.props.showHeadingBug) {
            this.headingIndicatorRef.instance.onUpdated(time, elapsed);
        }
    }
    /**
     * Updates this layer's visibility.
     */
    updateVisibility() {
        this.setVisible(this.props.model.getModule('rangeCompass').show.get());
    }
    /**
     * Updates the ring.
     */
    updateParameters() {
        const center = this.props.mapProjection.getTargetProjected();
        const radius = this.props.model.getModule('range').nominalRange.get().asUnit(UnitType.GA_RADIAN) / this.props.mapProjection.getProjectedResolution();
        // TODO: Find a better way to get magvar.
        const rotation = Math.round((this.props.mapProjection.getRotation() + (this.isMagneticSubject.get() ? SimVar.GetSimVarValue('GPS MAGVAR', 'radians') : 0)) * 1e4) / 1e4;
        this.centerSubject.set(center);
        this.radiusSubject.set(radius);
        this.rotationSubject.set(rotation);
    }
    /**
     * A callback which is called when the center of the compass changes.
     * @param center The new center of the compass, in pixels.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onCenterChanged(center) {
        this.needRedrawArc = true;
        this.needRedrawBearings = true;
        this.needRepositionReferenceMarker = true;
        this.needReclipTicks = true;
        this.needRepositionLabel = true;
    }
    /**
     * A callback which is called when the center of the compass changes.
     * @param radius The new radius of the compass, in pixels.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onRadiusChanged(radius) {
        this.needRedrawArc = true;
        this.needRedrawBearings = true;
        this.needRepositionReferenceMarker = true;
        this.needReclipTicks = true;
        this.needRepositionLabel = true;
    }
    /**
     * A callback which is called when the rotation of the compass changes.
     * @param angle The new rotation angle of the compass, in radians.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onRotationChanged(angle) {
        this.needRotateBearingTicks = true;
    }
    /**
     * A callback which is called when whether the compass should display magnetic bearings changes.
     * @param isMagnetic Whether the compass should display magnetic bearings.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onIsMagneticChanged(isMagnetic) {
        this.updateParameters();
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
        this.updateParameters();
    }
    /**
     * A callback which is called when the map orientation changes.
     * @param orientation The new map orientation.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onOrientationChanged(orientation) {
        if (!this.isVisible()) {
            return;
        }
        this.needRechooseReferenceMarker = true;
        this.needUpdateHeadingIndicatorVisibility = true;
    }
    /**
     * A callback which is called when the show range ring property changes.
     * @param show The new value of the show range ring property.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onRangeCompassShowChanged(show) {
        this.updateVisibility();
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("div", { ref: this.rootRef, style: 'position: absolute; left: 0; top: 0; width: 100%; height: 100%;' },
            FSComponent.buildComponent(MapSyncedCanvasLayer, { ref: this.arcLayerRef, model: this.props.model, mapProjection: this.props.mapProjection }),
            FSComponent.buildComponent("div", { ref: this.roseLayerContainerRef, style: 'position: absolute; width: 100%; height: 100%;' },
                FSComponent.buildComponent(MapRangeCompassRose, { ref: this.roseLayerRef, model: this.props.model, mapProjection: this.props.mapProjection, compassCenterSubject: this.centerSubject, compassRadiusSubject: this.radiusSubject, compassRotationSubject: this.rotationSubject, tickMajorInterval: MapRangeCompassLayer.BEARING_TICK_MAJOR_INTERVAL, tickMinorMultiplier: MapRangeCompassLayer.BEARING_TICK_MINOR_FACTOR, tickMajorLength: this.props.bearingTickMajorLength, tickMinorLength: this.props.bearingTickMinorLength, tickStrokeWidth: this.props.arcStrokeWidth })),
            FSComponent.buildComponent(MapRangeCompassReferenceMarkerContainer, { ref: this.referenceMarkerContainerRef, model: this.props.model, mapProjection: this.props.mapProjection, compassCenterSubject: this.centerSubject, compassRadiusSubject: this.radiusSubject, compassRotationSubject: this.rotationSubject, activeType: this.referenceMarkerTypeSub, tickWidth: this.props.referenceTickWidth, tickHeight: this.props.referenceTickHeight, arrowWidth: this.props.referenceArrowWidth, arrowHeight: this.props.referenceArrowHeight }),
            this.renderSelectedHeadingIndicator(),
            FSComponent.buildComponent(MapRangeCompassRoseLabels, { ref: this.roseLabelsLayerRef, model: this.props.model, mapProjection: this.props.mapProjection, compassCenterSubject: this.centerSubject, compassRadiusSubject: this.radiusSubject, compassRotationSubject: this.rotationSubject, angularWidth: MapRangeCompassLayer.ARC_ANGULAR_WIDTH, interval: MapRangeCompassLayer.BEARING_TICK_MAJOR_INTERVAL, font: this.props.bearingLabelFont, fontSize: this.props.bearingLabelFontSize, outlineWidth: this.props.bearingLabelOutlineWidth, radialOffset: this.props.bearingTickMajorLength + this.props.bearingLabelRadialOffset }),
            this.renderRangeDisplay()));
    }
    /**
     * Renders the selected heading indicator.
     * @returns a VNode representing the range display label.
     */
    renderSelectedHeadingIndicator() {
        return this.props.showHeadingBug
            ? (FSComponent.buildComponent(MapRangeCompassSelectedHeading, { ref: this.headingIndicatorRef, model: this.props.model, mapProjection: this.props.mapProjection, bus: this.props.bus, compassCenterSubject: this.centerSubject, compassRadiusSubject: this.radiusSubject, compassRotationSubject: this.rotationSubject, bugWidth: this.props.headingBugWidth, bugHeight: this.props.headingBugHeight, bugNotchHeight: this.props.referenceArrowHeight / 3, bugNotchWidth: this.props.referenceArrowWidth / 3, outlineWidth: 1, lineWidth: this.props.arcStrokeWidth, lineDash: [this.props.arcStrokeWidth * 3, this.props.arcStrokeWidth * 3] }))
            : (FSComponent.buildComponent("div", { style: 'display: none;' }));
    }
    /**
     * Renders the range display label.
     * @returns a VNode representing the range display label.
     */
    renderRangeDisplay() {
        // TODO: Add customizable display unit support.
        const rangeModule = this.props.model.getModule('range');
        return this.props.showLabel
            ? (FSComponent.buildComponent("div", { ref: this.rangeDisplayContainerRef, style: 'position: absolute; transform: translate(-50%, -50%);' },
                FSComponent.buildComponent(MapRangeDisplay, { range: rangeModule.nominalRange, displayUnit: Subject.create(UnitType.NMILE) })))
            : null;
    }
}
/** The angular width of the compass arc, in degrees. */
MapRangeCompassLayer.ARC_ANGULAR_WIDTH = 120;
/** The angular interval, in degrees, between major bearing ticks. */
MapRangeCompassLayer.BEARING_TICK_MAJOR_INTERVAL = 30;
/** The number of minor bearing ticks per major bearing tick. */
MapRangeCompassLayer.BEARING_TICK_MINOR_FACTOR = 3;
/** The radial on which the range label is positioned, in degrees. */
MapRangeCompassLayer.RANGE_LABEL_RADIAL_ANGLE = -135;
MapRangeCompassLayer.vec2Cache = Array.from({ length: 4 }, () => new Float64Array(2));
/**
 * A rotating compass rose with unlabeled graduated bearing ticks.
 */
class MapRangeCompassRose extends MapCanvasLayer {
    constructor() {
        super(...arguments);
        this.bearingStep = this.props.tickMajorInterval / this.props.tickMinorMultiplier * Avionics.Utils.DEG2RAD;
        this.numMinorBearingTicks = Math.floor(2 * Math.PI / this.bearingStep);
    }
    /**
     * Redraws the canvas.
     */
    redraw() {
        const display = this.display;
        const center = this.props.compassCenterSubject.get();
        const radius = this.props.compassRadiusSubject.get();
        const canvasSize = Math.ceil(radius) * 2;
        this.setWidth(canvasSize);
        this.setHeight(canvasSize);
        display.canvas.style.left = `${center[0] - canvasSize / 2}px`;
        display.canvas.style.top = `${center[1] - canvasSize / 2}px`;
        display.clear();
        this.composeBearingTicksPath(radius);
        display.context.lineWidth = this.props.tickStrokeWidth;
        display.context.strokeStyle = 'white';
        display.context.stroke();
    }
    /**
     * Composes the path of the bearing ticks.
     * @param radius The radius of the compass, in pixels.
     */
    composeBearingTicksPath(radius) {
        const canvasSize = this.getWidth();
        const center = Vec2Math.set(canvasSize / 2, canvasSize / 2, MapRangeCompassRose.vec2Cache[0]);
        const display = this.display;
        display.context.beginPath();
        for (let i = 0; i < this.numMinorBearingTicks; i++) {
            const bearing = i * this.bearingStep;
            const angle = bearing - Math.PI / 2;
            let start;
            if (i % MapRangeCompassLayer.BEARING_TICK_MINOR_FACTOR === 0) {
                // major tick
                start = Vec2Math.add(Vec2Math.setFromPolar(radius - this.props.tickMajorLength, angle, MapRangeCompassRose.vec2Cache[1]), center, MapRangeCompassRose.vec2Cache[1]);
            }
            else {
                // minor tick
                start = Vec2Math.add(Vec2Math.setFromPolar(radius - this.props.tickMinorLength, angle, MapRangeCompassRose.vec2Cache[1]), center, MapRangeCompassRose.vec2Cache[1]);
            }
            const end = Vec2Math.add(Vec2Math.setFromPolar(radius, angle, MapRangeCompassRose.vec2Cache[2]), center, MapRangeCompassRose.vec2Cache[2]);
            display.context.moveTo(start[0], start[1]);
            display.context.lineTo(end[0], end[1]);
        }
    }
    /**
     * Updates the rotation of this rose.
     */
    updateRotation() {
        const display = this.display;
        display.canvas.style.transform = `rotate(${this.props.compassRotationSubject.get()}rad)`;
    }
}
MapRangeCompassRose.vec2Cache = [new Float64Array(2), new Float64Array(2), new Float64Array(2)];
/**
 * Bearing labels for a rotating range compass rose.
 */
class MapRangeCompassRoseLabels extends MapSyncedCanvasLayer {
    /**
     * Redraws the bearing labels.
     */
    redraw() {
        const display = this.display;
        display.clear();
        const PI2 = Math.PI * 2;
        const center = this.props.compassCenterSubject.get();
        const radius = this.props.compassRadiusSubject.get();
        const rotation = this.props.compassRotationSubject.get();
        const halfAngularWidth = this.props.angularWidth / 2 * Avionics.Utils.DEG2RAD;
        const centerBearing = (-rotation + PI2) % PI2;
        const intervalRad = this.props.interval * Avionics.Utils.DEG2RAD;
        for (let bearing = 0; bearing < PI2; bearing += intervalRad) {
            if (Math.min(Math.abs(bearing - centerBearing), PI2 - Math.abs(bearing - centerBearing)) > halfAngularWidth) {
                continue;
            }
            this.drawBearingLabel(center, radius, rotation, bearing);
        }
    }
    /**
     * Draws a bearing label.
     * @param center The center of the compass, in pixels.
     * @param radius The radius of the compass, in pixels.
     * @param rotation The rotation of the compass, in radians.
     * @param bearing The label's bearing, in radians.
     */
    drawBearingLabel(center, radius, rotation, bearing) {
        const display = this.display;
        // TODO: support the T superscript for true bearings.
        const text = (360 - (360 - (bearing * Avionics.Utils.RAD2DEG)) % 360).toFixed(0).padStart(3, '0');
        const angle = bearing - Math.PI / 2 + rotation;
        const textWidth = display.context.measureText(text).width;
        const textHeight = this.props.fontSize;
        const textOffset = Math.hypot(textWidth, textHeight) / 2 + this.props.radialOffset;
        const textRadius = radius - textOffset;
        const labelPos = Vec2Math.add(Vec2Math.setFromPolar(textRadius, angle, MapRangeCompassRoseLabels.vec2Cache[0]), Vec2Math.set(center[0] - textWidth / 2, center[1] + textHeight / 2, MapRangeCompassRoseLabels.vec2Cache[1]), MapRangeCompassRoseLabels.vec2Cache[0]);
        if (this.props.outlineWidth > 0) {
            display.context.strokeText(text, labelPos[0], labelPos[1]);
        }
        display.context.fillText(text, labelPos[0], labelPos[1]);
    }
}
MapRangeCompassRoseLabels.vec2Cache = [new Float64Array(2), new Float64Array(2)];
/**
 * A reference arrow for MapRangeCompassLayer.
 */
class MapRangeCompassReferenceArrow extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.svgRef = FSComponent.createRef();
    }
    /**
     * Sets whether this marker should be visible. This method has no effect if this marker has not been rendered.
     * @param val Whether this marker should be visible.
     */
    setVisible(val) {
        if (!this.svgRef.instance) {
            return;
        }
        this.svgRef.instance.style.display = val ? 'block' : 'none';
    }
    /**
     * Sets this marker's position. The provided position should be the position of the middle of the range compass arc.
     * This method has no effect if this marker has not been rendered.
     * @param pos The new position, in pixels.
     */
    setPosition(pos) {
        if (!this.svgRef.instance) {
            return;
        }
        const svg = this.svgRef.instance;
        svg.style.left = `${pos[0]}px`;
        svg.style.top = `${pos[1]}px`;
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("svg", { ref: this.svgRef, viewBox: '0 0 100 100', preserveAspectRatio: 'none', style: `display: none; position: absolute; width: ${this.props.width}px; height: ${this.props.height}px; transform: translate(-50%, -66.7%);` },
            FSComponent.buildComponent("path", { d: 'M 0 0 L 100 0 L 50 100 Z', fill: 'white' })));
    }
}
/**
 * A reference tick for MapRangeCompassLayer.
 */
class MapRangeCompassReferenceTick extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.svgRef = FSComponent.createRef();
    }
    /**
     * Sets whether this marker should be visible. This method has no effect if this marker has not been rendered.
     * @param val Whether this marker should be visible.
     */
    setVisible(val) {
        if (!this.svgRef.instance) {
            return;
        }
        this.svgRef.instance.style.display = val ? 'block' : 'none';
    }
    /**
     * Sets this marker's position. The provided position should be the position of the middle of the range compass arc.
     * This method has no effect if this marker has not been rendered.
     * @param pos The new position, in pixels.
     */
    setPosition(pos) {
        if (!this.svgRef.instance) {
            return;
        }
        const svg = this.svgRef.instance;
        svg.style.left = `${pos[0]}px`;
        svg.style.top = `${pos[1]}px`;
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("svg", { ref: this.svgRef, viewBox: '0 0 100 100', preserveAspectRatio: 'none', style: `display: none; position: absolute; width: ${this.props.width}px; height: ${this.props.height}px; transform: translate(-50%, -100%);` },
            FSComponent.buildComponent("rect", { x: '0', y: '0', width: '100', height: '100', fill: 'white' })));
    }
}
/**
 *
 */
var MapRangeCompassReferenceMarkerType;
(function (MapRangeCompassReferenceMarkerType) {
    MapRangeCompassReferenceMarkerType[MapRangeCompassReferenceMarkerType["TICK"] = 0] = "TICK";
    MapRangeCompassReferenceMarkerType[MapRangeCompassReferenceMarkerType["ARROW"] = 1] = "ARROW";
})(MapRangeCompassReferenceMarkerType || (MapRangeCompassReferenceMarkerType = {}));
/**
 * A container for range compass reference markers.
 */
class MapRangeCompassReferenceMarkerContainer extends MapLayer {
    constructor() {
        super(...arguments);
        this.containerRef = FSComponent.createRef();
        this.referenceTickRef = FSComponent.createRef();
        this.referenceArrowRef = FSComponent.createRef();
        this.activeReferenceMarker = null;
    }
    /** @inheritdoc */
    onAttached() {
        this.props.activeType.sub(this.onActiveTypeChanged.bind(this), true);
    }
    /**
     * Responds to active marker type changes.
     * @param type The active marker type.
     */
    onActiveTypeChanged(type) {
        const selectedReferenceMarker = type === MapRangeCompassReferenceMarkerType.TICK
            ? this.referenceTickRef.instance
            : this.referenceArrowRef.instance;
        const oldActiveMarker = this.activeReferenceMarker;
        if (oldActiveMarker !== selectedReferenceMarker) {
            this.activeReferenceMarker = selectedReferenceMarker;
            oldActiveMarker === null || oldActiveMarker === void 0 ? void 0 : oldActiveMarker.setVisible(false);
            this.activeReferenceMarker.setVisible(true);
            this.reposition();
        }
    }
    /**
     * Repositions the reference marker.
     */
    reposition() {
        var _a;
        const center = this.props.compassCenterSubject.get();
        const radius = this.props.compassRadiusSubject.get();
        const pos = Vec2Math.add(Vec2Math.setFromPolar(radius, -Math.PI / 2, MapRangeCompassReferenceMarkerContainer.tempVec2), center, MapRangeCompassReferenceMarkerContainer.tempVec2);
        (_a = this.activeReferenceMarker) === null || _a === void 0 ? void 0 : _a.setPosition(pos);
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("div", { ref: this.containerRef, style: 'position: absolute; width: 100%; height: 100%;' },
            FSComponent.buildComponent(MapRangeCompassReferenceTick, { ref: this.referenceTickRef, width: this.props.tickWidth, height: this.props.tickHeight }),
            FSComponent.buildComponent(MapRangeCompassReferenceArrow, { ref: this.referenceArrowRef, width: this.props.arrowWidth, height: this.props.arrowHeight })));
    }
}
MapRangeCompassReferenceMarkerContainer.tempVec2 = new Float64Array(2);
/**
 * The selected heading bug and heading line for the map range compass layer.
 */
class MapRangeCompassSelectedHeading extends MapLayer {
    /** @inheritdoc */
    constructor(props) {
        super(props);
        this.canvasLayerRef = FSComponent.createRef();
        this.selectedHeading = 0;
        this.isInit = false;
        this.isSuppressedSubject = Subject.create(true);
        this.suppressTimer = null;
        this.centerSubject = Vec2Subject.createFromVector(new Float64Array(2));
        this.radiusSubject = Subject.create(0);
        this.rotationSubject = Subject.create(0);
        this.isOOBSubject = Subject.create(true);
        this.needRedraw = true;
        this.needReposition = true;
        this.needRotate = true;
        /**
         * A callback which is called when the suppress timer fires.
         */
        this.suppressCallback = () => {
            this.suppressTimer = null;
            this.isSuppressedSubject.set(true);
        };
        /**
         * A callback which is called when the selected heading changes.
         * @param heading The new selected heading, in degrees.
         */
        this.onSelectedHeadingChanged = (heading) => {
            this.selectedHeading = heading;
            this.unsuppress(MapRangeCompassSelectedHeading.UNSUPPRESS_DURATION);
            this.updateParameters();
        };
        this.selectedHeadingConsumer = this.props.bus.getSubscriber().on('heading_select').whenChanged();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc, @typescript-eslint/no-unused-vars
    onVisibilityChanged(isVisible) {
        if (this.isInit) {
            this.updateFromVisibility();
        }
    }
    /**
     * Updates this layer according to its current visibility.
     */
    updateFromVisibility() {
        const isVisible = this.isVisible();
        if (isVisible) {
            this.selectedHeadingConsumer.handle(this.onSelectedHeadingChanged);
        }
        else {
            this.selectedHeadingConsumer.off(this.onSelectedHeadingChanged);
            this.suppress();
        }
    }
    /** @inheritdoc */
    onAttached() {
        super.onAttached();
        this.canvasLayerRef.instance.onAttached();
        this.initCanvas();
        this.isInit = true;
        this.initSubjectListeners();
        this.updateFromVisibility();
    }
    /**
     * Initializes canvas width.
     */
    initCanvas() {
        const width = Math.max(this.props.lineWidth, this.props.bugWidth + this.props.outlineWidth * 2);
        this.canvasLayerRef.instance.setWidth(width);
        const canvasLayerDisplay = this.canvasLayerRef.instance.display;
        canvasLayerDisplay.canvas.style.width = `${width}px`;
        canvasLayerDisplay.canvas.style.transformOrigin = '50% 100%';
    }
    /**
     * Initializes subject listeners.
     */
    initSubjectListeners() {
        this.props.compassCenterSubject.sub(this.updateParameters.bind(this));
        this.props.compassRadiusSubject.sub(this.updateParameters.bind(this));
        this.props.compassRotationSubject.sub(this.updateParameters.bind(this));
        this.centerSubject.sub(this.onCenterChanged.bind(this));
        this.radiusSubject.sub(this.onRadiusChanged.bind(this));
        this.rotationSubject.sub(this.onRotationChanged.bind(this));
        this.isSuppressedSubject.sub(this.onIsSuppressedChanged.bind(this));
        this.isOOBSubject.sub(this.onIsOOBChanged.bind(this));
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onMapProjectionChanged(mapProjection, changeFlags) {
        if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize)) {
            this.needReposition = true;
            this.needRedraw = true;
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onUpdated(time, elapsed) {
        this.canvasLayerRef.instance.onUpdated(time, elapsed);
        if (this.needReposition) {
            this.reposition();
        }
        else if (this.needRedraw) {
            this.redraw();
        }
        if (this.needRotate) {
            this.rotate();
        }
    }
    /**
     * Repositions the canvas.
     */
    reposition() {
        const center = this.props.compassCenterSubject.get();
        const projectedWidth = this.props.mapProjection.getProjectedSize()[0];
        const projectedHeight = this.props.mapProjection.getProjectedSize()[1];
        // find the distance to the farthest corner.
        const isLeft = center[0] > projectedWidth / 2;
        const isTop = center[1] > projectedHeight / 2;
        const height = Math.hypot(center[0] - (isLeft ? 0 : projectedWidth), center[1] - (isTop ? 0 : projectedHeight));
        this.canvasLayerRef.instance.setHeight(height);
        const canvasLayerDisplay = this.canvasLayerRef.instance.display;
        canvasLayerDisplay.canvas.style.height = `${height}px`;
        canvasLayerDisplay.canvas.style.left = `${center[0] - this.canvasLayerRef.instance.getWidth() / 2}px`;
        canvasLayerDisplay.canvas.style.bottom = `${projectedHeight - center[1]}px`;
        this.needReposition = false;
        this.redraw();
    }
    /**
     * Redraws the canvas.
     */
    redraw() {
        const canvasWidth = this.canvasLayerRef.instance.getWidth();
        const canvasHeight = this.canvasLayerRef.instance.getHeight();
        const radius = this.props.compassRadiusSubject.get();
        const canvasLayerDisplay = this.canvasLayerRef.instance.display;
        canvasLayerDisplay.clear();
        this.redrawLine(canvasWidth, canvasHeight);
        this.redrawBug(canvasWidth, canvasHeight, radius);
        this.needRedraw = false;
    }
    /**
     * Redraws the heading line.
     * @param canvasWidth The width of the canvas, in pixels.
     * @param canvasHeight The height of the canvas, in pixels.
     */
    redrawLine(canvasWidth, canvasHeight) {
        const canvasLayerDisplay = this.canvasLayerRef.instance.display;
        canvasLayerDisplay.context.beginPath();
        canvasLayerDisplay.context.moveTo(canvasWidth / 2, canvasHeight);
        canvasLayerDisplay.context.lineTo(canvasWidth / 2, 0);
        canvasLayerDisplay.context.lineWidth = this.props.lineWidth;
        canvasLayerDisplay.context.strokeStyle = MapRangeCompassSelectedHeading.COLOR;
        canvasLayerDisplay.context.setLineDash(this.props.lineDash);
        canvasLayerDisplay.context.stroke();
    }
    /**
     * Redraws the heading bug.
     * @param canvasWidth The width of the canvas, in pixels.
     * @param canvasHeight The height of the canvas, in pixels.
     * @param radius The radius of the compass, in pixels.
     */
    redrawBug(canvasWidth, canvasHeight, radius) {
        const canvasLayerDisplay = this.canvasLayerRef.instance.display;
        const left = (canvasWidth - this.props.bugWidth) / 2;
        const top = canvasHeight - radius;
        const middle = canvasWidth / 2;
        const right = left + this.props.bugWidth;
        const bottom = top + this.props.bugHeight;
        canvasLayerDisplay.context.beginPath();
        canvasLayerDisplay.context.moveTo(left, top);
        canvasLayerDisplay.context.lineTo(middle - this.props.bugNotchWidth / 2, top);
        canvasLayerDisplay.context.lineTo(middle, top + this.props.bugNotchHeight);
        canvasLayerDisplay.context.lineTo(middle + this.props.bugNotchWidth / 2, top);
        canvasLayerDisplay.context.lineTo(right, top);
        canvasLayerDisplay.context.lineTo(right, bottom);
        canvasLayerDisplay.context.lineTo(left, bottom);
        canvasLayerDisplay.context.closePath();
        canvasLayerDisplay.context.fillStyle = MapRangeCompassSelectedHeading.COLOR;
        canvasLayerDisplay.context.lineWidth = this.props.outlineWidth * 2;
        canvasLayerDisplay.context.strokeStyle = MapRangeCompassSelectedHeading.OUTLINE_COLOR;
        canvasLayerDisplay.context.setLineDash(MapRangeCompassSelectedHeading.NO_LINE_DASH);
        canvasLayerDisplay.context.stroke();
        canvasLayerDisplay.context.fill();
    }
    /**
     * Rotates the canvas.
     */
    rotate() {
        const compassRotation = this.props.compassRotationSubject.get();
        const rotation = this.selectedHeading * Avionics.Utils.DEG2RAD + compassRotation;
        const canvasLayerDisplay = this.canvasLayerRef.instance.display;
        canvasLayerDisplay.canvas.style.transform = `rotate(${rotation}rad)`;
        this.needRotate = false;
    }
    /**
     * Suppresses this indicator, making it invisible. Also kills the suppress timer if it is running.
     */
    suppress() {
        this.killSuppressTimer();
        this.isSuppressedSubject.set(true);
    }
    /**
     * Unsuppresses this indicator, making it visible, for a certain duration. If the suppress timer is currently
     * running, it is killed and replaced with a new one which will fire after the specified duration.
     * @param duration The duration for which to unsuppress, in milliseconds.
     */
    unsuppress(duration) {
        this.killSuppressTimer();
        this.isSuppressedSubject.set(false);
        this.suppressTimer = setTimeout(this.suppressCallback, duration);
    }
    /**
     * Kills the timer to suppress this indicator, if one is currently running.
     */
    killSuppressTimer() {
        if (this.suppressTimer !== null) {
            clearTimeout(this.suppressTimer);
        }
    }
    /**
     * Updates this indicator based on whether it should be suppressed.
     * @param isSuppressed Whether this indicator should be suppressed.
     */
    updateFromIsSuppressed(isSuppressed) {
        this.updateCanvasVisibility(isSuppressed, this.isOOBSubject.get());
    }
    /**
     * Updates this indicator based on whether it is out of the current compass bounds.
     * @param isOOB Whether this indicator is out of the current compass bounds.
     */
    updateFromIsOOB(isOOB) {
        this.updateCanvasVisibility(this.isSuppressedSubject.get(), isOOB);
    }
    /**
     * Updates the visibility of the canvas.
     * @param isSuppressed Whether this indicator is suppressed.
     * @param isOOB Whether this indicator is out of the current compass bounds.
     */
    updateCanvasVisibility(isSuppressed, isOOB) {
        this.canvasLayerRef.instance.setVisible(!isOOB && !isSuppressed);
    }
    /**
     * Updates this indicator's center, radius, and rotation.
     */
    updateParameters() {
        const compassRotation = this.props.compassRotationSubject.get();
        const compassCenter = -compassRotation * Avionics.Utils.RAD2DEG;
        const isOOB = Math.abs(NavMath.diffAngle(this.selectedHeading, compassCenter)) > MapRangeCompassLayer.ARC_ANGULAR_WIDTH / 2;
        this.isOOBSubject.set(isOOB);
        if (!this.canvasLayerRef.instance.isVisible()) {
            return;
        }
        const center = this.props.compassCenterSubject.get();
        const radius = this.props.compassRadiusSubject.get();
        const rotation = compassRotation + this.selectedHeading * Avionics.Utils.DEG2RAD;
        this.centerSubject.set(center);
        this.radiusSubject.set(radius);
        this.rotationSubject.set(rotation);
    }
    /**
     * A callback which is called when the center of the compass changes.
     * @param center The new center of the compass, in pixels.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onCenterChanged(center) {
        this.needReposition = true;
    }
    /**
     * A callback which is called when the center of the compass changes.
     * @param radius The new radius of the compass, in pixels.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onRadiusChanged(radius) {
        this.needRedraw = true;
    }
    /**
     * A callback which is called when the rotation of the compass changes.
     * @param angle The new rotation angle of the compass, in radians.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onRotationChanged(angle) {
        this.needRotate = true;
    }
    /**
     * A callback which is called when whether this indicator is suppressed has changed.
     * @param isSuppressed Whether this indicator is suppressed.
     */
    onIsSuppressedChanged(isSuppressed) {
        this.updateFromIsSuppressed(isSuppressed);
    }
    /**
     * A callback which is called when whether this indicator is out of the current compass bounds has changed.
     * @param isOOB Whether this indicator is out of the current compass bounds.
     */
    onIsOOBChanged(isOOB) {
        this.updateFromIsOOB(isOOB);
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent(MapCanvasLayer, { ref: this.canvasLayerRef, model: this.props.model, mapProjection: this.props.mapProjection }));
    }
}
/** The amount of time, in milliseconds, the indicator is unsuppressed when the selected heading is changed. */
MapRangeCompassSelectedHeading.UNSUPPRESS_DURATION = 3000;
/** The color of the bug and line. */
MapRangeCompassSelectedHeading.COLOR = 'cyan';
/** The outline color of the bug. */
MapRangeCompassSelectedHeading.OUTLINE_COLOR = 'black';
MapRangeCompassSelectedHeading.NO_LINE_DASH = [];
