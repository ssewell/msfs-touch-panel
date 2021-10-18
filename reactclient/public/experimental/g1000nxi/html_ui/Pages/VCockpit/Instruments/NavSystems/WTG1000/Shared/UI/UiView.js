import { FSComponent, SubEvent, Subject } from 'msfssdk';
import { UiControlGroup } from './UiControlGroup';
import './UiView.css';
/** A UiView component. */
export class UiView extends UiControlGroup {
    constructor() {
        super(...arguments);
        this.viewContainerRef = FSComponent.createRef();
        this.inputData = Subject.create(undefined);
        this.onOpen = new SubEvent();
        this.onClose = new SubEvent();
        this.onAccept = new SubEvent();
    }
    /**
     * Shows the view.
     * @param isSubView Whether the view is being displayed as a subview.
     * @param zIndex The z-index to assign on the view container.
     */
    open(isSubView, zIndex) {
        if (this.viewContainerRef.instance !== null) {
            if (zIndex) {
                this.viewContainerRef.instance.style.zIndex = `${zIndex}`;
            }
            this.viewContainerRef.instance.classList.remove('quickclosed');
            this.viewContainerRef.instance.classList.remove('closed');
            this.viewContainerRef.instance.classList.add('open');
            isSubView && this.viewContainerRef.instance.classList.add('subview');
            this.notifyViewOpened();
            this.notifyViewResumed();
        }
    }
    /**
     * Closes the view.
     * @param quickclose bool stating whether to quickclose the child.
     */
    close(quickclose = false) {
        if (this.viewContainerRef.instance !== null) {
            this.notifyViewPaused();
            this.viewContainerRef.instance.classList.remove('open');
            if (quickclose === true) {
                this.viewContainerRef.instance.classList.add('quickclosed');
            }
            else {
                this.viewContainerRef.instance.classList.add('closed');
            }
            this.notifyViewClosed();
            this.setInput(undefined);
            this.viewResult = undefined;
            this.onAccept.clear();
        }
    }
    /**
     * Sets this view's z-index.
     * @param zIndex The new z-indez. If not defined, the view's z-index will be reset.
     */
    setZIndex(zIndex) {
        this.viewContainerRef.instance.style.zIndex = `${zIndex !== null && zIndex !== void 0 ? zIndex : ''}`;
    }
    /**
     * Set data on this view.
     * @param input The input data.
     * @returns This view instance for chain commands.
     */
    setInput(input) {
        this.inputData.set(input);
        this.onInputDataSet(input);
        return this;
    }
    /**
     * Confirms the view result and closes the view.
     * @param [result] Provide the view result if not already set.
     * @param closeView Indicates if the view should be closed after confirming the result.
     */
    accept(result, closeView = true) {
        if (result !== undefined) {
            this.viewResult = result;
        }
        this.notifyViewAccept();
        if (closeView) {
            this.close();
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    processScrollEvent(evt) {
        if (this.scrollController.getIsScrollEnabled()) {
            // Do not let scroll events fall through if scrolling is enabled.
            super.processScrollEvent(evt);
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Notifies subscribers that the view has been opened.
     * @protected
     */
    notifyViewOpened() {
        this.focus();
        this.onViewOpened();
        this.onOpen.notify(this);
    }
    /**
     * Notifies subscribers that the view has been resumed.
     */
    notifyViewResumed() {
        this.onViewResumed();
    }
    /**
     * Notifies subscribers that the view has been paused.
     */
    notifyViewPaused() {
        this.onViewPaused();
    }
    /**
     * Notifies subscribers that the view has been closed including the view result.
     */
    notifyViewClosed() {
        this.onViewClosed();
        this.onClose.notify(this);
        this.blur();
    }
    /**
     * Notifies subscribers that the view the user confirmed the view and a result should be available.
     */
    notifyViewAccept() {
        this.onAccept.notify(this, this.viewResult);
    }
    /** Method to be overridden by view inheriting UiView to do something when the view opens. */
    onViewOpened() {
        //noop
    }
    /** Method to be overridden by view inheriting UiView to do something when the dialog opens. */
    onViewResumed() {
        // noope
    }
    /** Method to be overridden by view inheriting UiView to do something when the dialog opens. */
    onViewPaused() {
        //noop
    }
    /** Method to be overridden by view inheriting UiView to do something when the dialog opens. */
    onViewClosed() {
        //noop
    }
    /**
     * Method to be overridden by view inheriting UiView to do something when the input data is set.
     * @protected
     * @param input The data that was set.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onInputDataSet(input) {
        //noop
    }
    /**
     * Pauses the view (usually only called by ViewService).
     */
    pause() {
        this.notifyViewPaused();
    }
    /**
     * Resumes the view (usually only called by ViewService).
     */
    resume() {
        this.notifyViewResumed();
    }
}
