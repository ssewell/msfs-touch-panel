import { Subject } from 'msfssdk';
import { UserSettingController } from './UserSettingController';
/**
 * A controller which binds a setting that can take one of several enumerated values to an ArrowToggle component.
 */
export class UserSettingToggleController extends UserSettingController {
    /**
     * Constructor.
     * @param settingManager This controller's settings manager.
     * @param settingName The name of the setting associated with this controller.
     * @param values An array of values this controller can assign to its setting.
     */
    constructor(settingManager, settingName, values) {
        super(settingManager, settingName);
        this.settingManager = settingManager;
        this.settingName = settingName;
        this.values = values;
        /**
         * A subject which provides a selected index for the ArrowToggle component which this controller controls. This
         * subject should be passed to the ArrowToggle component via its `dataref` prop.
         */
        this.selectedIndexSub = Subject.create(0);
        /**
         * A function which handles value selected events from the ArrowToggle component which this controller controls.
         * This handler should be passed to the ArrowToggle component via its `onOptionSelected` prop.
         */
        this.optionSelectedHandler = this.onOptionSelected.bind(this);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onSettingChanged(value) {
        this.selectedIndexSub.set(this.values.indexOf(value));
    }
    /**
     * A callback which is called when an option is selected using the ArrowToggle component.
     * @param index The index of the selected option.
     */
    onOptionSelected(index) {
        this.setting.value = this.values[index];
    }
}
