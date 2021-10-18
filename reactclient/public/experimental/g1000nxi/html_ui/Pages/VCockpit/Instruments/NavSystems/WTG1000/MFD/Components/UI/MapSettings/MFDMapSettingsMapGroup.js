import { FSComponent } from 'msfssdk';
import { MapOrientationSettingMode, MapTerrainSettingMode } from '../../../../Shared/Map/MapUserSettings';
import { MapEnumSettingControl, MapRangeSettingControl } from '../../../../Shared/UI/MapSettings/MapSettingControls';
import { MFDMapSettingsGroup } from './MFDMapSettingsGroup';
import { MFDMapSettingsRow, MFDMapSingleEnumSettingRow, MFDMapToggleRangeSettingsRow, MFDMapToggleSettingRow } from './MFDMapSettingsRow';
/**
 * The 'Map' map settings group.
 */
export class MFDMapSettingsMapGroup extends MFDMapSettingsGroup {
    // eslint-disable-next-line jsdoc/require-jsdoc
    getSettingRows(containerRef) {
        return [
            FSComponent.buildComponent(MFDMapSingleEnumSettingRow, { title: 'Orientation', controlProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapOrientation',
                    values: [MapOrientationSettingMode.NorthUp, MapOrientationSettingMode.TrackUp, MapOrientationSettingMode.HeadingUp],
                    valueText: ['North up', 'Track up', 'HDG up'],
                    outerContainer: containerRef
                } }),
            FSComponent.buildComponent(MFDMapToggleRangeSettingsRow, { title: 'North Up Above', toggleProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapAutoNorthUpActive',
                }, rangeProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapAutoNorthUpRangeIndex',
                    values: Array.from({ length: 7 }, (value, index) => index + 21),
                    mapRanges: this.props.mapRanges,
                    outerContainer: containerRef
                } }),
            FSComponent.buildComponent(MFDMapSettingsTerrainRow, { title: 'Terrain Display', registerFunc: this.register, settingManager: this.props.settingManager, mapRanges: this.props.mapRanges, outerContainer: containerRef }),
            FSComponent.buildComponent(MFDMapToggleSettingRow, { title: 'Topo Scale', toggleProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapTerrainScaleShow',
                } })
        ];
    }
}
/**
 * A map settings row which controls terrain settings.
 */
class MFDMapSettingsTerrainRow extends MFDMapSettingsRow {
    // eslint-disable-next-line jsdoc/require-jsdoc
    renderLeftControl() {
        return (FSComponent.buildComponent(MapEnumSettingControl, { registerFunc: this.props.registerFunc, settingManager: this.props.settingManager, settingName: 'mapTerrainMode', values: [MapTerrainSettingMode.None, MapTerrainSettingMode.Absolute, MapTerrainSettingMode.Relative], valueText: ['Off', 'Topo', 'REL'], outerContainer: this.props.outerContainer, class: 'mfd-mapsettings-row-leftcontrol' }));
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    renderRightControl() {
        return (FSComponent.buildComponent(MapRangeSettingControl, { registerFunc: this.props.registerFunc, settingManager: this.props.settingManager, settingName: 'mapTerrainRangeIndex', values: Array.from({ length: 19 }, (value, index) => index + 9), mapRanges: this.props.mapRanges, outerContainer: this.props.outerContainer, class: 'mfd-mapsettings-row-rightcontrol' }));
    }
}
