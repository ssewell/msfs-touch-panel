import { DisplayComponent, FSComponent } from 'msfssdk';
/** FPL Active Leg States */
export var ActiveLegStates;
(function (ActiveLegStates) {
    ActiveLegStates[ActiveLegStates["RANDOM_DIRECT"] = 0] = "RANDOM_DIRECT";
    ActiveLegStates[ActiveLegStates["EXISTING_DIRECT"] = 1] = "EXISTING_DIRECT";
    ActiveLegStates[ActiveLegStates["NORMAL"] = 2] = "NORMAL";
    ActiveLegStates[ActiveLegStates["NONE"] = 3] = "NONE";
})(ActiveLegStates || (ActiveLegStates = {}));
/**
 * The FplActiveLegArrow component.
 */
export class FplActiveLegArrow extends DisplayComponent {
    constructor() {
        super(...arguments);
        /** The arrow refs for direct to existing and active leg */
        this.dtoArrowEl = FSComponent.createRef();
        this.fromLegArrow = FSComponent.createRef();
        this.legArrowRectangle = FSComponent.createRef();
        this.toLegArrow = FSComponent.createRef();
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        this.dtoArrowEl.instance.style.display = 'none';
        this.fromLegArrow.instance.style.display = 'none';
        this.toLegArrow.instance.style.display = 'none';
    }
    /**
     * Datermines the location and visibility of the active leg/direct to arrows on the FPL page.
     * @param state Is the ActiveLegState.
     * @param activeLeg Is the ActiveLegDefinition.
     * @param plan Is the flight plan.
     */
    updateArrows(state, activeLeg, plan) {
        try {
            switch (state) {
                case ActiveLegStates.NONE:
                case ActiveLegStates.RANDOM_DIRECT:
                    this.setDirectArrow(false);
                    this.setActiveLegArrow(false);
                    break;
                case ActiveLegStates.NORMAL:
                    this.setDirectArrow(false);
                    this.setActiveLegArrow(true, plan, activeLeg.segmentIndex, activeLeg.legIndex);
                    break;
                case ActiveLegStates.EXISTING_DIRECT:
                    this.setDirectArrow(true, activeLeg.segmentIndex, activeLeg.legIndex);
                    this.setActiveLegArrow(false);
                    break;
            }
        }
        catch (error) {
            console.warn(`updateArrows: ${error}`);
        }
    }
    /**
     * Sets the location and visibility of the direct to arrow in the flight plan display.
     * @param display whether to show or hide the arrow.
     * @param segmentIndex the segment index of the direct fix.
     * @param legIndex the leg index of the direct fix.
     */
    setDirectArrow(display, segmentIndex, legIndex) {
        this.dtoArrowEl.instance.style.display = display ? '' : 'none';
        if (display && segmentIndex !== undefined && legIndex !== undefined) {
            const top = this.props.getLegDomLocation(segmentIndex, legIndex);
            this.dtoArrowEl.instance.style.transform = `translate3d(0,${top}px,0)`;
        }
    }
    /**
     * Sets the location and visibility of the active leg arrow in the flight plan display.
     * @param display whether to show or hide the arrow.
     * @param plan the flight plan to process.
     * @param toSegmentIndex the segment index of the from leg.
     * @param tolegIndex the leg index of the from leg.
     */
    setActiveLegArrow(display, plan, toSegmentIndex = -1, tolegIndex = -1) {
        if (plan && display && ((toSegmentIndex > 0 && tolegIndex >= 0) || (toSegmentIndex == 0 && tolegIndex > 0))) {
            let fromSegmentIndex = -1;
            let fromLegIndex = -1;
            if (toSegmentIndex > 0 && tolegIndex == 0 && plan.getSegment(toSegmentIndex - 1).legs.length < 1 && toSegmentIndex < 2) {
                this.fromLegArrow.instance.style.display = 'none';
                this.toLegArrow.instance.style.display = 'none';
                return;
            }
            else if (tolegIndex == 0 && plan.getSegment(toSegmentIndex - 1).legs.length < 1) {
                fromSegmentIndex = toSegmentIndex - 2;
                fromLegIndex = plan.getSegment(fromSegmentIndex).legs.length - 1;
            }
            else if (tolegIndex == 0) {
                fromSegmentIndex = toSegmentIndex - 1;
                fromLegIndex = plan.getSegment(fromSegmentIndex).legs.length - 1;
            }
            else if (plan.directToData.segmentIndex > -1
                && plan.directToData.segmentLegIndex > -1
                && toSegmentIndex === plan.directToData.segmentIndex
                && tolegIndex === plan.directToData.segmentLegIndex + 4) {
                fromSegmentIndex = toSegmentIndex;
                fromLegIndex = tolegIndex - 4;
            }
            else {
                fromSegmentIndex = toSegmentIndex;
                fromLegIndex = tolegIndex - 1;
            }
            const top = this.props.getLegDomLocation(fromSegmentIndex, fromLegIndex);
            const bottom = this.props.getLegDomLocation(toSegmentIndex, tolegIndex);
            const height = bottom - top - 8;
            this.fromLegArrow.instance.style.transform = `translate3d(0,${top}px,0)`;
            this.legArrowRectangle.instance.setAttribute('height', `${height}`);
            this.toLegArrow.instance.style.transform = `translate3d(0,${bottom}px,0)`;
            this.fromLegArrow.instance.style.display = '';
            this.toLegArrow.instance.style.display = '';
        }
        else {
            this.fromLegArrow.instance.style.display = 'none';
            this.toLegArrow.instance.style.display = 'none';
        }
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", null,
            FSComponent.buildComponent("svg", { class: 'dto-arrow', ref: this.dtoArrowEl },
                FSComponent.buildComponent("path", { d: 'M 20 7 l -7 -7 l 0 5 l -8 0 l 0 4 l 8 0 l 0 5 l 7 -7 z', fill: "magenta" })),
            FSComponent.buildComponent("svg", { class: 'dynamic-from-arrow', ref: this.fromLegArrow },
                FSComponent.buildComponent("path", { d: 'M 20 -2 l -15 0 c -3 0 -5 2 -5 6 l 6 0 c 0 -1 1 -2 3 -2 l 11 0 l 0 -4', fill: "magenta" }),
                FSComponent.buildComponent("rect", { ref: this.legArrowRectangle, x: "0", y: "4", width: "6", height: "18", fill: "magenta" })),
            FSComponent.buildComponent("svg", { class: 'dynamic-to-arrow', ref: this.toLegArrow },
                FSComponent.buildComponent("path", { d: 'M 20 0 l -7 -7 l 0 5 l -4 0 c -2 0 -3 -1 -3 -2 l -6 0 c 0 4 2 6 5 6 l 8 0 l 0 5 l 7 -7', fill: "magenta" }))));
    }
}
