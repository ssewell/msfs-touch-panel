import { FSComponent, Subject, DisplayComponent } from 'msfssdk';
import { UiView } from '../UiView';
import { ActionButton } from '../UIControls/ActionButton';
import { FmsHEvent } from '../FmsHEvent';
import './MessageDialog.css';
/**
 * Confirmation dialog for generic messages.
 */
export class MessageDialog extends UiView {
    constructor() {
        super(...arguments);
        this.closeOnAccept = true;
        this.contentRef = FSComponent.createRef();
        this.confirmButtonText = Subject.create('');
        this.rejectButtonText = Subject.create('');
        this.orDivRef = FSComponent.createRef();
        this.rejectButtonRef = FSComponent.createRef();
        this.renderedContent = null;
        /** Callback for when the first button is pressed. */
        this.onButton1Pressed = () => {
            //this.close();
            this.accept(true, this.closeOnAccept);
        };
        /** Callback for when the second button is pressed. */
        this.onButton2Pressed = () => {
            this.accept(false, this.closeOnAccept);
        };
    }
    /** @inheritdoc */
    onInputDataSet(input) {
        if (input) {
            this.rejectButtonRef.instance.setIsVisible(input.hasRejectButton ? true : false);
            this.orDivRef.instance.style.display = input.hasRejectButton ? '' : 'none';
            this.closeOnAccept = input.closeOnAccept !== undefined ? input.closeOnAccept : true;
            this.renderContent(input);
        }
    }
    /** @inheritdoc */
    onInteractionEvent(evt) {
        // noop
        switch (evt) {
            case FmsHEvent.CLR:
                this.close();
                return true;
        }
        return false;
    }
    /**
     * Renders the dialog content.
     * @param input The input data
     **/
    renderContent(input) {
        var _a, _b;
        this.cleanUpRenderedContent();
        if (input) {
            this.confirmButtonText.set((_a = input.confirmButtonText) !== null && _a !== void 0 ? _a : 'OK');
            this.rejectButtonText.set((_b = input.rejectButtonText) !== null && _b !== void 0 ? _b : 'CANCEL');
        }
        if (input.inputString !== undefined) {
            // we use innerHTML rather than textContent so we can provide pre-formatted strings.
            this.contentRef.instance.innerHTML = input.inputString;
        }
        else {
            // render items
            if (input.renderContent) {
                this.renderedContent = input.renderContent();
                FSComponent.render(this.renderedContent, this.contentRef.instance);
            }
        }
    }
    /**
     * Cleans up any rendered content.
     */
    cleanUpRenderedContent() {
        var _a;
        this.contentRef.instance.innerHTML = '';
        if (((_a = this.renderedContent) === null || _a === void 0 ? void 0 : _a.instance) instanceof DisplayComponent) {
            this.renderedContent.instance.destroy();
        }
        this.renderedContent = null;
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: 'popout-dialog msgdialog', ref: this.viewContainerRef },
            FSComponent.buildComponent("div", { class: 'msgdialog-popout-background' },
                FSComponent.buildComponent("div", { class: 'msgdialog-container' },
                    FSComponent.buildComponent("div", { class: 'msgdialog-content msgdialog-center', ref: this.contentRef }),
                    FSComponent.buildComponent("hr", { class: 'msgdialog-hr' }),
                    FSComponent.buildComponent("div", { class: "msgdialog-action-buttons" },
                        FSComponent.buildComponent(ActionButton, { onRegister: this.register, onExecute: this.onButton1Pressed, text: this.confirmButtonText }),
                        FSComponent.buildComponent("div", { ref: this.orDivRef }, "or"),
                        FSComponent.buildComponent(ActionButton, { ref: this.rejectButtonRef, onRegister: this.register, onExecute: this.onButton2Pressed, text: this.rejectButtonText }))))));
    }
}
