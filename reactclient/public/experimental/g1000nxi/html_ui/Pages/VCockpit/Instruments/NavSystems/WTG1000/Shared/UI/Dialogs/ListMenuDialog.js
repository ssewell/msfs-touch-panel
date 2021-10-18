import { FSComponent, ArraySubject } from 'msfssdk';
import { ScrollBar } from '../ScrollBar';
import { PopoutMenuItem } from '../../../Shared/UI/Dialogs/PopoutMenuItem';
import { List } from '../../../Shared/UI/List';
import { FmsHEvent } from '../FmsHEvent';
import { UiView } from '../UiView';
import './ListMenuDialog.css';
/** The list menu popout. */
export class ListMenuDialog extends UiView {
    constructor() {
        super(...arguments);
        this.listRef = FSComponent.createRef();
        this.listContainerRef = FSComponent.createRef();
        this.menuItems = this.buildMenuItems();
        this.menuItemsSubject = ArraySubject.create(this.menuItems);
        /**
         * A callback called to render the menu items.
         * @param d is the menu item
         * @param registerFn The register function.
         * @returns a vnode for display in the menu
         */
        this.renderItem = (d, registerFn) => {
            return FSComponent.buildComponent(PopoutMenuItem, { onRegister: registerFn, parent: this, def: d });
        };
    }
    /** @inheritdoc */
    onInteractionEvent(evt) {
        switch (evt) {
            case FmsHEvent.CLR:
                this.close();
                return true;
        }
        return false;
    }
    /**
     * Gets the menu item definitions for the list.
     * @returns menu item definitions.
     */
    buildMenuItems() {
        return [];
    }
    /**
     * Sets the menu items for the list menu dialog.
     * @param items The items to set into the menu.
     */
    setMenuItems(items) {
        this.menuItems = items;
        this.menuItemsSubject.clear();
        this.menuItemsSubject.set(items);
        this.scrollController.gotoFirst();
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        let className = 'popout-dialog';
        if (this.props.isMfd) {
            className = 'MFD-' + className;
        }
        if (this.props.class !== undefined) {
            className += ` ${this.props.class}`;
        }
        return (FSComponent.buildComponent("div", { class: className, ref: this.viewContainerRef },
            FSComponent.buildComponent("h1", null, this.props.title),
            FSComponent.buildComponent("div", { class: "popout-menu-container", ref: this.listContainerRef },
                FSComponent.buildComponent(List, { ref: this.listRef, onRegister: this.register, data: this.menuItemsSubject, renderItem: this.renderItem, scrollContainer: this.listContainerRef })),
            FSComponent.buildComponent(ScrollBar, null)));
    }
}
