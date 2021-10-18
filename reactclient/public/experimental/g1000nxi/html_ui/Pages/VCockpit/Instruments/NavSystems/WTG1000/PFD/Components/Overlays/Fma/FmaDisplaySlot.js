import { FSComponent, DisplayComponent, Subject } from 'msfssdk';
import './FmaDisplaySlot.css';
/** A FMA Mode Display Slot */
export class FmaDisplaySlot extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.activeFailed = false;
        this.active = Subject.create('');
        this.el = FSComponent.createRef();
    }
    /** @inheritdoc */
    onAfterRender() {
        var _a;
        this.props.isFailed.sub((v) => {
            if (v) {
                this.activeFailed = true;
                this.onFailed(true);
            }
        });
        this.props.armed.sub(armed => this.currentArmedMode = armed);
        (_a = this.props.secondaryArmed) === null || _a === void 0 ? void 0 : _a.sub(armed => this.currentSecondaryArmedMode = armed);
        this.props.active.sub(this.onActiveChanged.bind(this));
    }
    /**
     * Called when the active mode changes to set the flash class if required.
     * @param active is the active mode.
     */
    onActiveChanged(active) {
        if (!this.activeFailed) {
            this.active.set(this.props.active.get());
            if (this.currentArmedMode === active || this.currentSecondaryArmedMode === active || this.isDualVerticalTransition(active)) {
                this.el.instance.classList.add('fma-slot-alert');
                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.el.instance.classList.remove('fma-slot-alert');
                }, 10000);
            }
            else {
                this.el.instance.classList.remove('fma-slot-alert');
            }
        }
    }
    /**
     * Called when the active mode fails to set the flash class if required.
     * @param failed is if the mode failed.
     */
    onFailed(failed) {
        if (failed) {
            this.el.instance.classList.remove('fma-slot-alert');
            this.el.instance.classList.add('fma-slot-failed');
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.el.instance.classList.remove('fma-slot-failed');
                this.activeFailed = false;
                this.onActiveChanged(this.props.active.get());
            }, 5000);
        }
    }
    /**
     * Checks whether the active mode transition is coming from a combined dual vertical armed mode.
     * @param active is the active mode.
     * @returns True if coming from a dual mode, false otherwise;
     */
    isDualVerticalTransition(active) {
        return (this.currentSecondaryArmedMode === 'GP/V' && (active === 'GP' || active === 'VPTH'))
            || (this.currentSecondaryArmedMode === 'GS/V' && (active === 'GS' || active === 'VPTH'));
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("div", { class: this.props.class },
            FSComponent.buildComponent("span", { ref: this.el }, this.active)));
    }
}
