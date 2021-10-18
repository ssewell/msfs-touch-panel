import { BasePublisher } from 'msfssdk/instruments';
/** A control publisher that handles G1000 events too. */
export class G1000ControlPublisher extends BasePublisher {
    /**
     * Create a ControlPublisher.
     * @param bus The EventBus to publish to.
     */
    constructor(bus) {
        super(bus);
    }
    /**
     * Publish a control event.
     * @param event The event from ControlEvents.
     * @param value The value of the event.
     */
    publishEvent(event, value) {
        this.publish(event, value, true);
    }
}
