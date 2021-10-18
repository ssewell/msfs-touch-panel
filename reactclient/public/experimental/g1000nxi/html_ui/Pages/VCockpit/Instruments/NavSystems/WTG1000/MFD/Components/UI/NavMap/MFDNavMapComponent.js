import { FSComponent, UnitType, Vec2Math } from 'msfssdk';
import { MapMiniCompassLayer } from '../../../../Shared/Map/Layers/MapMiniCompassLayer';
import { MapRangeCompassLayer } from '../../../../Shared/Map/Layers/MapRangeCompassLayer';
import { MapRangeRingLayer } from '../../../../Shared/Map/Layers/MapRangeRingLayer';
import { MapTerrainScaleIndicator } from '../../../../Shared/Map/Indicators/MapTerrainScaleIndicator';
import { MapOrientation } from '../../../../Shared/Map/Modules/MapOrientationModule';
import { NavMapComponent, NavMapRangeTargetRotationController } from '../../../../Shared/UI/NavMap/NavMapComponent';
import { MapPointerInfoLayer, MapPointerInfoLayerSize } from '../../../../Shared/Map/Layers/MapPointerInfoLayer';
/**
 * The MFD navigation map.
 */
export class MFDNavMapComponent extends NavMapComponent {
    constructor() {
        super(...arguments);
        this.miniCompassLayerRef = FSComponent.createRef();
        this.rangeRingLayerRef = FSComponent.createRef();
        this.rangeCompassLayerRef = FSComponent.createRef();
        this.pointerInfoLayerRef = FSComponent.createRef();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    createRangeTargetRotationController() {
        return new MFDNavMapRangeTargetRotationController(this.props.model, this.mapProjection, this.deadZone, NavMapRangeTargetRotationController.DEFAULT_MAP_RANGES, this.props.settingManager, this.rangeSettingManager, 'mfdMapRangeIndex', this.pointerBoundsSub);
    }
    /** @inheritdoc */
    initLayers() {
        super.initLayers();
        this.attachLayer(this.miniCompassLayerRef.instance);
        this.attachLayer(this.rangeRingLayerRef.instance);
        this.attachLayer(this.rangeCompassLayerRef.instance);
        this.attachLayer(this.pointerInfoLayerRef.instance);
    }
    /** @inheritdoc */
    renderRangeDisplayLayer() {
        return null;
    }
    /** @inheritdoc */
    renderMiniCompassLayer() {
        return (FSComponent.buildComponent(MapMiniCompassLayer, { ref: this.miniCompassLayerRef, class: 'minicompass-layer', model: this.props.model, mapProjection: this.mapProjection, imgSrc: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/map_mini_compass.png' }));
    }
    /** @inheritdoc */
    renderRangeRingLayer() {
        return (FSComponent.buildComponent(MapRangeRingLayer, { ref: this.rangeRingLayerRef, model: this.props.model, mapProjection: this.mapProjection, showLabel: true, strokeWidth: 2, strokeStyle: 'white' }));
    }
    /** @inheritdoc */
    renderRangeCompassLayer() {
        return (FSComponent.buildComponent(MapRangeCompassLayer, { ref: this.rangeCompassLayerRef, model: this.props.model, mapProjection: this.mapProjection, bus: this.props.bus, showLabel: true, showHeadingBug: this.props.model.getModule('pointer').isActive.map(isActive => !isActive), arcStrokeWidth: 2, arcEndTickLength: 10, referenceArrowWidth: 15, referenceArrowHeight: 20, referenceTickWidth: 2, referenceTickHeight: 5, bearingTickMajorLength: 10, bearingTickMinorLength: 5, bearingLabelFont: 'Roboto-Bold', bearingLabelFontSize: 20, bearingLabelOutlineWidth: 6, bearingLabelRadialOffset: 0, headingBugWidth: 20, headingBugHeight: 10 }));
    }
    /** @inheritdoc */
    renderPointerInfoLayer() {
        return (FSComponent.buildComponent(MapPointerInfoLayer, { ref: this.pointerInfoLayerRef, model: this.props.model, mapProjection: this.mapProjection, size: MapPointerInfoLayerSize.Full }));
    }
    /** @inheritdoc */
    renderTerrainScaleIndicator() {
        const terrainModule = this.props.model.getModule('terrain');
        return (FSComponent.buildComponent(MapTerrainScaleIndicator, { show: terrainModule.showScale, terrainMode: terrainModule.terrainMode }));
    }
}
/**
 * A controller for handling map range, target, and rotation changes for the MFD navigation map.
 */
class MFDNavMapRangeTargetRotationController extends NavMapRangeTargetRotationController {
    // eslint-disable-next-line jsdoc/require-jsdoc
    convertToTrueRange(nominalRange) {
        const projectedHeight = this.mapProjection.getProjectedSize()[1];
        const correctedHeight = projectedHeight - this.deadZone[1] - this.deadZone[3];
        const orientation = this.mapModel.getModule('orientation').orientation.get();
        const factor = orientation === MapOrientation.NorthUp ? 4 : 3;
        return nominalRange.asUnit(UnitType.GA_RADIAN) * projectedHeight / correctedHeight * factor;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    getDesiredTargetOffset() {
        const trueCenterOffsetX = (this.deadZone[0] - this.deadZone[2]) / 2;
        const trueCenterOffsetY = (this.deadZone[1] - this.deadZone[3]) / 2;
        const projectedSize = this.mapProjection.getProjectedSize();
        const relativeOffset = this.mapModel.getModule('orientation').orientation.get() === MapOrientation.NorthUp
            ? MFDNavMapRangeTargetRotationController.NORTH_UP_TARGET_OFFSET_REL
            : MFDNavMapRangeTargetRotationController.HDG_TRK_UP_TARGET_OFFSET_REL;
        return Vec2Math.set(relativeOffset[0] * projectedSize[0] + trueCenterOffsetX, relativeOffset[1] * projectedSize[1] + trueCenterOffsetY, MFDNavMapRangeTargetRotationController.tempVec2_1);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    updateModules() {
        super.updateModules();
        const isNorthUp = this.mapModel.getModule('orientation').orientation.get() === MapOrientation.NorthUp;
        this.mapModel.getModule('rangeRing').show.set(isNorthUp);
        this.mapModel.getModule('rangeCompass').show.set(!isNorthUp);
    }
}
MFDNavMapRangeTargetRotationController.NORTH_UP_TARGET_OFFSET_REL = new Float64Array(2);
MFDNavMapRangeTargetRotationController.HDG_TRK_UP_TARGET_OFFSET_REL = new Float64Array([0, 1 / 6]);
MFDNavMapRangeTargetRotationController.tempVec2_1 = new Float64Array(2);
