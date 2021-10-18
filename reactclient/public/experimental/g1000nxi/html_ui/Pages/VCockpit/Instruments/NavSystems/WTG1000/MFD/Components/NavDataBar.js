import { FSComponent, DisplayComponent, Subject } from 'msfssdk';
import './NavDataBar.css';
/**
 * The PFD airspeed indicator with speed tape.
 */
export class NavDataBar extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.gsElement = FSComponent.createRef();
        this.magneticTrackElement = FSComponent.createRef();
        this.dtkRef = FSComponent.createRef();
        this.eteRef = FSComponent.createRef();
        this.groundSpeed = 0;
        this.titleTextSub = Subject.create('');
        this.oldPage = null;
        this.titleHandler = (title) => { this.titleTextSub.set(title); };
        /**
         * A callback called when the GS updates from the event bus.
         * @param gs The current GS value.
         */
        this.onUpdateGS = (gs) => {
            if (this.gsElement.instance !== null) {
                this.gsElement.instance.textContent = `${(gs)}`;
                this.groundSpeed = gs;
            }
        };
        /**
         * A callback called when the magnetic track updates from the event bus.
         * @param trk The current trk value.
         */
        this.onUpdateTrack = (trk) => {
            if (this.magneticTrackElement.instance !== null && this.groundSpeed > 1) {
                this.magneticTrackElement.instance.textContent = `${(trk)}`.padStart(3, '0') + '°';
            }
        };
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        const lnav = this.props.bus.getSubscriber();
        const gnss = this.props.bus.getSubscriber();
        gnss.on('ground_speed')
            .withPrecision(0)
            .handle(this.onUpdateGS);
        gnss.on('track_deg_magnetic')
            .withPrecision(0)
            .handle(this.onUpdateTrack);
        lnav.on('lnavDtkMag').whenChangedBy(1).handle((dtk) => {
            if (this.dtkRef.instance !== null) {
                const dtkRounded = Math.round(dtk);
                const dtkValue = dtkRounded == 0 ? 360 : dtkRounded;
                this.dtkRef.instance.textContent = `${dtkValue}`.padStart(3, '0') + '°';
            }
        });
        lnav.on('lnavDis').whenChangedBy(0.1).handle((dis) => {
            if (this.eteRef.instance !== null) {
                if (this.groundSpeed < 30) {
                    this.eteRef.instance.textContent = '_ _:_ _';
                }
                else {
                    const eteHours = Math.floor(dis / this.groundSpeed);
                    const eteMinutes = Math.round(60 * (dis / this.groundSpeed) % 60);
                    const textHours = `${eteHours}`.padStart(2, '0');
                    const textMinutes = `${eteMinutes}`.padStart(2, '0');
                    this.eteRef.instance.textContent = textHours + ':' + textMinutes;
                }
            }
        });
        this.props.openPage.sub(this.onOpenPageChanged.bind(this), true);
    }
    /**
     * A callback which is called when the currently open page changes.
     * @param page The new open page.
     */
    onOpenPageChanged(page) {
        var _a;
        (_a = this.oldPage) === null || _a === void 0 ? void 0 : _a.title.unsub(this.titleHandler);
        page && page.title.sub(this.titleHandler, true);
        this.oldPage = page;
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { id: "Center" },
            FSComponent.buildComponent("table", null,
                FSComponent.buildComponent("tr", null,
                    FSComponent.buildComponent("td", { class: "smallText fieldTitle" }, "GS"),
                    FSComponent.buildComponent("td", { class: "magenta fieldData" },
                        FSComponent.buildComponent("span", { ref: this.gsElement }, "0"),
                        FSComponent.buildComponent("span", { class: "smallText magenta" }, "KT")),
                    FSComponent.buildComponent("td", { class: "smallText fieldTitle" }, "DTK"),
                    FSComponent.buildComponent("td", { ref: this.dtkRef, class: "magenta fieldData" }, "_ _ _\u00B0"),
                    FSComponent.buildComponent("td", { class: "smallText fieldTitle" }, "TRK"),
                    FSComponent.buildComponent("td", { ref: this.magneticTrackElement, class: "magenta fieldData" }),
                    FSComponent.buildComponent("td", { class: "smallText fieldTitle" }, "ETE"),
                    FSComponent.buildComponent("td", { ref: this.eteRef, class: "magenta fieldData" }, "_ _:_ _"))),
            FSComponent.buildComponent("span", { id: "mapTitle" }, this.titleTextSub)));
    }
}
