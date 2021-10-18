import { ComputedSubject, DisplayComponent, FSComponent, MathUtils } from 'msfssdk';
import { BaseGauge } from './BaseGauge';
import './Gauge.css';
/**
 * Logic for a single engine cylinder with temp randomization.
 *
 * Ideally, this would also have some fancy code in it to handle trending, so
 * that our simulated random temperatures didn't all rise and fall at the same
 * time, but it's hard to do that in this model since we only get the value
 * updates when they actually change; properly implementing delays would need
 * to have a more real-time view with hooks into the update loop and us
 * actually publishing new events when temps change.
 *
 * For now, the apparent "pulsing" caused by the blocks in the temp gauge bars
 * being "broken" at different times gives a pretty good visual effect, so
 * it doesn't feel necessary atm.  Would be cool in the future, though.
 * At that point, we could also have one class that controls both CGT and EGT.
 */
class Cylinder {
    /**
     * Create a cylinder.
     * @param min The minimum temp adjustment multiplier.
     * @param max The maximum temp adjustment multiplier.
     */
    constructor(min, max) {
        this._lastReading = 0;
        this._factor = Math.random() * (max - min) + min;
    }
    /**
     * Set a new target reading and get the adjusted one.
     * @param target The target temperature.
     * @returns An adjusted temperature.
     */
    setTarget(target) {
        this._lastReading = Math.round(target * this.factor);
        return this._lastReading;
    }
    /**
     * Get the base adjustment factor.
     * @returns The adjustment factor as a float.
     */
    get factor() {
        return this._factor;
    }
    /**
     * Get the last adjusted reading.
     * @returns Guess.
     */
    get lastReading() {
        return this._lastReading;
    }
}
/**
 * The Cylinder Temp Gauge component.
 *
 * Refactor suggestion:  I would like to see this component broken up so that each
 * cylinder has its own component, and the gauge itself just holds and manages
 * those.  Unfortunately, due to the iterative way in which the layout was created
 * and animated, the mask and peak elements are not in the same container as the
 * actual temperature bars, which means they can't be cleanly broken out
 * individually.  It's not worth the time now to fix that, but an ambitious soul
 * looking for something to optimize might want to think about it.
 */
export class CylinderSet extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.container = FSComponent.createRef();
        this.maskContainer = FSComponent.createRef();
        this.peakContainer = FSComponent.createRef();
        this.columnMap = new Array();
        this.minimum = 0;
        this.maximum = 0;
        this.numColumns = 0;
        this.numRows = 0;
        this.redLine = FSComponent.createRef();
        this.leanAssist = false;
        this.selectedCyl = 0;
        this.tempOrder = new Array();
        this.leaningPeak = 0;
        this.leaningPriorTemp = 0;
        /**
         * Cycling through the cylinders
         * @param state Cylinder select state
         */
        this.changeCylSlct = (state) => {
            if (state && !this.leanAssist) {
                this.setSelectedCylinder((this.selectedCyl + 1) % this.numColumns);
            }
        };
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        var _a, _b, _c;
        if (!(this.props.numColumns && this.props.numRows && this.props.logicHost)) {
            return;
        }
        else {
            this.numRows = this.props.numRows.getValueAsNumber();
            this.numColumns = this.props.numColumns.getValueAsNumber();
        }
        if (this.props.value) {
            (_a = this.props.logicHost) === null || _a === void 0 ? void 0 : _a.addLogicAsNumber(this.props.value, (val) => { this.updateValue(val); }, 0);
        }
        if (this.props.minimum) {
            this.minimum = this.props.logicHost.addLogicAsNumber(this.props.minimum, (val) => { this.minimum = val; }, 0);
        }
        if (this.props.maximum) {
            this.maximum = this.props.logicHost.addLogicAsNumber(this.props.maximum, (val) => { this.maximum = val; }, 0);
        }
        this.tempOrder = this.getSafeTempOrder();
        const cylinders = new Array();
        const adjFactor = ((this.maximum - this.minimum) * 0.075) / this.maximum;
        for (let i = 0; i < this.numColumns; i++) {
            cylinders.push(new Cylinder(1 - adjFactor, 1 + adjFactor));
        }
        cylinders.sort((a, b) => b.factor - a.factor);
        for (let i = 0; i < this.numColumns; i++) {
            const cells = new Array();
            const colRef = FSComponent.createRef();
            const maskRef = FSComponent.createRef();
            const peakRef = FSComponent.createRef();
            const numRef = FSComponent.createRef();
            FSComponent.render(FSComponent.buildComponent("div", { class: "cyl-column", ref: colRef }, " "), this.container.instance);
            for (let j = 0; j <= this.numRows; j++) {
                const rowRef = FSComponent.createRef();
                cells[j] = rowRef;
                if (j == 0) {
                    FSComponent.render(FSComponent.buildComponent("div", { ref: rowRef },
                        FSComponent.buildComponent("span", { ref: numRef, class: 'cyl-number' }, (i + 1).toString())), colRef.instance);
                }
                else {
                    FSComponent.render(FSComponent.buildComponent("div", { class: "temp-unit", ref: rowRef }, " "), colRef.instance); // Space is needed to render without div wrapper so flex-grow works.
                }
            }
            FSComponent.render(FSComponent.buildComponent("div", { class: "temp-unit-mask-container", ref: maskRef },
                " ",
                FSComponent.buildComponent("div", { class: "temp-unit-mask" }),
                " "), this.maskContainer.instance);
            FSComponent.render(FSComponent.buildComponent("div", { class: "temp-unit-mask-container" },
                FSComponent.buildComponent("div", { class: "temp-unit-peak", ref: peakRef }),
                " "), this.peakContainer.instance);
            this.columnMap[i] = { ref: colRef, cells: cells, mask: maskRef, peak: peakRef, num: numRef, cylinder: cylinders[this.tempOrder.indexOf(i + 1)] };
        }
        if (!((_b = this.props.style) === null || _b === void 0 ? void 0 : _b.redline)) {
            this.redLine.instance.style.display = 'none';
        }
        else {
            this.redLine.instance.style.display = '';
            for (const column of this.columnMap) {
                column.peak.instance.style.display = 'none';
            }
        }
        for (const column of this.columnMap) {
            column.peak.instance.style.display = 'none';
        }
        const sub = (_c = this.props.bus) === null || _c === void 0 ? void 0 : _c.getSubscriber();
        if (sub) {
            sub.on('eis_lean_assist').handle(state => {
                var _a;
                this.leanAssist = state;
                if (state) {
                    this.setSelectedCylinder(this.getHottestCylinder());
                }
                else {
                    this.leaningPeak = 0;
                    this.leaningPriorTemp = 0;
                    (_a = this.props.peakDeltaSubject) === null || _a === void 0 ? void 0 : _a.set(0);
                    for (const column of this.columnMap) {
                        column.peak.instance.style.display = 'none';
                    }
                }
            });
            sub.on('eis_cyl_slct').handle(this.changeCylSlct);
        }
    }
    /**
     * Turn our temp order prop into a safe list to use.
     * @returns An array of cylinder numbers matching our cylinder count.
     */
    getSafeTempOrder() {
        const tempOrder = new Array();
        if (this.props.tempOrder) {
            for (const num of this.props.tempOrder) {
                if (num > 0 && num <= this.numColumns && tempOrder.indexOf(num) == -1) {
                    tempOrder.push(num);
                }
            }
        }
        // Any columns not specified tack on the end.
        for (let i = 1; i <= this.numColumns; i++) {
            if (tempOrder.indexOf(i) == -1) {
                tempOrder.push(i);
            }
        }
        return tempOrder;
    }
    /**
     * Get the hottest cylinder.
     * @returns The hottest cylinder's index.
     */
    getHottestCylinder() {
        // If we start changing which cylinder may be hottest, this can get fancier.
        // Right now, we just pick the first cylinder in the temp order, and this
        // function exists for easy future enhancement.
        return this.tempOrder[0] - 1;
    }
    /**
     * Set the selected cylinder.
     * @param num The index of the cylinder to select.
     */
    setSelectedCylinder(num) {
        var _a;
        this.columnMap[this.selectedCyl].num.instance.className = 'cyl-number';
        this.columnMap[num].num.instance.className = 'cyl-number-highlight';
        this.selectedCyl = num;
        (_a = this.props.peakTempSubject) === null || _a === void 0 ? void 0 : _a.set(this.columnMap[num].cylinder.lastReading);
    }
    /**
     * Update the value of the gauge.
     * @param value The new value.
     */
    updateValue(value) {
        var _a, _b, _c;
        if (this.leanAssist && ((_a = this.props.style) === null || _a === void 0 ? void 0 : _a.peakTemps)) {
            if (this.leaningPeak == 0) {
                if (this.leaningPriorTemp > value) {
                    this.leaningPeak = this.leaningPriorTemp;
                }
                else {
                    this.leaningPriorTemp = value;
                }
            }
            else {
                (_b = this.props.peakDeltaSubject) === null || _b === void 0 ? void 0 : _b.set(value - this.leaningPeak);
            }
        }
        for (let i = 0; i < this.numColumns; i++) {
            const column = this.columnMap[i];
            const newTemp = MathUtils.clamp(column.cylinder.setTarget(value), this.minimum, this.maximum);
            const translation = (this.maximum - newTemp) * (66 / (this.maximum - this.minimum));
            column.mask.instance.style.transform = `translate3d(0px, ${translation}px, 0px)`;
            if (this.leaningPeak && column.peak.instance.style.display !== '') {
                column.peak.instance.style.display = '';
            }
            else if (newTemp >= this.leaningPeak) {
                column.peak.instance.style.transform = `translate3d(0px, ${translation}px, 0px)`;
            }
            if (i == this.selectedCyl) {
                // console.log(`selected cylinder: ${i}`);
                // console.log(`last reading: ${column.cylinder.lastReading}`);
                column.num.instance.className = 'cyl-number-highlight';
                (_c = this.props.peakTempSubject) === null || _c === void 0 ? void 0 : _c.set(column.cylinder.lastReading);
            }
            else {
                column.num.instance.className = 'cyl-number';
            }
        }
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "cylinderset" },
            FSComponent.buildComponent("div", { class: "temp-array", ref: this.container },
                FSComponent.buildComponent("hr", { class: "cht-red-temp-line", ref: this.redLine })),
            FSComponent.buildComponent("div", { class: "mask-container" },
                FSComponent.buildComponent("div", { class: "temp-array", ref: this.maskContainer })),
            FSComponent.buildComponent("div", { class: "mask-container" },
                FSComponent.buildComponent("div", { class: "temp-array", ref: this.peakContainer }))));
    }
}
/**
 * A temp gauge.
 */
export class CylinderTempGauge extends BaseGauge {
    constructor() {
        var _a;
        super(...arguments);
        this.peakRef = FSComponent.createRef();
        this.quantum = ((_a = this.props.style) === null || _a === void 0 ? void 0 : _a.textIncrement) !== undefined ? this.props.style.textIncrement : 1;
        this.leanAssist = false;
        this.peakTemp = ComputedSubject.create(0, (v) => {
            return '' + Math.round(v / this.quantum) * this.quantum;
        });
        this.peakDelta = ComputedSubject.create(0, (v) => {
            if (v == 0 && !this.leanAssist) {
                return `_ _ _ _ _ ${this.props.unit}`;
            }
            else {
                return `${v.toFixed(0)} ${this.props.unit}`;
            }
        });
    }
    /**
     * Initialize the rendered gauge.
     */
    initGauge() {
        var _a;
        this.peakRef.instance.style.display = 'none';
        const sub = (_a = this.props.bus) === null || _a === void 0 ? void 0 : _a.getSubscriber();
        if (sub) {
            sub.on('eis_lean_assist').handle(state => {
                var _a;
                state && ((_a = this.props.style) === null || _a === void 0 ? void 0 : _a.peakTemps) ? this.peakRef.instance.style.display = '' : this.peakRef.instance.style.display = 'none';
                this.leanAssist = state;
            });
        }
    }
    /**
     * Render the gauge.
     * @returns a VNode
     */
    renderGauge() {
        return (FSComponent.buildComponent("div", { class: "chtegt-container" },
            FSComponent.buildComponent(CylinderSet, { numRows: this.props.numRows, numColumns: this.props.numColumns, minimum: this.props.minimum, maximum: this.props.maximum, value: this.props.value1, bus: this.props.bus, logicHost: this.props.logicHost, peakTempSubject: this.peakTemp, peakDeltaSubject: this.peakDelta, tempOrder: this.props.tempOrder, style: this.props.style }),
            FSComponent.buildComponent("div", { class: "temp-value" },
                FSComponent.buildComponent("div", null,
                    this.props.title,
                    " ",
                    this.props.unit),
                FSComponent.buildComponent("div", { class: "size20" }, this.peakTemp)),
            FSComponent.buildComponent("div", { class: "peak-egt", ref: this.peakRef },
                FSComponent.buildComponent("div", { class: "peak-label" }, "\u0394PEAK"),
                FSComponent.buildComponent("div", { class: "peak-temp" }, this.peakDelta))));
    }
}
/**
 * A temp gauge.
 */
export class CylinderTempGaugeTwin extends BaseGauge {
    constructor() {
        var _a;
        super(...arguments);
        this.peakRef = FSComponent.createRef();
        this.quantum = ((_a = this.props.style) === null || _a === void 0 ? void 0 : _a.textIncrement) !== undefined ? this.props.style.textIncrement : 1;
        this.leanAssist = false;
        this.peakTemp1 = ComputedSubject.create(0, (v) => {
            return '' + Math.round(v / this.quantum) * this.quantum;
        });
        this.peakDelta1 = ComputedSubject.create(0, (v) => {
            if (v == 0 && !this.leanAssist) {
                return '_ _ _';
            }
            else {
                return `${v.toFixed(0)}`;
            }
        });
        this.peakTemp2 = ComputedSubject.create(0, (v) => {
            return '' + Math.round(v / this.quantum) * this.quantum;
        });
        this.peakDelta2 = ComputedSubject.create(0, (v) => {
            if (v == 0 && !this.leanAssist) {
                return '_ _ _';
            }
            else {
                return `${v.toFixed(0)}`;
            }
        });
    }
    /**
     * Initialize the rendered gauge.
     */
    initGauge() {
        var _a;
        this.peakRef.instance.style.visibility = 'hidden';
        const sub = (_a = this.props.bus) === null || _a === void 0 ? void 0 : _a.getSubscriber();
        if (sub) {
            sub.on('eis_lean_assist').handle(state => {
                var _a;
                state && ((_a = this.props.style) === null || _a === void 0 ? void 0 : _a.peakTemps) ? this.peakRef.instance.style.visibility = 'visible' : this.peakRef.instance.style.visibility = 'hidden';
                this.leanAssist = state;
            });
        }
    }
    /**
     * Render the gauge.
     * @returns a VNode
     */
    renderGauge() {
        return (FSComponent.buildComponent("div", { class: "chtegt-container" },
            FSComponent.buildComponent("div", { ref: this.peakRef },
                FSComponent.buildComponent("div", { class: "twin-temp-title" },
                    "\u0394PEAK ",
                    this.props.unit),
                FSComponent.buildComponent("div", { class: "twin-temp-values" },
                    FSComponent.buildComponent("div", null, this.peakDelta1),
                    FSComponent.buildComponent("div", null, this.peakDelta2))),
            FSComponent.buildComponent("div", { class: "column-group" },
                FSComponent.buildComponent(CylinderSet, { numRows: this.props.numRows, numColumns: this.props.numColumns, minimum: this.props.minimum, maximum: this.props.maximum, value: this.props.value1, bus: this.props.bus, logicHost: this.props.logicHost, peakTempSubject: this.peakTemp1, peakDeltaSubject: this.peakDelta1, tempOrder: this.props.tempOrder, style: this.props.style }),
                FSComponent.buildComponent(CylinderSet, { numRows: this.props.numRows, numColumns: this.props.numColumns, minimum: this.props.minimum, maximum: this.props.maximum, value: this.props.value2, bus: this.props.bus, logicHost: this.props.logicHost, peakTempSubject: this.peakTemp2, peakDeltaSubject: this.peakDelta2, tempOrder: this.props.tempOrder, style: this.props.style })),
            FSComponent.buildComponent("div", { class: "twin-temp-title" },
                this.props.title,
                " ",
                this.props.unit),
            FSComponent.buildComponent("div", { class: "twin-temp-values" },
                FSComponent.buildComponent("div", null, this.peakTemp1),
                FSComponent.buildComponent("div", null, this.peakTemp2))));
    }
}
