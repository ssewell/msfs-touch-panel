import { FSComponent, Subject } from 'msfssdk';
import { UiControl } from '../UiControl';
import './InputComponent.css';
/**
 * Input Component Class
 */
export class InputComponent extends UiControl {
    constructor() {
        super(...arguments);
        this.textBoxRef = FSComponent.createRef();
        this.keyboardIconRef = FSComponent.createRef();
        this.inputValueContainerRef = FSComponent.createRef();
        this.selectedSpanRef = FSComponent.createRef();
        this.keyboardInputHandler = this.handleTextboxInput.bind(this);
        this.dataEntry = {
            text: '',
            highlightIndex: 0,
            beforeSelected: Subject.create(''),
            selected: Subject.create(''),
            afterSelected: Subject.create(''),
        };
        this.characterMap = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        this.isKeyboardActive = false;
        this.inputCharacterIndex = 0;
        this.previousValue = '';
        /**
         * Method to handle when the virtual keyboard button is clicked
         */
        this.handleKeyboardClicked = () => {
            if (this.getIsFocused()) {
                if (!this.isKeyboardActive) {
                    this.activateKeyboardInput();
                }
                else {
                    this.deactivateKeyboardInput();
                }
            }
        };
        /**
         * Method to handle when input focus is set
         * @param e The focus event.
         */
        this.onInputFocus = (e) => {
            e.preventDefault();
            Coherent.trigger('FOCUS_INPUT_FIELD', '', '', '', '', false);
            Coherent.on('mousePressOutsideView', () => {
                this.textBoxRef.instance.blur();
            });
            this.textBoxRef.instance.focus({ preventScroll: true });
            this.textBoxRef.instance.value = this.dataEntry.text.substr(0, this.dataEntry.highlightIndex);
            this.textBoxRef.instance.disabled = false;
            this.textBoxRef.instance.addEventListener('input', this.keyboardInputHandler);
            this.keyboardIconRef.instance.classList.add('active');
        };
        /**
         * Method to handle on input blur
         */
        this.onInputBlur = () => {
            this.textBoxRef.instance.disabled = true;
            this.textBoxRef.instance.value = '';
            Coherent.trigger('UNFOCUS_INPUT_FIELD', '');
            Coherent.off('mousePressOutsideView');
            if (this.keyboardInputHandler) {
                this.textBoxRef.instance.removeEventListener('input', this.keyboardInputHandler);
            }
            this.keyboardIconRef.instance.classList.remove('active');
        };
    }
    /**
     * Method to set the initial text value when the component is made active.
     * @param value is a string containing the start text value
     * @param highlightIndex The new index of the highlighted character. The index will remain unchanged if this
     * argument is undefined.
     * @param emitEvent Whether a text changed event should be emitted.
     */
    setText(value, highlightIndex, emitEvent = true) {
        this.dataEntry.text = value.padEnd(this.props.maxLength, '_').substr(0, this.props.maxLength);
        this.dataEntry.highlightIndex = Utils.Clamp(highlightIndex !== null && highlightIndex !== void 0 ? highlightIndex : this.dataEntry.highlightIndex, 0, this.dataEntry.text.length - 1);
        this.textBoxRef.instance.value = value.substr(0, this.dataEntry.highlightIndex);
        this.updateDataEntryElement(undefined, emitEvent);
    }
    /**
     * Gets the current input.
     * @returns the data entry text
     */
    getText() {
        return this.dataEntry.text;
    }
    /**
     * Gets the raw input without blank fills.
     * @returns the data entry text without blank fills
     */
    getRawText() {
        return this.dataEntry.text.replace(/_/g, ' ').trim();
    }
    /**
     * Clears the input.
     * @param emitEvent A boolean indicating if an event should be emitted after clearing the input value.
     */
    clear(emitEvent = true) {
        this.setText('', 0, emitEvent);
    }
    /**
     * Method to select a character for data entry. TODO: Make part of component
     * @param increment is a bool for whether to increment or decrement the input character when the method is called
     * @returns a character to input into the data entry element
     */
    updateSelectedCharacter(increment = true) {
        this.inputCharacterIndex += increment ? 1 : -1;
        if (this.inputCharacterIndex > (this.characterMap.length - 1)) {
            this.inputCharacterIndex = 0;
        }
        else if (this.inputCharacterIndex < 0) {
            this.inputCharacterIndex = (this.characterMap.length - 1);
        }
        return this.characterMap[this.inputCharacterIndex];
    }
    /**
     * Method to update data entry field. TODO: Make part of component
     * @param newCharacter is the new string character to input
     * @param [emitEvent] A boolean indicating if a text changed event should be emitted.
     */
    updateDataEntryElement(newCharacter = undefined, emitEvent = true) {
        let beforeText = '';
        let selectedChar = '';
        let afterText = '';
        const text = this.dataEntry.text;
        if (this.dataEntry.highlightIndex !== undefined) {
            beforeText = text.substr(0, this.dataEntry.highlightIndex);
            selectedChar = text.substr(this.dataEntry.highlightIndex, 1);
            afterText = text.substr(this.dataEntry.highlightIndex + 1);
        }
        else {
            afterText = text;
        }
        if (newCharacter) {
            selectedChar = newCharacter;
            // clear chars after this
            const blankFill = this.props.maxLength - (this.dataEntry.highlightIndex + 1);
            if (blankFill > 1) {
                afterText = ''.padStart(blankFill, '_');
            }
        }
        this.inputCharacterIndex = this.characterMap.indexOf(selectedChar);
        const updatedText = beforeText + selectedChar + afterText;
        this.dataEntry.text = updatedText;
        if (emitEvent) {
            this.props.onTextChanged(this.dataEntry.text.replace(/_/g, ' ').trim());
        }
        this.dataEntry.beforeSelected.set(beforeText);
        this.dataEntry.selected.set(selectedChar);
        this.dataEntry.afterSelected.set(afterText);
    }
    /**
     * Handles the input from the hidden textbox
     */
    handleTextboxInput() {
        const targetChars = this.textBoxRef.instance.value.trimRight().length;
        this.dataEntry.text = this.textBoxRef.instance.value.toUpperCase().padEnd(6, '_');
        this.dataEntry.highlightIndex = Utils.Clamp(targetChars, 0, this.dataEntry.text.length - 1);
        this.updateDataEntryElement(undefined, true);
    }
    /**
     * Activates keyboard input. If this control is not active, activating keyboard input will activate this control as
     * well.
     */
    activateKeyboardInput() {
        if (!this.isActivated) {
            this.activate();
        }
        this.textBoxRef.instance.disabled = false;
        this.textBoxRef.instance.focus();
        this.isKeyboardActive = true;
    }
    /**
     * Deactivates keyboard input.
     */
    deactivateKeyboardInput() {
        this.textBoxRef.instance.blur();
        this.textBoxRef.instance.disabled = true;
        this.isKeyboardActive = false;
    }
    /** @inheritdoc */
    onUpperKnobInc() {
        if (!this.getIsActivated()) {
            this.activate();
            if (this.getRawText() === '') {
                this.inputCharacterIndex = 9;
                this.updateDataEntryElement(this.updateSelectedCharacter(true));
            }
        }
        else {
            this.updateDataEntryElement(this.updateSelectedCharacter(true));
        }
    }
    /** @inheritdoc */
    onUpperKnobDec() {
        if (!this.getIsActivated()) {
            this.activate();
            if (this.getRawText() === '') {
                this.inputCharacterIndex = 11;
                this.updateDataEntryElement(this.updateSelectedCharacter(false));
            }
        }
        else {
            this.updateDataEntryElement(this.updateSelectedCharacter(false));
        }
    }
    /** @inheritdoc */
    onLowerKnobInc() {
        if (this.dataEntry.highlightIndex < 5) {
            this.dataEntry.highlightIndex++;
            this.updateDataEntryElement();
            if (this.isKeyboardActive) {
                this.textBoxRef.instance.value = this.dataEntry.text.substr(0, this.dataEntry.highlightIndex);
            }
        }
    }
    /** @inheritdoc */
    onLowerKnobDec() {
        if (this.dataEntry.highlightIndex < 1) {
            this.dataEntry.highlightIndex = 0;
        }
        else {
            this.dataEntry.highlightIndex--;
            this.updateDataEntryElement();
            if (this.isKeyboardActive) {
                this.textBoxRef.instance.value = this.dataEntry.text.substr(0, this.dataEntry.highlightIndex);
            }
        }
    }
    /** @inheritdoc */
    onEnter() {
        if (this.getIsActivated()) {
            this.deactivate();
            if (this.props.onEnter) {
                this.props.onEnter(this);
            }
            return true;
        }
        else if (this.getIsFocused()) {
            if (this.props.onEnter) {
                this.props.onEnter(this);
            }
        }
        return false;
    }
    /** @inheritdoc */
    onClr() {
        if (this.getIsActivated()) {
            this.setText(this.previousValue);
            this.deactivate();
            return true;
        }
        return false;
    }
    /** @inheritdoc */
    getHighlightElement() {
        return this.inputValueContainerRef.instance;
    }
    /** @inheritdoc */
    onAfterRender() {
        super.onAfterRender();
        this.clear();
        this.inputValueContainerRef.instance.style.width = `${this.props.maxLength * 15}px`;
        this.keyboardIconRef.instance.onmouseup = this.handleKeyboardClicked;
        this.inputValueContainerRef.instance.onmouseup = this.handleKeyboardClicked;
        this.textBoxRef.instance.onfocus = this.onInputFocus;
        this.textBoxRef.instance.onblur = this.onInputBlur;
        this.textBoxRef.instance.blur();
        // Make sure we deactivate ourselves if we lose focus.
        this.focusSubject.sub((v, rv) => { !rv && this.isActivated && this.deactivate(); });
    }
    /** @inheritdoc */
    onActivated() {
        var _a;
        this.dataEntry.highlightIndex = 0;
        this.updateDataEntryElement();
        this.previousValue = this.getText();
        this.selectedSpanRef.instance.classList.add(UiControl.FOCUS_CLASS);
        (_a = this.getHighlightElement()) === null || _a === void 0 ? void 0 : _a.classList.remove(UiControl.FOCUS_CLASS);
    }
    /** @inheritdoc */
    onDeactivated() {
        var _a;
        this.previousValue = this.getText();
        this.textBoxRef.instance.blur();
        this.selectedSpanRef.instance.classList.remove(UiControl.FOCUS_CLASS);
        if (this.getIsFocused()) {
            (_a = this.getHighlightElement()) === null || _a === void 0 ? void 0 : _a.classList.add(UiControl.FOCUS_CLASS);
        }
    }
    /** @inheritdoc */
    renderControl() {
        return (FSComponent.buildComponent("div", { class: "input-component-scroller" },
            FSComponent.buildComponent("div", { ref: this.inputValueContainerRef, class: "input-component-value", style: "display:inline-block;" },
                this.dataEntry.beforeSelected,
                FSComponent.buildComponent("span", { ref: this.selectedSpanRef }, this.dataEntry.selected),
                this.dataEntry.afterSelected),
            FSComponent.buildComponent("input", { tabindex: "-1", ref: this.textBoxRef, width: "5px", style: "border:1px; background-color:black; opacity:0;", type: "text", size: "1", maxLength: "6" }),
            FSComponent.buildComponent("img", { ref: this.keyboardIconRef, src: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/keyboard_icon.png', class: 'input-component-keyboard-icon' })));
    }
}
