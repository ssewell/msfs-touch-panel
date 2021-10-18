import { ComputedSubject, FSComponent, Subject } from 'msfssdk';
import { UiView } from '../../../../Shared/UI/UiView';
import { ArrowToggle } from '../../../../Shared/UI/UIControls/ArrowToggle';
import { ADFFreqInput } from './ADFFreqInput';
import './ADFDME.css';
/**
 * The ADFDME
 * component.
 */
export class ADFDME extends UiView {
    constructor() {
        super(...arguments);
        // private adfdmeToggleOptions = ['ADF', 'ANT', 'ADF/BFO', 'ANT/BFO'];
        this.adfdmeToggleOptions = ['ADF'];
        this.dmeToggleOptions = ['NAV1', 'NAV2'];
        this.freqComponentRef = FSComponent.createRef();
        this.adfInputSubject = Subject.create(0);
        this.adfActiveFreq = ComputedSubject.create(0, (v) => {
            if (isNaN(v) || v <= 0) {
                return '----.-';
            }
            else {
                return v.toFixed(1);
            }
        });
        this.enterToTransferSubject = Subject.create('');
        // ---- TOGGLE ADF MODE CALLBACK
        this.onADFToggleSelected = (index) => {
            console.log('MODE TOGGLED:' + index);
        };
        this.onDmeToggleSelected = (index) => {
            this.props.navIndicatorController.dmeSourceIndex.set(index);
        };
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        const adf = this.props.bus.getSubscriber();
        adf.on('adf1ActiveFreq').whenChanged().handle((f) => {
            this.adfActiveFreq.set(f);
        });
        adf.on('adf1StandbyFreq').whenChanged().handle((f) => {
            this.adfInputSubject.set(Math.round(f * 10) / 10);
            this.freqComponentRef.instance.setFreq();
        });
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: 'popout-dialog', ref: this.viewContainerRef },
            FSComponent.buildComponent("h1", null, this.props.title),
            FSComponent.buildComponent("div", { class: "ADFDME-adf-row1" },
                FSComponent.buildComponent("div", null, "ADF"),
                FSComponent.buildComponent("div", { class: "ADFDME-active-adf" }, this.adfActiveFreq),
                FSComponent.buildComponent("div", null,
                    FSComponent.buildComponent("svg", { width: "25", height: "16" },
                        FSComponent.buildComponent("path", { d: "M 12 8 m 0 0.75 l -5 0 l 1 3.25 l 0 1 l -4.5 -5 l 4.5 -5 l 0 1 l -1 3.25 l 10 0 l -1 -3.25 l 0 -1 l 4.5 5 l -4.5 5 l 0 -1 l 1 -3.25 l -5 0 z", fill: "cyan" }))),
                FSComponent.buildComponent(ADFFreqInput, { ref: this.freqComponentRef, adfInputSubject: this.adfInputSubject, onRegister: this.register, enterToTransferSubject: this.enterToTransferSubject })),
            FSComponent.buildComponent("div", { class: "ADFDME-adf-row2" },
                FSComponent.buildComponent("div", null, "MODE"),
                FSComponent.buildComponent(ArrowToggle, { onRegister: this.register, onOptionSelected: this.onADFToggleSelected, options: this.adfdmeToggleOptions }),
                FSComponent.buildComponent("div", null, "VOL"),
                FSComponent.buildComponent("div", { class: "cyan size16" }, "100%")),
            FSComponent.buildComponent("hr", null),
            FSComponent.buildComponent("div", { class: "ADFDME-dme-row1" },
                FSComponent.buildComponent("div", null, "DME"),
                FSComponent.buildComponent("div", null, "MODE"),
                FSComponent.buildComponent("div", { class: "ADFDME-dme-select" },
                    FSComponent.buildComponent(ArrowToggle, { onRegister: this.register, onOptionSelected: this.onDmeToggleSelected, options: this.dmeToggleOptions }))),
            FSComponent.buildComponent("hr", null),
            FSComponent.buildComponent("div", { class: "ADFDME-ent-transfer" }, this.enterToTransferSubject)));
    }
}
