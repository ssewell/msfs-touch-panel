import { FSComponent, Subject, UnitFamily, UnitType } from 'msfssdk';
import { AbstractNumberUnitDisplay } from 'msfssdk/components/common';
import './NumberUnitDisplay.css';
/**
 * A component which displays a number with units.
 */
export class NumberUnitDisplay extends AbstractNumberUnitDisplay {
    constructor() {
        super(...arguments);
        this.unitTextBigRef = FSComponent.createRef();
        this.numberTextSub = Subject.create('');
        this.unitTextBigSub = Subject.create('');
        this.unitTextSmallSub = Subject.create('');
    }
    /** @inheritdoc */
    onAfterRender() {
        super.onAfterRender();
        // We have to hide the "big" unit text when empty because an empty string will get rendered as a space.
        this.unitTextBigSub.sub((text) => { this.unitTextBigRef.instance.style.display = text === '' ? 'none' : ''; }, true);
    }
    /** @inheritdoc */
    onValueChanged(value) {
        this.setDisplay(value, this.props.displayUnit.get());
    }
    /** @inheritdoc */
    onDisplayUnitChanged(displayUnit) {
        this.setDisplay(this.props.value.get(), displayUnit);
    }
    /**
     * Displays this component's current value.
     * @param value The current value.
     * @param displayUnit The current display unit.
     */
    setDisplay(value, displayUnit) {
        var _a;
        if (!displayUnit || !value.unit.canConvert(displayUnit)) {
            displayUnit = value.unit;
        }
        const numberText = this.props.formatter(value.asUnit(displayUnit));
        this.numberTextSub.set(numberText);
        const unitText = (_a = (NumberUnitDisplay.UNIT_TEXT[displayUnit.family] ? NumberUnitDisplay.UNIT_TEXT[displayUnit.family][displayUnit.name] : undefined)) !== null && _a !== void 0 ? _a : '';
        if (unitText[0] === '°') {
            this.unitTextBigSub.set('°');
            this.unitTextSmallSub.set(unitText.substring(1));
        }
        else {
            this.unitTextBigSub.set('');
            this.unitTextSmallSub.set(unitText);
        }
    }
    /** @inheritdoc */
    render() {
        var _a;
        return (FSComponent.buildComponent("div", { class: (_a = this.props.class) !== null && _a !== void 0 ? _a : '', style: 'white-space: nowrap;' },
            FSComponent.buildComponent("span", { class: 'numberunit-num' }, this.numberTextSub),
            FSComponent.buildComponent("span", { ref: this.unitTextBigRef, class: 'numberunit-unit-big' }, this.unitTextBigSub),
            FSComponent.buildComponent("span", { class: 'numberunit-unit-small' }, this.unitTextSmallSub)));
    }
}
NumberUnitDisplay.UNIT_TEXT = {
    [UnitFamily.DISTANCE]: {
        [UnitType.METER.name]: 'M',
        [UnitType.FOOT.name]: 'FT',
        [UnitType.KILOMETER.name]: 'KM',
        [UnitType.NMILE.name]: 'NM'
    },
    [UnitFamily.ANGLE]: {
        [UnitType.DEGREE.name]: '°',
        [UnitType.RADIAN.name]: 'rad'
    },
    [UnitFamily.DURATION]: {
        [UnitType.SECOND.name]: 'S',
        [UnitType.MINUTE.name]: 'M',
        [UnitType.HOUR.name]: 'H'
    },
    [UnitFamily.WEIGHT]: {
        [UnitType.KILOGRAM.name]: 'KG',
        [UnitType.POUND.name]: 'LB',
        [UnitType.LITER_FUEL.name]: 'L',
        [UnitType.GALLON_FUEL.name]: 'GAL'
    },
    [UnitFamily.VOLUME]: {
        [UnitType.LITER.name]: 'L',
        [UnitType.GALLON.name]: 'GAL'
    },
    [UnitFamily.PRESSURE]: {
        [UnitType.HPA.name]: 'HPA',
        [UnitType.IN_HG.name]: 'INHG'
    },
    [UnitFamily.TEMP]: {
        [UnitType.CELSIUS.name]: '°C',
        [UnitType.FAHRENHEIT.name]: '°F'
    },
    [UnitType.KNOT.family]: {
        [UnitType.KNOT.name]: 'KT',
        [UnitType.KPH.name]: 'KH',
        [UnitType.MPM.name]: 'MPM',
        [UnitType.FPM.name]: 'FPM'
    },
    [UnitType.LPH_FUEL.family]: {
        [UnitType.KGH.name]: 'KGH',
        [UnitType.PPH.name]: 'PPH',
        [UnitType.LPH_FUEL.name]: 'LPH',
        [UnitType.GPH_FUEL.name]: 'GPH'
    }
};
