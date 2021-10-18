import { Subject } from 'msfssdk';
export var MapDeclutterMode;
(function (MapDeclutterMode) {
    MapDeclutterMode[MapDeclutterMode["All"] = 0] = "All";
    MapDeclutterMode[MapDeclutterMode["Level3"] = 1] = "Level3";
    MapDeclutterMode[MapDeclutterMode["Level2"] = 2] = "Level2";
    MapDeclutterMode[MapDeclutterMode["Level1"] = 3] = "Level1";
})(MapDeclutterMode || (MapDeclutterMode = {}));
/**
 * A module describing the declutter mode.
 */
export class MapDeclutterModule {
    constructor() {
        this.mode = Subject.create(MapDeclutterMode.All);
    }
}
