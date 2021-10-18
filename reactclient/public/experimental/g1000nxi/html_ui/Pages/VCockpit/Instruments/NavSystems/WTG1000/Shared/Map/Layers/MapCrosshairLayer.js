import { BitFlags, FSComponent } from 'msfssdk';
import { MapLayer, MapProjectionChangeType } from 'msfssdk/components/map';
import './MapCrosshairLayer.css';
/**
 * A map layer which displays a crosshair at the projected position of the map target.
 */
export class MapCrosshairLayer extends MapLayer {
    constructor() {
        super(...arguments);
        this.crosshairRef = FSComponent.createRef();
        this.needReposition = true;
    }
    /** @inheritdoc */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onVisibilityChanged(isVisible) {
        this.crosshairRef.getOrDefault() && this.updateFromVisibility();
    }
    /**
     * Updates this layer according to its current visibility.
     */
    updateFromVisibility() {
        this.crosshairRef.instance.style.display = this.isVisible() ? '' : 'none';
    }
    /** @inheritdoc */
    onAfterRender() {
        this.props.model.getModule('crosshair').show.sub(show => { this.setVisible(show); }, true);
        this.updateFromVisibility();
    }
    /** @inheritdoc */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onMapProjectionChanged(mapProjection, changeFlags) {
        this.needReposition || (this.needReposition = BitFlags.isAny(changeFlags, MapProjectionChangeType.TargetProjected));
    }
    /** @inheritdoc */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onUpdated(time, elapsed) {
        if (!this.needReposition || !this.isVisible()) {
            return;
        }
        this.repositionCrosshair();
        this.needReposition = false;
    }
    /**
     * Repositions this layer's crosshair.
     */
    repositionCrosshair() {
        const position = this.props.mapProjection.getTargetProjected();
        this.crosshairRef.instance.style.transform = `translate(-50%, -50%) translate3d(${position[0]}px, ${position[1]}px, 0)`;
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("svg", { ref: this.crosshairRef, class: 'map-crosshair', viewBox: '0 0 100 100', style: 'position: absolute; left: 0; top: 0; transform: translate(-50%, -50%) translate3d(0, 0, 0);' },
            FSComponent.buildComponent("line", { class: 'map-crosshair-outline', x1: '50', y1: '0', x2: '50', y2: '100' }),
            FSComponent.buildComponent("line", { class: 'map-crosshair-outline', x1: '0', y1: '50', x2: '100', y2: '50' }),
            FSComponent.buildComponent("line", { class: 'map-crosshair-stroke', x1: '50', y1: '0', x2: '50', y2: '100' }),
            FSComponent.buildComponent("line", { class: 'map-crosshair-stroke', x1: '0', y1: '50', x2: '100', y2: '50' })));
    }
}
