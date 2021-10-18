import { ArraySubject, FSComponent, Subject } from 'msfssdk';
import { FacilityType, ICAO } from 'msfssdk/navigation';
import { FmsUtils } from '../../../../Shared/FlightPlan/FmsUtils';
import { PopoutMenuItem } from '../../../../Shared/UI/Dialogs/PopoutMenuItem';
import { List } from '../../../../Shared/UI/List';
import { GroupBox } from '../GroupBox';
import { UiView } from '../../../../Shared/UI/UiView';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import './MFDProc.css';
import { ApproachNameDisplay } from '../../../../Shared/UI/FPL/ApproachNameDisplay';
/**
 * The PFD procedures popout.
 */
export class MFDProc extends UiView {
    constructor() {
        super(...arguments);
        this.listRef = FSComponent.createRef();
        this.listContainerRef = FSComponent.createRef();
        this.menuItems = this.buildMenuItems();
        this.menuItemsSubject = ArraySubject.create(this.menuItems);
        this.arrival = Subject.create('_ _ _ _-');
        this.departure = Subject.create('_ _ _ _-');
        this.destinationAirportSub = Subject.create(null);
        this.approachSub = Subject.create(null);
        /**
         * A callback called to render the menu items.
         * @param d is the menu item
         * @param registerFn The register function.
         * @returns a vnode for display in the menu
         */
        this.renderItem = (d, registerFn) => {
            return FSComponent.buildComponent(PopoutMenuItem, { onRegister: registerFn, parent: this, def: d });
        };
    }
    /**
     * A local method to get the ident from an ICAO.
     * @param icao is icao to get the ident from.
     * @returns an ident string or an empty string.
     */
    getIdent(icao) {
        if (icao !== undefined) {
            return ICAO.getIdent(icao);
        }
        return '';
    }
    /** @inheritdoc */
    onViewOpened() {
        this.departure.set('_ _ _ _-');
        this.arrival.set('_ _ _ _-');
        this.destinationAirportSub.set(null);
        this.approachSub.set(null);
        const plan = this.props.fms.getPrimaryFlightPlan();
        if (plan && plan.procedureDetails.departureIndex > -1 && plan.originAirport !== undefined) {
            this.props.fms.facLoader.getFacility(FacilityType.Airport, plan.originAirport).then((fac) => {
                let depStr = fac.departures[plan.procedureDetails.departureIndex].name;
                if (plan.procedureDetails.departureTransitionIndex > -1) {
                    depStr += '.' + fac.departures[plan.procedureDetails.departureIndex].enRouteTransitions[plan.procedureDetails.departureTransitionIndex].name;
                }
                this.departure.set(this.getIdent(plan.originAirport) + '-' + depStr);
            });
        }
        if (plan && plan.destinationAirport !== undefined
            && (plan.procedureDetails.arrivalIndex > -1 || plan.procedureDetails.approachIndex > -1 || plan.getUserData('visual_approach') !== undefined)) {
            this.props.fms.facLoader.getFacility(FacilityType.Airport, plan.destinationAirport).then((fac) => {
                if (plan.procedureDetails.arrivalIndex > -1) {
                    let arrStr = fac.arrivals[plan.procedureDetails.arrivalIndex].name;
                    if (plan.procedureDetails.arrivalTransitionIndex > -1) {
                        arrStr = fac.arrivals[plan.procedureDetails.arrivalIndex].enRouteTransitions[plan.procedureDetails.arrivalTransitionIndex].name + '.' + arrStr;
                    }
                    this.arrival.set(this.getIdent(plan.destinationAirport) + '-' + arrStr);
                }
                const approach = FmsUtils.getApproachFromPlan(plan, fac);
                this.destinationAirportSub.set(fac);
                this.approachSub.set(approach !== null && approach !== void 0 ? approach : null);
            });
        }
        const menuItems = this.buildMenuList();
        this.setMenuItems(menuItems);
    }
    /**
     * Sets the menu items for the list menu dialog.
     * @param items The items to set into the menu.
     */
    setMenuItems(items) {
        this.menuItems = items;
        this.menuItemsSubject.clear();
        this.menuItemsSubject.set(items);
        this.scrollController.gotoFirst();
    }
    /**
     * Method to dynamically build the menu list
     * @returns an array of menu item definitions
     */
    buildMenuList() {
        var _a, _b, _c, _d;
        const approachLoaded = (_b = (_a = this.props.fms) === null || _a === void 0 ? void 0 : _a.canApproachActivate()) !== null && _b !== void 0 ? _b : false;
        const canMissedActivate = (_d = (_c = this.props.fms) === null || _c === void 0 ? void 0 : _c.canMissedApproachActivate()) !== null && _d !== void 0 ? _d : false;
        const menuItems = [
            {
                id: 'activate-vector-to-final', renderContent: () => FSComponent.buildComponent("span", null, "Activate Vector-to-Final"), isEnabled: false,
                action: () => {
                }
            },
            {
                id: 'activate-approach', renderContent: () => FSComponent.buildComponent("span", null, "Activate Approach"), isEnabled: approachLoaded,
                action: () => {
                    this.props.fms.activateApproach();
                }
            },
            {
                id: 'activate-missed', renderContent: () => FSComponent.buildComponent("span", null, "Activate Missed Approach"), isEnabled: canMissedActivate,
                action: () => {
                    this.props.fms.activateMissedApproach();
                }
            },
            {
                id: 'select-approach', renderContent: () => FSComponent.buildComponent("span", null, "Select Approach"), isEnabled: true,
                action: () => {
                    this.props.viewService.open('SelectApproach', false);
                }, closeAfterAction: false
            },
            {
                id: 'select-arrival', renderContent: () => FSComponent.buildComponent("span", null, "Select Arrival"), isEnabled: true,
                action: () => {
                    this.props.viewService.open('SelectArrival', false);
                }, closeAfterAction: false
            },
            {
                id: 'select-departure', renderContent: () => FSComponent.buildComponent("span", null, "Select Departure"), isEnabled: true,
                action: () => {
                    this.props.viewService.open('SelectDeparture', false);
                }, closeAfterAction: false
            },
        ];
        return menuItems;
    }
    /** @inheritdoc */
    buildMenuItems() {
        return this.buildMenuList();
    }
    /** @inheritdoc */
    onInteractionEvent(evt) {
        switch (evt) {
            case FmsHEvent.PROC:
            case FmsHEvent.CLR:
                this.close();
                return true;
        }
        return false;
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        let className = 'popout-dialog';
        if (this.props.class !== undefined) {
            className += ` ${this.props.class}`;
        }
        return (FSComponent.buildComponent("div", { class: className, ref: this.viewContainerRef },
            FSComponent.buildComponent("h1", null, this.props.title),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Options", ref: this.listContainerRef },
                FSComponent.buildComponent(List, { ref: this.listRef, onRegister: this.register, data: this.menuItemsSubject, renderItem: this.renderItem })),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Loaded" },
                FSComponent.buildComponent("div", { class: "white mfd-proc-loaded" },
                    FSComponent.buildComponent("div", { class: "gray" }, "Approach:"),
                    FSComponent.buildComponent(ApproachNameDisplay, { approach: this.approachSub, airport: this.destinationAirportSub, nullText: '_ _ _ _-' }),
                    FSComponent.buildComponent("div", { class: "gray" }, "Arrival:"),
                    FSComponent.buildComponent("div", null, this.arrival),
                    FSComponent.buildComponent("div", { class: "gray" }, "Departure:"),
                    FSComponent.buildComponent("div", null, this.departure))),
            FSComponent.buildComponent("div", { class: "mfd-bottom-menu-prompt" }, "Press the \"PROC\" key to view the previous page")));
    }
}
