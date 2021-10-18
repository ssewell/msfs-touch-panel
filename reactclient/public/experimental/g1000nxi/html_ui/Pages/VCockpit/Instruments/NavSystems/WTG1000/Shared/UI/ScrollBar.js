import { DisplayComponent, FSComponent } from 'msfssdk';
import './ScrollBar.css';
/**
 * The Scrollbar.
 */
export class ScrollBar extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.svgRef = FSComponent.createRef();
        this.scrollBarRef = FSComponent.createRef();
        this.scrollThumbRef = FSComponent.createRef();
        this.scrollBarContainerRef = FSComponent.createRef();
        this.scrollableContainer = null;
        this.scrollListener = this.onScroll.bind(this);
        this.sizeChangeTimer = null;
        this.arrowPadding = 6;
        this._containerScrollHeight = 0;
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        if (this.scrollBarContainerRef.instance !== null) {
            this.scrollableContainer = this.scrollBarContainerRef.instance.previousElementSibling;
            if (this.scrollableContainer !== null) {
                // bind scroll event
                this.scrollableContainer.addEventListener('scroll', this.scrollListener);
            }
            // HINT: ResizeObserver doesn't exist in Coherent. MutationObserver doesn't perform well.
            // So we do this crap
            /**
             * Checks if the scrollheight of the container has changed and calls adjust
             */
            const diffAndAdjust = () => {
                var _a;
                if (this._containerScrollHeight !== ((_a = this.scrollableContainer) === null || _a === void 0 ? void 0 : _a.scrollHeight)) {
                    this.adjustScrollbarDimensions();
                }
            };
            this.sizeChangeTimer = setInterval(diffAndAdjust, 150);
        }
        this.onScroll();
    }
    /**
     * Adjusts the dimensions of the scrollbar elements.
     * @private
     */
    adjustScrollbarDimensions() {
        if (this.scrollableContainer) {
            const parentTop = this.scrollableContainer.offsetTop;
            this.scrollBarContainerRef.instance.style.top = `${parentTop + 4}px`;
            this._containerScrollHeight = this.scrollableContainer.scrollHeight;
            const containerHeight = this.scrollableContainer.clientHeight;
            const scrollToClientRatio = (this._containerScrollHeight / this.scrollableContainer.clientHeight);
            if (this.scrollThumbRef.instance !== null) {
                this.scrollThumbRef.instance.style.height = `${containerHeight / scrollToClientRatio}`.toString();
            }
            this.scrollBarContainerRef.instance.style.height = `${containerHeight}px`;
            this.svgRef.instance.setAttribute('height', `${containerHeight - 4}px`);
            this.scrollBarRef.instance.setAttribute('d', `M 5 0 l 2 3 l -4 0 l 2 -3 m 0 6 l 0 ${containerHeight - 16} m 0 6 l 2 -3 l -4 0 l 2 3`);
            this.scrollBarContainerRef.instance.style.display = (scrollToClientRatio <= 1.0) ? 'none' : '';
            this.onScroll();
        }
    }
    // TODO needs a method to adjust things on the fly.
    // also put some dimensions into variables
    /**
     * Eventhandler called when a scroll event in the scrollable parent container happens.
     */
    onScroll() {
        if (this.scrollableContainer) {
            // TODO ratio could also take the paddings into account for a more accurate bar
            if (this.scrollBarRef.instance !== null) {
                const ratio = this.scrollThumbRef.instance.getBBox().height / ((this.scrollBarRef.instance.getBBox().height) + this.scrollThumbRef.instance.getBBox().height);
                const scrollY = (this.scrollableContainer.scrollTop * ratio) + this.arrowPadding;
                if (!isNaN(scrollY)) {
                    this.scrollThumbRef.instance.setAttribute('y', scrollY.toString());
                }
            }
        }
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "scroll-bar", ref: this.scrollBarContainerRef },
            FSComponent.buildComponent("svg", { ref: this.svgRef },
                FSComponent.buildComponent("path", { ref: this.scrollBarRef, d: "M 5 0 l 2 3 l -4 0 l 2 -3 m 0 6 l 0 135 m 0 6 l 2 -3 l -4 0 l 2 3", fill: "rgb(150,150,150)", stroke: "rgb(150,150,150)", "stroke-width": "1px" }),
                FSComponent.buildComponent("rect", { ref: this.scrollThumbRef, x: "3", y: "6", width: "4", fill: "rgb(150,150,150)" }))));
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    destroy() {
        if (this.scrollableContainer) {
            this.scrollableContainer.removeEventListener('scroll', this.scrollListener);
        }
        if (this.sizeChangeTimer !== null) {
            clearInterval(this.sizeChangeTimer);
        }
    }
}
