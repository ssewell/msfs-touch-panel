import { DefaultUserSettingManager } from 'msfssdk/settings';
export var TrafficOperatingModeSetting;
(function (TrafficOperatingModeSetting) {
    TrafficOperatingModeSetting[TrafficOperatingModeSetting["Standby"] = 0] = "Standby";
    TrafficOperatingModeSetting[TrafficOperatingModeSetting["Operating"] = 1] = "Operating";
    TrafficOperatingModeSetting[TrafficOperatingModeSetting["Test"] = 2] = "Test";
})(TrafficOperatingModeSetting || (TrafficOperatingModeSetting = {}));
export var TrafficAltitudeModeSetting;
(function (TrafficAltitudeModeSetting) {
    TrafficAltitudeModeSetting[TrafficAltitudeModeSetting["Below"] = 0] = "Below";
    TrafficAltitudeModeSetting[TrafficAltitudeModeSetting["Normal"] = 1] = "Normal";
    TrafficAltitudeModeSetting[TrafficAltitudeModeSetting["Above"] = 2] = "Above";
    TrafficAltitudeModeSetting[TrafficAltitudeModeSetting["Unrestricted"] = 3] = "Unrestricted";
})(TrafficAltitudeModeSetting || (TrafficAltitudeModeSetting = {}));
export var TrafficMotionVectorModeSetting;
(function (TrafficMotionVectorModeSetting) {
    TrafficMotionVectorModeSetting[TrafficMotionVectorModeSetting["Off"] = 0] = "Off";
    TrafficMotionVectorModeSetting[TrafficMotionVectorModeSetting["Absolute"] = 1] = "Absolute";
    TrafficMotionVectorModeSetting[TrafficMotionVectorModeSetting["Relative"] = 2] = "Relative";
})(TrafficMotionVectorModeSetting || (TrafficMotionVectorModeSetting = {}));
/**
 *
 */
export class TrafficUserSettings extends DefaultUserSettingManager {
    /**
     * Gets an instance of the traffic user settings manager.
     * @param bus The event bus.
     * @returns An instance of the traffic user settings manager.
     */
    static getManager(bus) {
        var _a;
        return (_a = TrafficUserSettings.INSTANCE) !== null && _a !== void 0 ? _a : (TrafficUserSettings.INSTANCE = new DefaultUserSettingManager(bus, [
            {
                name: 'trafficOperatingMode',
                defaultValue: TrafficOperatingModeSetting.Standby
            },
            {
                name: 'trafficAltitudeMode',
                defaultValue: TrafficAltitudeModeSetting.Unrestricted
            },
            {
                name: 'trafficMotionVectorMode',
                defaultValue: TrafficMotionVectorModeSetting.Off
            },
            {
                name: 'trafficMotionVectorLookahead',
                defaultValue: 60
            }
        ]));
    }
}
