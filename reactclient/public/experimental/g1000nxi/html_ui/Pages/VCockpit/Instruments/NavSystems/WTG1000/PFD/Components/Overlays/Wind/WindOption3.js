import { ComputedSubject, FSComponent, Subject } from 'msfssdk';
import { WindOverlayRenderOption } from '../../../../Shared/UI/Controllers/WindOptionController';
import { WindOption } from './WindOption';
/**
 * The Wind Option 3 Component
 */
export class WindOption3 extends WindOption {
    constructor() {
        super(...arguments);
        this.option3RotateRef = FSComponent.createRef();
        this.windSpeedValue = Subject.create(0);
        this.windDirectionValue = ComputedSubject.create(0, (v) => {
            if (v === 0) {
                return '360°';
            }
            else {
                return v.toFixed(0).padStart(3, '0') + '°';
            }
        });
    }
    /**
     * Do stuff after rendering.
     */
    onAfterRender() {
        var _a;
        this.props.renderOption.sub((v) => {
            if (v === WindOverlayRenderOption.OPT3) {
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
        if (this.option3RotateRef.instance !== null && windAbsolute !== 0) { //Prevents rotation spasms when the sim returns chaotic wind direction with zero velocity
            this.option3RotateRef.instance.style.transform = `rotate3d(0, 0, 1, ${rotate}deg)`;
            this.windDirectionValue.set(Math.round(windData.direction));
        }
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { ref: this.containerRef, class: "opt3 disabled" },
            FSComponent.buildComponent("div", { ref: this.option3RotateRef, class: "arrow-rotate" },
                FSComponent.buildComponent("svg", null,
                    FSComponent.buildComponent("path", { d: "M 6 21 L 6 5 L 10 5 L 5 0 l -5 5 l 4 0 L 4 21 z", fill: "whitesmoke", stroke: "gray", "stroke-width": "1px" }))),
            FSComponent.buildComponent("div", { class: "wind-direction size14" },
                FSComponent.buildComponent("span", null, this.windDirectionValue)),
            FSComponent.buildComponent("div", { class: "wind-speed size14" },
                FSComponent.buildComponent("span", null, this.windSpeedValue),
                FSComponent.buildComponent("span", { class: "size10" }, "KT"))));
    }
}
