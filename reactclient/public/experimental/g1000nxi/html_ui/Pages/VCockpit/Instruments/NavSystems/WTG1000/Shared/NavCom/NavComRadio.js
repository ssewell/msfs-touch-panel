/* eslint-disable max-len */
import { DisplayComponent, FSComponent } from 'msfssdk';
import { RadioType } from 'msfssdk/instruments';
import { NavComFrequencyElement } from './NavComFrequencyElement';
import './NavComRadio.css';
/**
 *
 */
export class NavComRadio extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.frequency1Element = FSComponent.createRef();
        this.frequency2Element = FSComponent.createRef();
    }
    /**
     * Stuff to do after render.
     */
    onAfterRender() {
        // Nothing to do at the moment.
        return;
    }
    /**
     * Render NavCom Element
     * @returns Vnode containing the element
     */
    render() {
        if (this.props.position === 'left') {
            return (FSComponent.buildComponent("div", null,
                FSComponent.buildComponent("div", { class: "navcom-title left" }, this.props.title),
                FSComponent.buildComponent("div", { class: "navcom-title-numbers left" }, "12"),
                FSComponent.buildComponent("div", { class: "navcom-frequencies left" },
                    FSComponent.buildComponent(NavComFrequencyElement, { ref: this.frequency1Element, bus: this.props.bus, position: this.props.position, type: RadioType.Nav, index: 1 }),
                    FSComponent.buildComponent(NavComFrequencyElement, { ref: this.frequency2Element, bus: this.props.bus, position: this.props.position, type: RadioType.Nav, index: 2 }))));
        }
        else {
            return (FSComponent.buildComponent("div", null,
                FSComponent.buildComponent("div", { class: "navcom-frequencies right" },
                    FSComponent.buildComponent(NavComFrequencyElement, { ref: this.frequency1Element, bus: this.props.bus, position: this.props.position, type: RadioType.Com, index: 1 }),
                    FSComponent.buildComponent(NavComFrequencyElement, { ref: this.frequency2Element, bus: this.props.bus, position: this.props.position, type: RadioType.Com, index: 2 })),
                FSComponent.buildComponent("div", { class: "navcom-title-numbers right" }, "12"),
                FSComponent.buildComponent("div", { class: "navcom-title right" }, this.props.title)));
        }
    }
}
