import { FSComponent, DisplayComponent, Subject, MathUtils } from 'msfssdk';
import { NavSourceType } from 'msfssdk/instruments';
import { GPDisplayMode, NavSensitivity, VNavDisplayMode } from '../../../Shared/Navigation/NavIndicatorController';
import './VerticalDeviation.css';
/**
 * The PFD vertical deviation indicator.
 */
export class VerticalDeviation extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.vDevBoxDiv = FSComponent.createRef();
        this.diamondDiv = FSComponent.createRef();
        this.caretDiv = FSComponent.createRef();
        this.hideableObjectsDiv = FSComponent.createRef();
        this.sourceDiv = FSComponent.createRef();
        this.previewDiamondDiv = FSComponent.createRef();
        this.diamondPath = FSComponent.createRef();
        this.noStr = Subject.create('NO');
        this.gsgpStr = Subject.create('GS');
        this.deviationScale = 1;
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        this.registerComponent();
    }
    /**
     * A method called to update the deviation source and sensitivity.
     */
    updateSourceSensitivity() {
        const activeSource = this.props.navIndicatorController.navStates[this.props.navIndicatorController.activeSourceIndex];
        const vnavDisplayMode = this.props.navIndicatorController.vnavDisplayMode.get();
        const gpDisplayMode = this.props.navIndicatorController.gpDisplayMode.get();
        this.setVdevVisibility(activeSource, vnavDisplayMode, gpDisplayMode);
        this.setVnavVisibility(activeSource, vnavDisplayMode);
        this.setGlidepathVisibility(activeSource, gpDisplayMode);
        this.setPreviewGlidepathVisibility(activeSource, gpDisplayMode);
        this.setDeviationScale();
    }
    /**
     * A method called to update the deviation data.
     */
    updateDeviation() {
        const activeSource = this.props.navIndicatorController.navStates[this.props.navIndicatorController.activeSourceIndex];
        const vnavDisplayMode = this.props.navIndicatorController.vnavDisplayMode.get();
        const gpDisplayMode = this.props.navIndicatorController.gpDisplayMode.get();
        const vnavSource = this.props.navIndicatorController.navStates[2];
        if (vnavDisplayMode !== VNavDisplayMode.NONE) {
            const vnavDeviation = vnavSource.altDeviation;
            if (vnavDeviation !== null) {
                this.setVNavDeviation(vnavDeviation);
            }
        }
        if (activeSource.source.type === NavSourceType.Nav && activeSource.hasGlideslope && activeSource.gsDeviation !== null) {
            this.setDeviation(activeSource.gsDeviation);
        }
        else if (gpDisplayMode !== GPDisplayMode.NONE) {
            const lpvDeviation = vnavSource.gsDeviation;
            if (lpvDeviation !== null && lpvDeviation) {
                this.setDeviation(lpvDeviation);
            }
        }
    }
    /**
     * A method called to update the visibility of the entire VDEV Indicator.
     * @param activeSource The Active Source
     * @param vnavDisplayMode The VNAV Display Mode
     * @param gpDisplayMode The GP Display Mode
     */
    setVdevVisibility(activeSource, vnavDisplayMode, gpDisplayMode) {
        if (activeSource.source.type !== null && (vnavDisplayMode !== VNavDisplayMode.NONE || gpDisplayMode !== GPDisplayMode.NONE
            || (activeSource.source.type === NavSourceType.Nav && activeSource.isLocalizer))) {
            this.setSource(activeSource.source.type, vnavDisplayMode, gpDisplayMode);
            this.setVdevVisible(true);
            if (vnavDisplayMode === VNavDisplayMode.NONE && activeSource.source.type === NavSourceType.Nav && !activeSource.hasGlideslope) {
                this.setNoSignalVisible(true);
            }
            else {
                this.setNoSignalVisible(false);
            }
        }
        else {
            this.setVdevVisible(false);
            this.setNoSignalVisible(true);
        }
    }
    /**
     * A method called to update the vnav carrot visibility.
     * @param activeSource The Active Source
     * @param vnavDisplayMode The VNAV Display Mode
     */
    setVnavVisibility(activeSource, vnavDisplayMode) {
        if (vnavDisplayMode === VNavDisplayMode.PATH) {
            this.caretDiv.instance.style.display = '';
        }
        else {
            this.caretDiv.instance.style.display = 'none';
        }
    }
    /**
     * A method called to update the preview glidepath visibility.
     * @param activeSource The Active Source
     * @param gpDisplayMode The GP Display Mode
     */
    setPreviewGlidepathVisibility(activeSource, gpDisplayMode) {
        if (gpDisplayMode === GPDisplayMode.PREVIEW && activeSource.source.type === NavSourceType.Gps && activeSource.hasGlideslope) {
            this.previewDiamondDiv.instance.style.display = '';
        }
        else {
            this.previewDiamondDiv.instance.style.display = 'none';
        }
    }
    /**
     * A method called to update the active glideslope/glidepath visibility.
     * @param activeSource The Active Source
     * @param gpDisplayMode The GP Display Mode
     */
    setGlidepathVisibility(activeSource, gpDisplayMode) {
        if (gpDisplayMode === GPDisplayMode.ACTIVE && activeSource.hasGlideslope) {
            this.diamondPath.instance.setAttribute('fill', 'magenta');
            this.diamondDiv.instance.style.display = '';
        }
        else if (activeSource.source.type === NavSourceType.Nav && activeSource.hasGlideslope) {
            this.diamondPath.instance.setAttribute('fill', 'rgb(0,255,0)');
            this.diamondDiv.instance.style.display = '';
        }
        else {
            this.diamondDiv.instance.style.display = 'none';
        }
    }
    /**
     * Sets the vdev box visible.
     * @param visible is a bool whether to set this visible or not.
     */
    setVdevVisible(visible) {
        this.vDevBoxDiv.instance.style.display = visible ? '' : 'none';
    }
    /**
     * Sets the NO GS/NO GP display depending on if there is a signal.
     * @param visible is a bool whether to set this visible or not.
     */
    setNoSignalVisible(visible) {
        this.hideableObjectsDiv.instance.style.display = visible ? 'none' : '';
        this.diamondDiv.instance.style.display = visible ? 'none' : '';
        this.noStr.set(visible ? 'NO' : '');
        this.gsgpStr.set(visible ? 'GS' : '');
    }
    /**
     * Sets the source type indicator on the Vertical Deviation Indicator
     * @param source The Active Source
     * @param vnavDisplayMode The VNAV Display Mode
     * @param gpDisplayMode The GP Display Mode
     */
    setSource(source, vnavDisplayMode, gpDisplayMode) {
        if (vnavDisplayMode === VNavDisplayMode.PATH) {
            this.sourceDiv.instance.textContent = 'V';
            this.sourceDiv.instance.style.color = 'magenta';
        }
        else {
            this.sourceDiv.instance.textContent = 'G';
            if (gpDisplayMode !== GPDisplayMode.NONE && source === NavSourceType.Gps) {
                this.sourceDiv.instance.style.color = 'magenta';
            }
            else {
                this.sourceDiv.instance.style.color = 'rgb(0,255,0)';
            }
        }
    }
    /**
     * Sets the vdev scale.
     */
    setDeviationScale() {
        switch (this.props.navIndicatorController.activeSensitivity) {
            case NavSensitivity.ILS:
                this.deviationScale = 0.7;
                break;
            default:
                this.deviationScale = 1;
        }
    }
    /**
     * Sets the vdev deviation value
     * (sets both the preview and active deviation, since they do not appear at the same time).
     * @param vdev is a bool whether to set this visible or not.
     */
    setDeviation(vdev) {
        const deviation = 100 * (vdev / this.deviationScale);
        this.diamondDiv.instance.style.transform = `translate3d(0px, ${MathUtils.clamp(deviation, -100, 105)}px, 0px)`;
        this.previewDiamondDiv.instance.style.transform = `translate3d(0px, ${MathUtils.clamp(deviation, -100, 105)}px, 0px)`;
    }
    /**
     * Sets the vdev deviation value.
     * @param vdev is a bool whether to set this visible or not.
     */
    setVNavDeviation(vdev) {
        const deviation = 100 * (vdev / this.deviationScale);
        this.caretDiv.instance.style.transform = `translate3d(0px, ${MathUtils.clamp(deviation, -100, 105)}px, 0px)`;
    }
    /**
     * Registers the vertical deviation component with the NavIndicatorController.
     */
    registerComponent() {
        this.props.navIndicatorController.vdi = this;
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "verticaldev-box", ref: this.vDevBoxDiv },
            FSComponent.buildComponent("div", { class: "vertdev-background" },
                FSComponent.buildComponent("div", { class: "vertdev-static-circles" },
                    FSComponent.buildComponent("svg", { width: "24", height: "204px" },
                        FSComponent.buildComponent("circle", { cx: "12", cy: "20", r: "3", stroke: "white", "stroke-width": "1px", fill: "none" }),
                        FSComponent.buildComponent("circle", { cx: "12", cy: "180", r: "3", stroke: "white", "stroke-width": "1px", fill: "none" }))),
                FSComponent.buildComponent("div", { class: 'vertdev-objects', ref: this.hideableObjectsDiv },
                    FSComponent.buildComponent("svg", null,
                        FSComponent.buildComponent("line", { x1: "0", y1: "100", x2: "24", y2: "100", stroke: "gray", "stroke-width": "1px" }),
                        FSComponent.buildComponent("circle", { cx: "12", cy: "60", r: "3", stroke: "white", "stroke-width": "1px", fill: "none" }),
                        FSComponent.buildComponent("circle", { cx: "12", cy: "140", r: "3", stroke: "white", "stroke-width": "1px", fill: "none" }))),
                FSComponent.buildComponent("div", { class: "vertdev-diamond-deviation", ref: this.diamondDiv },
                    FSComponent.buildComponent("svg", null,
                        FSComponent.buildComponent("path", { ref: this.diamondPath, d: "M 12 0 l -8 10 l 8 10 l 8 -10 z", fill: "rgb(0,255,0)", stroke: "black", "stroke-linejoin": "round", "stroke-width": "1px" }))),
                FSComponent.buildComponent("div", { class: "vertdev-diamond-deviation", ref: this.previewDiamondDiv },
                    FSComponent.buildComponent("svg", null,
                        FSComponent.buildComponent("path", { d: "M 12 3 l -8 10 l 8 10 l 8 -10 z", stroke: "grey", "stroke-linejoin": "round", fill: "none", "stroke-width": "3px" }))),
                FSComponent.buildComponent("div", { class: "vertdev-vnav-deviation", ref: this.caretDiv },
                    FSComponent.buildComponent("svg", null,
                        FSComponent.buildComponent("path", { d: "M 20 0 l -19 10 l 19 10 l 0 -4 l -12 -6 l 12 -6 z", fill: "magenta", stroke: "black", "stroke-width": "1px" })))),
            FSComponent.buildComponent("div", { class: "vertdev-source", ref: this.sourceDiv }, "G"),
            FSComponent.buildComponent("div", { class: "NO" },
                FSComponent.buildComponent("span", null, this.noStr)),
            FSComponent.buildComponent("div", { class: "GSGP" },
                FSComponent.buildComponent("span", null, this.gsgpStr))));
    }
}
