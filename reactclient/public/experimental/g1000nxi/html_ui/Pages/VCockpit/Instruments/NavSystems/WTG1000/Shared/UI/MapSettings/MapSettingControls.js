import { ArraySubject, DisplayComponent, FSComponent, NumberFormatter, NumberUnitSubject, Subject } from 'msfssdk';
import { NumberUnitDisplay } from '../Common/NumberUnitDisplay';
import { ContextMenuDialog } from '../Dialogs/ContextMenuDialog';
import { ArrowToggle } from '../UIControls/ArrowToggle';
import { SelectControl } from '../UIControls/SelectControl';
import { UserSettingSelectController, UserSettingTransformedSelectController } from '../UserSettings/UserSettingSelectController';
import { UserSettingToggleController } from '../UserSettings/UserSettingToggleController';
/**
 * A component which controls a map setting.
 */
export class MapSettingControl extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.setting = this.props.settingManager.getSetting(this.props.settingName);
    }
}
/**
 * A component which controls an on/off map setting.
 */
export class MapToggleSettingControl extends MapSettingControl {
    constructor() {
        super(...arguments);
        this.controller = new UserSettingToggleController(this.props.settingManager, this.props.settingName, [false, true]);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAfterRender() {
        this.controller.init();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        var _a;
        return (FSComponent.buildComponent(ArrowToggle, { onRegister: this.props.registerFunc, options: ['Off', 'On'], onOptionSelected: this.controller.optionSelectedHandler, dataref: this.controller.selectedIndexSub, class: `mapsettings-control ${(_a = this.props.class) !== null && _a !== void 0 ? _a : ''}` }));
    }
}
/**
 * A component which controls a map setting which can take on one of several enumerated values.
 */
export class MapEnumSettingControl extends MapSettingControl {
    constructor() {
        super(...arguments);
        this.selectControlRef = FSComponent.createRef();
        this.controller = new UserSettingSelectController(this.props.settingManager, this.props.settingName, ArraySubject.create(this.props.values), this.selectControlRef);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAfterRender() {
        this.controller.init();
    }
    /**
     * Builds a menu item definition for a setting value.
     * @param value A setting value.
     * @param index The index of the value in the menu.
     * @returns a menu item definition for the setting value.
     */
    buildMenuItem(value, index) {
        const text = this.props.valueText[index];
        return {
            id: text,
            renderContent: () => FSComponent.buildComponent("span", null, text),
            estimatedWidth: text.length * ContextMenuDialog.CHAR_WIDTH
        };
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        var _a;
        return (FSComponent.buildComponent(SelectControl, { ref: this.selectControlRef, onRegister: this.props.registerFunc, outerContainer: this.props.outerContainer, data: this.controller.values, buildMenuItem: this.buildMenuItem.bind(this), onItemSelected: this.controller.itemSelectedHandler, class: `mapsettings-control ${(_a = this.props.class) !== null && _a !== void 0 ? _a : ''}` }));
    }
}
/**
 * A component which controls a map setting with values which represent NumberUnit values.
 */
export class MapNumberUnitSettingControl extends MapSettingControl {
    constructor() {
        super(...arguments);
        this.selectControlRef = FSComponent.createRef();
        this.controller = new UserSettingTransformedSelectController(this.props.settingManager, this.props.settingName, ArraySubject.create(this.props.values), this.props.numberUnits, this.selectControlRef);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAfterRender() {
        this.controller.init();
    }
    /**
     * Builds a menu item definition for a setting value.
     * @param value The NumberUnit representation of the value.
     * @param index The index of the value in the menu.
     * @returns a menu item definition for the setting value.
     */
    buildMenuItem(value, index) {
        return {
            id: `${index}`,
            renderContent: () => {
                return (FSComponent.buildComponent(NumberUnitDisplay, { value: NumberUnitSubject.createFromNumberUnit(value.copy()), displayUnit: this.props.displayUnit, formatter: this.props.formatter }));
            },
            estimatedWidth: this.props.estimatedMaxWidth
        };
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        var _a;
        return (FSComponent.buildComponent(SelectControl, { ref: this.selectControlRef, onRegister: this.props.registerFunc, outerContainer: this.props.outerContainer, data: this.controller.transformedValues, buildMenuItem: this.buildMenuItem.bind(this), onItemSelected: this.controller.itemSelectedHandler, class: `mapsettings-control ${(_a = this.props.class) !== null && _a !== void 0 ? _a : ''}` }));
    }
}
/**
 * A component which controls a map setting with values which represent NumberUnit values.
 */
export class MapRangeSettingControl extends MapSettingControl {
    /** @inheritdoc */
    constructor(props) {
        super(props);
        this.numberUnitsSub = ArraySubject.create([]);
        this.props.mapRanges.sub(this.onMapRangesChanged.bind(this), true);
    }
    /**
     * A callback which is called when the map range values change.
     */
    onMapRangesChanged() {
        this.numberUnitsSub.set(this.props.values.map(value => this.props.mapRanges.get(value)));
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        var _a;
        return (FSComponent.buildComponent(MapNumberUnitSettingControl, { registerFunc: this.props.registerFunc, settingManager: this.props.settingManager, settingName: this.props.settingName, values: this.props.values, numberUnits: this.numberUnitsSub, displayUnit: Subject.create(null), formatter: NumberFormatter.create({ precision: 0.1, forceDecimalZeroes: false, maxDigits: 3 }), estimatedMaxWidth: ContextMenuDialog.CHAR_WIDTH * 6, outerContainer: this.props.outerContainer, class: (_a = this.props.class) !== null && _a !== void 0 ? _a : '' }));
    }
}
