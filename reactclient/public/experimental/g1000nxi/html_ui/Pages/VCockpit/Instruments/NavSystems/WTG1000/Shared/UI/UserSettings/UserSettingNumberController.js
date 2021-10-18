import { Subject } from 'msfssdk';
import { UserSettingController } from './UserSettingController';
/**
 * A controller which binds a user setting with numeric values to a NumberInput component.
 */
export class UserSettingNumberController extends UserSettingController {
    /**
     * Constructor.
     * @param settingManager This controller's settings manager.
     * @param settingName The name of the setting associated with this controller.
     */
    constructor(settingManager, settingName) {
        super(settingManager, settingName);
        this.settingManager = settingManager;
        this.settingName = settingName;
        /**
         * A subject which provides a numeric value for the NumberInput component which this controller controls. This
         * subject should be passed to the NumberInput component via the `dataSubject` prop.
         */
        this.dataSub = Subject.create(0);
        /**
         * A function which handles input change events from the NumberInput component which this controller controls. This
         * handler should be passed to the NumberInput component via the `onValueChanged` prop.
         */
        this.inputChangedHandler = this.onInputChanged.bind(this);
        if (typeof this.setting.value !== 'number') {
            throw new Error(`Setting '${this.setting.definition.name}' does not use numeric values`);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onSettingChanged(value) {
        this.dataSub.set(value);
    }
    /**
     * A callback which is called when the number input changes.
     * @param value The new value of the input.
     */
    onInputChanged(value) {
        this.setting.value = value;
    }
}
