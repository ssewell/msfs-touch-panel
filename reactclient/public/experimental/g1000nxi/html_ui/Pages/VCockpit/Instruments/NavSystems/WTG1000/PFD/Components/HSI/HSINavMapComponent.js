import { FSComponent, UnitType } from 'msfssdk';
import { MapDetailIndicator } from '../../../Shared/Map/Indicators/MapDetailIndicator';
import { NavMapComponent, NavMapRangeTargetRotationController } from '../../../Shared/UI/NavMap/NavMapComponent';
/**
 * The PFD HSI map.
 */
export class HSINavMapComponent extends NavMapComponent {
    // eslint-disable-next-line jsdoc/require-jsdoc
    createRangeTargetRotationController() {
        return new HSINavMapRangeTargetRotationController(this.props.model, this.mapProjection, this.deadZone, NavMapRangeTargetRotationController.DEFAULT_MAP_RANGES, this.props.settingManager, this.rangeSettingManager, 'pfdMapRangeIndex', this.pointerBoundsSub);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    renderIndicatorGroups() {
        return [
            this.renderBottomLeftIndicatorGroup(),
            this.renderBottomCenterIndicatorGroup()
        ];
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    renderBottomLeftIndicators() {
        return [
            this.renderDetailIndicator(),
            this.renderRangeIndicator()
        ];
    }
    /**
     * Renders the bottom-left indicator group.
     * @returns the bottom-left indicator group.
     */
    renderBottomCenterIndicatorGroup() {
        return (FSComponent.buildComponent("div", { class: 'hsimap-indicators-bottom-center' },
            this.renderTrafficOffScaleIndicator(),
            this.renderTrafficStatusIndicator(false)));
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    renderOrientationDisplayLayer() {
        return null;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    renderMiniCompassLayer() {
        return null;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    renderRangeRingLayer() {
        return null;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    renderRangeCompassLayer() {
        return null;
    }
    /** @inheritdoc */
    renderPointerInfoLayer() {
        return null;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    renderDetailIndicator() {
        return (FSComponent.buildComponent(MapDetailIndicator, { declutterMode: this.props.model.getModule('declutter').mode, showTitle: false }));
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    renderTerrainScaleIndicator() {
        return null;
    }
}
/**
 * A controller for handling map range, target, and rotation changes for the MFD navigation map.
 */
class HSINavMapRangeTargetRotationController extends NavMapRangeTargetRotationController {
    // eslint-disable-next-line jsdoc/require-jsdoc
    convertToTrueRange(nominalRange) {
        const projectedHeight = this.mapProjection.getProjectedSize()[1];
        const correctedHeight = projectedHeight - this.deadZone[1] - this.deadZone[3];
        return nominalRange.asUnit(UnitType.GA_RADIAN) * projectedHeight / correctedHeight * 2;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    getDesiredTargetOffset() {
        return HSINavMapRangeTargetRotationController.TARGET_OFFSET;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    updateOrientation() {
        // noop
    }
}
HSINavMapRangeTargetRotationController.TARGET_OFFSET = new Float64Array(2);
