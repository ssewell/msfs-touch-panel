import { FSComponent, DisplayComponent } from 'msfssdk';
import { SoftKey } from './Menus/SoftKey';
import { SoftKeyMenu } from './Menus/SoftKeyMenu';
import './SoftKeyBar.css';
/**
 * The Garmin softkeys tab display for the PFD and MFD.
 */
export class SoftKeyBar extends DisplayComponent {
    /**
     * Creates an instance of SoftKeys.
     * @param props The properties to use.
     */
    constructor(props) {
        super(props);
        /** References to the softkey div nodes. */
        this.refs = [];
        this.menuSystem = this.props.menuSystem;
    }
    /**
     * Builds the softkeys tab elements.
     * @returns A collection of soft key div elements.
     */
    buildSoftKeys() {
        const softKeys = [];
        for (let i = 0; i < 12; i++) {
            const ref = FSComponent.createRef();
            softKeys.push(FSComponent.buildComponent(SoftKey, { ref: ref, menuItem: SoftKeyMenu.EmptyMenuItem }));
            this.refs[i] = ref;
        }
        return softKeys;
    }
    /**
     * Starts the softkey HEvent listener after render.
     */
    onAfterRender() {
        this.menuSystem.attachSoftKeys(this);
    }
    /**
     * Binds a menu item to a soft key.
     * @param index  the index of the softkey
     * @param menuItem the menu item to set
     */
    setMenuItem(index, menuItem) {
        this.refs[index].instance.setMenuItem(menuItem);
    }
    /**
     * Renders the component.
     * @returns The rendered component.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: 'softkeys-container' }, this.buildSoftKeys()));
    }
}
