import { UnitType } from 'msfssdk';
import { MapTrafficAltitudeRestrictionMode, MapTrafficMotionVectorMode } from '../Modules/MapTrafficModule';
import { TrafficAltitudeModeSetting, TrafficMotionVectorModeSetting } from '../../Traffic/TrafficUserSettings';
/**
 * Controls the display of traffic on a map.
 */
export class MapTrafficController {
    /**
     * Constructor.
     * @param mapModel The model of the map associated with this controller.
     * @param settingManager This controller's traffic settings manager.
     */
    constructor(mapModel, settingManager) {
        this.settingManager = settingManager;
        this.altitudeModeSettingConsumer = null;
        this.motionVectorModeSettingConsumer = null;
        this.motionVectorLookaheadSettingConsumer = null;
        this.altitudeModeHandler = this.updateAltitudeMode.bind(this);
        this.motionVectorModeHandler = this.updateMotionVectorMode.bind(this);
        this.motionVectorLookaheadHandler = this.updateMotionVectorLookahead.bind(this);
        this.isInit = false;
        this.trafficModule = mapModel.getModule('traffic');
        this.altitudeModeSetting = settingManager.getSetting('trafficAltitudeMode');
        this.motionVectorModeSetting = settingManager.getSetting('trafficMotionVectorMode');
        this.motionVectorLookaheadSetting = settingManager.getSetting('trafficMotionVectorLookahead');
    }
    /**
     * Initializes this controller. Once initialized, this controller will automatically update the map traffic module.
     */
    init() {
        if (this.isInit) {
            return;
        }
        this.altitudeModeSettingConsumer = this.settingManager.whenSettingChanged(this.altitudeModeSetting.definition.name);
        this.motionVectorModeSettingConsumer = this.settingManager.whenSettingChanged(this.motionVectorModeSetting.definition.name);
        this.motionVectorLookaheadSettingConsumer = this.settingManager.whenSettingChanged(this.motionVectorLookaheadSetting.definition.name);
        this.altitudeModeSettingConsumer.handle(this.altitudeModeHandler);
        this.motionVectorModeSettingConsumer.handle(this.motionVectorModeHandler);
        this.motionVectorLookaheadSettingConsumer.handle(this.motionVectorLookaheadHandler);
    }
    /**
     * Updates the traffic altitude restriction mode.
     */
    updateAltitudeMode() {
        this.trafficModule.altitudeRestrictionMode.set(MapTrafficController.ALT_MODE_MAP[this.altitudeModeSetting.value]);
    }
    /**
     * Updates the traffic motion vector mode.
     */
    updateMotionVectorMode() {
        this.trafficModule.motionVectorMode.set(MapTrafficController.MOTION_VECTOR_MODE_MAP[this.motionVectorModeSetting.value]);
    }
    /**
     * Updates the traffic motion vector lookahead time.
     */
    updateMotionVectorLookahead() {
        this.trafficModule.motionVectorLookahead.set(this.motionVectorLookaheadSetting.value, UnitType.SECOND);
    }
    /**
     * Destroys this controller, freeing up resources associated with it. Once destroyed, this controller will no longer
     * automatically update the map traffic module.
     */
    destroy() {
        var _a, _b, _c;
        (_a = this.altitudeModeSettingConsumer) === null || _a === void 0 ? void 0 : _a.handle(this.altitudeModeHandler);
        (_b = this.motionVectorModeSettingConsumer) === null || _b === void 0 ? void 0 : _b.handle(this.altitudeModeHandler);
        (_c = this.motionVectorLookaheadSettingConsumer) === null || _c === void 0 ? void 0 : _c.handle(this.motionVectorLookaheadHandler);
        this.altitudeModeSettingConsumer = null;
        this.motionVectorModeSettingConsumer = null;
        this.motionVectorLookaheadSettingConsumer = null;
    }
}
MapTrafficController.ALT_MODE_MAP = {
    [TrafficAltitudeModeSetting.Above]: MapTrafficAltitudeRestrictionMode.Above,
    [TrafficAltitudeModeSetting.Below]: MapTrafficAltitudeRestrictionMode.Below,
    [TrafficAltitudeModeSetting.Normal]: MapTrafficAltitudeRestrictionMode.Normal,
    [TrafficAltitudeModeSetting.Unrestricted]: MapTrafficAltitudeRestrictionMode.Unrestricted
};
MapTrafficController.MOTION_VECTOR_MODE_MAP = {
    [TrafficMotionVectorModeSetting.Off]: MapTrafficMotionVectorMode.Off,
    [TrafficMotionVectorModeSetting.Absolute]: MapTrafficMotionVectorMode.Absolute,
    [TrafficMotionVectorModeSetting.Relative]: MapTrafficMotionVectorMode.Relative
};
