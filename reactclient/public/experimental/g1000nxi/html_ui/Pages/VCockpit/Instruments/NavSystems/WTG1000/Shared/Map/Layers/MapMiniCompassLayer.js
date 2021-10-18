import { BitFlags, FSComponent } from 'msfssdk';
import { MapLayer, MapProjectionChangeType } from 'msfssdk/components/map';
/**
 * The map layer showing a rotating compass arrow pointing to true north.
 */
export class MapMiniCompassLayer extends MapLayer {
    constructor() {
        super(...arguments);
        this.imgRef = FSComponent.createRef();
        this.needUpdate = false;
    }
    /** @inheritdoc */
    onAttached() {
        this.needUpdate = true;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onMapProjectionChanged(mapProjection, changeFlags) {
        this.needUpdate = BitFlags.isAll(changeFlags, MapProjectionChangeType.Rotation);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc, @typescript-eslint/no-unused-vars
    onUpdated(time, elapsed) {
        if (!this.needUpdate) {
            return;
        }
        this.updateRotation();
        this.needUpdate = false;
    }
    /**
     * Updates the rotation of the arrow.
     */
    updateRotation() {
        const rotation = this.props.mapProjection.getRotation();
        this.imgRef.instance.style.transform = `rotate(${rotation}rad)`;
    }
    /** @inheritdoc */
    render() {
        var _a;
        return (FSComponent.buildComponent("div", { class: (_a = this.props.class) !== null && _a !== void 0 ? _a : '', style: 'position: relative; width: var(--minicompass-size, 4em); height: var(--minicompass-size, 4em);' },
            FSComponent.buildComponent("img", { ref: this.imgRef, src: this.props.imgSrc, style: 'width: 100%; height: 100%;' }),
            FSComponent.buildComponent("div", { style: 'position: absolute; top: 50%; width: 100%; transform: translateY(-50%); text-align: center; color: black;' }, "N")));
    }
}
