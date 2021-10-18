import { MapDeclutterMode } from '../Modules/MapDeclutterModule';
import { MapSymbolVisController } from './MapSymbolVisController';
/** A controller for displaying NEXRAD. */
export class MapNexradController {
    /**
     * Creates an instance of the MapNexradController.
     * @param mapModel The nav map data model.
     * @param settingManager The user settings manager for map settings.
     */
    constructor(mapModel, settingManager) {
        this.settingManager = settingManager;
        const nexradModule = mapModel.getModule('nexrad');
        const rangeModule = mapModel.getModule('range');
        const declutterModule = mapModel.getModule('declutter');
        this.nexradVisController = new MapSymbolVisController(rangeModule, declutterModule, settingManager, 'mapNexradShow', 'mapNexradRangeIndex', MapDeclutterMode.Level2, visibility => { nexradModule.showNexrad.set(visibility); });
    }
    /**
     * Initializes the NEXRAD controller.
     */
    init() {
        this.nexradVisController.init();
    }
    /**
     * Destroys this controller, freeing up resources associated with it. Once destroyed, this controller will no longer
     * automatically update the map terrain mode and scale.
     */
    destroy() {
        this.nexradVisController.destroy();
    }
}
