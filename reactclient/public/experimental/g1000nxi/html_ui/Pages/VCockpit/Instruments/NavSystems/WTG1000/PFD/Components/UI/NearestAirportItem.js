import { FSComponent, Subject, ComputedSubject, UnitType, NumberFormatter, NumberUnitSubject, NavMath } from 'msfssdk';
import { FacilityFrequencyType, ICAO } from 'msfssdk/navigation';
import { GenericControl } from '../../../Shared/UI/UIControls/GenericControl';
import { UiControlGroup } from '../../../Shared/UI/UiControlGroup';
import { WaypointIcon } from '../../../Shared/UI/Waypoint/WaypointIcon';
import { FacilityWaypointCache } from '../../../Shared/Navigation/FacilityWaypointCache';
import { NumberUnitDisplay } from '../../../Shared/UI/Common/NumberUnitDisplay';
/** The Nearest Airport component. */
export class NearestAirportItem extends UiControlGroup {
    constructor() {
        var _a, _b;
        super(...arguments);
        this.fixEl = FSComponent.createRef();
        this.facWaypointCache = FacilityWaypointCache.getCache();
        this.ident = ComputedSubject.create((_a = this.props.data.get().facility) === null || _a === void 0 ? void 0 : _a.icao, (v) => {
            if (v) {
                return ICAO.getIdent(v);
            }
            else {
                return '____';
            }
        });
        this.bearing = ComputedSubject.create((_b = this.props.data.get().bearing) !== null && _b !== void 0 ? _b : -1, (v) => {
            if (isNaN(v)) {
                return '___';
            }
            else {
                const norm = NavMath.normalizeHeading(Math.round(v));
                return (norm === 0 ? 360 : norm).toString().padStart(3, '0');
            }
        });
        this.distance = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(NaN));
        this.approach = ComputedSubject.create(this.props.data.get().bestApproach, (v) => {
            if (v) {
                return v;
            }
            else {
                return 'VFR';
            }
        });
        this.freqType = ComputedSubject.create(this.props.data.get().frequency, (v) => {
            switch (v === null || v === void 0 ? void 0 : v.type) {
                case FacilityFrequencyType.Tower:
                    return 'TOWER';
                case FacilityFrequencyType.Unicom:
                    return 'UNICOM';
                case FacilityFrequencyType.Multicom:
                case FacilityFrequencyType.CTAF:
                    return 'MULTICOM';
                default:
                    return '';
            }
        });
        this.frequency = ComputedSubject.create(this.props.data.get().frequency, (v) => {
            if (v === null || v === void 0 ? void 0 : v.freqMHz) {
                return v.freqMHz.toFixed(3);
            }
            else {
                return '';
            }
        });
        this.rwyLength = NumberUnitSubject.createFromNumberUnit(UnitType.FOOT.createNumber(NaN));
        this.frequencyControlRef = FSComponent.createRef();
        this.isVisible = true;
    }
    /**
     * Gets a boolean indicating if this control is able to be focused.
     * @returns true
     */
    getIsFocusable() {
        return this.isVisible && super.getIsFocusable();
    }
    /**
     * Hide this after render, until we get our first update, to avoid showing empty fields.
     */
    onAfterRender() {
        this.props.data.sub((v) => { this.updateData(v); }, true);
    }
    /** @inheritdoc */
    getHighlightElement() {
        return this.fixEl.instance.firstElementChild;
    }
    /**
     * Update our data when the subbed item changes.
     * @param v The new data.
     */
    updateData(v) {
        var _a;
        this.ident.set((_a = v.facility) === null || _a === void 0 ? void 0 : _a.icao);
        if (v.facility) {
            this.bearing.set(v.bearing);
            this.distance.set(v.distance, UnitType.METER);
            this.approach.set(v.bestApproach);
            this.freqType.set(v.frequency);
            this.frequency.set(v.frequency);
            if (v.frequency) {
                this.frequencyControlRef.instance.setIsEnabled(true);
            }
            else {
                this.frequencyControlRef.instance.setIsEnabled(false);
            }
            this.rwyLength.set(v.bestLength, UnitType.METER);
            this.setVisibility(true);
        }
        else {
            this.setVisibility(false);
        }
    }
    /**
     * Sets the visibility of this item.
     * @param value Whether this item should be visible.
     */
    setVisibility(value) {
        if (this.isVisible === value) {
            return;
        }
        if (value) {
            this.fixEl.instance.style.display = '';
        }
        else {
            this.blur();
            this.fixEl.instance.style.display = 'none';
        }
        this.isVisible = value;
    }
    /** @inheritdoc */
    render() {
        return (FSComponent.buildComponent("div", { class: 'nearest-airport-item', ref: this.fixEl },
            FSComponent.buildComponent("div", { class: 'nearest-airport-row nearest-airport-row1' },
                FSComponent.buildComponent(GenericControl, { onRegister: this.register, onDirectTo: () => this.props.directToHandler(this.props.data.get().facility), class: 'nearest-airport-name' },
                    FSComponent.buildComponent("span", null, this.ident)),
                FSComponent.buildComponent(WaypointIcon, { waypoint: this.props.data.map(v => v.facility ? this.facWaypointCache.get(v.facility) : null), planeHeading: this.props.planeHeading, class: 'nearest-airport-symbol' }),
                FSComponent.buildComponent("span", { class: 'nearest-airport-bearing' },
                    this.bearing,
                    "\u00B0"),
                FSComponent.buildComponent(NumberUnitDisplay, { value: this.distance, displayUnit: Subject.create(UnitType.NMILE), formatter: NumberFormatter.create({ precision: 0.1, maxDigits: 3, forceDecimalZeroes: false, nanString: '__._' }), class: 'nearest-airport-distance' }),
                FSComponent.buildComponent("span", { class: 'nearest-airport-approach' }, this.approach)),
            FSComponent.buildComponent("div", { class: 'nearest-airport-row nearest-airport-row2' },
                FSComponent.buildComponent("span", { class: 'nearest-airport-freqtype' }, this.freqType),
                FSComponent.buildComponent(GenericControl, { ref: this.frequencyControlRef, onRegister: this.register, onEnter: () => this.props.frequencyHandler(this.frequency.get()) },
                    FSComponent.buildComponent("span", { class: 'nearest-airport-frequency cyan' }, this.frequency)),
                FSComponent.buildComponent("div", { class: 'nearest-airport-rwy' },
                    FSComponent.buildComponent("span", { class: 'nearest-airport-rwy-title' }, "RWY"),
                    " ",
                    FSComponent.buildComponent(NumberUnitDisplay, { value: this.rwyLength, displayUnit: Subject.create(UnitType.FOOT), formatter: NumberFormatter.create({ precision: 1, nanString: '_____' }), class: 'nearest-airport-rwy-number' })))));
    }
}
