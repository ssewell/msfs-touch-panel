import { MapDeclutterMode } from '../Modules/MapDeclutterModule';
import { MapDeclutterSettingMode } from '../MapUserSettings';
/**
 * Controls the declutter mode of a map.
 */
export class MapDeclutterController {
    /**
     * Creates an instance of the MapDeclutterController.
     * @param declutterModule The declutter module of the map associated with this controller.
     * @param settingManager The user settings manager for map settings.
     */
    constructor(declutterModule, settingManager) {
        this.declutterModule = declutterModule;
        this.settingManager = settingManager;
        this.declutterSettingConsumer = null;
        this.handler = this.onSettingChanged.bind(this);
        this.isInit = false;
        this.declutterSetting = settingManager.getSetting('mapDeclutter');
    }
    /**
     * Initializes this controller. Once initialized, this controller will automatically update the map declutter mode.
     */
    init() {
        if (this.isInit) {
            return;
        }
        this.declutterSettingConsumer = this.settingManager.whenSettingChanged(this.declutterSetting.definition.name);
        this.declutterSettingConsumer.handle(this.handler);
        this.isInit = true;
    }
    /**
     * A callback which is called when the map declutter setting value changes.
     * @param mode The new mp declutter setting mode.
     */
    onSettingChanged(mode) {
        this.declutterModule.mode.set(MapDeclutterController.MODE_MAP[mode]);
    }
    /**
     * Destroys this controller, freeing up resources associated with it. Once destroyed, this controller will no longer
     * automatically update the map declutter mode.
     */
    destroy() {
        var _a;
        (_a = this.declutterSettingConsumer) === null || _a === void 0 ? void 0 : _a.off(this.handler);
        this.declutterSettingConsumer = null;
    }
}
MapDeclutterController.MODE_MAP = {
    [MapDeclutterSettingMode.All]: MapDeclutterMode.All,
    [MapDeclutterSettingMode.Level3]: MapDeclutterMode.Level3,
    [MapDeclutterSettingMode.Level2]: MapDeclutterMode.Level2,
    [MapDeclutterSettingMode.Level1]: MapDeclutterMode.Level1,
};
