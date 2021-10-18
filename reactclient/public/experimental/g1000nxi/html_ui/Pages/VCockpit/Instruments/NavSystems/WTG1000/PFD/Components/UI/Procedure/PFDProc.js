import { FSComponent } from 'msfssdk';
import { ListMenuDialog } from '../../../../Shared/UI/Dialogs/ListMenuDialog';
import './PFDProc.css';
/**
 * The PFD procedures popout.
 */
export class PFDProc extends ListMenuDialog {
    /** @inheritdoc */
    onViewResumed() {
        const menuItems = this.buildMenuList();
        this.setMenuItems(menuItems);
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
}
