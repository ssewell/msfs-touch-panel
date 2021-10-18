import { SoftKeyMenu } from './SoftKeyMenu';
/**
 * A system that manages the Garmin softkey menus.
 */
export class MenuSystem {
    /**
     * Creates an instance of the MenuSystem.
     * @param bus The event bus to use with this instance.
     * @param hEventPrefix The event prefix to use for the softkey H Events.
     */
    constructor(bus, hEventPrefix) {
        this.bus = bus;
        /** The current menu stack. */
        this.menuStack = [new SoftKeyMenu(this)];
        /**The currently registered menus. */
        this.registeredMenus = {};
        this.subscriber = bus.getSubscriber();
        this.subscriber.on('hEvent').handle(hEvent => {
            if (hEvent.startsWith(hEventPrefix)) {
                this.handleSoftKey(hEvent);
            }
        });
        this.hEventPrefix = hEventPrefix;
    }
    /**
     * The current menu on the stack.
     * @returns The current menu.
     */
    get currentMenu() {
        return this.menuStack[this.menuStack.length - 1];
    }
    /**
     * Adds a menu to the menu system.
     * @param name The route to the menu to add this menu entry to.
     * @param entry The menu entry to add.
     */
    addMenu(name, entry) {
        this.registeredMenus[name] = entry;
    }
    /**
     * Pushes a menu onto the menu system stack.
     * @param name The name of the menu to push.
     */
    pushMenu(name) {
        this.menuStack.push(this.registeredMenus[name]);
        this.renderToSoftKeys();
    }
    /**
     * Replaces one menu with another on top of the stack.
     * @param name The name of the menu to activate.
     */
    replaceMenu(name) {
        if (this.menuStack.length > 1) {
            this.menuStack.pop();
        }
        this.menuStack.push(this.registeredMenus[name]);
        this.renderToSoftKeys();
    }
    /**
     * Pops a menu off the stack and returns to the previous menu.
     */
    back() {
        if (this.menuStack.length === 1) {
            // do not pop the base empty menu.
            return;
        }
        this.menuStack.pop();
        this.renderToSoftKeys();
    }
    /**
     * Clears the menu stack.
     */
    clear() {
        this.menuStack.length = 1;
        this.renderToSoftKeys();
    }
    /**
     * Attaches the softkeys display component to the menu system.
     * @param softKeys The softkeys display component instance.
     */
    attachSoftKeys(softKeys) {
        this.softKeys = softKeys;
        this.renderToSoftKeys();
    }
    /**
     * Renders the current menu to the softkeys.
     */
    renderToSoftKeys() {
        this.currentMenu.forEach((item, index) => {
            var _a;
            (_a = this.softKeys) === null || _a === void 0 ? void 0 : _a.setMenuItem(index, item);
        });
    }
    /**
     * Handles a softkey HEvent and delgates to the handler.
     * @param hEvent The HEvent to handle.
     */
    handleSoftKey(hEvent) {
        const softKeyIndex = parseInt(hEvent.replace(this.hEventPrefix, '')) - 1;
        this.currentMenu.handleItemPressed(softKeyIndex);
    }
}
