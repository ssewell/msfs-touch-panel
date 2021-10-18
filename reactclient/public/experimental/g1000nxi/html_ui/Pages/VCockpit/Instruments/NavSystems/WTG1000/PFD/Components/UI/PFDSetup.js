import { ArraySubject, DisplayComponent, FSComponent, Subject } from 'msfssdk';
import { UiView } from '../../../Shared/UI/UiView';
import { ArrowToggle } from '../../../Shared/UI/UIControls/ArrowToggle';
import { SelectControl } from '../../../Shared/UI/UIControls/SelectControl';
import { NumberInput } from '../../../Shared/UI/UIControls/NumberInput';
import { ContextMenuDialog } from '../../../Shared/UI/Dialogs/ContextMenuDialog';
import { BacklightMode, BacklightUserSettings } from '../../../Shared/Backlight/BacklightUserSettings';
import { UserSettingSelectController } from '../../../Shared/UI/UserSettings/UserSettingSelectController';
import { UserSettingNumberController } from '../../../Shared/UI/UserSettings/UserSettingNumberController';
import './PFDSetup.css';
/** Brightness control for a portion of a display. */
class ItemBrightnessControl extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.container = FSComponent.createRef();
        this.modeDiv = FSComponent.createRef();
        this.modeControl = FSComponent.createRef();
        this.valDiv = FSComponent.createRef();
        this.valInput = FSComponent.createRef();
        this.modeValues = ArraySubject.create(this.props.noManualMode
            ? [BacklightMode.Auto]
            : [BacklightMode.Auto, BacklightMode.Manual]);
        this.modeSetting = this.props.settingManager.getSetting(this.props.modeSettingName);
        this.modeController = new UserSettingSelectController(this.props.settingManager, this.props.modeSettingName, this.modeValues, this.modeControl);
        this.intensitySetting = this.props.settingManager.getSetting(this.props.intensitySettingName);
        this.intensityController = new UserSettingNumberController(this.props.settingManager, this.props.intensitySettingName);
    }
    /** Init after rendering. */
    onAfterRender() {
        this.props.settingManager.whenSettingChanged(this.props.modeSettingName).handle(this.onManAutoSelected.bind(this));
        this.modeController.init();
        this.intensityController.init();
    }
    /**
     * Disable the element.
     */
    disable() {
        this.container.instance.style.display = 'none';
        this.valInput.instance.setIsEnabled(false);
        this.modeControl.instance.setIsEnabled(false);
    }
    /**
     * Enable the element.
     */
    enable() {
        this.container.instance.style.display = '';
        this.modeControl.instance.setIsEnabled(true);
        if (this.modeSetting.value == BacklightMode.Manual) {
            this.valInput.instance.setIsEnabled(true);
        }
    }
    /**
     * Handle a manual/auto switch.
     * @param mode The index number of the option chosen.
     */
    onManAutoSelected(mode) {
        var _a, _b;
        switch (mode) {
            case BacklightMode.Auto:
                // Auto enabled.
                this.valInput.instance.setIsEnabled(false);
                (_a = this.valInput.instance.getHighlightElement()) === null || _a === void 0 ? void 0 : _a.classList.add('inactive-dim');
                break;
            case BacklightMode.Manual:
                // Manual enabled.
                this.valInput.instance.setIsEnabled(true);
                (_b = this.valInput.instance.getHighlightElement()) === null || _b === void 0 ? void 0 : _b.classList.remove('inactive-dim');
                break;
            default:
                // Shouldn't happen.
                console.log(`Unknown option for onManAutoSelected: ${mode}`);
        }
    }
    /**
     * Builds a menu item definition for a setting value.
     * @param value A setting value.
     * @param index The index of the value in the menu.
     * @returns a menu item definition for the setting value.
     */
    buildModeMenuItem(value, index) {
        return {
            id: `${index}`,
            renderContent: () => FSComponent.buildComponent("span", null, ItemBrightnessControl.MODE_TEXT[value]),
            estimatedWidth: ItemBrightnessControl.MODE_TEXT[value].length * ContextMenuDialog.CHAR_WIDTH
        };
    }
    /**
     * Render the control.
     * @returns The VNode for the control.
     */
    render() {
        return (FSComponent.buildComponent("div", { ref: this.container, class: 'pfd-setup-item-block pfd-setup-inline' },
            FSComponent.buildComponent("div", { class: 'pfd-setup-mode-switch pfd-setup-inline', ref: this.modeDiv },
                FSComponent.buildComponent(SelectControl, { class: 'pfd-setup-inline', ref: this.modeControl, onRegister: this.props.onRegister, buildMenuItem: this.buildModeMenuItem.bind(this), data: this.modeValues, onItemSelected: this.modeController.itemSelectedHandler, outerContainer: this.container })),
            FSComponent.buildComponent("div", { class: 'pfd-setup-number-input pfd-setup-inline', ref: this.valDiv },
                FSComponent.buildComponent(NumberInput, { class: 'pfd-setup-inline', ref: this.valInput, onRegister: this.props.onRegister, onValueChanged: this.intensityController.inputChangedHandler, dataSubject: this.intensityController.dataSub, minValue: 0, maxValue: 100, increment: 1, formatter: (num) => `${num.toFixed(2)}%`, wrap: false }))));
    }
}
ItemBrightnessControl.MODE_TEXT = {
    [BacklightMode.Auto]: 'Auto',
    [BacklightMode.Manual]: 'Manual'
};
/** Display brightness control component. */
class BrightnessControl extends DisplayComponent {
    /**
     * Create a BrightnessControl
     * @param props The properties for the control.
     */
    constructor(props) {
        super(props);
        this.itemValue = Subject.create(0);
        this.dispInput = FSComponent.createRef();
        this.keyInput = FSComponent.createRef();
        this.screenModeSettingName = `${this.props.displayName}ScreenBacklightMode`;
        this.screenIntensitySettingName = `${this.props.displayName}ScreenBacklightIntensity`;
        this.keyModeSettingName = `${this.props.displayName}KeyBacklightMode`;
        this.keyIntensitySettingName = `${this.props.displayName}KeyBacklightIntensity`;
        this.setupItems = [`${this.props.displayName.toUpperCase()} Display`, `${this.props.displayName.toUpperCase()} Key`];
    }
    /** Do things after render. */
    onAfterRender() {
        this.keyInput.instance.disable();
    }
    /**
     * Handle an item selection event.
     * @param option The index number of the option chosen
     */
    onItemSelected(option) {
        switch (option) {
            case 0:
                // Display selected.
                this.dispInput.instance.enable();
                this.keyInput.instance.disable();
                break;
            case 1:
                // Key selected.
                this.dispInput.instance.disable();
                this.keyInput.instance.enable();
                break;
            default:
                console.log(`Invalid option for onItemSelected: ${option}`);
        }
    }
    /**
     * Render a brightness control.
     * @returns a VNode
     */
    render() {
        return (FSComponent.buildComponent("div", { class: 'pfd-setup-row' },
            FSComponent.buildComponent("div", { class: 'pfd-setup-mode-toggle pfd-setup-inline' },
                FSComponent.buildComponent(ArrowToggle, { class: 'pfd-setup-inline', onRegister: this.props.onRegister, onOptionSelected: this.onItemSelected.bind(this), options: this.setupItems, dataref: this.itemValue })),
            FSComponent.buildComponent(ItemBrightnessControl, { ref: this.dispInput, onRegister: this.props.onRegister, settingManager: this.props.settingManager, modeSettingName: this.screenModeSettingName, intensitySettingName: this.screenIntensitySettingName }),
            FSComponent.buildComponent(ItemBrightnessControl, { ref: this.keyInput, onRegister: this.props.onRegister, settingManager: this.props.settingManager, modeSettingName: this.keyModeSettingName, intensitySettingName: this.keyIntensitySettingName, noManualMode: true })));
    }
}
/** A PFD setup menu. */
export class PFDSetup extends UiView {
    constructor() {
        super(...arguments);
        this.backlightSettingManager = BacklightUserSettings.getManager(this.props.bus);
    }
    /**
     * Render the menu.
     * @returns a VNode
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "popout-dialog", ref: this.viewContainerRef },
            FSComponent.buildComponent("h1", null, this.props.title),
            FSComponent.buildComponent("div", { class: 'pfd-setup-popout' },
                FSComponent.buildComponent(BrightnessControl, { onRegister: this.register, displayName: 'pfd', settingManager: this.backlightSettingManager }),
                FSComponent.buildComponent(BrightnessControl, { onRegister: this.register, displayName: 'mfd', settingManager: this.backlightSettingManager }))));
    }
}
