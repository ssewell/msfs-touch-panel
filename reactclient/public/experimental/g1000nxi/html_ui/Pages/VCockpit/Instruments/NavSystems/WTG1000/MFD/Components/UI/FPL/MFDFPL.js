import { FSComponent, Subject } from 'msfssdk';
import { FacilityLoader, FacilityRespository } from 'msfssdk/navigation';
import { UiControlGroup } from '../../../../Shared/UI/UiControlGroup';
import { MFDFPLDetails } from './MFDFPLDetails';
import { GroupBox } from '../GroupBox';
import { MFDFPLVNavProfile } from './MFDFPLVNavProfile';
import { MFDFPLWeather } from './MFDFPLWeather';
import './MFDFPL.css';
/**
 * The FPL popup container encapsulates the actual popup logic.
 */
export class MFDFPL extends UiControlGroup {
    constructor() {
        super(...arguments);
        this.fplDetailsRef = FSComponent.createRef();
        this.selectionSub = Subject.create(null);
    }
    /** @inheritdoc */
    onInteractionEvent(evt) {
        return this.fplDetailsRef.instance.onInteractionEvent(evt);
    }
    /** Called when the view is resumed. */
    onViewResumed() {
        if (this.fplDetailsRef.instance !== undefined) {
            this.fplDetailsRef.instance.fplViewResumed();
        }
    }
    /** Called when the view is opened. */
    onViewOpened() {
        if (this.fplDetailsRef.instance !== undefined) {
            this.fplDetailsRef.instance.fplViewOpened();
        }
    }
    /**
     * A method called when the control group scroll is toggled.
     * @param enabled if the scroll is enabled.
     */
    onScrollToggled(enabled) {
        this.fplDetailsRef.instance.onScrollToggled(enabled);
        if (!enabled) {
            this.selectionSub.set(null);
        }
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: 'mfd-dark-background wide' },
            FSComponent.buildComponent(MFDFPLDetails, { onRegister: this.register, ref: this.fplDetailsRef, bus: this.props.bus, fms: this.props.fms, selection: this.selectionSub, focus: this.props.focus }),
            FSComponent.buildComponent(GroupBox, { onRegister: this.register, title: "Active VNV Profile" },
                FSComponent.buildComponent(MFDFPLVNavProfile, { bus: this.props.bus, flightPlanner: this.props.fms.flightPlanner })),
            FSComponent.buildComponent(GroupBox, { title: "Selected Waypoint Weather" },
                FSComponent.buildComponent(MFDFPLWeather, { facLoader: new FacilityLoader(FacilityRespository.getRepository(this.props.bus)), fms: this.props.fms, selection: this.selectionSub })),
            FSComponent.buildComponent("div", { class: "mfd-fpl-bottom-prompt" }, "Press the \"FPL\" key to view the previous page")));
    }
}
