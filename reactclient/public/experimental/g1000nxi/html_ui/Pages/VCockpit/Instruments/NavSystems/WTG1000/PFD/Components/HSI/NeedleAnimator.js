import { NavMath } from 'msfssdk';
/**
 * Animates course and bearing needle elements.
 */
export class NeedleAnimator {
    /**
     * Creates an instance of a NeedleAnimator.
     * @param el The reference to the element to animate.
     */
    constructor(el) {
        this.el = el;
        this.currentValue = 0;
        this.targetValue = 0;
        /**
         * A callback called when the needle animation transtion ends.
         */
        this.onTransitionEnd = () => {
            this.el.instance.classList.remove('needle-transition');
            this.currentValue = this.targetValue;
            this.el.instance.style.transform = `rotate3d(0, 0, 1, ${this.targetValue}deg)`;
        };
        el.instance.addEventListener('transitionend', this.onTransitionEnd);
    }
    /**
     * Rotates the element to the supplied value in degrees.
     * @param val The value to rotate to.
     */
    rotateTo(val) {
        this.targetValue = val;
        const diff = Math.abs(NavMath.diffAngle(this.currentValue, this.targetValue));
        if (diff >= 2) {
            const turnDirection = NavMath.getTurnDirection(this.currentValue, this.targetValue);
            this.el.instance.classList.add('needle-transition');
            this.el.instance.style.transform = `rotate3d(0, 0, 1, ${this.currentValue + (diff * (turnDirection === 'right' ? 1 : -1))}deg)`;
        }
        else {
            this.currentValue = this.targetValue;
            this.el.instance.style.transform = `rotate3d(0, 0, 1, ${this.targetValue}deg)`;
        }
    }
}
