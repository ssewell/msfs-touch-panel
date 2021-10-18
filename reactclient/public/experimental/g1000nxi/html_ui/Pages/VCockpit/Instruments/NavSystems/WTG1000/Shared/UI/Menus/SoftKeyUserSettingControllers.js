/**
 * A controller which binds a status bar softkey to a user setting that takes a boolean value. Once bound, each press
 * of the softkey will toggle the value of the setting.
 */
export class SoftKeyBooleanUserSettingController {
    /**
     * Constructor.
     * @param softkeyMenu The softkey menu to which this controller's bound softkey belongs.
     * @param softkeyIndex The index in the softkey menu at which this controller's bound softkey is located.
     * @param softkeyLabel The text label of this controller's bound softkey.
     * @param settingManager This controller's setting manager.
     * @param settingName The name of this controller's setting.
     */
    constructor(softkeyMenu, softkeyIndex, softkeyLabel, settingManager, settingName) {
        this.softkeyMenu = softkeyMenu;
        this.softkeyIndex = softkeyIndex;
        this.softkeyLabel = softkeyLabel;
        this.settingManager = settingManager;
        this.settingName = settingName;
        this.setting = this.settingManager.getSetting(this.settingName);
        this.settingConsumer = null;
        this.settingHandler = (value) => {
            this.softkeyMenu.getItem(this.softkeyIndex).value.set(value);
        };
        this.isInit = false;
    }
    /**
     * Initializes this controller. This will create a softkey menu item and bind it to this controller's setting.
     */
    init() {
        if (this.isInit) {
            return;
        }
        this.softkeyMenu.addItem(this.softkeyIndex, this.softkeyLabel, () => { this.setting.value = !this.setting.value; });
        this.settingConsumer = this.settingManager.whenSettingChanged(this.settingName);
        this.settingConsumer.handle(this.settingHandler);
        this.isInit = true;
    }
    /**
     * Destroys this controller. This will remove the softkey menu item bound to this controller's setting.
     */
    destroy() {
        var _a;
        if (!this.isInit) {
            return;
        }
        this.softkeyMenu.removeItem(this.softkeyIndex);
        (_a = this.settingConsumer) === null || _a === void 0 ? void 0 : _a.off(this.settingHandler);
        this.settingConsumer = null;
        this.isInit = false;
    }
}
/**
 * A controller which binds a value indicator softkey to a user setting. Once bound, each press of the softkey will
 * cycle through possible user setting values.
 */
export class SoftKeyEnumUserSettingController {
    /**
     * Constructor.
     * @param softkeyMenu The softkey menu to which this controller's bound softkey belongs.
     * @param softkeyIndex The index in the softkey menu at which this controller's bound softkey is located.
     * @param softkeyLabel The text label of this controller's bound softkey.
     * @param settingManager This controller's setting manager.
     * @param settingName The name of this controller's setting.
     * @param textMap A function which maps setting values to their text representations.
     * @param nextFunc A function which gets the next setting value given the current setting value.
     */
    constructor(softkeyMenu, softkeyIndex, softkeyLabel, settingManager, settingName, textMap, nextFunc) {
        this.softkeyMenu = softkeyMenu;
        this.softkeyIndex = softkeyIndex;
        this.softkeyLabel = softkeyLabel;
        this.settingManager = settingManager;
        this.settingName = settingName;
        this.textMap = textMap;
        this.nextFunc = nextFunc;
        this.setting = this.settingManager.getSetting(this.settingName);
        this.settingConsumer = null;
        this.settingHandler = (value) => {
            this.softkeyMenu.getItem(this.softkeyIndex).value.set(this.textMap(value));
        };
        this.isInit = false;
    }
    /**
     * Initializes this controller. This will create a softkey menu item and bind it to this controller's setting.
     */
    init() {
        if (this.isInit) {
            return;
        }
        this.softkeyMenu.addItem(this.softkeyIndex, this.softkeyLabel, () => { this.setting.value = this.nextFunc(this.setting.value); });
        this.settingConsumer = this.settingManager.whenSettingChanged(this.settingName);
        this.settingConsumer.handle(this.settingHandler);
        this.isInit = true;
    }
    /**
     * Destroys this controller. This will remove the softkey menu item bound to this controller's setting.
     */
    destroy() {
        var _a;
        if (!this.isInit) {
            return;
        }
        this.softkeyMenu.removeItem(this.softkeyIndex);
        (_a = this.settingConsumer) === null || _a === void 0 ? void 0 : _a.off(this.settingHandler);
        this.settingConsumer = null;
        this.isInit = false;
    }
}
/**
 * A controller which binds one or more status bar softkeys to a user setting. Each softkey is bound to a specific
 * setting value. Once bound, each press of the softkey will set the setting to its bound value.
 */
export class MultipleSoftKeyUserSettingController {
    /**
     * Constructor.
     * @param softkeyMenu The softkey menu to which this controller's bound softkeys belong.
     * @param settingManager This controller's setting manager.
     * @param settingName The name of this controller's setting.
     * @param softkeyDefs The definitions for the softkeys bound to this controller's setting.
     */
    constructor(softkeyMenu, settingManager, settingName, softkeyDefs) {
        this.softkeyMenu = softkeyMenu;
        this.settingManager = settingManager;
        this.settingName = settingName;
        this.softkeyDefs = softkeyDefs;
        this.setting = this.settingManager.getSetting(this.settingName);
        this.settingConsumer = null;
        this.settingHandler = (value) => {
            for (let i = 0; i < this.softkeyDefs.length; i++) {
                const def = this.softkeyDefs[i];
                this.softkeyMenu.getItem(def.index).value.set(def.value === value);
            }
        };
        this.isInit = false;
    }
    /**
     * Initializes this controller. This will create softkey menu items and bind them to this controller's setting.
     */
    init() {
        if (this.isInit) {
            return;
        }
        for (let i = 0; i < this.softkeyDefs.length; i++) {
            const def = this.softkeyDefs[i];
            this.softkeyMenu.addItem(def.index, def.label, () => { this.setting.value = def.value; });
        }
        this.settingConsumer = this.settingManager.whenSettingChanged(this.settingName);
        this.settingConsumer.handle(this.settingHandler);
        this.isInit = true;
    }
    /**
     * Destroys this controller. This will remove the softkey menu items bound to this controller's setting.
     */
    destroy() {
        var _a;
        if (!this.isInit) {
            return;
        }
        for (let i = 0; i < this.softkeyDefs.length; i++) {
            const def = this.softkeyDefs[i];
            this.softkeyMenu.removeItem(def.index);
        }
        (_a = this.settingConsumer) === null || _a === void 0 ? void 0 : _a.off(this.settingHandler);
        this.settingConsumer = null;
        this.isInit = false;
    }
}
