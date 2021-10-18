import { DisplayComponent, Subject, FSComponent } from 'msfssdk';
import { ICAO } from 'msfssdk/navigation';
import { OriginDestChangeType } from 'msfssdk/flightplan';
/**
 * Represent the origin segment of a flight plan listing.
 */
export class FPLOrigin extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.origin = Subject.create('_____');
        this.destination = Subject.create('_____');
        this.fplDirectTo = FSComponent.createRef();
        this.origDestRef = FSComponent.createRef();
    }
    /**
     * Handles a origin/dest change event.
     * @param e The change event itself.
     */
    onOriginDestChanged(e) {
        switch (e.type) {
            case OriginDestChangeType.OriginAdded:
                e.airport && this.origin.set(ICAO.getIdent(e.airport) + ' /');
                break;
            case OriginDestChangeType.OriginRemoved:
                this.origin.set('_____ /');
                break;
            case OriginDestChangeType.DestinationAdded:
                e.airport && this.destination.set(ICAO.getIdent(e.airport));
                break;
            case OriginDestChangeType.DestinationRemoved:
                this.destination.set('_____');
                break;
        }
    }
    /**
     * Handles when a random direct to is active and the FPL header should indicate such.
     * @param dtoIdent The ident for the direct to waypoint.
     */
    onDirectToRandomActive(dtoIdent) {
        this.origin.set('');
        this.destination.set(dtoIdent);
        this.fplDirectTo.instance.style.display = '';
        this.origDestRef.instance.style.color = 'white';
    }
    /**
     * Handles when a random direct to is canceled.
     * @param plan is the Flightplan
     */
    removeDirectToRandom(plan) {
        this.fplDirectTo.instance.style.display = 'none';
        this.origDestRef.instance.style.color = 'cyan';
        const origin = plan.originAirport;
        if (origin !== undefined) {
            this.setOrigin(ICAO.getIdent(origin));
        }
        else {
            this.setOrigin('_____');
        }
        const destination = plan.destinationAirport;
        if (destination !== undefined) {
            this.setDestination(ICAO.getIdent(destination));
        }
        else {
            this.setDestination('_____');
        }
    }
    /**
     * Handles setting the origin string.
     * @param origin The ident for the origin.
     */
    setOrigin(origin) {
        this.origin.set(origin + ' /');
    }
    /**
     * Handles setting the destination string.
     * @param destination The ident for the origin.
     */
    setDestination(destination) {
        this.destination.set(destination);
    }
    /**
     * Initializes the Direct To symbol to hidden
     */
    onAfterRender() {
        this.fplDirectTo.instance.style.display = 'none';
    }
    /**
     * Render an origin block.
     * @returns a VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { id: "origDest", ref: this.origDestRef },
            FSComponent.buildComponent("span", null, this.origin),
            FSComponent.buildComponent("span", null, this.destination),
            FSComponent.buildComponent("div", { class: "fpl-directTo", ref: this.fplDirectTo },
                FSComponent.buildComponent("svg", null,
                    FSComponent.buildComponent("path", { d: 'm 27 13 l -7.2 -7.2 l 0 5.04 l -19.04 0 l 0 4.32 l 19.04 0 l 0 5.04 l 7.2 -7.2 z', fill: "magenta", scale: "1" }),
                    FSComponent.buildComponent("text", { x: "4", y: "20", fill: "magenta", size: "12" }, "D")))));
    }
}
