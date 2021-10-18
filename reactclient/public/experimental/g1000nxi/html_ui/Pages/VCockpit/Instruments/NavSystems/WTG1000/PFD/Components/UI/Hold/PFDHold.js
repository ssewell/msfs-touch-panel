import { FSComponent } from 'msfssdk';
import { ActionButton } from '../../../../Shared/UI/UIControls/ActionButton';
import { ArrowToggle } from '../../../../Shared/UI/UIControls/ArrowToggle';
import { NumberInput } from '../../../../Shared/UI/UIControls/NumberInput';
import { TimeDistanceInput } from '../../../../Shared/UI/UIControls/TimeDistanceInput';
import { Hold } from '../../../../Shared/UI/Hold/Hold';
import './PFDHold.css';
/**
 * A class that displays the PFD hold dialog.
 */
export class PFDHold extends Hold {
    /**
     * Renders the PFD hold dialog.
     * @returns The rendered VNode.
     */
    render() {
        const icao = this.store.indexes.map(indexes => { var _a; return (_a = this.props.fms.getFlightPlan().getSegment(indexes.segmentIndex).legs[indexes.legIndex].name) !== null && _a !== void 0 ? _a : ''; });
        const directionString = this.createDirectionStringSubscribable();
        return (FSComponent.buildComponent("div", { class: 'popout-dialog pfd-hold', ref: this.viewContainerRef },
            FSComponent.buildComponent("h1", null, "Hold at"),
            FSComponent.buildComponent("div", { class: 'pfd-hold-grid' },
                FSComponent.buildComponent("div", { class: 'pfd-hold-row' },
                    FSComponent.buildComponent("div", null,
                        "Hold ",
                        FSComponent.buildComponent("span", null, directionString),
                        " of"),
                    FSComponent.buildComponent("div", null, icao)),
                FSComponent.buildComponent("div", { class: 'pfd-hold-row pfd-hold-linerow' },
                    FSComponent.buildComponent("div", null,
                        "Course ",
                        FSComponent.buildComponent(NumberInput, { class: 'pfd-hold-course', minValue: 1, maxValue: 360, wrap: true, dataSubject: this.store.course, increment: 1, onRegister: this.register, formatter: (v) => `${v.toFixed(0).padStart(3, '0')}°` })),
                    FSComponent.buildComponent("div", null,
                        FSComponent.buildComponent(ArrowToggle, { class: 'pfd-hold-inbound', options: ['Inbound', 'Outbound'], dataref: this.store.isInbound, onRegister: this.register }))),
                FSComponent.buildComponent("div", { class: 'pfd-hold-row pfd-hold-linerow' },
                    FSComponent.buildComponent("div", null,
                        "Leg ",
                        FSComponent.buildComponent(ArrowToggle, { class: 'pfd-hold-time', options: ['Time', 'Distance'], dataref: this.store.isTime, onRegister: this.register })),
                    FSComponent.buildComponent("div", null,
                        FSComponent.buildComponent(TimeDistanceInput, { ref: this.distanceInput, class: 'pfd-hold-distance', timeSubject: this.store.time, distanceSubject: this.store.distance, onRegister: this.register }))),
                FSComponent.buildComponent("div", { class: 'pfd-hold-row pfd-hold-linerow' },
                    FSComponent.buildComponent("div", null, "Turns"),
                    FSComponent.buildComponent("div", null,
                        FSComponent.buildComponent(ArrowToggle, { class: 'pfd-hold-direction', options: ['Left', 'Right'], dataref: this.store.turnDirection, onRegister: this.register })))),
            FSComponent.buildComponent(ActionButton, { class: 'pfd-hold-load', text: 'Load?', onExecute: () => { this.controller.accept(); this.close(); }, onRegister: this.register })));
    }
}
