import { FSComponent, DisplayComponent } from 'msfssdk';
/**
 * A compass rose display component.
 */
export class CompassRose extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.bearingPointerCircleElement = FSComponent.createRef();
    }
    /**
     * Builds the compass rose tick marks.
     * @returns A collection of rose tick line elements.
     */
    buildRose() {
        const lines = [];
        const half = this.props.size / 2;
        const roseRadius = half - this.props.margin;
        for (let i = 0; i < 360; i += 5) {
            const length = i % 10 == 0 ? 15 : 8;
            const startX = half + (roseRadius - length) * Math.cos(i * Math.PI / 180);
            const startY = half + (roseRadius - length) * Math.sin(i * Math.PI / 180);
            const endX = startX + (length * Math.cos(i * Math.PI / 180));
            const endY = startY + (length * Math.sin(i * Math.PI / 180));
            lines.push(FSComponent.buildComponent("line", { x1: startX, y1: startY, x2: endX, y2: endY, stroke: "white", "stroke-width": "1.8px" }));
        }
        return lines;
    }
    /**
     * Builds the compass rose letter markings.
     * @returns A collection of letter marking text elements.
     */
    buildRoseMarkings() {
        const half = this.props.size / 2;
        const texts = ['N', '3', '6', 'E', '12', '15', 'S', '21', '24', 'W', '30', '33'];
        const letters = [];
        let angle = 0;
        for (let i = 0; i < texts.length; i++) {
            const fontSize = i % 3 === 0 ? '26' : '20';
            const yValue = i % 3 === 0 ? (38 + this.props.margin).toFixed(0) : (32 + this.props.margin).toFixed(0);
            letters.push(FSComponent.buildComponent("text", { x: half, y: yValue, transform: `rotate(${angle}, ${half}, ${half})`, fill: "white", "text-anchor": "middle", "font-size": fontSize }, texts[i]));
            angle += 360 / texts.length;
        }
        return letters;
    }
    /**
     * Sets whether or not the bearing pointer circle is visible.
     * @param isVisible Whether or not the bearing pointer circle is visible.
     */
    setCircleVisible(isVisible) {
        this.bearingPointerCircleElement.instance.style.display = isVisible ? '' : 'none';
    }
    /**
     * Renders the component.
     * @returns The rendered VNode.
     */
    render() {
        const viewBox = `0 0 ${this.props.size} ${this.props.size}`;
        const half = `${this.props.size / 2}px`;
        const radius = `${(this.props.size / 2) - this.props.margin}px`;
        return (FSComponent.buildComponent("svg", { viewBox: viewBox },
            FSComponent.buildComponent("radialGradient", { id: "bgFill" },
                FSComponent.buildComponent("stop", { offset: "80%", "stop-color": "rgb(0,0,0)", "stop-opacity": "0.00" }),
                FSComponent.buildComponent("stop", { offset: "100%", "stop-color": "rgb(0,0,0)", "stop-opacity": "0.75" })),
            FSComponent.buildComponent("circle", { cx: half, cy: half, r: radius, fill: this.props.gradient ? 'url("#bgFill")' : 'rgba(0,0,0,.3)' }),
            FSComponent.buildComponent("circle", { ref: this.bearingPointerCircleElement, cx: half, cy: half, r: "82px", stroke: "white", "stroke-width": "1px", fill: "none" }),
            this.buildRose(),
            this.buildRoseMarkings()));
    }
}
