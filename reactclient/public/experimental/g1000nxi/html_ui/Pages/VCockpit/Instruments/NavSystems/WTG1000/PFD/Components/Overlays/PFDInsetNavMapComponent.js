import { FSComponent, Subject, UnitType, Vec2Math } from 'msfssdk';
import { MapMiniCompassLayer } from '../../../Shared/Map/Layers/MapMiniCompassLayer';
import { MapRangeCompassLayer } from '../../../Shared/Map/Layers/MapRangeCompassLayer';
import { MapRangeRingLayer } from '../../../Shared/Map/Layers/MapRangeRingLayer';
import { MapDetailIndicator } from '../../../Shared/Map/Indicators/MapDetailIndicator';
import { MapOrientation } from '../../../Shared/Map/Modules/MapOrientationModule';
import { NavMapComponent, NavMapRangeTargetRotationController } from '../../../Shared/UI/NavMap/NavMapComponent';
import { MapPointerInfoLayer, MapPointerInfoLayerSize } from '../../../Shared/Map/Layers/MapPointerInfoLayer';
/**
 * The PFD inset navigation map.
 */
export class PFDInsetNavMapComponent extends NavMapComponent {
    constructor() {
        super(...arguments);
        this.miniCompassLayerRef = FSComponent.createRef();
        this.rangeRingLayerRef = FSComponent.createRef();
        this.rangeCompassLayerRef = FSComponent.createRef();
        this.pointerInfoLayerRef = FSComponent.createRef();
    }
    /** @inheritdoc */
    createRangeTargetRotationController() {
        return new PFDInsetNavMapRangeTargetRotationController(this.props.model, this.mapProjection, this.deadZone, NavMapRangeTargetRotationController.DEFAULT_MAP_RANGES, this.props.settingManager, this.rangeSettingManager, 'pfdMapRangeIndex', this.pointerBoundsSub);
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
    updatePointerBounds() {
        const size = this.mapProjection.getProjectedSize();
        const minX = this.deadZone[0];
        const minY = this.deadZone[1];
        const maxX = size[0] - this.deadZone[2];
        const maxY = size[1] - this.deadZone[3];
        const width = maxX - minX;
        const height = maxY - minY;
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        this.pointerBoundsSub.set(Math.min(centerX, minX + width * 0.2), Math.min(centerY, minY + height * 0.2), Math.max(centerX, maxX - height * 0.4), Math.max(centerY, maxY - height * 0.2));
    }
    /** @inheritdoc */
    renderTopLeftIndicators() {
        return [
            this.renderOrientationIndicator(),
            this.renderRangeIndicator()
        ];
    }
    /** @inheritdoc */
    renderMiniCompassLayer() {
        return (FSComponent.buildComponent(MapMiniCompassLayer, { ref: this.miniCompassLayerRef, class: 'minicompass-layer', model: this.props.model, mapProjection: this.mapProjection, imgSrc: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/map_mini_compass.png' }));
    }
    /** @inheritdoc */
    renderRangeRingLayer() {
        return (FSComponent.buildComponent(MapRangeRingLayer, { ref: this.rangeRingLayerRef, model: this.props.model, mapProjection: this.mapProjection, showLabel: false, strokeWidth: 2, strokeStyle: 'white' }));
    }
    /** @inheritdoc */
    renderRangeCompassLayer() {
        return (FSComponent.buildComponent(MapRangeCompassLayer, { ref: this.rangeCompassLayerRef, model: this.props.model, mapProjection: this.mapProjection, bus: this.props.bus, showLabel: false, showHeadingBug: Subject.create(false), arcStrokeWidth: 2, arcEndTickLength: 5, referenceTickWidth: 2, referenceTickHeight: 5, bearingTickMajorLength: 10, bearingTickMinorLength: 5, bearingLabelFont: 'Roboto-Bold', bearingLabelFontSize: 20, bearingLabelOutlineWidth: 6, bearingLabelRadialOffset: 0 }));
    }
    /** @inheritdoc */
    renderPointerInfoLayer() {
        return (FSComponent.buildComponent(MapPointerInfoLayer, { ref: this.pointerInfoLayerRef, model: this.props.model, mapProjection: this.mapProjection, size: MapPointerInfoLayerSize.Small }));
    }
    /** @inheritdoc */
    renderTerrainScaleIndicator() {
        return null;
    }
    /** @inheritdoc */
    renderDetailIndicator() {
        return (FSComponent.buildComponent(MapDetailIndicator, { declutterMode: this.props.model.getModule('declutter').mode, showTitle: false }));
    }
}
/**
 * A controller for handling map range, target, and rotation changes for the MFD navigation map.
 */
class PFDInsetNavMapRangeTargetRotationController extends NavMapRangeTargetRotationController {
    /** @inheritdoc */
    convertToTrueRange(nominalRange) {
        const projectedHeight = this.mapProjection.getProjectedSize()[1];
        const correctedHeight = projectedHeight - this.deadZone[1] - this.deadZone[3];
        const orientation = this.orientationModule.orientation.get();
        const factor = orientation === MapOrientation.NorthUp ? 2.5 : 2;
        return nominalRange.asUnit(UnitType.GA_RADIAN) * projectedHeight / correctedHeight * factor;
    }
    /** @inheritdoc */
    getDesiredTargetOffset() {
        const trueCenterOffsetX = (this.deadZone[0] - this.deadZone[2]) / 2;
        const trueCenterOffsetY = (this.deadZone[1] - this.deadZone[3]) / 2;
        const projectedSize = this.mapProjection.getProjectedSize();
        const relativeOffset = this.orientationModule.orientation.get() === MapOrientation.NorthUp
            ? PFDInsetNavMapRangeTargetRotationController.NORTH_UP_TARGET_OFFSET_REL
            : PFDInsetNavMapRangeTargetRotationController.HDG_TRK_UP_TARGET_OFFSET_REL;
        return Vec2Math.set(relativeOffset[0] * projectedSize[0] + trueCenterOffsetX, relativeOffset[1] * projectedSize[1] + trueCenterOffsetY, PFDInsetNavMapRangeTargetRotationController.tempVec2_1);
    }
    /** @inheritdoc */
    updateModules() {
        super.updateModules();
        const isNorthUp = this.mapModel.getModule('orientation').orientation.get() === MapOrientation.NorthUp;
        this.mapModel.getModule('rangeRing').show.set(isNorthUp);
        this.mapModel.getModule('rangeCompass').show.set(!isNorthUp);
    }
}
PFDInsetNavMapRangeTargetRotationController.NORTH_UP_TARGET_OFFSET_REL = new Float64Array(2);
PFDInsetNavMapRangeTargetRotationController.HDG_TRK_UP_TARGET_OFFSET_REL = new Float64Array([0, 1 / 6]);
PFDInsetNavMapRangeTargetRotationController.tempVec2_1 = new Float64Array(2);
