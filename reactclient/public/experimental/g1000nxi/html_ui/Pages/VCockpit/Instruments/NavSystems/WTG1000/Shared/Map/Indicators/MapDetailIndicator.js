import { DisplayComponent, FSComponent } from 'msfssdk';
import { MapDeclutterMode } from '../Modules/MapDeclutterModule';
import './MapDetailIndicator.css';
/**
 * Displays a map detail level indication.
 */
export class MapDetailIndicator extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.rootRef = FSComponent.createRef();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAfterRender() {
        this.props.declutterMode.sub(this.onDeclutterModeChanged.bind(this), true);
    }
    /**
     * A callback which is called when the declutter mode setting value changes.
     * @param mode The new declutter mode setting value.
     */
    onDeclutterModeChanged(mode) {
        this.rootRef.instance.classList.remove('detail-4', 'detail-3', 'detail-2', 'detail-1');
        this.rootRef.instance.classList.add(MapDetailIndicator.MODE_CLASSES[mode]);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent("div", { ref: this.rootRef, class: 'map-detail' },
            this.props.showTitle ? FSComponent.buildComponent("div", null, "Detail") : null,
            FSComponent.buildComponent("div", { class: 'map-detail-icon' },
                FSComponent.buildComponent("div", { class: 'map-detail-block map-detail-top' }),
                FSComponent.buildComponent("div", { class: 'map-detail-block map-detail-middle' }),
                FSComponent.buildComponent("div", { class: 'map-detail-block map-detail-bottom' }),
                FSComponent.buildComponent("div", { class: 'map-detail-clip' }))));
    }
}
MapDetailIndicator.MODE_CLASSES = {
    [MapDeclutterMode.All]: 'detail-4',
    [MapDeclutterMode.Level3]: 'detail-3',
    [MapDeclutterMode.Level2]: 'detail-2',
    [MapDeclutterMode.Level1]: 'detail-1',
};
