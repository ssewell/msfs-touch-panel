import { FSComponent, DisplayComponent } from 'msfssdk';
import { SvtProjectionUtils } from '../../../Shared/UI/SvtProjectionUtils';
import './ArtificialHorizon.css';
/**
 * Artificial horizon
 */
export class ArtificialHorizon extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.containerRef = FSComponent.createRef();
        this.innerRef = FSComponent.createRef();
        this.pxPerDegY = SvtProjectionUtils.projectYawPitch(0, 0.1 * Avionics.Utils.DEG2RAD, 0, new Float64Array(2))[1] * 5; // artificial horizon pitch ratio is half of svt
    }
    /** @inheritdoc */
    onAfterRender() {
        this.props.isActive.sub(this.onIsActiveChanged.bind(this), true);
    }
    /**
     * Responds to changes in whether the artifical horizon is active.
     * @param active Whether the artifical horizon is active.
     */
    onIsActiveChanged(active) {
        this.containerRef.instance.style.display = active ? '' : 'none';
    }
    /**
     * Update method.
     * @param planeState The plane state info
     */
    update(planeState) {
        if (this.props.isActive.get()) {
            this.innerRef.instance.style.transform = `rotate(${planeState.roll}deg) translate3d(0px, ${planeState.pitch * this.pxPerDegY}px, 0px)`;
        }
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("div", { class: "artificial-horizon", ref: this.containerRef },
            FSComponent.buildComponent("div", { class: "artificial-horizon-inner", ref: this.innerRef },
                FSComponent.buildComponent("div", { class: "sky" }),
                FSComponent.buildComponent("div", { class: "horizon" }),
                FSComponent.buildComponent("div", { class: "ground" }))));
    }
}
