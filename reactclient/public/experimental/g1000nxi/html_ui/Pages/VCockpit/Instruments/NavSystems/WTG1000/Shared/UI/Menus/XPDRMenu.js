import { Subject } from 'msfssdk';
import { XPDRMode } from 'msfssdk/instruments';
import { SoftKeyMenu } from './SoftKeyMenu';
/**
 * The XPDR softkey menu.
 */
export class XPDRMenu extends SoftKeyMenu {
    /**
     * Creates an instance of the XPDR PFD softkey menu.
     * @param menuSystem the menu system
     * @param controlPublisher is the instance of the control publisher
     * @param g1000Publisher the G1000 control events publisher
     * @param bus the event bus
     */
    constructor(menuSystem, controlPublisher, g1000Publisher, bus) {
        super(menuSystem);
        this.xpdrMode = Subject.create(XPDRMode.OFF);
        this.isVfr = Subject.create(false);
        this.modeToIndex = new Map([
            [XPDRMode.STBY, 2],
            [XPDRMode.ON, 3],
            [XPDRMode.ALT, 4]
        ]);
        this.addItem(2, 'Standby', () => {
            controlPublisher.publishEvent('publish_xpdr_mode', XPDRMode.STBY);
        }, this.xpdrMode.get() === XPDRMode.STBY);
        this.addItem(3, 'On', () => {
            controlPublisher.publishEvent('publish_xpdr_mode', XPDRMode.ON);
        }, this.xpdrMode.get() === XPDRMode.ON);
        this.addItem(4, 'Alt', () => {
            controlPublisher.publishEvent('publish_xpdr_mode', XPDRMode.ALT);
        }, this.xpdrMode.get() === XPDRMode.ALT);
        this.addItem(6, 'VFR', () => {
            controlPublisher.publishEvent('publish_xpdr_code', 1200);
        }, this.isVfr.get());
        this.addItem(7, 'Code', () => {
            menuSystem.pushMenu('xpdr-code');
            g1000Publisher.publishEvent('xpdr_code_push', true);
        }, false);
        this.addItem(8, 'Ident', () => {
            controlPublisher.publishEvent('xpdr_send_ident', true);
            menuSystem.back();
        });
        this.addItem(10, 'Back', () => menuSystem.back());
        this.addItem(11, 'Alerts');
        const xpdrSub = bus.getSubscriber();
        // this.xpdrMode.set(xpdrInstr.getXpdrMode());
        this.xpdrMode.sub(this.onXpdrModeChanged.bind(this));
        xpdrSub.on('xpdrMode1').handle((mode) => {
            this.xpdrMode.set(mode);
        });
        // this.isVfr.set(xpdrInstr.getXpdrCode() === 1200);
        this.isVfr.sub(this.onIsVfrChanged.bind(this));
        xpdrSub.on('xpdrCode1').handle((code) => {
            this.isVfr.set(code === 1200);
        });
    }
    /**
     * Callback when the isVfr indication is changed
     * @param v the new isVfr indication
     */
    onIsVfrChanged(v) {
        this.getItem(6).value.set(v);
    }
    /**
     * Callback when the xpdr mode is changed
     * @param v the new xpdr mode
     */
    onXpdrModeChanged(v) {
        this.modeToIndex.forEach((index, mode) => {
            this.getItem(index).value.set(mode === v);
        });
    }
}
