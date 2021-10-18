import { FSComponent } from 'msfssdk';
import { WptDupDialog } from '../../../../Shared/UI/WptDup/WptDupDialog';
import { List } from '../../../../Shared/UI/List';
import { ScrollBar } from '../../../../Shared/UI/ScrollBar';
import './PFDWptDupDialog.css';
/**
 * A dialog for selecting from a list of duplicate waypoints.
 */
export class PFDWptDupDialog extends WptDupDialog {
    /**
     * Renders this component.
     * @returns the component VNode.
     */
    render() {
        const listContainerRef = FSComponent.createRef();
        return (FSComponent.buildComponent("div", { class: 'popout-dialog pfd-wpt-dup', ref: this.viewContainerRef },
            FSComponent.buildComponent("h1", null, this.props.title),
            FSComponent.buildComponent("div", { class: 'pfd-wpt-dup-ident' },
                FSComponent.buildComponent("div", { class: 'pfd-wpt-dup-ident-title' }, "WPT"),
                FSComponent.buildComponent("div", null, this.ident)),
            FSComponent.buildComponent("hr", null),
            FSComponent.buildComponent("div", { class: 'pfd-wpt-dup-list-container', ref: listContainerRef },
                FSComponent.buildComponent(List, { ref: this.listRef, onRegister: this.register, data: this.waypoints, renderItem: this.renderListItem.bind(this, 'pfd-wpt-dup-listitem'), scrollContainer: listContainerRef, class: 'pfd-wpt-dup-list' })),
            FSComponent.buildComponent(ScrollBar, null)));
    }
}
