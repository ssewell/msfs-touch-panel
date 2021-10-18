import { FSComponent } from 'msfssdk';
import { ContextMenuPosition } from '../../../../Shared/UI/Dialogs/ContextMenuDialog';
import { SelectAirway } from '../../../../Shared/UI/Airway/SelectAirway';
import './PFDSelectAirway.css';
/**
 * A view which allows the user to select an airway on the PFD.
 */
export class PFDSelectAirway extends SelectAirway {
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent("div", { class: 'popout-dialog', ref: this.viewContainerRef },
            FSComponent.buildComponent("h1", null, this.props.title),
            FSComponent.buildComponent("div", { class: "set-airway-container" },
                FSComponent.buildComponent("div", { class: "set-airway-entry" }, "Entry"),
                FSComponent.buildComponent("div", { class: "set-airway-entry-value" }, this.controller.entrySubject),
                FSComponent.buildComponent("div", { class: "set-airway-airway" }, "Airway"),
                this.renderAirwaySelectControl(ContextMenuPosition.BOTTOM),
                FSComponent.buildComponent("div", { class: "set-airway-exit" }, "Exit"),
                this.renderExitSelectControl(ContextMenuPosition.BOTTOM),
                FSComponent.buildComponent("div", { class: "set-airway-press-ent" }, this.renderLoadButton()))));
    }
}
