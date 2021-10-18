/* eslint-disable max-len */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FSComponent, DisplayComponent } from 'msfssdk';
import { FrequencyBank, NavSourceType, RadioType } from 'msfssdk/instruments';
import './NavComFrequencyElement.css';
/**
 * Representation of the active and standby frequencies of a nav or com radio.
 */
export class NavComFrequencyElement extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.selectorBorderElement = FSComponent.createRef();
        this.selectorArrowElement = FSComponent.createRef();
        this.activeFreq = FSComponent.createRef();
        this.standbyFreq = FSComponent.createRef();
        this.ident = FSComponent.createRef();
        /**
         * Handle a radioo state update event.
         * @param radio The Radio that was updated.
         */
        this.onUpdateState = (radio) => {
            if (!(radio.radioType == this.props.type && radio.index == this.props.index)) {
                return;
            }
            if (this.activeFreq.instance !== null) {
                this.activeFreq.instance.textContent = radio.activeFrequency.toFixed(radio.radioType == RadioType.Nav ? 2 : 3);
            }
            if (this.standbyFreq.instance !== null) {
                this.standbyFreq.instance.textContent = radio.standbyFrequency.toFixed(radio.radioType == RadioType.Nav ? 2 : 3);
            }
            if (this.selectorBorderElement.instance !== null && this.selectorArrowElement.instance !== null) {
                this.selectorBorderElement.instance.style.display = radio.selected ? '' : 'none';
                this.selectorArrowElement.instance.style.visibility = radio.selected ? 'visible' : 'hidden';
            }
            if (this.ident.getOrDefault() !== null) {
                this.ident.instance.textContent = radio.ident;
            }
        };
        /**
         * Handle a frequency change event.
         * @param change The FrequencyChangeEvent to process.
         */
        this.onUpdateFrequency = (change) => {
            if (!(change.radio.radioType == this.props.type && change.radio.index == this.props.index)) {
                return;
            }
            switch (change.bank) {
                case FrequencyBank.Active:
                    if (this.activeFreq.instance !== null) {
                        this.activeFreq.instance.textContent = change.frequency.toFixed(change.radio.radioType == RadioType.Nav ? 2 : 3);
                    }
                    break;
                case FrequencyBank.Standby:
                    if (this.standbyFreq.instance !== null) {
                        this.standbyFreq.instance.textContent = change.frequency.toFixed(change.radio.radioType == RadioType.Nav ? 2 : 3);
                    }
                    break;
            }
        };
        /**
         * Handle an ident set event.
         * @param change The IdentChangeEvent to process.
         */
        this.onUpdateIdent = (change) => {
            if (change.index == this.props.index && this.ident.getOrDefault() !== null) {
                this.ident.instance.textContent = change.ident;
            }
        };
        /**
         * A callback called when the CDI Source Changes.
         * @param source The current selected CDI Source.
         */
        this.onUpdateCdiSelect = (source) => {
            if (source.type === NavSourceType.Nav && source.index == this.props.index) {
                this.activeFreq.instance.classList.add('navcom-green');
                this.ident.instance.classList.add('navcom-green');
            }
            else {
                this.activeFreq.instance.classList.remove('navcom-green');
                this.ident.instance.classList.remove('navcom-green');
            }
        };
    }
    /**
     * Set this frequency as the active selection visually.
     * @param isSelected Indicates if the frequency should show as selected or not.
     */
    setSelected(isSelected) {
        if (this.selectorBorderElement.instance !== null && this.selectorArrowElement.instance !== null) {
            this.selectorBorderElement.instance.style.display = isSelected ? '' : 'none';
            this.selectorArrowElement.instance.style.visibility = isSelected ? 'visible' : 'hidden';
        }
    }
    /**
     * Stuff to do after rendering.
     */
    onAfterRender() {
        const nav = this.props.bus.getSubscriber();
        nav.on('setRadioState').handle(this.onUpdateState);
        nav.on('setFrequency').handle(this.onUpdateFrequency);
        nav.on('setIdent').handle(this.onUpdateIdent);
        if (this.props.position === 'left') {
            const navproc = this.props.bus.getSubscriber();
            navproc.on('cdi_select').handle(this.onUpdateCdiSelect);
        }
    }
    /**
     * Render NavCom Freq Element.
     * @returns Vnode containing the element.
     */
    render() {
        if (this.props.position === 'left') {
            return (FSComponent.buildComponent("div", { class: "navcom-frequencyelement-container" },
                FSComponent.buildComponent("div", { ref: this.selectorBorderElement, id: "navcomselect", class: "navcom-selector left" }),
                FSComponent.buildComponent("span", { class: "navcom-freqstandby", ref: this.standbyFreq }),
                FSComponent.buildComponent("span", { ref: this.selectorArrowElement, class: "navcom-arrows" },
                    FSComponent.buildComponent("svg", { width: "22", height: "16" },
                        FSComponent.buildComponent("path", { d: "M 12 8 m 0 0.75 l -5 0 l 1 3.25 l 0 1 l -4.5 -5 l 4.5 -5 l 0 1 l -1 3.25 l 10 0 l -1 -3.25 l 0 -1 l 4.5 5 l -4.5 5 l 0 -1 l 1 -3.25 l -5 0 z", fill: "cyan" }))),
                FSComponent.buildComponent("span", { class: "navcom-freqactive", ref: this.activeFreq }),
                FSComponent.buildComponent("div", { class: "navcom-ident", ref: this.ident })));
        }
        else {
            return (FSComponent.buildComponent("div", { class: "navcom-frequencyelement-container" },
                FSComponent.buildComponent("div", { ref: this.selectorBorderElement, id: "navcomselect", class: "navcom-selector right" }),
                FSComponent.buildComponent("span", { class: "navcom-freqactive", ref: this.activeFreq }),
                FSComponent.buildComponent("span", { ref: this.selectorArrowElement, class: "navcom-arrows" },
                    FSComponent.buildComponent("svg", { width: "25", height: "16" },
                        FSComponent.buildComponent("path", { d: "M 12 8 m 0 0.75 l -5 0 l 1 3.25 l 0 1 l -4.5 -5 l 4.5 -5 l 0 1 l -1 3.25 l 10 0 l -1 -3.25 l 0 -1 l 4.5 5 l -4.5 5 l 0 -1 l 1 -3.25 l -5 0 z", fill: "cyan" }))),
                FSComponent.buildComponent("span", { class: "navcom-freqstandby", ref: this.standbyFreq })));
        }
    }
}
