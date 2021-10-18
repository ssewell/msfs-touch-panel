/**
 * Controls the visibility of a specific type of map symbol whose visibility is dependent on its own show and maximum
 * range index settings as well as the global map declutter setting.
 */
export class MapSymbolVisController {
    /**
     * Constructor.
     * @param rangeModule The range module of the map associated with this controller.
     * @param declutterModule The declutter module of the map associated with this controller.
     * @param settingManager This controller's map settings manager.
     * @param showSettingName The name of the show setting associated with this controller.
     * @param rangeIndexSettingName The name of the range index setting associated with this controller.
     * @param declutterLevel The highest global declutter level at which the symbol controlled by this controller remains
     * visible.
     * @param setVisibilityFunc A function which sets the visibility of the symbol controlled by this controller.
     */
    constructor(rangeModule, declutterModule, settingManager, showSettingName, rangeIndexSettingName, declutterLevel, setVisibilityFunc) {
        this.rangeModule = rangeModule;
        this.declutterModule = declutterModule;
        this.settingManager = settingManager;
        this.declutterLevel = declutterLevel;
        this.setVisibilityFunc = setVisibilityFunc;
        this.showSettingConsumer = null;
        this.rangeIndexSettingConsumer = null;
        this.handler = this.updateVisibility.bind(this);
        this.isInit = false;
        this.showSetting = settingManager.getSetting(showSettingName);
        this.rangeIndexSetting = settingManager.getSetting(rangeIndexSettingName);
    }
    /**
     * Initializes this controller. Once initialized, this controller will automatically adjust the visibility of its
     * associated map symbol.
     */
    init() {
        if (this.isInit) {
            return;
        }
        this.showSettingConsumer = this.settingManager.whenSettingChanged(this.showSetting.definition.name);
        this.rangeIndexSettingConsumer = this.settingManager.whenSettingChanged(this.rangeIndexSetting.definition.name);
        this.showSettingConsumer.handle(this.handler);
        this.rangeIndexSettingConsumer.handle(this.handler);
        this.rangeModule.nominalRangeIndex.sub(this.handler);
        this.declutterModule.mode.sub(this.handler, true);
        this.isInit = true;
    }
    /**
     * Updates the visibility of this controller's associated map symbol.
     */
    updateVisibility() {
        let show = false;
        if (this.showSetting.value && this.declutterModule.mode.get() <= this.declutterLevel) {
            show = this.rangeModule.nominalRangeIndex.get() <= this.rangeIndexSetting.value;
        }
        this.setVisibilityFunc(show);
    }
    /**
     * Destroys this controller, freeing up resources associated with it. Once destroyed, this controller will no longer
     * automatically adjust the visibility of its associated map symbol.
     */
    destroy() {
        var _a, _b;
        (_a = this.showSettingConsumer) === null || _a === void 0 ? void 0 : _a.off(this.handler);
        (_b = this.rangeIndexSettingConsumer) === null || _b === void 0 ? void 0 : _b.off(this.handler);
        this.rangeModule.nominalRangeIndex.unsub(this.handler);
        this.declutterModule.mode.unsub(this.handler);
        this.showSettingConsumer = null;
        this.rangeIndexSettingConsumer = null;
    }
}
