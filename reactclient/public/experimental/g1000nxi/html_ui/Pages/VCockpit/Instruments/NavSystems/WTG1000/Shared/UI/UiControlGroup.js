import { DisplayComponent, Subject } from 'msfssdk';
import { FmsHEvent } from './FmsHEvent';
import { ScrollController } from './ScrollController';
import { UiControl } from './UiControl';
/** Ui control group */
export class UiControlGroup extends DisplayComponent {
    /** @inheritdoc */
    constructor(props) {
        super(props);
        this.scrollController = new ScrollController();
        this.focusSubject = Subject.create(false);
        /** Register/Unregisters a UiControl with the scroll controller.
         * @param ctrl The UiControl to register.
         * @param unregister Indicates if the UiControl should be unregistered.
         */
        this.register = (ctrl, unregister = false) => {
            if (unregister) {
                this.scrollController.unregisterCtrl(ctrl);
            }
            else {
                this.scrollController.registerCtrl(ctrl);
            }
        };
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
    /** @inheritdoc */
    onBeforeRender() {
        if (this.props.onRegister) {
            this.props.onRegister(this);
        }
    }
    /**
     * Method to focus this control group
     * @param dir The direction of entry.
     */
    focus(dir = 'top') {
        this.focusSubject.set(true);
        if (dir === 'top') {
            this.scrollController.gotoFirst();
        }
        else {
            this.scrollController.gotoLast();
        }
    }
    /** Method to unfocus this control group */
    blur() {
        this.focusSubject.set(false);
        // TODO: maybe we need to bubble down the blur...
        this.scrollController.blur();
    }
    /** Method to check if this UiControlGroup is in focus
     * @returns true if the control group is in focus, false otherwise
     */
    getIsFocused() {
        return this.focusSubject.get();
    }
    /**
     * Gets a boolean indicating if this control is able to be focused.
     * @returns true
     */
    getIsFocusable() {
        return this.scrollController.getControlsCount() > 0;
    }
    /**
     * A method called when the control group scroll is toggled.
     * @param enabled if the scroll is enabled.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onScrollToggled(enabled) {
        // noop, override it if needed
    }
    /**
     * Toggles the scroll highlighting
     */
    toggleScroll() {
        this.scrollController.toggleScrollEnabled();
        this.onScrollToggled(this.scrollController.getIsScrollEnabled());
    }
    /**
     * Sets the scroll enabled state
     * @param enabled indicating if scrolling should be enabled
     */
    setScrollEnabled(enabled) {
        if (this.scrollController.getIsScrollEnabled() !== enabled) {
            this.toggleScroll();
        }
    }
    /**
     * This is just a dummy that exists here to be compatible
     * with the union type of ScrollableControl
     * @returns null
     */
    getHighlightElement() {
        return null;
    }
    /**
     * Handles HEvents and routes them to the subdialog when existant.
     * @param evt The received event.
     * @returns true if the event was handled in this control group, false otherwise.
     */
    processHEvent(evt) {
        const focusCtrl = this.scrollController.getFocusedUiControl();
        if (focusCtrl instanceof UiControlGroup && focusCtrl.processHEvent(evt)) {
            return true;
        }
        const activeCtrl = this.scrollController.getActivatedUiControl();
        if (activeCtrl instanceof UiControl && this.routeEventToControl(evt, activeCtrl)) {
            return true;
        }
        if (focusCtrl instanceof UiControl
            && evt !== FmsHEvent.LOWER_DEC
            && evt !== FmsHEvent.LOWER_INC
            && this.routeEventToControl(evt, focusCtrl)) {
            return true;
        }
        switch (evt) {
            case FmsHEvent.UPPER_DEC:
            case FmsHEvent.UPPER_INC:
                if (!this.props.upperKnobCanScroll) {
                    break;
                }
            // eslint-disable-next-line no-fallthrough
            case FmsHEvent.LOWER_DEC:
            case FmsHEvent.LOWER_INC:
                if (this.processScrollEvent(evt)) {
                    return true;
                }
        }
        return this.onInteractionEvent(evt);
    }
    /**
     * Routes an interaction event to a UiControl.
     * @param evt An interaction event.
     * @param control The UiControl to which to route the event.
     * @returns Whether the event was handled by the UiControl.
     */
    routeEventToControl(evt, control) {
        switch (evt) {
            case FmsHEvent.UPPER_DEC:
            case FmsHEvent.UPPER_INC:
                if (this.props.upperKnobCanScroll) {
                    break;
                }
            // eslint-disable-next-line no-fallthrough
            default:
                return control.onInteractionEvent(evt);
        }
        return false;
    }
    /**
     * Attempts to handle scroll events.
     * @param evt The received event.
     * @returns whether the event was handled.
     */
    processScrollEvent(evt) {
        if (this.scrollController.getIsScrollEnabled()) {
            switch (evt) {
                case FmsHEvent.LOWER_DEC:
                case FmsHEvent.UPPER_DEC:
                    return this.scrollController.gotoPrev();
                case FmsHEvent.LOWER_INC:
                case FmsHEvent.UPPER_INC:
                    return this.scrollController.gotoNext();
            }
        }
        return false;
    }
    /**
     * Handler for interaction events to be handled by the view.
     * @param evt The HEvenet.
     * @returns true if the event was handled in this group
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onInteractionEvent(evt) {
        // noop, override it if needed
        return false;
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
}
