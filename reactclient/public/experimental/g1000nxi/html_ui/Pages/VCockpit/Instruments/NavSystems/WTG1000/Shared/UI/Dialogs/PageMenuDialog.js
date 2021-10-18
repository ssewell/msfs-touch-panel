import { ListMenuDialog } from './ListMenuDialog';
import { FSComponent } from 'msfssdk';
import { List } from '../List';
import { ScrollBar } from '../ScrollBar';
import './PageMenuDialog.css';
import { GroupBox } from '../../../MFD/Components/UI/GroupBox';
/**
 * Dialog used for displaying page menus.
 * @class PageMenuDialog
 * @augments {ListMenuDialog}
 */
export class PageMenuDialog extends ListMenuDialog {
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        let className = 'popout-dialog';
        if (this.props.class !== undefined) {
            className += ` ${this.props.class}`;
        }
        return (FSComponent.buildComponent("div", { class: className, ref: this.viewContainerRef },
            FSComponent.buildComponent("div", { class: "popout-pagemenu-background" },
                FSComponent.buildComponent("h1", null, this.props.title),
                FSComponent.buildComponent(GroupBox, { title: "Options", containerStyle: "margin-top:50px;" },
                    FSComponent.buildComponent("div", { class: "popout-pagemenu-listcontainer", ref: this.listContainerRef },
                        FSComponent.buildComponent(List, { ref: this.listRef, onRegister: this.register, data: this.menuItemsSubject, renderItem: this.renderItem, scrollContainer: this.listContainerRef })),
                    FSComponent.buildComponent(ScrollBar, null)))));
    }
}
