import { FSComponent, DisplayComponent, Subject } from 'msfssdk';
import { ICAO } from 'msfssdk/navigation';
import { FmsUtils } from '../../FlightPlan/FmsUtils';
import './ApproachNameDisplay.css';
/** A VNode representing a preformated rendering of an approach's name. */
export class ApproachNameDisplay extends DisplayComponent {
    constructor() {
        var _a, _b;
        super(...arguments);
        this.nameRef = FSComponent.createRef();
        this.airportRef = FSComponent.createRef();
        this.subTypeRef = FSComponent.createRef();
        this.suffixRef = FSComponent.createRef();
        this.runwayRef = FSComponent.createRef();
        this.flagsRef = FSComponent.createRef();
        this.nullRef = FSComponent.createRef();
        this.airportSub = (_b = (_a = this.props.airport) === null || _a === void 0 ? void 0 : _a.map(airport => airport ? ICAO.getIdent(airport.icao) : '')) !== null && _b !== void 0 ? _b : Subject.create('');
        this.namePartsSub = this.props.approach.map(approach => approach ? FmsUtils.getApproachNameAsParts(approach) : null);
        this.typeSub = this.namePartsSub.map(parts => { var _a; return (_a = parts === null || parts === void 0 ? void 0 : parts.type) !== null && _a !== void 0 ? _a : ''; });
        this.subTypeSub = this.namePartsSub.map(parts => { var _a; return (_a = parts === null || parts === void 0 ? void 0 : parts.subtype) !== null && _a !== void 0 ? _a : ''; });
        this.suffixConnectorSub = this.namePartsSub.map(parts => !parts || parts.runway ? ' ' : '–');
        this.suffixSub = this.namePartsSub.map(parts => { var _a; return (_a = parts === null || parts === void 0 ? void 0 : parts.suffix) !== null && _a !== void 0 ? _a : ''; });
        this.runwaySub = this.namePartsSub.map(parts => { var _a; return (_a = parts === null || parts === void 0 ? void 0 : parts.runway) !== null && _a !== void 0 ? _a : ''; });
        this.flagsSub = this.namePartsSub.map(parts => { var _a; return (_a = parts === null || parts === void 0 ? void 0 : parts.flags) !== null && _a !== void 0 ? _a : ''; });
    }
    /** @inheritdoc */
    onAfterRender() {
        this.namePartsSub.sub(parts => {
            this.nameRef.instance.style.display = parts ? '' : 'none';
            this.nullRef.instance.style.display = this.props.nullText === undefined || parts ? 'none' : '';
        }, true);
        this.airportSub.sub(value => { this.airportRef.instance.style.display = value === '' ? 'none' : ''; }, true);
        this.subTypeSub.sub(value => { this.subTypeRef.instance.style.display = value === '' ? 'none' : ''; }, true);
        this.suffixSub.sub(value => { this.suffixRef.instance.style.display = value === '' ? 'none' : ''; }, true);
        this.runwaySub.sub(value => { this.flagsRef.instance.style.display = value === '' ? 'none' : ''; }, true);
        this.flagsSub.sub(value => { this.flagsRef.instance.style.display = value === '' ? 'none' : ''; }, true);
    }
    /** @inheritdoc */
    render() {
        var _a, _b;
        return (FSComponent.buildComponent("div", { class: `appr-name ${(_a = this.props.class) !== null && _a !== void 0 ? _a : ''}` },
            FSComponent.buildComponent("span", { ref: this.nameRef },
                FSComponent.buildComponent("span", { ref: this.airportRef },
                    this.airportSub,
                    "\u2013"),
                FSComponent.buildComponent("span", null, this.typeSub),
                FSComponent.buildComponent("span", { ref: this.subTypeRef, class: 'appr-name-subtype' }, this.subTypeSub),
                FSComponent.buildComponent("span", { ref: this.suffixRef },
                    this.suffixConnectorSub,
                    this.suffixSub),
                FSComponent.buildComponent("span", { ref: this.runwayRef },
                    " ",
                    this.runwaySub),
                FSComponent.buildComponent("span", { ref: this.flagsRef },
                    " ",
                    this.flagsSub)),
            FSComponent.buildComponent("span", { ref: this.nullRef }, (_b = this.props.nullText) !== null && _b !== void 0 ? _b : '')));
    }
    /** @inheritdoc */
    destroy() {
        this.namePartsSub.destroy();
    }
}
