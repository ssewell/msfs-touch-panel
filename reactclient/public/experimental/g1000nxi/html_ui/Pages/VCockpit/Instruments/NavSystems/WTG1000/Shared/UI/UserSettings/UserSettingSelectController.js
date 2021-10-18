import { UserSettingController } from './UserSettingController';
/**
 * A controller which binds a user setting that can take one of several enumerated values to a SelectControl
 * component.
 */
export class UserSettingSelectController extends UserSettingController {
    /**
     * Constructor.
     * @param settingManager This controller's settings manager.
     * @param settingName The name of the setting associated with this controller.
     * @param values A subscribable array which provides the values this controller can assign to its setting.
     * @param selectControlRef A node reference to the SelectControl which this controller controls.
     */
    constructor(settingManager, settingName, values, selectControlRef) {
        super(settingManager, settingName);
        this.settingManager = settingManager;
        this.settingName = settingName;
        this.values = values;
        this.selectControlRef = selectControlRef;
        /**
         * A function which handles item selected events from the SelectControl component which this controller controls.
         * This handler should be passed to the SelectControl component via its `onItemSelected` prop.
         */
        this.itemSelectedHandler = this.onItemSelected.bind(this);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onSettingChanged(value) {
        var _a;
        (_a = this.selectControlRef.getOrDefault()) === null || _a === void 0 ? void 0 : _a.SelectedValue.set(this.values.getArray().indexOf(value));
    }
    /**
     * A callback which is called when an item is selected using the SelectControl component.
     * @param index The index of the selected item.
     * @param item The selected item.
     * @param isRefresh Whether the selection was made due to a refresh.
     */
    onItemSelected(index, item, isRefresh) {
        if (item === undefined || isRefresh) {
            return;
        }
        this.setting.value = item;
    }
}
/**
 * A controller which binds a user setting that can take one of several enumerated values to a SelectControl
 * component which displays transformed versions of the setting values.
 */
export class UserSettingTransformedSelectController extends UserSettingController {
    /**
     * Constructor.
     * @param settingManager This controller's settings manager.
     * @param settingName The name of the setting associated with this controller.
     * @param values A subscribable array which provides the values this controller can assign to its setting.
     * @param transformedValues A subscribable array which provides the transformed values displayed by the SelectControl
     * component controlled by this controller.
     * @param selectControlRef A node reference to the SelectControl which this controller controls.
     */
    constructor(settingManager, settingName, values, transformedValues, selectControlRef) {
        super(settingManager, settingName);
        this.settingManager = settingManager;
        this.settingName = settingName;
        this.values = values;
        this.transformedValues = transformedValues;
        this.selectControlRef = selectControlRef;
        /**
         * A function which handles item selected events from the SelectControl component which this controller controls.
         * This handler should be passed to the SelectControl component via its `onItemSelected` prop.
         */
        this.itemSelectedHandler = this.onItemSelected.bind(this);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onSettingChanged(value) {
        var _a;
        (_a = this.selectControlRef.getOrDefault()) === null || _a === void 0 ? void 0 : _a.SelectedValue.set(this.values.getArray().indexOf(value));
    }
    /**
     * A callback which is called when an item is selected using the SelectControl component.
     * @param index The index of the selected item.
     * @param item The selected item.
     * @param isRefresh Whether the selection was made due to a refresh.
     */
    onItemSelected(index, item, isRefresh) {
        if (item === undefined || isRefresh) {
            return;
        }
        this.setting.value = this.values.get(index);
    }
}
