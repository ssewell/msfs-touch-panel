import { MapModel, MapIndexedRangeModule, MapOwnAirplaneIconModule, MapOwnAirplanePropsModule } from 'msfssdk/components/map';
import { MapAirspaceModule } from '../../Map/Modules/MapAirspaceModule';
import { MapOrientationModule } from '../../Map/Modules/MapOrientationModule';
import { MapRangeCompassModule } from '../../Map/Modules/MapRangeCompassModule';
import { MapRangeRingModule } from '../../Map/Modules/MapRangeRingModule';
import { MapTerrainModule } from '../../Map/Modules/MapTerrainModule';
import { MapTrafficModule } from '../../Map/Modules/MapTrafficModule';
import { MapWaypointsModule } from '../../Map/Modules/MapWaypointsModule';
import { MapNexradModule } from '../../Map/Modules/MapNexradModule';
import { MapDeclutterModule } from '../../Map/Modules/MapDeclutterModule';
import { MapPointerModule } from '../../Map/Modules/MapPointerModule';
import { MapCrosshairModule } from '../../Map/Modules/MapCrosshairModule';
/**
 * Class for creating navmap models.
 */
export class NavMapModel {
    /**
     * Creates an instance of a navmap model.
     * @param tcas A TCAS to use to get traffic avoidance information.
     * @param options Initialization options for the new model.
     * @returns a navmap model instance.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static createModel(tcas, options) {
        const model = new MapModel();
        model.addModule('range', new MapIndexedRangeModule());
        model.addModule('orientation', new MapOrientationModule());
        model.addModule('declutter', new MapDeclutterModule());
        model.addModule('terrain', new MapTerrainModule());
        model.addModule('ownAirplaneProps', new MapOwnAirplanePropsModule());
        model.addModule('ownAirplaneIcon', new MapOwnAirplaneIconModule());
        model.addModule('rangeRing', new MapRangeRingModule());
        model.addModule('rangeCompass', new MapRangeCompassModule());
        model.addModule('waypoints', new MapWaypointsModule());
        model.addModule('airspace', new MapAirspaceModule());
        model.addModule('traffic', new MapTrafficModule(tcas));
        model.addModule('nexrad', new MapNexradModule());
        model.addModule('pointer', new MapPointerModule());
        model.addModule('crosshair', new MapCrosshairModule());
        return model;
    }
}
