/**
 * A controller which binds a user setting to a control component.
 */
export class UserSettingController {
    /**
     * Constructor.
     * @param settingManager This controller's settings manager.
     * @param settingName The name of the setting associated with this controller.
     */
    constructor(settingManager, settingName) {
        this.settingManager = settingManager;
        this.settingName = settingName;
        /** The setting associated with this controller. */
        this.setting = this.settingManager.getSetting(this.settingName);
    }
    /**
     * Initializes this controller. This will immediately change the state of this controller's control component to
     * reflect the current value of this controller's setting. Furthermore, any future changes to the setting's value
     * will be synced to the control component.
     */
    init() {
        this.settingManager.whenSettingChanged(this.settingName).handle(this.onSettingChanged.bind(this));
    }
}
