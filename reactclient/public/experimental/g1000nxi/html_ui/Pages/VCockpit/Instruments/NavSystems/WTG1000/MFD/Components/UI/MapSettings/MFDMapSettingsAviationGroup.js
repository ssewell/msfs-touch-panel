import { FSComponent } from 'msfssdk';
import { MFDMapSettingsGroup } from './MFDMapSettingsGroup';
import { MFDMapToggleRangeSettingsRow } from './MFDMapSettingsRow';
/**
 * The 'Aviation' map settings group.
 */
export class MFDMapSettingsAviationGroup extends MFDMapSettingsGroup {
    // eslint-disable-next-line jsdoc/require-jsdoc
    getSettingRows(containerRef) {
        return [
            FSComponent.buildComponent(MFDMapToggleRangeSettingsRow, { title: 'Large Airport', toggleProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapAirportLargeShow',
                }, rangeProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapAirportLargeRangeIndex',
                    values: Array.from({ length: 28 }, (value, index) => index),
                    mapRanges: this.props.mapRanges,
                    outerContainer: containerRef
                } }),
            FSComponent.buildComponent(MFDMapToggleRangeSettingsRow, { title: 'Medium Airport', toggleProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapAirportMediumShow',
                }, rangeProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapAirportMediumRangeIndex',
                    values: Array.from({ length: 25 }, (value, index) => index),
                    mapRanges: this.props.mapRanges,
                    outerContainer: containerRef
                } }),
            FSComponent.buildComponent(MFDMapToggleRangeSettingsRow, { title: 'Small Airport', toggleProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapAirportSmallShow',
                }, rangeProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapAirportSmallRangeIndex',
                    values: Array.from({ length: 23 }, (value, index) => index),
                    mapRanges: this.props.mapRanges,
                    outerContainer: containerRef
                } }),
            FSComponent.buildComponent(MFDMapToggleRangeSettingsRow, { title: 'INT', toggleProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapIntersectionShow',
                }, rangeProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapIntersectionRangeIndex',
                    values: Array.from({ length: 10 }, (value, index) => index + 9),
                    mapRanges: this.props.mapRanges,
                    outerContainer: containerRef
                } }),
            FSComponent.buildComponent(MFDMapToggleRangeSettingsRow, { title: 'NDB', toggleProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapNdbShow',
                }, rangeProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapNdbRangeIndex',
                    values: Array.from({ length: 11 }, (value, index) => index + 9),
                    mapRanges: this.props.mapRanges,
                    outerContainer: containerRef
                } }),
            FSComponent.buildComponent(MFDMapToggleRangeSettingsRow, { title: 'VOR', toggleProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapVorShow',
                }, rangeProps: {
                    registerFunc: this.register,
                    settingManager: this.props.settingManager,
                    settingName: 'mapVorRangeIndex',
                    values: Array.from({ length: 15 }, (value, index) => index + 9),
                    mapRanges: this.props.mapRanges,
                    outerContainer: containerRef
                } })
        ];
    }
}