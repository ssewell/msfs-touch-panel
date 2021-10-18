import { SoftKeyMenu } from '../SoftKeyMenu';
/**
 * The MFD flight plan options menu when the popout is opened.
 */
export class FlightPlanPopoutMenu extends SoftKeyMenu {
    /**
     * Creates an instance of the MFD flight plan options menu.
     * @param menuSystem The map options menu system.
     * @param publisher A publisher to use for sending control events
     */
    constructor(menuSystem, publisher) {
        super(menuSystem);
        this.publisher = publisher;
        this.addItem(0, 'Engine', () => menuSystem.pushMenu('engine-menu'));
        this.addItem(2, 'Map Opt', () => menuSystem.pushMenu('map-opt'));
        this.addItem(3, 'New WPT', () => { }, false);
        this.addItem(4, 'View', () => menuSystem.pushMenu('view-opt'));
        this.addItem(5, 'VNV Prof', () => { }, false);
        this.addItem(6, 'Cncl VNV', () => { }, false);
        this.addItem(7, 'VNV Ð', () => { }, false);
        this.addItem(8, 'ATK OFS', () => { }, false);
        this.addItem(9, 'ACT Leg', () => { }, false);
        this.addItem(10, 'Charts', () => { }, false);
        this.addItem(11, 'Checklist', () => { }, false);
    }
}
