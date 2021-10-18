/**
 * Controls the map crosshair. Shows the crosshair when the map pointer is active, and hides the crosshair otherwise.
 */
export class MapCrosshairController {
    /**
     * Constructor.
     * @param mapModel The model of the map associated with this controller.
     */
    constructor(mapModel) {
        this.mapModel = mapModel;
        this.handler = this.updateCrosshairShow.bind(this);
        this.isInit = false;
    }
    /**
     * Initializes this controller. Once initialized, this controller will automatically update the map crosshair
     * visibility.
     */
    init() {
        if (this.isInit) {
            return;
        }
        this.initListeners();
        this.updateCrosshairShow();
        this.isInit = true;
    }
    /**
     * Initializes this controller's listeners.
     */
    initListeners() {
        this.mapModel.getModule('pointer').isActive.sub(this.handler);
    }
    /**
     * Updates whether to show this controller's map crosshair.
     */
    updateCrosshairShow() {
        this.mapModel.getModule('crosshair').show.set(this.mapModel.getModule('pointer').isActive.get());
    }
    /**
     * Destroys this controller, freeing up resources associated with it. Once destroyed, this controller will no longer
     * automatically update the map crosshair visibility.
     */
    destroy() {
        this.mapModel.getModule('pointer').isActive.unsub(this.handler);
    }
}
