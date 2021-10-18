import { FSComponent, ArraySubject, MathUtils } from 'msfssdk';
import { ScrollBar } from '../ScrollBar';
import { PopoutMenuItem } from '../../../Shared/UI/Dialogs/PopoutMenuItem';
import { List } from '../../../Shared/UI/List';
import { FmsHEvent } from '../FmsHEvent';
import { UiView } from '../UiView';
import './ContextMenuDialog.css';
/** The context menu position. */
export var ContextMenuPosition;
(function (ContextMenuPosition) {
    // TOP = 0,
    ContextMenuPosition[ContextMenuPosition["BOTTOM"] = 1] = "BOTTOM";
    ContextMenuPosition[ContextMenuPosition["LEFT"] = 2] = "LEFT";
    // RIGHT = 3,
    ContextMenuPosition[ContextMenuPosition["CENTER"] = 4] = "CENTER";
})(ContextMenuPosition || (ContextMenuPosition = {}));
/** A dialog that displays a context menu. */
export class ContextMenuDialog extends UiView {
    /**
     * Constructor
     * @param props The view props.
     */
    constructor(props) {
        super(props);
        this.listRef = FSComponent.createRef();
        this.listContainerRef = FSComponent.createRef();
        this.popoutContainerBgRef = FSComponent.createRef();
        this.menuItemsSubject = ArraySubject.create();
        this.assumedWidth = 0;
        this.assumedHeight = 0;
        this.viewport = {
            height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
            width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
        };
        this.SAFETY_MARGIN = 28;
        this.CHAR_WIDTH = 12;
        this.ROW_HEIGHT = 26;
        this.MAX_WIDTH = 320;
        this.MAX_HEIGHT = 260;
        this.onItemSelected = (sender) => {
            this.accept(this.listRef.instance.getListItemIndex(sender), true);
            return true;
        };
        /**
         * A callback called to render the menu items.
         * @param d is the menu item
         * @param registerFn The control register function.
         * @returns a vnode for display in the menu
         */
        this.renderItem = (d, registerFn) => {
            return FSComponent.buildComponent(PopoutMenuItem, { onRegister: registerFn, onEnter: this.onItemSelected, parent: this, def: d });
        };
        this.inputData.sub((v) => {
            this.menuItemsSubject.clear();
            if (v !== undefined) {
                if (v.items.length > 0) {
                    this.menuItemsSubject.insertRange(0, v.items);
                }
                this.scrollController.gotoFirst();
            }
        });
    }
    /** @inheritdoc */
    onInputDataSet(data) {
        if (data) {
            if (data.element) {
                this.containerRect = data.outerContainer.getBoundingClientRect();
                this.assumedWidth = MathUtils.clamp(data.items.reduce((maxWidth, item) => item.estimatedWidth > maxWidth ? item.estimatedWidth : maxWidth, 0) + this.SAFETY_MARGIN, 0, this.containerRect.width);
                this.assumedHeight = MathUtils.clamp(this.menuItemsSubject.length * this.ROW_HEIGHT + this.SAFETY_MARGIN, 0, Math.min(this.containerRect.height, this.MAX_HEIGHT));
                // just center it there for now
                const selectElRect = data.element.getBoundingClientRect();
                switch (data.position) {
                    case ContextMenuPosition.LEFT:
                        // position dialog left of element
                        this.viewContainerRef.instance.style.top = `${((this.containerRect.height / 2) - (this.assumedHeight / 2)) + this.containerRect.top + 12}px`;
                        this.setContainerLeftPos(selectElRect.left - this.assumedWidth - 8, data);
                        break;
                    case ContextMenuPosition.CENTER:
                        this.viewContainerRef.instance.style.top = `${((this.containerRect.height / 2) - (this.assumedHeight / 2)) + this.containerRect.top + 12}px`;
                        this.setContainerLeftPos(this.containerRect.left + (this.containerRect.width / 2) - (this.assumedWidth / 2), data);
                        break;
                    case ContextMenuPosition.BOTTOM:
                    default:
                        // position dialog below the element
                        this.viewContainerRef.instance.style.top = `${selectElRect.bottom + 10}px`;
                        this.setContainerLeftPos(selectElRect.left + 8, data);
                        break;
                }
                const viewContainerRect = this.viewContainerRef.instance.getBoundingClientRect();
                const remHeight = this.containerRect.bottom - viewContainerRect.top;
                this.popoutContainerBgRef.instance.style.maxHeight = `${MathUtils.clamp(remHeight - this.SAFETY_MARGIN, this.ROW_HEIGHT + this.SAFETY_MARGIN, this.MAX_HEIGHT)}px`;
            }
            if (data.initialScrollPosition) {
                this.listRef.instance.scrollToIndex(data.initialScrollPosition);
            }
        }
    }
    /**
     * Sets and clamps the left position of the container.
     * @param left The desired left position.
     * @param data The context menu options data.
     */
    setContainerLeftPos(left, data) {
        const minLeft = data.outerContainer ? data.outerContainer.getBoundingClientRect().left + 10 : 0;
        this.viewContainerRef.instance.style.left = `${MathUtils.clamp(left, minLeft, this.viewport.width - this.assumedWidth)}px`;
    }
    /** @inheritdoc */
    onInteractionEvent(evt) {
        switch (evt) {
            case FmsHEvent.CLR:
                this.close();
                return true;
        }
        return false;
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("div", { class: 'popout-contextmenu-dialog', ref: this.viewContainerRef },
            FSComponent.buildComponent("div", { class: 'popout-contextmenu-background', ref: this.popoutContainerBgRef },
                FSComponent.buildComponent("div", { class: "popout-contextmenu-container", ref: this.listContainerRef },
                    FSComponent.buildComponent(List, { onRegister: this.register, ref: this.listRef, data: this.menuItemsSubject, renderItem: this.renderItem, upperKnobCanScroll: this.props.upperKnobCanScroll, scrollContainer: this.popoutContainerBgRef }))),
            FSComponent.buildComponent(ScrollBar, null)));
    }
}
ContextMenuDialog.CHAR_WIDTH = 12;
