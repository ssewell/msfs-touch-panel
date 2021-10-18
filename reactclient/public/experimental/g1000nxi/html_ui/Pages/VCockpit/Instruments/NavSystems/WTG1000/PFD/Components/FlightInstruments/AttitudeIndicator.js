import { FSComponent, DisplayComponent } from 'msfssdk';
import { SvtProjectionUtils } from '../../../Shared/UI/SvtProjectionUtils';
import { PFDUserSettings } from '../../PFDUserSettings';
import './AttitudeIndicator.css';
/**
 * The PFD attitude indicator.
 */
export class AttitudeIndicator extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.scroll_increment = 10;
        this.pxPerDegY = SvtProjectionUtils.projectYawPitch(0, 0.1 * Avionics.Utils.DEG2RAD, 0, new Float64Array(2))[1] * 10;
        this.pitchIncrements = 2.5;
        this.numberIncrements = 2;
        this.pitchIncrementsDistance = this.pxPerDegY * this.pitchIncrements;
        this.currentPitch = 0;
        this.cutoutElement = FSComponent.createRef();
        this.pitchLinesContainer = FSComponent.createRef();
        this.pitchLinesGroup = FSComponent.createRef();
        this.bankElement = FSComponent.createRef();
        this.innerBankElement = FSComponent.createRef();
        this.zeroPitchLine = FSComponent.createRef();
        this.pitchNumbersLeft = [];
        this.pitchNumbersRight = [];
        this.turnCoordinatorElement = FSComponent.createRef();
        this.lastPitchOffset = 0;
        /**
         * A callback called when the pitch updates from the event bus.
         * @param pitch The current pitch value.
         * @param forceRedraw An override for the redraw.
         */
        this.onUpdatePitch = (pitch, forceRedraw = false) => {
            this.currentPitch = pitch;
            if (this.pitchLinesContainer.instance !== null) {
                const pitchOffset = Math.trunc((pitch / this.scroll_increment));
                if (pitchOffset !== this.lastPitchOffset || forceRedraw) {
                    this.lastPitchOffset = pitchOffset;
                    if (this.zeroPitchLine.instance !== null) {
                        this.zeroPitchLine.instance.style.visibility = pitchOffset === 0 ? 'hidden' : 'visible';
                    }
                    this.updatePitchNumbers(pitch, pitchOffset);
                }
                this.updateLinesPos(pitch);
            }
        };
        /**
         * A callback called when the ADC updates from the event bus.
         * @param roll The current ADC roll value.
         */
        this.onUpdateRoll = (roll) => {
            if (this.bankElement.instance !== null) {
                this.bankElement.instance.style.transform = `rotate(${roll}deg)`;
                this.cutoutElement.instance.style.transform = `rotate(${-roll}deg)`;
                this.innerBankElement.instance.style.transform = `rotate(${roll}deg)`;
            }
        };
        /**
         * A callback called when the ADC updates from the event bus.
         * @param turnCoordinator The current ADC turn_coordinator_ball value.
         */
        this.onUpdateTurnCoordinator = (turnCoordinator) => {
            if (this.turnCoordinatorElement.instance !== null) {
                const translation = turnCoordinator * 54;
                this.turnCoordinatorElement.instance.style.transform = `translate3d(${translation}px, 0px, 0px)`;
            }
        };
        /**
         * Sets whether SVT scales are active or not.
         * @param svt The toggle for SVT.
         */
        this.updateSVTDisplay = (svt) => {
            if (svt) {
                this.numberIncrements = 2; // every n-th increment there is number
                this.scroll_increment = 10; // how big is one area to scroll
                this.pxPerDegY = SvtProjectionUtils.projectYawPitch(0, 0.1 * Avionics.Utils.DEG2RAD, 0, AttitudeIndicator.vec2Cache[0])[1] * 10;
            }
            else {
                this.numberIncrements = 4; // every n-th increment there is number
                this.scroll_increment = 20; // how big is one area to scroll
                this.pxPerDegY = SvtProjectionUtils.projectYawPitch(0, 0.1 * Avionics.Utils.DEG2RAD, 0, AttitudeIndicator.vec2Cache[0])[1] * 5; // pitch ratio is half of svt
            }
            this.pitchIncrementsDistance = (this.pxPerDegY * this.pitchIncrements);
            this.rebuildAttitudeLadder();
        };
    }
    /**
     * Builds pitch tick marks on the attitude indicator.
     */
    buildPitchLines() {
        for (let i = -this.scroll_increment; i < (this.scroll_increment + 1); i++) {
            const length = i % 4 == 0 ? 108 : i % 2 == 0 ? 54 : 28;
            const startX = 153 + (length == 108 ? 0 : length == 54 ? 27 : 40);
            const posY = 0 - (i * this.pitchIncrementsDistance);
            const endX = startX + length;
            const lineEl = FSComponent.buildComponent("line", { x1: startX, y1: posY, x2: endX, y2: posY, stroke: "white", "stroke-width": ".5px" }, ".");
            if (i === 0) {
                lineEl.instance.style.visibility = 'hidden';
                this.zeroPitchLine.instance = lineEl.instance;
            }
            FSComponent.render(lineEl, this.pitchLinesGroup.instance);
        }
    }
    /**
     * Builds the pitch value numbers for the attitude indicator.
     */
    buildPitchNumbers() {
        this.pitchNumbersLeft = [];
        this.pitchNumbersRight = [];
        for (let i = -this.scroll_increment; i < (this.scroll_increment + 1); i++) {
            const length = i % 4 == 0 ? 108 : i % 2 == 0 ? 54 : 28;
            const leftNumberX = 136 + (length == 108 ? 0 : length == 54 ? 27 : 40);
            const rightNumberX = 168 + (length == 108 ? 0 : length == 54 ? 27 : 40) + length;
            const startY = 6 - (i * this.pitchIncrementsDistance);
            if (i % this.numberIncrements == 0) {
                const number = Math.abs(i * this.pitchIncrements);
                const numberText = number !== 0 ? number.toFixed(0) : '';
                const textElementLeft = FSComponent.createRef();
                const textElementRight = FSComponent.createRef();
                const leftEl = FSComponent.buildComponent("text", { x: leftNumberX, y: startY, fill: "white", "font-family": "Roboto-Bold", "text-anchor": "middle", "font-size": "20px", stroke: "black", "stroke-width": "1px", ref: textElementLeft }, numberText);
                const rightEl = FSComponent.buildComponent("text", { x: rightNumberX, y: startY, fill: "white", "font-family": "Roboto-Bold", "text-anchor": "middle", "font-size": "20px", stroke: "black", "stroke-width": "1px", ref: textElementRight }, numberText);
                this.pitchNumbersLeft.push(textElementLeft);
                this.pitchNumbersRight.push(textElementRight);
                FSComponent.render(leftEl, this.pitchLinesGroup.instance);
                FSComponent.render(rightEl, this.pitchLinesGroup.instance);
            }
        }
    }
    /**
     * Rebuilds the attitude ladder.
     */
    rebuildAttitudeLadder() {
        this.pitchLinesGroup.instance.innerHTML = '';
        this.buildPitchLines();
        this.buildPitchNumbers();
        this.onUpdatePitch(this.currentPitch, true);
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        const adc = this.props.bus.getSubscriber();
        adc.on('turn_coordinator_ball')
            .withPrecision(2)
            .handle(this.onUpdateTurnCoordinator);
        PFDUserSettings.getManager(this.props.bus).whenSettingChanged('svtToggle').handle(this.updateSVTDisplay.bind(this));
        this.onUpdatePitch(this.currentPitch, true);
    }
    /**
     * Updates attitude indicator.
     * @param planeState The plane state information.
     */
    update(planeState) {
        this.onUpdatePitch(planeState.pitch, false);
        this.onUpdateRoll(planeState.roll);
    }
    /**
     * Updates pitch lines position.
     * @param pitch The current pitch value.
     */
    updateLinesPos(pitch) {
        pitch = pitch % this.scroll_increment;
        this.pitchLinesGroup.instance.style.transform = `translate3d(0px, ${pitch * (this.pxPerDegY)}px, 0px)`;
    }
    /**
     * Updates pitch number positions.
     * @param pitch The current pitch value.
     * @param offset The current scroll increment offset.
     */
    updatePitchNumbers(pitch, offset) {
        const initNumber = (this.scroll_increment * this.pitchIncrements) - (offset * this.scroll_increment);
        for (let i = 0; i < this.pitchNumbersLeft.length; i++) {
            const number = Math.abs(initNumber - (i * (this.pitchIncrements * this.numberIncrements)));
            const numberText = number !== 0 ? number.toFixed(0) : '';
            this.pitchNumbersLeft[i].instance.textContent = numberText;
            this.pitchNumbersRight[i].instance.textContent = numberText;
        }
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "attitude-container" },
            FSComponent.buildComponent("div", { class: "turn-coordinator", ref: this.turnCoordinatorElement },
                FSComponent.buildComponent("svg", null,
                    FSComponent.buildComponent("path", { d: "M 15 15 l 15 0 l -3 -6 l -24 0 l -3 6 l 15 0", fill: "#fff", stroke: "black", "stroke-width": ".5" }))),
            FSComponent.buildComponent("div", { class: "attitude-bank", ref: this.bankElement, style: "transform: rotate(0deg)" },
                FSComponent.buildComponent("svg", { width: "414", height: "315" },
                    FSComponent.buildComponent("path", { d: "M 207 214 m 0 -193 l -10 -20 l 20 0 l -10 20 a 193 193 0 0 1 32.53 2.76 l 2.43 -13.79 l 1.97 0.35 l -2.43 13.79 a 193 193 0 0 1 29.63 7.86 l 4.79 -13.16 l 1.88 0.68 l -4.79 13.16 a 193 193 0 0 1 28.76 13.22 l 14 -24.25 l 1.73 1 l -14 24.25 a 193 193 0 0 1 38.56 29.26 l 9.9 -9.9 l 1.41 1.41 l -9.9 9.9 a 193 193 0 0 1 29.67 38.24 l 24.24 -14 l 1 1.73 l -25.98 15 a 191 191 0 0 0 -330.8 0 l -25.98 -15 l 1 -1.73 l 24.25 14 a 193 193 0 0 1 29.67 -38.24 l -9.9 -9.9 l 1.41 -1.41 l 9.9 9.9 a 193 193 0 0 1 38.56 -29.26 l -14 -24.25 l 1.73 -1 l 14 24.25 a 193 193 0 0 1 28.76 -13.22 l -4.79 -13.16 l 1.88 -0.68 l 4.79 13.16 a 193 193 0 0 1 29.63 -7.86 l -2.43 -13.79 l 1.97 -0.35 l 2.43 13.79 a 193 193 0 0 1 32.53 -2.76", fill: "#fff", stroke: "black", "stroke-width": ".5" })),
                FSComponent.buildComponent("div", { class: "attitude-cutout", ref: this.cutoutElement, style: "transform: rotate(0deg)" },
                    FSComponent.buildComponent("div", { class: "attitude-inner-bank", ref: this.innerBankElement, style: "transform: rotate(0deg)" },
                        FSComponent.buildComponent("div", { class: "attitude-pitchlines", style: "transform: translate3d(0px, 0px, 0px)", ref: this.pitchLinesContainer },
                            FSComponent.buildComponent("svg", { width: "414px", style: "overflow:visible" },
                                FSComponent.buildComponent("g", { class: "pitchLines", ref: this.pitchLinesGroup })))))),
            FSComponent.buildComponent("svg", { width: "414", height: "315" },
                FSComponent.buildComponent("path", { d: "M 47 204 l -3 -4 l -43 0 l 0 4 ", fill: "rgb(255,255,0)", stroke: "black", "stroke-width": "1px" }),
                FSComponent.buildComponent("path", { d: "M 47 204 l -3 4 l -43 0 l 0 -4 ", fill: "rgb(152,140,0)", stroke: "black", "stroke-width": "1px" }),
                FSComponent.buildComponent("path", { d: "M 365 204 l 3 -4 l 43 0 l 0 4 ", fill: "rgb(255,255,0)", stroke: "black", "stroke-width": "1px" }),
                FSComponent.buildComponent("path", { d: "M 365 204 l 3 4 l 43 0 l 0 -4 ", fill: "rgb(152,140,0)", stroke: "black", "stroke-width": "1px" }),
                FSComponent.buildComponent("path", { d: "M 207 204 l 0 -1 l -120 31 l 35 0 ", fill: "rgb(255,255,0)", stroke: "black", "stroke-width": ".5px" }),
                FSComponent.buildComponent("path", { d: "M 207 204 l -66 30 l -19 0 ", fill: "rgb(152,140,0)", stroke: "black", "stroke-width": ".5px" }),
                FSComponent.buildComponent("path", { d: "M 207 204 l 0 -1 l 120 31 l -35 0 ", fill: "rgb(255,255,0)", stroke: "black", "stroke-width": ".5px" }),
                FSComponent.buildComponent("path", { d: "M 207 204 l 66 30 l 19 0 ", fill: "rgb(152,140,0)", stroke: "black", "stroke-width": ".5px" }),
                FSComponent.buildComponent("path", { d: "M 207 214 m 0 -192 l -10 20 l 20 0 l -10 -20 ", fill: "#fff", stroke: "black", "stroke-width": ".5" }))));
    }
}
AttitudeIndicator.vec2Cache = [new Float64Array(2)];
