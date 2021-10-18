import { Subject } from 'msfssdk';
/**
 * A softkey menu instance.
 */
export class SoftKeyMenu {
    /**
     * Creates an instance of a SoftKeyMenu.
     * @param menuSystem The menu system that will manage this menu.
     */
    constructor(menuSystem) {
        this.menuSystem = menuSystem;
        /** The menu items in this menu. */
        this.menuItems = [];
    }
    /**
     * Adds a menu item to the softkey menu.
     * @param index The softkey index to add the menu item to.
     * @param label The label of the menu item.
     * @param handler The handler to call when the menu item is selected.
     * @param value The value of the menu item, if any.
     * @param disabled Whether or not the menu item is disabled.
     */
    addItem(index, label, handler, value, disabled = false) {
        this.menuItems[index] = { label: Subject.create(label), handler, value: Subject.create(value), disabled: Subject.create(handler === undefined || disabled) };
    }
    /**
     * Removes a menu item from the menu.
     * @param index The softkey index to remove the menu item from.
     */
    removeItem(index) {
        this.menuItems[index] = SoftKeyMenu.EmptyMenuItem;
    }
    /**
     * Gets a menu item.
     * @param index The index of the menu item.
     * @returns The requested menu item.
     */
    getItem(index) {
        return this.menuItems[index];
    }
    /**
     * Handles a back menu action.
     */
    handleBack() {
        this.menuSystem.back();
    }
    /**
     * Iterates over the menu items.
     * @param each The function to run over each menu item.
     */
    forEach(each) {
        for (let i = 0; i < 12; i++) {
            const item = this.menuItems[i];
            each(item !== null && item !== void 0 ? item : SoftKeyMenu.EmptyMenuItem, i);
        }
    }
    /**
     * Handles when a menu item is pressed.
     * @param index The index of the menu item that was pressed.
     */
    handleItemPressed(index) {
        const menuItem = this.menuItems[index];
        if (menuItem && menuItem.handler && !menuItem.disabled.get()) {
            menuItem.handler(this);
        }
    }
}
/** An empty menu item. */
SoftKeyMenu.EmptyMenuItem = {
    label: Subject.create(''),
    handler: undefined,
    disabled: Subject.create(true),
    value: Subject.create(undefined)
};
