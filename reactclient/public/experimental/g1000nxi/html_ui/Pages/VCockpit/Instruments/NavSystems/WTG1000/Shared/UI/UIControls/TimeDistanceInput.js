import { FSComponent, Subject, UnitType } from 'msfssdk';
import { UiControlGroup } from '../UiControlGroup';
import { NumberInput } from './NumberInput';
import './TimeDistanceInput.css';
/**
 * An input that can switch between time and distance.
 */
export class TimeDistanceInput extends UiControlGroup {
    constructor() {
        super(...arguments);
        this.distanceSubject = Subject.create(0);
        this.minutesSubject = Subject.create(0);
        this.secondsTensSubject = Subject.create(0);
        this.secondsOnesSubject = Subject.create(0);
        this.distanceInput = FSComponent.createRef();
        this.minutesInput = FSComponent.createRef();
        this.tensInput = FSComponent.createRef();
        this.onesInput = FSComponent.createRef();
        this.minutesGroup = FSComponent.createRef();
        this.distanceGroup = FSComponent.createRef();
        this.isTimeMode = true;
        this.ignoreUpdate = false;
    }
    /** @inheritdoc */
    onAfterRender() {
        this.minutesSubject.sub(() => this.update());
        this.secondsTensSubject.sub(() => this.update());
        this.secondsOnesSubject.sub(() => this.update());
        this.distanceSubject.sub(() => this.update());
        this.props.distanceSubject.sub(v => {
            this.ignoreUpdate = true;
            this.distanceSubject.set(v.asUnit(UnitType.NMILE));
            this.ignoreUpdate = false;
        }, true);
        this.props.timeSubject.sub(v => {
            const minutes = Math.floor(v.asUnit(UnitType.MINUTE));
            const seconds = v.asUnit(UnitType.SECOND) % 60;
            this.ignoreUpdate = true;
            this.minutesSubject.set(minutes);
            this.secondsTensSubject.set(Math.floor(seconds / 10));
            this.secondsOnesSubject.set(seconds % 10);
            this.ignoreUpdate = false;
        }, true);
        this.setMode(true);
    }
    /**
     * Sets the input mode to time or distance.
     * @param isTime True if the input mode should be time, false otherwise.
     */
    setMode(isTime) {
        this.isTimeMode = isTime;
        this.minutesInput.instance.setIsEnabled(isTime);
        this.tensInput.instance.setIsEnabled(isTime);
        this.onesInput.instance.setIsEnabled(isTime);
        this.distanceInput.instance.setIsEnabled(!isTime);
        this.minutesGroup.instance.style.display = isTime ? '' : 'none';
        this.distanceGroup.instance.style.display = isTime ? 'none' : '';
    }
    /**
     * Updates the props subjects.
     */
    update() {
        if (this.ignoreUpdate) {
            return;
        }
        if (this.isTimeMode) {
            const seconds = (this.minutesSubject.get() * 60)
                + (this.secondsTensSubject.get() * 10)
                + this.secondsOnesSubject.get();
            this.props.timeSubject.set(seconds, UnitType.SECOND);
        }
        else {
            this.props.distanceSubject.set(this.distanceSubject.get(), UnitType.NMILE);
        }
    }
    /**
     * Renders the control.
     * @returns The rendered VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: this.props.class },
            FSComponent.buildComponent("div", { ref: this.distanceGroup },
                FSComponent.buildComponent(NumberInput, { ref: this.distanceInput, class: 'time-distance-input-number', minValue: 0, maxValue: 40, increment: 0.1, onRegister: this.register, wrap: true, dataSubject: this.distanceSubject, formatter: (v) => `${v.toFixed(1)}` }),
                FSComponent.buildComponent("span", { class: 'time-distance-input-nm' }, "NM")),
            FSComponent.buildComponent("div", { ref: this.minutesGroup },
                FSComponent.buildComponent(NumberInput, { class: 'time-distance-input-number', ref: this.minutesInput, minValue: 0, maxValue: 9, increment: 1, onRegister: this.register, wrap: true, dataSubject: this.minutesSubject }),
                FSComponent.buildComponent("div", { class: 'time-distance-input-number' }, ":"),
                FSComponent.buildComponent(NumberInput, { class: 'time-distance-input-number', ref: this.tensInput, minValue: 0, maxValue: 5, increment: 1, onRegister: this.register, wrap: true, dataSubject: this.secondsTensSubject }),
                FSComponent.buildComponent(NumberInput, { class: 'time-distance-input-number', ref: this.onesInput, minValue: 0, maxValue: 9, increment: 1, onRegister: this.register, wrap: true, dataSubject: this.secondsOnesSubject }))));
    }
}
