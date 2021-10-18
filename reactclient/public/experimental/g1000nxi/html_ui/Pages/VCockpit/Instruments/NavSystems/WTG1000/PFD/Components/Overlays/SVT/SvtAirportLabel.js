import { DisplayComponent, FSComponent } from 'msfssdk';
import { ICAO } from 'msfssdk/navigation';
import { SvtProjectionUtils } from '../../../../Shared/UI/SvtProjectionUtils';
/**
 * The SvtAirportLabel component.
 */
export class SvtAirportLabel extends DisplayComponent {
    /**
     * Ctor
     * @param props the props
     */
    constructor(props) {
        super(props);
        this.containerRef = FSComponent.createRef();
        this.planeLatLongAlt = new LatLongAlt(0, 0, 0);
        const rwy = this.props.facility.runways[0];
        this.facilityLatLong = new LatLongAlt(rwy.latitude, rwy.longitude, rwy.elevation);
    }
    /**
     * Updates svt airport label.
     * @param planePos Current plane position
     * @param planeState Plane state info
     */
    update(planePos, planeState) {
        this.planeLatLongAlt.lat = planePos.lat;
        this.planeLatLongAlt.long = planePos.lon;
        this.planeLatLongAlt.alt = planeState.altitude * 3.281;
        const proj = SvtProjectionUtils.projectLatLongAlt(this.facilityLatLong, this.planeLatLongAlt, planeState.heading, planeState.roll * Avionics.Utils.DEG2RAD, SvtAirportLabel.vec3Cache[0]);
        this.containerRef.instance.style.transform = `translate3d(${proj[0]}px, ${Math.max(6, proj[1])}px, 0px)`;
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "svt-airport-label", style: "transform: translate3d(0px, 0px, 0px);", ref: this.containerRef },
            FSComponent.buildComponent("svg", { viewBox: "-40 -60 80 120", width: "50px" },
                FSComponent.buildComponent("rect", { x: "-40", y: "-60", width: "100%", height: "23px", stroke: "white", fill: "rgba(0,0,0,0.4)" }),
                FSComponent.buildComponent("text", { x: "0", y: "-49", "text-anchor": "middle", "font-family": "Roboto-Light", "alignment-baseline": "central", "font-size": "26", fill: " white" }, ICAO.getIdent(this.props.facility.icao)),
                FSComponent.buildComponent("line", { x1: "0", y1: "-36", x2: "0", y2: "24", stroke: "white" }))));
    }
}
SvtAirportLabel.vec3Cache = [new Float64Array(3)];
