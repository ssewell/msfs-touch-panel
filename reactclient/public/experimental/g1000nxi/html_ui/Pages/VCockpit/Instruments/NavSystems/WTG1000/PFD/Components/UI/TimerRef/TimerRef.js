import { FSComponent, Subject, ArraySubject, ComputedSubject } from 'msfssdk';
import { Fms } from '../../../../Shared/FlightPlan/Fms';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { ArrowToggle } from '../../../../Shared/UI/UIControls/ArrowToggle';
import { NumberInput } from '../../../../Shared/UI/UIControls/NumberInput';
import { ActionButton } from '../../../../Shared/UI/UIControls/ActionButton';
import { UiView } from '../../../../Shared/UI/UiView';
import { VSpeedType } from '../../FlightInstruments/AirspeedIndicator';
import { TimerInput } from './TimerInput';
import { SelectControl } from '../../../../Shared/UI/UIControls/SelectControl';
import { ContextMenuDialog } from '../../../../Shared/UI/Dialogs/ContextMenuDialog';
import { Timer, TimerMode } from './Timer';
import './TimerRef.css';
import { PageMenuDialog } from '../../../../Shared/UI/Dialogs/PageMenuDialog';
/**
 * The PFD timer ref popout.
 */
export class TimerRef extends UiView {
    constructor() {
        super(...arguments);
        this.popoutRef = FSComponent.createRef();
        this.containerRef = FSComponent.createRef();
        this.glideRef = Subject.create(1);
        this.glideRefChanged = ComputedSubject.create(false, (v) => { return v ? ' *' : ''; });
        this.vrRef = Subject.create(1);
        this.vrRefChanged = ComputedSubject.create(false, (v) => { return v ? ' *' : ''; });
        this.vxRef = Subject.create(1);
        this.vxRefChanged = ComputedSubject.create(false, (v) => { return v ? ' *' : ''; });
        this.vyRef = Subject.create(1);
        this.vyRefChanged = ComputedSubject.create(false, (v) => { return v ? ' *' : ''; });
        this.minsRef = Subject.create(0);
        this.timerComponentRef = FSComponent.createRef();
        this.upDownItems = ArraySubject.create();
        this.buttonRef = FSComponent.createRef();
        this.upDownControlRef = FSComponent.createRef();
        this.timerButtonSubject = Subject.create('Start?');
        /**
         * Callback to handle when Timer changes the mode after reaching 0.
         * @param mode is the TimerMode
         */
        this.onTimerModeChanged = (mode) => {
            this.upDownControlRef.instance.SelectedValue.set(mode);
        };
        /**
         * Callback to handle when Timer value changes.
         * @param seconds is the new timer time value in seconds.
         */
        this.onTimerValueChanged = (seconds) => {
            if (!this.timerComponentRef.instance.getIsActivated()) {
                this.timerComponentRef.instance.setInput(seconds);
            }
        };
        this.timer = new Timer(this.props.bus, Fms.g1000EvtPub, this.onTimerModeChanged, this.onTimerValueChanged);
        this.vSpeeds = [
            { type: VSpeedType.Vx, value: Math.round(Simplane.getDesignSpeeds().Vx), modified: Subject.create(false), display: true },
            { type: VSpeedType.Vy, value: Math.round(Simplane.getDesignSpeeds().Vy), modified: Subject.create(false), display: true },
            { type: VSpeedType.Vr, value: Math.round(Simplane.getDesignSpeeds().Vr), modified: Subject.create(false), display: true },
            { type: VSpeedType.Vglide, value: Math.round(Simplane.getDesignSpeeds().BestGlide), modified: Subject.create(false), display: true },
            { type: VSpeedType.Vapp, value: Math.round(Simplane.getDesignSpeeds().Vapp), modified: Subject.create(false), display: false }
        ];
        this.vSpeedSubjects = {
            vx: Subject.create(this.vSpeeds[0].value),
            vy: Subject.create(this.vSpeeds[1].value),
            vr: Subject.create(this.vSpeeds[2].value),
            vg: Subject.create(this.vSpeeds[3].value),
            vapp: Subject.create(this.vSpeeds[4].value)
        };
        this.minimumsSubject = Subject.create(0);
        this.vSpeedToggleMap = new Map();
        this.vSpeedSubjectMap = new Map();
        this.vSpeedObjectMap = new Map();
        this.onOffToggleOptions = ['Off', 'On'];
        this.minsToggleOptions = ['Off', 'BARO', 'TEMP COMP'];
        /**
         * Callback to handle when Timer Button is Pressed.
         */
        this.onTimerButtonPressed = () => {
            if (this.timerComponentRef.instance.getTimerState()) {
                this.timerComponentRef.instance.stopTimer();
                this.timerButtonSubject.set('Reset?');
            }
            else if (this.timerComponentRef.instance.getTimerResetState()) {
                this.timerComponentRef.instance.resetTimer();
                this.timerButtonSubject.set('Start?');
            }
            else {
                this.timerComponentRef.instance.startTimer();
                this.timerButtonSubject.set('Stop?');
            }
        };
        // ---- TOGGLE Vg CALLBACK
        this.onGlideRefOptionSelected = (index) => {
            console.log('INDEX HERE -- ', index);
            this.glideRef.set(index);
            const vSpeed = this.vSpeedObjectMap.get(VSpeedType.Vglide);
            if (vSpeed !== undefined) {
                vSpeed.value = this.vSpeedSubjects.vg.get();
                vSpeed.display = index === 1;
                Fms.g1000EvtPub.publishEvent('vspeed_display', vSpeed);
            }
        };
        // ---- TOGGLE Vr CALLBACK
        this.onVrRefOptionSelected = (index) => {
            this.vrRef.set(index);
            const vSpeed = this.vSpeedObjectMap.get(VSpeedType.Vr);
            if (vSpeed !== undefined) {
                vSpeed.value = this.vSpeedSubjects.vr.get();
                vSpeed.display = index === 1;
                Fms.g1000EvtPub.publishEvent('vspeed_display', vSpeed);
            }
        };
        // ---- TOGGLE Vx CALLBACK
        this.onVxRefOptionSelected = (index) => {
            this.vxRef.set(index);
            const vSpeed = this.vSpeedObjectMap.get(VSpeedType.Vx);
            if (vSpeed !== undefined) {
                vSpeed.value = this.vSpeedSubjects.vx.get();
                vSpeed.display = index === 1;
                Fms.g1000EvtPub.publishEvent('vspeed_display', vSpeed);
            }
        };
        // ---- TOGGLE Vy CALLBACK
        this.onVyRefOptionSelected = (index) => {
            this.vyRef.set(index);
            const vSpeed = this.vSpeedObjectMap.get(VSpeedType.Vy);
            if (vSpeed !== undefined) {
                vSpeed.value = this.vSpeedSubjects.vy.get();
                vSpeed.display = index === 1;
                Fms.g1000EvtPub.publishEvent('vspeed_display', vSpeed);
            }
        };
        // ---- TOGGLE MINIMUMS CALLBACK
        this.onMinimumsRefOptionSelected = (index) => {
            this.minsRef.set(index);
            Fms.g1000EvtPub.publishEvent('show_minimums', index !== 0 ? true : false);
        };
        // ---- CHANGE MINIMUMS VALUE CALLBACK
        this.updateMinimumsValue = () => {
            Fms.g1000EvtPub.publishEvent('set_minimums', this.minimumsSubject.get());
        };
        // ---- UpDown Menu Item Select CALLBACK
        this.onUpDownMenuSelected = (index) => {
            if (index === 1) {
                this.timer.mode = TimerMode.DOWN;
            }
            else {
                this.timer.mode = TimerMode.UP;
            }
        };
        // ---- UpDown Menu Item List Build
        this.buildUpDownMenuItems = (item, index) => {
            return { id: index.toString(), renderContent: () => FSComponent.buildComponent("span", null, item), estimatedWidth: item.length * ContextMenuDialog.CHAR_WIDTH };
        };
        // ---- updateVy Callback method
        this.updateVy = (value) => {
            this.updateVSpeed(VSpeedType.Vy, value);
        };
        // ---- updateVy Callback method
        this.updateVx = (value) => {
            this.updateVSpeed(VSpeedType.Vx, value);
        };
        // ---- updateVy Callback method
        this.updateVr = (value) => {
            this.updateVSpeed(VSpeedType.Vr, value);
        };
        // ---- updateVy Callback method
        this.updateVglide = (value) => {
            this.updateVSpeed(VSpeedType.Vglide, value);
        };
    }
    /** @inheritdoc */
    onInteractionEvent(evt) {
        switch (evt) {
            case FmsHEvent.CLR:
                this.close();
                return true;
            case FmsHEvent.MENU:
                this.onMenu();
                return true;
        }
        return false;
    }
    /**
     * An event called when the menu button is pressed.
     * @returns True if the event was handled in this section.
     */
    onMenu() {
        console.log('called menu');
        const dialog = Fms.viewService.open(PageMenuDialog.name, true);
        dialog.setMenuItems([
            {
                id: 'enable-all',
                renderContent: () => FSComponent.buildComponent("span", null, "All References On"),
                isEnabled: true,
                action: () => {
                    this.enableAllRefSpeeds(true);
                }
            },
            {
                id: 'disable-all',
                renderContent: () => FSComponent.buildComponent("span", null, "All References Off"),
                isEnabled: true,
                action: () => {
                    this.enableAllRefSpeeds(false);
                }
            },
            {
                id: 'restore-defaults',
                renderContent: () => FSComponent.buildComponent("span", null, "Restore Defaults"),
                isEnabled: true,
                action: () => {
                    console.log('Restore defaults');
                    this.resetVSpeeds();
                }
            },
        ]);
        return true;
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        super.onAfterRender();
        this.upDownItems.set(['Up', 'Dn']);
        this.vSpeedToggleMap.set(3, this.vSpeeds[3]);
        this.vSpeedToggleMap.set(5, this.vSpeeds[2]);
        this.vSpeedToggleMap.set(7, this.vSpeeds[0]);
        this.vSpeedToggleMap.set(9, this.vSpeeds[1]);
        this.vSpeedSubjectMap.set(VSpeedType.Vglide, this.vSpeedSubjects.vg);
        this.vSpeedSubjectMap.set(VSpeedType.Vr, this.vSpeedSubjects.vr);
        this.vSpeedSubjectMap.set(VSpeedType.Vx, this.vSpeedSubjects.vx);
        this.vSpeedSubjectMap.set(VSpeedType.Vy, this.vSpeedSubjects.vy);
        this.vSpeedObjectMap.set(VSpeedType.Vglide, this.vSpeeds[3]);
        this.vSpeedObjectMap.set(VSpeedType.Vr, this.vSpeeds[2]);
        this.vSpeedObjectMap.set(VSpeedType.Vx, this.vSpeeds[0]);
        this.vSpeedObjectMap.set(VSpeedType.Vy, this.vSpeeds[1]);
        this.vSpeeds[0].modified.sub(v => this.vxRefChanged.set(v));
        this.vSpeeds[1].modified.sub(v => this.vyRefChanged.set(v));
        this.vSpeeds[2].modified.sub(v => this.vrRefChanged.set(v));
        this.vSpeeds[3].modified.sub(v => this.glideRefChanged.set(v));
        const g1000Events = this.props.bus.getSubscriber();
        g1000Events.on('set_minimums').handle((set) => {
            if (set !== this.minimumsSubject.get()) {
                this.minimumsSubject.set(set);
            }
        });
        g1000Events.on('show_minimums').handle((show) => {
            const option = show ? 1 : 0;
            if (option !== this.minsRef.get()) {
                this.minsRef.set(option);
            }
        });
    }
    /** Method to reset all v speeds to defaults */
    resetVSpeeds() {
        this.vSpeeds[0].value = Math.round(Simplane.getDesignSpeeds().Vx);
        this.vSpeedSubjects.vx.set(this.vSpeeds[0].value);
        this.vSpeeds[0].modified.set(false);
        Fms.g1000EvtPub.publishEvent('vspeed_set', this.vSpeeds[0]);
        this.vSpeeds[1].value = Math.round(Simplane.getDesignSpeeds().Vy);
        this.vSpeedSubjects.vy.set(this.vSpeeds[1].value);
        this.vSpeeds[1].modified.set(false);
        Fms.g1000EvtPub.publishEvent('vspeed_set', this.vSpeeds[1]);
        this.vSpeeds[2].value = Math.round(Simplane.getDesignSpeeds().Vr);
        this.vSpeedSubjects.vr.set(this.vSpeeds[2].value);
        this.vSpeeds[2].modified.set(false);
        Fms.g1000EvtPub.publishEvent('vspeed_set', this.vSpeeds[2]);
        this.vSpeeds[3].value = Math.round(Simplane.getDesignSpeeds().BestGlide);
        this.vSpeedSubjects.vg.set(this.vSpeeds[3].value);
        this.vSpeeds[3].modified.set(false);
        Fms.g1000EvtPub.publishEvent('vspeed_set', this.vSpeeds[3]);
        this.vSpeeds[4].value = Math.round(Simplane.getDesignSpeeds().Vapp);
        this.vSpeeds[4].modified.set(false);
    }
    /**
     * Method enable or disable all ref speeds.
     * @param enable Whether to enable or disable the ref speeds.
     */
    enableAllRefSpeeds(enable) {
        const value = enable ? 1 : 0;
        this.onVyRefOptionSelected(value);
        this.onVxRefOptionSelected(value);
        this.onVrRefOptionSelected(value);
        this.onGlideRefOptionSelected(value);
    }
    /**
     * Method to set vspeed asterisk visibility.
     * @param vspeed is the VSpeedType to be updated
     * @param value is the vspeed value
     */
    updateVSpeed(vspeed, value) {
        const object = this.vSpeedObjectMap.get(vspeed);
        if (object !== undefined) {
            object.value = value;
            object.modified.set(true);
            Fms.g1000EvtPub.publishEvent('vspeed_set', object);
        }
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: 'popout-dialog', ref: this.viewContainerRef },
            FSComponent.buildComponent("div", { ref: this.containerRef, class: "timerref-container" },
                FSComponent.buildComponent("div", { class: "timerref-timer-title" }, "Timer"),
                FSComponent.buildComponent(TimerInput, { ref: this.timerComponentRef, timer: this.timer, onRegister: this.register }),
                FSComponent.buildComponent(SelectControl, { ref: this.upDownControlRef, onRegister: this.register, class: "timerref-timer-updown", outerContainer: this.viewContainerRef, data: this.upDownItems, onItemSelected: this.onUpDownMenuSelected, buildMenuItem: this.buildUpDownMenuItems }),
                FSComponent.buildComponent(ActionButton, { class: "timerref-timer-button", onRegister: this.register, ref: this.buttonRef, text: this.timerButtonSubject, onExecute: this.onTimerButtonPressed }),
                FSComponent.buildComponent("hr", { class: "timerref-hr1" }),
                FSComponent.buildComponent("div", { class: "timerref-glide-title" }, "GLIDE"),
                FSComponent.buildComponent("div", { class: "timerref-glide-value" },
                    FSComponent.buildComponent(NumberInput, { onRegister: this.register, onValueChanged: this.updateVglide, dataSubject: this.vSpeedSubjects.vg, minValue: 0, maxValue: 999, increment: 1, wrap: false, class: 'timerref-ref-number' }),
                    FSComponent.buildComponent("span", { class: "size14" },
                        "KT",
                        FSComponent.buildComponent("span", { class: "timerref-asterisk" }, this.glideRefChanged))),
                FSComponent.buildComponent(ArrowToggle, { class: "timerref-glide-toggle", onRegister: this.register, onOptionSelected: this.onGlideRefOptionSelected, options: this.onOffToggleOptions, dataref: this.glideRef }),
                FSComponent.buildComponent("div", { class: "timerref-vr-title" }, "Vr"),
                FSComponent.buildComponent("div", { class: "timerref-vr-value" },
                    FSComponent.buildComponent(NumberInput, { onRegister: this.register, onValueChanged: this.updateVr, dataSubject: this.vSpeedSubjects.vr, minValue: 0, maxValue: 999, increment: 1, wrap: false, class: 'timerref-ref-number' }),
                    FSComponent.buildComponent("span", { class: "size14" },
                        "KT",
                        FSComponent.buildComponent("span", { class: "timerref-asterisk" }, this.vrRefChanged))),
                FSComponent.buildComponent(ArrowToggle, { class: "timerref-vr-toggle", onRegister: this.register, onOptionSelected: this.onVrRefOptionSelected, options: this.onOffToggleOptions, dataref: this.vrRef }),
                FSComponent.buildComponent("div", { class: "timerref-vx-title" }, "Vx"),
                FSComponent.buildComponent("div", { class: "timerref-vx-value" },
                    FSComponent.buildComponent(NumberInput, { onRegister: this.register, onValueChanged: this.updateVx, dataSubject: this.vSpeedSubjects.vx, minValue: 0, maxValue: 999, increment: 1, wrap: false, class: 'timerref-ref-number' }),
                    FSComponent.buildComponent("span", { class: "size14" },
                        "KT",
                        FSComponent.buildComponent("span", { class: "timerref-asterisk" }, this.vxRefChanged))),
                FSComponent.buildComponent(ArrowToggle, { class: "timerref-vx-toggle", onRegister: this.register, onOptionSelected: this.onVxRefOptionSelected, options: this.onOffToggleOptions, dataref: this.vxRef }),
                FSComponent.buildComponent("div", { class: "timerref-vy-title" }, "Vy"),
                FSComponent.buildComponent("div", { class: "timerref-vy-value" },
                    FSComponent.buildComponent(NumberInput, { onRegister: this.register, onValueChanged: this.updateVy, dataSubject: this.vSpeedSubjects.vy, minValue: 0, maxValue: 999, increment: 1, wrap: false, class: 'timerref-ref-number' }),
                    FSComponent.buildComponent("span", { class: "size14" },
                        "KT",
                        FSComponent.buildComponent("span", { class: "timerref-asterisk" }, this.vyRefChanged))),
                FSComponent.buildComponent(ArrowToggle, { class: "timerref-vy-toggle", onRegister: this.register, onOptionSelected: this.onVyRefOptionSelected, options: this.onOffToggleOptions, dataref: this.vyRef }),
                FSComponent.buildComponent("hr", { class: "timerref-hr2" }),
                FSComponent.buildComponent("div", { class: "timerref-mins-title" }, "MINS"),
                FSComponent.buildComponent(ArrowToggle, { class: "timerref-mins-toggle", onRegister: this.register, onOptionSelected: this.onMinimumsRefOptionSelected, options: this.minsToggleOptions, dataref: this.minsRef }),
                FSComponent.buildComponent("div", { class: "timerref-mins-value" },
                    FSComponent.buildComponent(NumberInput, { onRegister: this.register, onValueChanged: this.updateMinimumsValue, dataSubject: this.minimumsSubject, minValue: -1000, maxValue: 10000, increment: 10, wrap: false, defaultDisplayValue: '_ _ _ _ _', class: 'timerref-ref-number' }),
                    FSComponent.buildComponent("span", { class: "size12" }, "FT")),
                FSComponent.buildComponent("div", { class: "timerref-temp-comp-container" },
                    FSComponent.buildComponent("div", { class: "temp-comp-title" }, "Temp At"),
                    FSComponent.buildComponent("div", { class: "temp-comp-dest" }, "_ _ _ _ _ _"),
                    FSComponent.buildComponent("div", { class: "temp-comp-temp" },
                        "_ _ _\u00B0",
                        FSComponent.buildComponent("span", { class: "size12" }, "C")),
                    FSComponent.buildComponent("div", { class: "temp-comp-corrected-alt" },
                        "_ _ _ _ _ _",
                        FSComponent.buildComponent("span", { class: "size12" }, "FT")),
                    FSComponent.buildComponent("div", { class: "temp-comp-snowflake" },
                        FSComponent.buildComponent("svg", null,
                            FSComponent.buildComponent("path", { d: 'M 0 0 l 10 0 l 0 10 l -10 0 z', fill: "white" })))))));
    }
}
