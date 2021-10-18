import { FSComponent, DisplayComponent, Units } from 'msfssdk';
import { XMLCircularGaugeCursor, XMLCircularGaugeValuePos, } from 'msfssdk/components/XMLGauges';
import { BaseGauge } from './BaseGauge';
import './Gauge.css';
/**
 * A class that manages the logic for drawing the colored arcs on a dial gauge.
 */
class CircleGaugeBands extends DisplayComponent {
    constructor() {
        var _a, _b;
        super(...arguments);
        this.pathRefs = new Array();
        this.groupRef = FSComponent.createRef();
        this.pathValues = new Array();
        this.maxValue = 0;
        this.minValue = 0;
        this.beginAngle = ((_a = this.props.style) === null || _a === void 0 ? void 0 : _a.beginAngle) !== undefined ? this.props.style.beginAngle - 90 : -105;
        this.endAngle = ((_b = this.props.style) === null || _b === void 0 ? void 0 : _b.endAngle) !== undefined ? this.props.style.endAngle - 90 : 105;
        this.arcDegrees = this.endAngle - this.beginAngle;
    }
    /** Set initial values then define and draw our color zones. */
    onAfterRender() {
        var _a, _b, _c, _d;
        if (this.props.maximum) {
            this.updateMaxValue((_a = this.props.logicHost) === null || _a === void 0 ? void 0 : _a.addLogicAsNumber(this.props.maximum, (max) => { this.updateMaxValue(max); }, 0));
        }
        if (this.props.minimum) {
            this.updateMinValue((_b = this.props.logicHost) === null || _b === void 0 ? void 0 : _b.addLogicAsNumber(this.props.minimum, (min) => { this.updateMinValue(min); }, 0));
        }
        if (this.props.colorZones) {
            for (let i = 0; i < this.props.colorZones.length; i++) {
                const zone = this.props.colorZones[i];
                const path = FSComponent.createRef();
                FSComponent.render(FSComponent.buildComponent("g", null,
                    FSComponent.buildComponent("path", { ref: path })), this.groupRef.instance);
                this.pathRefs[i] = path;
                this.pathValues[i] = { min: 0, max: 0, color: zone.color !== undefined ? zone.color : 'white' };
                if (zone.begin !== undefined) {
                    this.pathValues[i].min = (_c = this.props.logicHost) === null || _c === void 0 ? void 0 : _c.addLogicAsNumber(zone.begin, (begin) => {
                        this.pathValues[i].min = begin;
                        this.redrawArcs();
                    }, 0);
                }
                if (zone.end !== undefined) {
                    this.pathValues[i].max = (_d = this.props.logicHost) === null || _d === void 0 ? void 0 : _d.addLogicAsNumber(zone.end, (end) => {
                        this.pathValues[i].max = end;
                        this.redrawArcs();
                    }, 0);
                }
            }
            this.redrawArcs();
        }
    }
    /** Draw all the arc in our color zones. */
    redrawArcs() {
        for (let i = 0; i < this.pathRefs.length; i++) {
            this.pathRefs[i].instance.setAttribute('stroke', this.pathValues[i].color);
            this.pathRefs[i].instance.setAttribute('stroke-width', `${this.props.stroke}px`);
            const startAngle = this.beginAngle +
                (((this.pathValues[i].min - this.minValue) / (this.maxValue - this.minValue)) * this.arcDegrees);
            const endAngle = this.beginAngle +
                (((this.pathValues[i].max - this.minValue) / (this.maxValue - this.minValue)) * this.arcDegrees);
            this.pathRefs[i].instance.setAttribute('d', XMLCircleGauge.describeArc(this.props.origin, this.props.radius, startAngle, endAngle));
        }
    }
    /**
     * Update the maximum value.
     * @param max The new max value.
     */
    updateMaxValue(max) {
        this.maxValue = max;
        this.redrawArcs();
    }
    /**
     * Update the minimum value.
     * @param min The new min value.
     */
    updateMinValue(min) {
        this.minValue = min;
        this.redrawArcs();
    }
    /**
     * Render the gauge.
     * @returns A VNode
     */
    render() {
        return (FSComponent.buildComponent("g", { ref: this.groupRef }));
    }
}
/** A new circular gauge */
export class XMLCircleGauge extends BaseGauge {
    constructor() {
        var _a, _b, _c, _d, _e;
        super(...arguments);
        this.origin = { x: 70, y: 70 };
        this.arcRadius = 65.5;
        this.bandRadius = 60.5;
        this.titleRef = FSComponent.createRef();
        this.unitsRef = FSComponent.createRef();
        this.valueRef = FSComponent.createRef();
        this.startRef = FSComponent.createRef();
        this.endRef = FSComponent.createRef();
        this.arcRef = FSComponent.createRef();
        this.ticksRef = FSComponent.createRef();
        this.svgRef = FSComponent.createRef();
        this.needleRef = FSComponent.createRef();
        this.containerDiv = FSComponent.createRef();
        this.maxValue = 0;
        this.minValue = 0;
        this.beginAngle = ((_a = this.props.style) === null || _a === void 0 ? void 0 : _a.beginAngle) !== undefined ? this.props.style.beginAngle - 90 : -105;
        this.endAngle = ((_b = this.props.style) === null || _b === void 0 ? void 0 : _b.endAngle) !== undefined ? this.props.style.endAngle - 90 : 105;
        this.arcDegrees = this.endAngle - this.beginAngle;
        this.quantum = ((_c = this.props.style) === null || _c === void 0 ? void 0 : _c.textIncrement) !== undefined ? (_d = this.props.style) === null || _d === void 0 ? void 0 : _d.textIncrement : 1;
        this.precision = (_e = this.props.style) === null || _e === void 0 ? void 0 : _e.valuePrecision;
    }
    /** Draw our ticks. */
    drawTicks() {
        const ticks = new Array();
        ticks.push(this.beginAngle);
        if (this.props.graduationLength !== undefined) {
            const graduations = Math.trunc((this.maxValue - this.minValue) / this.props.graduationLength);
            if (graduations > 1) {
                const spacing = this.arcDegrees / graduations;
                for (let i = 1; i < graduations; i++) {
                    ticks.push(this.beginAngle + spacing * i);
                }
            }
        }
        ticks.push(this.endAngle);
        for (let i = 0; i < ticks.length; i++) {
            const pointA = XMLCircleGauge.polarToCartesian(this.origin, this.arcRadius - 11, ticks[i]);
            const pointB = XMLCircleGauge.polarToCartesian(this.origin, this.arcRadius, ticks[i]);
            FSComponent.render(FSComponent.buildComponent("g", null,
                FSComponent.buildComponent("line", { x1: pointA.x, y1: pointA.y, x2: pointB.x, y2: pointB.y, stroke: "white", "stroke-width": "1px", "shape-rendering": "crispEdges" })), this.ticksRef.instance);
        }
    }
    /**
     * Initialize the rendered gauge.
     */
    initGauge() {
        var _a, _b, _c, _d, _e, _f, _g;
        if (this.props.value1) {
            this.updateValue((_a = this.props.logicHost) === null || _a === void 0 ? void 0 : _a.addLogicAsNumber(this.props.value1, (value) => { this.updateValue(value); }, 2));
            if (this.props.maximum) {
                this.updateMaxValue((_b = this.props.logicHost) === null || _b === void 0 ? void 0 : _b.addLogicAsNumber(this.props.maximum, (max) => { this.updateMaxValue(max); }, 0));
            }
            if (this.props.minimum) {
                this.updateMinValue((_c = this.props.logicHost) === null || _c === void 0 ? void 0 : _c.addLogicAsNumber(this.props.minimum, (min) => { this.updateMinValue(min); }, 0));
            }
            if (this.props.redBlink) {
                (_d = this.props.logicHost) === null || _d === void 0 ? void 0 : _d.addLogicAsNumber(this.props.redBlink, (value) => {
                    this.setAlertState(value);
                }, 0);
            }
        }
        if (this.props.beginText !== undefined) {
            this.startRef.instance.textContent = this.props.beginText;
        }
        if (this.props.endText !== undefined) {
            this.endRef.instance.textContent = this.props.endText;
        }
        // TODO RCJ make the rest of this function less ugly
        if (((_e = this.props.style) === null || _e === void 0 ? void 0 : _e.valuePos) == XMLCircularGaugeValuePos.End) {
            this.valueRef.instance.classList.add('ValPosEnd');
            // TODO Improve the logic for positioning the value laterally when it's at the end position.
            const endanchor = XMLCircleGauge.polarToCartesian(this.origin, this.arcRadius + 10, this.endAngle + 10);
            this.valueRef.instance.style.right = `${148 - endanchor.x}px`;
            const endPxBelowLine = XMLCircleGauge.distanceFromYOrigin(this.origin, this.arcRadius, this.endAngle);
            this.valueRef.instance.style.top = `${65 - endPxBelowLine + 10}px`;
        }
        else {
            this.valueRef.instance.style.top = '0px';
        }
        if ((_f = this.props.style) === null || _f === void 0 ? void 0 : _f.forceTextColor) {
            this.valueRef.instance.style.color = this.props.style.forceTextColor;
        }
        const textBottom = parseFloat(this.valueRef.instance.style.top) + this.valueRef.instance.offsetHeight;
        this.arcRef.instance.setAttribute('d', XMLCircleGauge.describeArc(this.origin, this.arcRadius, this.beginAngle, this.endAngle));
        const pxBelowLine = Math.max(0, -1 * XMLCircleGauge.heightOfArc(this.origin, this.arcRadius, this.beginAngle, this.endAngle));
        if (((_g = this.props.style) === null || _g === void 0 ? void 0 : _g.valuePos) == XMLCircularGaugeValuePos.End) {
            // Add a little more to account for stroke width and not cut off the bottom.
            this.svgRef.instance.setAttribute('viewBox', `0 0 148 ${Math.max(this.arcRadius + pxBelowLine + 5, textBottom)}`);
        }
        else {
            this.svgRef.instance.setAttribute('viewBox', `0 0 148 ${this.arcRadius + pxBelowLine}`);
        }
        this.drawTicks();
    }
    /**
     * Update the value.
     * @param value The new value to set.
     */
    updateValue(value) {
        var _a;
        let textValue;
        Utils.Clamp(value, this.minValue, this.maxValue);
        const rotation = this.beginAngle + ((value / this.maxValue) * this.arcDegrees);
        if (this.needleRef.getOrDefault() && this.valueRef.getOrDefault()) {
            this.needleRef.instance.style.transform = `rotate(${rotation}deg)`;
            value = Math.round(value / this.quantum) * this.quantum;
            if (this.precision) {
                textValue = value.toFixed(this.precision);
            }
            else {
                // don't spend time on toFixed if a precision isn't required.
                // Unless there's a decimal quantum set, the number will be whole, anyway.
                textValue = value + '';
            }
            if (this.valueRef.instance.textContent !== `${textValue}`) {
                this.valueRef.instance.textContent = `${textValue}`;
            }
        }
        if (!((_a = this.props.style) === null || _a === void 0 ? void 0 : _a.forceTextColor) && this.props.colorZones) {
            let colorSet = false;
            for (const range of this.props.colorZones) {
                if (value >= range.begin.getValueAsNumber() && value <= range.end.getValueAsNumber()) {
                    this.valueRef.instance.style.color = range.color;
                    colorSet = true;
                    break;
                }
            }
            if (!colorSet) {
                this.valueRef.instance.style.color = 'white';
            }
        }
    }
    /**
     * Update the maximum value.
     * @param max The new max value.
     */
    updateMaxValue(max) {
        this.maxValue = max;
        if (this.props.endText == undefined) {
            this.endRef.instance.textContent = `${max}`;
        }
    }
    /**
     * Update the minimum value.
     * @param min The new min value.
     */
    updateMinValue(min) {
        if (this.props.beginText == undefined) {
            this.startRef.instance.textContent = `${min}`;
        }
        this.minValue = 0;
    }
    /**
     * Handle changes in the alert state.
     * @param alerting True if alerting.
     */
    setAlertState(alerting) {
        if (alerting !== 0) {
            this.titleRef.instance.style.animation = 'AlertBlink 1s infinite';
            this.unitsRef.instance.style.animation = 'AlertBlink 1s infinite';
            this.valueRef.instance.style.animation = 'AlertBlink 1s infinite';
        }
        else {
            this.titleRef.instance.style.animation = '';
            this.unitsRef.instance.style.animation = '';
            this.valueRef.instance.style.animation = '';
        }
    }
    /**
     * Given a cartesian origin and a set of polar coordinates, find the cartesian
     * point that represents the polar location in the cartesian grid.
     * @param center The cartesian center.
     * @param radius The radiun in pixels.
     * @param azimuth The angle coordinate in degrees.
     * @returns The cartesian point represented by the polar one.
     */
    // TODO See if there's common math for this.
    static polarToCartesian(center, radius, azimuth) {
        const azimuthRad = (azimuth - 90) * Math.PI / 180.0;
        return {
            x: center.x + (radius * Math.cos(azimuthRad)),
            y: center.y + (radius * Math.sin(azimuthRad))
        };
    }
    /**
     * Construct an SVG path string for a given arc based on its coordinates and radius.
       @param center The cartesian center of the arc.
     * @param radius The radius in pixels.
     * @param startAngle The starting azimuth of the arc in degrees.
     * @param endAngle The final azimuth of the arc in degrees.
     * @returns A string describing an SVG path.
     */
    static describeArc(center, radius, startAngle, endAngle) {
        const start = XMLCircleGauge.polarToCartesian(center, radius, startAngle);
        const end = XMLCircleGauge.polarToCartesian(center, radius, endAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
        const d = [
            'M', start.x, start.y,
            'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y
        ].join(' ');
        return d;
    }
    /**
     * Determine the height "below the line" of the arc in pixels.
       @param center The cartesian center of the arc.
     * @param radius The radius in pixels.
     * @param startAngle The starting azimuth of the arc in degrees.
     * @param endAngle The final azimuth of the arc in degrees
     * @returns An integer with the pixels.
     */
    static heightOfArc(center, radius, startAngle, endAngle) {
        return XMLCircleGauge.distanceFromYOrigin(center, radius, Math.max(Math.abs(startAngle), Math.abs(endAngle)));
    }
    /**
     * Determine how far from the Y origin a cartesian point is.
     * @param center The cartesian center.
     * @param radius The radius in pixels.
     * @param angle The angle in degrees.
     * @returns The distance from the origin in pixels.
     */
    static distanceFromYOrigin(center, radius, angle) {
        const theta = Math.abs(angle);
        const cos = Math.cos(Units.Degrees.toRadians(theta));
        const dist = radius * cos;
        return dist;
    }
    /**
     * Render a circle gauge
     * @returns A VNode
     */
    renderGauge() {
        var _a;
        return (FSComponent.buildComponent("div", { class: 'dial_gauge_container', ref: this.containerDiv },
            FSComponent.buildComponent("svg", { viewBox: "0 0 148 0", ref: this.svgRef },
                FSComponent.buildComponent(CircleGaugeBands, Object.assign({}, this.props, { origin: this.origin, radius: this.bandRadius, stroke: 5 })),
                FSComponent.buildComponent("path", { ref: this.arcRef, fill: "none", stroke: "white", "stroke-width": "1px" }),
                FSComponent.buildComponent("path", { class: "inner_circle", d: "M 70 70 m -7 0 a 7 7 78 0 1 14 0", fill: "rgb(30,30,30)" }),
                FSComponent.buildComponent("g", { ref: this.ticksRef })),
            FSComponent.buildComponent("div", { class: "gauge_pointer", ref: this.needleRef },
                FSComponent.buildComponent("svg", null,
                    FSComponent.buildComponent("path", { d: ((_a = this.props.style) === null || _a === void 0 ? void 0 : _a.cursorType) === XMLCircularGaugeCursor.Triangle ?
                            'M 70 31 m 0 -11 l -9 0 l 9 -11 l 9 11 z' :
                            'M 70 70 m 0 -6 l -1 0 l 0 -38 l -4 -6 l 5 -11 l 5 11 l -4 6 l 0 38 l -1 0 z', fill: "white", stroke: "black", "stroke-width": ".4px" }))),
            FSComponent.buildComponent("div", { class: "gauge_title" },
                FSComponent.buildComponent("div", { class: "gauge_text_block", ref: this.titleRef }, this.props.title)),
            FSComponent.buildComponent("div", { class: "gauge_units" },
                FSComponent.buildComponent("div", { class: "gauge_text_block", ref: this.unitsRef }, this.props.unit)),
            FSComponent.buildComponent("div", { class: "gauge_minimum", ref: this.startRef }),
            FSComponent.buildComponent("div", { class: "gauge_value", ref: this.valueRef }),
            FSComponent.buildComponent("div", { class: "gauge_maximum", ref: this.endRef })));
    }
}
