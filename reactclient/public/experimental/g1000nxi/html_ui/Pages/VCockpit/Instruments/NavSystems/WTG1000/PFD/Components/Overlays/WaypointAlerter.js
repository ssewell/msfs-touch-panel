import { FSComponent, DisplayComponent, NodeReference } from 'msfssdk';
import './WaypointAlerter.css';
/**
 * A component that alerts when the waypoint is about to change.
 */
export class WaypointAlerter extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.el = new NodeReference();
        this.currentSpeed = 0;
        this.secondsRemaining = 0;
        this.nextDTK = 0;
        this.flashing = false;
        /**
         * A callback called when the LNAV distance to go is updated.
         * @param distance The distance to go.
         */
        this.onDistanceUpdated = (distance) => {
            if (distance !== 0) {
                const secondsRemaining = (distance / this.currentSpeed) * 60 * 60;
                if (secondsRemaining <= 5.25 && !this.flashing) {
                    this.el.instance && this.el.instance.classList.add('flashing');
                    this.el.instance && (this.el.instance.style.display = 'block');
                    this.secondsRemaining = Math.floor(secondsRemaining);
                    this.startFlash();
                }
            }
        };
        /**
         * Starts the waypoint alerter flashing.
         */
        this.startFlash = () => {
            if (this.secondsRemaining > 0) {
                this.flashing = true;
                this.el.instance && (this.el.instance.textContent = `Next DTK ${this.nextDTK.toFixed(0)}° in ${this.secondsRemaining} sec`);
                this.secondsRemaining--;
                this.currentTimeout = setTimeout(this.startFlash, 1000);
            }
            else {
                this.flashing = false;
                this.showNowMessage();
            }
        };
    }
    /**
     * A callback called after the component is rendered.
     */
    onAfterRender() {
        const lnav = this.props.bus.getSubscriber();
        this.props.bus.getSubscriber().on('ground_speed').handle(spd => this.currentSpeed = spd);
        lnav.on('lnavDisTurn').handle(this.onDistanceUpdated);
        lnav.on('lnavNextDtkMag').handle(dtk => this.nextDTK = dtk);
    }
    /**
     * Shows the waypoint dtk now message.
     */
    showNowMessage() {
        this.el.instance && (this.el.instance.classList.remove('flashing'));
        this.el.instance && (this.el.instance.textContent = `Next DTK ${this.nextDTK.toFixed(0)}° now`);
        setTimeout(() => this.el.instance && (this.el.instance.style.display = 'none'), 3000);
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: 'waypoint-alerter flashing', ref: this.el }, "Next DTK 275\u00B0 in 5 sec"));
    }
}
