import { DisplayComponent, FSComponent, NodeReference } from 'msfssdk';
import { SoftKeyMenu } from './SoftKeyMenu';
import './SoftKey.css';
/**
 * A softkey tab in the soft key bar interface.
 */
export class SoftKey extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.menuItem = SoftKeyMenu.EmptyMenuItem;
        this.rootEl = new NodeReference();
        this.labelEl = new NodeReference();
        this.indicatorEl = new NodeReference();
        this.valueEl = new NodeReference();
        /**
         * Menu item value changed handler.
         * @param v the new value
         */
        this.menuItemValueChangedHandler = (v) => {
            if (typeof v === 'string') {
                this.showIndicator(false);
                this.indicate(false);
                this.valueEl.instance.style.display = '';
                this.valueEl.instance.textContent = v;
                this.labelEl.instance.classList.add('text-value');
            }
            else if (typeof v === 'boolean') {
                this.showIndicator(true);
                this.valueEl.instance.style.display = 'none';
                this.labelEl.instance.classList.remove('text-value');
                this.valueEl.instance.textContent = '';
                this.indicate(v);
            }
            else {
                this.showIndicator(false);
                this.valueEl.instance.textContent = '';
                this.valueEl.instance.style.display = 'none';
                this.labelEl.instance.classList.remove('text-value');
            }
        };
        /**
         * Sets the css class to make the soft key look disabled.
         * @param isDisabled Whether or not the soft key is disabled.
         */
        this.setDisabled = (isDisabled) => {
            if (isDisabled) {
                this.rootEl.instance.classList.add('text-disabled');
            }
            else {
                this.rootEl.instance.classList.remove('text-disabled');
            }
        };
        /**
         * Sets the text of this soft key.
         * @param text the text
         */
        this.setLabel = (text) => {
            this.labelEl.instance.textContent = text;
        };
    }
    /** @inheritdoc */
    onAfterRender() {
        super.onAfterRender();
        this.setMenuItem(this.props.menuItem);
    }
    /**
     * Sets and binds a menu item to this soft key.
     * @param item the menu item
     */
    setMenuItem(item) {
        // remove former subs
        this.unsubscribeFromMenuItem(this.menuItem);
        this.menuItem = item;
        const value = item.value.get();
        this.menuItemValueChangedHandler(value);
        item.value.sub(this.menuItemValueChangedHandler);
        this.setDisabled(item.disabled.get() === true);
        item.disabled.sub(this.setDisabled);
        this.setLabel(item.label.get());
        item.label.sub(this.setLabel);
    }
    /**
     * Unsubscribes from change events on the menu item.
     * @param item the menu item
     */
    unsubscribeFromMenuItem(item) {
        item.value.unsub(this.menuItemValueChangedHandler);
        item.disabled.unsub(this.setDisabled);
        item.label.unsub(this.setLabel);
    }
    /**
     * Shows or hides the active/inactive indicator.
     * @param isShown Whether or not the indicator is shown.
     */
    showIndicator(isShown) {
        if (isShown) {
            this.indicatorEl.instance.classList.add('shown');
        }
        else {
            this.indicatorEl.instance.classList.remove('shown');
        }
    }
    /**
     * Activates or inactivates the indicator.
     * @param isIndicating Whether or not the indicator is indicating.
     */
    indicate(isIndicating) {
        if (isIndicating) {
            this.showIndicator(true);
            this.indicatorEl.instance.classList.add('indicating');
        }
        else {
            this.indicatorEl.instance.classList.remove('indicating');
        }
    }
    /**
     * Renders the component.
     * @returns The rendered component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: 'softkey-tab', ref: this.rootEl },
            FSComponent.buildComponent("div", { class: 'softkey-tab-borders' }),
            FSComponent.buildComponent("label", { class: 'softkey-tab-label', ref: this.labelEl }),
            FSComponent.buildComponent("span", { class: 'softkey-tab-value', ref: this.valueEl, style: 'display: none' }),
            FSComponent.buildComponent("div", { class: 'softkey-tab-indicator', ref: this.indicatorEl })));
    }
}
