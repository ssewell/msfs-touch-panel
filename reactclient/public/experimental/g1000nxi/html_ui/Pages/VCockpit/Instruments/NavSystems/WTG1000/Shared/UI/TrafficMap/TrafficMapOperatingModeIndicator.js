import { DisplayComponent, FSComponent } from 'msfssdk';
import './TrafficMapOperatingModeIndicator.css';
/**
 * Displays a traffic system operating mode indication.
 */
export class TrafficMapOperatingModeIndicator extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.textSub = this.props.operatingMode.map(mode => this.props.text[mode]);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent("div", { class: 'map-traffic-opmode' }, this.textSub));
    }
}
