import { Subject } from 'msfssdk';
import { APAltitudeModes, APLateralModes, APVerticalModes, Autopilot } from 'msfssdk/autopilot';
import { Fms } from '../FlightPlan/Fms';
/**
 * A G1000 NXi autopilot.
 */
export class G1000Autopilot extends Autopilot {
    constructor() {
        super(...arguments);
        this.externalAutopilotInstalled = Subject.create(false);
        this.lateralArmedModeSubject = Subject.create(APLateralModes.NONE);
        this.altArmedSubject = Subject.create(false);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAfterUpdate() {
        if (!this.externalAutopilotInstalled.get()) {
            this.updateFma();
        }
        else {
            this.lateralArmedModeSubject.set(this.lateralArmed);
            this.altArmedSubject.set(this.altCapArmed);
        }
        //this.updateFma();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onInitialized() {
        this.monitorAdditionalEvents();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    monitorAdditionalEvents() {
        //check for KAP140 installed
        this.bus.getSubscriber().on('kap_140_installed').handle(v => {
            this.externalAutopilotInstalled.set(v);
            if (v) {
                this.config.defaultVerticalMode = APVerticalModes.VS;
                this.config.defaultLateralMode = APLateralModes.LEVEL;
                this.handleApFdStateChange();
                this.updateFma(true);
                Fms.g1000EvtPub.publishEvent('fd_not_installed', true);
            }
        });
    }
    /**
     * Publishes data for the FMA.
     * @param clear Is to clear the FMA
     */
    updateFma(clear = false) {
        const publisher = this.bus.getPublisher();
        const data = {
            verticalActive: clear ? APVerticalModes.NONE : this.verticalActive,
            verticalArmed: clear ? APVerticalModes.NONE : this.verticalArmed,
            verticalApproachArmed: clear ? APVerticalModes.NONE : this.verticalApproachArmed,
            verticalAltitudeArmed: clear ? APAltitudeModes.NONE : this.verticalAltitudeArmed,
            altitideCaptureArmed: clear ? false : this.altCapArmed,
            altitideCaptureValue: clear ? -1 : this.apValues.capturedAltitude.get(),
            lateralActive: clear ? APLateralModes.NONE : this.lateralActive,
            lateralArmed: clear ? APLateralModes.NONE : this.lateralArmed,
            lateralModeFailed: clear ? false : this.lateralModeFailed
        };
        publisher.pub('fma_modes', data, true);
    }
}
