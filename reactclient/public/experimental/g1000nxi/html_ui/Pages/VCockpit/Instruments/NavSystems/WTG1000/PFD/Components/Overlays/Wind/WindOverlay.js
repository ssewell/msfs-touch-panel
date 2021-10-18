import { FSComponent, DisplayComponent } from 'msfssdk';
import { WindOptionController, WindOptionStore, WindOverlayRenderOption } from '../../../../Shared/UI/Controllers/WindOptionController';
import { WindOption1 } from './WindOption1';
import { WindOption2 } from './WindOption2';
import { WindOption3 } from './WindOption3';
import './WindOverlay.css';
/** The PFD wind overlay. */
export class WindOverlay extends DisplayComponent {
    /**
     * Creates an instance of Wind Overlay.
     * @param props The props.
     */
    constructor(props) {
        super(props);
        this.option1Ref = FSComponent.createRef();
        this.option2Ref = FSComponent.createRef();
        this.option3Ref = FSComponent.createRef();
        this.windBoxRef = FSComponent.createRef();
        this.noDataRef = FSComponent.createRef();
        this.store = new WindOptionStore();
        this.controller = new WindOptionController(this.props.bus, this.store);
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        this.store.renderOption.sub((v) => {
            if (v === WindOverlayRenderOption.NOWIND) {
                this.noDataRef.instance.classList.remove('disabled');
            }
            else {
                this.noDataRef.instance.classList.add('disabled');
            }
            if (v === WindOverlayRenderOption.NONE) {
                this.windBoxRef.instance.classList.add('disabled');
            }
            else {
                this.windBoxRef.instance.classList.remove('disabled');
            }
        }, true);
    }
    /**
     * Renders the component.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { ref: this.windBoxRef, class: "wind-overlay disabled" },
            FSComponent.buildComponent("div", { ref: this.noDataRef }, "NO WIND DATA"),
            FSComponent.buildComponent(WindOption1, { ref: this.option1Ref, windData: this.store.currentWind, aircraftHeading: this.store.currentHeading, renderOption: this.store.renderOption }),
            FSComponent.buildComponent(WindOption2, { ref: this.option2Ref, windData: this.store.currentWind, aircraftHeading: this.store.currentHeading, renderOption: this.store.renderOption }),
            FSComponent.buildComponent(WindOption3, { ref: this.option3Ref, windData: this.store.currentWind, aircraftHeading: this.store.currentHeading, renderOption: this.store.renderOption })));
    }
}
