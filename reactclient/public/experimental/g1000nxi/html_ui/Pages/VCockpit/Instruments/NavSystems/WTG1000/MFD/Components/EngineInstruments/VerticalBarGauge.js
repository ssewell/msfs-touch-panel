import { FSComponent, DisplayComponent } from 'msfssdk';
import { BaseGauge } from './BaseGauge';
import './Gauge.css';
/** The dynamic color bands for a gauge. */
class VerticalColorZone extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.theRect = FSComponent.createRef();
        this.gaugeMin = 0;
        this.gaugeMax = 0;
        this.zoneMin = 0;
        this.zoneMax = 0;
    }
    /** Do things after rendering. */
    onAfterRender() {
        var _a, _b, _c, _d;
        this.zoneMin = (_a = this.props.logicHost) === null || _a === void 0 ? void 0 : _a.addLogicAsNumber(this.props.values.begin, (min) => {
            this.zoneMin = min;
            this.redraw();
        }, 0);
        this.zoneMax = (_b = this.props.logicHost) === null || _b === void 0 ? void 0 : _b.addLogicAsNumber(this.props.values.end, (max) => {
            this.zoneMax = max;
            this.redraw();
        }, 0);
        if (this.props.gaugeMin) {
            this.gaugeMin = (_c = this.props.logicHost) === null || _c === void 0 ? void 0 : _c.addLogicAsNumber(this.props.gaugeMin, (min) => {
                this.gaugeMin = min;
                this.redraw();
            }, 0);
        }
        if (this.props.gaugeMax) {
            this.gaugeMax = (_d = this.props.logicHost) === null || _d === void 0 ? void 0 : _d.addLogicAsNumber(this.props.gaugeMax, (max) => {
                this.gaugeMax = max;
                this.redraw();
            }, 0);
        }
        this.theRect.instance.setAttribute('fill', this.props.values.color ? this.props.values.color : 'white');
    }
    /**
     * Redraw ourselves when something changes.  Since a lot of our values are
     * relative, we'll recompute our dimensions whenever one of them changes.
     */
    redraw() {
        const baseY = this.props.origin.y + this.props.gaugeHeight;
        const height = ((this.zoneMax - this.zoneMin) / (this.gaugeMax - this.gaugeMin)) * this.props.gaugeHeight;
        const startY = baseY - height - (((this.zoneMin - this.gaugeMin) / (this.gaugeMax - this.gaugeMin)) * this.props.gaugeHeight);
        this.theRect.instance.setAttribute('y', `${startY}`);
        this.theRect.instance.setAttribute('height', `${height}`);
    }
    /**
     * Render a color zone.
     * @returns A VNode of the zone.
     */
    render() {
        return FSComponent.buildComponent("rect", { ref: this.theRect, x: this.props.origin.x, y: 0, height: 0, width: this.props.width, fill: "white" });
    }
}
/** A two-sided pointer. */
class DoublePointer extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.ptr1Div = FSComponent.createRef();
        this.ptr2Div = FSComponent.createRef();
        this.ptr1Path = FSComponent.createRef();
        this.ptr2Path = FSComponent.createRef();
        this.ptr1Label = FSComponent.createRef();
        this.ptr2Label = FSComponent.createRef();
        this.minimum = 0;
        this.maximum = 0;
        this.value1 = 0;
        this.value2 = 0;
    }
    /** Do stuff after rendering. */
    onAfterRender() {
        var _a, _b, _c, _d;
        this.ptr1Path.instance.setAttribute('d', 'M 0 0 l 22 0 l -12 10 l 0 86 l -10 0 z');
        this.ptr2Path.instance.setAttribute('d', 'M 0 0 l 22 0 l 0 96 l -10 0 l 0 -86 z');
        this.ptr1Label.instance.textContent = this.props.cursorText1 !== undefined ? this.props.cursorText1 : '';
        this.ptr2Label.instance.textContent = this.props.cursorText2 !== undefined ? this.props.cursorText2 : '';
        if (this.props.minimum !== undefined) {
            this.minimum = (_a = this.props.logicHost) === null || _a === void 0 ? void 0 : _a.addLogicAsNumber(this.props.minimum, (min) => {
                this.minimum = min;
                this.updatePtr(this.ptr1Div, this.value1);
                this.updatePtr(this.ptr2Div, this.value2);
            }, 0);
        }
        if (this.props.maximum !== undefined) {
            this.maximum = (_b = this.props.logicHost) === null || _b === void 0 ? void 0 : _b.addLogicAsNumber(this.props.maximum, (max) => {
                this.maximum = max;
                this.updatePtr(this.ptr1Div, this.value1);
                this.updatePtr(this.ptr2Div, this.value2);
            }, 0);
        }
        if (this.props.value1 !== undefined) {
            this.value1 = (_c = this.props.logicHost) === null || _c === void 0 ? void 0 : _c.addLogicAsNumber(this.props.value1, (val) => {
                this.value1 = val;
                this.updatePtr(this.ptr1Div, this.value1);
            }, 2);
        }
        if (this.props.value2 !== undefined) {
            this.value2 = (_d = this.props.logicHost) === null || _d === void 0 ? void 0 : _d.addLogicAsNumber(this.props.value2, (val) => {
                this.value2 = val;
                this.updatePtr(this.ptr2Div, this.value2);
            }, 2);
        }
    }
    /**
     * Update a needle value.
     * @param ptrRef A NodeReference to the needle div.
     * @param value The new value to set.
     */
    updatePtr(ptrRef, value) {
        value = Utils.Clamp(value, this.minimum, this.maximum);
        const translation = 80 - ((value - this.minimum) / (this.maximum - this.minimum)) * 80;
        ptrRef.instance.style.transform = `translate3d(0px,${(translation)}px, 0px)`;
    }
    /**
     * Render the pointers.
     * @returns A VNode
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "gauge_pointers" },
            FSComponent.buildComponent("div", { class: "gauge_pointer_left", ref: this.ptr1Div },
                FSComponent.buildComponent("svg", null,
                    FSComponent.buildComponent("defs", null,
                        FSComponent.buildComponent("linearGradient", { id: "pointerGradientLeft", x1: "0%", y1: "0%", x2: "100%", y2: "0%" },
                            FSComponent.buildComponent("stop", { offset: "0%", style: "stop-color:rgb(80,80,80);stop-opacity:1" }),
                            FSComponent.buildComponent("stop", { offset: "30%", style: "stop-color:rgb(255,255,255);stop-opacity:1" }),
                            FSComponent.buildComponent("stop", { offset: "100%", style: "stop-color:rgb(80,80,80);stop-opacity:1" }))),
                    FSComponent.buildComponent("path", { d: "", fill: "url(#pointerGradientLeft)", ref: this.ptr1Path }),
                    FSComponent.buildComponent("text", { x: "12", y: "30", class: "gauge_pointer_text", ref: this.ptr1Label }))),
            FSComponent.buildComponent("div", { class: "gauge_pointer_right", ref: this.ptr2Div },
                FSComponent.buildComponent("svg", null,
                    FSComponent.buildComponent("defs", null,
                        FSComponent.buildComponent("linearGradient", { id: "pointerGradientRight", x1: "0%", y1: "0%", x2: "100%", y2: "0%" },
                            FSComponent.buildComponent("stop", { offset: "0%", style: "stop-color:rgb(80,80,80);stop-opacity:1" }),
                            FSComponent.buildComponent("stop", { offset: "70%", style: "stop-color:rgb(255,255,255);stop-opacity:1" }),
                            FSComponent.buildComponent("stop", { offset: "100%", style: "stop-color:rgb(80,80,80);stop-opacity:1" }))),
                    FSComponent.buildComponent("path", { d: "", fill: "url(#pointerGradientRight)", ref: this.ptr2Path }),
                    FSComponent.buildComponent("text", { x: "12", y: "48", class: "gauge_pointer_text", ref: this.ptr2Label })))));
    }
}
/** A single vertical bar. */
class VerticalBar extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.groupRef = FSComponent.createRef();
        this.baseLineRef = FSComponent.createRef();
        this.tickGroupRef = FSComponent.createRef();
        this.zoneGroupRef = FSComponent.createRef();
        this.x = this.props.origin.x;
        this.y = this.props.origin.y;
        this.height = this.props.height;
        this.maxValue = 0;
        this.minValue = 0;
        // Constants for tweaking layout.
        /** The length of the general minor ticks. */
        this.minTickLength = 9;
        /** The length of major ticks, like the baselines. */
        this.majTickLength = 9;
        /** The width of a color bar, in pixels. */
        this.zoneWidth = 6;
        this.minTickOffest = this.minTickLength * (this.props.tickSide == 'left' ? -1 : 1);
        this.majTickOffest = this.majTickLength * (this.props.tickSide == 'left' ? -1 : 1);
    }
    /** Draw our ticks. */
    drawTicks() {
        if (this.props.graduationLength !== undefined) {
            const valRange = this.maxValue - this.minValue;
            const graduations = Math.trunc(valRange / this.props.graduationLength);
            if (graduations > 1) {
                const spacing = this.props.height / graduations;
                for (let i = 1; i < graduations; i++) {
                    const y = this.y + spacing * i;
                    FSComponent.render(FSComponent.buildComponent("g", null,
                        FSComponent.buildComponent("line", { x1: this.x, y1: y, x2: this.x + this.minTickOffest, y2: y, stroke: "white", "stroke-width": "1px" })), this.tickGroupRef.instance);
                }
            }
        }
    }
    /** Do stuff after render */
    onAfterRender() {
        var _a, _b;
        if (this.props.maximum) {
            this.maxValue = (_a = this.props.logicHost) === null || _a === void 0 ? void 0 : _a.addLogicAsNumber(this.props.maximum, (max) => { this.maxValue = max; }, 2);
        }
        if (this.props.minimum) {
            this.minValue = (_b = this.props.logicHost) === null || _b === void 0 ? void 0 : _b.addLogicAsNumber(this.props.minimum, (min) => { this.minValue = min; }, 2);
        }
        if (this.props.colorZones) {
            // The width of our axis offset.  For some reason this is 1, even though the stroke
            // on the axis is 2.  Haven't figured out why yet.
            const axisWidth = 0;
            const zoneX = this.props.tickSide == 'left' ? this.x - this.zoneWidth : this.x + axisWidth;
            for (let i = 0; i < this.props.colorZones.length; i++) {
                FSComponent.render(FSComponent.buildComponent(VerticalColorZone, { logicHost: this.props.logicHost, width: 6, origin: { x: zoneX, y: this.props.origin.y }, values: this.props.colorZones[i], gaugeMin: this.props.minimum, gaugeMax: this.props.maximum, gaugeHeight: this.height }), this.zoneGroupRef.instance);
            }
        }
        this.drawTicks();
    }
    /**
     * Render our bar
     * @returns A VNode
     */
    render() {
        return FSComponent.buildComponent("g", { ref: this.groupRef },
            FSComponent.buildComponent("g", { ref: this.zoneGroupRef }),
            FSComponent.buildComponent("line", { x1: this.x, y1: this.y - 1, x2: this.x, y2: this.y + this.height, "stroke-width": "1px", stroke: "white", ref: this.baseLineRef, class: "baseline" }),
            FSComponent.buildComponent("line", { x1: this.x, y1: this.y, x2: this.x + this.majTickOffest, y2: this.y, "stroke-width": "1px", stroke: "white", class: "topBar" }),
            FSComponent.buildComponent("line", { x1: this.x, y1: this.y + this.height, x2: this.x + this.majTickOffest, y2: this.y + this.height, "stroke-width": "1px", stroke: "white", class: "bottomBar" }),
            FSComponent.buildComponent("g", { ref: this.tickGroupRef }));
    }
}
/** A horizontal bar gauge with two sets of values. */
export class XMLDoubleVerticalGauge extends BaseGauge {
    constructor() {
        super(...arguments);
        this.svgRef = FSComponent.createRef();
        this.titleRef = FSComponent.createRef();
        this.value1Ref = FSComponent.createRef();
        this.value2Ref = FSComponent.createRef();
        this.labelRef = FSComponent.createRef();
        this.maxValue = 0;
        this.minValue = 0;
        // Constants for tweaking layoout.  Maybe these should be passed in as props?
        // Or maybe that's too much work for the benefit.
        /** The X location of the left column. */
        this.column1X = 39;
        /** The X location of the right column. */
        this.column2X = 109;
        /** The X location of the labels. */
        this.labelX = 74;
        /** The Y location of the base of the columns. */
        this.baseY = 5;
        /** The height of the columns, in pixels. */
        this.height = 80;
        /** The Y offset for the labels, for centering on the tickmarks */
        this.labelOffset = 4;
    }
    /**
     * Initialize the rendered gauge.
     */
    initGauge() {
        var _a, _b, _c, _d;
        if (this.props.title || this.props.unit) {
            this.titleRef.instance.textContent = `${this.props.title} ${this.props.unit}`;
            if (this.props.beginText !== undefined) {
                this.titleRef.instance.textContent += ` ${this.props.beginText}`;
            }
        }
        if (this.props.maximum) {
            this.maxValue = (_a = this.props.logicHost) === null || _a === void 0 ? void 0 : _a.addLogicAsNumber(this.props.maximum, (max) => { this.maxValue = max; }, 0);
        }
        if (this.props.minimum) {
            this.minValue = (_b = this.props.logicHost) === null || _b === void 0 ? void 0 : _b.addLogicAsNumber(this.props.minimum, (min) => { this.minValue = min; }, 0);
        }
        if (this.props.value1 !== undefined) {
            (_c = this.props.logicHost) === null || _c === void 0 ? void 0 : _c.addLogicAsNumber(this.props.value1, (val) => {
                this.value1Ref.instance.textContent = `${val}`;
            }, 0);
        }
        if (this.props.value2 !== undefined) {
            (_d = this.props.logicHost) === null || _d === void 0 ? void 0 : _d.addLogicAsNumber(this.props.value2, (val) => {
                this.value2Ref.instance.textContent = `${val}`;
            }, 0);
        }
        this.drawLabels();
    }
    /** Draw our labels */
    drawLabels() {
        const centeredY = this.baseY + this.labelOffset; // 2 px for centering
        // Draw the top label.
        FSComponent.render(FSComponent.buildComponent("g", null,
            FSComponent.buildComponent("text", { x: this.labelX, y: centeredY, fill: "white", "text-anchor": "middle", "font-size": "12" }, this.props.endText !== undefined ? this.props.endText : `${this.maxValue}`)), this.labelRef.instance);
        // Draw any graduation labels.
        if (this.props.graduationLength !== undefined) {
            const valRange = this.maxValue - this.minValue;
            const graduations = Math.trunc(valRange / this.props.graduationLength);
            const spacing = this.height / graduations;
            if (this.props.graduationHasText) {
                for (let i = 1; i < graduations; i++) {
                    const y = centeredY + spacing * i;
                    FSComponent.render(FSComponent.buildComponent("g", null,
                        FSComponent.buildComponent("text", { x: this.labelX, y: y, fill: "white", "text-anchor": "middle", "font-size": "12" }, `${this.maxValue - (i * this.props.graduationLength)}`)), this.labelRef.instance);
                }
            }
        }
    }
    /**
     * Render a horizontal bar gauge
     * @returns A VNode
     */
    renderGauge() {
        return (FSComponent.buildComponent("div", { class: "double_vert_container" },
            FSComponent.buildComponent("svg", { viewBox: "0 0 148 148", ref: this.svgRef },
                FSComponent.buildComponent("g", { ref: this.labelRef }),
                FSComponent.buildComponent(VerticalBar, Object.assign({ origin: { x: this.column1X, y: this.baseY }, height: this.height, tickSide: "left" }, this.props)),
                FSComponent.buildComponent(VerticalBar, Object.assign({ origin: { x: this.column2X, y: this.baseY }, height: this.height, tickSide: "right" }, this.props))),
            FSComponent.buildComponent(DoublePointer, Object.assign({}, this.props)),
            FSComponent.buildComponent("div", { class: "gauge_values" },
                FSComponent.buildComponent("span", { class: "gauge_value_left", ref: this.value1Ref }),
                FSComponent.buildComponent("span", { class: "gauge_title", ref: this.titleRef }),
                FSComponent.buildComponent("span", { class: "gauge_value_right", ref: this.value2Ref }))));
    }
}
