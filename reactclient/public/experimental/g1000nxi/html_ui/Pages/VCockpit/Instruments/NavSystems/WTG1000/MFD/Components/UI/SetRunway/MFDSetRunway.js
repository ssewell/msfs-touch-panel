import { FSComponent } from 'msfssdk';
import { ContextMenuPosition } from '../../../../Shared/UI/Dialogs/ContextMenuDialog';
import { SetRunway } from '../../../../Shared/UI/SetRunway/SetRunway';
import { SelectControl } from '../../../../Shared/UI/UIControls/SelectControl';
import { GroupBox } from '../GroupBox';
import './MFDSetRunway.css';
/**
 * A dialog for setting runways.
 */
export class MFDSetRunway extends SetRunway {
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: 'popout-dialog mfd-setrunway', ref: this.viewContainerRef },
            FSComponent.buildComponent("h1", null, this.props.title),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Runway" },
                FSComponent.buildComponent("div", { class: "mfd-setrunway-container" },
                    FSComponent.buildComponent("div", { class: "mfd-setrunway-left mfd-setrunway-airport" }, "Airport"),
                    FSComponent.buildComponent("div", { class: "mfd-setrunway-right mfd-setrunway-airport-value" }, this.store.airportIdent),
                    FSComponent.buildComponent("div", { class: "mfd-setrunway-left mfd-setrunway-runway" }, "Runway"),
                    FSComponent.buildComponent(SelectControl, { onRegister: this.register, outerContainer: this.viewContainerRef, dialogPosition: ContextMenuPosition.CENTER, data: this.store.oneWayRunways, buildMenuItem: this.buildRunwayMenuItem.bind(this), onItemSelected: this.onRunwaySelected.bind(this), class: "mfd-setrunway-right mfd-setrunway-runway-value" }))),
            FSComponent.buildComponent("div", { class: "mfd-setrunway-press-ent" }, "Press \"ENT\" to accept")));
    }
}
