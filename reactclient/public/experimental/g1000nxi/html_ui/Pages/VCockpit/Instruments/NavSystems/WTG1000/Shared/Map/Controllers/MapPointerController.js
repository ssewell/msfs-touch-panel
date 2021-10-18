import { GeoPoint } from 'msfssdk';
/**
 * Controls the pointer of a map.
 */
export class MapPointerController {
    /**
     * Constructor.
     * @param mapModel The model of the map associated with this controller.
     * @param mapProjection The map projection associated with this controller.
     */
    constructor(mapModel, mapProjection) {
        this.mapModel = mapModel;
        this.mapProjection = mapProjection;
        this.pointerModule = this.mapModel.getModule('pointer');
    }
    /**
     * Activates or deactivates the map pointer.
     * @param isActive Whether to activate the map pointer.
     */
    setPointerActive(isActive) {
        if (isActive === this.pointerModule.isActive.get()) {
            return;
        }
        if (isActive) {
            this.pointerModule.target.set(this.mapProjection.getTarget());
            this.pointerModule.position.set(this.mapProjection.getTargetProjected());
        }
        this.pointerModule.isActive.set(isActive);
    }
    /**
     * Toggles activation of the map pointer.
     * @returns Whether the map pointer is active after the toggle operation.
     */
    togglePointerActive() {
        this.setPointerActive(!this.pointerModule.isActive.get());
        return this.pointerModule.isActive.get();
    }
    /**
     * Moves the map pointer.
     * @param dx The horizontal displacement, in pixels.
     * @param dy The vertical dispacement, in pixels.
     */
    movePointer(dx, dy) {
        const currentPos = this.pointerModule.position.get();
        this.pointerModule.position.set(currentPos[0] + dx, currentPos[1] + dy);
    }
    /**
     * Sets the map target to the current position of the pointer. The pointer will also be moved to the
     */
    targetPointer() {
        const target = this.mapProjection.invert(this.pointerModule.position.get(), MapPointerController.geoPointCache[0]);
        this.pointerModule.target.set(target);
        this.pointerModule.position.set(this.mapProjection.getTargetProjected());
    }
}
MapPointerController.geoPointCache = [new GeoPoint(0, 0)];
