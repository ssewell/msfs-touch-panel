import { MapIndexedRangeModule, MapModel, MapOwnAirplaneIconModule, MapOwnAirplanePropsModule } from 'msfssdk/components/map';
import { MapAirspaceModule } from '../../Map/Modules/MapAirspaceModule';
import { MapCrosshairModule } from '../../Map/Modules/MapCrosshairModule';
import { MapDeclutterModule } from '../../Map/Modules/MapDeclutterModule';
import { MapNexradModule } from '../../Map/Modules/MapNexradModule';
import { MapOrientation, MapOrientationModule } from '../../Map/Modules/MapOrientationModule';
import { MapPointerModule } from '../../Map/Modules/MapPointerModule';
import { MapRangeRingModule } from '../../Map/Modules/MapRangeRingModule';
import { MapTerrainModule } from '../../Map/Modules/MapTerrainModule';
import { MapWaypointHighlightModule } from '../../Map/Modules/MapWaypointHighlightModule';
import { MapWaypointsModule } from '../../Map/Modules/MapWaypointsModule';
/**
 * Class for creating navmap models.
 */
export class WaypointMapModel {
    /**
     * Creates an instance of a navmap model.
     * @returns a navmap model instance.
     */
    static createModel() {
        const model = new MapModel();
        model.addModule('range', new MapIndexedRangeModule());
        model.addModule('orientation', new MapOrientationModule());
        model.addModule('declutter', new MapDeclutterModule());
        model.addModule('terrain', new MapTerrainModule());
        model.addModule('ownAirplaneProps', new MapOwnAirplanePropsModule());
        model.addModule('ownAirplaneIcon', new MapOwnAirplaneIconModule());
        model.addModule('rangeRing', new MapRangeRingModule());
        model.addModule('waypoints', new MapWaypointsModule());
        model.addModule('airspace', new MapAirspaceModule());
        model.addModule('waypointHighlight', new MapWaypointHighlightModule());
        model.addModule('nexrad', new MapNexradModule());
        model.addModule('pointer', new MapPointerModule());
        model.addModule('crosshair', new MapCrosshairModule());
        model.getModule('orientation').orientation.set(MapOrientation.NorthUp);
        return model;
    }
}
