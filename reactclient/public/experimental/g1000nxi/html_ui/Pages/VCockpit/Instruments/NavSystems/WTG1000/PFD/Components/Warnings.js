import { FSComponent, DisplayComponent } from 'msfssdk';
import { WarningManager, WarningType } from 'msfssdk/components/Warnings';
import './Warnings.css';
/**
 * This will display system warnings.
 */
export class WarningDisplay extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.divRef = FSComponent.createRef();
    }
    /** Instantiate a warning manager with our passed-in props after rendering. */
    onAfterRender() {
        new WarningManager(this.props.warnings, this.props.logicHandler, this.onWarningText.bind(this), this.onWarningSound.bind(this));
    }
    /**
     * Turt the text of a warning on or off.
     * @param warning The warning text to display, undefined if it's cleared.
     */
    onWarningText(warning) {
        if (warning) {
            if (warning.shortText) {
                this.divRef.instance.textContent = warning.shortText;
                switch (warning.type) {
                    case WarningType.Warning:
                        this.divRef.instance.className = 'warnings-display red';
                        break;
                    case WarningType.Caution:
                        this.divRef.instance.className = 'warnings-display yellow';
                        break;
                    case WarningType.Test:
                        this.divRef.instance.className = 'warnings-display white';
                        break;
                }
            }
            else {
                this.divRef.instance.textContent = '';
                this.divRef.instance.className = 'warnings-display';
            }
        }
        else {
            this.divRef.instance.textContent = '';
            this.divRef.instance.className = 'warnings-display';
        }
    }
    /**
     * Start or stop playing a continuour warning sound.
     * @param warning The warning.
     * @param active Whether the warning is turning on or off.
     */
    onWarningSound(warning, active) {
        if (warning.soundId) {
            if (active) {
                this.props.soundPublisher.startSound(warning.soundId);
            }
            else {
                this.props.soundPublisher.stopSound(warning.soundId);
            }
        }
    }
    /**
     * Render a WarningDisplay
     * @returns a VNode
     */
    render() {
        return FSComponent.buildComponent("div", { class: "warnings-display", ref: this.divRef });
    }
}
