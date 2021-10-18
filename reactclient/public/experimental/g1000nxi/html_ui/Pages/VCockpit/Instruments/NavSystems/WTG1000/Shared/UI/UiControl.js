import { DisplayComponent, FSComponent, ComputedSubject, Subject } from 'msfssdk';
import { FmsHEvent } from './FmsHEvent';
/**
 * The UiControl component.
 */
export class UiControl extends DisplayComponent {
    /** @inheritdoc */
    constructor(props) {
        super(props);
        this.focusSubject = ComputedSubject.create(false, (v) => {
            return v ? UiControl.FOCUS_CLASS : '';
        });
        this.isEnabledSubject = Subject.create(true);
        this.isVisibleSubject = Subject.create(true);
        this.isActivated = false;
        this.registerSelf = true;
        this.containerRef = FSComponent.createRef();
        this.focusSubject.sub(isFocused => {
            if (isFocused) {
                this.onFocused();
                this.props.onFocused && this.props.onFocused(this);
            }
            else {
                this.onBlurred();
                this.props.onBlurred && this.props.onBlurred(this);
            }
        });
    }
    /** Method to focus this control */
    focus() {
        this.focusSubject.set(true);
    }
    /** Method to unfocus this control */
    blur() {
        this.focusSubject.set(false);
        this.isActivated = false;
    }
    /** Activates the control. Usually after being focused and some action happens. */
    activate() {
        this.isActivated = true;
        this.onActivated();
        if (this.props.onActivated) {
            this.props.onActivated(this);
        }
    }
    /** Deactivate the control. */
    deactivate() {
        this.isActivated = false;
        this.onDeactivated();
        if (this.props.onDeactivated) {
            this.props.onDeactivated(this);
        }
    }
    /** Method to check if this UiControl is in focus
     * @returns a boolean whether this is in focus
     */
    getIsFocused() {
        return this.focusSubject.getRaw();
    }
    /**
     * Gets a boolean indicating if this control is enabled.
     * @returns A boolean.
     */
    getIsEnabled() {
        return this.isEnabledSubject.get();
    }
    /**
     * Sets the enabled state of this control.
     * @param enable A {boolean} indicating if this control should be enabled.
     */
    setIsEnabled(enable) {
        if (!enable && this.getIsFocused()) {
            this.blur();
        }
        this.isEnabledSubject.set(enable);
    }
    /**
     * Sets the visibility of this control.
     * @param visible A {boolean} indicating if this control should be visible.
     */
    setIsVisible(visible) {
        this.isVisibleSubject.set(visible);
    }
    /**
     * Gets a boolean indicating if this control is visible.
     * @returns A boolean.
     */
    getIsVisible() {
        return this.isVisibleSubject.get();
    }
    /**
     * Gets a boolean indicating if this control is able to be focused.
     * @returns A boolean.
     */
    getIsFocusable() {
        return this.getIsEnabled() && this.getIsVisible();
    }
    /**
     * Gets a boolean indicating if this control is currently activated.
     * @returns A boolean.
     */
    getIsActivated() {
        return this.isActivated;
    }
    /** @inheritdoc */
    onBeforeRender() {
        this.onRegister();
    }
    /** @inheritdoc */
    onAfterRender() {
        var _a;
        this.focusSubject.sub((v, rv) => {
            var _a, _b;
            if (rv) {
                (_a = this.getHighlightElement()) === null || _a === void 0 ? void 0 : _a.classList.add(UiControl.FOCUS_CLASS);
            }
            else {
                (_b = this.getHighlightElement()) === null || _b === void 0 ? void 0 : _b.classList.remove(UiControl.FOCUS_CLASS);
            }
        }, true);
        this.isVisibleSubject.sub((v) => {
            if (v) {
                this.containerRef.instance.classList.remove(UiControl.HIDE_CLASS);
            }
            else {
                this.containerRef.instance.classList.add(UiControl.HIDE_CLASS);
            }
        }, true);
        (_a = this.props.isVisible) === null || _a === void 0 ? void 0 : _a.sub((v) => {
            this.setIsVisible(v);
        }, true);
    }
    /**
     * Gets the element to highlight on focus.
     * Should be overriden by inheriting controls when the highlight is not the topmost container.
     * @protected
     * @returns The {Element} to highlight.
     */
    getHighlightElement() {
        return this.containerRef.instance.firstElementChild;
    }
    /** Method to register this Ui Control */
    onRegister() {
        if (this.props.onRegister) {
            if (this.registerSelf) {
                this.props.onRegister(this);
            }
        }
        else {
            console.warn('No register method found for UiControl');
        }
    }
    /**
     * A callback which is called when this control group is focused.
     */
    onFocused() {
        // noop
    }
    /**
     * A callback which is called when this control group is blurred.
     */
    onBlurred() {
        // noop
    }
    /** Method to override what to do when control is activated */
    onActivated() {
        var _a, _b;
        (_a = this.getHighlightElement()) === null || _a === void 0 ? void 0 : _a.classList.remove(UiControl.FOCUS_CLASS);
        (_b = this.getHighlightElement()) === null || _b === void 0 ? void 0 : _b.classList.add(UiControl.ACTIVE_CLASS);
    }
    /** Method to override what to do when control is deactivated */
    onDeactivated() {
        var _a, _b;
        (_a = this.getHighlightElement()) === null || _a === void 0 ? void 0 : _a.classList.remove(UiControl.ACTIVE_CLASS);
        if (this.getIsFocused()) {
            (_b = this.getHighlightElement()) === null || _b === void 0 ? void 0 : _b.classList.add(UiControl.FOCUS_CLASS);
        }
    }
    /**
     * A method which is called when this control receives an interaction event.
     * @param evt The event.
     * @returns Whether the event was handled.
     */
    onInteractionEvent(evt) {
        switch (evt) {
            case FmsHEvent.UPPER_INC:
                this.onUpperKnobInc();
                return true;
            case FmsHEvent.UPPER_DEC:
                this.onUpperKnobDec();
                return true;
            case FmsHEvent.LOWER_DEC:
                this.onLowerKnobDec();
                return true;
            case FmsHEvent.LOWER_INC:
                this.onLowerKnobInc();
                return true;
            case FmsHEvent.ENT:
                return this.onEnter();
            case FmsHEvent.CLR:
                return this.onClr();
            case FmsHEvent.DIRECTTO:
                return this.onDirectTo();
        }
        return false;
    }
    /** Method to override that specifies what to do on Enter
     * @returns A boolean indicating if the control handled the event.
     */
    onEnter() {
        if (this.props.onEnter) {
            return this.props.onEnter(this);
        }
        return false;
    }
    /** Method to override that specifies what to do on Clr
     * @returns A boolean indicating if the control handled the event.
     */
    onClr() {
        if (this.props.onClr) {
            return this.props.onClr(this);
        }
        return false;
    }
    /**
     * Method to overwirte that specifies what to do on a direct to.
     * @returns A boolean indicating if the control handleded the event.
     */
    onDirectTo() {
        if (this.props.onDirectTo) {
            return this.props.onDirectTo(this);
        }
        return false;
    }
    /** Method to override that specifies what to do on upper knob */
    onUpperKnob() {
        if (this.props.onUpperKnob) {
            this.props.onUpperKnob(this);
        }
    }
    /** Method to override that specifies what to do on upper knob inc */
    onUpperKnobInc() {
        if (this.props.onUpperKnobInc) {
            this.props.onUpperKnobInc(this);
        }
        else {
            this.onUpperKnob();
        }
    }
    /** Method to override that specifies what to do on upper knob dec */
    onUpperKnobDec() {
        if (this.props.onUpperKnobDec) {
            this.props.onUpperKnobDec(this);
        }
        else {
            this.onUpperKnob();
        }
    }
    /** Method to override that specifies what to do on lower knob */
    onLowerKnob() {
        if (this.props.onLowerKnob) {
            this.props.onLowerKnob(this);
        }
    }
    /** Method to override that specifies what to do on lower knob inc */
    onLowerKnobInc() {
        if (this.props.onLowerKnobInc) {
            this.props.onLowerKnobInc(this);
        }
        else {
            this.onLowerKnob();
        }
    }
    /** Method to override that specifies what to do on lower knob dec */
    onLowerKnobDec() {
        if (this.props.onLowerKnobDec) {
            this.props.onLowerKnobDec(this);
        }
        else {
            this.onLowerKnob();
        }
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        var _a;
        const content = (this.props.children && this.props.children.length > 0) ? this.props.children : this.renderControl();
        const hideClass = this.getIsVisible() ? '' : UiControl.HIDE_CLASS;
        return (
        // TODO: would like to have this more layout neutral
        FSComponent.buildComponent("div", { ref: this.containerRef, class: `${(_a = this.props.class) !== null && _a !== void 0 ? _a : ''} ${hideClass}` }, content));
    }
}
UiControl.FOCUS_CLASS = 'highlight-select';
UiControl.ACTIVE_CLASS = 'highlight-active';
UiControl.HIDE_CLASS = 'hide-element';
