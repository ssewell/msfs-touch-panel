import { DisplayComponent, FSComponent, NavMath, ExpSmoother, UnitType } from 'msfssdk';
import { SvtProjectionUtils } from '../../../Shared/UI/SvtProjectionUtils';
/**
 * The FlightPathMarker component.
 */
export class FlightPathMarker extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.fpvMarkerRef = FSComponent.createRef();
        this.groundTrackSmoother = new ExpSmoother(FlightPathMarker.GROUND_TRACK_TIME_CONSTANT);
        this.vAngleSmoother = new ExpSmoother(FlightPathMarker.VANGLE_TIME_CONSTANT);
        this.isVisible = true;
    }
    /**
     * Updates flight path marker
     * @param dt The elapsed time, in milliseconds, since the previous update.
     * @param planeState The state of own airplane.
     */
    update(dt, planeState) {
        this.updateIsVisible(planeState);
        if (this.isVisible) {
            this.updatePosition(dt, planeState);
        }
    }
    /**
     * Updates whether this flight path marker should be visible.
     * @param planeState The state of own airplane.
     */
    updateIsVisible(planeState) {
        const isVisible = this.props.isActive.get() && planeState.gs > 30;
        if (this.isVisible !== isVisible) {
            this.isVisible = isVisible;
            this.fpvMarkerRef.instance.style.display = isVisible ? '' : 'none';
        }
    }
    /**
     * Updates this flight path marker's position.
     * @param dt The elapsed time, in milliseconds, since the previous update.
     * @param planeState The state of own airplane.
     */
    updatePosition(dt, planeState) {
        const vAngle = this.vAngleSmoother.next(Math.atan2(planeState.vs, UnitType.KNOT.convertTo(planeState.gs, UnitType.FPM)), dt);
        const pitch = planeState.pitch * Avionics.Utils.DEG2RAD + vAngle;
        const trkAvg = this.smoothGroundTrack(planeState.track, dt);
        const yaw = NavMath.diffAngle(planeState.heading, trkAvg) * Avionics.Utils.DEG2RAD;
        const roll = planeState.roll * Avionics.Utils.DEG2RAD;
        const offset = SvtProjectionUtils.projectYawPitch(yaw, pitch, roll, FlightPathMarker.vec2Cache[0]);
        this.fpvMarkerRef.instance.style.transform = `translate3d(${offset[0]}px, ${offset[1]}px, 0)`;
    }
    /**
     * Smooths a ground track value.
     * @param track A ground track value.
     * @param dt The elapsed time, in milliseconds, since the last smoothed value was calculated.
     * @returns A smoothed ground track value.
     */
    smoothGroundTrack(track, dt) {
        const last = this.groundTrackSmoother.last();
        if (last !== null && !isNaN(last)) {
            // need to handle wraparounds
            let delta = track - last;
            if (delta > 180) {
                delta = delta - 360;
            }
            else if (delta < -180) {
                delta = delta + 360;
            }
            track = last + delta;
        }
        const next = last !== null && isNaN(last) ? this.groundTrackSmoother.reset(track) : this.groundTrackSmoother.next(track, dt);
        const normalized = (next + 360) % 360; // enforce range 0-359
        return this.groundTrackSmoother.reset(normalized);
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "fpv-marker", ref: this.fpvMarkerRef, style: "transform3d(0, 0, 0); position: absolute; top: 33%; left: 42%; width: 58px;" },
            FSComponent.buildComponent("svg", { viewBox: "-29 -25 58 42" },
                FSComponent.buildComponent("path", { d: "M -14 0 a 14 14 0 1 0 28 0 m 16 0 l -16 0 a 14 14 0 1 0 -28 0 l -16 0 m 30 -14 l 0 -12", stroke: "black", "stroke-width": "5", fill: "none" }),
                FSComponent.buildComponent("path", { d: "M -14 0 a 14 14 0 1 0 28 0 m 14 0 l -14 0 a 14 14 0 1 0 -28 0 l -14 0 m 28 -14 l 0 -10", stroke: "rgb(0,255,0)", "stroke-width": "2", fill: "none" }))));
    }
}
FlightPathMarker.GROUND_TRACK_TIME_CONSTANT = 2000 / Math.LN2; // ms
FlightPathMarker.VANGLE_TIME_CONSTANT = 2000 / Math.LN2; // ms
FlightPathMarker.vec2Cache = [new Float64Array(2)];
