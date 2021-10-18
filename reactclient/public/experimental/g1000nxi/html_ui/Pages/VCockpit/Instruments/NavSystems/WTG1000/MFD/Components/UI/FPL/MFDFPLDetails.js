import { FSComponent } from 'msfssdk';
import { FlightPlanSegment } from 'msfssdk/flightplan';
import { FPLDetails } from '../../../../PFD/Components/UI/FPL/FPLDetails';
import { FPLOrigin } from '../../../../PFD/Components/UI/FPL/FPLSectionOrigin';
import { ScrollBar } from '../../../../Shared/UI/ScrollBar';
import { List } from '../../../../Shared/UI/List';
import { FplActiveLegArrow } from '../../../../Shared/UI/UIControls/FplActiveLegArrow';
import { GroupBox } from '../GroupBox';
/**
 * FPLDetails holds the core logic of the flight plan display and interacts with button events.
 */
export class MFDFPLDetails extends FPLDetails {
    constructor() {
        super(...arguments);
        this.isExtendedView = true;
    }
    /** Called when the fpl view is opened. */
    fplViewOpened() {
        super.fplViewOpened();
        this.controller.legArrowRef.instance.updateArrows(this.store.activeLegState.get(), this.store.activeLeg.get(), this.props.fms.getFlightPlan());
    }
    /** @inheritdoc */
    onFlightPlanElementSelected(selection) {
        this.props.selection.set(selection);
    }
    /** @inheritdoc */
    onFlightPlanFocusSelected(focus) {
        this.props.focus.set(focus);
    }
    /**
     * Render the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { ref: this.fplDetailsContainer },
            FSComponent.buildComponent(GroupBox, { title: "Active Flight Plan" },
                FSComponent.buildComponent(FPLOrigin, { onRegister: this.props.onRegister, ref: this.controller.originRef, fms: this.props.fms, facilities: this.store.facilityInfo, segmentIndex: FlightPlanSegment.Empty.segmentIndex }),
                FSComponent.buildComponent("br", null),
                FSComponent.buildComponent("div", null,
                    FSComponent.buildComponent("span", { id: "dtk", class: "smallText white" }, "DTK"),
                    FSComponent.buildComponent("span", { id: "dis", class: "smallText white" }, "DIS"),
                    FSComponent.buildComponent("span", { id: "alt", class: "smallText white" }, "ALT")),
                FSComponent.buildComponent("hr", { class: "mfd-flightplan-hr" }),
                FSComponent.buildComponent("div", { class: 'mfd-fpln-container', style: "height:320px;", ref: this.fplnContainer },
                    FSComponent.buildComponent(List, { ref: this.sectionListRef, onRegister: this.props.onRegister, data: this.store.segments, renderItem: this.renderItem.bind(this), onItemSelected: this.onSegmentSelected.bind(this), scrollContainer: this.fplnContainer }),
                    FSComponent.buildComponent(FplActiveLegArrow, { ref: this.controller.legArrowRef, getLegDomLocation: this.getListElementTopLocation })),
                FSComponent.buildComponent(ScrollBar, null))));
    }
}
