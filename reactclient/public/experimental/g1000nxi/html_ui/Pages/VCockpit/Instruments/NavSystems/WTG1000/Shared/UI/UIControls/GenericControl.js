import { FSComponent } from 'msfssdk';
import { UiControl } from '../../../Shared/UI/UiControl';
/** A silly generic control */
export class GenericControl extends UiControl {
    /** @inheritdoc */
    renderControl() {
        return (FSComponent.buildComponent("div", null, this.props.children));
    }
}
