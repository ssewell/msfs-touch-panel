import { FSComponent, DisplayComponent, Subject, UnitType } from 'msfssdk';
import { AltAlertState, AltitudeAlertController } from './AltitudeAlertController';
import { PFDUserSettings } from '../../PFDUserSettings';
import './Altimeter.css';
/**
 * The PFD airspeed indicator with speed tape.
 */
export class Altimeter extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.controller = new AltitudeAlertController(this.props.bus);
        this.altitudeBoxElement = FSComponent.createRef();
        this.altitudeTenThousandsDataElement = FSComponent.createRef();
        this.altitudeThousandsDataElement = FSComponent.createRef();
        this.altitudeHundredsDataElement = FSComponent.createRef();
        this.altitudeTensDataElement = FSComponent.createRef();
        this.altitudeTapeTickElement = FSComponent.createRef();
        this.altitudeScrollerValues = [];
        this.altitudeScrollerZeroes = [];
        this.kohlsmanSetting = FSComponent.createRef();
        this.baroUnits = FSComponent.createRef();
        this.altitudeBugRef = FSComponent.createRef();
        this.minimumsBugRef = FSComponent.createRef();
        this.minimumsBugColor = FSComponent.createRef();
        this.altitudeTrendVector = FSComponent.createRef();
        this.selectedAltitudeTensSubject = Subject.create('');
        this.selectedAltitudeTensRef = FSComponent.createRef();
        this.selectedAltitudeHundredsSubject = Subject.create('- - - -');
        this.selectedAltitudeHundredsRef = FSComponent.createRef();
        this.vnavTargetAltSubject = Subject.create(0);
        this.vnavTargetAltRef = FSComponent.createRef();
        this.alerterBoxRef = FSComponent.createRef();
        this.alerterTextRef = FSComponent.createRef();
        this.alerterSVGBugRef = FSComponent.createRef();
        this.currentBaro = {
            units_hpa: false,
            standard: false,
            settingIn: 0
        };
        this.storedBaroIn = undefined;
        this.currentDrawnAlt = 0;
        this.minimumsAltitude = 0;
        /**
         * A method called when a minimums altitude value changes from the event bus.
         * @param mins The minimums altitude value.
         */
        this.updateMinimums = (mins) => {
            this.minimumsAltitude = Math.round(mins);
            this.updateMinimumsBug();
        };
        /**
         * A method called when a selected altitude value changes from the event bus.
         * @param alt The selected altitude value.
         */
        this.updateSelectedAltitude = (alt) => {
            this.controller.selectedAltitude = Math.round(alt);
            if (this.controller.selectedAltitude == 0) {
                this.selectedAltitudeHundredsRef.instance.classList.add('preselect-hundreds-small');
                this.selectedAltitudeTensRef.instance.classList.add('hidden-preselect-tens');
                this.selectedAltitudeHundredsSubject.set('0');
                this.selectedAltitudeTensSubject.set('00');
            }
            else {
                this.selectedAltitudeHundredsRef.instance.classList.remove('preselect-hundreds-small');
                this.selectedAltitudeTensRef.instance.classList.remove('hidden-preselect-tens');
                this.selectedAltitudeHundredsSubject.set(`${this.controller.selectedAltitude / 100}`);
                this.selectedAltitudeTensSubject.set('00');
                this.altitudeBugRef.instance.style.display = ''; //This initializes the bug so it doesn't show until the preselector has initially changed.
            }
            this.updateSelectedAltitudeBug();
        };
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        const adc = this.props.bus.getSubscriber();
        const ap = this.props.bus.getSubscriber();
        const vnav = this.props.bus.getSubscriber();
        const hEvtPub = this.props.bus.getSubscriber();
        const g1000ControlEvents = this.props.bus.getSubscriber();
        adc.on('alt')
            .withPrecision(1)
            .handle(this.updateAltitude.bind(this));
        ap.on('alt_select')
            .withPrecision(0)
            .handle(this.updateSelectedAltitude.bind(this));
        adc.on('kohlsman_setting_hg_1')
            .withPrecision(2)
            .handle(this.updateKohlsmanSetting.bind(this));
        adc.on('baro_units_hpa_1')
            .handle(this.updateBaroUnits.bind(this));
        adc.on('vs')
            .withPrecision(-1)
            .handle(this.updateVerticalSpeed.bind(this));
        hEvtPub.on('hEvent').handle(hEvent => {
            if (hEvent == 'AS1000_PFD_BARO_INC') {
                this.onbaroKnobTurn(true);
            }
            else if (hEvent == 'AS1000_PFD_BARO_DEC') {
                this.onbaroKnobTurn(false);
            }
        });
        PFDUserSettings.getManager(this.props.bus).whenSettingChanged('baroHpa').handle(this.updateBaroUnits.bind(this));
        g1000ControlEvents.on('std_baro_switch')
            .handle(this.updateBaroStd.bind(this));
        g1000ControlEvents.on('set_minimums')
            .handle(this.updateMinimums.bind(this));
        g1000ControlEvents.on('show_minimums')
            .handle((show) => {
            if (show) {
                this.minimumsBugRef.instance.style.display = '';
            }
            else {
                this.minimumsBugRef.instance.style.display = 'none';
            }
        });
        this.props.bus.getSubscriber().on('baro_set')
            .handle(() => this.handleBaroSetEvent());
        vnav.on('vnavConstraintAltitude').whenChanged().handle(alt => {
            if (alt > 0) {
                this.vnavTargetAltSubject.set(Math.round(alt));
                this.vnavTargetAltRef.instance.classList.remove('hidden');
            }
            else {
                this.vnavTargetAltRef.instance.classList.add('hidden');
            }
        });
        this.controller.alerterState.sub(this.onAlerterStateChanged.bind(this));
        //init minimums to display = none
        this.minimumsBugRef.instance.style.display = 'none';
        this.altitudeBugRef.instance.style.display = 'none';
    }
    /**
     * Set the Kohlsman setting directly.
     * @param baroMbar The new barometer setting in millibars.
     */
    static setKohlsmanMbar(baroMbar) {
        SimVar.SetSimVarValue('K:KOHLSMAN_SET', 'number', (baroMbar * 16));
    }
    /**
     * Convenience function to set the Kohlsman in inHg, since that's the main unit we use here.
     * @param baroIn The new barometer setting in inHg.
     */
    static setKohlsman(baroIn) {
        Altimeter.setKohlsmanMbar(UnitType.IN_HG.convertTo(baroIn, UnitType.HPA));
    }
    /**
     * Handle when the G1000 detects that the user pressed the 'B' key to set the barometric pressure.
     */
    handleBaroSetEvent() {
        const indicatedAltitude = this.controller.altitude;
        if (indicatedAltitude > 18000) {
            if (!this.currentBaro.standard) {
                this.props.g1000Publisher.publishEvent('std_baro_switch', true);
            }
        }
        else {
            if (this.currentBaro.standard) {
                this.storedBaroIn = undefined;
                this.props.g1000Publisher.publishEvent('std_baro_switch', false);
            }
        }
    }
    /**
     * A method called to update the location of the Minimums Bug on the altitude tape.
     */
    updateMinimumsBug() {
        var _a, _b, _c;
        const deltaBug = this.minimumsAltitude - this.controller.altitude;
        //53.5px per hundred ft
        // if (this.altitude < 20) {
        //   deltaBug = this.selectedAltitude < 20 ? 0 : this.selectedAltitude - 20;
        // } else if (this.altitude < 50) {
        //   deltaBug = Math.max(this.selectedAltitude - (this.ias - 20), -30);
        // }
        if (this.controller.altitude >= -2000 && this.controller.altitude <= 99900) {
            this.minimumsBugRef.instance.style.transform = `translate3d(0,${-0.5575 * Utils.Clamp(deltaBug, -300, 300)}px,0)`;
        }
        if (this.controller.altitude < this.minimumsAltitude) {
            (_a = this.minimumsBugColor.instance) === null || _a === void 0 ? void 0 : _a.setAttribute('fill', 'yellow');
        }
        else if (this.minimumsAltitude > (this.controller.altitude - 100) && this.controller.altitude >= this.minimumsAltitude) {
            (_b = this.minimumsBugColor.instance) === null || _b === void 0 ? void 0 : _b.setAttribute('fill', 'white');
        }
        else {
            (_c = this.minimumsBugColor.instance) === null || _c === void 0 ? void 0 : _c.setAttribute('fill', 'cyan');
        }
    }
    /**
     * A method called to update the location of the Selected Altitude Bug on the altitude tape.
     */
    updateSelectedAltitudeBug() {
        const deltaBug = this.controller.selectedAltitude - this.controller.altitude;
        if (this.controller.altitude >= -2000 && this.controller.altitude <= 99900) {
            this.altitudeBugRef.instance.style.transform = `translate3d(0,${-0.5575 * Utils.Clamp(deltaBug, -300, 300)}px,0)`;
        }
    }
    /**
     * A method called when the alt alerter state is changed.
     * @param state is the altitude alerter state
     */
    onAlerterStateChanged(state) {
        switch (state) {
            case AltAlertState.DISABLED:
            case AltAlertState.ARMED:
                this.alerterBoxRef.instance.classList.remove('thousand-flash', 'two-hundo-flash', 'yellow-flash');
                this.alerterTextRef.instance.classList.remove('thousand-flash', 'two-hundo-flash', 'yellow-flash');
                this.alerterSVGBugRef.instance.classList.remove('thousand-flash', 'two-hundo-flash', 'yellow-flash');
                break;
            case AltAlertState.WITHIN_1000:
                this.alerterBoxRef.instance.classList.add('thousand-flash');
                this.alerterTextRef.instance.classList.add('thousand-flash');
                this.alerterSVGBugRef.instance.classList.add('thousand-flash');
                break;
            case AltAlertState.WITHIN_200:
                this.alerterBoxRef.instance.classList.remove('thousand-flash', 'yellow-flash');
                this.alerterTextRef.instance.classList.remove('thousand-flash', 'yellow-flash');
                this.alerterSVGBugRef.instance.classList.remove('thousand-flash', 'yellow-flash');
                this.alerterBoxRef.instance.classList.add('two-hundo-flash');
                this.alerterTextRef.instance.classList.add('two-hundo-flash');
                this.alerterSVGBugRef.instance.classList.add('two-hundo-flash');
                break;
            case AltAlertState.CAPTURED:
                break;
            case AltAlertState.DEVIATION_200:
                this.alerterBoxRef.instance.classList.remove('two-hundo-flash');
                this.alerterTextRef.instance.classList.remove('two-hundo-flash');
                this.alerterSVGBugRef.instance.classList.remove('two-hundo-flash');
                this.alerterBoxRef.instance.classList.add('yellow-flash');
                this.alerterTextRef.instance.classList.add('yellow-flash');
                this.alerterSVGBugRef.instance.classList.add('yellow-flash');
                break;
        }
    }
    /**
     * Updates the kohlsman value based on knob input.
     * @param increase a bool to determine whether to increcement up or down the current baro setting.
     */
    onbaroKnobTurn(increase) {
        if (this.currentBaro.standard) {
            this.currentBaro.settingIn = 29.92;
            this.currentBaro.standard = false;
            this.props.g1000Publisher.publishEvent('std_baro_switch', this.currentBaro.standard);
        }
        if (increase) {
            if (this.currentBaro.units_hpa) {
                Altimeter.setKohlsman(this.currentBaro.settingIn + UnitType.HPA.convertTo(1, UnitType.IN_HG));
            }
            else {
                Altimeter.setKohlsman(this.currentBaro.settingIn + 0.01);
            }
        }
        else {
            if (this.currentBaro.units_hpa) {
                Altimeter.setKohlsman(this.currentBaro.settingIn - UnitType.HPA.convertTo(1, UnitType.IN_HG));
            }
            else {
                Altimeter.setKohlsman(this.currentBaro.settingIn - 0.01);
            }
        }
        this.updateBaroDisplay();
    }
    /**
     * Updates the kohlsman value when it changes.
     * @param baroUnits The new selected altitude value.
     */
    updateBaroUnits(baroUnits) {
        this.currentBaro.units_hpa = baroUnits;
        this.updateBaroDisplay();
    }
    /**
     * Updates the kohlsman value when it changes.
     * @param baroStd The new selected altitude value.
     */
    updateBaroStd(baroStd) {
        this.currentBaro.standard = baroStd;
        if (baroStd == true) {
            this.storedBaroIn = this.currentBaro.settingIn;
            this.currentBaro.settingIn = 29.92;
        }
        else if (this.storedBaroIn !== undefined) {
            this.currentBaro.settingIn = this.storedBaroIn;
            this.storedBaroIn = undefined;
        }
        Altimeter.setKohlsman(this.currentBaro.settingIn);
        this.updateBaroDisplay();
    }
    /**
     * Updates the kohlsman value when it changes.
     * @param kohlsmanSetting The new selected altitude value.
     */
    updateKohlsmanSetting(kohlsmanSetting) {
        this.currentBaro.settingIn = kohlsmanSetting;
        this.updateBaroDisplay();
    }
    /**
     * Updates the kohlsman display value.
     */
    updateBaroDisplay() {
        if (this.currentBaro.standard && this.kohlsmanSetting.instance !== null && this.baroUnits.instance !== null) {
            this.kohlsmanSetting.instance.textContent = 'STD BARO';
            this.baroUnits.instance.textContent = '';
        }
        else if (this.currentBaro.units_hpa && this.kohlsmanSetting.instance !== null && this.baroUnits.instance !== null) {
            this.kohlsmanSetting.instance.textContent = `${Math.round(33.864 * this.currentBaro.settingIn)}`;
            this.baroUnits.instance.textContent = 'HPA';
        }
        else if (this.kohlsmanSetting.instance !== null && this.baroUnits.instance !== null) {
            this.kohlsmanSetting.instance.textContent = `${(this.currentBaro.settingIn.toPrecision(4))}`;
            this.baroUnits.instance.textContent = 'IN';
        }
    }
    /**
     * Updates the altitude indicator when the altitude changes.
     * @param relativeAlt The new altitude value.
     */
    updateAltitude(relativeAlt) {
        this.controller.altitude = relativeAlt;
        const alt = Math.abs(relativeAlt);
        const altPrefix = relativeAlt < 0 ? -1 : 1;
        relativeAlt < 0 ? this.altitudeBoxElement.instance.classList.add('below-msl') : this.altitudeBoxElement.instance.classList.remove('below-msl');
        relativeAlt < 20 && relativeAlt > -20 ? this.altitudeBoxElement.instance.classList.add('trans-msl') : this.altitudeBoxElement.instance.classList.remove('trans-msl');
        const tens = alt % 100;
        const hundreds = (alt % 1000 - tens) / 100;
        const thousands = ((alt - (alt % 1000)) / 1000) % 10;
        const tenThousands = (alt - (alt % 10000)) / 10000;
        if (this.altitudeTenThousandsDataElement.instance !== null) {
            let newTranslation;
            if (relativeAlt < -980 || (relativeAlt < -2000 || relativeAlt > 99900)) {
                newTranslation = -660;
            }
            else {
                newTranslation = -300 + (tenThousands * 30) * altPrefix;
                if (thousands === 9 && hundreds == 9 && tens > 80) {
                    newTranslation += 1.5 * (tens - 80) * altPrefix;
                }
            }
            this.altitudeTenThousandsDataElement.instance.setAttribute('transform', `translate(0,${newTranslation})`);
        }
        if (this.altitudeThousandsDataElement.instance !== null) {
            (relativeAlt < 1000 && relativeAlt > -1000) ? this.altitudeThousandsDataElement.instance.classList.add('no-zero') : this.altitudeThousandsDataElement.instance.classList.remove('no-zero');
            let newTranslation;
            if ((relativeAlt > -980 && relativeAlt < -80) || (relativeAlt < -2000 || relativeAlt > 99900)) {
                newTranslation = -660;
            }
            else {
                newTranslation = -300 + (thousands * 30) * altPrefix;
                if (hundreds == 9 && tens > 80) {
                    newTranslation += 1.5 * (tens - 80) * altPrefix;
                }
            }
            this.altitudeThousandsDataElement.instance.setAttribute('transform', `translate(0,${newTranslation})`);
        }
        if (this.altitudeHundredsDataElement.instance !== null) {
            (relativeAlt < 100 && relativeAlt > -100) ? this.altitudeHundredsDataElement.instance.classList.add('no-zero') : this.altitudeHundredsDataElement.instance.classList.remove('no-zero');
            let newTranslation;
            if ((relativeAlt > -80 && relativeAlt < 0) || (relativeAlt < -2000 || relativeAlt > 99900)) {
                newTranslation = -660;
            }
            else {
                newTranslation = -300 + (hundreds * 30) * altPrefix;
                if (tens > 80) {
                    newTranslation += 1.5 * (tens - 80) * altPrefix;
                }
            }
            this.altitudeHundredsDataElement.instance.setAttribute('transform', `translate(0,${newTranslation})`);
        }
        if (this.altitudeTensDataElement.instance !== null) {
            const newTranslation = (relativeAlt < -2000 || relativeAlt > 99900) ? -399 : -191 + (tens * 1.3) * altPrefix;
            this.altitudeTensDataElement.instance.setAttribute('transform', `translate(0,${newTranslation})`);
        }
        if (this.altitudeTapeTickElement.instance !== null) {
            const offset = relativeAlt >= 0 ? -104 : -4;
            const newTranslation = (relativeAlt < -2000 || relativeAlt > 99900) ? -104 : offset + relativeAlt % 100;
            this.altitudeTapeTickElement.instance.style.transform = `translate3d(0px, ${newTranslation * 0.5575}px, 0px)`;
        }
        if ((relativeAlt / 100 >= this.currentDrawnAlt + 1 || relativeAlt / 100 < this.currentDrawnAlt) && (relativeAlt > -2000 || relativeAlt > 99900)) {
            this.currentDrawnAlt = Math.floor(relativeAlt / 100);
            for (let i = 0; i < this.altitudeScrollerValues.length; i++) {
                const scrollerValue = this.altitudeScrollerValues[i].instance;
                const zeroValue = this.altitudeScrollerZeroes[i].instance;
                if (scrollerValue !== null) {
                    if ((i - 4) + this.currentDrawnAlt === 0) {
                        scrollerValue.textContent = '';
                        zeroValue.textContent = '0';
                    }
                    else {
                        scrollerValue.textContent = ((i - 4) + this.currentDrawnAlt).toString();
                        zeroValue.textContent = '00';
                    }
                }
            }
        }
        this.updateSelectedAltitudeBug();
        this.updateMinimumsBug();
        this.controller.updateAltitudeAlerter();
    }
    /**
     * Updates the Altitude Trend Vector when the vertical speed changes.
     * @param vs The new vertical speed.
     */
    updateVerticalSpeed(vs) {
        const currentTrend = vs / 10;
        const verticalOffset = -104 - Math.max(0, currentTrend);
        this.altitudeTrendVector.instance.setAttribute('y', verticalOffset.toString());
        this.altitudeTrendVector.instance.setAttribute('height', Math.abs(currentTrend).toString());
    }
    /**
     * Builds a numerical scroller with dual numbers for the altimeter window.
     * @param startYValue The starting Y value in the svg to start number at.
     * @returns A collection of text elements for the numerical scroller.
     */
    buildDoubleScroller(startYValue = 78) {
        const scroller = [];
        let yValue = startYValue;
        for (let i = 0; i < 15; i++) {
            const number = i < 7 ? (220 - i * 20) : i * 20 - 20;
            const numberText = i == 13 ? ' ' : i == 14 ? '- -' : number.toString().slice(-2);
            let className = numberText == '00' ? 'zero-digit' : 'normal-digit';
            if (i == 5 || i == 7) {
                const altClassName = i == 5 ? className + ' top show-below-msl' : className + ' bottom show-above-msl';
                const altNumberText = (100 - number % 100).toString().slice(-2);
                scroller.push(FSComponent.buildComponent("text", { x: '15', y: yValue, class: altClassName, fill: "white", "text-anchor": "middle", "font-size": '26' }, altNumberText));
                className += i == 5 ? ' top show-above-msl' : ' bottom show-below-msl';
            }
            scroller.push(FSComponent.buildComponent("text", { x: '15', y: yValue, class: className, fill: "white", "text-anchor": "middle", "font-size": '26' }, numberText));
            yValue += 26;
        }
        return scroller;
    }
    /**
     * Builds a numerical scroller for the altimeter window.
     * @param startYValue The starting Y value in the svg to start number at.
     * @returns A collection of text elements for the numerical scroller.
     */
    buildSingleScroller(startYValue = -3) {
        const scroller = [];
        let yValue = startYValue;
        for (let i = 0; i < 24; i++) {
            const number = i < 12 ? (11 - i) : i - 11;
            const numberText = i == 23 ? '-' : number.toString().slice(-1);
            let className = number === 0 ? 'zero-digit' : 'normal-digit';
            if (i == 10 || i == 12) {
                const altClassName = i == 10 ? className + ' top show-below-msl' : className + ' bottom show-above-msl';
                const altNumber = 10 - number;
                const altNumberText = altNumber.toString();
                scroller.push(FSComponent.buildComponent("text", { x: '8', y: yValue, class: altClassName, fill: "white", "text-anchor": "middle", "font-size": '26' }, altNumberText));
                className += i == 10 ? ' top show-above-msl' : ' bottom show-below-msl';
            }
            scroller.push(FSComponent.buildComponent("text", { x: '8', y: yValue, class: className, fill: "white", "text-anchor": "middle", "font-size": '26' }, numberText));
            yValue += 30;
        }
        return scroller;
    }
    /**
     * Builds the tick marks on the altitude tape.
     * @returns A collection of tick mark line elements.
     */
    buildAltitudeTapeTicks() {
        const ticks = [];
        for (let i = 0; i < 41; i++) {
            const length = i === 0 || i % 5 === 0 ? 30 : 15;
            const startX = 1;
            const startY = 400 - (i * 20);
            const endX = startX + length;
            const endY = startY;
            ticks.push(FSComponent.buildComponent("line", { x1: startX, y1: startY, x2: endX, y2: endY, stroke: "rgb(203,203,203)", "stroke-width": "3px" }));
        }
        return ticks;
    }
    /**
     * Builds the altitude numbers for the altimeter tape.
     * @returns A collection of airspeed number text elements.
     */
    buildAltitudeTapeNumbers() {
        const text = [];
        let altStart = -4;
        for (let i = 0; i < 9; i++) {
            const startX = 133;
            const startY = 415 - (i * 100);
            const numberText = altStart.toString();
            const textElement = FSComponent.createRef();
            text.push(FSComponent.buildComponent("text", { x: startX, y: startY, fill: "rgb(203,203,203)", "text-anchor": "end", "font-size": '44', ref: textElement }, numberText));
            this.altitudeScrollerValues.push(textElement);
            altStart++;
        }
        return text;
    }
    /**
     * Builds the zeroes for the altitude tape.
     * @returns A collection of zeroes text elements.
     */
    buildAltitudeTapeZeros() {
        const zeros = [];
        for (let i = 0; i < 9; i++) {
            const startX = 175;
            const startY = 415 - (i * 100);
            const zeroElement = FSComponent.createRef();
            zeros.push(FSComponent.buildComponent("text", { x: startX, y: startY, fill: "rgb(203,203,203)", "text-anchor": "end", "font-size": '38', ref: zeroElement }, "00"));
            this.altitudeScrollerZeroes.push(zeroElement);
        }
        return zeros;
    }
    /**
     * Render the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "altimeter" },
            FSComponent.buildComponent("div", { class: "altimeter-middle-border" }),
            FSComponent.buildComponent("div", { class: "altitude-tick-marks" },
                FSComponent.buildComponent("div", { style: "height: 446px; width: 100px;", ref: this.altitudeTapeTickElement },
                    FSComponent.buildComponent("svg", { height: "446", width: "100", viewBox: "0 -400 179 800" },
                        FSComponent.buildComponent("g", { class: "AltitudeTape", transform: "translate(0,0)" },
                            this.buildAltitudeTapeTicks(),
                            this.buildAltitudeTapeZeros(),
                            this.buildAltitudeTapeNumbers())))),
            FSComponent.buildComponent("div", { class: "altitude-trend-vector" },
                FSComponent.buildComponent("svg", { height: "446", width: "100", viewBox: "0 -400 179 800" },
                    FSComponent.buildComponent("rect", { ref: this.altitudeTrendVector, x: "1", y: "-104", width: "7", height: "0", stroke: "white", "stroke-width": "1px", fill: "magenta" }))),
            FSComponent.buildComponent("div", { class: "altitude-box", ref: this.altitudeBoxElement },
                FSComponent.buildComponent("svg", null,
                    FSComponent.buildComponent("path", { d: "M 4 50 l 8 -5 l 0 -12 c 0 -1 1 -2 2 -2 l 54 0 l 0 -13 c 0 -1 1 -2 2 -2 l 30 0 c 1 0 2 1 2 2 l 0 63 c 0 1 -1 2 -2 2 l -30 0 c -1 0 -2 -1 -2 -2 l 0 -13 l -54 0 c -1 0 -2 -1 -2 -2 l 0 -12 l -8 -4 z", fill: "black", stroke: "whitesmoke", "stroke-width": "1" })),
                FSComponent.buildComponent("div", { class: "alt-ten-thousands-scroller altitude-scroller-background no-zero" },
                    FSComponent.buildComponent("svg", { height: "35", width: "17" },
                        FSComponent.buildComponent("g", { ref: this.altitudeTenThousandsDataElement, transform: "translate(0,0)" }, this.buildSingleScroller()))),
                FSComponent.buildComponent("div", { class: "alt-thousands-scroller altitude-scroller-background" },
                    FSComponent.buildComponent("svg", { height: "35", width: "17" },
                        FSComponent.buildComponent("g", { ref: this.altitudeThousandsDataElement, transform: "translate(0,0)" }, this.buildSingleScroller()))),
                FSComponent.buildComponent("div", { class: "alt-hundreds-scroller altitude-scroller-background" },
                    FSComponent.buildComponent("svg", { height: "35", width: "17" },
                        FSComponent.buildComponent("g", { ref: this.altitudeHundredsDataElement, transform: "translate(0,0)" }, this.buildSingleScroller()))),
                FSComponent.buildComponent("div", { class: "alt-tens-scroller altitude-scroller-background" },
                    FSComponent.buildComponent("div", { class: "alt-tens-mask" }),
                    FSComponent.buildComponent("svg", { height: "66", width: "29" },
                        FSComponent.buildComponent("g", { ref: this.altitudeTensDataElement, transform: "translate(0,0)" }, this.buildDoubleScroller())))),
            FSComponent.buildComponent("div", { class: "preselect-bug", ref: this.altitudeBugRef },
                FSComponent.buildComponent("svg", null,
                    FSComponent.buildComponent("path", { d: "M 0 36 l 12 0 l 0 9 l -8 5 l 8 4 l 0 9 l -12 0 z", fill: "cyan", stroke: "black", "stroke-width": "1" }))),
            FSComponent.buildComponent("div", { class: "minimums-bug", ref: this.minimumsBugRef },
                FSComponent.buildComponent("svg", null,
                    FSComponent.buildComponent("path", { ref: this.minimumsBugColor, d: 'M 5 50 l 8 -5 l 0 -14 l 3 0 l 0 14 l -9 5 l 9 4 l 0 14 l -3 0 l 0 -14 l -8 -4', fill: "cyan" }))),
            FSComponent.buildComponent("div", { class: "preselect-box", ref: this.alerterBoxRef },
                FSComponent.buildComponent("svg", null,
                    FSComponent.buildComponent("path", { ref: this.alerterSVGBugRef, d: "M 6 8 l 8 0 l 0 4 l -4 3 l 0 2 l 4 3 l 0 4 l -8 0 l 0 -16 z", fill: "cyan" })),
                FSComponent.buildComponent("div", { class: "preselect-value", ref: this.alerterTextRef },
                    FSComponent.buildComponent("span", { ref: this.selectedAltitudeHundredsRef }, this.selectedAltitudeHundredsSubject),
                    FSComponent.buildComponent("span", { ref: this.selectedAltitudeTensRef, class: 'preselect-tens' }, this.selectedAltitudeTensSubject))),
            FSComponent.buildComponent("div", { class: "alt-indicator-vnav-target", ref: this.vnavTargetAltRef }, this.vnavTargetAltSubject),
            FSComponent.buildComponent("div", { class: "pressure-box" },
                FSComponent.buildComponent("span", { ref: this.kohlsmanSetting }),
                FSComponent.buildComponent("span", { ref: this.baroUnits, class: "size14" }, "IN"))));
    }
}
