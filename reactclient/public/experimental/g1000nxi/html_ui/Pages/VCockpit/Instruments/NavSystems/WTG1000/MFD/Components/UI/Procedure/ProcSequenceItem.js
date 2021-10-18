import { FSComponent, ComputedSubject, Subject } from 'msfssdk';
import { FixTypeFlags } from 'msfssdk/navigation';
import { UiControl } from '../../../../Shared/UI/UiControl';
/** The Procedure Sequence component. */
export class ProcSequenceItem extends UiControl {
    /**
     * Creates an instance of FixInfo.
     * @param props The props of the component.
     */
    constructor(props) {
        var _a, _b, _c, _d, _e;
        super(props);
        this.fixEl = FSComponent.createRef();
        this._distanceUnits = Subject.create('NM');
        this._fixType = ComputedSubject.create((_a = this.props.data.get().leg.fixTypeFlags) !== null && _a !== void 0 ? _a : FixTypeFlags.None, (v) => {
            if (this.props.data.get().name === 'MANSEQ') {
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
        this._dtk = ComputedSubject.create((_c = (_b = this.props.data.get().calculated) === null || _b === void 0 ? void 0 : _b.initialDtk) !== null && _c !== void 0 ? _c : -1, (v) => {
            if (v < 0) {
                return '';
            }
            else {
                const rounded = Math.round(v);
                return `${(rounded === 0 ? 360 : rounded).toFixed(0).padStart(3, '0')}°`;
            }
        });
        this._distance = ComputedSubject.create((_e = (_d = this.props.data.get().calculated) === null || _d === void 0 ? void 0 : _d.distance) !== null && _e !== void 0 ? _e : -1, (v) => {
            if (isNaN(v) || v < 0.1) {
                this._distanceUnits.set('');
                return '';
            }
            else {
                this._distanceUnits.set('NM');
                const dis = (v / 1852);
                return dis.toFixed((dis < 100) ? 1 : 0);
            }
        });
        this.props.data.sub((v) => {
            var _a, _b, _c, _d, _e;
            const dtk = (_b = (_a = v.calculated) === null || _a === void 0 ? void 0 : _a.initialDtk) !== null && _b !== void 0 ? _b : -1;
            this._dtk.set(dtk);
            this._distance.set((_d = (_c = v.calculated) === null || _c === void 0 ? void 0 : _c.distance) !== null && _d !== void 0 ? _d : 0);
            this._fixType.set((_e = v.leg.fixTypeFlags) !== null && _e !== void 0 ? _e : 0);
        });
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
        return this.fixEl.instance.firstElementChild;
    }
    /** @inheritdoc */
    renderControl() {
        return (FSComponent.buildComponent("div", { class: 'sequence-item-container', ref: this.fixEl },
            FSComponent.buildComponent("div", null,
                this.props.data.get().name,
                FSComponent.buildComponent("span", { class: 'sequence-fix-type' }, this._fixType)),
            FSComponent.buildComponent("div", { style: 'color: whitesmoke;' }, this._dtk),
            FSComponent.buildComponent("div", { style: 'color: whitesmoke;' },
                this._distance,
                FSComponent.buildComponent("span", { class: "smallText" }, this._distanceUnits))));
    }
}
