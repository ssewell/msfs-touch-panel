import { FSComponent, DisplayComponent, Subject, NavMath } from 'msfssdk';
import { NavSourceType } from 'msfssdk/instruments';
import { VorToFrom } from 'msfssdk/instruments';
import { NavSensitivity, ObsSuspModes } from '../../../Shared/Navigation/NavIndicatorController';
import './HSIMapCourseDeviation.css';
/**
 * The course needles component on the HSI.
 */
export class HSIMapCourseDeviation extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.el = FSComponent.createRef();
        this.diamondIndicatorDiv = FSComponent.createRef();
        this.triangleIndicatorDiv = FSComponent.createRef();
        this.diamondIndicatorPath = FSComponent.createRef();
        this.triangleIndicatorPath = FSComponent.createRef();
        this.hsiMapDeviation = FSComponent.createRef();
        this.hideableObjects = FSComponent.createRef();
        this.noSignalDiv = FSComponent.createRef();
        this.suspDiv = FSComponent.createRef();
        this.currentDeviation = 0;
        this.noSignalStr = Subject.create('SIGNAL');
        this.xtkStr = Subject.create('0');
        this.xtkUnit = Subject.create('NM');
        this.sensitivityStr = Subject.create('ENR');
        this.sensitivityRef = FSComponent.createRef();
        this.sourceStr = Subject.create('GPS');
        this.sourceRef = FSComponent.createRef();
    }
    /**
     * A callback called after rendering is complete.
     */
    onAfterRender() {
        this.setVisible(this.triangleIndicatorDiv, false);
        this.setVisible(this.diamondIndicatorDiv, false);
        this.setVisible(this.noSignalDiv, false);
    }
    /**
     * A method called from Hsi Controller that commands an update on a change in any relevant value
     */
    updateData() {
        const xtk = this.props.controller.navStates[this.props.controller.activeSourceIndex].deviation;
        if (xtk !== null) {
            this.setDeviation(xtk);
        }
        this.setFromTo(this.props.controller.navStates[this.props.controller.activeSourceIndex].toFrom);
    }
    /**
     * Sets the deviation indicator when there is no DTK.
     * @param value is a bool of whether to set 'no dtk' or remove 'no dtk'
     */
    setNoSignal(value) {
        if (value) {
            this.setVisible(this.triangleIndicatorDiv, false);
            this.setVisible(this.diamondIndicatorDiv, false);
            this.setVisible(this.hideableObjects, false);
            this.setVisible(this.noSignalDiv, true);
            switch (this.sourceStr.get()) {
                case 'GPS':
                    this.noSignalStr.set('NO DTK');
                    break;
                case 'LOC1':
                case 'LOC2':
                    this.noSignalStr.set('NO LOC');
                    break;
                case 'VOR1':
                case 'VOR2':
                    this.noSignalStr.set('NO VOR');
                    break;
            }
        }
        else {
            this.setVisible(this.hideableObjects, true);
            this.setVisible(this.noSignalDiv, false);
            this.noSignalStr.set('SIGNAL');
            this.updateSourceSensitivity();
            this.updateData();
        }
    }
    /**
     * Sets the to/from orientation of the triangle.
     * @param toFrom is the to/from object to be processed
     */
    setFromTo(toFrom) {
        if (this.noSignalStr.get() != 'SIGNAL' && toFrom !== VorToFrom.OFF) {
            this.setNoSignal(false);
            return;
        }
        else if (this.noSignalStr.get() != 'SIGNAL') {
            switch (this.sourceStr.get()) {
                case 'GPS':
                    this.noSignalStr.set('NO DTK');
                    break;
                case 'LOC1':
                case 'LOC2':
                    this.noSignalStr.set('NO LOC');
                    break;
                case 'VOR1':
                case 'VOR2':
                    this.noSignalStr.set('NO VOR');
                    break;
            }
        }
        if (toFrom === VorToFrom.FROM) {
            this.triangleIndicatorDiv.instance.style.transform = 'rotate3d(0, 0, 1, 180deg)';
        }
        else {
            this.triangleIndicatorDiv.instance.style.transform = 'rotate3d(0, 0, 1, 0deg)';
            if (toFrom === VorToFrom.OFF) {
                this.setNoSignal(true);
            }
        }
    }
    /**
     * Sets the deviation of the course needle.
     * @param deviation The deviation of the course needle.
     */
    setDeviation(deviation) {
        this.currentDeviation = deviation;
        const deviationPercent = this.currentDeviation;
        const deviationPixels = NavMath.clamp(deviationPercent, -1, 1) * 90.5;
        if (this.currentDeviation >= -1) {
            this.hsiMapDeviation.instance.style.display = '';
            this.hsiMapDeviation.instance.style.transform = `translate3d(${deviationPixels}px, 0px, 0px)`;
        }
        else {
            this.hsiMapDeviation.instance.style.display = 'none';
        }
    }
    /**
     * Updates the Source and Sensitivity Fields.
     */
    updateSourceSensitivity() {
        switch (this.props.controller.navStates[this.props.controller.activeSourceIndex].source.type) {
            case NavSourceType.Nav:
                if (this.props.controller.navStates[this.props.controller.activeSourceIndex].isLocalizer) {
                    this.sourceStr.set(`LOC${this.props.controller.navStates[this.props.controller.activeSourceIndex].source.index}`);
                    this.setVisible(this.triangleIndicatorDiv, false);
                    this.setVisible(this.diamondIndicatorDiv, true);
                    this.diamondIndicatorPath.instance.setAttribute('fill', 'rgb(0,255,0)');
                }
                else {
                    this.sourceStr.set(`VOR${this.props.controller.navStates[this.props.controller.activeSourceIndex].source.index}`);
                    this.setVisible(this.triangleIndicatorDiv, true);
                    this.setVisible(this.diamondIndicatorDiv, false);
                    this.triangleIndicatorPath.instance.setAttribute('fill', 'rgb(0,255,0)');
                }
                this.sensitivityRef.instance.style.display = 'none';
                this.sensitivityStr.set('');
                this.sourceRef.instance.style.color = '#00ff00';
                this.suspDiv.instance.style.display = 'none';
                this.suspDiv.instance.textContent = '';
                break;
            case NavSourceType.Gps:
                this.sensitivityRef.instance.style.display = '';
                this.sensitivityStr.set(`${this.props.controller.activeSensitivity}`);
                this.sourceRef.instance.style.color = 'magenta';
                this.sourceStr.set('GPS');
                this.setVisible(this.noSignalDiv, false);
                this.setVisible(this.hideableObjects, true);
                switch (this.props.controller.activeSensitivity) {
                    case NavSensitivity.LNAV:
                    case NavSensitivity.LP:
                    case NavSensitivity.LPV:
                    case NavSensitivity.LVNAV:
                    case NavSensitivity.VIS:
                        this.diamondIndicatorPath.instance.setAttribute('fill', 'magenta');
                        this.setVisible(this.triangleIndicatorDiv, false);
                        this.setVisible(this.diamondIndicatorDiv, true);
                        break;
                    default:
                        this.triangleIndicatorPath.instance.setAttribute('fill', 'magenta');
                        this.setVisible(this.triangleIndicatorDiv, true);
                        this.setVisible(this.diamondIndicatorDiv, false);
                        break;
                }
                switch (this.props.controller.obsSuspMode) {
                    case ObsSuspModes.SUSP:
                        this.suspDiv.instance.textContent = 'SUSP';
                        this.suspDiv.instance.style.display = '';
                        break;
                    case ObsSuspModes.OBS:
                        this.suspDiv.instance.textContent = 'OBS';
                        this.suspDiv.instance.style.display = '';
                        break;
                    default:
                        this.suspDiv.instance.style.display = 'none';
                        this.suspDiv.instance.textContent = '';
                        break;
                }
                break;
        }
    }
    /**
     * Sets whether or not the course needle is visible.
     * @param ref is the node reference to adjust
     * @param isVisible The visibility of the course needle.
     */
    setVisible(ref, isVisible) {
        if (ref && ref.instance !== null) {
            ref.instance.style.display = isVisible ? '' : 'none';
        }
    }
    /**
     * Renders the course needles component.
     * @returns The rendered VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { ref: this.el },
            FSComponent.buildComponent("div", { class: "hsi-map-nav-src", ref: this.sourceRef }, this.sourceStr),
            FSComponent.buildComponent("div", { class: 'hsi-map-coursedev-objects hsi-map-coursedev-objects-boxstyle' },
                FSComponent.buildComponent("svg", null,
                    FSComponent.buildComponent("circle", { cx: "20", cy: "10.5", r: "3", stroke: "white", "stroke-width": "1px", fill: "none" }),
                    FSComponent.buildComponent("circle", { cx: "161", cy: "10.5", r: "3", stroke: "white", "stroke-width": "1px", fill: "none" }))),
            FSComponent.buildComponent("div", { class: 'hsi-map-coursedev-objects', ref: this.hideableObjects },
                FSComponent.buildComponent("svg", null,
                    FSComponent.buildComponent("line", { x1: "90.5", y1: "1", x2: "90.5", y2: "22", stroke: "gray", "stroke-width": "1px" }),
                    FSComponent.buildComponent("circle", { cx: "55", cy: "11.5", r: "3", stroke: "white", "stroke-width": "1px", fill: "none" }),
                    FSComponent.buildComponent("circle", { cx: "126", cy: "11.5", r: "3", stroke: "white", "stroke-width": "1px", fill: "none" })),
                FSComponent.buildComponent("div", { class: "hsi-map-deviation", ref: this.hsiMapDeviation },
                    FSComponent.buildComponent("div", { class: "hsi-map-triangle-deviation", ref: this.triangleIndicatorDiv },
                        FSComponent.buildComponent("svg", null,
                            FSComponent.buildComponent("path", { ref: this.triangleIndicatorPath, d: "M 9.5 0 L 0 18 L 18 18 z", fill: "magenta", stroke: "black", "stroke-width": "1px" }))),
                    FSComponent.buildComponent("div", { class: "hsi-map-diamond-deviation", ref: this.diamondIndicatorDiv },
                        FSComponent.buildComponent("svg", null,
                            FSComponent.buildComponent("path", { ref: this.diamondIndicatorPath, d: "M 9.5 1 l -8 8 l 8 8 l 8 -8 z", fill: "rgb(0,255,0)", stroke: "black", "stroke-width": "1px" }))))),
            FSComponent.buildComponent("div", { class: 'hsi-map-coursedev-nosignal-text', ref: this.noSignalDiv }, this.noSignalStr),
            FSComponent.buildComponent("div", { class: "hsi-map-gps-xtrack" },
                this.xtkStr,
                FSComponent.buildComponent("span", { class: "size12" }, this.xtkUnit)),
            FSComponent.buildComponent("div", { class: "hsi-map-nav-sensitivity", ref: this.sensitivityRef }, this.sensitivityStr),
            FSComponent.buildComponent("div", { class: "hsi-map-nav-susp", ref: this.suspDiv }, "SUSP")));
    }
}
