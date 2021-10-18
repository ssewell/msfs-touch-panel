import { FSComponent, DisplayComponent, Subject, ComputedSubject, MathUtils } from 'msfssdk';
import { APLockType } from 'msfssdk/instruments';
import { GPDisplayMode, VNavDisplayMode } from '../../../Shared/Navigation/NavIndicatorController';
import './VerticalSpeedIndicator.css';
/**
 * The PFD vertical speed indicator.
 */
export class VerticalSpeedIndicator extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.verticalSpeedPointer = FSComponent.createRef();
        this.desiredSpeedPointer = FSComponent.createRef();
        this.selectedVerticalSpeed = FSComponent.createRef();
        this.selectedVSBug = FSComponent.createRef();
        this.previousVSNumber = 0;
        this.verticalSpeedValue = Subject.create(0);
        this.verticalSpeedVisible = Subject.create('');
        this.selectedVsVisibility = Subject.create(false);
        this.selectedVsValue = Subject.create(0);
        this.vnavDisplayMode = VNavDisplayMode.NONE;
        this.gpDisplayMode = GPDisplayMode.NONE;
        this.selectedVsValueTransform = ComputedSubject.create(0, (v) => {
            return `translate3d(0px, ${MathUtils.clamp(v, -2250, 2250) * -0.064}px, 0px)`;
        });
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        this.selectedVSBug.instance.classList.add('hide-element');
        this.selectedVerticalSpeed.instance.classList.add('hide-element');
        const adc = this.props.bus.getSubscriber();
        const vnav = this.props.bus.getSubscriber();
        const ap = this.props.bus.getSubscriber();
        adc.on('vs')
            .withPrecision(-1)
            .handle(this.updateVerticalSpeed.bind(this));
        vnav.on('vnavRequiredVs').whenChanged().handle(reqVs => this.updateDesiredSpeedPointer(reqVs));
        this.props.navIndicatorController.vnavDisplayMode.sub((mode) => {
            this.vnavDisplayMode = mode;
            this.updateDesiredSpeedPointerVisibility();
        });
        this.props.navIndicatorController.gpDisplayMode.sub((mode) => {
            this.gpDisplayMode = mode;
            this.updateDesiredSpeedPointerVisibility();
        });
        ap.on('vs_hold_fpm').handle((value) => {
            this.selectedVsValue.set(value);
            this.selectedVsValueTransform.set(value);
            this.updateSelectedVSBug();
        });
        ap.on('ap_lock_release').handle((unlock) => {
            if (unlock === APLockType.Vs) {
                this.selectedVsVisibility.set(false);
                this.selectedVSBug.instance.classList.add('hide-element');
                this.selectedVerticalSpeed.instance.classList.add('hide-element');
            }
        });
        ap.on('ap_lock_set').handle((lock) => {
            if (lock === APLockType.Vs) {
                this.selectedVsVisibility.set(true);
                this.selectedVSBug.instance.classList.remove('hide-element');
                this.selectedVerticalSpeed.instance.classList.remove('hide-element');
            }
        });
    }
    /**
     * Updates the vertical speed indicator when the vertical speed changes.
     * @param vs The new vertical speed.
     */
    updateVerticalSpeed(vs) {
        const quantizedVS = Math.ceil(vs / 50) * 50;
        this.updateVerticalSpeedPointer(vs);
        if (quantizedVS !== this.previousVSNumber) {
            this.previousVSNumber = quantizedVS;
            this.verticalSpeedVisible.set((vs > 50 || vs < -100) ? 'visible' : 'hidden');
            this.verticalSpeedValue.set(quantizedVS);
        }
    }
    /**
     * Updates the transform of the vertical speed pointer
     * @param vs The vertical speed
     */
    updateVerticalSpeedPointer(vs) {
        if (this.verticalSpeedPointer.instance !== null) {
            const clampedVs = MathUtils.clamp(vs, -2250, 2250);
            this.verticalSpeedPointer.instance.style.transform = `translate3d(0px, ${clampedVs * -0.064}px, 0px)`;
        }
    }
    /**
     * Updates the transform of the selected vertical speed bug
     */
    updateSelectedVSBug() {
        if (this.selectedVSBug.instance !== null) {
            this.selectedVSBug.instance.style.transform = `${this.selectedVsValueTransform.get()}`;
        }
    }
    /**
     * Updates the transform of the desired speed pointer
     * @param requiredVs The required Vertical Speed from VNAV.
     */
    updateDesiredSpeedPointer(requiredVs) {
        if (this.vnavDisplayMode !== VNavDisplayMode.NONE || this.gpDisplayMode !== GPDisplayMode.NONE) {
            const clampedVs = MathUtils.clamp(requiredVs, -2200, 0);
            this.desiredSpeedPointer.instance.style.transform = `translate3d(0px, ${clampedVs * -0.064}px, 0px)`;
        }
    }
    /**
     * Updates the visibility of the desired speed pointer.
     */
    updateDesiredSpeedPointerVisibility() {
        if (this.vnavDisplayMode === VNavDisplayMode.NONE && this.gpDisplayMode === GPDisplayMode.NONE) {
            this.desiredSpeedPointer.instance.style.display = 'none';
        }
        else {
            this.desiredSpeedPointer.instance.style.display = '';
        }
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "vsi-container" },
            FSComponent.buildComponent("svg", { height: "305px", width: "75" },
                FSComponent.buildComponent("defs", null,
                    FSComponent.buildComponent("linearGradient", { id: "vsiGradient", x1: "0%", y1: "0%", x2: "0%", y2: "100%" },
                        FSComponent.buildComponent("stop", { offset: "0%", style: "stop-color:rgb(80,80,80)" }),
                        FSComponent.buildComponent("stop", { offset: "100%", style: "stop-color:rgb(0,0,0)" }))),
                FSComponent.buildComponent("path", { d: "M 0 0 l 38 0 c 5 0 10 5 10 10 l 0 105 l -48 33 l 48 33 l 0 105 c 0 5 -5 10 -10 10 l -38 0", fill: "none", stroke: "url(#vsiGradient)", "stroke-width": "1px" }),
                FSComponent.buildComponent("path", { d: "M 15 137.691 l -15 10.309 l 15 10.312", fill: "none", stroke: "whitesmoke", "stroke-width": "2px" }),
                FSComponent.buildComponent("line", { x1: "2", y1: "20", x2: "16", y2: "20", style: "stroke:rgb(150,150,150);stroke-width:2px" }),
                FSComponent.buildComponent("text", { x: "25", y: "27", style: "fill:whitesmoke;font-size:20px" }, "2"),
                FSComponent.buildComponent("line", { x1: "2", y1: "52", x2: "10", y2: "52", style: "stroke:rgb(150,150,150);stroke-width:2px" }),
                FSComponent.buildComponent("line", { x1: "2", y1: "84", x2: "16", y2: "84", style: "stroke:rgb(150,150,150);stroke-width:2px" }),
                FSComponent.buildComponent("text", { x: "25", y: "91", style: "fill:whitesmoke;font-size:20px" }, "1"),
                FSComponent.buildComponent("line", { x1: "2", y1: "116", x2: "10", y2: "116", style: "stroke:rgb(150,150,150);stroke-width:2px" }),
                FSComponent.buildComponent("line", { x1: "2", y1: "180", x2: "10", y2: "180", style: "stroke:rgb(150,150,150);stroke-width:2px" }),
                FSComponent.buildComponent("line", { x1: "2", y1: "212", x2: "16", y2: "212", style: "stroke:rgb(150,150,150);stroke-width:2px" }),
                FSComponent.buildComponent("text", { x: "25", y: "219", style: "fill:whitesmoke;font-size:20px" }, "1"),
                FSComponent.buildComponent("line", { x1: "2", y1: "244", x2: "10", y2: "244", style: "stroke:rgb(150,150,150);stroke-width:2px" }),
                FSComponent.buildComponent("line", { x1: "2", y1: "276", x2: "16", y2: "276", style: "stroke:rgb(150,150,150);stroke-width:2px" }),
                FSComponent.buildComponent("text", { x: "25", y: "283", style: "fill:whitesmoke;font-size:20px" }, "2")),
            FSComponent.buildComponent("div", { ref: this.desiredSpeedPointer, class: "vsi-pointer", style: 'display: none' },
                FSComponent.buildComponent("svg", { height: "25px", width: "25px" },
                    FSComponent.buildComponent("path", { d: "m 2 9 l 14 -9 l 0 4 l -13 8 l 13 8 l 0 4 l -14 -9 z", fill: "magenta", stroke: "1px black" }))),
            FSComponent.buildComponent("div", { ref: this.verticalSpeedPointer, class: "vsi-pointer" },
                FSComponent.buildComponent("svg", { height: "25px", width: "68px" },
                    FSComponent.buildComponent("path", { d: "M 2 10 l 16 -10 l 47 0 c 2 0 3 1 3 3 l 0 16 c 0 2 -1 3 -3 3 l -47 0 l -16 -10 z ", fill: "black" }),
                    FSComponent.buildComponent("text", { x: "63", y: "18", "font-size": "20", "text-anchor": "end", fill: "white", visibility: this.verticalSpeedVisible }, this.verticalSpeedValue))),
            FSComponent.buildComponent("div", { ref: this.selectedVSBug, class: "vsi-selected-vs-bug" },
                FSComponent.buildComponent("svg", null,
                    FSComponent.buildComponent("path", { d: 'M 0 0 l 8 0 l 0 4.25 l -6 3.75 l 0 2 l 6 3.75 l 0 4.25 l -8 0 z', fill: "cyan", stroke: "black", "stroke-width": "1px" }))),
            FSComponent.buildComponent("div", { ref: this.selectedVerticalSpeed, class: "vsi-selected-vs" }, this.selectedVsValue)));
    }
}
