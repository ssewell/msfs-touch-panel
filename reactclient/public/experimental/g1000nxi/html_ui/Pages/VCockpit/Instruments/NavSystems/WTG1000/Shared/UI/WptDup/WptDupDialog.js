import { ArraySubject, FSComponent, Subject } from 'msfssdk';
import { ICAO } from 'msfssdk/navigation';
import { FmsHEvent } from '../FmsHEvent';
import { WptDupListItem } from './WptDupListItem';
import { UiView } from '../UiView';
/**
 * A dialog for selecting from a list of duplicate waypoints.
 */
export class WptDupDialog extends UiView {
    constructor() {
        super(...arguments);
        this.listRef = FSComponent.createRef();
        this.waypoints = ArraySubject.create();
        this.ident = Subject.create('');
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onInputDataSet(input) {
        this.ident.set((input === null || input === void 0 ? void 0 : input.length) ? ICAO.getIdent(input[0].facility.icao) : '');
        input ? this.waypoints.set(input) : this.waypoints.clear();
        this.scrollController.gotoFirst();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onInteractionEvent(evt) {
        switch (evt) {
            case FmsHEvent.ENT:
                return this.onEnterPressed();
            case FmsHEvent.CLR:
                return this.onClearPressed();
        }
        return false;
    }
    /**
     * This method is called when Enter is pressed.
     * @returns whether the event was handled.
     */
    onEnterPressed() {
        const selectedWaypoint = this.listRef.instance.getSelectedItem();
        if (selectedWaypoint) {
            this.accept(selectedWaypoint.facility, true);
            return true;
        }
        return false;
    }
    /**
     * This method is called when CLR is pressed.
     * @returns whether the event was handled.
     */
    onClearPressed() {
        this.close();
        return true;
    }
    /**
     * Renders a duplicate waypoint list item.
     * @param cssClass CSS class(es) to add to the list item.
     * @param waypoint A waypoint.
     * @param registerFn The register callback to use.
     * @returns a list item VNode.
     */
    renderListItem(cssClass, waypoint, registerFn) {
        return (FSComponent.buildComponent(WptDupListItem, { onRegister: registerFn, waypoint: Subject.create(waypoint), class: cssClass }));
    }
}
