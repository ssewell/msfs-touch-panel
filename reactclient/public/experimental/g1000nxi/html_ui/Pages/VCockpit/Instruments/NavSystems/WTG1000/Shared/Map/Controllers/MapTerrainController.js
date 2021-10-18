import { MapTerrainMode } from '../Modules/MapTerrainModule';
import { MapTerrainSettingMode } from '../MapUserSettings';
/**
 * Controls the terrain mode and terrain scale of a map.
 */
export class MapTerrainController {
    /**
     * Constructor.
     * @param mapModel The model of the map associated with this controller.
     * @param settingManager This controller's map settings manager.
     * @param allowRelative Whether this controller allows relative terrain colors to be displayed.
     */
    constructor(mapModel, settingManager, allowRelative = true) {
        this.settingManager = settingManager;
        this.allowRelative = allowRelative;
        this.modeSettingConsumer = null;
        this.rangeIndexSettingConsumer = null;
        this.showScaleSettingConsumer = null;
        this.colorsHandler = this.updateColors.bind(this);
        this.showScaleHandler = this.updateShowScale.bind(this);
        this.isInit = false;
        this.rangeModule = mapModel.getModule('range');
        this.ownAirplaneModule = mapModel.getModule('ownAirplaneProps');
        this.terrainModule = mapModel.getModule('terrain');
        this.modeSetting = settingManager.getSetting('mapTerrainMode');
        this.rangeIndexSetting = settingManager.getSetting('mapTerrainRangeIndex');
        this.showScaleSetting = settingManager.getSetting('mapTerrainScaleShow');
    }
    /**
     * Initializes this controller. Once initialized, this controller will automatically update the map terrain mode and scale.
     */
    init() {
        if (this.isInit) {
            return;
        }
        this.modeSettingConsumer = this.settingManager.whenSettingChanged(this.modeSetting.definition.name);
        this.rangeIndexSettingConsumer = this.settingManager.whenSettingChanged(this.rangeIndexSetting.definition.name);
        this.showScaleSettingConsumer = this.settingManager.whenSettingChanged(this.showScaleSetting.definition.name);
        this.modeSettingConsumer.handle(this.colorsHandler);
        this.rangeIndexSettingConsumer.handle(this.colorsHandler);
        this.rangeModule.nominalRangeIndex.sub(this.colorsHandler, true);
        this.ownAirplaneModule.isOnGround.sub(this.colorsHandler, true);
        this.showScaleSettingConsumer.handle(this.showScaleHandler);
        this.isInit = true;
    }
    /**
     * Updates the terrain mode.
     */
    updateColors() {
        let mode = MapTerrainMode.None;
        if (this.rangeModule.nominalRangeIndex.get() <= this.rangeIndexSetting.value) {
            switch (this.modeSetting.value) {
                case MapTerrainSettingMode.Absolute:
                    mode = MapTerrainMode.Absolute;
                    break;
                case MapTerrainSettingMode.Relative:
                    if (this.allowRelative && !this.ownAirplaneModule.isOnGround.get()) {
                        mode = MapTerrainMode.Relative;
                    }
                    break;
            }
        }
        this.terrainModule.terrainMode.set(mode);
    }
    /**
     * Updates whether to show the terrain scale.
     * @param show Whether to show the terrain scale.
     */
    updateShowScale(show) {
        this.terrainModule.showScale.set(show);
    }
    /**
     * Destroys this controller, freeing up resources associated with it. Once destroyed, this controller will no longer
     * automatically update the map terrain mode and scale.
     */
    destroy() {
        var _a, _b, _c;
        (_a = this.modeSettingConsumer) === null || _a === void 0 ? void 0 : _a.off(this.colorsHandler);
        (_b = this.rangeIndexSettingConsumer) === null || _b === void 0 ? void 0 : _b.off(this.colorsHandler);
        this.rangeModule.nominalRangeIndex.unsub(this.colorsHandler);
        this.ownAirplaneModule.isOnGround.unsub(this.colorsHandler);
        (_c = this.showScaleSettingConsumer) === null || _c === void 0 ? void 0 : _c.off(this.showScaleHandler);
        this.modeSettingConsumer = null;
        this.rangeIndexSettingConsumer = null;
        this.showScaleSettingConsumer = null;
    }
}
