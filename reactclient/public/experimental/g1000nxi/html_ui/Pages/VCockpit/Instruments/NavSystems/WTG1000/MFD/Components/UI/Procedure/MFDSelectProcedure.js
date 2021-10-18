import { FSComponent } from 'msfssdk';
import { ProcedureType } from '../../../../Shared/FlightPlan/Fms';
import { ActionButton } from '../../../../Shared/UI/UIControls/ActionButton';
import { GroupBox } from '../GroupBox';
import { List } from '../../../../Shared/UI/List';
import { ScrollBar } from '../../../../Shared/UI/ScrollBar';
import { ProcSequenceItem } from './ProcSequenceItem';
import { SelectArrivalController, SelectArrivalStore } from '../../../../Shared/UI/Procedure/SelectArrival';
import { SelectDepartureController, SelectDepartureStore } from '../../../../Shared/UI/Procedure/SelectDeparture';
import { SelectProcedure } from '../../../../Shared/UI/Procedure/SelectProcedure';
import './MFDSelectProcedure.css';
/**
 * An MFD view for selecting departures/arrivals.
 */
export class MFDSelectProcedure extends SelectProcedure {
    constructor() {
        super(...arguments);
        this.sequenceListContainerRef = FSComponent.createRef();
        this.buildLegItem = (data, registerFn) => {
            return FSComponent.buildComponent(ProcSequenceItem, { onRegister: registerFn, data: data });
        };
    }
    /**
     * A callback which is called when the Load action is executed.
     */
    onLoadSelected() {
        this.controller.onLoadSelected();
        this.props.viewService.open('FPLPage');
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: 'mfd-dark-background', ref: this.viewContainerRef },
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Airport" }, this.renderWaypointInput()),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Procedure" }, this.renderProcedureSelectControl()),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Runway" }, this.renderRunwaySelectControl()),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Transition" }, this.renderEnrouteSelectControl()),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Sequence" },
                FSComponent.buildComponent("div", { style: 'height: 160px; overflow:hidden', ref: this.sequenceListContainerRef },
                    FSComponent.buildComponent(List, { onRegister: this.register, data: this.store.sequence, renderItem: this.buildLegItem, scrollContainer: this.sequenceListContainerRef })),
                FSComponent.buildComponent(ScrollBar, null)),
            FSComponent.buildComponent("div", { class: "mfd-selectproc-load-button" },
                FSComponent.buildComponent(ActionButton, { onRegister: this.register, onExecute: this.onLoadSelected.bind(this), isVisible: this.controller.canLoad, text: "Load?" }))));
    }
}
/**
 * An MFD view for selecting departures.
 */
export class MFDSelectDeparture extends MFDSelectProcedure {
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
 * An MFD view for selecting arrivals.
 */
export class MFDSelectArrival extends MFDSelectProcedure {
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
