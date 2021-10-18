import { FSComponent, DisplayComponent, ComputedSubject } from 'msfssdk';
import { MarkerBeaconState } from 'msfssdk/instruments';
import './MarkerBeacon.css';
/**
 * The PFD vertical deviation indicator.
 */
export class MarkerBeacon extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.mkrBcnBoxRef = FSComponent.createRef();
        this.textSub = ComputedSubject.create(MarkerBeaconState.Inactive, state => MarkerBeacon.TEXT[state]);
        /**
         * A method called when the marker beacon state has changed.
         * @param state is the marker beacon state.
         */
        this.onMarkerBeacon = (state) => {
            this.textSub.set(state);
            switch (state) {
                case MarkerBeaconState.Inactive:
                    this.mkrBcnBoxRef.instance.classList.remove('outer-animation', 'middle-animation', 'inner-animation');
                    break;
                case MarkerBeaconState.Outer:
                    this.mkrBcnBoxRef.instance.classList.remove('middle-animation', 'inner-animation');
                    this.mkrBcnBoxRef.instance.classList.add('outer-animation');
                    break;
                case MarkerBeaconState.Middle:
                    this.mkrBcnBoxRef.instance.classList.remove('outer-animation', 'inner-animation');
                    this.mkrBcnBoxRef.instance.classList.add('middle-animation');
                    break;
                case MarkerBeaconState.Inner:
                    this.mkrBcnBoxRef.instance.classList.remove('outer-animation', 'middle-animation');
                    this.mkrBcnBoxRef.instance.classList.add('inner-animation');
                    break;
            }
        };
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        const nav = this.props.bus.getSubscriber();
        nav.on('mkr_bcn_state').whenChanged().handle(this.onMarkerBeacon);
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "marker-beacon-box", ref: this.mkrBcnBoxRef }, this.textSub));
    }
}
MarkerBeacon.TEXT = {
    [MarkerBeaconState.Inactive]: '',
    [MarkerBeaconState.Outer]: 'O',
    [MarkerBeaconState.Middle]: 'M',
    [MarkerBeaconState.Inner]: 'I',
};
