import { ScrollUtils } from '../ScrollUtils';
import { UiControl } from './UiControl';
/** The ScrollController for UI Elements. */
export class ScrollController {
    constructor() {
        this.controls = [];
        this.isEnabled = true;
        this.lastFocusedIndex = 0;
        /**
         * Scroll forward.
         * @returns true if it was able to scroll into the given direction.
         */
        this.gotoNext = () => {
            return this.scrollTo('next');
        };
        /**
         * Scroll backwards.
         * @returns true if it was able to scroll into the given direction.
         */
        this.gotoPrev = () => {
            return this.scrollTo('prev');
        };
        /**
         * Callback to override when a scroll event happens.
         * @param ctrl The control now in focus.
         */
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.onScroll = (ctrl) => {
            const el = ctrl.getHighlightElement();
            if (el !== null && this.scrollContainer) {
                ScrollUtils.ensureInView(el, this.scrollContainer);
            }
        };
    }
    /**
     * Method to register a control.
     * @param ctrl The control to register.
     */
    registerCtrl(ctrl) {
        this.controls.push(ctrl);
    }
    /**
     * Registers a scroll container with this controller.
     * @param scrollContainer The html block element to assign.
     */
    registerScrollContainer(scrollContainer) {
        this.scrollContainer = scrollContainer;
    }
    // TODO how to handle DOM modifications (add/remove)
    // this solution is not ideal. in theory we need to observe DOM changes and react accordingly
    // but a uicontrol must not be a DOM element directly, its just a component at first. so it all becomes a bit messy. ideas?
    /**
     * Method to unregister a control.
     * @param ctrl The control to unregister.
     */
    unregisterCtrl(ctrl) {
        this.controls.splice(this.controls.indexOf(ctrl), 1);
    }
    /** Method to reset this control. */
    resetCtrls() {
        this.controls.length = 0;
    }
    /**
     * Toggles the scroll enabled state.
     */
    toggleScrollEnabled() {
        this.isEnabled = !this.isEnabled;
        if (this.isEnabled) {
            if (this.lastFocusedIndex > -1) {
                this.gotoIndex(this.lastFocusedIndex);
            }
        }
        for (let i = 0; i < this.controls.length; i++) {
            const ctrl = this.controls[i];
            if (ctrl.setScrollEnabled) {
                ctrl.setScrollEnabled(this.isEnabled);
            }
        }
        if (!this.isEnabled) {
            const focusCtrl = this.getFocusedUiControl();
            this.lastFocusedIndex = focusCtrl ? this.getFocusedUiControlIndex() : -1;
            focusCtrl === null || focusCtrl === void 0 ? void 0 : focusCtrl.blur();
        }
    }
    /**
     * Gets a value indicating if scrolling is enabled
     * @returns true if is scroll enabled
     */
    getIsScrollEnabled() {
        return this.isEnabled;
    }
    /**
     * Method to get the UiControl highlighted by the control.
     * @returns the selected UiControl or undefine
     */
    getFocusedUiControl() {
        return this.controls.find((v) => { return v.getIsFocused(); });
    }
    /**
     * Method to get the UiControl highlighted by the control.
     * @returns the selected UiControl or undefine
     */
    getActivatedUiControl() {
        return this.controls.find((v) => { return (v instanceof UiControl) && v.getIsActivated(); });
    }
    /**
     * Scrolls to the first suitable control.
     * @returns Whether the operation was successful.
     */
    gotoFirst() {
        return this.scrollTo('next', -1);
    }
    /**
     * Highlight the last suitable control.
     * @returns Whether the operation was successful.
     */
    gotoLast() {
        return this.scrollTo('prev', this.controls.length);
    }
    /**
     * Highlight the selected control on the page.
     * @param index is the index to highlight.
     * @returns Whether the operation was successful.
     */
    gotoIndex(index) {
        if (index < 0) {
            return this.scrollTo('next', -1);
        }
        else if (index < this.controls.length) {
            return this.scrollTo('next', index - 1);
        }
        else {
            return this.scrollTo('prev', this.controls.length);
        }
    }
    /**
     * Gets controls count
     * @returns controls count
     */
    getControlsCount() {
        return this.controls.length;
    }
    /** Unfocus the focused control. */
    blur() {
        for (let i = 0; i < this.controls.length; i++) {
            this.controls[i].blur();
        }
    }
    /**
     * Highlights the next focusable control in the direction.
     * @param direction The direction to scroll to.
     * @param activeIdx The index to start the scroll from.
     * @returns true if it was able to scroll into the given direction.
     */
    scrollTo(direction, activeIdx = this.getFocusedUiControlIndex()) {
        var _a;
        if (!this.isEnabled) {
            return false;
        }
        if (this.controls.length > 0) {
            const isAtBounds = ((activeIdx === 0 && direction === 'prev')
                || (activeIdx === this.controls.length - 1 && direction === 'next'));
            const nextCtrl = this.findControlToFocus(activeIdx, direction);
            if (nextCtrl !== undefined) {
                (_a = this.getFocusedUiControl()) === null || _a === void 0 ? void 0 : _a.blur();
                // typecheck for UiControlGroup to avoid circular dependency
                if (nextCtrl.processHEvent) {
                    nextCtrl.focus((direction === 'next') ? 'top' : 'bottom');
                }
                else {
                    nextCtrl.focus();
                }
                this.onScroll(nextCtrl);
                return !isAtBounds;
            }
            else {
                const focusedCtrl = this.getFocusedUiControl();
                if (focusedCtrl !== undefined) {
                    this.onScroll(focusedCtrl);
                }
                return false;
            }
        }
        return false;
    }
    /**
     * Founds the next/prev control that is able to be focused.
     * Returns undefined when no suitable control is found.
     * @private
     * @param activeIdx The index to start the search from.
     * @param direction The direction to look into.
     * @returns A focusable UiControl or undefined.
     */
    findControlToFocus(activeIdx, direction) {
        const nextIdx = (direction === 'next') ? activeIdx + 1 : activeIdx - 1;
        // const ctrl = this.controls[MathUtils.clamp(nextIdx, 0, this.controls.length - 1)];
        const ctrl = this.controls[nextIdx];
        if (ctrl === undefined || ctrl.getIsFocusable()) {
            return ctrl;
        }
        else {
            return this.findControlToFocus(nextIdx, direction);
        }
    }
    /**
     * Gets the index of the focused control.
     * @private
     * @returns The index.
     */
    getFocusedUiControlIndex() {
        return this.controls.findIndex((v) => { return v.getIsFocused(); });
    }
}
