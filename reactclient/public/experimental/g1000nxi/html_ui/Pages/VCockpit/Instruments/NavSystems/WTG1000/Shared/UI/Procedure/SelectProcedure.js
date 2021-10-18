import { FSComponent } from 'msfssdk';
import { FacilitySearchType } from 'msfssdk/navigation';
import { FmsHEvent } from '../FmsHEvent';
import { SelectControl } from '../UIControls/SelectControl';
import { WaypointInput } from '../UIControls/WaypointInput';
import { UiView } from '../UiView';
/**
 * A view for selecting departures/arrivals.
 */
export class SelectProcedure extends UiView {
    /**
     * Creates an instance of select procedure.
     * @param props The props.
     */
    constructor(props) {
        super(props);
        /** Goto and activate next select control. */
        this.gotoNextSelect = () => {
            this.scrollController.gotoNext();
            setTimeout(() => {
                const focusedCtrl = this.scrollController.getFocusedUiControl();
                if (focusedCtrl instanceof SelectControl) {
                    if (focusedCtrl.MenuItems.length > 1) {
                        focusedCtrl.onUpperKnob();
                    }
                    else {
                        this.gotoNextSelect();
                    }
                }
            }, 50);
        };
        this.store = this.getStore();
        this.controller = this.getController();
    }
    /** @inheritdoc */
    onInteractionEvent(evt) {
        switch (evt) {
            case FmsHEvent.CLR:
                this.close();
                return true;
        }
        return false;
    }
    /** @inheritdoc */
    onViewOpened() {
        this.controller.initialize();
    }
    /**
     * Renders the waypoint input component.
     * @returns The rendered waypoint input component, as a VNode.
     */
    renderWaypointInput() {
        return (FSComponent.buildComponent(WaypointInput, { bus: this.props.bus, onRegister: this.register, onInputEnterPressed: this.gotoNextSelect, selectedIcao: this.controller.inputIcao, onFacilityChanged: this.controller.facilityChangedHandler, filter: FacilitySearchType.Airport }));
    }
    /**
     * Renders the procedure select control component.
     * @param dialogPosition The position of the pop-up context menu dialog spawned by the select control.
     * @returns The rendered procedure select control component, as a VNode.
     */
    renderProcedureSelectControl(dialogPosition) {
        return (FSComponent.buildComponent(SelectControl, { onRegister: this.register, outerContainer: this.viewContainerRef, data: this.store.procedures, onItemSelected: this.controller.onProcSelected, buildMenuItem: this.controller.buildProcMenuItem, dialogPosition: dialogPosition, class: 'slctproc-proc-value' }));
    }
    /**
     * Renders the runway transition select control component.
     * @param dialogPosition The position of the pop-up context menu dialog spawned by the select control.
     * @returns The rendered runway transition select control component, as a VNode.
     */
    renderRunwaySelectControl(dialogPosition) {
        return (FSComponent.buildComponent(SelectControl, { onRegister: this.register, outerContainer: this.viewContainerRef, data: this.store.runways, onItemSelected: this.controller.onRwySelected, buildMenuItem: this.controller.buildRwyMenuItem, dialogPosition: dialogPosition, class: 'slctproc-rwy-value' }));
    }
    /**
     * Renders the enroute transition select control component.
     * @param dialogPosition The position of the pop-up context menu dialog spawned by the select control.
     * @returns The rendered enroute transition select control component, as a VNode.
     */
    renderEnrouteSelectControl(dialogPosition) {
        return (FSComponent.buildComponent(SelectControl, { onRegister: this.register, outerContainer: this.viewContainerRef, data: this.store.transitions, onItemSelected: this.controller.onTransSelected, buildMenuItem: this.controller.buildTransMenuItem, dialogPosition: dialogPosition, class: 'slctproc-trans-value' }));
    }
}
