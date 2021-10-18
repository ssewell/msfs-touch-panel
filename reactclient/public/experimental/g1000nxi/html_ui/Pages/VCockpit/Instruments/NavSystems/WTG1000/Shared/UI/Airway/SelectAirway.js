import { FSComponent } from 'msfssdk';
import { FmsHEvent } from '../FmsHEvent';
import { UiView } from '../UiView';
import { SelectControl } from '../UIControls/SelectControl';
import { ActionButton } from '../UIControls/ActionButton';
import { SelectAirwayStore } from '../Controllers/SelectAirwayStore';
import { SelectAirwayController } from '../Controllers/SelectAirwayController';
/**
 * A view which allows the user to select an airway.
 */
export class SelectAirway extends UiView {
    /** @inheritdoc */
    constructor(props) {
        super(props);
        this.exitSelectControlRef = FSComponent.createRef();
        /** Goto and activate next select control. */
        this.gotoNextSelect = () => {
            this.scrollController.gotoNext();
        };
        this.store = new SelectAirwayStore();
        this.controller = new SelectAirwayController(this.store, this.gotoNextSelect, this.props.fms, this.exitSelectControlRef);
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
    onInputDataSet(inputData) {
        this.store.inputSegment = (inputData === null || inputData === void 0 ? void 0 : inputData.segmentIndex) !== undefined ? inputData === null || inputData === void 0 ? void 0 : inputData.segmentIndex : -1;
        this.store.inputLeg = (inputData === null || inputData === void 0 ? void 0 : inputData.legIndex) !== undefined ? inputData === null || inputData === void 0 ? void 0 : inputData.legIndex : -1;
        this.controller.setExistingFix(inputData);
    }
    /** @inheritdoc */
    onViewOpened() {
        this.controller.initialize();
    }
    /**
     * A callback which is called when the Load action is executed.
     */
    onLoadExecuted() {
        this.controller.onLoadExecuted();
        this.close();
    }
    /**
     * Renders the airway select control component.
     * @param dialogPosition The position of the pop-up context menu dialog spawned by the select control.
     * @returns The rendered airway select control component, as a VNode.
     */
    renderAirwaySelectControl(dialogPosition) {
        return (FSComponent.buildComponent(SelectControl, { onRegister: this.register, class: "set-airway-airway-value", dialogPosition: dialogPosition, outerContainer: this.viewContainerRef, data: this.store.airways, buildMenuItem: this.controller.buildAirwayMenuItem, onItemSelected: this.controller.onAirwaySelected }));
    }
    /**
     * Renders the exit waypoint select control component.
     * @param dialogPosition The position of the pop-up context menu dialog spawned by the select control.
     * @returns The rendered exit waypoint select control component, as a VNode.
     */
    renderExitSelectControl(dialogPosition) {
        return (FSComponent.buildComponent(SelectControl, { onRegister: this.register, class: "set-airway-exit-value", ref: this.exitSelectControlRef, dialogPosition: dialogPosition, outerContainer: this.viewContainerRef, nullSelectionText: this.controller.emptyListText, data: this.store.exits, onItemSelected: this.controller.onExitSelected, buildMenuItem: this.controller.buildExitMenuItem, dialogScrollStartIndex: this.controller.entryIndexSubject }));
    }
    /**
     * Renders the load button.
     * @returns the rendered load button, as a VNode.
     */
    renderLoadButton() {
        return (FSComponent.buildComponent(ActionButton, { onRegister: this.register, onExecute: this.onLoadExecuted.bind(this), isVisible: this.controller.canLoad, text: "Load?" }));
    }
}
