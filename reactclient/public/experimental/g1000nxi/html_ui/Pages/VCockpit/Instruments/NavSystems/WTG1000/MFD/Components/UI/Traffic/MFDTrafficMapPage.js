import { FSComponent } from 'msfssdk';
import { MapRangeSettings } from '../../../../Shared/Map/MapRangeSettings';
import { TrafficAltitudeModeSetting, TrafficOperatingModeSetting, TrafficUserSettings } from '../../../../Shared/Traffic/TrafficUserSettings';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { TrafficMapModel } from '../../../../Shared/UI/TrafficMap/TrafficMapModel';
import { MFDUiPage } from '../MFDUiPage';
import { MFDTrafficMapComponent } from './MFDTrafficMapComponent';
import './MFDTrafficMapPage.css';
/**
 * The MFD traffic map page.
 */
export class MFDTrafficMapPage extends MFDUiPage {
    /** @inheritdoc */
    constructor(props) {
        super(props);
        this.mapRef = FSComponent.createRef();
        this.mapModel = TrafficMapModel.createModel(this.props.tas);
        this.mapRangeSettingManager = MapRangeSettings.getManager(this.props.bus);
        this.mapRangeSetting = this.mapRangeSettingManager.getSetting('mfdMapRangeIndex');
        this.trafficSettingManager = TrafficUserSettings.getManager(this.props.bus);
        this.pageMenuItems = [
            {
                id: 'tas-operate',
                renderContent: () => FSComponent.buildComponent("span", null,
                    "TAS ",
                    this.trafficSettingManager.getSetting('trafficOperatingMode').value === TrafficOperatingModeSetting.Operating ? 'Standby' : 'Operate',
                    " Mode"),
                action: () => { this.trafficSettingManager.getSetting('trafficOperatingMode').value = TrafficOperatingModeSetting.Operating; }
            },
            {
                id: 'test',
                renderContent: () => FSComponent.buildComponent("span", null, "Test Mode"),
                isEnabled: false
            },
            {
                id: 'below',
                renderContent: () => FSComponent.buildComponent("span", null, "Below"),
                action: () => { this.trafficSettingManager.getSetting('trafficAltitudeMode').value = TrafficAltitudeModeSetting.Below; },
                isEnabled: this.trafficSettingManager.getSetting('trafficAltitudeMode').value !== TrafficAltitudeModeSetting.Below
            },
            {
                id: 'normal',
                renderContent: () => FSComponent.buildComponent("span", null, "Normal"),
                action: () => { this.trafficSettingManager.getSetting('trafficAltitudeMode').value = TrafficAltitudeModeSetting.Normal; },
                isEnabled: this.trafficSettingManager.getSetting('trafficAltitudeMode').value !== TrafficAltitudeModeSetting.Normal
            },
            {
                id: 'above',
                renderContent: () => FSComponent.buildComponent("span", null, "Above"),
                action: () => { this.trafficSettingManager.getSetting('trafficAltitudeMode').value = TrafficAltitudeModeSetting.Above; },
                isEnabled: this.trafficSettingManager.getSetting('trafficAltitudeMode').value !== TrafficAltitudeModeSetting.Above
            },
            {
                id: 'unrestricted',
                renderContent: () => FSComponent.buildComponent("span", null, "Unrestricted"),
                action: () => { this.trafficSettingManager.getSetting('trafficAltitudeMode').value = TrafficAltitudeModeSetting.Unrestricted; },
                isEnabled: this.trafficSettingManager.getSetting('trafficAltitudeMode').value !== TrafficAltitudeModeSetting.Unrestricted
            },
        ];
        this._title.set('Map – Traffic Map');
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAfterRender() {
        super.onAfterRender();
        this.mapRef.instance.sleep();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onInteractionEvent(evt) {
        switch (evt) {
            case FmsHEvent.RANGE_DEC:
                this.changeMapRangeIndex(-1);
                return true;
            case FmsHEvent.RANGE_INC:
                this.changeMapRangeIndex(1);
                return true;
        }
        return super.onInteractionEvent(evt);
    }
    /**
     * Changes the MFD map range index setting.
     * @param delta The change in index to apply.
     */
    changeMapRangeIndex(delta) {
        const ranges = this.mapModel.getModule('range').nominalRanges.get();
        const currentIndex = this.mapRangeSetting.value;
        const currentRange = ranges[currentIndex];
        let index = currentIndex;
        let newIndex = currentIndex;
        if (delta === 1) {
            while (++index < ranges.length) {
                if (!ranges[index].equals(currentRange)) {
                    newIndex = index;
                    break;
                }
            }
        }
        else {
            while (--index >= 0) {
                if (!ranges[index].equals(currentRange)) {
                    newIndex = index;
                    break;
                }
            }
        }
        this.mapRangeSetting.value = newIndex;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewOpened() {
        this.props.menuSystem.clear();
        this.props.menuSystem.pushMenu('traffic-root');
        this.mapRef.instance.wake();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewClosed() {
        super.onViewClosed();
        this.mapRef.instance.sleep();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onMenuPressed() {
        this.props.menuSystem.pushMenu('empty');
        const pageMenu = this.props.viewService.open('PageMenuDialog');
        pageMenu.setMenuItems(this.pageMenuItems);
        pageMenu.onClose.on(() => { this.props.menuSystem.back(); });
        return true;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent("div", { ref: this.viewContainerRef, class: 'mfd-page' },
            FSComponent.buildComponent(MFDTrafficMapComponent, { ref: this.mapRef, model: this.mapModel, bus: this.props.bus, updateFreq: MFDTrafficMapPage.UPDATE_FREQ, projectedWidth: 876, projectedHeight: 678, flightPlanner: this.props.flightPlanner, id: 'mfd_trafficmap', ownAirplaneLayerProps: {
                    imageFilePath: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/own_airplane_icon.svg',
                    iconSize: 40,
                    iconAnchor: new Float64Array([0.5, 0])
                }, trafficIntruderLayerProps: {
                    fontSize: 28,
                    iconSize: 52
                }, class: 'mfd-trafficmap' })));
    }
}
MFDTrafficMapPage.UPDATE_FREQ = 30; // Hz
