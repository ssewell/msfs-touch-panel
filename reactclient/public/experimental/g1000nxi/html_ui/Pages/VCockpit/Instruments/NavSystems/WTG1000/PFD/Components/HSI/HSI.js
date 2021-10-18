import { FSComponent, DisplayComponent, NodeReference, Subject } from 'msfssdk';
import { NavSourceType } from 'msfssdk/instruments';
import { ObsSuspModes } from '../../../Shared/Navigation/NavIndicatorController';
import { HSIMap } from './HSIMap';
import { HSIRose } from './HSIRose';
import './HSI.css';
import { PFDUserSettings, PfdMapLayoutSettingMode } from '../../PFDUserSettings';
/**
 * The HSI component of the PFD.
 */
export class HSI extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.roseRef = new NodeReference();
        this.mapRef = new NodeReference();
        this.minimumsContainerRef = FSComponent.createRef();
        this.hsiController = this.props.navIndicatorController;
        this.headingSelectElement = FSComponent.createRef();
        this.dtkBoxLabel = FSComponent.createRef();
        this.dtkBoxValue = FSComponent.createRef();
        this.minimumsValue = Subject.create('');
        /**
         * Updates the dtk/obs-crs ref box.
         */
        this.updateDtkBox = () => {
            switch (this.hsiController.navStates[this.hsiController.activeSourceIndex].source.type) {
                case NavSourceType.Nav:
                    this.dtkBoxLabel.instance.textContent = 'CRS';
                    this.dtkBoxValue.instance.style.color = '#00ff00';
                    break;
                case NavSourceType.Gps:
                    if (this.hsiController.obsSuspMode === ObsSuspModes.OBS) {
                        this.dtkBoxLabel.instance.textContent = 'CRS';
                    }
                    else {
                        this.dtkBoxLabel.instance.textContent = 'DTK';
                    }
                    this.dtkBoxValue.instance.style.color = 'magenta';
                    break;
            }
            const dtk = this.hsiController.navStates[this.hsiController.activeSourceIndex].dtk_obs;
            if (dtk !== null) {
                const disDtk = Math.round(dtk) == 0 ? 360 : Math.round(dtk);
                this.dtkBoxValue.instance.textContent = `${disDtk}°`.padStart(4, '0');
            }
        };
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        this.hsiController.onUpdateDtkBox = this.updateDtkBox;
        this.registerComponents();
        const ap = this.props.bus.getSubscriber();
        const g1000 = this.props.bus.getSubscriber();
        ap.on('heading_select')
            .withPrecision(0)
            .handle(this.updateSelectedHeadingDisplay.bind(this));
        g1000.on('set_minimums')
            .handle((mins) => {
            this.minimumsValue.set(`${mins}`);
        });
        g1000.on('show_minimums')
            .handle((show) => {
            if (show) {
                this.minimumsContainerRef.instance.style.display = '';
            }
            else {
                this.minimumsContainerRef.instance.style.display = 'none';
            }
        });
        //init mins to display = none
        this.minimumsContainerRef.instance.style.display = 'none';
        PFDUserSettings.getManager(this.props.bus).whenSettingChanged('mapLayout').handle((mode) => {
            this.hsiController.onFormatChange(mode === PfdMapLayoutSettingMode.HSI);
            this.mapRef.instance.setVisible(mode === PfdMapLayoutSettingMode.HSI);
        });
    }
    /**
     * Updates the heading indicator when the heading changes.
     * @param selHdg deg The new heading value.
     */
    updateSelectedHeadingDisplay(selHdg) {
        if (this.headingSelectElement.instance !== null) {
            const hdg = selHdg == 0 ? 360 : selHdg;
            this.headingSelectElement.instance.textContent = `${hdg}°`.padStart(4, '0');
        }
    }
    /**
     * Registers the rose and map hsi components with the HSI Controller.
     */
    registerComponents() {
        this.hsiController.hsiRefs.hsiRose = this.roseRef;
        this.hsiController.hsiRefs.hsiMap = this.mapRef;
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { id: "HSI" },
            FSComponent.buildComponent("div", { class: "hdgcrs-container hdg-box" },
                "HDG ",
                FSComponent.buildComponent("span", { class: "cyan size20", ref: this.headingSelectElement }, "326\u00B0")),
            FSComponent.buildComponent("div", { class: "hdgcrs-container dtk-box" },
                FSComponent.buildComponent("span", { ref: this.dtkBoxLabel }),
                "\u00A0",
                FSComponent.buildComponent("span", { ref: this.dtkBoxValue, class: "size20" })),
            FSComponent.buildComponent("div", { class: "mins-temp-comp-container", ref: this.minimumsContainerRef },
                FSComponent.buildComponent("div", { class: "mins-temp-comp-upper-text size10" }, "BARO"),
                FSComponent.buildComponent("div", { class: "mins-temp-comp-lower-text size14" }, "MIN"),
                FSComponent.buildComponent("div", { class: "mins-temp-comp-value size18 cyan" },
                    this.minimumsValue,
                    FSComponent.buildComponent("span", { class: "size12" }, "FT"))),
            FSComponent.buildComponent(HSIRose, { ref: this.roseRef, bus: this.props.bus, controller: this.hsiController }),
            FSComponent.buildComponent(HSIMap, { ref: this.mapRef, bus: this.props.bus, flightPlanner: this.props.flightPlanner, controller: this.hsiController, airspaceSearcher: this.props.airspaceSearcher, tas: this.props.tas })));
    }
}
