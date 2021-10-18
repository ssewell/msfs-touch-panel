import { FSComponent, Subject } from 'msfssdk';
import { UiControl } from '../UiControl';
import './NumberInput.css';
/**
 * The NumberInput component.
 */
export class NumberInput extends UiControl {
    constructor() {
        super(...arguments);
        this.displaySubject = Subject.create('');
        // If increment doesn't divide evenly into range, this will have unexpected behavior!
        this.range = this.props.maxValue - this.props.minValue + this.props.increment;
    }
    /** @inheritdoc */
    onAfterRender() {
        super.onAfterRender();
        this.displaySubject.set(this.getDisplaySubject());
        this.props.dataSubject.sub(() => {
            this.displaySubject.set(this.getDisplaySubject());
        });
    }
    /**
     * Method to get the display subject
     * @returns a string to set the display subject
     */
    getDisplaySubject() {
        if (this.props.defaultDisplayValue !== undefined && this.props.dataSubject.get() == 0) {
            return this.props.defaultDisplayValue;
        }
        else {
            if (this.props.formatter) {
                return this.props.formatter(this.props.dataSubject.get());
            }
            else {
                return `${this.props.dataSubject.get()}`;
            }
        }
    }
    /** @inheritdoc */
    onUpperKnobInc() {
        const newValue = this.props.wrap
            ? ((this.props.dataSubject.get() + this.props.increment) - this.props.minValue) % this.range + this.props.minValue
            : Math.min(this.props.dataSubject.get() + this.props.increment, this.props.maxValue);
        this.props.dataSubject.set(newValue);
        if (this.props.onValueChanged !== undefined) {
            this.props.onValueChanged(this.props.dataSubject.get());
            this.displaySubject.set(this.getDisplaySubject());
        }
    }
    /** @inheritdoc */
    onUpperKnobDec() {
        const newValue = this.props.wrap
            ? this.props.maxValue - (this.props.maxValue - (this.props.dataSubject.get() - this.props.increment)) % this.range
            : Math.max(this.props.dataSubject.get() - this.props.increment, this.props.minValue);
        this.props.dataSubject.set(newValue);
        if (this.props.onValueChanged !== undefined) {
            this.props.onValueChanged(this.props.dataSubject.get());
            this.displaySubject.set(this.getDisplaySubject());
        }
    }
    /** @inheritdoc */
    renderControl() {
        return (FSComponent.buildComponent("div", null, this.displaySubject));
    }
}
