import { DefaultUserSettingManager } from 'msfssdk/settings';
/**
 * The wind overlay options.
 */
export var WindOverlaySettingMode;
(function (WindOverlaySettingMode) {
    WindOverlaySettingMode[WindOverlaySettingMode["Off"] = 0] = "Off";
    WindOverlaySettingMode[WindOverlaySettingMode["Opt1"] = 1] = "Opt1";
    WindOverlaySettingMode[WindOverlaySettingMode["Opt2"] = 2] = "Opt2";
    WindOverlaySettingMode[WindOverlaySettingMode["Opt3"] = 3] = "Opt3";
})(WindOverlaySettingMode || (WindOverlaySettingMode = {}));
/**
 * Setting modes for the pfd map layout option.
 */
export var PfdMapLayoutSettingMode;
(function (PfdMapLayoutSettingMode) {
    PfdMapLayoutSettingMode[PfdMapLayoutSettingMode["Off"] = 0] = "Off";
    PfdMapLayoutSettingMode[PfdMapLayoutSettingMode["Inset"] = 1] = "Inset";
    PfdMapLayoutSettingMode[PfdMapLayoutSettingMode["HSI"] = 2] = "HSI";
    PfdMapLayoutSettingMode[PfdMapLayoutSettingMode["TFC"] = 3] = "TFC";
})(PfdMapLayoutSettingMode || (PfdMapLayoutSettingMode = {}));
/**
 * Utility class for retrieving PFD user setting managers.
 */
export class PFDUserSettings {
    /**
     * Retrieves a manager for map user settings.
     * @param bus The event bus.
     * @returns a manager for map user settings.
     */
    static getManager(bus) {
        var _a;
        return (_a = PFDUserSettings.INSTANCE) !== null && _a !== void 0 ? _a : (PFDUserSettings.INSTANCE = new DefaultUserSettingManager(bus, [
            {
                name: 'windOption',
                defaultValue: WindOverlaySettingMode.Off
            },
            {
                name: 'mapLayout',
                defaultValue: PfdMapLayoutSettingMode.Off
            },
            {
                name: 'svtToggle',
                defaultValue: true
            },
            {
                name: 'baroHpa',
                defaultValue: false
            },
            {
                name: 'svtHdgLabelToggle',
                defaultValue: true
            },
        ]));
    }
}
