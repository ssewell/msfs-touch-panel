import { BitFlags, ComputedSubject, FSComponent, GeoPoint, GeoPointSubject, MagVar, NumberFormatter, NumberUnitSubject, Subject, UnitType } from 'msfssdk';
import { LatLonDisplay } from 'msfssdk/components/common';
import { MapLayer, MapProjectionChangeType } from 'msfssdk/components/map';
import { NumberUnitDisplay } from '../../UI/Common/NumberUnitDisplay';
import './MapPointerInfoLayer.css';
/**
 * Map pointer information box size.
 */
export var MapPointerInfoLayerSize;
(function (MapPointerInfoLayerSize) {
    MapPointerInfoLayerSize[MapPointerInfoLayerSize["Full"] = 0] = "Full";
    MapPointerInfoLayerSize[MapPointerInfoLayerSize["Medium"] = 1] = "Medium";
    MapPointerInfoLayerSize[MapPointerInfoLayerSize["Small"] = 2] = "Small";
})(MapPointerInfoLayerSize || (MapPointerInfoLayerSize = {}));
/**
 * A map layer which displays a pointer information box.
 */
export class MapPointerInfoLayer extends MapLayer {
    constructor() {
        super(...arguments);
        this.rootRef = FSComponent.createRef();
        this.ownAirplanePropsModule = this.props.model.getModule('ownAirplaneProps');
        this.pointerModule = this.props.model.getModule('pointer');
        this.distanceSub = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(NaN));
        this.distanceUnitSub = Subject.create(UnitType.NMILE);
        this.bearingSub = ComputedSubject.create(NaN, bearing => {
            const rounded = Math.round(bearing);
            return `${isNaN(bearing) ? '___' : (rounded === 0 ? 360 : rounded).toString().padStart(3, '0')}°`;
        });
        this.latLonSub = GeoPointSubject.createFromGeoPoint(new GeoPoint(0, 0));
        this.scheduleUpdateHandler = () => { this.needUpdate = true; };
        this.needUpdate = false;
    }
    /** @inheritdoc */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onVisibilityChanged(isVisible) {
        this.rootRef.getOrDefault() && this.updateFromVisibility();
    }
    /**
     * Updates this layer according to its current visibility.
     */
    updateFromVisibility() {
        if (this.isVisible()) {
            this.rootRef.instance.style.display = '';
            this.ownAirplanePropsModule.position.sub(this.scheduleUpdateHandler);
            this.pointerModule.position.sub(this.scheduleUpdateHandler, true);
        }
        else {
            this.rootRef.instance.style.display = 'none';
            this.ownAirplanePropsModule.position.unsub(this.scheduleUpdateHandler);
            this.pointerModule.position.unsub(this.scheduleUpdateHandler);
        }
    }
    /** @inheritdoc */
    onAfterRender() {
        this.updateFromVisibility();
        this.pointerModule.isActive.sub(isActive => this.setVisible(isActive), true);
    }
    /** @inheritdoc */
    onMapProjectionChanged(mapProjection, changeFlags) {
        this.needUpdate || (this.needUpdate = this.isVisible() && BitFlags.isAny(changeFlags, MapProjectionChangeType.Center | MapProjectionChangeType.Rotation | MapProjectionChangeType.ProjectedResolution));
    }
    /** @inheritdoc */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onUpdated(time, elapsed) {
        if (!this.needUpdate) {
            return;
        }
        this.updateInfo();
        this.needUpdate = false;
    }
    /**
     * Updates this layer's displayed information.
     */
    updateInfo() {
        const latLon = this.props.mapProjection.invert(this.pointerModule.position.get(), MapPointerInfoLayer.geoPointCache[0]);
        this.latLonSub.set(latLon);
        const airplanePos = this.ownAirplanePropsModule.position.get();
        this.distanceSub.set(airplanePos.distance(latLon), UnitType.GA_RADIAN);
        // TODO: Add support for metric
        if (this.distanceSub.get().compare(0.1) < 0) {
            this.distanceUnitSub.set(UnitType.FOOT);
        }
        else {
            this.distanceUnitSub.set(UnitType.NMILE);
        }
        this.bearingSub.set(MagVar.trueToMagnetic(airplanePos.bearingTo(latLon), airplanePos));
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("div", { ref: this.rootRef, class: 'map-pointerinfolayer-box' },
            FSComponent.buildComponent("div", { class: 'map-pointerinfolayer-box-column map-pointerinfolayer-box-dis' },
                FSComponent.buildComponent("span", { class: 'map-pointerinfolayer-box-title', style: this.props.size === MapPointerInfoLayerSize.Small ? 'display: none;' : '' }, "DIS"),
                FSComponent.buildComponent(NumberUnitDisplay, { value: this.distanceSub, displayUnit: this.distanceUnitSub, formatter: NumberFormatter.create({ precision: 0.1, maxDigits: 3, forceDecimalZeroes: false, nanString: '__._' }), class: 'map-pointerinfolayer-box-title-value' })),
            FSComponent.buildComponent("div", { class: 'map-pointerinfolayer-box-column map-pointerinfolayer-box-brg', style: this.props.size === MapPointerInfoLayerSize.Small ? 'display: none;' : '' },
                FSComponent.buildComponent("span", { class: 'map-pointerinfolayer-box-title' }, "BRG"),
                FSComponent.buildComponent("span", { class: 'map-pointerinfolayer-box-title-value' }, this.bearingSub)),
            this.props.size === MapPointerInfoLayerSize.Full
                ? FSComponent.buildComponent(LatLonDisplay, { location: this.latLonSub, class: 'map-pointerinfolayer-box-column map-pointerinfolayer-box-title-value' })
                : null));
    }
}
MapPointerInfoLayer.geoPointCache = [new GeoPoint(0, 0)];
