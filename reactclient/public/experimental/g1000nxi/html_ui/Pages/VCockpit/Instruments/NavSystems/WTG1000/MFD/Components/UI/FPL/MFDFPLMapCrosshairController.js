import { MapCrosshairController } from '../../../../Shared/Map/Controllers/MapCrosshairController';
/**
 * Controls the map crosshair. Shows the crosshair when the map pointer or flight plan focus is active, and hides the
 * crosshair otherwise.
 */
export class MFDFPLMapCrosshairController extends MapCrosshairController {
    /** @inheritdoc */
    initListeners() {
        super.initListeners();
        const focusModule = this.mapModel.getModule('focus');
        focusModule.isActive.sub(this.handler);
        focusModule.focus.sub(this.handler);
    }
    /** @inheritdoc */
    updateCrosshairShow() {
        const focusModule = this.mapModel.getModule('focus');
        const isPointerActive = this.mapModel.getModule('pointer').isActive.get();
        const isFocusActive = focusModule.isActive.get();
        const doesFocusExist = focusModule.focus.get() !== null;
        this.mapModel.getModule('crosshair').show.set(isPointerActive || (isFocusActive && doesFocusExist));
    }
    /** @inheritdoc */
    destroy() {
        super.destroy();
        const focusModule = this.mapModel.getModule('focus');
        focusModule.isActive.unsub(this.handler);
        focusModule.focus.unsub(this.handler);
    }
}
