import { DisplayComponent, FSComponent } from 'msfssdk';
import './MapOrientationIndicator.css';
/**
 * Displays a map orientation indication.
 */
export class MapOrientationIndicator extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.rootRef = FSComponent.createRef();
        this.textSub = this.props.orientation.map(mode => {
            return this.props.text[mode];
        });
    }
    /** @inheritdoc */
    onAfterRender() {
        this.props.isVisible.sub(isVisible => { this.rootRef.instance.style.visibility = isVisible ? '' : 'hidden'; });
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("div", { ref: this.rootRef, class: 'map-orientation' }, this.textSub));
    }
}
