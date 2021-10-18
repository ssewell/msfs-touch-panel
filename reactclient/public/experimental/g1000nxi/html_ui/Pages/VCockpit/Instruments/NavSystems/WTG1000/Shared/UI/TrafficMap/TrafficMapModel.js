import { MapIndexedRangeModule, MapModel, MapOwnAirplaneIconModule, MapOwnAirplanePropsModule } from 'msfssdk/components/map';
import { MapOrientationModule } from '../../Map/Modules/MapOrientationModule';
import { MapTrafficModule } from '../../Map/Modules/MapTrafficModule';
/**
 * Class for creating traffic map models.
 */
export class TrafficMapModel {
    /**
     * Creates an instance of a traffic map model.
     * @param tcas A TCAS.
     * @returns a traffic map model instance.
     */
    static createModel(tcas) {
        const model = new MapModel();
        model.addModule('range', new MapIndexedRangeModule());
        model.addModule('orientation', new MapOrientationModule());
        model.addModule('ownAirplaneProps', new MapOwnAirplanePropsModule());
        model.addModule('ownAirplaneIcon', new MapOwnAirplaneIconModule());
        model.addModule('traffic', new MapTrafficModule(tcas));
        return model;
    }
}
