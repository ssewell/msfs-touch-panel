import { FSComponent, ComputedSubject, Units } from 'msfssdk';
import { FixTypeFlags, LegType } from 'msfssdk/navigation';
import { UiControl } from '../../../../Shared/UI/UiControl';
/** The FixInfo component. */
export class FixInfo extends UiControl {
    constructor() {
        var _a, _b, _c, _d, _e, _f, _g;
        super(...arguments);
        this.fixEl = FSComponent.createRef();
        this.highlightElementRef = FSComponent.createRef();
        this.altitudeRef = FSComponent.createRef();
        this.ACTIVE_WPT_CLASS = 'active-wpt';
        this._dtk = ComputedSubject.create((_b = (_a = this.props.data.get().legDefinition.calculated) === null || _a === void 0 ? void 0 : _a.initialDtk) !== null && _b !== void 0 ? _b : -1, (v) => {
            if (v < 0 || this.props.data.get().legIsBehind) {
                return '___';
            }
            else {
                const rounded = Math.round(v);
                return (rounded === 0 ? 360 : rounded).toFixed(0).padStart(3, '0');
            }
        });
        this._distance = ComputedSubject.create((_d = (_c = this.props.data.get().legDefinition.calculated) === null || _c === void 0 ? void 0 : _c.distance) !== null && _d !== void 0 ? _d : -1, (v) => {
            if (v < 0.1 || this.props.data.get().legIsBehind) {
                return '____';
            }
            else {
                // const dis = (v / 1852);
                const dis = Units.Meters.toNauticalMiles(v);
                return dis.toFixed((dis < 100) ? 1 : 0);
            }
        });
        this._altitude = ComputedSubject.create((_e = this.props.data.get().targetAltitude) !== null && _e !== void 0 ? _e : -1, (v) => {
            if (v < 1 || isNaN(v) || this.props.data.get().legIsBehind) {
                return '';
            }
            else {
                return Units.Meters.toFeet(v).toFixed(0);
            }
        });
        this._altitudeUnits = ComputedSubject.create((_f = this.props.data.get().targetAltitude) !== null && _f !== void 0 ? _f : -1, (v) => {
            if (v < 1 || isNaN(v) || this.props.data.get().legIsBehind) {
                return ' ';
            }
            else {
                return 'FT';
            }
        });
        this._fixType = ComputedSubject.create((_g = this.props.data.get().legDefinition.leg.fixTypeFlags) !== null && _g !== void 0 ? _g : FixTypeFlags.None, (v) => {
            const leg = this.props.data.get().legDefinition;
            if (leg.name === 'MANSEQ' && (leg.leg.type === LegType.FM || leg.leg.type === LegType.VM)) {
                return ' hdg';
            }
            switch (v) {
                case FixTypeFlags.FAF:
                    return ' faf';
                case FixTypeFlags.IAF:
                    return ' iaf';
                case FixTypeFlags.MAP:
                    return ' map';
                case FixTypeFlags.MAHP:
                    return ' mahp';
                default:
                    return '';
            }
        });
    }
    /**
     * Resets highlight animation when the leg goes to/from active so the right color variable is used.
     * We need to trigger a reflow so the browser parses the animation again.
     */
    resetHighlightAnimation() {
        const animName = this.highlightElementRef.instance.style.animationName;
        this.highlightElementRef.instance.style.animationName = 'none';
        this.highlightElementRef.instance.offsetHeight;
        this.highlightElementRef.instance.style.animationName = animName;
    }
    /**
     * Gets the container element location
     * @returns An array of x,y.
     */
    getContainerElementLocation() {
        return [this.fixEl.instance.offsetLeft, this.fixEl.instance.offsetTop];
    }
    /** @inheritdoc */
    getHighlightElement() {
        return this.highlightElementRef.instance;
    }
    /** @inheritdoc */
    onAfterRender() {
        super.onAfterRender();
        this.props.data.sub((v) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            if (v.isAirwayExitFix && v.isCollapsed) {
                this._dtk.set(-1);
                this._distance.set((_a = v.airwayDistance) !== null && _a !== void 0 ? _a : -1);
            }
            else if (v.legDefinition.leg.type === LegType.HF || v.legDefinition.leg.type === LegType.HM || v.legDefinition.leg.type === LegType.HA) {
                this._dtk.set(v.legDefinition.leg.course);
                const lastVectorIndex = ((_b = v.legDefinition.calculated) === null || _b === void 0 ? void 0 : _b.flightPath.length) ? ((_c = v.legDefinition.calculated) === null || _c === void 0 ? void 0 : _c.flightPath.length) - 1 : 0;
                this._distance.set((_e = (_d = v.legDefinition.calculated) === null || _d === void 0 ? void 0 : _d.flightPath[lastVectorIndex].distance) !== null && _e !== void 0 ? _e : 0);
            }
            else {
                this._dtk.set((_g = (_f = v.legDefinition.calculated) === null || _f === void 0 ? void 0 : _f.initialDtk) !== null && _g !== void 0 ? _g : -1);
                this._distance.set((_j = (_h = v.legDefinition.calculated) === null || _h === void 0 ? void 0 : _h.distance) !== null && _j !== void 0 ? _j : 0);
            }
            this._altitude.set((_k = v.targetAltitude) !== null && _k !== void 0 ? _k : -1);
            this._altitudeUnits.set((_l = v.targetAltitude) !== null && _l !== void 0 ? _l : -1);
            if (v.isActive) {
                this.fixEl.instance.classList.add(this.ACTIVE_WPT_CLASS);
                this.highlightElementRef.instance.classList.remove('fix-hold');
            }
            else {
                this.fixEl.instance.classList.remove(this.ACTIVE_WPT_CLASS);
            }
            if (this.getIsFocused()) {
                this.resetHighlightAnimation();
            }
            if ((v.isCollapsed && !v.isAirwayExitFix) || v.legDefinition.isInDirectToSequence) {
                this.setIsVisible(false);
            }
            else {
                this.setIsVisible(true);
            }
            if (v.isAirwayFix) {
                this.highlightElementRef.instance.style.marginLeft = v.isAirwayExitFix ? '5px' : '10px';
            }
            else {
                this.highlightElementRef.instance.style.marginLeft = '0px';
            }
            this._fixType.set((_m = v.legDefinition.leg.fixTypeFlags) !== null && _m !== void 0 ? _m : FixTypeFlags.None);
            if (v.legDefinition.leg.type === LegType.HF || v.legDefinition.leg.type === LegType.HM || v.legDefinition.leg.type === LegType.HA) {
                this.highlightElementRef.instance.classList.add('fix-hold');
            }
            else {
                this.highlightElementRef.instance.classList.remove('fix-hold');
            }
            if (this.props.isExtended && v.isAdvisory) {
                this.altitudeRef.instance.classList.add('alt-advisory');
            }
            else if (this.props.isExtended) {
                this.altitudeRef.instance.classList.remove('alt-advisory');
            }
        });
    }
    /** @inheritdoc */
    renderControl() {
        return (FSComponent.buildComponent("div", { class: 'fix-container', ref: this.fixEl },
            FSComponent.buildComponent("div", { class: 'fix-name' },
                FSComponent.buildComponent("span", { ref: this.highlightElementRef },
                    this.props.data.get().legDefinition.name,
                    FSComponent.buildComponent("span", { class: 'fix-type' }, this._fixType))),
            FSComponent.buildComponent("div", { class: this.props.isExtended ? 'mfd-dtk-value' : 'dtk-value' },
                this._dtk,
                "\u00B0"),
            FSComponent.buildComponent("div", { class: this.props.isExtended ? 'mfd-dis-value' : 'dis-value' },
                this._distance,
                FSComponent.buildComponent("span", { class: "smallText" }, "NM")),
            this.props.isExtended ? FSComponent.buildComponent("div", { ref: this.altitudeRef, class: 'mfd-alt-value' },
                this._altitude,
                FSComponent.buildComponent("span", { class: "smallText" }, this._altitudeUnits)) : null));
    }
}
