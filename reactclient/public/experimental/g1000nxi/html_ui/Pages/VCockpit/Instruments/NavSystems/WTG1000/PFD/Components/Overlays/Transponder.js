import { FSComponent, DisplayComponent, ComputedSubject } from 'msfssdk';
import { XPDRMode } from 'msfssdk/instruments';
import './Transponder.css';
/**
 * The PFD attitude indicator.
 */
export class Transponder extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.xpdrCodeElement = FSComponent.createRef();
        this.xpdrModeElement = FSComponent.createRef();
        this.xpdrIdentElement = FSComponent.createRef();
        this.codeEdit = {
            editMode: false,
            charIndex: 0,
            tempCode: ''
        };
        this.xpdrCodeSubject = ComputedSubject.create(0, (v) => {
            return `${Math.round(v)}`.padStart(4, '0');
        });
        this.xpdrModeSubject = ComputedSubject.create(XPDRMode.OFF, (v) => {
            switch (v) {
                case XPDRMode.OFF:
                    return 'OFF';
                case XPDRMode.STBY:
                    return 'STBY';
                case XPDRMode.ON:
                    return 'ON';
                case XPDRMode.ALT:
                    return 'ALT';
                case XPDRMode.GROUND:
                    return 'GND';
            }
            return 'XXX';
        });
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        const xpdr = this.props.bus.getSubscriber();
        xpdr.on('xpdrCode1')
            .whenChanged().handle(this.onXpdrCodeSimUpdate.bind(this));
        xpdr.on('xpdrMode1')
            .whenChanged().handle(this.onXpdrModeUpdate.bind(this));
        xpdr.on('xpdrIdent').whenChanged().handle((isSending) => {
            this.xpdrIdentElement.instance.classList.toggle('hide-element', !isSending);
            this.xpdrModeElement.instance.classList.toggle('hide-element', isSending);
        });
        const g1000ControlEvents = this.props.bus.getSubscriber();
        g1000ControlEvents.on('xpdr_code_push')
            .handle(this.updateCodeEdit.bind(this));
        g1000ControlEvents.on('xpdr_code_digit')
            .handle(this.editCode.bind(this));
    }
    /**
     * A method called when the soft menu sends a G1000 Control Event to edit the xpdr code.
     * @param edit is a bool of whether to edit the code or stop editing the code.
     */
    updateCodeEdit(edit) {
        if (edit && this.xpdrCodeElement.instance !== null) {
            this.codeEdit.editMode = true;
            this.codeEdit.tempCode = '   ';
            if (this.xpdrModeSubject.getRaw() === XPDRMode.STBY || this.xpdrModeSubject.getRaw() === XPDRMode.OFF) {
                this.xpdrCodeElement.instance.classList.add('highlight-white');
            }
            else {
                this.xpdrCodeElement.instance.classList.remove('green', 'white', 'grey');
                this.xpdrCodeElement.instance.classList.add('highlight-green');
            }
        }
        else if (!edit && this.xpdrCodeElement.instance !== null) {
            this.codeEdit.editMode = false;
            this.codeEdit.tempCode = '';
            this.xpdrCodeElement.instance.classList.remove('highlight-green');
            this.xpdrCodeElement.instance.classList.remove('highlight-white');
            this.onXpdrModeUpdate(this.xpdrModeSubject.getRaw());
        }
    }
    /**
     * A method called when the soft menu sends a digit from the xpdr code menu via the g1000 event bus.
     * @param value is the digit sent (0-7; -1 is a backspace).
     */
    editCode(value) {
        let updatedTempCode = this.codeEdit.tempCode;
        if (value == -1 && this.codeEdit.charIndex > 0) {
            updatedTempCode = updatedTempCode.substring(0, this.codeEdit.charIndex);
            this.codeEdit.charIndex--;
        }
        else if (value >= 0) {
            updatedTempCode = updatedTempCode + `${value}`;
            this.codeEdit.charIndex++;
        }
        if (this.codeEdit.charIndex == 4) {
            this.props.controlPublisher.publishEvent('publish_xpdr_code', parseInt(updatedTempCode));
            this.codeEdit.charIndex = 0;
            this.updateCodeEdit(false);
        }
        else {
            this.codeEdit.tempCode = updatedTempCode;
            this.onXpdrCodeUpdate(parseInt(this.codeEdit.tempCode));
        }
    }
    /**
     * A method called when the navcom publisher sends a new xpdr code.
     * @param code is the new xpdr code
     */
    onXpdrCodeSimUpdate(code) {
        this.onXpdrCodeUpdate(code);
    }
    /**
     * A method called to update the displayed xpdr code.
     * @param code is the new xpdr code
     */
    onXpdrCodeUpdate(code) {
        this.xpdrCodeSubject.set(code);
    }
    /**
     * A method called when the navcom publisher sends a new xpdr code.
     * @param mode is the new xpdr code
     */
    onXpdrModeUpdate(mode) {
        if (this.xpdrModeElement.instance !== null && this.xpdrCodeElement.instance !== null) {
            this.xpdrModeSubject.set(mode);
            this.xpdrModeElement.instance.classList.remove('green', 'white', 'grey');
            this.xpdrCodeElement.instance.classList.remove('green', 'white', 'grey');
            switch (mode) {
                case XPDRMode.OFF:
                    this.xpdrModeElement.instance.classList.add('grey');
                    this.xpdrCodeElement.instance.classList.add('grey');
                    break;
                case XPDRMode.STBY:
                    this.xpdrModeElement.instance.classList.add('white');
                    this.xpdrCodeElement.instance.classList.add('white');
                    break;
                case XPDRMode.ON:
                case XPDRMode.ALT:
                case XPDRMode.GROUND:
                    this.xpdrModeElement.instance.classList.add('green');
                    this.xpdrCodeElement.instance.classList.add('green');
                    break;
            }
        }
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "xpdr-container" },
            FSComponent.buildComponent("div", { class: 'small-text' }, "XPDR "),
            FSComponent.buildComponent("div", { ref: this.xpdrCodeElement, class: 'size20' }, this.xpdrCodeSubject),
            FSComponent.buildComponent("div", { ref: this.xpdrModeElement, class: 'size20' },
                "\u00A0",
                this.xpdrModeSubject),
            FSComponent.buildComponent("div", { ref: this.xpdrIdentElement, class: 'size20 green hide-element' }, " Ident")));
    }
}
