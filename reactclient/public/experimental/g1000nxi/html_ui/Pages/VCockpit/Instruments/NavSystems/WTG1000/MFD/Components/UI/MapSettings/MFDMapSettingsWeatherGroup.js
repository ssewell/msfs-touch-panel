import { FSComponent } from 'msfssdk';
import { MFDMapSettingsGroup } from './MFDMapSettingsGroup';
import { MFDMapToggleRangeSettingsRow } from './MFDMapSettingsRow';
/**
 * The 'Weather' map settings group.
 */
export class MFDMapSettingsWeatherGroup extends MFDMapSettingsGroup {
    // eslint-disable-next-line jsdoc/require-jsdoc, @typescript-eslint/no-unused-vars
    getSettingRows(containerRef) {
        return [
            FSComponent.buildComponent(MFDMapToggleRangeSettingsRow, { title: 'NEXRAD Data', toggleProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapNexradShow',
                }, rangeProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapNexradRangeIndex',
                    values: Array.from({ length: 19 }, (value, index) => index + 9),
                    mapRanges: this.props.mapRanges,
                    outerContainer: containerRef
                } })
        ];
    }
}
