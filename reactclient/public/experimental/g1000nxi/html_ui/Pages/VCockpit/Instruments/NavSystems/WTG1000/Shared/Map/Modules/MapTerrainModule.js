import { Subject } from 'msfssdk';
/**
 * Map terrain display mode.
 */
export var MapTerrainMode;
(function (MapTerrainMode) {
    MapTerrainMode[MapTerrainMode["None"] = 0] = "None";
    MapTerrainMode[MapTerrainMode["Absolute"] = 1] = "Absolute";
    MapTerrainMode[MapTerrainMode["Relative"] = 2] = "Relative";
    MapTerrainMode[MapTerrainMode["Ground"] = 3] = "Ground";
})(MapTerrainMode || (MapTerrainMode = {}));
/**
 * A module describing the display of terrain.
 */
export class MapTerrainModule {
    constructor() {
        /** The terrain display mode. */
        this.terrainMode = Subject.create(MapTerrainMode.Absolute);
        /** Whether to show the terrain scale. */
        this.showScale = Subject.create(false);
    }
}
