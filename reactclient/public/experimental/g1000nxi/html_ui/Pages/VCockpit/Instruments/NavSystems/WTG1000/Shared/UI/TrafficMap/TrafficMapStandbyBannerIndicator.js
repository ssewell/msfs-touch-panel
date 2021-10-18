import { DisplayComponent, FSComponent } from 'msfssdk';
import { TCASOperatingMode } from 'msfssdk/traffic';
import './TrafficMapStandbyBannerIndicator.css';
/**
 * Displays a traffic system standby mode banner indicator.
 */
export class TrafficMapStandbyBannerIndicator extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.rootRef = FSComponent.createRef();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAfterRender() {
        this.props.operatingMode.sub(mode => {
            this.rootRef.instance.style.display = mode === TCASOperatingMode.Standby ? '' : 'none';
        }, true);
        this.props.isOnGround.sub(isOnGround => {
            isOnGround
                ? this.rootRef.instance.classList.add('map-traffic-standby-onground')
                : this.rootRef.instance.classList.remove('map-traffic-standby-onground');
        }, true);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent("div", { ref: this.rootRef, class: 'map-traffic-standby' }, "STANDBY"));
    }
}
