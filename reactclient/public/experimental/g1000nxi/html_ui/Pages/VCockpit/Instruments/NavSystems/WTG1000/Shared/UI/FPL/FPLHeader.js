import { FSComponent } from 'msfssdk';
import { UiControl } from '../UiControl';
/**
 * A header for an FPL section.
 */
export class FPLHeader extends UiControl {
    constructor() {
        super(...arguments);
        this.rootRef = FSComponent.createRef();
        this.estimatedNameWidth = 0;
        this._isCollapsed = false;
        this.isInit = false;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** Whether this header is collapsed. */
    get isCollapsed() {
        return this._isCollapsed;
    }
    /** @inheritdoc */
    onAfterRender() {
        this.isInit = true;
        super.onAfterRender();
        this.update();
    }
    /** Updates this header */
    update() {
        if (!this.isInit) {
            return;
        }
        this.updateName();
    }
    /**
     * Sets the estimated width of this header's name text.
     * @param width The new estimated width, in pixels.
     */
    setEstimatedNameWidth(width) {
        if (width === this.estimatedNameWidth) {
            return;
        }
        this.estimatedNameWidth = width;
        this.updateNameFontSize();
    }
    /**
     * Updates the font size for this header's name text to ensure the text fits within this header's width.
     */
    updateNameFontSize() {
        if (this.rootRef.getOrDefault() !== null) {
            // fit size
            const clampedWidth = Utils.Clamp(this.estimatedNameWidth, this.rootRef.instance.offsetWidth, 500);
            const clientWidth = this.rootRef.instance.clientWidth;
            if (clientWidth !== 0) {
                this.rootRef.instance.style.fontSize = `${(this.rootRef.instance.clientWidth / clampedWidth) * 100}%`;
            }
        }
    }
    /** @inheritdoc */
    renderControl() {
        return (FSComponent.buildComponent("div", { ref: this.rootRef, class: 'header-name' }, this.renderName()));
    }
}
