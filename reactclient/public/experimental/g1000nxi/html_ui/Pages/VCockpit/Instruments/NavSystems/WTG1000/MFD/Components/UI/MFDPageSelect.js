import { ArraySubject, FSComponent } from 'msfssdk';
import { PopoutMenuItem } from '../../../Shared/UI/Dialogs/PopoutMenuItem';
import { FmsHEvent } from '../../../Shared/UI/FmsHEvent';
import { List } from '../../../Shared/UI/List';
import { UiView } from '../../../Shared/UI/UiView';
import './MFDPageSelect.css';
/**
 * A pop-up which allows the user to select the open MFD page.
 */
export class MFDPageSelect extends UiView {
    /** @inheritdoc */
    constructor(props) {
        super(props);
        this.listRef = FSComponent.createRef();
        this.tabRefs = [
            FSComponent.createRef(),
            FSComponent.createRef(),
            FSComponent.createRef(),
            FSComponent.createRef(),
            FSComponent.createRef()
        ];
        this.listItemDefs = MFDPageSelect.PAGE_GROUPS.map(defs => defs.map(this.buildListItemDefinition.bind(this)));
        this.listDataSub = ArraySubject.create();
        this.activeGroupIndex = -1;
        this.lastSelectedIndex = [0, 0, 0, 0, 0];
        this.ignoreSelection = false;
        this.openTimer = null;
        props.upperKnobCanScroll = true;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAfterRender() {
        this.props.viewService.openPageKey.sub(key => {
            let itemIndex = -1;
            const groupIndex = this.listItemDefs.findIndex(defs => (itemIndex = defs.findIndex(def => def.isEnabled && def.id === key)) >= 0);
            if (groupIndex >= 0) {
                this.setActiveGroup(groupIndex, itemIndex);
            }
        }, true);
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
    processScrollEvent(evt) {
        switch (evt) {
            case FmsHEvent.UPPER_INC:
                this.listRef.instance.processHEvent(FmsHEvent.LOWER_INC);
                break;
            case FmsHEvent.UPPER_DEC:
                this.listRef.instance.processHEvent(FmsHEvent.LOWER_DEC);
                break;
            case FmsHEvent.LOWER_INC:
                this.cycleActiveGroup(1);
                break;
            case FmsHEvent.LOWER_DEC:
                this.cycleActiveGroup(-1);
                break;
        }
        this.resetOpenTimer();
        return true;
    }
    /**
     * Cycles through the list of page groups to set the active page group.
     * @param delta The direction in which to cycle through the groups.
     */
    cycleActiveGroup(delta) {
        this.setActiveGroup(Utils.Clamp(this.activeGroupIndex + delta, 0, 4));
    }
    /**
     * Sets the active page group.
     * @param groupIndex The index of the new active group.
     * @param itemIndex The index of the group list item to which to initially scroll. Defaults to 0.
     */
    setActiveGroup(groupIndex, itemIndex) {
        var _a, _b, _c;
        if (groupIndex === this.activeGroupIndex) {
            return;
        }
        this.ignoreSelection = true;
        this.listDataSub.set(this.listItemDefs[groupIndex]);
        this.listRef.instance.scrollToIndex(itemIndex !== null && itemIndex !== void 0 ? itemIndex : this.lastSelectedIndex[groupIndex]);
        this.ignoreSelection = false;
        const index = this.listRef.instance.getSelectedIndex();
        this.onListItemSelected((_a = this.listDataSub.tryGet(index)) !== null && _a !== void 0 ? _a : null, this.listRef.instance.getListItemInstance(index), index);
        (_b = this.tabRefs[this.activeGroupIndex]) === null || _b === void 0 ? void 0 : _b.instance.classList.remove('active-tab');
        (_c = this.tabRefs[groupIndex]) === null || _c === void 0 ? void 0 : _c.instance.classList.add('active-tab');
        this.activeGroupIndex = groupIndex;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewOpened() {
        this.resetOpenTimer();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewClosed() {
        this.clearOpenTimer();
    }
    /**
     * Resets the open timer.
     */
    resetOpenTimer() {
        this.clearOpenTimer();
        this.openTimer = setTimeout(() => {
            this.openTimer = null;
            this.close();
        }, MFDPageSelect.OPEN_TIME);
    }
    /**
     * Clears the open timer.
     */
    clearOpenTimer() {
        if (this.openTimer !== null) {
            clearTimeout(this.openTimer);
            this.openTimer = null;
        }
    }
    /**
     * Builds a MenuItemDefinition from a page list item definition.
     * @param def A page list item definition.
     * @returns A MenuItemDefinition.
     */
    buildListItemDefinition(def) {
        return {
            id: def.key,
            renderContent: () => FSComponent.buildComponent("span", null, def.name),
            isEnabled: def.key !== '',
            action: () => {
                this.props.viewService.open(def.key);
            }
        };
    }
    /**
     * Renders a list item.
     * @param d The item definition.
     * @param registerFn The register function.
     * @returns The rendered list item.
     */
    renderListItem(d, registerFn) {
        return FSComponent.buildComponent(PopoutMenuItem, { onRegister: registerFn, parent: this, def: d });
    }
    /**
     * A callback which is called when a list item is selected.
     * @param d The selected item.
     * @param element The control associated with the selected item.
     * @param index The index of the selected item.
     */
    onListItemSelected(d, element, index) {
        if (this.ignoreSelection || !d) {
            return;
        }
        this.lastSelectedIndex[this.activeGroupIndex] = index;
        if (this.props.viewService.openPageKey.get() === d.id) {
            return;
        }
        this.props.viewService.open(d.id);
        this.props.viewService.open('PageSelect');
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent("div", { ref: this.viewContainerRef, class: 'popout-dialog mfd-pageselect' },
            FSComponent.buildComponent(List, { ref: this.listRef, data: this.listDataSub, renderItem: this.renderListItem.bind(this), onItemSelected: this.onListItemSelected.bind(this), class: 'mfd-pageselect-group' }),
            FSComponent.buildComponent("div", { class: 'mfd-pageselect-tabs' },
                FSComponent.buildComponent("div", { ref: this.tabRefs[0] }, "Map"),
                FSComponent.buildComponent("div", { ref: this.tabRefs[1] }, "WPT"),
                FSComponent.buildComponent("div", { ref: this.tabRefs[2] }, "Aux"),
                FSComponent.buildComponent("div", { ref: this.tabRefs[3] }, "FPL"),
                FSComponent.buildComponent("div", { ref: this.tabRefs[4] }, "NRST"))));
    }
}
MFDPageSelect.OPEN_TIME = 3000; // ms
MFDPageSelect.PAGE_GROUPS = [
    [
        { name: 'Navigation Map', key: 'NavMapPage' },
        { name: 'IFR/VFR Charts', key: '' },
        { name: 'Traffic Map', key: 'TrafficPage' },
        { name: 'Weather Data Link', key: '' },
        { name: 'TAWS-B', key: '' }
    ],
    [
        { name: 'Airport Information', key: '' },
        { name: 'Intersection Information', key: '' },
        { name: 'NDB Information', key: '' },
        { name: 'VOR Information', key: '' },
        { name: 'VRP Information', key: '' },
        { name: 'User WPT Information', key: '' }
    ],
    [
        { name: 'Trip Planning', key: '' },
        { name: 'Utility', key: '' },
        { name: 'GPS Status', key: '' },
        { name: 'System Setup', key: '' },
        { name: 'XM Radio', key: '' },
        { name: 'System Status', key: '' },
        { name: 'Connext Setup', key: '' },
        { name: 'Databases', key: '' }
    ],
    [
        { name: 'Active Flight Plan', key: 'FPLPage' },
        { name: 'Flight Plan Catalog', key: '' }
    ],
    [
        { name: 'Nearest Airports', key: '' },
        { name: 'Nearest Intersections', key: '' },
        { name: 'Nearest NDB', key: '' },
        { name: 'Nearest VOR', key: '' },
        { name: 'Nearest VRP', key: '' },
        { name: 'Nearest User WPTs', key: '' },
        { name: 'Nearest Frequencies', key: '' },
        { name: 'Nearest Airspaces', key: '' }
    ]
];
