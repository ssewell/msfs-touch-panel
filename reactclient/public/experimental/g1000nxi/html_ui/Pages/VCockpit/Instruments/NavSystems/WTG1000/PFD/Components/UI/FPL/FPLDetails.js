/// <reference types="msfstypes/JS/Avionics" />
import { DisplayComponent, FSComponent } from 'msfssdk';
import { FlightPlanSegmentType } from 'msfssdk/flightplan';
import { List } from '../../../../Shared/UI/List';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { FplActiveLegArrow } from '../../../../Shared/UI/UIControls/FplActiveLegArrow';
import { ScrollBar } from '../../../../Shared/UI/ScrollBar';
import { FPLDetailsController, ScrollMode } from '../../../../Shared/UI/FPL/FPLDetailsController';
import { FPLDetailsStore } from '../../../../Shared/UI/FPL/FPLDetailsStore';
import { FPLApproach } from './FPLSectionApproach';
import { FPLArrival } from './FPLSectionArrival';
import { FPLDeparture } from './FPLSectionDeparture';
import { FPLDestination } from './FPLSectionDestination';
import { FPLEnroute } from './FPLSectionEnroute';
import { FPLOrigin } from './FPLSectionOrigin';
/**
 * FPLDetails holds the core logic of the flight plan display and interacts with button events.
 */
export class FPLDetails extends DisplayComponent {
    /**
     * Constructor
     * @param props the props
     */
    constructor(props) {
        super(props);
        this.isExtendedView = false;
        /** The complete flight plan container, including origin and destination info. */
        this.fplnContainer = FSComponent.createRef();
        /** The departure through arrival phases, all of the FPLSections. */
        this.fplDetailsContainer = FSComponent.createRef();
        this.sectionListRef = FSComponent.createRef();
        /**
         * Gets the top location of the list element for the specified segment and leg.
         * @param segmentIndex The segment index.
         * @param legIndex The leg index.
         * @returns list element y coordinate
         */
        this.getListElementTopLocation = (segmentIndex, legIndex) => {
            const section = this.controller.sectionRefs[segmentIndex];
            if (section) {
                if (section.instance.getLegsLength() > 0) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    return section.instance.getListRef().instance.getListItemInstance(legIndex).getContainerElementLocation()[1] + 4;
                }
                else {
                    console.warn('getListElementTopLocation: Section exists, but there are no legs in this segment');
                    return -1;
                }
            }
            else {
                console.error('getListElementTopLocation: Section Ref could not be found');
                return -1;
            }
        };
        this.store = new FPLDetailsStore(props.bus);
        this.controller = new FPLDetailsController(this.store, props.fms, props.bus, this.scrollToActiveLeg.bind(this));
    }
    /**
     * Do stuff after rendering.
     */
    onAfterRender() {
        super.onAfterRender();
        this.controller.initialize();
    }
    /** Called when the fpl view is resumed. */
    fplViewResumed() {
        this.controller.initDtoLeg();
    }
    /** Called when the fpl view is opened. */
    fplViewOpened() {
        this.scrollToActiveLeg();
    }
    /**
     * A method called when the view scroll is toggled.
     * @param enabled if the scroll is enabled.
     */
    onScrollToggled(enabled) {
        this.controller.scrollMode = enabled ? ScrollMode.MANUAL : ScrollMode.AUTO;
        this.scrollToActiveLeg();
    }
    /** Scrolls to the active leg in the flight plan. */
    scrollToActiveLeg() {
        for (let i = 0; i < this.controller.sectionRefs.length; i++) {
            const section = this.controller.sectionRefs[i];
            const activeLegIndex = section.instance.getActiveLegIndex();
            if (activeLegIndex > -1) {
                if (this.controller.scrollMode === ScrollMode.MANUAL) {
                    this.sectionListRef.instance.scrollToIndex(i);
                    section.instance.scrollToActiveLeg();
                }
                else {
                    section.instance.ensureActiveLegInView();
                }
                return;
            }
        }
        // No active leg was found.
        if (this.controller.scrollMode === ScrollMode.MANUAL && !this.sectionListRef.instance.getSelectedElement()) {
            this.sectionListRef.instance.scrollToIndex(0);
        }
    }
    /** @inheritdoc */
    onInteractionEvent(evt) {
        switch (evt) {
            case FmsHEvent.MENU:
                this.sendActionToSections(s => s.instance.onMenu());
                return true;
            case FmsHEvent.DIRECTTO: {
                this.sendActionToSections((s) => { return s.instance.onDirectTo(); });
                return true;
            }
        }
        return false;
    }
    /**
     * Calls all sections with the specified function.
     * @param fn A function returning a boolean indicating if the calls to other sections should continue.
     */
    sendActionToSections(fn) {
        const sectionLen = this.controller.sectionRefs.length;
        for (let i = 0; i < sectionLen; i++) {
            if (fn(this.controller.sectionRefs[i])) {
                break;
            }
        }
    }
    /**
     * Responds to a flight plan element selections.
     * @param selection The selection that was made.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onFlightPlanElementSelected(selection) {
        // noop
    }
    /**
     * Responds to flight plan focus selections.
     * @param focus The focus selection that was made.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onFlightPlanFocusSelected(focus) {
        // noop
    }
    /**
     * Renders a section in the flight plan.
     * @param data The data object for this section.
     * @param registerFn The control register function.
     * @param index The index.
     * @returns The rendered VNode.
     */
    renderItem(data, registerFn, index) {
        let section;
        const ref = FSComponent.createRef();
        // select datatemplate
        switch (data.segmentType) {
            case FlightPlanSegmentType.Departure:
                section = (FSComponent.buildComponent(FPLDeparture, { onRegister: registerFn, ref: ref, fms: this.props.fms, detailsController: this.controller, facilities: this.store.facilityInfo, segmentIndex: data.segmentIndex, scrollContainer: this.fplnContainer, isExtendedView: this.isExtendedView, onFlightPlanElementSelected: this.onFlightPlanElementSelected.bind(this), onFlightPlanFocusSelected: this.onFlightPlanFocusSelected.bind(this) }));
                break;
            case FlightPlanSegmentType.Arrival:
                section = (FSComponent.buildComponent(FPLArrival, { onRegister: registerFn, ref: ref, fms: this.props.fms, detailsController: this.controller, facilities: this.store.facilityInfo, segmentIndex: data.segmentIndex, scrollContainer: this.fplnContainer, isExtendedView: this.isExtendedView, onFlightPlanElementSelected: this.onFlightPlanElementSelected.bind(this), onFlightPlanFocusSelected: this.onFlightPlanFocusSelected.bind(this) }));
                break;
            case FlightPlanSegmentType.Approach:
                section = (FSComponent.buildComponent(FPLApproach, { onRegister: registerFn, ref: ref, fms: this.props.fms, detailsController: this.controller, facilities: this.store.facilityInfo, segmentIndex: data.segmentIndex, scrollContainer: this.fplnContainer, isExtendedView: this.isExtendedView, onFlightPlanElementSelected: this.onFlightPlanElementSelected.bind(this), onFlightPlanFocusSelected: this.onFlightPlanFocusSelected.bind(this) }));
                break;
            case FlightPlanSegmentType.Destination:
                section = (FSComponent.buildComponent(FPLDestination, { onRegister: registerFn, ref: ref, fms: this.props.fms, detailsController: this.controller, facilities: this.store.facilityInfo, segmentIndex: data.segmentIndex, scrollContainer: this.fplnContainer, isExtendedView: this.isExtendedView, onFlightPlanElementSelected: this.onFlightPlanElementSelected.bind(this), onFlightPlanFocusSelected: this.onFlightPlanFocusSelected.bind(this) }));
                break;
            default:
                section = (FSComponent.buildComponent(FPLEnroute, { onRegister: registerFn, ref: ref, fms: this.props.fms, detailsController: this.controller, facilities: this.store.facilityInfo, segmentIndex: data.segmentIndex, scrollContainer: this.fplnContainer, isExtendedView: this.isExtendedView, onFlightPlanElementSelected: this.onFlightPlanElementSelected.bind(this), onFlightPlanFocusSelected: this.onFlightPlanFocusSelected.bind(this) }));
        }
        this.controller.sectionRefs.splice(index, 0, section);
        return section;
    }
    /**
     * A callback which is called when a flight plan segment is selected.
     * @param segment The selected segment.
     */
    onSegmentSelected(segment) {
        if (!segment && this.store.segments.length > 0 && this.sectionListRef.instance.getIsFocused()) {
            this.sectionListRef.instance.scrollToIndex(0);
        }
    }
    /**
     * Render the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { id: 'fpl-details-container', ref: this.fplDetailsContainer },
            FSComponent.buildComponent(FPLOrigin, { onRegister: this.props.onRegister, ref: this.controller.originRef, fms: this.props.fms, facilities: this.store.facilityInfo, segmentIndex: -1 }),
            FSComponent.buildComponent("hr", null),
            FSComponent.buildComponent("div", null,
                FSComponent.buildComponent("span", { id: "dtk", class: "smallText white" }, "DTK"),
                FSComponent.buildComponent("span", { id: "dis", class: "smallText white" }, "DIS")),
            FSComponent.buildComponent("div", { class: 'fpln-container', ref: this.fplnContainer },
                FSComponent.buildComponent(List, { ref: this.sectionListRef, onRegister: this.props.onRegister, data: this.store.segments, renderItem: this.renderItem.bind(this), onItemSelected: this.onSegmentSelected.bind(this), scrollContainer: this.fplnContainer }),
                FSComponent.buildComponent(FplActiveLegArrow, { ref: this.controller.legArrowRef, getLegDomLocation: this.getListElementTopLocation })),
            FSComponent.buildComponent(ScrollBar, null)));
    }
}
