import { FSComponent, DisplayComponent, MathUtils, SimpleMovingAverage, LinearServo } from 'msfssdk';
import { PFDUserSettings } from '../../PFDUserSettings';
import './FlightDirector.css';
/**
 * The PFD Flight Director.
 */
export class FlightDirector extends DisplayComponent {
    /** @inheritdoc */
    constructor(props) {
        super(props);
        this.fltDirectorRef = FSComponent.createRef();
        this.currentBank = 0;
        this.fdRawBank = 0;
        this.fdServoBank = 0;
        this.currentPitch = 0;
        this.pitchIncrementDistance = 1;
        this.fdRawPitch = 0;
        this.bankServo = new LinearServo(5);
        this.pitchAverage = new SimpleMovingAverage(20);
        this.needUpdate = false;
        this.fdPitchHandler = (fdPitch) => {
            this.fdRawPitch = fdPitch;
            this.needUpdate = true;
        };
        this.fdBankHandler = (fdBank) => {
            this.fdRawBank = fdBank;
            this.needUpdate = true;
        };
        this.pitchHandler = (pitch) => {
            this.currentPitch = pitch;
            this.needUpdate = true;
        };
        this.bankHandler = (bank) => {
            this.currentBank = bank;
            this.needUpdate = true;
        };
        /**
         * A callback called when the Flight Director is turned on or off.
         * @param state The bool state of the flight director status.
         */
        this.toggleFltDir = (state) => {
            if (state) {
                this.fdPitchConsumer.handle(this.fdPitchHandler);
                this.fdBankConsumer.handle(this.fdBankHandler);
                this.pitchConsumer.handle(this.pitchHandler);
                this.bankConsumer.handle(this.bankHandler);
                this.fltDirectorRef.instance.style.display = '';
            }
            else {
                this.fdPitchConsumer.off(this.fdPitchHandler);
                this.fdBankConsumer.off(this.fdBankHandler);
                this.pitchConsumer.off(this.pitchHandler);
                this.bankConsumer.off(this.bankHandler);
                this.fltDirectorRef.instance.style.display = 'none';
            }
        };
        const subscriber = this.props.bus.getSubscriber();
        this.fdStateConsumer = subscriber.on('flight_director_state').whenChanged();
        this.fdPitchConsumer = subscriber.on('flight_director_pitch').withPrecision(2);
        this.fdBankConsumer = subscriber.on('flight_director_bank').withPrecision(2);
        this.pitchConsumer = subscriber.on('pitch_deg').withPrecision(2);
        this.bankConsumer = subscriber.on('roll_deg').withPrecision(2);
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        this.props.bus.getSubscriber().on('realTime').handle(this.updateFD.bind(this));
        this.fdStateConsumer.handle(this.toggleFltDir);
        this.props.bus.getSubscriber().on('fd_not_installed').handle(v => {
            if (v) {
                this.fdStateConsumer.off(this.toggleFltDir);
                this.toggleFltDir(false);
            }
        });
        PFDUserSettings.getManager(this.props.bus).whenSettingChanged('svtToggle').handle((svt) => {
            svt ? this.pitchIncrementDistance = 1 : this.pitchIncrementDistance = .5;
            this.updateFD();
        });
    }
    /**
     * Updates the flight director.
     */
    updateFD() {
        if (!this.needUpdate) {
            return;
        }
        this.fdServoBank = this.bankServo.drive(this.fdServoBank, this.fdRawBank);
        const correctedBank = this.fdServoBank - this.currentBank;
        const averagedPitch = this.pitchAverage.getAverage(this.fdRawPitch);
        const correctedPitch = MathUtils.clamp(averagedPitch - this.currentPitch, -10, 10);
        const translation = correctedPitch * this.pitchIncrementDistance * 13.5;
        this.fltDirectorRef.instance.style.transform = `translate3d(0px, ${translation}px, 0px) rotate3d(0, 0, 1, ${-correctedBank}deg)`;
        this.needUpdate = false;
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "flight-director-container", ref: this.fltDirectorRef },
            FSComponent.buildComponent("svg", { width: "414", height: "315" },
                FSComponent.buildComponent("path", { d: "M 207 204 l -120 30 l -14 -9 l 134 -22 z", fill: "magenta", stroke: "black", "stroke-width": ".5px" }),
                FSComponent.buildComponent("path", { d: "M 73 225 l 0 9 l 14 0 z", fill: "magenta", stroke: "black", "stroke-width": ".5px" }),
                FSComponent.buildComponent("path", { d: "M 207 204 l 120 30 l 14 -9 l -134 -22 z", fill: "magenta", stroke: "black", "stroke-width": ".5px" }),
                FSComponent.buildComponent("path", { d: "M 341 225 l 0 9 l -14 0 z", fill: "magenta", stroke: "black", "stroke-width": ".5px" }))));
    }
}
