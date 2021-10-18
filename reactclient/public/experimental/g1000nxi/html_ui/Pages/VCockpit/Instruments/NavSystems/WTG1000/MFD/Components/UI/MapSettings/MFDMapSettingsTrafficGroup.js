import { FSComponent } from 'msfssdk';
import { MapTrafficAlertLevelMode } from '../../../../Shared/Map/Modules/MapTrafficModule';
import { MFDMapSettingsGroup } from './MFDMapSettingsGroup';
import { MFDMapRangeSettingRow, MFDMapSingleEnumSettingRow, MFDMapToggleRangeSettingsRow, MFDMapToggleSettingRow } from './MFDMapSettingsRow';
/**
 * The 'Aviation' map settings group.
 */
export class MFDMapSettingsTrafficGroup extends MFDMapSettingsGroup {
    // eslint-disable-next-line jsdoc/require-jsdoc
    getSettingRows(containerRef) {
        return [
            FSComponent.buildComponent(MFDMapToggleSettingRow, { title: 'Traffic', toggleProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapTrafficShow',
                } }),
            FSComponent.buildComponent(MFDMapSingleEnumSettingRow, { title: 'Traffic Mode', controlProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapTrafficAlertLevelMode',
                    values: [MapTrafficAlertLevelMode.All, MapTrafficAlertLevelMode.Advisories, MapTrafficAlertLevelMode.TA_RA],
                    valueText: ['All Traffic', 'TA/PA', 'TA Only'],
                    outerContainer: containerRef
                } }),
            FSComponent.buildComponent(MFDMapRangeSettingRow, { title: 'Traffic Symbols', rangeProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapTrafficRangeIndex',
                    values: Array.from({ length: 19 }, (value, index) => index + 9),
                    mapRanges: this.props.mapRanges,
                    outerContainer: containerRef
                } }),
            FSComponent.buildComponent(MFDMapToggleRangeSettingsRow, { title: 'Traffic Labels', toggleProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapTrafficLabelShow',
                }, rangeProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapTrafficLabelRangeIndex',
                    values: Array.from({ length: 19 }, (value, index) => index + 9),
                    mapRanges: this.props.mapRanges,
                    outerContainer: containerRef
                } })
        ];
    }
}
