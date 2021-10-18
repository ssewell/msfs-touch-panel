import { UnitType } from 'msfssdk';
import { DefaultUserSettingManager } from 'msfssdk/settings';
/**
 * Utility class for retrieving map range setting managers.
 */
export class MapRangeSettings {
    /**
     * Retrieves a manager for map range setting.
     * @param bus The event bus.
     * @returns a manager for map range setting.
     */
    static getManager(bus) {
        var _a;
        return (_a = MapRangeSettings.INSTANCE) !== null && _a !== void 0 ? _a : (MapRangeSettings.INSTANCE = new DefaultUserSettingManager(bus, [
            {
                name: 'pfdMapRangeIndex',
                defaultValue: 11
            },
            {
                name: 'mfdMapRangeIndex',
                defaultValue: 11
            },
        ]));
    }
}
MapRangeSettings.DEFAULT_RANGES = [
    ...[
        250,
        400,
        500,
        750,
        1000,
        1500,
        2500
    ].map(value => UnitType.FOOT.createNumber(value)),
    ...[
        0.5,
        0.75,
        1,
        1.5,
        2.5,
        4,
        5,
        7.5,
        10,
        15,
        25,
        40,
        50,
        75,
        100,
        150,
        250,
        400,
        500,
        750,
        1000
    ].map(value => UnitType.NMILE.createNumber(value))
];
