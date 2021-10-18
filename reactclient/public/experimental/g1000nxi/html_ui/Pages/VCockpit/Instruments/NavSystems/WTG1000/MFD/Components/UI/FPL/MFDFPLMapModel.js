import { NavMapModel } from '../../../../Shared/UI/NavMap/NavMapModel';
import { MapFlightPlanFocusModule } from '../../../../Shared/Map/Modules/MapFlightPlanFocusModule';
/**
 * Class for creating MFD FPL map models.
 */
export class MFDFPLMapModel {
    /**
     * Creates an instance of an MFD FPL map model.
     * @param tcas A TCAS to use to get traffic avoidance information.
     * @param options Initialization options for the new model.
     * @returns a navmap model instance.
     */
    static createModel(tcas, options) {
        const model = NavMapModel.createModel(tcas, options);
        model.addModule('focus', new MapFlightPlanFocusModule());
        return model;
    }
}
