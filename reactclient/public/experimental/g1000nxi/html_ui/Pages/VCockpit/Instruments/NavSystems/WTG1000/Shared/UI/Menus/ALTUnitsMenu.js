import { PFDUserSettings } from '../../../PFD/PFDUserSettings';
import { SoftKeyMenu } from './SoftKeyMenu';
/**
 * The PFD Opt ALT units menu.
 */
export class ALTUnitsMenu extends SoftKeyMenu {
    /**
     * Creates an instance of the PFD Opt ALT units menu.
     * @param menuSystem The menu system.
     */
    constructor(menuSystem) {
        super(menuSystem);
        this.addItem(5, 'Meters', undefined, false);
        this.addItem(7, 'IN', () => {
            this.onBaroHpaSettingSelected(false);
        }, false);
        this.addItem(8, 'HPA', () => {
            this.onBaroHpaSettingSelected(true);
        }, false);
        this.addItem(10, 'Back', () => menuSystem.back());
        this.addItem(11, 'Alerts');
        PFDUserSettings.getManager(menuSystem.bus).whenSettingChanged('baroHpa').handle(this.onBaroHpaSettingChanged.bind(this));
    }
    /**
     * Callback fired when a baro unit option is selected.
     * @param isHpa true if HPA, false if IN.
     */
    onBaroHpaSettingSelected(isHpa) {
        PFDUserSettings.getManager(this.menuSystem.bus).getSetting('baroHpa').value = isHpa;
    }
    /**
     * Callback fired when a baro unit setting is changed.
     * @param isHpa true if HPA, false if IN.
     */
    onBaroHpaSettingChanged(isHpa) {
        this.getItem(7).value.set(!isHpa);
        this.getItem(8).value.set(isHpa);
    }
}
