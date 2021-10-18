import { FSComponent, DisplayComponent } from 'msfssdk';
import { BaseGauge } from './BaseGauge';
import './Gauge.css';
/** The dynamic color bands for a gauge. */
class HorizontalColorZone extends DisplayComponent {
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
        // we shorten the maximum length of the bar by a couple pixels so colors don't cover the end ticks
        const startX = 12 + (((this.zoneMin - this.gaugeMin) / (this.gaugeMax - this.gaugeMin)) * 123);
        const width = ((this.zoneMax - this.zoneMin) / (this.gaugeMax - this.gaugeMin)) * 123;
        this.theRect.instance.setAttribute('x', `${startX}`);
        this.theRect.instance.setAttribute('width', `${width}`);
    }
    /**
     * Render a color zone.
     * @returns A VNode of the zone.
     */
    render() {
        return FSComponent.buildComponent("rect", { ref: this.theRect, x: 0, y: this.props.yPos, height: this.props.height, width: 0, fill: "white" });
    }
}
/** A graduated horizontal bar. */
// The type spec on this one is really ugly and could probably be improved with better
// use of generics.  I'm too tired to work on that now.
class GraduatedBar extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.tickRef = FSComponent.createRef();
        this.labelRef = FSComponent.createRef();
        this.gaugeMin = 0;
        this.gaugeMax = 0;
        this.tickRise = 35 - this.props.tickRise;
        this.tickFall = 35 + this.props.tickFall;
    }
    /** Do stuff after rendering. */
    onAfterRender() {
        var _a, _b;
        if (this.props.minimum) {
            this.gaugeMin = (_a = this.props.logicHost) === null || _a === void 0 ? void 0 : _a.addLogicAsNumber(this.props.minimum, (min) => { this.gaugeMin = min; }, 0);
        }
        if (this.props.maximum) {
            this.gaugeMax = (_b = this.props.logicHost) === null || _b === void 0 ? void 0 : _b.addLogicAsNumber(this.props.maximum, (max) => { this.gaugeMax = max; }, 0);
        }
        // Currently, the graduations are created as a static element, even though
        // the min and max could techincally change since they are logic elements.
        // This matches the default, stock functionality, but it would be cool to
        // enhance this so that you could fully redraw the entire gauge on demand.
        if (this.props.graduationLength !== undefined) {
            const graduations = Math.trunc((this.gaugeMax - this.gaugeMin) / this.props.graduationLength) + 1;
            const tickSpacing = 123 / (graduations - 1);
            for (let i = 0; i < graduations; i++) {
                const xPos = 11 + tickSpacing * i;
                // Only draw a tick if we're not at the start or end.
                if (i > 0 && i < graduations - 1) {
                    // TODO Add minor-tick support for our enhanced stuff.
                    FSComponent.render(FSComponent.buildComponent("g", null,
                        FSComponent.buildComponent("line", { x1: xPos, y1: this.tickRise, x2: xPos, y2: this.tickFall, stroke: "white", "stroke-width": "1px", "shape-rendering": "crispEdges" })), this.tickRef.instance);
                }
                let gradLabel = undefined;
                // TODO Streamline this logic a little.
                if (this.props.graduationHasText) {
                    gradLabel = `${this.props.graduationLength * i}`;
                }
                if (i == 0) {
                    if (this.props.beginText !== undefined) {
                        gradLabel = this.props.beginText;
                    }
                    else {
                        gradLabel = `${this.gaugeMin}`;
                    }
                }
                else if (i == graduations - 1) {
                    if (this.props.endText !== undefined) {
                        gradLabel = this.props.endText;
                    }
                    else {
                        gradLabel = `${this.gaugeMax}`;
                    }
                }
                if (gradLabel !== undefined) {
                    FSComponent.render(FSComponent.buildComponent("g", null,
                        FSComponent.buildComponent("text", { x: xPos, y: 55, fill: "white", "text-anchor": "middle", "font-size": '12' }, gradLabel)), this.labelRef.instance);
                }
            }
        }
    }
    /**
     * Render the bar.
     * @returns A VNode.
     */
    render() {
        return FSComponent.buildComponent("g", { id: "graduatedBar" },
            FSComponent.buildComponent("g", { id: "staticLineElements" },
                FSComponent.buildComponent("line", { x1: 11, y1: this.tickRise - 5, x2: 11, y2: this.tickFall, stroke: "white", "stroke-width": "1.2px" }),
                FSComponent.buildComponent("line", { x1: 134, y1: this.tickRise - 5, x2: 134, y2: this.tickFall, stroke: "white", "stroke-width": "1.2px" })),
            FSComponent.buildComponent("g", { id: "tickmarks", ref: this.tickRef }),
            FSComponent.buildComponent("g", { id: "ticklabels", ref: this.labelRef }));
    }
}
//
// Single and double sided pointers.
//
/** A single-sided pointer. */
class SinglePointer extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.ptrDiv = FSComponent.createRef();
        this.ptrPath = FSComponent.createRef();
        this.ptrLabel = FSComponent.createRef();
        this.minimum = 0;
        this.maximum = 0;
        this.value1 = 0;
    }
    /** Do stuff after rendering. */
    onAfterRender() {
        var _a, _b, _c, _d;
        if (this.props.style !== undefined) {
            switch (this.props.style.pointerStyle) {
                case 'arrow':
                    // TODO Adapt this better from the double sided gauge.
                    this.ptrPath.instance.setAttribute('d', 'M 0 0 m 15 35 l 12 -15 l -24 0 z');
                    break;
                case 'standard':
                default:
                    this.ptrPath.instance.setAttribute('d', 'M 0 0 m 15 35 l 5 -5 l 0 -10 l -10 0 l 0 10 l 5 5 z');
                    break;
            }
        }
        this.ptrLabel.instance.textContent = this.props.cursorText1 !== undefined ? this.props.cursorText1 : '';
        if (this.props.minimum !== undefined) {
            this.minimum = (_a = this.props.logicHost) === null || _a === void 0 ? void 0 : _a.addLogicAsNumber(this.props.minimum, (min) => {
                this.minimum = min;
                this.updatePtr(this.value1);
            }, 0);
        }
        if (this.props.maximum !== undefined) {
            this.maximum = (_b = this.props.logicHost) === null || _b === void 0 ? void 0 : _b.addLogicAsNumber(this.props.maximum, (max) => {
                this.maximum = max;
                this.updatePtr(this.value1);
            }, 0);
        }
        if (this.props.value1 !== undefined) {
            this.value1 = (_c = this.props.logicHost) === null || _c === void 0 ? void 0 : _c.addLogicAsNumber(this.props.value1, (val) => {
                this.value1 = val;
                this.updatePtr(this.value1);
            }, 2);
        }
        if (this.props.redBlink) {
            (_d = this.props.logicHost) === null || _d === void 0 ? void 0 : _d.addLogicAsNumber(this.props.redBlink, (value) => {
                this.setAlertState(value);
            }, 0);
        }
    }
    /**
     * Update a needle value.
     * @param value The new value to set.
     */
    updatePtr(value) {
        value = Utils.Clamp(value, this.minimum, this.maximum);
        const translation = (value - this.minimum) / (this.maximum - this.minimum) * 123;
        this.ptrDiv.instance.style.transform = `translate3d(${translation}px, 0px, 0px)`;
    }
    /**
     * Handle changes in the alert state.
     * @param alerting True if alerting.
     */
    setAlertState(alerting) {
        if (alerting !== 0) {
            this.ptrPath.instance.setAttribute('fill', 'red');
        }
        else {
            this.ptrPath.instance.setAttribute('fill', 'white');
        }
    }
    /**
     * Render the pointer.
     * @returns A VNode
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "gauge_pointer", ref: this.ptrDiv },
            FSComponent.buildComponent("svg", null,
                FSComponent.buildComponent("path", { d: "", fill: "white", stroke: "black", "stroke-width": ".5px", ref: this.ptrPath }),
                FSComponent.buildComponent("text", { x: "12", y: "30", class: "gauge_pointer_text", ref: this.ptrLabel }))));
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
        if (this.props.style !== undefined) {
            switch (this.props.style.pointerStyle) {
                case 'arrow':
                    this.ptr1Path.instance.setAttribute('d', 'M 0 0 m 15 35 l 12 -15 l -24 0 z');
                    this.ptr2Path.instance.setAttribute('d', 'M 0 0 m 15 35 l 12 15 l -24 0 z');
                    break;
                case 'standard':
                default:
                    this.ptr1Path.instance.setAttribute('d', 'M 0 0 m 15 35 l 5 -5 l 0 -10 l -10 0 l 0 10 l 5 5 z');
                    this.ptr2Path.instance.setAttribute('d', 'M 0 0 m 15 35 l 5 5 l 0 10 l -10 0 l 0 -10 l 5 -5 z');
                    break;
            }
        }
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
        const translation = (value - this.minimum) / (this.maximum - this.minimum) * 123;
        ptrRef.instance.style.transform = `translate3d(${translation}px, 0px, 0px)`;
    }
    /**
     * Render the pointers.
     * @returns A VNode
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "gauge_pointers" },
            FSComponent.buildComponent("div", { class: "gauge_pointer_top", ref: this.ptr1Div },
                FSComponent.buildComponent("svg", null,
                    FSComponent.buildComponent("path", { d: "", fill: "white", stroke: "black", "stroke-width": ".5px", ref: this.ptr1Path }),
                    FSComponent.buildComponent("text", { x: "12", y: "30", class: "gauge_pointer_text", ref: this.ptr1Label }))),
            FSComponent.buildComponent("div", { class: "gauge_pointer_bottom", ref: this.ptr2Div },
                FSComponent.buildComponent("svg", null,
                    FSComponent.buildComponent("path", { d: "", fill: "white", stroke: "black", "stroke-width": ".5px", ref: this.ptr2Path }),
                    FSComponent.buildComponent("text", { x: "12", y: "48", class: "gauge_pointer_text", ref: this.ptr2Label })))));
    }
}
//
// I've reduced a lot of redundancy here, but there's still some repetition
// in the two class definitions below.   A future enhancment might be to
// streamline that a little more.
//
/** A horizontal bar gauge with a single set of values. */
export class XMLHorizontalGauge extends BaseGauge {
    constructor() {
        super(...arguments);
        this.svgRef = FSComponent.createRef();
        this.titleRef = FSComponent.createRef();
        this.titleBgRef = FSComponent.createRef();
        this.zoneGroupRef = FSComponent.createRef();
    }
    /**
     * Initialize the rendered gauge.
     */
    initGauge() {
        var _a;
        if (this.props.title) {
            this.titleRef.instance.textContent = this.props.title;
        }
        if (this.props.unit) {
            this.titleRef.instance.textContent += ` ${this.props.unit}`;
        }
        if (this.props.colorZones) {
            for (let i = 0; i < this.props.colorZones.length; i++) {
                FSComponent.render(FSComponent.buildComponent(HorizontalColorZone, { logicHost: this.props.logicHost, height: 6, yPos: 27, values: this.props.colorZones[i], gaugeMin: this.props.minimum, gaugeMax: this.props.maximum }), this.zoneGroupRef.instance);
            }
        }
        if (this.props.redBlink) {
            (_a = this.props.logicHost) === null || _a === void 0 ? void 0 : _a.addLogicAsNumber(this.props.redBlink, (value) => {
                this.setAlertState(value);
            }, 0);
        }
        const bbox = this.titleRef.instance.getBBox();
        this.titleBgRef.instance.setAttribute('x', `${bbox.x - 1}`);
        this.titleBgRef.instance.setAttribute('y', `${bbox.y - 1}`);
        this.titleBgRef.instance.setAttribute('width', `${bbox.width + 2}`);
        this.titleBgRef.instance.setAttribute('height', `${bbox.height + 2}`);
    }
    /**
     * Handle changes in the alert state.
     * @param alerting True if alerting.
     */
    setAlertState(alerting) {
        if (alerting !== 0) {
            if (this.titleBgRef.instance.getBBox().x <= 0) {
                // I initially did this in initGauge, but would end up getting 0,0 as my origin
                // at times, presumbaly because the text element hadn't yet been rendered when
                // we got the data, so I moved it down here.   Then, for some reason, it started
                // being 0,0 even more consistently.  For now we do this both in the init and
                // here as a backstop.
                // TODO Figure out why this is happening and remove this redundancy.
                const bbox = this.titleRef.instance.getBBox();
                this.titleBgRef.instance.setAttribute('x', `${bbox.x - 1}`);
                this.titleBgRef.instance.setAttribute('y', `${bbox.y - 1}`);
                this.titleBgRef.instance.setAttribute('width', `${bbox.width + 2}`);
                this.titleBgRef.instance.setAttribute('height', `${bbox.height + 2}`);
            }
            this.titleBgRef.instance.setAttribute('fill-opacity', '100');
            this.titleBgRef.instance.style.animation = 'AlertBlinkBackground 1s infinite';
            this.titleRef.instance.style.animation = 'AlertBlink 1s infinite';
        }
        else {
            this.titleBgRef.instance.setAttribute('fill-opacity', '0');
            this.titleBgRef.instance.style.animation = '';
            this.titleRef.instance.style.animation = '';
        }
    }
    /**
     * Render a horizontal bar gauge
     * @returns A VNode
     */
    renderGauge() {
        return (FSComponent.buildComponent("div", { class: "single_horiz_container" },
            FSComponent.buildComponent("svg", { viewBox: "0 0 148 40", ref: this.svgRef },
                FSComponent.buildComponent("rect", { x: 74, y: 15, width: 0, height: 0, "fill-opacity": 0, ref: this.titleBgRef }),
                FSComponent.buildComponent("text", { x: 74, y: 15, fill: "white", "text-anchor": "middle", "font-size": "15", ref: this.titleRef }),
                FSComponent.buildComponent("line", { x1: 11, y1: 35, x2: 134, y2: 35, stroke: "white", "stroke-width": "1.2px" }),
                FSComponent.buildComponent("line", { x1: 11, y1: 34, x2: 134, y2: 34, stroke: "darkgrey", "stroke-width": ".5px" }),
                FSComponent.buildComponent("g", { id: "colorZones", ref: this.zoneGroupRef }),
                FSComponent.buildComponent(GraduatedBar, Object.assign({}, this.props, { tickRise: 11, tickFall: 0 })),
                ")"),
            FSComponent.buildComponent(SinglePointer, Object.assign({}, this.props))));
    }
}
/** A horizontal bar gauge with two sets of values. */
export class XMLDoubleHorizontalGauge extends BaseGauge {
    constructor() {
        super(...arguments);
        this.svgRef = FSComponent.createRef();
        this.titleRef = FSComponent.createRef();
        this.zoneGroupRef = FSComponent.createRef();
    }
    /**
     * Initialize the rendered gauge.
     */
    initGauge() {
        if (this.props.title) {
            this.titleRef.instance.textContent = this.props.title;
        }
        if (this.props.unit) {
            this.titleRef.instance.textContent += ` ${this.props.unit}`;
        }
        if (this.props.colorZones) {
            for (let i = 0; i < this.props.colorZones.length; i++) {
                FSComponent.render(FSComponent.buildComponent(HorizontalColorZone, { logicHost: this.props.logicHost, height: 6, yPos: 32, values: this.props.colorZones[i], gaugeMin: this.props.minimum, gaugeMax: this.props.maximum }), this.zoneGroupRef.instance);
            }
        }
    }
    /**
     * Render a horizontal bar gauge
     * @returns A VNode
     */
    renderGauge() {
        return (FSComponent.buildComponent("div", { class: "double_horiz_container" },
            FSComponent.buildComponent("svg", { viewBox: "0 0 148 55", ref: this.svgRef },
                FSComponent.buildComponent("text", { x: 74, y: 15, fill: "white", "text-anchor": "middle", "font-size": "15", ref: this.titleRef }),
                FSComponent.buildComponent("line", { x1: 11, y1: 35, x2: 134, y2: 35, stroke: "white", "stroke-width": "1.2px" }),
                FSComponent.buildComponent("g", { id: "colorZones", ref: this.zoneGroupRef }),
                FSComponent.buildComponent(GraduatedBar, Object.assign({}, this.props, { tickRise: 6.5, tickFall: 6.5 }))),
            FSComponent.buildComponent(DoublePointer, Object.assign({}, this.props))));
    }
}
