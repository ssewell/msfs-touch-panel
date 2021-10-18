import { DisplayComponent, FSComponent } from 'msfssdk';
import './MapTrafficOffScaleIndicator.css';
export var MapTrafficIntruderOffScaleIndicatorMode;
(function (MapTrafficIntruderOffScaleIndicatorMode) {
    MapTrafficIntruderOffScaleIndicatorMode[MapTrafficIntruderOffScaleIndicatorMode["Off"] = 0] = "Off";
    MapTrafficIntruderOffScaleIndicatorMode[MapTrafficIntruderOffScaleIndicatorMode["TA"] = 1] = "TA";
    MapTrafficIntruderOffScaleIndicatorMode[MapTrafficIntruderOffScaleIndicatorMode["RA"] = 2] = "RA";
})(MapTrafficIntruderOffScaleIndicatorMode || (MapTrafficIntruderOffScaleIndicatorMode = {}));
/**
 * Displays a traffic off-scale indication.
 */
export class MapTrafficIntruderOffScaleIndicator extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.ref = FSComponent.createRef();
        this.textSub = this.props.mode.map(mode => {
            return MapTrafficIntruderOffScaleIndicator.TEXT[mode];
        });
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAfterRender() {
        this.props.mode.sub(this.onModeChanged.bind(this), true);
    }
    /**
     * A callback which is called when the indicator mode changes.
     * @param mode The new mode.
     */
    onModeChanged(mode) {
        this.ref.instance.classList.remove(...Object.values(MapTrafficIntruderOffScaleIndicator.CLASSES));
        this.ref.instance.classList.add(MapTrafficIntruderOffScaleIndicator.CLASSES[mode]);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent("div", { ref: this.ref, class: 'map-traffic-offscale' }, this.textSub));
    }
}
MapTrafficIntruderOffScaleIndicator.CLASSES = {
    [MapTrafficIntruderOffScaleIndicatorMode.Off]: 'offscale-mode-off',
    [MapTrafficIntruderOffScaleIndicatorMode.TA]: 'offscale-mode-ta',
    [MapTrafficIntruderOffScaleIndicatorMode.RA]: 'offscale-mode-ra'
};
MapTrafficIntruderOffScaleIndicator.TEXT = {
    [MapTrafficIntruderOffScaleIndicatorMode.Off]: '',
    [MapTrafficIntruderOffScaleIndicatorMode.TA]: 'TA OFF SCALE',
    [MapTrafficIntruderOffScaleIndicatorMode.RA]: 'RA OFF SCALE'
};
