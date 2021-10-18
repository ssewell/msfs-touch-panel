import { FSComponent, DisplayComponent } from 'msfssdk';
import { BaseGauge } from './BaseGauge';
/** Draw a single column of text. */
class XMLTextColumn extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.contentRef = FSComponent.createRef();
    }
    /** Do stuff after rendering. */
    onAfterRender() {
        if (this.props.content !== undefined) {
            this.contentRef.instance.textContent = this.props.logicHost.addLogicAsString(this.props.content, (content) => { this.contentRef.instance.textContent = content; });
        }
        else {
            // If a column has no content, we remove its flex weight to make room for the others.
            this.contentRef.instance.style.flex = '0';
        }
        if (this.props.color !== undefined) {
            this.contentRef.instance.style.color = this.props.logicHost.addLogicAsString(this.props.color, (content) => { this.contentRef.instance.style.color = content; });
        }
        if (this.props.fontSize !== undefined) {
            // The original code uses 10px for main text.  We're using 16.
            // In order to keep thigns proportional, font sizes that are
            // explicity set will be scaled up by the same factor.
            // TODO Sub-pixel rendering supported?
            this.contentRef.instance.style.fontSize = `${parseFloat(this.props.fontSize) * 1.6}px`;
        }
        if (this.props.class !== undefined) {
            this.contentRef.instance.classList.add(this.props.class);
        }
    }
    /**
     * Render the gauge.
     * @returns A VNode
     */
    render() {
        return FSComponent.buildComponent("div", { ref: this.contentRef, class: 'text_column_' + this.props.location });
    }
}
/** A text gauge display element. */
export class XMLTextGauge extends BaseGauge {
    /**
     * Initialize the rendered gauge.
     */
    initGauge() {
        // Just satisfying the base class.
        return;
    }
    /**
     * Render a text gauge
     * @returns A VNode
     */
    renderGauge() {
        return (FSComponent.buildComponent("div", { class: "text_gauge_container" },
            FSComponent.buildComponent(XMLTextColumn, Object.assign({ location: 'left', logicHost: this.props.logicHost }, this.props.left)),
            FSComponent.buildComponent(XMLTextColumn, Object.assign({ location: 'center', logicHost: this.props.logicHost }, this.props.center)),
            FSComponent.buildComponent(XMLTextColumn, Object.assign({ location: 'right', logicHost: this.props.logicHost }, this.props.right))));
    }
}
