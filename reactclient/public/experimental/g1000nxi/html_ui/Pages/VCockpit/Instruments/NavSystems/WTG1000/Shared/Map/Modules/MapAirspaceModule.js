import { Subject } from 'msfssdk';
export var AirspaceRangeType;
(function (AirspaceRangeType) {
    AirspaceRangeType["ClassB"] = "ClassB";
    AirspaceRangeType["ClassC"] = "ClassC";
    AirspaceRangeType["ClassD"] = "ClassD";
    AirspaceRangeType["Restricted"] = "Restricted";
    AirspaceRangeType["MOA"] = "MOA";
    AirspaceRangeType["Other"] = "Other";
})(AirspaceRangeType || (AirspaceRangeType = {}));
/**
 * A module describing the display of airspaces.
 */
export class MapAirspaceModule {
    constructor() {
        /** Whether to show airspaces. */
        this.show = Subject.create(true);
        // TODO: Defaults are hard-coded here for now, but eventually will want to move default definitions outside of this
        // class (probably to initialization code of specific MapModels).
        /** The index of the maximum nominal map range at which to show airspaces of a specific type. */
        this.maxRangeIndex = {
            [AirspaceRangeType.ClassB]: Subject.create(19),
            [AirspaceRangeType.ClassC]: Subject.create(21),
            [AirspaceRangeType.ClassD]: Subject.create(20),
            [AirspaceRangeType.Restricted]: Subject.create(19),
            [AirspaceRangeType.MOA]: Subject.create(19),
            [AirspaceRangeType.Other]: Subject.create(19),
        };
    }
}
