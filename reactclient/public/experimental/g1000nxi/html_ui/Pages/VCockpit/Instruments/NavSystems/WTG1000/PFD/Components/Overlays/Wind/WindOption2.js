import { FSComponent, Subject } from 'msfssdk';
import { WindOverlayRenderOption } from '../../../../Shared/UI/Controllers/WindOptionController';
import { WindOption } from './WindOption';
/**
 * The Wind Option 2 Component
 */
export class WindOption2 extends WindOption {
    constructor() {
        super(...arguments);
        this.option2RotateRef = FSComponent.createRef();
        this.windSpeedValue = Subject.create(0);
    }
    /**
     * Do stuff after rendering.
     */
    onAfterRender() {
        var _a;
        this.props.renderOption.sub((v) => {
            if (v === WindOverlayRenderOption.OPT2) {
                this.setVisible(true);
            }
            else {
                this.setVisible(false);
            }
        });
        this.props.windData.sub(() => {
            this.update();
        });
        (_a = this.props.aircraftHeading) === null || _a === void 0 ? void 0 : _a.sub(() => {
            this.update();
        });
    }
    /**
     * Update the component data.
     */
    update() {
        var _a, _b;
        const hdg = ((_a = this.props.aircraftHeading) === null || _a === void 0 ? void 0 : _a.get()) !== undefined ? (_b = this.props.aircraftHeading) === null || _b === void 0 ? void 0 : _b.get() : 0;
        const windData = this.props.windData.get();
        const windAbsolute = Math.abs(Math.round(windData.velocity));
        let rotate = windData.direction - hdg;
        if (rotate > 180) {
            rotate = rotate - 360;
        }
        else if (rotate < -180) {
            rotate = rotate + 360;
        }
        rotate = (rotate + 180) % 360;
        this.windSpeedValue.set(windAbsolute);
        if (this.option2RotateRef.instance !== null && windAbsolute !== 0) {
            this.option2RotateRef.instance.style.transform = `rotate3d(0, 0, 1, ${rotate}deg)`;
        }
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { ref: this.containerRef, class: "opt2 disabled" },
            FSComponent.buildComponent("div", { ref: this.option2RotateRef, class: "arrow-rotate" },
                FSComponent.buildComponent("svg", null,
                    FSComponent.buildComponent("path", { d: "M 6 21 L 6 5 L 10 5 L 5 0 l -5 5 l 4 0 L 4 21 z", fill: "whitesmoke", stroke: "gray", "stroke-width": "1px" }))),
            FSComponent.buildComponent("div", { class: "wind-speed-solo size18" }, this.windSpeedValue)));
    }
}
