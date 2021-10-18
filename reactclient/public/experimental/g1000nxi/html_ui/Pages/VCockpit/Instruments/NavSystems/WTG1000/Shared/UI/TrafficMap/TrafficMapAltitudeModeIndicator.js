import { DisplayComponent, FSComponent } from 'msfssdk';
import './TrafficMapAltitudeModeIndicator.css';
/**
 * Displays a traffic system altitude restriction mode indication.
 */
export class TrafficMapAltitudeModeIndicator extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.textSub = this.props.altitudeRestrictionMode.map(mode => this.props.text[mode]);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent("div", { class: 'map-traffic-altmode' }, this.textSub));
    }
}
