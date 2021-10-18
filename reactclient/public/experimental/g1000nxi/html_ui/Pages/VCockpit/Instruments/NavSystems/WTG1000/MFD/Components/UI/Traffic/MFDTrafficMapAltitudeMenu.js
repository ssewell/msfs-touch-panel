import { TrafficAltitudeModeSetting, TrafficUserSettings } from '../../../../Shared/Traffic/TrafficUserSettings';
import { SoftKeyMenu } from '../../../../Shared/UI/Menus/SoftKeyMenu';
import { MultipleSoftKeyUserSettingController } from '../../../../Shared/UI/Menus/SoftKeyUserSettingControllers';
/**
 * The traffic map altitude restriction mode softkey menu.
 */
export class MFDTrafficMapAltitudeMenu extends SoftKeyMenu {
    /** @inheritdoc */
    constructor(menuSystem) {
        super(menuSystem);
        this.trafficSettingManager = TrafficUserSettings.getManager(this.menuSystem.bus);
        this.altitudeModeController = new MultipleSoftKeyUserSettingController(this, this.trafficSettingManager, 'trafficAltitudeMode', [
            { index: 4, label: 'Below', value: TrafficAltitudeModeSetting.Below },
            { index: 5, label: 'Normal', value: TrafficAltitudeModeSetting.Normal },
            { index: 6, label: 'Above', value: TrafficAltitudeModeSetting.Above },
            { index: 7, label: 'UNREST', value: TrafficAltitudeModeSetting.Unrestricted }
        ]);
        this.addItem(10, 'Back', () => { this.menuSystem.back(); });
        this.altitudeModeController.init();
    }
}
