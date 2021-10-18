import { FSComponent, Subject, MathUtils } from 'msfssdk';
import { UiControl } from '../../../../Shared/UI/UiControl';
import { NumberInput } from '../../../../Shared/UI/UIControls/NumberInput';
/**
 * The TimerInput Component.
 */
export class ADFFreqInput extends UiControl {
    constructor() {
        super(...arguments);
        this.inputCtrls = [];
        this.highlightIndex = 0;
        this.freqSubjects = [
            Subject.create(0),
            Subject.create(0),
            Subject.create(0),
            Subject.create(0),
            Subject.create(0)
        ];
        /**
         * Registers the inputs with this control
         * @param ctrl The number input to register.
         */
        this.register = (ctrl) => {
            this.inputCtrls.push(ctrl);
        };
    }
    /** @inheritdoc */
    onAfterRender() {
        super.onAfterRender();
        this.focusSubject.sub((v) => {
            if (v) {
                this.props.enterToTransferSubject.set('ENT TO TRANSFER');
            }
            else {
                this.props.enterToTransferSubject.set('');
            }
        });
    }
    /**
     * Sets and formats the freq.
     */
    setFreq() {
        if (!this.getIsActivated()) {
            const freq = this.props.adfInputSubject.get();
            const thousands = Math.floor(freq / 1000);
            const hundreds = Math.floor((freq - (thousands * 1000)) / 100);
            const tens = Math.floor((freq - (thousands * 1000) - (hundreds * 100)) / 10);
            const ones = Math.floor(freq - (thousands * 1000) - (hundreds * 100) - (tens * 10));
            const decimal = Math.round(10 * (freq - Math.floor(freq)));
            this.freqSubjects[0].set(thousands);
            this.freqSubjects[1].set(hundreds);
            this.freqSubjects[2].set(tens);
            this.freqSubjects[3].set(ones);
            this.freqSubjects[4].set(decimal);
        }
    }
    /** @inheritdoc */
    onUpperKnobInc() {
        if (!this.isActivated) {
            this.activate();
        }
        else {
            this.activeInput.onUpperKnobInc();
        }
    }
    /** @inheritdoc */
    onUpperKnobDec() {
        if (!this.isActivated) {
            this.activate();
        }
        else {
            this.activeInput.onUpperKnobDec();
        }
    }
    /** @inheritdoc */
    onLowerKnobInc() {
        this.highlightIndex++;
        this.highlightInput(this.highlightIndex);
    }
    /** @inheritdoc */
    onLowerKnobDec() {
        this.highlightIndex--;
        this.highlightInput(this.highlightIndex);
    }
    /** @inheritdoc */
    onEnter() {
        if (this.isActivated) {
            const value = this.freqSubjects[0].get() * 1000
                + this.freqSubjects[1].get() * 100
                + this.freqSubjects[2].get() * 10
                + this.freqSubjects[3].get()
                + this.freqSubjects[4].get() / 10;
            this.props.adfInputSubject.set(value);
            SimVar.SetSimVarValue('K:ADF_COMPLETE_SET', 'Frequency ADF BCD32', Avionics.Utils.make_adf_bcd32(value * 1000));
            this.deactivate();
            return true;
        }
        else {
            SimVar.SetSimVarValue('K:ADF1_RADIO_SWAP', 'number', 0);
            return true;
        }
    }
    /** @inheritdoc */
    onClr() {
        this.deactivate();
        return true;
    }
    /**
     * Highlights the specified input control.
     * @param index The index of the input to highlight.
     */
    highlightInput(index) {
        if (this.activeInput) {
            this.activeInput.blur();
        }
        this.highlightIndex = MathUtils.clamp(index, 0, this.inputCtrls.length - 1);
        this.activeInput = this.inputCtrls[this.highlightIndex];
        this.activeInput.focus();
    }
    /** @inheritdoc */
    onActivated() {
        var _a;
        this.highlightIndex = 0;
        (_a = this.getHighlightElement()) === null || _a === void 0 ? void 0 : _a.classList.remove(UiControl.FOCUS_CLASS);
        this.highlightInput(this.highlightIndex);
    }
    /** @inheritdoc */
    onDeactivated() {
        var _a;
        this.activeInput.blur();
        if (this.getIsFocused()) {
            (_a = this.getHighlightElement()) === null || _a === void 0 ? void 0 : _a.classList.add(UiControl.FOCUS_CLASS);
        }
    }
    /** @inheritdoc */
    renderControl() {
        return (FSComponent.buildComponent("div", { class: "ADFDME-standby-adf" },
            FSComponent.buildComponent(NumberInput, { onRegister: this.register, dataSubject: this.freqSubjects[0], minValue: 0, maxValue: 1, increment: 1, wrap: true, class: 'timerref-timer-number' }),
            FSComponent.buildComponent(NumberInput, { onRegister: this.register, dataSubject: this.freqSubjects[1], minValue: 0, maxValue: 9, increment: 1, wrap: true, class: 'timerref-timer-number' }),
            FSComponent.buildComponent(NumberInput, { onRegister: this.register, dataSubject: this.freqSubjects[2], minValue: 0, maxValue: 9, increment: 1, wrap: true, class: 'timerref-timer-number' }),
            FSComponent.buildComponent(NumberInput, { onRegister: this.register, dataSubject: this.freqSubjects[3], minValue: 0, maxValue: 9, increment: 1, wrap: true, class: 'timerref-timer-number' }),
            ".",
            FSComponent.buildComponent(NumberInput, { onRegister: this.register, dataSubject: this.freqSubjects[4], minValue: 0, maxValue: 9, increment: 1, wrap: true, class: 'timerref-timer-number' })));
    }
}
