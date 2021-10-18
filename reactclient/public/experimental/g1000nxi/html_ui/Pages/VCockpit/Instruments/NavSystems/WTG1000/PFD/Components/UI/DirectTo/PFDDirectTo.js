import { FSComponent } from 'msfssdk';
import { ActionButton } from '../../../../Shared/UI/UIControls/ActionButton';
import { DirectTo } from '../../../../Shared/UI/DirectTo/DirectTo';
import './PFDDirectTo.css';
/**
 * The PFD direct-to popout.
 */
export class PFDDirectTo extends DirectTo {
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: 'popout-dialog pfd-dto', ref: this.viewContainerRef },
            FSComponent.buildComponent("h1", null, this.props.title),
            this.renderWaypointInput(),
            FSComponent.buildComponent("hr", null),
            FSComponent.buildComponent("div", { class: "pfd-dto-alt-offset" },
                FSComponent.buildComponent("div", { class: "offset-grey size14" },
                    "ALT ",
                    FSComponent.buildComponent("span", { class: "cyan" }, "_ _ _ _ _FT")),
                FSComponent.buildComponent("div", { class: "offset-grey size14" },
                    "Offset ",
                    FSComponent.buildComponent("span", { class: "cyan" },
                        "+0",
                        FSComponent.buildComponent("span", { class: "size12 cyan" }, "NM")))),
            FSComponent.buildComponent("hr", null),
            FSComponent.buildComponent("div", { class: 'pfd-dto-wpt-data' },
                FSComponent.buildComponent("div", { class: 'pfd-dto-wpt-data-field pfd-dto-bearing' },
                    FSComponent.buildComponent("div", { class: 'pfd-dto-wpt-data-field-title' }, "BRG"),
                    this.renderBearing()),
                FSComponent.buildComponent("div", { class: 'pfd-dto-wpt-data-field pfd-dto-distance' },
                    FSComponent.buildComponent("div", { class: 'pfd-dto-wpt-data-field-title' }, "DIS"),
                    this.renderDistance()),
                FSComponent.buildComponent("div", { class: 'pfd-dto-wpt-data-field pfd-dto-course' },
                    FSComponent.buildComponent("div", { class: 'pfd-dto-wpt-data-field-title' }, "CRS"),
                    FSComponent.buildComponent("div", null, "- - -\u00B0"))),
            FSComponent.buildComponent(ActionButton, { onRegister: this.register, class: "activate", isVisible: this.controller.canActivate, onExecute: this.onLoadExecuted, text: "Activate?" })));
    }
}
