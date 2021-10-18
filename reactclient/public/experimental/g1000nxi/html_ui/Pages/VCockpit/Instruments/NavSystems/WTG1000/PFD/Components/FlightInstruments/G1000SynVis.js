import { ArraySubject, DisplayComponent, FSComponent, Subject } from 'msfssdk';
import { BingComponent } from 'msfssdk/components/bing';
import { SynVisComponent } from 'msfssdk/components/synvis';
import { HorizonCompass } from './HorizonCompass';
import { PFDUserSettings } from '../../PFDUserSettings';
import './G1000SynVis.css';
/**
 * G1000 syn vis component
 */
export class G1000SynVis extends DisplayComponent {
    /**
     * Ctor
     * @param props the props.
     */
    constructor(props) {
        super(props);
        this.containerRef = FSComponent.createRef();
        this.horizonRef = FSComponent.createRef();
        this.settingManager = PFDUserSettings.getManager(props.bus);
    }
    /** @inheritdoc */
    onAfterRender() {
        this.props.isActive.sub(this.onIsActiveChanged.bind(this), true);
        this.settingManager.whenSettingChanged('svtHdgLabelToggle').handle(this.onHdgLblActiveChanged.bind(this));
    }
    /**
     * Callback when the Hdg label setting is changed.
     * @param v true if hdg label is active, false otherwise.
     */
    onHdgLblActiveChanged(v) {
        this.horizonRef.instance.setHdgLabelVisibility(v);
    }
    /**
     * Responds to changes in whether synthetic vision is active.
     * @param active Whether synthetic vision is active.
     */
    onIsActiveChanged(active) {
        this.containerRef.instance.style.display = active ? '' : 'none';
    }
    /**
     * Creates a full Bing component earth color array for SVT which is darker than the regular topo map.
     * @returns a full Bing component earth color array for SVT absolute terrain colors.
     */
    createSVTEarthColors() {
        return BingComponent.createEarthColorsArray('#000049', [
            {
                elev: 0,
                color: '#0c2e04'
            },
            {
                elev: 500,
                color: '#113300'
            },
            {
                elev: 2000,
                color: '#463507'
            },
            {
                elev: 3000,
                color: '#5c421f'
            },
            {
                elev: 6000,
                color: '#50331b'
            },
            {
                elev: 8000,
                color: '#512d15'
            },
            {
                elev: 10500,
                color: '#673118'
            },
            {
                elev: 27000,
                color: '#4d4d4d'
            },
            {
                elev: 29000,
                color: '#666666'
            }
        ]);
    }
    /**
     * Updates the components of the g1000 syn vis.
     * @param planeState The current plane state info.
     */
    update(planeState) {
        if (this.props.isActive.get()) {
            this.horizonRef.instance.update(planeState);
        }
    }
    /**
     * Renders the syn vis component.
     * @returns A component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "synthetic-vision", ref: this.containerRef },
            FSComponent.buildComponent(SynVisComponent, { bingId: this.props.bingId, resolution: this.props.resolution, earthColors: ArraySubject.create(this.createSVTEarthColors()), skyColor: Subject.create(BingComponent.hexaToRGBColor('0033E6')) }),
            FSComponent.buildComponent(HorizonCompass, { ref: this.horizonRef })));
    }
}
