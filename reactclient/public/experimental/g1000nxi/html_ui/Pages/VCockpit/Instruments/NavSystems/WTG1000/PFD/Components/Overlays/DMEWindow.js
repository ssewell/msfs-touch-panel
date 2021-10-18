import { DisplayComponent, FSComponent, Subject } from 'msfssdk';
import { RadioType, FrequencyBank } from 'msfssdk/instruments';
import { PFDUserSettings, PfdMapLayoutSettingMode } from '../../PFDUserSettings';
import './DMEWindow.css';
/**
 * The DMEWindow
 * component.
 */
export class DMEWindow extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.navSource = Subject.create('NAV1');
        this.navFreq = Subject.create('___.__');
        this.navDist = Subject.create('- - . -');
        this.dmeElement = FSComponent.createRef();
        /**
         * Updated the DME Display.
         * @param toggle If the DME button has been turned on or off
         */
        this.updateDMEDisplay = (toggle) => {
            if (toggle) {
                this.dmeElement.instance.style.display = '';
            }
            else {
                this.dmeElement.instance.style.display = 'none';
            }
        };
        /**
         * Offsets the display to the left when the HSI map is active to prevent it from being obscured
         * @param isHSIMAP Boolean if HSI map is active or not
         */
        this.setOffset = (isHSIMAP) => {
            if (isHSIMAP) {
                this.dmeElement.instance.classList.add('DME-window-hsi-map');
            }
            else {
                this.dmeElement.instance.classList.remove('DME-window-hsi-map');
            }
        };
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        const control = this.props.bus.getSubscriber();
        control.on('dme_toggle').handle(this.updateDMEDisplay);
        const navcom = this.props.bus.getSubscriber();
        navcom.on('setFrequency').handle((setFrequency) => {
            if (setFrequency.radio.radioType === RadioType.Nav && setFrequency.bank == FrequencyBank.Active) {
                const srcIndex = this.props.navIndicatorController.dmeSourceIndex.get();
                this.navSource.set(`NAV${srcIndex + 1}`);
                const frequency = this.props.navIndicatorController.navStates[srcIndex].frequency;
                if (frequency) {
                    this.navFreq.set(`${(Math.round(frequency * 100) / 100).toFixed(2)}`);
                }
            }
        });
        PFDUserSettings.getManager(this.props.bus).whenSettingChanged('mapLayout').handle((mode) => {
            this.setOffset(mode === PfdMapLayoutSettingMode.HSI);
        });
        this.dmeElement.instance.style.display = 'none';
        this.props.navIndicatorController.dmeSourceIndex.sub((v) => {
            this.navSource.set(`NAV${v + 1}`);
            const frequency = this.props.navIndicatorController.navStates[v].frequency;
            if (frequency) {
                this.navFreq.set(`${(Math.round(frequency * 100) / 100).toFixed(2)}`);
            }
        });
        this.props.navIndicatorController.dmeDistanceSubject.sub((v) => {
            if (v >= 100) {
                this.navDist.set(v.toFixed(0));
            }
            else if (v > 0) {
                this.navDist.set(v.toFixed(1));
            }
            else {
                this.navDist.set('- - . -');
            }
        });
        this.init();
    }
    /**
     * Inits the DME Display.
     */
    init() {
        setTimeout(() => {
            const frequency = this.props.navIndicatorController.navStates[0].frequency;
            if (frequency) {
                this.navFreq.set(`${(Math.round(frequency * 100) / 100).toFixed(2)}`);
            }
        }, 2000);
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { ref: this.dmeElement, class: "DME-window" },
            FSComponent.buildComponent("div", null, "DME"),
            FSComponent.buildComponent("div", { class: "cyan" }, this.navSource),
            FSComponent.buildComponent("div", { class: "cyan" }, this.navFreq),
            FSComponent.buildComponent("div", null,
                this.navDist,
                FSComponent.buildComponent("span", { class: "size14" }, " NM"))));
    }
}
