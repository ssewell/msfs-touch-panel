import { FSComponent, NavMath, Subject } from 'msfssdk';
import { HoldController } from '../Hold/HoldController';
import { HoldStore } from '../Hold/HoldStore';
import { FmsHEvent } from '../FmsHEvent';
import { UiView } from '../UiView';
/**
 * A class that displays a hold dialog.
 */
export class Hold extends UiView {
    /**
     * Creates an instance of PFDHold.
     * @param props The props for this instance.
     */
    constructor(props) {
        super(props);
        this.distanceInput = FSComponent.createRef();
        this.store = new HoldStore();
        this.controller = new HoldController(this.store, props.fms);
        this.controller.reset();
    }
    /** @inheritdoc */
    onAfterRender() {
        this.store.isTime.sub(v => this.distanceInput.instance.setMode(v === 0 ? true : false));
    }
    /** @inheritdoc */
    onInteractionEvent(evt) {
        switch (evt) {
            case FmsHEvent.CLR:
                this.close();
                return true;
        }
        return super.onInteractionEvent(evt);
    }
    /** @inheritdoc */
    onInputDataSet(input) {
        var _a, _b;
        if (input !== undefined) {
            const def = this.props.fms.getFlightPlan().getSegment(input.segmentIndex).legs[input.legIndex];
            this.store.course.set((_b = (_a = def.calculated) === null || _a === void 0 ? void 0 : _a.initialDtk) !== null && _b !== void 0 ? _b : 0);
            this.store.indexes.set(input);
        }
        else {
            this.controller.reset();
        }
    }
    /**
     * Creates a subscribable which provides a direction string based on the set hold inbound course.
     * @returns A subscribable which provides a direction string based on the set hold inbound course.
     */
    createDirectionStringSubscribable() {
        const courseString = Subject.create('');
        const courseStringHandler = () => {
            const course = this.store.course.get();
            courseString.set(this.controller.getDirectionString(this.store.isInbound.get() === 0 ? course : NavMath.normalizeHeading(course + 180)));
        };
        this.store.course.sub(courseStringHandler);
        this.store.isInbound.sub(courseStringHandler, true);
        return courseString;
    }
}
