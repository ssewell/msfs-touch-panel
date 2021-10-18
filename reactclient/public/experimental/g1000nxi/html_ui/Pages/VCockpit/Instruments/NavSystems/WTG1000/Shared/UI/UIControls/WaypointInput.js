import { FSComponent } from 'msfssdk';
import { InputComponent } from '../../UI/UIControls/InputComponent';
import { UiControlGroup } from '../UiControlGroup';
import { Fms } from '../../FlightPlan/Fms';
import { MessageDialog } from '../../UI/Dialogs/MessageDialog';
import { WaypointInputController } from './WaypointInputController';
import { WaypointInputStore } from './WaypointInputStore';
import { WaypointIcon } from '../Waypoint/WaypointIcon';
import './WaypointInput.css';
/** The WaypointInput component. */
export class WaypointInput extends UiControlGroup {
    constructor() {
        super(...arguments);
        this.inputComponentRef = FSComponent.createRef();
        this.store = new WaypointInputStore(this.props.bus, this.props.filter, this.props.onWaypointChanged, this.props.onFacilityChanged, this.props.onMatchedWaypointsChanged);
        this.controller = new WaypointInputController(this.store, this.props.selectedIcao, this.onInputTextValueOverride.bind(this));
    }
    /**
     * A callback which is called when the input text value needs to be overridden.
     * @param value The new input text value.
     */
    onInputTextValueOverride(value) {
        this.inputComponentRef.instance.setText(value, value === '' ? 0 : undefined, false);
    }
    /**
     * A callback which is called when Enter is pressed on this component's InputComponent child.
     * @returns whether the Enter event was handled.
     */
    onInputEnterPressed() {
        const facilityWaypoint = this.store.selectedWaypoint.get();
        if (!facilityWaypoint && this.store.inputValue.get() !== '') {
            Fms.viewService.open(MessageDialog.name, true).setInput({ inputString: `${this.store.inputValue.get().replace(/^_+|_+$/g, '')} does not exist.` }).onClose.on(() => {
                this.inputComponentRef.instance.activate();
            });
        }
        else {
            if (this.props.onInputEnterPressed !== undefined && facilityWaypoint !== null) {
                this.props.onInputEnterPressed(facilityWaypoint.facility);
            }
        }
        return true;
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("div", { class: "wpt-entry" },
            FSComponent.buildComponent(InputComponent, { onRegister: this.register, ref: this.inputComponentRef, maxLength: 6, onTextChanged: this.controller.onInputChanged.bind(this.controller), onEnter: this.onInputEnterPressed.bind(this) }),
            FSComponent.buildComponent(WaypointIcon, { waypoint: this.store.selectedWaypoint, planeHeading: this.props.planeHeading, class: 'wpt-entry-icon' }),
            FSComponent.buildComponent("div", { class: "wpt-entry-location" }, this.store.displayWaypoint.city),
            FSComponent.buildComponent("div", { class: "wpt-entry-name" }, this.store.displayWaypoint.name)));
    }
}
