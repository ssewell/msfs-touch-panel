import { FSComponent } from 'msfssdk';
import { MapLayer } from 'msfssdk/components/map';
import './MapPointerLayer.css';
/**
 * A map layer which displays a pointer.
 */
export class MapPointerLayer extends MapLayer {
    constructor() {
        super(...arguments);
        this.pointerRef = FSComponent.createRef();
        this.pointerModule = this.props.model.getModule('pointer');
        this.positionHandler = () => { this.needRepositionPointer = true; };
        this.needRepositionPointer = false;
    }
    /** @inheritdoc */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onVisibilityChanged(isVisible) {
        this.pointerRef.getOrDefault() && this.updateFromVisibility();
    }
    /**
     * Updates this layer according to its current visibility.
     */
    updateFromVisibility() {
        const isVisible = this.isVisible();
        this.pointerRef.instance.style.display = isVisible ? '' : 'none';
        if (isVisible) {
            this.pointerModule.position.sub(this.positionHandler, true);
        }
        else {
            this.pointerModule.position.unsub(this.positionHandler);
        }
    }
    /** @inheritdoc */
    onAttached() {
        this.updateFromVisibility();
        this.pointerModule.isActive.sub(isActive => this.setVisible(isActive), true);
    }
    /** @inheritdoc */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onUpdated(time, elapsed) {
        if (!this.needRepositionPointer) {
            return;
        }
        this.repositionPointer();
        this.needRepositionPointer = false;
    }
    /**
     * Repositions this layer's pointer.
     */
    repositionPointer() {
        const position = this.pointerModule.position.get();
        this.pointerRef.instance.style.transform = `translate3d(${position[0]}px, ${position[1]}px, 0)`;
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("svg", { ref: this.pointerRef, class: 'map-pointer', viewBox: '0 0 100 100', style: 'position: absolute; left: 0; top: 0; transform: translate3d(0, 0, 0);' },
            FSComponent.buildComponent("polygon", { points: '78.93 95.46 49.48 66.01 41.18 84.57 4.54 4.54 84.57 41.18 66.01 49.48 95.46 78.93 78.93 95.46' })));
    }
}
