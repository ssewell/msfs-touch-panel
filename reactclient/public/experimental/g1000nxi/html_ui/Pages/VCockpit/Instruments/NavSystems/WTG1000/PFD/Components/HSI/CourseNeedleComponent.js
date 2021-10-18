import { DisplayComponent, NavMath, NodeReference } from 'msfssdk';
import { NeedleAnimator } from './NeedleAnimator';
/**
 * An interface that describes a course needle component.
 */
export class CourseNeedleComponent extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.needleRef = new NodeReference();
        this.deviationRef = new NodeReference();
        this.toFromRef = new NodeReference();
        this.currentDeviation = 0;
    }
    /**
     * A callback called after rendering completes.
     */
    onAfterRender() {
        this.animator = new NeedleAnimator(this.needleRef);
    }
    /**
     * Sets the rotation of the course needle.
     * @param rotation The rotation of the course needle.
     */
    setRotation(rotation) {
        this.animator && this.animator.rotateTo(rotation);
    }
    /**
     * Sets the deviation of the course needle.
     * @param deviation The deviation of the course needle.
     */
    setDeviation(deviation) {
        this.currentDeviation = deviation;
        const deviationPercent = this.currentDeviation;
        const deviationPixels = NavMath.clamp(deviationPercent, -1, 1) * 80;
        this.deviationRef.instance.style.transform = `translate3d(${deviationPixels}px, 0px, 0px)`;
    }
    /**
     * Sets whether or not the course needle is visible.
     * @param isVisible The visibility of the course needle.
     */
    setVisible(isVisible) {
        this.needleRef.instance.style.display = isVisible ? '' : 'none';
    }
    /**
     * Sets whether or not the course deviation indicator is visible.
     * @param isVisible The visibility of the course deviation indicator.
     */
    setDeviationVisible(isVisible) {
        this.deviationRef.instance.style.display = isVisible ? '' : 'none';
        this.toFromRef.instance.style.display = isVisible ? '' : 'none';
    }
    /**
     * Sets whether the to/from flag should indicate to or from.
     * @param from a bool set to true when the flag should be set to FROM.
     */
    setFromFlag(from) {
        this.toFromRef.instance.style.transform = from ? 'rotate3d(0, 0, 1, 180deg)' : 'rotate3d(0, 0, 1, 0deg)';
    }
}
