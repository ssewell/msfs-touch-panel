import { FSComponent } from 'msfssdk';
import { ProcedureType } from '../../../../Shared/FlightPlan/Fms';
import { ActionButton } from '../../../../Shared/UI/UIControls/ActionButton';
import { ContextMenuPosition } from '../../../../Shared/UI/Dialogs/ContextMenuDialog';
import { SelectDepartureController, SelectDepartureStore } from '../../../../Shared/UI/Procedure/SelectDeparture';
import { SelectArrivalController, SelectArrivalStore } from '../../../../Shared/UI/Procedure/SelectArrival';
import { SelectProcedure } from '../../../../Shared/UI/Procedure/SelectProcedure';
import './PFDSelectProcedure.css';
/**
 * A PFD view for selecting departures/arrivals.
 */
export class PFDSelectProcedure extends SelectProcedure {
    /**
     * A callback which is called when the Load action is executed.
     */
    onLoadSelected() {
        this.controller.onLoadSelected();
        this.props.viewService.open('FPL');
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
            FSComponent.buildComponent("div", { class: "slctproc-container" },
                FSComponent.buildComponent("div", { class: "slctproc-proc-label" }, this.getProcLabel()),
                this.renderProcedureSelectControl(ContextMenuPosition.LEFT),
                FSComponent.buildComponent("div", { class: "slctproc-rwy-label" }, "Runway"),
                this.renderRunwaySelectControl(ContextMenuPosition.LEFT),
                FSComponent.buildComponent("div", { class: "slctproc-trans-label" }, "Transition"),
                this.renderEnrouteSelectControl(ContextMenuPosition.LEFT)),
            FSComponent.buildComponent("hr", null),
            FSComponent.buildComponent(ActionButton, { onRegister: this.register, class: "slctproc-load", onExecute: this.onLoadSelected.bind(this), isVisible: this.controller.canLoad, text: "Load?" })));
    }
}
/**
 * A PFD view to select departures.
 */
export class PFDSelectDeparture extends PFDSelectProcedure {
    /** @inheritdoc */
    getController() {
        return new SelectDepartureController(this.getStore(), this.gotoNextSelect, this.props.fms, ProcedureType.DEPARTURE);
    }
    /** @inheritdoc */
    getProcLabel() {
        return 'Departure';
    }
    /** @inheritdoc */
    getStore() {
        var _a;
        return (_a = this.store) !== null && _a !== void 0 ? _a : new SelectDepartureStore();
    }
}
/**
 * A PFD view to select arrivals.
 */
export class PFDSelectArrival extends PFDSelectProcedure {
    /** @inheritdoc */
    getController() {
        return new SelectArrivalController(this.getStore(), this.gotoNextSelect, this.props.fms, ProcedureType.ARRIVAL);
    }
    /** @inheritdoc */
    getProcLabel() {
        return 'Arrival';
    }
    /** @inheritdoc */
    getStore() {
        var _a;
        return (_a = this.store) !== null && _a !== void 0 ? _a : new SelectArrivalStore();
    }
}
