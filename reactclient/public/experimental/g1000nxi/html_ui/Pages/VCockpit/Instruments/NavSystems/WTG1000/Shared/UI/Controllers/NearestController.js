import { Fms } from '../../FlightPlan/Fms';
/** A nearest controleer */
export class NearestController {
    /**
     * Creates one.
     * @param store the store
     * @param publisher A ControlPublisher for freq set events.
     */
    constructor(store, publisher) {
        this.onDirectIdentHandler = this.onDirectIdent.bind(this);
        this.onEnterFreqHandler = this.onEnterFreq.bind(this);
        this.store = store;
        this.publisher = publisher;
    }
    /**
     * A callback which is called when a DRCT input is made on a nearest airport.
     * @param airport The airport.
     * @returns Whether the event was handled.
     */
    onDirectIdent(airport) {
        if (airport) {
            Fms.viewService.open('DirectTo').setInput({
                icao: airport.icao
            });
        }
        return true;
    }
    /**
     * A callback which is called when an ENTER input is made on a nearest airport frequency.
     * @param value The frequency.
     * @returns Whether the event was handled.
     */
    onEnterFreq(value) {
        this.publisher.publishEvent('standby_com_freq', value);
        return true;
    }
}
