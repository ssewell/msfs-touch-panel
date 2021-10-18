import { ArraySubject, FSComponent } from 'msfssdk';
import { MapUserSettings } from '../../../../Shared/Map/MapUserSettings';
import { ContextMenuDialog } from '../../../../Shared/UI/Dialogs/ContextMenuDialog';
import { SelectControl } from '../../../../Shared/UI/UIControls/SelectControl';
import { UiView } from '../../../../Shared/UI/UiView';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { GroupBox } from '../GroupBox';
import { NavMapRangeTargetRotationController } from '../../../../Shared/UI/NavMap/NavMapComponent';
import { MFDMapSettingsMapGroup } from './MFDMapSettingsMapGroup';
import { MFDMapSettingsWeatherGroup } from './MFDMapSettingsWeatherGroup';
import { MFDMapSettingsAviationGroup } from './MFDMapSettingsAviationGroup';
import { MFDMapSettingsTrafficGroup } from './MFDMapSettingsTrafficGroup';
import './MFDMapSettings.css';
/**
 * The MFD map settings menu.
 */
export class MFDMapSettings extends UiView {
    constructor() {
        super(...arguments);
        this.groupRefs = {
            ['Map']: FSComponent.createRef(),
            ['Weather']: FSComponent.createRef(),
            ['Traffic']: FSComponent.createRef(),
            ['Aviation']: FSComponent.createRef(),
            ['Airspace']: FSComponent.createRef(),
            ['Airways']: FSComponent.createRef(),
            ['Land']: FSComponent.createRef(),
            ['VSD']: FSComponent.createRef()
        };
        this.settingManager = MapUserSettings.getMfdManager(this.props.bus);
        this.mapRangesSub = ArraySubject.create(NavMapRangeTargetRotationController.DEFAULT_MAP_RANGES.slice());
        this.activeGroup = null;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onInteractionEvent(evt) {
        switch (evt) {
            case FmsHEvent.UPPER_PUSH:
            case FmsHEvent.CLR:
                this.close();
                return true;
        }
        return false;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewOpened() {
        this.props.menuSystem.pushMenu('empty');
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewClosed() {
        this.props.menuSystem.back();
    }
    /**
     * Builds a menu item definition for a group item.
     * @param item A group item.
     * @returns a menu item definition for the group item.
     */
    buildGroupMenuItem(item) {
        return {
            id: item,
            renderContent: () => FSComponent.buildComponent("span", null, item),
            estimatedWidth: item.length * ContextMenuDialog.CHAR_WIDTH,
            isEnabled: item === 'Map' || item === 'Weather' || item === 'Aviation' || item === 'Traffic'
        };
    }
    /**
     * A callback which is called when a group item is selected.
     * @param index The index of the selected item.
     * @param item The selected item.
     */
    onGroupItemSelected(index, item) {
        const selectedGroup = item === undefined ? null : this.groupRefs[item].instance;
        if (selectedGroup !== this.activeGroup) {
            if (this.activeGroup) {
                this.activeGroup.hide();
                this.scrollController.unregisterCtrl(this.activeGroup);
            }
            if (selectedGroup) {
                this.scrollController.registerCtrl(selectedGroup);
                selectedGroup.show();
            }
            this.activeGroup = selectedGroup;
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent("div", { ref: this.viewContainerRef, class: 'popout-dialog mfd-mapsettings' },
            FSComponent.buildComponent("h1", null, this.props.title),
            FSComponent.buildComponent(GroupBox, { title: 'Group' },
                FSComponent.buildComponent(SelectControl, { onRegister: this.register, outerContainer: this.viewContainerRef, data: ArraySubject.create(MFDMapSettings.GROUP_ITEMS), buildMenuItem: this.buildGroupMenuItem.bind(this), onItemSelected: this.onGroupItemSelected.bind(this) })),
            FSComponent.buildComponent("div", { class: 'mfd-mapsettings-groupcontainer' },
                FSComponent.buildComponent(MFDMapSettingsMapGroup, { ref: this.groupRefs['Map'], settingManager: this.settingManager, mapRanges: this.mapRangesSub }),
                FSComponent.buildComponent(MFDMapSettingsWeatherGroup, { ref: this.groupRefs['Weather'], settingManager: this.settingManager, mapRanges: this.mapRangesSub }),
                FSComponent.buildComponent(MFDMapSettingsAviationGroup, { ref: this.groupRefs['Aviation'], settingManager: this.settingManager, mapRanges: this.mapRangesSub }),
                FSComponent.buildComponent(MFDMapSettingsTrafficGroup, { ref: this.groupRefs['Traffic'], settingManager: this.settingManager, mapRanges: this.mapRangesSub }))));
    }
}
MFDMapSettings.GROUP_ITEMS = ['Map', 'Weather', 'Traffic', 'Aviation', 'Airspace', 'Airways', 'Land', 'VSD'];
