import { UnitType } from 'msfssdk';
import { TrafficMapComponent, TrafficMapRangeTargetRotationController } from '../../../../Shared/UI/TrafficMap/TrafficMapComponent';
/**
 * A MFD traffic map component.
 */
export class MFDTrafficMapComponent extends TrafficMapComponent {
    // eslint-disable-next-line jsdoc/require-jsdoc
    createRangeTargetRotationController() {
        return new MFDTrafficMapRangeTargetRotationController(this.props.model, this.mapProjection, TrafficMapRangeTargetRotationController.DEFAULT_RANGES, this.rangeSettingManager, 'mfdMapRangeIndex');
    }
}
/**
 * A controller for handling map range, target, and rotation changes.
 */
class MFDTrafficMapRangeTargetRotationController extends TrafficMapRangeTargetRotationController {
    // eslint-disable-next-line jsdoc/require-jsdoc
    convertToTrueRange(nominalRange) {
        return nominalRange.asUnit(UnitType.GA_RADIAN) / 0.45;
    }
}
