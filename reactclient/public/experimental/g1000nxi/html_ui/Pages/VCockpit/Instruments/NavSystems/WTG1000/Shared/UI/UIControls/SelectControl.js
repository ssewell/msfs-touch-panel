import { DisplayComponent, FSComponent, Subject } from 'msfssdk';
import { Fms } from '../../FlightPlan/Fms';
import { ContextMenuDialog, ContextMenuPosition } from '../Dialogs/ContextMenuDialog';
import { UiControl } from '../UiControl';
/**
 * A control which allows the user to select one of multiple items through a pop-up dialog and which also displays the
 * currently selected value.
 */
export class SelectControl extends UiControl {
    constructor() {
        super(...arguments);
        this.valueRef = FSComponent.createRef();
        this.renderedValueNode = null;
        this.MenuItems = [];
        this.SelectedValue = Subject.create(-1);
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        super.onAfterRender();
        this.SelectedValue.sub(this.renderSelectedItem.bind(this));
        this.props.data.sub(() => {
            this.MenuItems = this.buildMenuItems();
            this.SelectedValue.set((this.MenuItems.length > 0) ? 0 : -1);
            this.setIsEnabled(this.MenuItems.length > 0);
            const selectedIndex = this.SelectedValue.get();
            this.renderSelectedItem(selectedIndex);
            this.props.onItemSelected(selectedIndex, this.props.data.tryGet(selectedIndex), true);
        }, true);
        this.isEnabledSubject.sub((v) => {
            if (v) {
                this.valueRef.instance.classList.add('cyan');
            }
            else {
                this.valueRef.instance.classList.remove('cyan');
            }
        });
    }
    /** @inheritdoc */
    onUpperKnob() {
        var _a, _b, _c;
        // open dialog
        if (this.MenuItems.length > 0) {
            const selectCb = (sender, index) => {
                this.SelectedValue.set(index);
                this.props.onItemSelected(index, this.props.data.tryGet(index), false);
            };
            this.activate();
            const dialogOptions = {
                items: this.MenuItems,
                element: this.valueRef.instance,
                position: (_a = this.props.dialogPosition) !== null && _a !== void 0 ? _a : ContextMenuPosition.BOTTOM,
                outerContainer: this.props.outerContainer.instance,
                initialScrollPosition: (_c = (_b = this.props.dialogScrollStartIndex) === null || _b === void 0 ? void 0 : _b.get()) !== null && _c !== void 0 ? _c : this.SelectedValue.get()
            };
            const dialog = Fms.viewService.open(ContextMenuDialog.name, true).setInput(dialogOptions);
            dialog.onAccept.on(selectCb);
            dialog.onClose.on(() => {
                this.deactivate();
            });
        }
    }
    /**
     * Builds the menu item definitions.
     * @returns An array of menu item definitions.
     */
    buildMenuItems() {
        const defs = [];
        const dataLen = this.props.data.length;
        for (let i = 0; i < dataLen; i++) {
            defs.push(this.props.buildMenuItem(this.props.data.get(i), i));
        }
        return defs;
    }
    /**
     * Renders the selected item.
     * @param index The index of the selected item.
     */
    renderSelectedItem(index) {
        var _a, _b;
        while (this.valueRef.instance.firstChild) {
            this.valueRef.instance.removeChild(this.valueRef.instance.firstChild);
        }
        if (this.renderedValueNode) {
            if (this.renderedValueNode.instance instanceof DisplayComponent) {
                this.renderedValueNode.instance.destroy();
            }
            this.renderedValueNode = null;
        }
        const item = this.props.data.tryGet(index);
        const node = item === undefined
            ? FSComponent.buildComponent("span", null, (_b = (_a = this.props.nullSelectionText) === null || _a === void 0 ? void 0 : _a.get()) !== null && _b !== void 0 ? _b : 'NONE')
            : this.props.renderSelectedItem
                ? this.props.renderSelectedItem(item, index)
                : this.MenuItems[index].renderContent();
        FSComponent.render(node, this.valueRef.instance);
        this.renderedValueNode = node;
    }
    /** @inheritdoc */
    renderControl() {
        return (FSComponent.buildComponent("div", { ref: this.valueRef }));
    }
}
