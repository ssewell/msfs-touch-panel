import { FSComponent } from 'msfssdk';
import { ArrowToggle } from '../../../../Shared/UI/UIControls/ArrowToggle';
import { ActionButton } from '../../../../Shared/UI/UIControls/ActionButton';
import { ContextMenuPosition } from '../../../../Shared/UI/Dialogs/ContextMenuDialog';
import { SelectApproach } from '../../../../Shared/UI/Procedure/SelectApproach';
import { SelectApproachController } from '../../../../Shared/UI/Controllers/SelectApproachController';
import './PFDSelectApproach.css';
/**
 * A PFD view for selecting approaches.
 */
export class PFDSelectApproach extends SelectApproach {
    /** @inheritdoc */
    createController() {
        return new SelectApproachController(this.store, this.gotoNextSelect.bind(this), this.props.fms, 'FPL', false);
    }
    /**
     * A callback which is called when the Load action is executed.
     */
    onLoadExecuted() {
        this.controller.onLoadExecuted();
    }
    /**
     * A callback which is called when the Activate action is executed.
     */
    onActivateExecuted() {
        this.controller.onActivateExecuted();
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: 'popout-dialog', ref: this.viewContainerRef },
            FSComponent.buildComponent("h1", null, this.props.title),
            this.renderWaypointInput(),
            FSComponent.buildComponent("hr", null),
            FSComponent.buildComponent("div", { class: "slct-appr-container" },
                FSComponent.buildComponent("div", { class: "slct-appr-label" }, "APR"),
                this.renderApproachSelectControl(ContextMenuPosition.CENTER),
                FSComponent.buildComponent("div", { class: "slct-appr-trans-label" }, "TRANS"),
                this.renderTransitionSelectControl(ContextMenuPosition.CENTER),
                FSComponent.buildComponent("div", { class: "slct-appr-rnav-id" }, "ID _ _ _ _ _"),
                FSComponent.buildComponent("div", { class: "slct-appr-mins-label" }, "MINS"),
                FSComponent.buildComponent(ArrowToggle, { class: "slct-appr-mins-toggle", onRegister: this.register, onOptionSelected: this.controller.onMinimumsOptionSelected, options: this.store.minsToggleOptions, dataref: this.store.minimumsMode }),
                FSComponent.buildComponent("div", { "data-id": "select-min", class: "slct-appr-mins-value cyan size18" }),
                FSComponent.buildComponent("div", { class: "slct-appr-mins-value" },
                    this.renderMinimumsNumberInput(),
                    FSComponent.buildComponent("span", { class: "size12" }, "FT")),
                FSComponent.buildComponent("div", { class: "slct-appr-freq-label" }, "PRIM FREQ"),
                FSComponent.buildComponent("div", { "data-id": "select-freq", class: "slct-appr-freq-value cyan size18" }, this.store.frequencySubject),
                FSComponent.buildComponent("div", { class: "slct-appr-freq-ident" }, "IVII")),
            FSComponent.buildComponent("hr", null),
            FSComponent.buildComponent(ActionButton, { onRegister: this.register, class: "slct-appr-load", isVisible: this.controller.canLoad, onExecute: this.onLoadExecuted.bind(this), text: "Load?" }),
            FSComponent.buildComponent("div", { class: "slct-appr-or" }, this.controller.canLoadOrText),
            FSComponent.buildComponent(ActionButton, { onRegister: this.register, class: "slct-appr-activate", isVisible: this.controller.canActivate, onExecute: this.onActivateExecuted.bind(this), text: "Activate?" })));
    }
}
