import { FSComponent } from 'msfssdk';
import { ContextMenuPosition } from '../../../../Shared/UI/Dialogs/ContextMenuDialog';
import { SetRunway } from '../../../../Shared/UI/SetRunway/SetRunway';
import { SelectControl } from '../../../../Shared/UI/UIControls/SelectControl';
import './PFDSetRunway.css';
/**
 * A dialog for setting runways.
 */
export class PFDSetRunway extends SetRunway {
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: 'popout-dialog pfd-setrunway', ref: this.viewContainerRef },
            FSComponent.buildComponent("h1", null, this.props.title),
            FSComponent.buildComponent("div", { class: "pfd-setrunway-container" },
                FSComponent.buildComponent("div", { class: "pfd-setrunway-airport" }, "Airport"),
                FSComponent.buildComponent("div", { class: "pfd-setrunway-airport-value" }, this.store.airportIdent),
                FSComponent.buildComponent("div", { class: "pfd-setrunway-runway" }, "Runway"),
                FSComponent.buildComponent(SelectControl, { onRegister: this.register, dialogPosition: ContextMenuPosition.BOTTOM, outerContainer: this.viewContainerRef, data: this.store.oneWayRunways, buildMenuItem: this.buildRunwayMenuItem.bind(this), onItemSelected: this.onRunwaySelected.bind(this), class: "pfd-setrunway-runway-value" }),
                FSComponent.buildComponent("div", { class: "pfd-setrunway-press-ent" }, "Press \"ENT\" to accept"))));
    }
}
