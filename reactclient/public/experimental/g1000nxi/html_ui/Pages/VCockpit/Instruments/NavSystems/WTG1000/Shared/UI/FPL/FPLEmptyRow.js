import { FSComponent } from 'msfssdk';
import { UiControl } from '../UiControl';
/** The FPLEmptyRow component. */
export class FPLEmptyRow extends UiControl {
    constructor() {
        super(...arguments);
        this.nameContainerRef = FSComponent.createRef();
    }
    /** @inheritdoc */
    getHighlightElement() {
        return this.nameContainerRef.instance;
    }
    /** @inheritdoc */
    renderControl() {
        return (FSComponent.buildComponent("div", { class: 'fix-container' },
            FSComponent.buildComponent("div", { class: 'fix-name', ref: this.nameContainerRef },
                FSComponent.buildComponent("span", { style: 'padding-right:5em' }, "______"))));
    }
}
