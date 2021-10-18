import { SoftKeyMenu } from './SoftKeyMenu';
import { ComputedSubject } from 'msfssdk';
import { ObsSuspModes } from '../../Navigation/NavIndicatorController';
/**
 * The root PFD softkey menu.
 */
export class RootMenu extends SoftKeyMenu {
    /**
     * Creates an instance of the root PFD softkey menu.
     * @param menuSystem The menu system.
     * @param controlPublisher A ControlPublisher for command events.
     * @param g1000Publisher A publisher for G1000-specific command events.
     * @param bus The event bus to use.
     */
    constructor(menuSystem, controlPublisher, g1000Publisher, bus) {
        super(menuSystem);
        this.obsMode = ObsSuspModes.NONE;
        this.obsAvailable = false;
        this.obsButtonDisabled = true;
        this.obsLabel = ComputedSubject.create(ObsSuspModes.NONE, (v) => {
            return v === ObsSuspModes.SUSP ? 'SUSP' : 'OBS';
        });
        this.obsButtonValue = ComputedSubject.create(ObsSuspModes.NONE, (v) => {
            return v === ObsSuspModes.NONE ? false : true;
        });
        const obsButtonPressed = () => {
            if (this.obsMode === ObsSuspModes.SUSP) {
                g1000Publisher.publishEvent('suspend', false);
            }
            else if (this.obsMode === ObsSuspModes.OBS || this.obsAvailable) {
                SimVar.SetSimVarValue('K:GPS_OBS', 'number', 0);
            }
        };
        this.addItem(1, 'Map/HSI', () => menuSystem.pushMenu('map-hsi'));
        this.addItem(2, 'TFC Map');
        this.addItem(3, 'PFD Opt', () => menuSystem.pushMenu('pfd-opt'));
        this.addItem(4, this.obsLabel.get(), () => obsButtonPressed(), this.obsButtonValue.get(), this.obsButtonDisabled);
        this.addItem(5, 'CDI', () => { controlPublisher.publishEvent('cdi_src_switch', true); });
        this.addItem(6, 'ADF/DME', () => {
            g1000Publisher.publishEvent('pfd_dme_push', true);
        });
        this.addItem(7, 'XPDR', () => menuSystem.pushMenu('xpdr'));
        this.addItem(8, 'Ident', () => {
            controlPublisher.publishEvent('xpdr_send_ident', true);
        });
        this.addItem(9, 'Tmr/Ref', () => {
            g1000Publisher.publishEvent('pfd_timerref_push', true);
        });
        this.addItem(10, 'Nearest', () => {
            g1000Publisher.publishEvent('pfd_nearest_push', true);
        });
        this.addItem(11, 'Alerts', () => {
            g1000Publisher.publishEvent('pfd_alert_push', true);
        }, undefined, true);
        const obsMenuItemHandler = () => {
            this.obsLabel.set(this.obsMode);
            this.obsButtonValue.set(this.obsMode);
            if (this.obsMode === ObsSuspModes.NONE && !this.obsAvailable) {
                this.obsButtonDisabled = true;
            }
            else {
                this.obsButtonDisabled = false;
            }
            const item = this.getItem(4);
            item.disabled.set(this.obsButtonDisabled);
            item.label.set(this.obsLabel.get());
            item.value.set(this.obsButtonValue.get());
        };
        bus.getSubscriber().on('gps_obs_active').whenChanged().handle(obsActive => {
            this.obsMode = obsActive ? ObsSuspModes.OBS : ObsSuspModes.NONE;
            obsMenuItemHandler();
        });
        bus.getSubscriber().on('suspChanged').whenChanged().handle(isSuspended => {
            if (this.obsMode === ObsSuspModes.OBS && !isSuspended) {
                SimVar.SetSimVarValue('K:GPS_OBS', 'number', 0);
            }
            this.obsMode = isSuspended ? ObsSuspModes.SUSP : ObsSuspModes.NONE;
            obsMenuItemHandler();
        });
        bus.getSubscriber().on('obs_available').whenChanged().handle(v => {
            this.obsAvailable = v;
            obsMenuItemHandler();
        });
    }
}
