import { FSComponent, DisplayComponent } from 'msfssdk';
/**
 * An abstract base gauge component containing the universal logic for scaling
 * and margin calculations so these don't need to be implemented in every
 * gauge type.
 */
export class BaseGauge extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.theDiv = FSComponent.createRef();
    }
    /**
     * Perform scaling and margin adjustment then render and initialize the gauge.
     */
    onAfterRender() {
        var _a, _b, _c, _d, _e;
        if (((_a = this.props.style) === null || _a === void 0 ? void 0 : _a.sizePercent) && this.props.style.sizePercent !== 100) {
            const factor = this.props.style.sizePercent / 100;
            this.theDiv.instance.style.transform = `scale3d(${factor}, ${factor}, ${factor})`;
            this.theDiv.instance.style.transformOrigin = 'center';
            this.theDiv.instance.style.marginTop = `-${(1 - factor) * 50}%`;
            this.theDiv.instance.style.marginBottom = `-${(1 - factor) * 50}%`;
        }
        if ((_b = this.props.style) === null || _b === void 0 ? void 0 : _b.marginLeft) {
            this.theDiv.instance.style.marginLeft = `${this.props.style.marginLeft}px`;
        }
        if ((_c = this.props.style) === null || _c === void 0 ? void 0 : _c.marginTop) {
            this.theDiv.instance.style.marginTop = `${this.props.style.marginTop}px`;
        }
        if ((_d = this.props.style) === null || _d === void 0 ? void 0 : _d.marginRight) {
            this.theDiv.instance.style.marginRight = `${this.props.style.marginRight}px`;
        }
        if ((_e = this.props.style) === null || _e === void 0 ? void 0 : _e.marginBottom) {
            this.theDiv.instance.style.marginBottom = `${this.props.style.marginBottom}px`;
        }
        FSComponent.render(this.renderGauge(), this.theDiv.instance);
        this.initGauge();
    }
    /**
     * Render the gauge.
     * @returns A VNode
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "abstract_gauge_container", ref: this.theDiv }));
    }
}
