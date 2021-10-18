import { DefaultUserSettingManager } from 'msfssdk/settings';
import { MapTrafficAlertLevelMode } from './Modules/MapTrafficModule';
/**
 * Setting modes for map orientation.
 */
export var MapOrientationSettingMode;
(function (MapOrientationSettingMode) {
    MapOrientationSettingMode[MapOrientationSettingMode["NorthUp"] = 0] = "NorthUp";
    MapOrientationSettingMode[MapOrientationSettingMode["TrackUp"] = 1] = "TrackUp";
    MapOrientationSettingMode[MapOrientationSettingMode["HeadingUp"] = 2] = "HeadingUp";
})(MapOrientationSettingMode || (MapOrientationSettingMode = {}));
/**
 * Setting modes for map terrain display.
 */
export var MapTerrainSettingMode;
(function (MapTerrainSettingMode) {
    MapTerrainSettingMode[MapTerrainSettingMode["None"] = 0] = "None";
    MapTerrainSettingMode[MapTerrainSettingMode["Absolute"] = 1] = "Absolute";
    MapTerrainSettingMode[MapTerrainSettingMode["Relative"] = 2] = "Relative";
})(MapTerrainSettingMode || (MapTerrainSettingMode = {}));
/**
 * Setting modes for map declutter.
 */
export var MapDeclutterSettingMode;
(function (MapDeclutterSettingMode) {
    MapDeclutterSettingMode[MapDeclutterSettingMode["All"] = 0] = "All";
    MapDeclutterSettingMode[MapDeclutterSettingMode["Level3"] = 1] = "Level3";
    MapDeclutterSettingMode[MapDeclutterSettingMode["Level2"] = 2] = "Level2";
    MapDeclutterSettingMode[MapDeclutterSettingMode["Level1"] = 3] = "Level1";
})(MapDeclutterSettingMode || (MapDeclutterSettingMode = {}));
/**
 * Utility class for retrieving map user setting managers.
 */
export class MapUserSettings {
    /**
     * Retrieves a manager for map user settings.
     * @param bus The event bus.
     * @returns a manager for map user settings.
     */
    static getManager(bus) {
        var _a;
        return (_a = MapUserSettings.INSTANCE) !== null && _a !== void 0 ? _a : (MapUserSettings.INSTANCE = new DefaultUserSettingManager(bus, [
            {
                name: 'mapOrientation',
                defaultValue: MapOrientationSettingMode.HeadingUp
            },
            {
                name: 'mapAutoNorthUpActive',
                defaultValue: true
            },
            {
                name: 'mapAutoNorthUpRangeIndex',
                defaultValue: 27
            },
            {
                name: 'mapPfdDeclutter',
                defaultValue: MapDeclutterSettingMode.All
            },
            {
                name: 'mapMfdDeclutter',
                defaultValue: MapDeclutterSettingMode.All
            },
            {
                name: 'mapPfdTerrainMode',
                defaultValue: MapTerrainSettingMode.Absolute
            },
            {
                name: 'mapMfdTerrainMode',
                defaultValue: MapTerrainSettingMode.Absolute
            },
            {
                name: 'mapTerrainRangeIndex',
                defaultValue: 27
            },
            {
                name: 'mapTerrainScaleShow',
                defaultValue: false
            },
            {
                name: 'mapAirportLargeShow',
                defaultValue: true
            },
            {
                name: 'mapAirportLargeRangeIndex',
                defaultValue: 21
            },
            {
                name: 'mapAirportMediumShow',
                defaultValue: true
            },
            {
                name: 'mapAirportMediumRangeIndex',
                defaultValue: 19
            },
            {
                name: 'mapAirportSmallShow',
                defaultValue: true
            },
            {
                name: 'mapAirportSmallRangeIndex',
                defaultValue: 17
            },
            {
                name: 'mapVorShow',
                defaultValue: true
            },
            {
                name: 'mapVorRangeIndex',
                defaultValue: 19
            },
            {
                name: 'mapNdbShow',
                defaultValue: true
            },
            {
                name: 'mapNdbRangeIndex',
                defaultValue: 17
            },
            {
                name: 'mapIntersectionShow',
                defaultValue: true
            },
            {
                name: 'mapIntersectionRangeIndex',
                defaultValue: 17
            },
            {
                name: 'mapPfdTrafficShow',
                defaultValue: false
            },
            {
                name: 'mapMfdTrafficShow',
                defaultValue: false
            },
            {
                name: 'mapTrafficRangeIndex',
                defaultValue: 17
            },
            {
                name: 'mapTrafficLabelShow',
                defaultValue: true
            },
            {
                name: 'mapTrafficLabelRangeIndex',
                defaultValue: 17
            },
            {
                name: 'mapTrafficAlertLevelMode',
                defaultValue: MapTrafficAlertLevelMode.All
            },
            {
                name: 'mapPfdNexradShow',
                defaultValue: false
            },
            {
                name: 'mapMfdNexradShow',
                defaultValue: false
            },
            {
                name: 'mapNexradRangeIndex',
                defaultValue: 27
            }
        ]));
    }
    /**
     * Retrieves a manager for PFD map user settings.
     * @param bus The event bus.
     * @returns a manager for PFD map user settings.
     */
    static getPfdManager(bus) {
        var _a;
        return (_a = MapUserSettings.PFD_INSTANCE) !== null && _a !== void 0 ? _a : MapUserSettings.getManager(bus).mapTo({
            mapDeclutter: 'mapPfdDeclutter',
            mapNexradShow: 'mapPfdNexradShow',
            mapTerrainMode: 'mapPfdTerrainMode',
            mapTrafficShow: 'mapPfdTrafficShow'
        });
    }
    /**
     * Retrieves a manager for MFD map user settings.
     * @param bus The event bus.
     * @returns a manager for PFD map user settings.
     */
    static getMfdManager(bus) {
        var _a;
        return (_a = MapUserSettings.MFD_INSTANCE) !== null && _a !== void 0 ? _a : MapUserSettings.getManager(bus).mapTo({
            mapDeclutter: 'mapMfdDeclutter',
            mapNexradShow: 'mapMfdNexradShow',
            mapTerrainMode: 'mapMfdTerrainMode',
            mapTrafficShow: 'mapMfdTrafficShow'
        });
    }
}
