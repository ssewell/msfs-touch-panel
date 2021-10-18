import { FSComponent, DisplayComponent, Subject, NavMath } from 'msfssdk';
import { NavSourceType } from 'msfssdk/instruments/NavProcessor';
import { Transponder } from './Transponder';
import './BottomInfoPanel.css';
/**
 * The PFD attitude indicator.
 */
export class BottomInfoPanel extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.oatValue = Subject.create(13);
        this.utcTimeStr = Subject.create('19:38:12');
        this.timerStr = Subject.create('0:00:00');
        this.hdg = 0;
        this.bearingPointerAdf = [false, false];
        this.bearingPointerDirection = [null, null];
        this.bearing1Container = FSComponent.createRef();
        this.bearing2Container = FSComponent.createRef();
        this.bearing1SrcElement = FSComponent.createRef();
        this.bearing2SrcElement = FSComponent.createRef();
        this.bearing1DistElement = FSComponent.createRef();
        this.bearing1DistUnits = FSComponent.createRef();
        this.bearing2DistElement = FSComponent.createRef();
        this.bearing2DistUnits = FSComponent.createRef();
        this.bearing1DirElement = FSComponent.createRef();
        this.bearing2DirElement = FSComponent.createRef();
        this.bearing1IdentElement = FSComponent.createRef();
        this.bearing2IdentElement = FSComponent.createRef();
        /**
         * A callback called when the UTC time updates from the event bus.
         * @param utcTime The current utcTime value.
         */
        this.onUtcUpdate = (utcTime) => {
            const seconds = Math.round(utcTime);
            const time = Utils.SecondsToDisplayTime(seconds, true, true, false);
            this.utcTimeStr.set(time);
        };
        /**
         * A callback called when the pitch updates from the event bus.
         * @param temp The current pitch value.
         */
        this.onUpdateOAT = (temp) => {
            this.oatValue.set(temp);
        };
        /**
         * Handle an updated bearing source.
         * @param data The new bearing source info.
         */
        this.onUpdateBearingSrc = (data) => {
            var _a;
            let newLabel = '';
            let updateItem;
            switch ((_a = data.source) === null || _a === void 0 ? void 0 : _a.type) {
                case NavSourceType.Nav:
                    this.bearingPointerAdf[data.index] = false;
                    newLabel = `NAV${data.source.index}`;
                    break;
                case NavSourceType.Gps:
                    this.bearingPointerAdf[data.index] = false;
                    newLabel = 'GPS';
                    break;
                case NavSourceType.Adf:
                    this.bearingPointerAdf[data.index] = true;
                    newLabel = 'ADF';
                    break;
                default:
                    this.bearingPointerAdf[data.index] = false;
                    newLabel = '';
            }
            const direction = this.bearingPointerDirection[data.index];
            if (direction !== null) {
                this.onUpdateBearingDir({ index: data.index, direction: direction });
            }
            switch (data.index) {
                case 0:
                    updateItem = this.bearing1SrcElement;
                    break;
                case 1:
                    updateItem = this.bearing2SrcElement;
                    break;
                default:
                    updateItem = null;
            }
            if (updateItem && updateItem.instance !== null) {
                updateItem.instance.textContent = newLabel;
            }
            if (newLabel == '' && (updateItem === null || updateItem === void 0 ? void 0 : updateItem.instance) !== null) {
                this.onShowBearingDataElement(false, data.index);
            }
            else if (newLabel != '' && (updateItem === null || updateItem === void 0 ? void 0 : updateItem.instance) !== null) {
                this.onShowBearingDataElement(true, data.index);
            }
        };
        /**
         * Handle hiding or showing the entire bearing needle data element.
         * @param display Whether to show thhe bearing needle data element or not.
         * @param index is the index of the bearing source
         */
        this.onShowBearingDataElement = (display, index) => {
            const instance = index == 0 ? this.bearing1Container.instance : index == 1 ? this.bearing2Container.instance : null;
            if (instance !== null && display) {
                instance.style.display = '';
            }
            else if (instance !== null && !display) {
                instance.style.display = 'none';
            }
        };
        /**
         * Handle an updated bearing distance.
         * @param data The BearingDistance message.
         */
        this.onUpdateBearingDist = (data) => {
            let element = undefined;
            let element2 = undefined;
            switch (data.index) {
                case 0:
                    element = this.bearing1DistElement;
                    element2 = this.bearing1DistUnits;
                    break;
                case 1:
                    element = this.bearing2DistElement;
                    element2 = this.bearing2DistUnits;
                    break;
            }
            if (element !== undefined && element2 !== undefined && element.instance !== null && element2.instance !== null) {
                element.instance.textContent = data.distance == null ? '' : data.distance.toFixed(1);
                element2.instance.textContent = data.distance == null ? '' : 'NM';
            }
        };
        /**
         * Handle an updated bearing heading..
         * @param data The BearingDirection message.
         */
        this.onUpdateBearingDir = (data) => {
            this.bearingPointerDirection[data.index] = data.direction;
            let element = undefined;
            switch (data.index) {
                case 0:
                    element = this.bearing1DirElement;
                    break;
                case 1:
                    element = this.bearing2DirElement;
                    break;
            }
            if (element !== undefined && element.instance !== null) {
                let direction = data.direction;
                if (this.bearingPointerAdf[data.index] && data.direction !== null) {
                    direction = NavMath.normalizeHeading(data.direction + this.hdg);
                }
                element.instance.textContent = direction == null ? '' : direction.toFixed(0).padStart(3, '0') + '°';
            }
        };
        /**
         * Handle an updated bearing ident.
         * @param data The BearingIdent message.
         */
        this.onUpdateBearingIdent = (data) => {
            let element = undefined;
            switch (data.index) {
                case 0:
                    element = this.bearing1IdentElement;
                    break;
                case 1:
                    element = this.bearing2IdentElement;
                    break;
            }
            if (element !== undefined && element.instance !== null) {
                element.instance.textContent = data.isLoc ? 'ILS' : data.ident == null ? ' _ _ _ _ _ _' : '' + data.ident + '';
            }
        };
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        const adc = this.props.bus.getSubscriber();
        const gnss = this.props.bus.getSubscriber();
        const g1000 = this.props.bus.getSubscriber();
        adc.on('ambient_temp_c')
            .withPrecision(0)
            .handle(this.onUpdateOAT);
        adc.on('hdg_deg')
            .withPrecision(0)
            .handle((h) => { this.hdg = h; });
        gnss.on('zulu_time')
            .withPrecision(0)
            .whenChangedBy(1)
            .handle(this.onUtcUpdate);
        g1000.on('timer_value')
            .whenChangedBy(1)
            .handle((time) => {
            this.timerStr.set(Utils.SecondsToDisplayDuration(time, true, true, true));
        });
        const nav = this.props.bus.getSubscriber();
        nav.on('brg_source').whenChanged().handle(this.onUpdateBearingSrc);
        nav.on('brg_distance').handle(this.onUpdateBearingDist);
        nav.on('brg_direction').handle(this.onUpdateBearingDir);
        nav.on('brg_ident').whenChanged().handle(this.onUpdateBearingIdent);
        if (this.bearing1Container.instance !== null && this.bearing2Container.instance !== null) {
            this.bearing1Container.instance.style.display = 'none';
            this.bearing2Container.instance.style.display = 'none';
        }
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "bottom-info-panel" },
            FSComponent.buildComponent("div", { class: "bip-temp-box" },
                FSComponent.buildComponent("div", { class: "bip-oat" },
                    FSComponent.buildComponent("div", { class: "bip-oat-label" },
                        FSComponent.buildComponent("span", { class: 'size16' }, "OAT")),
                    FSComponent.buildComponent("div", { class: "bip-oat-value" },
                        FSComponent.buildComponent("span", null,
                            this.oatValue,
                            "\u00B0"),
                        FSComponent.buildComponent("span", { class: 'size16' }, "C")))),
            FSComponent.buildComponent("div", { class: "bip-middle" },
                FSComponent.buildComponent("svg", { viewBox: "0 0 721 55" },
                    FSComponent.buildComponent("defs", null,
                        FSComponent.buildComponent("linearGradient", { id: "gradientBottom", x1: "0%", y1: "0%", x2: "0%", y2: "100%" },
                            FSComponent.buildComponent("stop", { offset: "0%", style: "stop-color:rgb(24,24,24);stop-opacity:1" }),
                            FSComponent.buildComponent("stop", { offset: "100%", style: "stop-color:rgb(0,0,0);stop-opacity:1" }))),
                    FSComponent.buildComponent("path", { d: "M 0 0 l 258 0 a 147 147 0 0 0 204 0 l 260 0 l 0 55 l -722 0 l 0 -55 z", fill: "url(#gradientBottom)" })),
                FSComponent.buildComponent("div", { class: "left-brg-ptr-container", ref: this.bearing1Container },
                    FSComponent.buildComponent("div", { class: "left-brg-ptr-dist" },
                        FSComponent.buildComponent("span", { ref: this.bearing1DistElement }),
                        FSComponent.buildComponent("span", { ref: this.bearing1DistUnits, class: "size14" })),
                    FSComponent.buildComponent("div", { class: "left-brg-ptr-crs-ident" },
                        FSComponent.buildComponent("span", { class: "left-brg-ptr-crs", ref: this.bearing1DirElement }),
                        FSComponent.buildComponent("span", { class: "left-brg-ptr-ident", ref: this.bearing1IdentElement })),
                    FSComponent.buildComponent("div", { class: "left-brg-ptr-src", ref: this.bearing1SrcElement }),
                    FSComponent.buildComponent("div", { class: "left-brg-ptr-svg" },
                        FSComponent.buildComponent("svg", { width: "19", height: "10" },
                            FSComponent.buildComponent("path", { d: "M 0 4 l 18 0 m -10 -4 l -4 4 l 4 4", fill: "none", stroke: "cyan", "stroke-width": "1.0px" })))),
                FSComponent.buildComponent("div", { class: "right-brg-ptr-container", ref: this.bearing2Container },
                    FSComponent.buildComponent("div", { class: "right-brg-ptr-dist" },
                        FSComponent.buildComponent("span", { ref: this.bearing2DistElement }),
                        FSComponent.buildComponent("span", { ref: this.bearing2DistUnits, class: "size14" })),
                    FSComponent.buildComponent("div", { class: "right-brg-ptr-crs-ident" },
                        FSComponent.buildComponent("span", { class: "right-brg-ptr-ident", ref: this.bearing2IdentElement }),
                        FSComponent.buildComponent("span", { class: "right-brg-ptr-crs", ref: this.bearing2DirElement })),
                    FSComponent.buildComponent("div", { class: "right-brg-ptr-src", ref: this.bearing2SrcElement }),
                    FSComponent.buildComponent("div", { class: "right-brg-ptr-svg" },
                        FSComponent.buildComponent("svg", { width: "19", height: "10" },
                            FSComponent.buildComponent("path", { d: "M 0 4 l 3 0 m 12 0 l 4 0 m -8 -4 l 4 4 l -4 4 m 2 -6 l -10 0 l 0 4 l 10 0", fill: "none", stroke: "cyan", "stroke-width": "1.0px" }))))),
            FSComponent.buildComponent(Transponder, { bus: this.props.bus, controlPublisher: this.props.controlPublisher }),
            FSComponent.buildComponent("div", { class: "bip-time" },
                FSComponent.buildComponent("div", { class: 'size16' }, "TMR"),
                FSComponent.buildComponent("div", { class: 'size20' }, this.timerStr),
                FSComponent.buildComponent("div", { class: 'size16' }, "UTC"),
                FSComponent.buildComponent("div", { class: 'size20' }, this.utcTimeStr))));
    }
}
