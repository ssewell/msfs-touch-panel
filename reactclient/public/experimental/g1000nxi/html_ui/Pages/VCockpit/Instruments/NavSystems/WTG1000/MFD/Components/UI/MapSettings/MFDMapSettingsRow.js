import { DisplayComponent, FSComponent } from 'msfssdk';
import { MapEnumSettingControl, MapRangeSettingControl, MapToggleSettingControl } from '../../../../Shared/UI/MapSettings/MapSettingControls';
import './MFDMapSettingsRow.css';
/**
 * A settings row for a MFDMapSettingsMapGroup. Each row has a title and up to two setting controls.
 */
export class MFDMapSettingsRow extends DisplayComponent {
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent("div", { class: 'mfd-mapsettings-row' },
            FSComponent.buildComponent("div", { class: 'mfd-mapsettings-row-title' }, this.props.title),
            this.renderLeftControl(),
            this.renderRightControl()));
    }
}
/**
 * A row which contains a single enum setting control.
 */
export class MFDMapSingleEnumSettingRow extends MFDMapSettingsRow {
    // eslint-disable-next-line jsdoc/require-jsdoc
    renderLeftControl() {
        return (FSComponent.buildComponent(MapEnumSettingControl, { registerFunc: this.props.controlProps.registerFunc, settingManager: this.props.controlProps.settingManager, settingName: this.props.controlProps.settingName, values: this.props.controlProps.values, valueText: this.props.controlProps.valueText, outerContainer: this.props.controlProps.outerContainer, class: 'mfd-mapsettings-row-leftcontrol' }));
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    renderRightControl() {
        return null;
    }
}
/**
 * A map settings row which contains a toggle setting control.
 */
export class MFDMapToggleSettingRow extends MFDMapSettingsRow {
    // eslint-disable-next-line jsdoc/require-jsdoc
    renderLeftControl() {
        return (FSComponent.buildComponent(MapToggleSettingControl, { registerFunc: this.props.toggleProps.registerFunc, settingManager: this.props.toggleProps.settingManager, settingName: this.props.toggleProps.settingName, class: 'mfd-mapsettings-row-leftcontrol' }));
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    renderRightControl() {
        return null;
    }
}
/**
 * A map settings row which contains a map range setting control.
 */
export class MFDMapRangeSettingRow extends MFDMapSettingsRow {
    // eslint-disable-next-line jsdoc/require-jsdoc
    renderLeftControl() {
        return FSComponent.buildComponent("div", { style: 'visibility: hidden;' });
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    renderRightControl() {
        return (FSComponent.buildComponent(MapRangeSettingControl, { registerFunc: this.props.rangeProps.registerFunc, settingManager: this.props.rangeProps.settingManager, settingName: this.props.rangeProps.settingName, values: this.props.rangeProps.values, mapRanges: this.props.rangeProps.mapRanges, outerContainer: this.props.rangeProps.outerContainer, class: 'mfd-mapsettings-row-rightcontrol' }));
    }
}
/**
 * A map settings row which contains a toggle setting control and a map range setting control.
 */
export class MFDMapToggleRangeSettingsRow extends MFDMapToggleSettingRow {
    // eslint-disable-next-line jsdoc/require-jsdoc
    renderRightControl() {
        return (FSComponent.buildComponent(MapRangeSettingControl, { registerFunc: this.props.rangeProps.registerFunc, settingManager: this.props.rangeProps.settingManager, settingName: this.props.rangeProps.settingName, values: this.props.rangeProps.values, mapRanges: this.props.rangeProps.mapRanges, outerContainer: this.props.rangeProps.outerContainer, class: 'mfd-mapsettings-row-rightcontrol' }));
    }
}
