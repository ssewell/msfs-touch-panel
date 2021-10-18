import { FSComponent } from 'msfssdk';
import { GroupBox } from '../GroupBox';
import { List } from '../../../../Shared/UI/List';
import { ScrollBar } from '../../../../Shared/UI/ScrollBar';
import { ProcSequenceItem } from '../Procedure/ProcSequenceItem';
import { SelectAirway } from '../../../../Shared/UI/Airway/SelectAirway';
import './MFDSelectAirway.css';
/**
 * A view which allows the user to select an airway on the MFD.
 */
export class MFDSelectAirway extends SelectAirway {
    constructor() {
        super(...arguments);
        this.sequenceListContainerRef = FSComponent.createRef();
        this.buildLegItem = (data, registerFn) => {
            return FSComponent.buildComponent(ProcSequenceItem, { onRegister: registerFn, data: data });
        };
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: 'mfd-dark-background', ref: this.viewContainerRef },
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Entry" }, this.controller.entrySubject),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Airway" }, this.renderAirwaySelectControl()),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Exit" }, this.renderExitSelectControl()),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Sequence" },
                FSComponent.buildComponent("div", { style: 'height: 160px; overflow:hidden', ref: this.sequenceListContainerRef },
                    FSComponent.buildComponent(List, { onRegister: this.register, data: this.store.sequence, renderItem: this.buildLegItem, scrollContainer: this.sequenceListContainerRef })),
                FSComponent.buildComponent(ScrollBar, null)),
            FSComponent.buildComponent("div", { class: "mfd-slctawy-button" }, this.renderLoadButton())));
    }
}
