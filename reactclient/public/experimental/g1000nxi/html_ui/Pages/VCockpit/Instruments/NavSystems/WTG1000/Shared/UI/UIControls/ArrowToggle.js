import { ComputedSubject, DisplayComponent, FSComponent, Subject } from 'msfssdk';
import { UiControl } from '../UiControl';
import './ArrowToggle.css';
/**
 * A class to define an arrow toggle/select UI element
 */
export class ArrowToggle extends UiControl {
    /**
     * Ctor
     * @param props The props.
     */
    constructor(props) {
        var _a, _b;
        super(props);
        this.valueContainerRef = FSComponent.createRef();
        this.selectedOption = ComputedSubject.create((_b = (_a = this.props.dataref) === null || _a === void 0 ? void 0 : _a.get()) !== null && _b !== void 0 ? _b : 0, (v) => {
            return this.props.options[v];
        });
        this.leftArrEnabled = ComputedSubject.create(false, (v) => {
            return v ? 'rgb(0,255,0)' : 'rgb(50,50,50)';
        });
        this.rightArrEnabled = ComputedSubject.create(true, (v) => {
            return v ? 'rgb(0,255,0)' : 'rgb(50,50,50)';
        });
        this.setArrows();
        this.selectedOption.sub(() => {
            this.setArrows();
        });
        if (this.props.dataref) {
            this.props.dataref.sub((v) => {
                this.selectedOption.set(v);
            });
        }
    }
    /** @inheritdoc */
    onUpperKnobInc() {
        this.scrollOption('next');
    }
    /** @inheritdoc */
    onUpperKnobDec() {
        this.scrollOption('prev');
    }
    /**
     * Sets the next option in the direction.
     * @param direction is the direction to scroll
     */
    scrollOption(direction) {
        var _a;
        let idx = this.selectedOption.getRaw();
        idx = Math.max(0, Math.min(this.props.options.length - 1, ((direction === 'next') ? idx + 1 : idx - 1)));
        this.selectedOption.set(idx);
        (_a = this.props.dataref) === null || _a === void 0 ? void 0 : _a.set(idx);
        if (this.props.onOptionSelected !== undefined) {
            this.props.onOptionSelected(idx);
        }
    }
    /** Enables/Disables the arrows. */
    setArrows() {
        this.leftArrEnabled.set(this.selectedOption.getRaw() > 0);
        this.rightArrEnabled.set(this.selectedOption.getRaw() < this.props.options.length - 1);
    }
    /** @inheritdoc */
    getHighlightElement() {
        return this.valueContainerRef.instance;
    }
    /** @inheritdoc */
    renderControl() {
        return (FSComponent.buildComponent("div", { class: "arrow-toggle-container" },
            FSComponent.buildComponent("svg", { width: "5", height: "10" },
                FSComponent.buildComponent("path", { d: 'M 0 0 l 0 10 l 5 -5 z', fill: this.rightArrEnabled })),
            FSComponent.buildComponent("div", { ref: this.valueContainerRef, class: "arrow-toggle-value" }, this.selectedOption),
            FSComponent.buildComponent("svg", { width: "5", height: "10" },
                FSComponent.buildComponent("path", { d: 'M 0 0 m 5 0 l 0 10 l -5 -5 z', fill: this.leftArrEnabled }))));
    }
}
/**
 * A class to define an arrow toggle/select UI element
 * @class ArrowToggle
 * @augments {DisplayComponent<ArrowToggleComponentProps_OLD>}
 */
export class ArrowToggle_OLD extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.leftArrowRef = FSComponent.createRef();
        this.rightArrowRef = FSComponent.createRef();
        this.selectedOptionIndex = 0;
        this.isActive = false;
        this.selectedOptionStr = Subject.create('OFF');
    }
    /**
     * Method to set the selected option.
     * @param optionIndex is a string containing the start text value
     */
    selectOption(optionIndex) {
        this.selectedOptionIndex = optionIndex > this.props.options.length - 1 ? 0 : optionIndex < 0 ? this.props.options.length - 1 : optionIndex;
        this.selectedOptionStr.set(this.props.options[optionIndex]);
        this.setArrows();
    }
    /**
     * Method to increment to the next selected option.
     */
    incOption() {
        if (this.selectedOptionIndex != this.props.options.length - 1) {
            this.selectOption(this.selectedOptionIndex + 1);
        }
    }
    /**
     * Method to decrement to the next selected option.
     */
    decOption() {
        if (this.selectedOptionIndex != 0) {
            this.selectOption(this.selectedOptionIndex - 1);
        }
    }
    /**
     * Method to set this toggle component active or inactive.
     * @param active is whether to set this component active or not.
     */
    setActive(active) {
        this.isActive = active;
    }
    /**
     * Method to set the arrow display.
     */
    setArrows() {
        var _a, _b, _c, _d;
        if (this.selectedOptionIndex < this.props.options.length - 1) {
            (_a = this.rightArrowRef.instance) === null || _a === void 0 ? void 0 : _a.setAttribute('fill', 'rgb(0,255,0)');
        }
        else {
            (_b = this.rightArrowRef.instance) === null || _b === void 0 ? void 0 : _b.setAttribute('fill', 'rgb(50,50,50)');
        }
        if (this.selectedOptionIndex > 0) {
            (_c = this.leftArrowRef.instance) === null || _c === void 0 ? void 0 : _c.setAttribute('fill', 'rgb(0,255,0)');
        }
        else {
            (_d = this.leftArrowRef.instance) === null || _d === void 0 ? void 0 : _d.setAttribute('fill', 'rgb(50,50,50)');
        }
    }
    /**
     * Do stuff after rendering.
     */
    onAfterRender() {
        if (this.props.initialSelection !== undefined && this.props.initialSelection >= 0) {
            this.selectOption(this.props.initialSelection);
        }
        else {
            this.selectOption(0);
        }
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "arrow-toggle-container" },
            FSComponent.buildComponent("svg", { width: "5", height: "10" },
                FSComponent.buildComponent("path", { ref: this.rightArrowRef, d: 'M 0 0 l 0 10 l 5 -5 z', fill: "rgb(0,255,0)" })),
            FSComponent.buildComponent("div", { class: "toggle-value" }, this.selectedOptionStr),
            FSComponent.buildComponent("svg", { class: "toggle-arrows", width: "5", height: "10" },
                FSComponent.buildComponent("path", { ref: this.leftArrowRef, d: 'M 0 0 m 5 0 l 0 10 l -5 -5 z', fill: "rgb(0,255,0)" }))));
    }
}
