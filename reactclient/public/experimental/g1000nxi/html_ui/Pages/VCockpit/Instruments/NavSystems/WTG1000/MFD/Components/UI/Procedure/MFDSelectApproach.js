import { FSComponent } from 'msfssdk';
import { ArrowToggle } from '../../../../Shared/UI/UIControls/ArrowToggle';
import { ActionButton } from '../../../../Shared/UI/UIControls/ActionButton';
import { GroupBox } from '../GroupBox';
import { List } from '../../../../Shared/UI/List';
import { ProcSequenceItem } from './ProcSequenceItem';
import { ScrollBar } from '../../../../Shared/UI/ScrollBar';
import { SelectApproach } from '../../../../Shared/UI/Procedure/SelectApproach';
import { SelectApproachController } from '../../../../Shared/UI/Controllers/SelectApproachController';
import './MFDSelectApproach.css';
/**
 * An MFD view for selecting approaches.
 */
export class MFDSelectApproach extends SelectApproach {
    constructor() {
        super(...arguments);
        this.sequenceListContainerRef = FSComponent.createRef();
        this.buildLegItem = (data, registerFn) => {
            return FSComponent.buildComponent(ProcSequenceItem, { onRegister: registerFn, data: data });
        };
    }
    /** @inheritdoc */
    createController() {
        return new SelectApproachController(this.store, this.gotoNextSelect.bind(this), this.props.fms, 'FPLPage', true);
    }
    /**
     * A callback which is called when the Load action is executed.
     */
    onLoadExecuted() {
        this.controller.onLoadExecuted();
    }
    /**
     * A callback which is called when the Activate action is executed.
     */
    onActivateExecuted() {
        this.controller.onActivateExecuted();
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: 'mfd-dark-background mfd-select-approach', ref: this.viewContainerRef },
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Airport" }, this.renderWaypointInput()),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Approach Channel" },
                FSComponent.buildComponent("div", null, "Channel _ _ _ _ _ ID _ _ _ _ _")),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Approach" }, this.renderApproachSelectControl()),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Transition" }, this.renderTransitionSelectControl()),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Minimums" },
                FSComponent.buildComponent("div", { class: 'mfd-select-approach-mins' },
                    FSComponent.buildComponent(ArrowToggle, { onRegister: this.register, onOptionSelected: this.controller.onMinimumsOptionSelected, options: this.store.minsToggleOptions, dataref: this.store.minimumsMode }),
                    FSComponent.buildComponent("div", null,
                        this.renderMinimumsNumberInput('mfd-select-approach-mins-number'),
                        FSComponent.buildComponent("span", { class: "size12" }, "FT")))),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Primary frequency" },
                FSComponent.buildComponent("div", { "data-id": "select-freq", class: "cyan size18" }, this.store.frequencySubject)),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Sequence" },
                FSComponent.buildComponent("div", { style: 'height: 160px; overflow:hidden', ref: this.sequenceListContainerRef },
                    FSComponent.buildComponent(List, { onRegister: this.register, data: this.store.sequence, renderItem: this.buildLegItem, scrollContainer: this.sequenceListContainerRef })),
                FSComponent.buildComponent(ScrollBar, null)),
            FSComponent.buildComponent("div", { class: "mfd-action-buttons mfd-select-approach-action-buttons" },
                FSComponent.buildComponent(ActionButton, { onRegister: this.register, isVisible: this.controller.canLoad, onExecute: this.onLoadExecuted.bind(this), text: "Load?" }),
                FSComponent.buildComponent("div", null, this.controller.canLoadOrText),
                FSComponent.buildComponent(ActionButton, { onRegister: this.register, isVisible: this.controller.canActivate, onExecute: this.onActivateExecuted.bind(this), text: "Activate?" }))));
    }
}
