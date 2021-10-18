import { DefaultUserSettingManager } from 'msfssdk/settings';
/**
 * Setting modes for backlighting.
 */
export var BacklightMode;
(function (BacklightMode) {
    BacklightMode[BacklightMode["Auto"] = 0] = "Auto";
    BacklightMode[BacklightMode["Manual"] = 1] = "Manual";
})(BacklightMode || (BacklightMode = {}));
/**
 * Utility class for retrieving backlight user setting managers.
 */
export class BacklightUserSettings {
    /**
     * Retrieves a manager for backlight user settings.
     * @param bus The event bus.
     * @returns a manager for backlight user settings.
     */
    static getManager(bus) {
        var _a;
        return (_a = BacklightUserSettings.INSTANCE) !== null && _a !== void 0 ? _a : (BacklightUserSettings.INSTANCE = new DefaultUserSettingManager(bus, [
            {
                name: 'pfdScreenBacklightMode',
                defaultValue: BacklightMode.Auto
            },
            {
                name: 'pfdScreenBacklightIntensity',
                defaultValue: 100
            },
            {
                name: 'pfdKeyBacklightMode',
                defaultValue: BacklightMode.Auto
            },
            {
                name: 'pfdKeyBacklightIntensity',
                defaultValue: 100
            },
            {
                name: 'mfdScreenBacklightMode',
                defaultValue: BacklightMode.Auto
            },
            {
                name: 'mfdScreenBacklightIntensity',
                defaultValue: 100
            },
            {
                name: 'mfdKeyBacklightMode',
                defaultValue: BacklightMode.Auto
            },
            {
                name: 'mfdKeyBacklightIntensity',
                defaultValue: 100
            },
        ]));
    }
}
