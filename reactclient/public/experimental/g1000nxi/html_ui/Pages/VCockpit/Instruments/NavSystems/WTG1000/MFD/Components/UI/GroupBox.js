import { FSComponent } from 'msfssdk';
import { UiControlGroup } from '../../../Shared/UI/UiControlGroup';
import './GroupBox.css';
/**
 * The GroupBox component.
 */
export class GroupBox extends UiControlGroup {
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        var _a, _b, _c;
        return (FSComponent.buildComponent("div", { class: `groupbox-container ${(_a = this.props.class) !== null && _a !== void 0 ? _a : ''}`, style: (_b = this.props.containerStyle) !== null && _b !== void 0 ? _b : '' },
            FSComponent.buildComponent("div", { class: "groupbox-content", style: (_c = this.props.contentStyle) !== null && _c !== void 0 ? _c : '' }, this.props.children),
            FSComponent.buildComponent("div", { class: "groupbox-title" }, this.props.title))
        // <div>
        //   <fieldset>
        //     <legend>{this.props.title}</legend>
        //     {this.props.children}
        //   </fieldset>
        // </div>
        );
    }
}
