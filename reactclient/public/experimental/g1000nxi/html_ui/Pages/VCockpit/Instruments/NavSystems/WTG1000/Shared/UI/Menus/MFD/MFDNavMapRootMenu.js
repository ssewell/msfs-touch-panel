import { MapDeclutterSettingMode, MapUserSettings } from '../../../Map/MapUserSettings';
import { MFDRootMenu } from './MFDRootMenu';
/**
 * The MFD Navigation Map page root softkey menu.
 */
export class MFDNavMapRootMenu extends MFDRootMenu {
    /**
     * Creates an instance of the MFD Navigation Map page root softkey menu.
     * @param menuSystem The menu system.
     */
    constructor(menuSystem) {
        super(menuSystem);
        this.mapSettings = MapUserSettings.getMfdManager(this.menuSystem.bus);
        this.addItem(2, 'Map Opt', () => menuSystem.pushMenu('map-opt'));
        this.addItem(9, 'Detail', this.cycleDeclutterSetting.bind(this), '', false);
        this.addItem(10, 'Charts');
        this.addItem(11, 'Checklist');
        this.initSettings();
    }
    /**
     * Sets the map model to use for these options.
     */
    initSettings() {
        this.mapSettings.whenSettingChanged('mapDeclutter').handle(v => this.getItem(9).value.set(MFDNavMapRootMenu.DECLUTTER_TEXT[v]));
    }
    /**
     * Cycles the map declutter setting.
     */
    cycleDeclutterSetting() {
        const setting = this.mapSettings.getSetting('mapDeclutter');
        switch (setting.value) {
            case MapDeclutterSettingMode.All:
                setting.value = MapDeclutterSettingMode.Level3;
                break;
            case MapDeclutterSettingMode.Level3:
                setting.value = MapDeclutterSettingMode.Level2;
                break;
            case MapDeclutterSettingMode.Level2:
                setting.value = MapDeclutterSettingMode.Level1;
                break;
            case MapDeclutterSettingMode.Level1:
                setting.value = MapDeclutterSettingMode.All;
                break;
        }
    }
}
MFDNavMapRootMenu.DECLUTTER_TEXT = {
    [MapDeclutterSettingMode.All]: 'All',
    [MapDeclutterSettingMode.Level3]: '3',
    [MapDeclutterSettingMode.Level2]: '2',
    [MapDeclutterSettingMode.Level1]: '1',
};
