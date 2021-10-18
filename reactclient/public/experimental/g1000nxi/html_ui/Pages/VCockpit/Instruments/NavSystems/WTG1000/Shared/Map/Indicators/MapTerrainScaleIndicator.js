import { DisplayComponent, FSComponent, Subject } from 'msfssdk';
import { MapTerrainMode } from '../Modules/MapTerrainModule';
import './MapTerrainScaleIndicator.css';
/**
 * Displays a terrain color scale.
 */
export class MapTerrainScaleIndicator extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.rootRef = FSComponent.createRef();
        this.absLabelTextSubs = [
            Subject.create('27000'),
            Subject.create('10000'),
            Subject.create('8000'),
            Subject.create('6000'),
            Subject.create('3000'),
            Subject.create('2000'),
            Subject.create('500'),
            Subject.create('0')
        ];
        this.relLabelTextSubs = [
            Subject.create('−500'),
            Subject.create('−1000'),
            Subject.create('−2000')
        ];
        this.unitTextSub = Subject.create('');
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAfterRender() {
        this.props.show.sub(this.updateDisplay.bind(this));
        this.props.terrainMode.sub(this.updateDisplay.bind(this), true);
    }
    /**
     * Updates the display of this indicator.
     */
    updateDisplay() {
        if (this.props.show.get()) {
            switch (this.props.terrainMode.get()) {
                case MapTerrainMode.None:
                    this.rootRef.instance.style.display = 'none';
                    this.rootRef.instance.classList.remove('terrain-abs', 'terrain-rel');
                    this.unitTextSub.set('');
                    break;
                case MapTerrainMode.Absolute:
                    this.rootRef.instance.style.display = '';
                    this.rootRef.instance.classList.remove('terrain-rel');
                    this.rootRef.instance.classList.add('terrain-abs');
                    this.unitTextSub.set('');
                    break;
                case MapTerrainMode.Relative:
                    this.rootRef.instance.style.display = '';
                    this.rootRef.instance.classList.remove('terrain-abs');
                    this.rootRef.instance.classList.add('terrain-rel');
                    this.unitTextSub.set('FT');
                    break;
            }
        }
        else {
            this.rootRef.instance.style.display = 'none';
            this.rootRef.instance.classList.remove('terrain-abs', 'terrain-rel');
        }
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("div", { ref: this.rootRef, class: 'map-terrainscale' },
            FSComponent.buildComponent("div", { class: 'map-terrainscale-scale terrainscale-abs' },
                FSComponent.buildComponent("div", { class: 'map-terrainscale-color', style: 'background: #c8c8c8;' }),
                FSComponent.buildComponent("div", { class: 'map-terrainscale-color', style: 'background: #939393;' },
                    FSComponent.buildComponent("div", { class: 'map-terrainscale-label' }, this.absLabelTextSubs[0])),
                FSComponent.buildComponent("div", { class: 'map-terrainscale-color', style: 'background: #904522;' },
                    FSComponent.buildComponent("div", { class: 'map-terrainscale-label' }, this.absLabelTextSubs[1])),
                FSComponent.buildComponent("div", { class: 'map-terrainscale-color', style: 'background: #904f25;' },
                    FSComponent.buildComponent("div", { class: 'map-terrainscale-label' }, this.absLabelTextSubs[2])),
                FSComponent.buildComponent("div", { class: 'map-terrainscale-color', style: 'background: #9d6434;' },
                    FSComponent.buildComponent("div", { class: 'map-terrainscale-label' }, this.absLabelTextSubs[3])),
                FSComponent.buildComponent("div", { class: 'map-terrainscale-color', style: 'background: #c58f45;' },
                    FSComponent.buildComponent("div", { class: 'map-terrainscale-label' }, this.absLabelTextSubs[4])),
                FSComponent.buildComponent("div", { class: 'map-terrainscale-color', style: 'background: #d0aa43;' },
                    FSComponent.buildComponent("div", { class: 'map-terrainscale-label' }, this.absLabelTextSubs[5])),
                FSComponent.buildComponent("div", { class: 'map-terrainscale-color', style: 'background: #456821;' },
                    FSComponent.buildComponent("div", { class: 'map-terrainscale-label' }, this.absLabelTextSubs[6])),
                FSComponent.buildComponent("div", { class: 'map-terrainscale-color', style: 'background: #427238;' },
                    FSComponent.buildComponent("div", { class: 'map-terrainscale-label' }, this.absLabelTextSubs[7]))),
            FSComponent.buildComponent("div", { class: 'map-terrainscale-scale terrainscale-rel' },
                FSComponent.buildComponent("div", { class: 'map-terrainscale-color', style: 'background: #ff0000' }),
                FSComponent.buildComponent("div", { class: 'map-terrainscale-color', style: 'background: #ffff00;' },
                    FSComponent.buildComponent("div", { class: 'map-terrainscale-label' }, this.relLabelTextSubs[0])),
                FSComponent.buildComponent("div", { class: 'map-terrainscale-color', style: 'background: #00ff00;' },
                    FSComponent.buildComponent("div", { class: 'map-terrainscale-label' }, this.relLabelTextSubs[1])),
                FSComponent.buildComponent("div", { class: 'map-terrainscale-color', style: 'background: #000000;' },
                    FSComponent.buildComponent("div", { class: 'map-terrainscale-label' }, this.relLabelTextSubs[2]))),
            FSComponent.buildComponent("div", { class: 'map-terrainscale-unit' }, this.unitTextSub)));
    }
}
