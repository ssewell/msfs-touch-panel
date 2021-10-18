import { FSComponent, SortedMappedSubscribableArray } from 'msfssdk';
import { AdditionalApproachType, FacilitySearchType } from 'msfssdk/navigation';
import { SelectApproachStore } from '../Controllers/SelectApproachStore';
import { FmsHEvent } from '../FmsHEvent';
import { NumberInput } from '../UIControls/NumberInput';
import { SelectControl } from '../UIControls/SelectControl';
import { WaypointInput } from '../UIControls/WaypointInput';
import { UiView } from '../UiView';
/**
 * A view for selecting approaches.
 */
export class SelectApproach extends UiView {
    constructor() {
        super(...arguments);
        this.store = new SelectApproachStore();
        this.controller = this.createController();
        this.sortedApproachSub = SortedMappedSubscribableArray.create(this.store.approaches, this.sortApproaches.bind(this));
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
    /** Goto and activate next select control. */
    gotoNextSelect() {
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
    }
    /** @inheritdoc */
    onAfterRender() {
        super.onAfterRender();
        const g1000Events = this.props.bus.getSubscriber();
        g1000Events.on('set_minimums').handle((set) => {
            if (set !== this.store.minimumsSubject.get()) {
                this.store.minimumsSubject.set(set);
            }
        });
        g1000Events.on('show_minimums').handle((mode) => {
            const option = mode ? 1 : 0;
            this.store.minimumsMode.set(option);
        });
    }
    /**
     * Sorts approaches into the order they should appear in the approach list.
     * @param a An approach list item.
     * @param b An approach list item.
     * @returns 0 if the two approaches are to be sorted identically, a negative number if approach `a` is to be sorted
     * before `b`, or a positive number if approach `a` is to be sorted after `b`.
     */
    sortApproaches(a, b) {
        // sort first by approach type (ILS, LOC, RNAV, etc)
        let compare = SelectApproach.APPROACH_TYPE_PRIORITIES[a.approach.approachType] - SelectApproach.APPROACH_TYPE_PRIORITIES[b.approach.approachType];
        if (compare === 0) {
            // then sort by runway (circling approaches go last)
            compare = (a.approach.runwayNumber === 0 ? 37 : a.approach.runwayNumber) - (b.approach.runwayNumber === 0 ? 37 : b.approach.runwayNumber);
            if (compare === 0) {
                // then sort by L, C, R (order depends on if runway number is <= 18)
                const priorities = a.approach.runwayNumber <= 18
                    ? SelectApproach.APPROACH_RUNWAY_DESIGNATOR_PRIORITIES_FWD
                    : SelectApproach.APPROACH_RUNWAY_DESIGNATOR_PRIORITIES_REV;
                compare = priorities[a.approach.runwayDesignator] - priorities[b.approach.runwayDesignator];
                if (compare === 0) {
                    // finally sort by approach suffix
                    compare = a.approach.approachSuffix.localeCompare(b.approach.approachSuffix);
                }
            }
        }
        return compare;
    }
    /**
     * Renders the waypoint input component.
     * @returns The rendered waypoint input component, as a VNode.
     */
    renderWaypointInput() {
        return (FSComponent.buildComponent(WaypointInput, { bus: this.props.bus, onRegister: this.register, onInputEnterPressed: this.gotoNextSelect.bind(this), selectedIcao: this.controller.inputIcao, onFacilityChanged: this.controller.facilityChangedHandler, filter: FacilitySearchType.Airport }));
    }
    /**
     * Renders the approach select control component.
     * @param dialogPosition The position of the pop-up context menu dialog spawned by the select control.
     * @returns The rendered approach select control component, as a VNode.
     */
    renderApproachSelectControl(dialogPosition) {
        return (FSComponent.buildComponent(SelectControl, { onRegister: this.register, outerContainer: this.viewContainerRef, data: this.sortedApproachSub, onItemSelected: this.controller.onApproachSelected, buildMenuItem: this.controller.buildApprMenuItem, dialogPosition: dialogPosition, class: 'slct-appr-value' }));
    }
    /**
     * Renders the transition select control component.
     * @param dialogPosition The position of the pop-up context menu dialog spawned by the select control.
     * @returns The rendered transition select control component, as a VNode.
     */
    renderTransitionSelectControl(dialogPosition) {
        return (FSComponent.buildComponent(SelectControl, { onRegister: this.register, outerContainer: this.viewContainerRef, data: this.store.transitions, onItemSelected: this.controller.onTransSelected, buildMenuItem: this.controller.buildTransMenuItem, dialogPosition: dialogPosition, class: 'slct-appr-trans-value' }));
    }
    /**
     * Renders the minimums number input component.
     * @param cssClass CSS class(es) to apply to the number input component.
     * @returns The minimums number input component, as a VNode.
     */
    renderMinimumsNumberInput(cssClass) {
        return (FSComponent.buildComponent(NumberInput, { onRegister: this.register, onValueChanged: this.controller.updateMinimumsValue, dataSubject: this.store.minimumsSubject, minValue: -1000, maxValue: 10000, increment: 10, wrap: false, defaultDisplayValue: '_ _ _ _ _', class: cssClass }));
    }
}
SelectApproach.APPROACH_TYPE_PRIORITIES = {
    [ApproachType.APPROACH_TYPE_ILS]: 0,
    [ApproachType.APPROACH_TYPE_LOCALIZER]: 1,
    [ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE]: 2,
    [ApproachType.APPROACH_TYPE_LDA]: 3,
    [ApproachType.APPROACH_TYPE_SDF]: 4,
    [ApproachType.APPROACH_TYPE_RNAV]: 5,
    [ApproachType.APPROACH_TYPE_GPS]: 6,
    [ApproachType.APPROACH_TYPE_VORDME]: 7,
    [ApproachType.APPROACH_TYPE_VOR]: 8,
    [ApproachType.APPROACH_TYPE_NDBDME]: 9,
    [ApproachType.APPROACH_TYPE_NDB]: 10,
    [AdditionalApproachType.APPROACH_TYPE_VISUAL]: 11,
    [ApproachType.APPROACH_TYPE_UNKNOWN]: 12
};
SelectApproach.APPROACH_RUNWAY_DESIGNATOR_PRIORITIES_FWD = {
    [RunwayDesignator.RUNWAY_DESIGNATOR_NONE]: 0,
    [RunwayDesignator.RUNWAY_DESIGNATOR_CENTER]: 1,
    [RunwayDesignator.RUNWAY_DESIGNATOR_LEFT]: 2,
    [RunwayDesignator.RUNWAY_DESIGNATOR_RIGHT]: 3,
    [RunwayDesignator.RUNWAY_DESIGNATOR_WATER]: 4,
    [RunwayDesignator.RUNWAY_DESIGNATOR_B]: 5,
    [RunwayDesignator.RUNWAY_DESIGNATOR_A]: 6,
};
SelectApproach.APPROACH_RUNWAY_DESIGNATOR_PRIORITIES_REV = {
    [RunwayDesignator.RUNWAY_DESIGNATOR_NONE]: 0,
    [RunwayDesignator.RUNWAY_DESIGNATOR_CENTER]: 1,
    [RunwayDesignator.RUNWAY_DESIGNATOR_LEFT]: 3,
    [RunwayDesignator.RUNWAY_DESIGNATOR_RIGHT]: 2,
    [RunwayDesignator.RUNWAY_DESIGNATOR_WATER]: 4,
    [RunwayDesignator.RUNWAY_DESIGNATOR_B]: 5,
    [RunwayDesignator.RUNWAY_DESIGNATOR_A]: 6,
};
