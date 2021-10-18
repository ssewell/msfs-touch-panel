import { FSComponent, DisplayComponent, Subject } from 'msfssdk';
import './FmaApSlot.css';
/** A FMA Mode AP Slot */
export class FmaApSlot extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.el = FSComponent.createRef();
        this.apLabel = Subject.create('');
    }
    /** @inheritdoc */
    onAfterRender() {
        this.props.isActive.sub(this.onActiveChanged.bind(this));
    }
    /**
     * Called when the autopilot is activated or deactivated.
     * @param active Whether or not the autopilot is active.
     */
    onActiveChanged(active) {
        clearTimeout(this.timeout);
        if (!active) {
            this.el.instance.classList.add('fma-ap-alert');
            this.timeout = setTimeout(() => {
                this.el.instance.classList.remove('fma-ap-alert');
                this.apLabel.set('');
            }, 10000);
        }
        else {
            this.apLabel.set('AP');
            this.el.instance.classList.remove('fma-ap-alert');
        }
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("div", { id: 'CenterBarBottomMiddle' },
            FSComponent.buildComponent("span", { ref: this.el }, this.apLabel)));
    }
}
