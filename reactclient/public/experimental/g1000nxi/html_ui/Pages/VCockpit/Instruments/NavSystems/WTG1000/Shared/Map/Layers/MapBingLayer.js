import { ArraySubject, FSComponent, Subject } from 'msfssdk';
import { MapBingLayer as BingLayer, MapLayer } from 'msfssdk/components/map';
import { MapTerrainMode } from '../Modules/MapTerrainModule';
import { MapUtils } from '../MapUtils';
/**
 * A map layer which displays the Bing map.
 */
export class MapBingLayer extends MapLayer {
    constructor() {
        super(...arguments);
        this.bingLayerRef = FSComponent.createRef();
        this.earthColorsSub = ArraySubject.create(MapBingLayer.ABSOLUTE_TERRAIN_COLORS.slice());
        this.referenceSub = Subject.create(EBingReference.SEA);
        this.wxrModeSub = Subject.create({ mode: EWeatherRadar.OFF, arcRadians: 2 });
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAttached() {
        var _a;
        this.props.model.getModule('terrain').terrainMode.sub(this.onTerrainModeChanged.bind(this), true);
        (_a = this.props.model.getModule('nexrad')) === null || _a === void 0 ? void 0 : _a.showNexrad.sub(on => this.wxrModeSub.set({ mode: on ? EWeatherRadar.TOPVIEW : EWeatherRadar.OFF, arcRadians: 2 }), true);
        this.bingLayerRef.instance.onAttached();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onWake() {
        this.bingLayerRef.instance.onWake();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onSleep() {
        this.bingLayerRef.instance.onSleep();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onMapProjectionChanged(mapProjection, changeFlags) {
        this.bingLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onUpdated(time, elapsed) {
        this.bingLayerRef.instance.onUpdated(time, elapsed);
    }
    /**
     * A callback which is called when the terrain mode changes.
     * @param mode The new terrain mode.
     */
    onTerrainModeChanged(mode) {
        let colors = MapBingLayer.NO_TERRAIN_COLORS;
        let reference = EBingReference.SEA;
        switch (mode) {
            case MapTerrainMode.Absolute:
                colors = MapBingLayer.ABSOLUTE_TERRAIN_COLORS;
                break;
            case MapTerrainMode.Relative:
                colors = MapBingLayer.RELATIVE_TERRAIN_COLORS;
                reference = EBingReference.PLANE;
                break;
        }
        this.earthColorsSub.set(colors);
        this.referenceSub.set(reference);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent(BingLayer, { ref: this.bingLayerRef, model: this.props.model, mapProjection: this.props.mapProjection, bingId: this.props.bingId, earthColors: this.earthColorsSub, reference: this.referenceSub, class: this.props.class, wxrMode: this.wxrModeSub }));
    }
}
MapBingLayer.NO_TERRAIN_COLORS = MapUtils.createNoTerrainEarthColors();
MapBingLayer.ABSOLUTE_TERRAIN_COLORS = MapUtils.createAbsoluteTerrainEarthColors();
MapBingLayer.RELATIVE_TERRAIN_COLORS = MapUtils.createRelativeTerrainEarthColors();
