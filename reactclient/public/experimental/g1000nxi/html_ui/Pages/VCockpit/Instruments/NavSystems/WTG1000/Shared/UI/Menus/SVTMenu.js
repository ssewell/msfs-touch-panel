import { PFDUserSettings } from '../../../PFD/PFDUserSettings';
import { SoftKeyMenu } from './SoftKeyMenu';
/**
 * The PFD Opt softkey menu.
 */
export class SVTMenu extends SoftKeyMenu {
    /**
     * Creates an instance of the PFD Opt SVT menu.
     * @param menuSystem The menu system.
     */
    constructor(menuSystem) {
        super(menuSystem);
        this.settingManager = PFDUserSettings.getManager(this.menuSystem.bus);
        this.addItem(0, 'Pathways');
        this.addItem(1, 'Terrain', () => { this.onSvtTogglePressed(); }, false);
        this.addItem(2, 'HDG LBL', () => { this.onHdgLblPressed(); }, false);
        this.addItem(3, 'APT Sign');
        this.addItem(10, 'Back', () => menuSystem.back());
        this.addItem(11, 'Alerts');
        this.settingManager.whenSettingChanged('svtToggle').handle(this.onSvtActiveChanged.bind(this));
        this.settingManager.whenSettingChanged('svtHdgLabelToggle').handle(this.onHdgLblActiveChanged.bind(this));
    }
    /**
     * Callback when the SVT setting is changed.
     * @param v true if SVT is active, false otherwise.
     */
    onSvtActiveChanged(v) {
        this.getItem(1).value.set(v);
    }
    /**
     * Callback when the Hdg label setting is changed.
     * @param v true if hdg label is active, false otherwise.
     */
    onHdgLblActiveChanged(v) {
        this.getItem(2).value.set(v);
    }
    /**
     * Callback when the SVT setting toggle is pressed.
     */
    onSvtTogglePressed() {
        this.settingManager.getSetting('svtToggle').value = !this.settingManager.getSetting('svtToggle').value;
    }
    /**
     * Callback when the SVT setting toggle is pressed.
     */
    onHdgLblPressed() {
        this.settingManager.getSetting('svtHdgLabelToggle').value = !this.settingManager.getSetting('svtHdgLabelToggle').value;
    }
}
