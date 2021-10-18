import { FSComponent } from 'msfssdk';
import { ContextMenuDialog } from '../Dialogs/ContextMenuDialog';
import { FmsHEvent } from '../FmsHEvent';
import { UiView } from '../UiView';
import { SetRunwayStore } from './SetRunwayStore';
/**
 * A dialog for setting runways.
 */
export class SetRunway extends UiView {
    constructor() {
        super(...arguments);
        this.store = new SetRunwayStore();
        this.selectedRunway = undefined;
    }
    /** @inheritdoc */
    onInputDataSet(input) {
        this.store.airport.set(input !== null && input !== void 0 ? input : null);
        this.scrollController.gotoFirst();
    }
    /** @inheritdoc */
    onInteractionEvent(evt) {
        switch (evt) {
            case FmsHEvent.ENT:
                return this.onEnterPressed();
            case FmsHEvent.CLR:
                return this.onCLRPressed();
        }
        return false;
    }
    /**
     * This method is called when an Enter button event occurs.
     * @returns whether the event was handled.
     */
    onEnterPressed() {
        this.accept(this.selectedRunway, true);
        return true;
    }
    /**
     * This method is called when a CLR button event occurs.
     * @returns whether the event was handled.
     */
    onCLRPressed() {
        this.selectedRunway = undefined;
        this.close();
        return true;
    }
    /**
     * A callback which is called when a runway is selected.
     * @param index The index of the selection.
     * @param runway The runway which was selected.
     */
    onRunwaySelected(index, runway) {
        this.selectedRunway = (runway !== undefined && runway.designation !== '') ? runway : undefined;
    }
    /**
     * Builds a runway menu item definition for a runway.
     * @param runway A runway.
     * @param index The index of the item in the menu.
     * @returns a menu item definition for the runway.
     */
    buildRunwayMenuItem(runway, index) {
        const text = (runway.designation !== '') ? runway.designation : 'NONE';
        return { id: index.toString(), renderContent: () => FSComponent.buildComponent("span", null, text), estimatedWidth: text.length * ContextMenuDialog.CHAR_WIDTH };
    }
}
