import { Units, NavMath, UnitType } from 'msfssdk';
import { RadioType, NavSourceType, FrequencyBank } from 'msfssdk/instruments';
import { FixTypeFlags } from 'msfssdk/navigation';
/**
 * A G1000 NXi nav-to-nav manager.
 */
export class G1000NavToNavManager {
    /**
     * Creates an instance of the LateralDirector.
     * @param bus The event bus to use with this instance.
     * @param apValues are the ap state values.
     */
    constructor(bus, apValues) {
        this.bus = bus;
        this.apValues = apValues;
        this.onTransferred = () => { };
        this.currentHeading = 0;
        this.approachFrequency = undefined;
        this.nav1Frequency = 0;
        this.nav2Frequency = 0;
        this.isSourceChanging = false;
        /** Index of nav radio that has a localizer and frequency matches loaded approach. */
        this.canArmIndex = 0;
        this.approachProcedureDetails = {
            approachIndex: -1,
            approachTransitionIndex: -1
        };
        this.navToNavCompleted = false;
        /**
         * Callback to handle the nav source changed event when received.
         * @param e is the NavSourceId event
         */
        this.handleNavToNavSourceChanged = (e) => {
            if (e.type === NavSourceType.Nav && e.index === this.canArmIndex) {
                this.onTransferred();
                this.isSourceChanging = false;
                if (this.navToNavCdiConsumer !== undefined) {
                    this.navToNavCdiConsumer.off(this.handleNavToNavSourceChanged);
                    this.navToNavCdiConsumer = undefined;
                    this.navToNavCompleted = true;
                    return;
                }
            }
        };
        this.monitorEvents();
    }
    /** @inheritdoc */
    canLocArm() {
        return this.canArmIndex > 0;
    }
    /** @inheritdoc */
    canLocActivate() {
        if (this.canArmIndex < 1) {
            return false;
        }
        const cdi = this.canArmIndex === 1 ? this.nav1Cdi : this.nav2Cdi;
        const loc = this.canArmIndex === 1 ? this.nav1Localizer : this.nav2Localizer;
        if (cdi && cdi.deviation !== null && Math.abs(cdi.deviation) < 127 && (loc === null || loc === void 0 ? void 0 : loc.course)) {
            const dtk = loc && loc.isValid && loc.course ? Units.Radians.toDegrees(loc.course) : undefined;
            if (dtk === null || dtk === undefined) {
                return false;
            }
            const headingDiff = NavMath.diffAngle(this.currentHeading, dtk);
            if (cdi.deviation > 0 && cdi.deviation < 65 && headingDiff < 0 && headingDiff > -90) {
                return true;
            }
            else if (cdi.deviation < 0 && cdi.deviation > -65 && headingDiff > 0 && headingDiff < 90) {
                return true;
            }
            else if (Math.abs(cdi.deviation) < 35 && Math.abs(headingDiff) < 20) {
                return true;
            }
        }
        return false;
    }
    /**
     * Updates the canArmIndex after inputs from the event bus or changes in the approach frequency.
     */
    updateState() {
        if (this.approachFrequency !== undefined) {
            const apprFreq = Math.round(this.approachFrequency.freqMHz * 100) / 100;
            if (apprFreq > 107) {
                if (apprFreq == this.nav1Frequency && this.nav1Localizer && this.nav1Localizer.isValid) {
                    this.canArmIndex = 1;
                }
                else if (apprFreq == this.nav2Frequency && this.nav2Localizer && this.nav2Localizer.isValid) {
                    this.canArmIndex = 2;
                }
                else {
                    this.canArmIndex = 0;
                }
            }
            else {
                this.canArmIndex = 0;
            }
        }
        else {
            this.canArmIndex = 0;
        }
    }
    /**
     * Updates the nav 1 and nav 2 frequency from the bus.
     * @param radioState A radiostate event.
     */
    updateRadioState(radioState) {
        if (radioState.radioType === RadioType.Nav) {
            switch (radioState.index) {
                case 1:
                    this.nav1Frequency = Math.round(radioState.activeFrequency * 100) / 100;
                    break;
                case 2:
                    this.nav2Frequency = Math.round(radioState.activeFrequency * 100) / 100;
                    break;
            }
            this.updateState();
        }
    }
    /**
     * Tries to auto switch the source if criteria are met.
     * @param d is the lnav data from the event bus
     */
    tryAutoSwitchSource(d) {
        var _a, _b, _c, _d, _e;
        if (!this.navToNavCompleted
            && !this.isSourceChanging
            && d.state !== undefined
            && ((_b = (_a = d.currentLeg) === null || _a === void 0 ? void 0 : _a.calculated) === null || _b === void 0 ? void 0 : _b.endLat) !== undefined
            && ((_d = (_c = d.currentLeg) === null || _c === void 0 ? void 0 : _c.calculated) === null || _d === void 0 ? void 0 : _d.endLon) !== undefined) {
            const fafIsActive = (d.currentLeg.leg.fixTypeFlags & FixTypeFlags.FAF) !== 0;
            const fafDistance = UnitType.GA_RADIAN.convertTo(d.state.pos.distance(d.currentLeg.calculated.endLat, d.currentLeg.calculated.endLon), UnitType.NMILE);
            if (fafIsActive && fafDistance < 15 && this.canArmIndex > 0 && this.canLocActivate() && ((_e = this.activeSource) === null || _e === void 0 ? void 0 : _e.type) === NavSourceType.Gps) {
                this.changeSource();
                this.navToNavCdiConsumer = this.bus.getSubscriber().on('cdi_select');
                this.navToNavCdiConsumer.handle(this.handleNavToNavSourceChanged);
            }
        }
    }
    /**
     * Method to set the HSI/NAV Source to the Can Arm Index.
     */
    changeSource() {
        const controlPublisher = this.bus.getPublisher();
        const navSource = {
            type: NavSourceType.Nav,
            index: this.canArmIndex
        };
        this.isSourceChanging = true;
        controlPublisher.pub('cdi_src_set', navSource, true);
    }
    /**
     * Method to monitor nav events to keep track of NAV related data needed for guidance.
     */
    monitorEvents() {
        const radio = this.bus.getSubscriber();
        radio.on('setRadioState').handle((state) => {
            this.updateRadioState(state);
        });
        radio.on('setFrequency').handle((frequency) => {
            if (frequency.bank == FrequencyBank.Active && frequency.radio.radioType === RadioType.Nav) {
                switch (frequency.radio.index) {
                    case 1:
                        this.nav1Frequency = Math.round(frequency.frequency * 100) / 100;
                        break;
                    case 2:
                        this.nav2Frequency = Math.round(frequency.frequency * 100) / 100;
                }
                this.updateState();
            }
        });
        const nav = this.bus.getSubscriber();
        nav.on('nav_1_localizer').handle((loc) => {
            this.nav1Localizer = loc;
            this.updateState();
        });
        nav.on('nav_2_localizer').handle((loc) => {
            this.nav2Localizer = loc;
            this.updateState();
        });
        nav.on('nav_1_cdi').handle((cdi) => {
            this.nav1Cdi = cdi;
        });
        nav.on('nav_2_cdi').handle((cdi) => {
            this.nav2Cdi = cdi;
        });
        nav.on('cdi_select').handle((source) => this.activeSource = source);
        const adc = this.bus.getSubscriber();
        adc.on('hdg_deg').withPrecision(0).handle((h) => {
            this.currentHeading = h;
        });
        this.bus.getSubscriber().on('approach_freq_set').handle((v) => {
            this.approachFrequency = v;
            this.navToNavCompleted = false;
            this.updateState();
        });
        this.bus.getSubscriber().on('dataChanged').handle((d) => {
            this.tryAutoSwitchSource(d);
        });
        // const fpl = this.bus.getSubscriber<FlightPlannerEvents>();
        // fpl.on('fplProcDetailsChanged').handle((e: FlightPlanProcedureDetailsEvent) => {
        //   if (e.details.approachIndex !== this.approachProcedureDetails.approachIndex ||
        //     e.details.approachTransitionIndex !== this.approachProcedureDetails.approachTransitionIndex) {
        //     this.approachProcedureDetails.approachIndex = e.details.approachIndex;
        //     this.approachProcedureDetails.approachTransitionIndex = e.details.approachTransitionIndex;
        //     this.navToNavCompleted = false;
        //   }
        // });
        this.apValues.approachIsActive.sub((v) => {
            if (v) {
                this.navToNavCompleted = false;
            }
        });
    }
}
