import { FSComponent, DisplayComponent, Subject, Vec2Subject } from 'msfssdk';
import { PFDUserSettings } from '../../PFDUserSettings';
import { ArtificialHorizon } from './ArtificialHorizon';
import { AttitudeIndicator } from './AttitudeIndicator';
import { FlightPathMarker } from './FlightPathMarker';
import { G1000SynVis } from './G1000SynVis';
import './PrimaryHorizonDisplay.css';
/**
 * The PFD primary horizon display.
 */
export class PrimaryHorizonDisplay extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.artificalHorizonRef = FSComponent.createRef();
        this.attitudeIndicatorRef = FSComponent.createRef();
        this.flightPathMarkerRef = FSComponent.createRef();
        this.synVisRef = FSComponent.createRef();
        this.isSvtActiveSub = Subject.create(false);
        this.planeState = {
            roll: 0,
            pitch: 0,
            heading: 0,
            track: 0,
            altitude: 0,
            gs: 0,
            vs: 0,
            aoa: 0
        };
        this.shouldUpdate = true;
        this.lastUpdateTime = 0;
        /**
         * A callback called when the pitch updates from the event bus.
         * @param pitch The current pitch value.
         */
        this.onUpdatePitch = (pitch) => {
            this.planeState.pitch = pitch;
            this.shouldUpdate = true;
        };
        /**
         * A callback called when the roll updates from the event bus.
         * @param roll The current ADC roll value.
         */
        this.onUpdateRoll = (roll) => {
            this.planeState.roll = roll;
            this.shouldUpdate = true;
        };
        /**
         * A callback called when the altitude updates from the event bus.
         * @param alt The current ADC altitude.
         */
        this.onUpdateAltitude = (alt) => {
            this.planeState.altitude = alt;
            this.shouldUpdate = true;
        };
        /**
         * A callback called when the true heading updates from the event bus.
         * @param hdg The current ADC true heading value.
         */
        this.onUpdateHeading = (hdg) => {
            this.planeState.heading = hdg;
            this.shouldUpdate = true;
        };
        /**
         * A callback called when the true track updates from the event bus.
         * @param track The current ADC true track value.
         */
        this.onUpdateTrack = (track) => {
            this.planeState.track = track;
            this.shouldUpdate = true;
        };
        /**
         * A callback called when the ground speed updates from the event bus.
         * @param gs The current ADC ground speed value.
         */
        this.onUpdateGroundSpeed = (gs) => {
            this.planeState.gs = gs;
            this.shouldUpdate = true;
        };
        /**
         * A callback called when the vertical speed updates from the event bus.
         * @param vs The current ADC vertical speed value.
         */
        this.onUpdateVerticalSpeed = (vs) => {
            this.planeState.vs = vs;
            this.shouldUpdate = true;
        };
        /**
         * A callback called when the angle of attack updates from the event bus.
         * @param aoa The current angle of attack.
         */
        this.onUpdateAoA = (aoa) => {
            this.planeState.aoa = aoa;
            this.shouldUpdate = true;
        };
        this.onFrameUpdate = (realTime) => {
            const dt = realTime - this.lastUpdateTime;
            if (this.shouldUpdate) {
                this.shouldUpdate = false;
                this.synVisRef.instance.update(this.planeState);
                this.attitudeIndicatorRef.instance.update(this.planeState);
                this.artificalHorizonRef.instance.update(this.planeState);
            }
            this.flightPathMarkerRef.instance.update(dt, this.planeState);
            // this.aptLabelsRef.instance.update(this.planeState);
            this.lastUpdateTime = realTime;
        };
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        const sub = this.props.bus.getSubscriber();
        sub.on('pitch_deg')
            .withPrecision(2)
            .handle(this.onUpdatePitch);
        sub.on('roll_deg')
            .withPrecision(3)
            .handle(this.onUpdateRoll);
        sub.on('alt')
            .whenChanged()
            .handle(this.onUpdateAltitude);
        sub.on('hdg_deg')
            .withPrecision(2)
            .handle(this.onUpdateHeading);
        sub.on('track_deg_magnetic')
            .withPrecision(2)
            .handle(this.onUpdateTrack);
        sub.on('ground_speed')
            .withPrecision(2)
            .handle(this.onUpdateGroundSpeed);
        sub.on('vs')
            .withPrecision(2)
            .handle(this.onUpdateVerticalSpeed);
        sub.on('aoa')
            .withPrecision(2)
            .handle(this.onUpdateAoA);
        sub.on('realTime').handle(this.onFrameUpdate);
        PFDUserSettings.getManager(this.props.bus).whenSettingChanged('svtToggle').handle(isActive => { this.isSvtActiveSub.set(isActive); });
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("div", null,
            FSComponent.buildComponent(ArtificialHorizon, { ref: this.artificalHorizonRef, isActive: this.isSvtActiveSub.map(isActive => !isActive) }),
            FSComponent.buildComponent(G1000SynVis, { ref: this.synVisRef, bus: this.props.bus, bingId: 'wtg1000-horizon', resolution: Vec2Subject.createFromVector(new Float64Array([1228, 921])), isActive: this.isSvtActiveSub }),
            FSComponent.buildComponent(FlightPathMarker, { ref: this.flightPathMarkerRef, isActive: this.isSvtActiveSub }),
            FSComponent.buildComponent(AttitudeIndicator, { ref: this.attitudeIndicatorRef, bus: this.props.bus })));
    }
}
