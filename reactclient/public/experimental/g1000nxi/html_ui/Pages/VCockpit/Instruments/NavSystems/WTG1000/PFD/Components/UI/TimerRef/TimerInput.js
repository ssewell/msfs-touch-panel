import { FSComponent, Subject, MathUtils } from 'msfssdk';
import { UiControl } from '../../../../Shared/UI/UiControl';
import { NumberInput } from '../../../../Shared/UI/UIControls/NumberInput';
import { Timer } from './Timer';
import './TimerInput.css';
/**
 * The TimerInput Component.
 */
export class TimerInput extends UiControl {
    constructor() {
        super(...arguments);
        this.inputCtrls = [];
        this.activeInput = undefined;
        this.highlightIndex = 0;
        this.timerSubjects = [
            Subject.create(0),
            Subject.create(0),
            Subject.create(0),
            Subject.create(0),
            Subject.create(0),
        ];
        /**
         * Registers the inputs with this control
         * @param ctrl The number input to register.
         */
        this.register = (ctrl) => {
            this.inputCtrls.push(ctrl);
        };
    }
    /**
     * A method called to get the current timer mode.
     * @returns the current TimerMode
     */
    getTimerMode() {
        return this.props.timer.mode;
    }
    /**
     * A method called to get the current timer mode.
     * @returns the current TimerMode
     */
    getTimerState() {
        return this.props.timer.timerRunning;
    }
    /**
     * A method called to get the current timer reset state.
     * @returns the current timer reset state
     */
    getTimerResetState() {
        return this.props.timer.canReset;
    }
    /**
     * Sets this control's input value to a specific duration.
     * @param seconds The input to set in seconds.
     */
    setInput(seconds) {
        const timerValues = Timer.SecondsToHMMSS(seconds);
        this.timerSubjects[0].set(timerValues.hours);
        this.timerSubjects[1].set(timerValues.minutesTens);
        this.timerSubjects[2].set(timerValues.minutesOnes);
        this.timerSubjects[3].set(timerValues.secondsTens);
        this.timerSubjects[4].set(timerValues.secondsOnes);
    }
    /**
     * A method called to stop the timer.
     */
    stopTimer() {
        this.props.timer.timerRunning = false;
        this.props.timer.canReset = true;
    }
    /**
     * A method called to start the timer.
     */
    startTimer() {
        this.props.timer.timerRunning = true;
    }
    /**
     * A method called to reset the timer.
     */
    resetTimer() {
        this.timerSubjects[0].set(0);
        this.timerSubjects[1].set(0);
        this.timerSubjects[2].set(0);
        this.timerSubjects[3].set(0);
        this.timerSubjects[4].set(0);
        this.props.timer.resetTimer();
    }
    /**
     * Sets the value of this control's timer to the current input value.
     */
    setTimerFromInput() {
        const hours = this.timerSubjects[0].get();
        const minutes = 10 * this.timerSubjects[1].get() + this.timerSubjects[2].get();
        const seconds = 10 * this.timerSubjects[3].get() + this.timerSubjects[4].get();
        this.props.timer.setTimerValue(hours * 3600 + minutes * 60 + seconds);
    }
    /** @inheritdoc */
    onUpperKnobInc() {
        var _a;
        if (!this.isActivated) {
            this.activate();
        }
        else {
            (_a = this.activeInput) === null || _a === void 0 ? void 0 : _a.onUpperKnobInc();
        }
    }
    /** @inheritdoc */
    onUpperKnobDec() {
        var _a;
        if (!this.isActivated) {
            this.activate();
        }
        else {
            (_a = this.activeInput) === null || _a === void 0 ? void 0 : _a.onUpperKnobDec();
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
            this.setTimerFromInput();
            this.deactivate();
            return true;
        }
        else {
            return false;
        }
    }
    /** @inheritdoc */
    onClr() {
        if (this.isActivated) {
            this.deactivate();
            return true;
        }
        else {
            return false;
        }
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
        var _a, _b;
        (_a = this.activeInput) === null || _a === void 0 ? void 0 : _a.blur();
        if (this.getIsFocused()) {
            (_b = this.getHighlightElement()) === null || _b === void 0 ? void 0 : _b.classList.add(UiControl.FOCUS_CLASS);
        }
        this.setInput(this.props.timer.timerValue);
    }
    /** @inheritdoc */
    renderControl() {
        return (FSComponent.buildComponent("div", { class: "timerref-timer-container" },
            FSComponent.buildComponent(NumberInput, { onRegister: this.register, dataSubject: this.timerSubjects[0], minValue: 0, maxValue: 99, increment: 1, wrap: true, class: 'timerref-timer-number' }),
            ":",
            FSComponent.buildComponent(NumberInput, { onRegister: this.register, dataSubject: this.timerSubjects[1], minValue: 0, maxValue: 5, increment: 1, wrap: true, class: 'timerref-timer-number' }),
            FSComponent.buildComponent(NumberInput, { onRegister: this.register, dataSubject: this.timerSubjects[2], minValue: 0, maxValue: 9, increment: 1, wrap: true, class: 'timerref-timer-number' }),
            ":",
            FSComponent.buildComponent(NumberInput, { onRegister: this.register, dataSubject: this.timerSubjects[3], minValue: 0, maxValue: 5, increment: 1, wrap: true, class: 'timerref-timer-number' }),
            FSComponent.buildComponent(NumberInput, { onRegister: this.register, dataSubject: this.timerSubjects[4], minValue: 0, maxValue: 9, increment: 1, wrap: true, class: 'timerref-timer-number' })));
    }
}
