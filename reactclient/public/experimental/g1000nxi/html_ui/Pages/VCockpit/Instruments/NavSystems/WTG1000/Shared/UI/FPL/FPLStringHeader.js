import { FSComponent, Subject } from 'msfssdk';
import { FPLHeader } from './FPLHeader';
/**
 * An FPL section header which displays simple strings.
 */
export class FPLStringHeader extends FPLHeader {
    constructor() {
        super(...arguments);
        this.textSub = Subject.create('');
        this.textLengthSub = this.textSub.map(text => text.length);
    }
    /** @inheritdoc */
    onAfterRender() {
        super.onAfterRender();
        this.textLengthSub.sub(length => this.setEstimatedNameWidth(length * FPLStringHeader.ESTIMATED_CHAR_WIDTH));
    }
    /** @inheritdoc */
    renderName() {
        return (FSComponent.buildComponent("span", null, this.textSub));
    }
}
FPLStringHeader.ESTIMATED_CHAR_WIDTH = 13.2;
