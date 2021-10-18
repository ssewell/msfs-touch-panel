import { UserSettingSaveManager } from 'msfssdk/settings';
import { PFDUserSettings } from '../../PFD/PFDUserSettings';
import { BacklightUserSettings } from '../Backlight/BacklightUserSettings';
import { MapUserSettings } from '../Map/MapUserSettings';
import { TrafficUserSettings } from '../Traffic/TrafficUserSettings';
/**
 * A manager for G1000 settings which are saved to pilot profiles.
 */
export class G1000SettingSaveManager extends UserSettingSaveManager {
    /**
     * Constructor.
     * @param bus The event bus.
     */
    constructor(bus) {
        const backlightSettingManager = BacklightUserSettings.getManager(bus);
        const mapSettingManager = MapUserSettings.getManager(bus);
        const pfdSettingManager = PFDUserSettings.getManager(bus);
        const trafficSettingManager = TrafficUserSettings.getManager(bus);
        const settings = [
            ...backlightSettingManager.getAllSettings(),
            ...pfdSettingManager.getAllSettings(),
            ...mapSettingManager.getAllSettings(),
            ...trafficSettingManager.getAllSettings().filter(setting => setting.definition.name !== 'trafficOperatingMode')
        ];
        super(settings, bus);
    }
}
