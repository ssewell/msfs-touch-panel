import { MapTrafficController } from '../../Map/Controllers/MapTrafficController';
/**
 * Controls the display of traffic on a navigation map.
 */
export class NavMapTrafficController extends MapTrafficController {
    /**
     * Constructor.
     * @param mapModel The model of the map associated with this controller.
     * @param trafficSettingManager This controller's traffic settings manager.
     * @param mapSettingManager This controller's map settings manager.
     */
    constructor(mapModel, trafficSettingManager, mapSettingManager) {
        super(mapModel, trafficSettingManager);
        this.mapSettingManager = mapSettingManager;
        this.showSettingConsumer = null;
        this.rangeIndexSettingConsumer = null;
        this.labelShowSettingConsumer = null;
        this.labelRangeIndexSettingConsumer = null;
        this.alertLevelModeSettingConsumer = null;
        this.showHandler = this.updateShow.bind(this);
        this.showLabelHandler = this.updateShowLabel.bind(this);
        this.alertLevelModeHandler = this.updateAlertLevelMode.bind(this);
        this.rangeModule = mapModel.getModule('range');
        this.showSetting = mapSettingManager.getSetting('mapTrafficShow');
        this.rangeIndexSetting = mapSettingManager.getSetting('mapTrafficRangeIndex');
        this.labelShowSetting = mapSettingManager.getSetting('mapTrafficLabelShow');
        this.labelRangeIndexSetting = mapSettingManager.getSetting('mapTrafficLabelRangeIndex');
        this.alertLevelModeSetting = mapSettingManager.getSetting('mapTrafficAlertLevelMode');
    }
    /**
     * Initializes this controller. Once initialized, this controller will automatically update the map traffic module.
     */
    init() {
        if (this.isInit) {
            return;
        }
        super.init();
        this.showSettingConsumer = this.mapSettingManager.whenSettingChanged(this.showSetting.definition.name);
        this.rangeIndexSettingConsumer = this.mapSettingManager.whenSettingChanged(this.rangeIndexSetting.definition.name);
        this.labelShowSettingConsumer = this.mapSettingManager.whenSettingChanged(this.labelShowSetting.definition.name);
        this.labelRangeIndexSettingConsumer = this.mapSettingManager.whenSettingChanged(this.labelRangeIndexSetting.definition.name);
        this.alertLevelModeSettingConsumer = this.mapSettingManager.whenSettingChanged(this.alertLevelModeSetting.definition.name);
        this.showSettingConsumer.handle(this.showHandler);
        this.rangeIndexSettingConsumer.handle(this.showHandler);
        this.rangeModule.nominalRangeIndex.sub(this.showHandler, true);
        this.labelShowSettingConsumer.handle(this.showLabelHandler);
        this.labelRangeIndexSettingConsumer.handle(this.showLabelHandler);
        this.rangeModule.nominalRangeIndex.sub(this.showLabelHandler, true);
        this.alertLevelModeSettingConsumer.handle(this.alertLevelModeHandler);
    }
    /**
     * Updates whether to show traffic.
     */
    updateShow() {
        this.trafficModule.show.set(this.showSetting.value && this.rangeModule.nominalRangeIndex.get() <= this.rangeIndexSetting.value);
    }
    /**
     * Updates whether to show traffic intruder labels.
     */
    updateShowLabel() {
        this.trafficModule.showIntruderLabel.set(this.labelShowSetting.value && this.rangeModule.nominalRangeIndex.get() <= this.labelRangeIndexSetting.value);
    }
    /**
     * Updates the traffic alert level mode.
     * @param mode The new alert level mode.
     */
    updateAlertLevelMode(mode) {
        this.trafficModule.alertLevelMode.set(mode);
    }
    /**
     * Destroys this controller, freeing up resources associated with it. Once destroyed, this controller will no longer
     * automatically update the map traffic module.
     */
    destroy() {
        var _a, _b, _c, _d, _e;
        super.destroy();
        (_a = this.showSettingConsumer) === null || _a === void 0 ? void 0 : _a.handle(this.showHandler);
        (_b = this.rangeIndexSettingConsumer) === null || _b === void 0 ? void 0 : _b.handle(this.showHandler);
        this.rangeModule.nominalRangeIndex.unsub(this.showHandler);
        (_c = this.labelShowSettingConsumer) === null || _c === void 0 ? void 0 : _c.handle(this.showLabelHandler);
        (_d = this.labelRangeIndexSettingConsumer) === null || _d === void 0 ? void 0 : _d.handle(this.showLabelHandler);
        this.rangeModule.nominalRangeIndex.unsub(this.showLabelHandler);
        (_e = this.alertLevelModeSettingConsumer) === null || _e === void 0 ? void 0 : _e.handle(this.alertLevelModeHandler);
        this.showSettingConsumer = null;
        this.rangeIndexSettingConsumer = null;
        this.labelShowSettingConsumer = null;
        this.labelRangeIndexSettingConsumer = null;
        this.alertLevelModeSettingConsumer = null;
    }
}
