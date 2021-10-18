import { DisplayComponent, FSComponent } from 'msfssdk';
import { TCASOperatingMode } from 'msfssdk/traffic';
import { MapTrafficAltitudeRestrictionMode } from '../Modules/MapTrafficModule';
import './MapTrafficStatusIndicator.css';
/**
 *
 */
export class MapTrafficStatusIndicator extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.rootRef = FSComponent.createRef();
        this.disabledRef = FSComponent.createRef();
        this.altitudeRestrictionTextSub = this.props.altitudeRestrictionMode.map(mode => {
            return MapTrafficStatusIndicator.ALT_RESTRICTION_TEXT[mode];
        });
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAfterRender() {
        this.props.show.sub(show => {
            this.rootRef.instance.style.display = show ? '' : 'none';
        }, true);
        this.props.operatingMode.sub(mode => {
            this.disabledRef.instance.style.display = mode === TCASOperatingMode.Standby ? 'inherit' : 'none';
        }, true);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent("div", { ref: this.rootRef, class: 'map-traffic-status' },
            this.props.showAltitudeRestrictionMode ? FSComponent.buildComponent("div", { class: 'traffic-status-alt' }, this.altitudeRestrictionTextSub) : null,
            FSComponent.buildComponent("svg", { class: 'traffic-status-symbol', viewBox: '0 0 150 100' },
                FSComponent.buildComponent("path", { d: 'M 50 5 L 95 50 L 50 95 L 5 50 Z' }),
                FSComponent.buildComponent("path", { d: 'M 115 10 L 135 35 L 122.5 35 L 122.5 80 L 107.5 80 L 107.5 35 L 95 35 Z' }),
                FSComponent.buildComponent("g", { ref: this.disabledRef, class: 'traffic-status-disabled' },
                    FSComponent.buildComponent("path", { class: 'traffic-status-disabledcross traffic-status-disabledcross-outline', d: 'M 10 10 L 140 90 M 10 90 L 140 10' }),
                    FSComponent.buildComponent("path", { class: 'traffic-status-disabledcross traffic-status-disabledcross-stroke', d: 'M 10 10 L 140 90 M 10 90 L 140 10' })))));
    }
}
MapTrafficStatusIndicator.ALT_RESTRICTION_TEXT = {
    [MapTrafficAltitudeRestrictionMode.Unrestricted]: 'UNRES',
    [MapTrafficAltitudeRestrictionMode.Above]: 'ABOVE',
    [MapTrafficAltitudeRestrictionMode.Normal]: 'NORM',
    [MapTrafficAltitudeRestrictionMode.Below]: 'BELOW'
};
