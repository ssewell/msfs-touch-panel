import { FSComponent, DisplayComponent, Subject, MathUtils } from 'msfssdk';
import { APLockType } from 'msfssdk/instruments';
import './AirspeedIndicator.css';
/**
 * A Vspeed type.
 */
export var VSpeedType;
(function (VSpeedType) {
    VSpeedType[VSpeedType["Vx"] = 0] = "Vx";
    VSpeedType[VSpeedType["Vy"] = 1] = "Vy";
    VSpeedType[VSpeedType["Vglide"] = 2] = "Vglide";
    VSpeedType[VSpeedType["Vapp"] = 3] = "Vapp";
    VSpeedType[VSpeedType["Vr"] = 4] = "Vr";
})(VSpeedType || (VSpeedType = {}));
var SpeedWarning;
(function (SpeedWarning) {
    SpeedWarning[SpeedWarning["None"] = 0] = "None";
    SpeedWarning[SpeedWarning["Caution"] = 1] = "Caution";
    SpeedWarning[SpeedWarning["Overspeed"] = 2] = "Overspeed";
})(SpeedWarning || (SpeedWarning = {}));
/**
 * A Vspeed Object.
 */
export class VSpeed {
    /**
     * Creates an instance of a VSpeed.
     * @param type is the type of vspeed
     * @param value is the value of a vspeed in knots
     * @param modified is whether the pilot has modified this vspeed
     * @param display is whether this vspeed should be displayed
     */
    constructor(type, value = 0, modified = false, display = undefined) {
        this.modified = Subject.create(false);
        this.type = type;
        this.value = value;
        this.modified.set(modified);
        this.display = display;
    }
}
/**
 * The PFD airspeed indicator with speed tape.
 */
export class AirspeedIndicator extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.airspeedHundredsDataElement = FSComponent.createRef();
        this.airspeedTensDataElement = FSComponent.createRef();
        this.airspeedOnesDataElement = FSComponent.createRef();
        this.airspeedTapeTickElement = FSComponent.createRef();
        this.airspeedBoxElement = FSComponent.createRef();
        this.airspeedTrendVector = FSComponent.createRef();
        this.currentDrawnIas = 0;
        this.ias = 0;
        this.currentTrend = 0;
        this.iasScrollerValues = [];
        this.tasElement = FSComponent.createRef();
        this.speedRangeValues = {
            barber: FSComponent.createRef(),
            yellow: FSComponent.createRef(),
            green: FSComponent.createRef(),
            greenWhite: FSComponent.createRef(),
            white: FSComponent.createRef(),
            red: FSComponent.createRef()
        };
        this.vxSpeedRef = FSComponent.createRef();
        this.vySpeedRef = FSComponent.createRef();
        this.vgSpeedRef = FSComponent.createRef();
        this.vrSpeedRef = FSComponent.createRef();
        this.vappSpeedRef = FSComponent.createRef();
        this.vSpeedBackgroundRef = FSComponent.createRef();
        this.vSpeedContainerRef = FSComponent.createRef();
        this.flcBugRef = FSComponent.createRef();
        this.flcBoxRef = FSComponent.createRef();
        this.flcSubject = Subject.create('- - - ');
        this.stallDirty = Simplane.getDesignSpeeds().VS0;
        this.stallClean = Simplane.getDesignSpeeds().VS1;
        this.flapsExtend = Simplane.getDesignSpeeds().VFe;
        this.yellowSpeed = Simplane.getDesignSpeeds().VNo;
        this.barberSpeed = Simplane.getDesignSpeeds().VNe;
        this.flcSpeed = 0;
        this.vSpeeds = [
            { type: VSpeedType.Vx, value: Simplane.getDesignSpeeds().Vx, modified: Subject.create(false), display: true },
            { type: VSpeedType.Vy, value: Simplane.getDesignSpeeds().Vy, modified: Subject.create(false), display: true },
            { type: VSpeedType.Vr, value: Simplane.getDesignSpeeds().Vr, modified: Subject.create(false), display: true },
            { type: VSpeedType.Vglide, value: Simplane.getDesignSpeeds().BestGlide, modified: Subject.create(false), display: true },
            { type: VSpeedType.Vapp, value: Simplane.getDesignSpeeds().Vapp, modified: Subject.create(false), display: false }
        ];
        this.vSpeedSubjects = [
            Subject.create('0'),
            Subject.create('0'),
            Subject.create('0'),
            Subject.create('0'),
            Subject.create('0')
        ];
        this.speedWarningSubject = Subject.create(SpeedWarning.None);
        /**
         * A method called when a flc speed value changes.
         * @param speed The flc ias speed value.
         */
        this.setFlcBug = (speed) => {
            this.flcSpeed = Math.round(speed);
            this.flcSubject.set(`${this.flcSpeed}`);
            this.updateFlcBug();
        };
        /**
         * A method called to update the location of the FLC Bug on the tape.
         * @param mode The enum of the ap mode
         */
        this.toggleFlcElements = (mode) => {
            switch (mode) {
                case APLockType.Flc:
                    this.flcBugRef.instance.style.display = '';
                    this.flcBoxRef.instance.style.display = '';
                    break;
                case APLockType.Pitch:
                case APLockType.Vs:
                case APLockType.Alt:
                case APLockType.Glideslope:
                    this.flcBugRef.instance.style.display = 'none';
                    this.flcBoxRef.instance.style.display = 'none';
                    break;
            }
        };
        /**
         * A method called when a vspeed update event from the event bus is received.
         * @param vSpeed The vSpeed object to change.
         */
        this.setVSpeed = (vSpeed) => {
            const index = this.vSpeeds.findIndex((type) => {
                if (type.type === vSpeed.type) {
                    return true;
                }
            });
            this.vSpeeds[index].value = vSpeed.value;
            this.vSpeedSubjects[index].set(`${vSpeed.value}`);
            this.updateSpeedBugs(this.ias);
        };
        /**
         * A method called when a vspeed display event from the event bus is received.
         * @param vSpeed The vSpeed object to change.
         */
        this.setVSpeedVisibility = (vSpeed) => {
            const index = this.vSpeeds.findIndex((speed) => {
                if (speed.type === vSpeed.type) {
                    return true;
                }
            });
            this.vSpeeds[index].display = vSpeed.display === undefined ? false : vSpeed.display;
            /**
             * Handle updating visibility for each element.
             * @param speed instance to update
             */
            const setVisibility = (speed) => {
                const instance = speed.type === VSpeedType.Vx ? this.vxSpeedRef.instance :
                    speed.type === VSpeedType.Vy ? this.vySpeedRef.instance :
                        speed.type === VSpeedType.Vr ? this.vrSpeedRef.instance :
                            speed.type === VSpeedType.Vglide ? this.vgSpeedRef.instance : undefined;
                // speed.type === VSpeedType.Vapp ? this.vappSpeedRef.instance : undefined;
                if (instance !== null && instance !== undefined) {
                    instance.style.display = speed.display ? '' : 'none';
                }
            };
            this.vSpeeds.forEach(setVisibility);
            this.updateSpeedBugs(this.ias);
        };
        /**
         * A callback called when the IAS updates from the event bus.
         * @param ias The current IAS value.
         */
        this.onUpdateIAS = (ias) => {
            this.updateTrendVector(ias);
            if (ias <= this.barberSpeed) {
                this.speedWarningSubject.set(this.isSpeedTrendInOverspeed(ias) ? SpeedWarning.Caution : SpeedWarning.None);
            }
            else {
                this.speedWarningSubject.set(SpeedWarning.Overspeed);
            }
            this.ias = ias;
            const ones = ias % 10;
            const tens = (ias % 100 - ones) / 10;
            const hundreds = (ias - tens * 10 - ones) / 100;
            if (this.airspeedHundredsDataElement.instance !== null) {
                let newTranslation = -300 + (hundreds * 30);
                if (tens === 9 && ones > 9) {
                    newTranslation -= ((10 - ones) * 30) - 30;
                }
                if (ias < 20) {
                    newTranslation = -420;
                }
                this.airspeedHundredsDataElement.instance.setAttribute('transform', `translate(0,${newTranslation})`);
            }
            if (this.airspeedTensDataElement.instance !== null) {
                let newTranslation = -300 + (tens * 30);
                if (ones > 9) {
                    newTranslation -= ((10 - ones) * 30) - 30;
                }
                if (ias < 20) {
                    newTranslation = -420;
                }
                this.airspeedTensDataElement.instance.setAttribute('transform', `translate(0,${newTranslation})`);
            }
            if (this.airspeedOnesDataElement.instance !== null) {
                let newTranslation = -300 + (ones * 30);
                if (ias < 20) {
                    newTranslation = -420;
                }
                this.airspeedOnesDataElement.instance.setAttribute('transform', `translate(0,${newTranslation})`);
            }
            if (this.airspeedTapeTickElement.instance !== null) {
                let newTranslation = 10 * ((ias % 10));
                if (ias < 20) {
                    newTranslation = -400;
                }
                else if (ias < 50) {
                    newTranslation = -400 + (10 * (ias - 20));
                }
                this.airspeedTapeTickElement.instance.style.transform = `translate3d(0px, ${(newTranslation - 120.6) * (446 / 800)}px, 0px)`;
            }
            if (ias >= 50 && (ias / 10 >= this.currentDrawnIas + 1 || ias / 10 < this.currentDrawnIas)) {
                this.currentDrawnIas = Math.floor(ias / 10);
                for (let i = 0; i < this.iasScrollerValues.length; i++) {
                    const scrollerValue = this.iasScrollerValues[i].instance;
                    if (scrollerValue !== null) {
                        scrollerValue.textContent = (10 * ((i - 4) + this.currentDrawnIas)).toString();
                    }
                }
                this.updateSpeedRanges(ias);
            }
            else if (ias < 50 && (ias / 10 > this.currentDrawnIas + 1 || ias / 10 < this.currentDrawnIas)) {
                this.currentDrawnIas = Math.floor(ias / 10);
                for (let i = 0; i < this.iasScrollerValues.length; i++) {
                    const scrollerValue = this.iasScrollerValues[i].instance;
                    if (scrollerValue !== null) {
                        scrollerValue.textContent = ((i + 2) * 10).toString();
                    }
                }
                this.updateSpeedRanges(ias, true);
            }
            this.updateSpeedBugs(ias);
            this.updateFlcBug();
        };
        this._lastIAS = 0;
        this._lastTime = 0;
        this._computedIASAcceleration = 0;
        /**
         * A computation of the current IAS Acceleration used for the Airspeed Trend Vector.
         * @param ias The current IAS value.
         * @returns The current IAS Acceleration.
         */
        this.computeIASAcceleration = (ias) => {
            const newIASTime = {
                ias: ias,
                t: performance.now() / 1000
            };
            if (this._lastTime == 0) {
                this._lastIAS = ias;
                this._lastTime = performance.now() / 1000;
                return 0;
            }
            let frameIASAcceleration = (newIASTime.ias - this._lastIAS) / (newIASTime.t - this._lastTime);
            frameIASAcceleration = MathUtils.clamp(frameIASAcceleration, -10, 10);
            if (isFinite(frameIASAcceleration)) {
                this._computedIASAcceleration += (frameIASAcceleration - this._computedIASAcceleration) / (50 / ((newIASTime.t - this._lastTime) / .016));
            }
            this._lastIAS = ias;
            this._lastTime = performance.now() / 1000;
            const accel = this._computedIASAcceleration * 6;
            return accel;
        };
        /**
         * A callback called when the TAS updates from the event bus.
         * @param tas The current TAS value.
         */
        this.onUpdateTAS = (tas) => {
            if (this.tasElement.instance !== null) {
                this.tasElement.instance.textContent = `${(tas)}`;
            }
        };
    }
    /**
     * Builds a numerical scroller for the airspeed window.
     * @param startYValue The starting Y value in the svg to start number at.
     * @param blankZeroValue Whether or not the 0 digit should be replaced by an empty space.
     * @returns A collection of text elements for the numerical scroller.
     */
    buildScroller(startYValue = -2, blankZeroValue = false) {
        const scroller = [];
        let yValue = startYValue;
        for (let i = 11; i > -3; i--) {
            const number = i > 9 ? i - 10 : i < 0 ? i + 10 : i;
            let numberText = number.toString();
            if (blankZeroValue && number === 0) {
                numberText = ' ';
            }
            scroller.push(FSComponent.buildComponent("text", { x: '8', y: yValue, fill: "var(--speedNumberColor)", "text-anchor": "middle", "font-size": '32' }, numberText));
            yValue += 30;
        }
        scroller.push(FSComponent.buildComponent("text", { x: '8', y: yValue + 30, fill: "var(--speedNumberColor)", "text-anchor": "middle", "font-size": '32' }, "\u2013"));
        return scroller;
    }
    /**
     * Builds the tick marks on the airspeed tape.
     * @returns A collection of tick mark line elements.
     */
    buildSpeedTapeTicks() {
        const ticks = [];
        for (let i = 1; i < 18; i++) {
            const length = i % 2 == 0 ? 15 : 30;
            const startX = 94 + (length == 30 ? 0 : 15);
            const startY = 450 - (i * 50);
            const endX = startX + length;
            const endY = startY;
            ticks.push(FSComponent.buildComponent("line", { x1: startX, y1: startY, x2: endX, y2: endY, stroke: "white", "stroke-width": "4px" }));
        }
        return ticks;
    }
    /**
     * Builds the airspeed numbers for the airspeed tape.
     * @returns A collection of airspeed number text elements.
     */
    buildSpeedTapeNumbers() {
        const text = [];
        for (let i = 1; i < 10; i++) {
            const startX = 75;
            const startY = 513 - (i * 100);
            const numberText = (10 + (i * 10)).toString();
            const textElement = FSComponent.createRef();
            text.push(FSComponent.buildComponent("text", { x: startX, y: startY, fill: "rgb(203,203,203)", "text-anchor": "end", "font-size": '44', ref: textElement }, numberText));
            this.iasScrollerValues.push(textElement);
        }
        return text;
    }
    /**
     * Builds the airspeed tape color ranges.
     * @returns A collection of color range rect elements.
     */
    buildSVGSpeedTapeRanges() {
        const rectangle = [];
        const zeroYValue = 0;
        //red band (full width 8px top left)
        const redMin = zeroYValue;
        const redMax = 400 - redMin - (10 * (this.stallDirty - 20));
        rectangle.push(FSComponent.buildComponent("rect", { ref: this.speedRangeValues.red, x: "109", y: redMax, width: "16", height: 10 * (this.stallDirty - 20), fill: "red" }));
        const whiteMin = redMax;
        const whiteMax = Math.max(-400, whiteMin - (10 * (this.flapsExtend - this.stallDirty)));
        rectangle.push(FSComponent.buildComponent("rect", { ref: this.speedRangeValues.white, x: "109", y: whiteMax, width: "16", height: whiteMin - whiteMax, fill: "white" }));
        const halfGreenMin = whiteMin - (10 * (this.stallClean - this.stallDirty));
        const halfGreenMax = whiteMax;
        rectangle.push(FSComponent.buildComponent("rect", { ref: this.speedRangeValues.greenWhite, x: "117", y: halfGreenMax, width: "8", height: halfGreenMin - halfGreenMax, fill: "green" }));
        const greenMin = whiteMax;
        const greenMax = Math.max(-400, greenMin - (10 * (this.yellowSpeed - this.flapsExtend)));
        rectangle.push(FSComponent.buildComponent("rect", { ref: this.speedRangeValues.green, x: "109", y: greenMax, width: "16", height: greenMin - greenMax, fill: "green" }));
        const yellowMin = greenMax;
        const yellowMax = Math.max(-400, yellowMin - (10 * (this.barberSpeed - this.yellowSpeed)));
        rectangle.push(FSComponent.buildComponent("rect", { ref: this.speedRangeValues.yellow, x: "109", y: yellowMax, width: "16", height: yellowMin - yellowMax, fill: "yellow" }));
        return rectangle;
    }
    /**
     * Builds the airspeed tape color ranges.
     * @returns A collection of color range rect elements.
     */
    buildHTMLSpeedTapeRanges() {
        const divs = [];
        divs.push(FSComponent.buildComponent("div", { ref: this.speedRangeValues.barber, id: "barberpole" }));
        return divs;
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        this.updateSpeedBugs(this.ias);
        const adc = this.props.bus.getSubscriber();
        const ap = this.props.bus.getSubscriber();
        this.speedWarningSubject.sub(this.speedWarningChanged.bind(this));
        adc.on('ias')
            .withPrecision(2)
            .handle(this.onUpdateIAS);
        adc.on('tas')
            .withPrecision(0)
            .handle(this.onUpdateTAS);
        ap.on('flc_hold_knots')
            .whenChangedBy(1)
            .handle(this.setFlcBug);
        ap.on('ap_lock_set')
            .handle(this.toggleFlcElements);
        const g1000Events = this.props.bus.getSubscriber();
        g1000Events.on('vspeed_set').handle(this.setVSpeed);
        g1000Events.on('vspeed_display').handle(this.setVSpeedVisibility);
        //init the FLC elements to off
        this.flcBugRef.instance.style.display = 'none';
        this.flcBoxRef.instance.style.display = 'none';
    }
    /**
     * A callback called when the speedwarning state changes.
     * @param state the speed warning state
     */
    speedWarningChanged(state) {
        switch (state) {
            case SpeedWarning.None:
                this.airspeedBoxElement.instance.classList.remove('overspeed');
                this.airspeedBoxElement.instance.style.setProperty('--speedNumberColor', 'white');
                break;
            case SpeedWarning.Caution:
                this.airspeedBoxElement.instance.style.setProperty('--speedNumberColor', 'yellow');
                break;
            case SpeedWarning.Overspeed:
                this.airspeedBoxElement.instance.style.setProperty('--speedNumberColor', 'white');
                this.airspeedBoxElement.instance.classList.add('overspeed');
                break;
        }
    }
    /**
     * A method called to update the location of the FLC Bug on the tape.
     */
    updateFlcBug() {
        let deltaBug = this.flcSpeed - this.ias;
        if (this.ias < 20) {
            deltaBug = this.flcSpeed < 20 ? 0 : this.flcSpeed - 20;
        }
        else if (this.ias < 50) {
            deltaBug = Math.max(this.flcSpeed - (this.ias - 20), -30);
        }
        this.flcBugRef.instance.style.transform = `translate3d(0,${-5.583 * Utils.Clamp(deltaBug, -30, 25)}px,0)`;
    }
    /**
     * Determines whether speed trend is in the overspeed range.
     * @param ias the current ias
     * @returns true if speed trend in overspeed
     */
    isSpeedTrendInOverspeed(ias) {
        return ias + (this.currentTrend / 10) >= this.barberSpeed;
    }
    /**
     * Updates the Airspeed Trend Vector.
     * @param ias The current IAS value.
     */
    updateTrendVector(ias) {
        this.currentTrend = (ias >= 20) ? this.computeIASAcceleration(ias) * 5 : 0;
        const verticalOffset = -117 - Math.max(0, this.currentTrend);
        this.airspeedTrendVector.instance.setAttribute('y', verticalOffset.toString());
        this.airspeedTrendVector.instance.setAttribute('height', Math.abs(this.currentTrend).toString());
    }
    /**
     * Updates the speed bugs on the speed tape. (displayed if within 30 kts of ias)
     * @param ias The current IAS value.
     */
    updateSpeedBugs(ias) {
        if (this.ias < 20) {
            /**
             * Sort function for the v speeds
             * @param a the first value to compare
             * @param b the second value to compare
             * @returns the sorted array
             */
            const sortSpeeds = (a, b) => {
                const speedA = a.value;
                const speedB = b.value;
                let comparison = 0;
                if (speedA > speedB) {
                    comparison = 1;
                }
                else if (speedA < speedB) {
                    comparison = -1;
                }
                return comparison;
            };
            const sortedSpeeds = this.vSpeeds.sort(sortSpeeds);
            let offset = 153;
            let value = 0;
            for (let i = 0; i < 5; i++) {
                if (sortedSpeeds[i] && sortedSpeeds[i].display) {
                    const instance = sortedSpeeds[i].type === VSpeedType.Vx ? this.vxSpeedRef.instance :
                        sortedSpeeds[i].type === VSpeedType.Vy ? this.vySpeedRef.instance :
                            sortedSpeeds[i].type === VSpeedType.Vr ? this.vrSpeedRef.instance :
                                sortedSpeeds[i].type === VSpeedType.Vglide ? this.vgSpeedRef.instance : undefined;
                    // this.vSpeeds[i].type === VSpeedType.Vapp ? this.vappSpeedRef.instance : undefined;
                    if (instance !== null && instance !== undefined) {
                        instance.style.transform = `translate3d(0,${offset}px,0)`;
                    }
                    this.vSpeedSubjects[value].set('' + Math.round(sortedSpeeds[i].value));
                    offset -= 22;
                    value++;
                }
                if (value < 4) {
                    for (let j = value; j < 4; j++) {
                        this.vSpeedSubjects[j].set('');
                    }
                }
            }
            this.vSpeedContainerRef.instance.style.display = '';
        }
        else {
            this.vSpeedContainerRef.instance.style.display = 'none';
            const vxIndex = this.vSpeeds.findIndex((type) => {
                if (type.type === VSpeedType.Vx) {
                    return true;
                }
            });
            const vyIndex = this.vSpeeds.findIndex((type) => {
                if (type.type === VSpeedType.Vy) {
                    return true;
                }
            });
            const vrIndex = this.vSpeeds.findIndex((type) => {
                if (type.type === VSpeedType.Vr) {
                    return true;
                }
            });
            const vgIndex = this.vSpeeds.findIndex((type) => {
                if (type.type === VSpeedType.Vglide) {
                    return true;
                }
            });
            // const vappIndex = this.vSpeeds.findIndex((type) => {
            //   if (type.type === VSpeedType.Vapp) { return true; }
            // });
            const deltaVx = this.vSpeeds[vxIndex].value - ias;
            const deltaVy = this.vSpeeds[vyIndex].value - ias;
            const deltaVr = this.vSpeeds[vrIndex].value - ias;
            const deltaVg = this.vSpeeds[vgIndex].value - ias;
            // const deltaVapp = this.vSpeeds[vappIndex].value - ias;
            if (Math.abs(deltaVx) < 35) {
                this.vxSpeedRef.instance.style.transform = `translate3d(0,${-5.583 * deltaVx}px,0)`;
            }
            else {
                this.vxSpeedRef.instance.style.transform = `translate3d(0,${-5.583 * 35}px,0)`;
            }
            if (Math.abs(deltaVy) < 35) {
                this.vySpeedRef.instance.style.transform = `translate3d(0,${-5.583 * deltaVy}px,0)`;
            }
            else {
                this.vySpeedRef.instance.style.transform = `translate3d(0,${-5.583 * 35}px,0)`;
            }
            if (Math.abs(deltaVr) < 35) {
                this.vrSpeedRef.instance.style.transform = `translate3d(0,${-5.583 * deltaVr}px,0)`;
            }
            else {
                this.vrSpeedRef.instance.style.transform = `translate3d(0,${-5.583 * 35}px,0)`;
            }
            if (Math.abs(deltaVg) < 35) {
                this.vgSpeedRef.instance.style.transform = `translate3d(0,${-5.583 * deltaVg}px,0)`;
            }
            else {
                this.vgSpeedRef.instance.style.transform = `translate3d(0,${-5.583 * 35}px,0)`;
            }
            // if (Math.abs(deltaVapp) < 30) {
            //   this.vappSpeedRef.instance.style.transform = `translate3d(0,${10 * deltaVapp}px,0)`;
            // }
        }
        if (this.ias >= 0 && this.ias < 50) {
            this.vSpeedBackgroundRef.instance.style.display = 'block';
            if (this.ias >= 20) {
                this.vSpeedBackgroundRef.instance.style.transform = `translate3d(0,${5.583 * (ias - 20)}px,0)`;
            }
        }
        else {
            this.vSpeedBackgroundRef.instance.style.display = 'none';
        }
    }
    /**
     * Updates the speed range color bars and the IAS box style.
     * @param ias The current IAS value.
     * @param slowSpeed Whether or not the IAS is in the slow speed range.
     */
    updateSpeedRanges(ias, slowSpeed = false) {
        for (let i = 1; i < 7; i++) {
            let instance;
            let rangeBottom;
            let rangeTop;
            let isSVG = true;
            switch (i) {
                case 1:
                    instance = this.speedRangeValues.red.instance;
                    rangeBottom = 20;
                    rangeTop = this.stallDirty;
                    break;
                case 2:
                    instance = this.speedRangeValues.white.instance;
                    rangeBottom = this.stallDirty;
                    rangeTop = this.flapsExtend;
                    break;
                case 3:
                    instance = this.speedRangeValues.greenWhite.instance;
                    rangeBottom = this.stallClean;
                    rangeTop = this.flapsExtend;
                    break;
                case 4:
                    instance = this.speedRangeValues.green.instance;
                    rangeBottom = this.flapsExtend;
                    rangeTop = this.yellowSpeed;
                    break;
                case 5:
                    instance = this.speedRangeValues.yellow.instance;
                    rangeBottom = this.yellowSpeed;
                    rangeTop = this.barberSpeed;
                    break;
                case 6:
                    instance = this.speedRangeValues.barber.instance;
                    rangeBottom = this.barberSpeed;
                    rangeTop = Infinity;
                    isSVG = false;
                    break;
                default:
                    return;
            }
            if (ias < 40 + rangeTop && ias > rangeBottom - 41 && instance !== null) {
                let top;
                let bottom;
                if (slowSpeed) {
                    top = Math.max(-400, 400 - (10 * (rangeTop - 20)));
                    bottom = Math.min(400, 400 - (10 * (rangeBottom - 20)));
                }
                else {
                    top = Math.max(-400, 10 * ((10 * this.currentDrawnIas) - rangeTop));
                    bottom = Math.min(400, 10 * ((10 * this.currentDrawnIas) - rangeBottom));
                }
                if (isSVG) {
                    instance.setAttribute('y', `${top}`);
                    instance.setAttribute('height', `${bottom - top}`);
                }
                else {
                    instance.style.top = (233 + top * 0.5575).toString() + 'px';
                    instance.style.height = Math.max(0, ((bottom - top) * 0.5575)).toString() + 'px';
                }
                instance.style.display = '';
            }
            else if (instance !== null) {
                instance.style.display = 'none';
            }
        }
    }
    // private readonly vxSpeedRef = FSComponent.createRef<HTMLDivElement>();
    // private readonly vySpeedRef = FSComponent.createRef<HTMLDivElement>();
    // private readonly vgSpeedRef = FSComponent.createRef<HTMLDivElement>();
    // private readonly vrSpeedRef = FSComponent.createRef<HTMLDivElement>();
    // private readonly vappSpeedRef = FSComponent.createRef<HTMLDivElement>();
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "airspeed" },
            FSComponent.buildComponent("div", { class: "airspeed-top-border" }),
            FSComponent.buildComponent("div", { class: "airspeed-middle-border" },
                FSComponent.buildComponent("div", { class: "vspeed-values-background", ref: this.vSpeedBackgroundRef },
                    FSComponent.buildComponent("div", { class: "vspeed-values-container", ref: this.vSpeedContainerRef },
                        FSComponent.buildComponent("div", { class: "value1 bug-values cyan" }, this.vSpeedSubjects[0]),
                        FSComponent.buildComponent("div", { class: "value2 bug-values cyan" }, this.vSpeedSubjects[1]),
                        FSComponent.buildComponent("div", { class: "value3 bug-values cyan" }, this.vSpeedSubjects[2]),
                        FSComponent.buildComponent("div", { class: "value4 bug-values cyan" }, this.vSpeedSubjects[3])))),
            FSComponent.buildComponent("div", { class: "speed-tape" }),
            FSComponent.buildComponent("div", { class: "tick-marks" },
                FSComponent.buildComponent("div", { style: "height: 456px; width: 70px; transform: translate3d(0px, -291px, 0px); overflow:hidden", ref: this.airspeedTapeTickElement },
                    FSComponent.buildComponent("svg", { height: "466px", width: "70px", viewBox: "0 -400 125 800" },
                        FSComponent.buildComponent("g", { class: "speed-tape", transform: "translate(0,0)" },
                            this.buildSVGSpeedTapeRanges(),
                            this.buildSpeedTapeTicks(),
                            this.buildSpeedTapeNumbers())),
                    this.buildHTMLSpeedTapeRanges())),
            FSComponent.buildComponent("div", { class: "airspeed-trend-vector" },
                FSComponent.buildComponent("div", { style: "height: 466px; width: 70px;" },
                    FSComponent.buildComponent("svg", { height: "466px", width: "70px", viewBox: "0 -400 125 800" },
                        FSComponent.buildComponent("rect", { ref: this.airspeedTrendVector, x: "115", y: "-117", width: "7", height: "0", stroke: "white", "stroke-width": "1px", fill: "magenta" })))),
            FSComponent.buildComponent("div", { class: "ias-box", ref: this.airspeedBoxElement },
                FSComponent.buildComponent("svg", { viewBox: "0 0 90 70" },
                    FSComponent.buildComponent("path", { d: "M 86 35 l -11 -6 l 0 -26 c 0 -1 -1 -2 -2 -2 l -19 0 c -1 0 -2 1 -2 2 l 0 11 l -44 0 c -1 0 -2 1 -2 2 l 0 38 c 0 1 1 2 2 2 l 44 0 l 0 11 c 0 1 1 2 2 2 l 19 0 c 1 0 2 -1 2 -2 l 0 -26 l 11 -6 z", fill: "black", stroke: "whitesmoke", "stroke-width": "1" })),
                FSComponent.buildComponent("div", { class: "hundreds-scroller scroller-background" },
                    FSComponent.buildComponent("svg", { height: "35", width: "17" },
                        FSComponent.buildComponent("g", { transform: "translate(0,-420)", ref: this.airspeedHundredsDataElement }, this.buildScroller(-2, true)))),
                FSComponent.buildComponent("div", { class: "tens-scroller scroller-background" },
                    FSComponent.buildComponent("svg", { height: "35", width: "17" },
                        FSComponent.buildComponent("g", { transform: "translate(0,-420)", ref: this.airspeedTensDataElement }, this.buildScroller()))),
                FSComponent.buildComponent("div", { class: "ones-scroller scroller-background" },
                    FSComponent.buildComponent("div", { class: "ones-scroller-mask" }),
                    FSComponent.buildComponent("svg", { height: "57", width: "17" },
                        FSComponent.buildComponent("g", { transform: "translate(0,-420)", ref: this.airspeedOnesDataElement }, this.buildScroller(9))))),
            FSComponent.buildComponent("div", { class: "flc-bug", ref: this.flcBugRef },
                FSComponent.buildComponent("svg", { width: "13", height: "24" },
                    FSComponent.buildComponent("path", { d: 'M 0 0 m 8.789 9.794 l -7.789 -4.25 l 0 -5 l 8.5 0 l 0 18.5 l -8.5 0 l 0 -5 z', fill: "cyan" }))),
            FSComponent.buildComponent("div", { class: "vspeed-bug-container" },
                FSComponent.buildComponent("div", { class: "airspeed-bug glide", ref: this.vgSpeedRef },
                    FSComponent.buildComponent("svg", { width: "18", height: "22" },
                        FSComponent.buildComponent("path", { d: 'M 0 0 m 0 9 l 8 -9 l 12 0 l 0 20 l -12 0 l -8 -9 l 0 -2', fill: "black" }),
                        FSComponent.buildComponent("text", { x: "6", y: "16", fill: "cyan" }, "G"))),
                FSComponent.buildComponent("div", { class: "airspeed-bug vr", ref: this.vrSpeedRef },
                    FSComponent.buildComponent("svg", { width: "18", height: "22" },
                        FSComponent.buildComponent("path", { d: 'M 0 0 m 0 9 l 8 -9 l 12 0 l 0 20 l -12 0 l -8 -9 l 0 -2', fill: "black" }),
                        FSComponent.buildComponent("text", { x: "6", y: "16", fill: "cyan" }, "R"))),
                FSComponent.buildComponent("div", { class: "airspeed-bug vx", ref: this.vxSpeedRef },
                    FSComponent.buildComponent("svg", { width: "18", height: "22" },
                        FSComponent.buildComponent("path", { d: 'M 0 0 m 0 9 l 8 -9 l 12 0 l 0 20 l -12 0 l -8 -9 l 0 -2', fill: "black" }),
                        FSComponent.buildComponent("text", { x: "6", y: "16", fill: "cyan" }, "X"))),
                FSComponent.buildComponent("div", { class: "airspeed-bug vy", ref: this.vySpeedRef },
                    FSComponent.buildComponent("svg", { width: "18", height: "22" },
                        FSComponent.buildComponent("path", { d: 'M 0 0 m 0 9 l 8 -9 l 12 0 l 0 20 l -12 0 l -8 -9 l 0 -2', fill: "black" }),
                        FSComponent.buildComponent("text", { x: "6", y: "17", fill: "cyan" }, "Y")))),
            FSComponent.buildComponent("div", { class: "flc-box", ref: this.flcBoxRef },
                FSComponent.buildComponent("svg", null,
                    FSComponent.buildComponent("path", { d: 'M 6 7 m 6.3281 7.0517 l -5.6081 -3.06 l 0 -3.6 l 6.12 0 l 0 13.32 l -6.12 0 l 0 -3.6 z', fill: "cyan" })),
                FSComponent.buildComponent("div", { class: 'flc-value cyan' },
                    this.flcSubject,
                    FSComponent.buildComponent("span", { class: "size14" }, "KT"))),
            FSComponent.buildComponent("div", { class: "tas-box" },
                "TAS",
                FSComponent.buildComponent("div", { class: "tas-value" },
                    FSComponent.buildComponent("span", { ref: this.tasElement }),
                    FSComponent.buildComponent("span", { style: "font-size:14px" }, "KT")))));
    }
}
