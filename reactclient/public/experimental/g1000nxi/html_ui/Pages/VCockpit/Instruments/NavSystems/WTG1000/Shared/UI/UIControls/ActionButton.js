import { FSComponent } from 'msfssdk';
import { UiControl } from '../UiControl';
import './ActionButton.css';
/**
 * The ActionButton component.
 */
export class ActionButton extends UiControl {
    /** @inheritdoc */
    onEnter() {
        this.props.onExecute();
        return true;
    }
    /** @inheritdoc */
    renderControl() {
        return (FSComponent.buildComponent("div", { class: "action-button" }, this.props.text));
    }
}
