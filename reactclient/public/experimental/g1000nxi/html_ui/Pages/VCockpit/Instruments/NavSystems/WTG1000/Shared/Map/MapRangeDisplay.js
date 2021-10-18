import { DisplayComponent, FSComponent, NumberFormatter, Subject, UnitType } from 'msfssdk';
import { NumberUnitDisplay } from '../UI/Common/NumberUnitDisplay';
import './MapRangeDisplay.css';
/**
 * The map layer showing the range display.
 */
export class MapRangeDisplay extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.displayUnitSub = Subject.create(null);
        this.autoSubject = Subject.create('false');
        this.autoOverrideSubject = Subject.create('false');
        this.displayUnitHandler = this.updateDisplayUnit.bind(this);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAfterRender() {
        this.props.range.sub(this.displayUnitHandler);
        this.props.displayUnit.sub(this.displayUnitHandler, true);
    }
    /**
     * Updates this component's display unit.
     */
    updateDisplayUnit() {
        const nominalDisplayUnit = this.props.displayUnit.get();
        const range = this.props.range.get();
        let displayUnit;
        if (nominalDisplayUnit && nominalDisplayUnit.equals(UnitType.NMILE)) {
            if (range.asUnit(UnitType.FOOT) <= 2501) {
                displayUnit = UnitType.FOOT;
            }
            else {
                displayUnit = UnitType.NMILE;
            }
        }
        else if (nominalDisplayUnit && nominalDisplayUnit.equals(UnitType.KILOMETER)) {
            if (range.asUnit(UnitType.METER) < 999) {
                displayUnit = UnitType.METER;
            }
            else {
                displayUnit = UnitType.KILOMETER;
            }
        }
        else {
            displayUnit = nominalDisplayUnit;
        }
        this.displayUnitSub.set(displayUnit);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent("div", { class: `map-range-display${this.props.class ? ` ${this.props.class}` : ''}`, auto: this.autoSubject, "auto-override": this.autoOverrideSubject, style: 'display: flex; flex-flow: column nowrap; align-items: center;' },
            FSComponent.buildComponent("div", { class: 'map-range-display-auto', style: 'display: none;' }, "AUTO"),
            FSComponent.buildComponent(NumberUnitDisplay, { value: this.props.range, displayUnit: this.displayUnitSub, formatter: NumberFormatter.create({ precision: 0.01, forceDecimalZeroes: false, maxDigits: 3 }) })));
    }
}
