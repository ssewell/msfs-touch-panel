// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FSComponent, DisplayComponent } from 'msfssdk';
import { XMLColumnGroup } from './EngineInstruments/Columns';
import './EIS.css';
export var EISPageTypes;
(function (EISPageTypes) {
    EISPageTypes[EISPageTypes["Engine"] = 0] = "Engine";
    EISPageTypes[EISPageTypes["Lean"] = 1] = "Lean";
    EISPageTypes[EISPageTypes["System"] = 2] = "System";
})(EISPageTypes || (EISPageTypes = {}));
/**
 * This EIS is a shorcut for creating the base EIS display on the plane.  All the actual rendering and
 * management is hadled within an XMLGaugeColumn, but that's a litter more tedious to create.  This
 * component instantiates the EIS as a simple XMLColumnGroup with a single column that consists in
 * its entiretly of all the top-level gauges in the EIS.   Further nesting is handed by the internal
 * columns logic.
 */
export class EIS extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.enginePage = FSComponent.createRef();
        this.leanPage = FSComponent.createRef();
        this.systemPage = FSComponent.createRef();
    }
    /**
     * Initial config after rendering.
     */
    onAfterRender() {
        console.log('EIS props');
        console.log(this.props.gaugeConfig);
        this.enginePage.instance.style.display = '';
        this.setDisplay(this.leanPage, 'none');
        this.setDisplay(this.systemPage, 'none');
        for (const func of this.props.gaugeConfig.functions.values()) {
            this.props.logicHandler.addFunction(func);
        }
        const sub = this.props.bus.getSubscriber();
        sub.on('eis_page_select').handle(page => {
            switch (page) {
                case EISPageTypes.Engine:
                    this.enginePage.instance.style.display = '';
                    this.setDisplay(this.leanPage, 'none');
                    this.setDisplay(this.systemPage, 'none');
                    break;
                case EISPageTypes.Lean:
                    if (this.leanPage.getOrDefault()) {
                        this.enginePage.instance.style.display = 'none';
                        this.leanPage.instance.style.display = '';
                        this.setDisplay(this.systemPage, 'none');
                    }
                    break;
                case EISPageTypes.System:
                    if (this.systemPage.getOrDefault()) {
                        this.enginePage.instance.style.display = 'none';
                        this.setDisplay(this.leanPage, 'none');
                        this.systemPage.instance.style.display = '';
                    }
                    break;
            }
        });
    }
    /**
     * Shortcut for changing the display of an EIS data page, if it exists.
     * @param page The reference to the div containing the page.
     * @param display A string to set as the display style parameter.
     */
    setDisplay(page, display) {
        if (page.getOrDefault() !== null) {
            page.instance.style.display = display;
        }
    }
    /**
     * Render an EIS as a single XMLColumnGroup.
     * @returns a VNode
     */
    render() {
        return (FSComponent.buildComponent("div", null,
            FSComponent.buildComponent("div", { ref: this.enginePage },
                FSComponent.buildComponent(XMLColumnGroup, { bus: this.props.bus, logicHost: this.props.logicHandler, columns: [{ gauges: this.props.gaugeConfig.enginePage }] })),
            this.props.gaugeConfig.leanPage &&
                FSComponent.buildComponent("div", { ref: this.leanPage },
                    FSComponent.buildComponent(XMLColumnGroup, { bus: this.props.bus, logicHost: this.props.logicHandler, columns: [{ gauges: this.props.gaugeConfig.leanPage }] })),
            this.props.gaugeConfig.systemPage &&
                FSComponent.buildComponent("div", { ref: this.systemPage },
                    FSComponent.buildComponent(XMLColumnGroup, { bus: this.props.bus, logicHost: this.props.logicHandler, columns: [{ gauges: this.props.gaugeConfig.systemPage }] }))));
    }
}
