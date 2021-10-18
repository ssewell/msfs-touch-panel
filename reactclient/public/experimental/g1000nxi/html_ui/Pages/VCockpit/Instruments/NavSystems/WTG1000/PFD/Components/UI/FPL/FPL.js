import { FSComponent } from 'msfssdk';
import { UiView } from '../../../../Shared/UI/UiView';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { FPLDetails } from './FPLDetails';
import './FPL.css';
/**
 * The FPL popup container encapsulates the actual popup logic.
 */
export class FPL extends UiView {
    constructor() {
        super(...arguments);
        this.fplDetailsRef = FSComponent.createRef();
    }
    /** @inheritdoc */
    onInteractionEvent(evt) {
        if (evt === FmsHEvent.UPPER_PUSH) {
            this.toggleScroll();
            return true;
        }
        return this.fplDetailsRef.instance.onInteractionEvent(evt) || super.onInteractionEvent(evt);
    }
    /** Called when the view is resumed. */
    onViewResumed() {
        if (this.fplDetailsRef.instance !== undefined) {
            this.fplDetailsRef.instance.fplViewResumed();
        }
    }
    /** Called when the view is closed. */
    onViewClosed() {
        this.setScrollEnabled(true);
    }
    /** Called when the view is opened. */
    onViewOpened() {
        if (this.fplDetailsRef.instance !== undefined) {
            this.fplDetailsRef.instance.fplViewOpened();
        }
    }
    /**
     * A method called when the control group scroll is toggled.
     * @param enabled if the scroll is enabled.
     */
    onScrollToggled(enabled) {
        this.fplDetailsRef.instance.onScrollToggled(enabled);
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: 'popout-dialog', ref: this.viewContainerRef },
            FSComponent.buildComponent("h1", null, this.props.title),
            FSComponent.buildComponent(FPLDetails, { onRegister: this.register, ref: this.fplDetailsRef, bus: this.props.bus, fms: this.props.fms })));
    }
}
