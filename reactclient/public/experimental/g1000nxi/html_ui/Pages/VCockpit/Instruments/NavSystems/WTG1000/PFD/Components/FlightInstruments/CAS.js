import { FSComponent, DisplayComponent } from 'msfssdk';
import { AnnunciationType } from 'msfssdk/components/Annunciatons';
import './CAS.css';
/** The two states an alert can be in. */
var AlertState;
(function (AlertState) {
    /** A newly arrived, unackowledged alert message. */
    AlertState[AlertState["New"] = 0] = "New";
    /** An alert message that has been acknowledged with the Alert softkey. */
    AlertState[AlertState["Acked"] = 1] = "Acked";
})(AlertState || (AlertState = {}));
/** A G1000 PFD CAS display. */
export class CAS extends DisplayComponent {
    constructor() {
        super(...arguments);
        /** The overall container for the CAS elements. */
        this.divRef = FSComponent.createRef();
        /** The div for new, unacked annunciations. */
        this.newRef = FSComponent.createRef();
        /** The div for acknowledged but still active annunciations. */
        this.ackRef = FSComponent.createRef();
        /** The well little div for the divider bar beween acked and unacked. */
        this.dividerRef = FSComponent.createRef();
        /** The number of unacked messages currently displayed. */
        this.numNewDisplayed = 0;
        /** The number of acked messages currently displayed. */
        this.numAckedDisplayed = 0;
    }
    /**
     * Determine whether we need to hide or unhide ourselves when a child's state changes.
     * @param state Whether the alert is acknowledged or not.
     * @param active Whether the child has going active.
     */
    setDisplayed(state, active) {
        switch (state) {
            case AlertState.New:
                if (active) {
                    // A new alert has been displayed.
                    this.numNewDisplayed++;
                    // If we are adding our first active alert, we need to display the full CAS block.
                    if (this.numNewDisplayed == 1) {
                        this.divRef.instance.style.display = 'block';
                    }
                    // If we have any acked messages displayed, we'll show the divider.
                    if (this.numAckedDisplayed > 0) {
                        this.dividerRef.instance.style.display = 'block';
                    }
                }
                else {
                    // A previously displayed alert has been hidden.
                    this.numNewDisplayed--;
                    // If nothing other new alerts are displayed we can hide divider block.
                    if (this.numNewDisplayed == 0) {
                        this.dividerRef.instance.style.display = 'none';
                        // We'll also go ahead and hide the whole CAS div if there's nothing else displayed.
                        if (this.numAckedDisplayed == 0) {
                            this.divRef.instance.style.display = 'none';
                        }
                    }
                }
                break;
            case AlertState.Acked:
                if (active) {
                    // A new acked alert has been displayed.
                    this.numAckedDisplayed++;
                    // If we're adding our first acked alert, we need to display the full CAS block.
                    if (this.numAckedDisplayed == 1) {
                        this.divRef.instance.style.display = 'block';
                    }
                    if (this.numNewDisplayed > 0) {
                        // If there are also unacked messages displayed, activate the divider.
                        this.dividerRef.instance.style.display = 'block';
                    }
                    else {
                        // Otherwise, make sure it's turned off.
                        this.dividerRef.instance.style.display = 'none';
                    }
                }
                else {
                    // A previously acked alert has been hidden.
                    this.numAckedDisplayed--;
                    // If that was the last one, hide the divider.
                    if (this.numAckedDisplayed == 0) {
                        this.dividerRef.instance.style.display = 'none';
                        // And if there are also no new ones, hide the full div.
                        if (this.numNewDisplayed == 0) {
                            this.divRef.instance.style.display = 'none';
                        }
                    }
                }
                break;
        }
    }
    /** Iterate through the configured annunciations and render each into the new and acked divs. */
    onAfterRender() {
        for (const ann of this.props.annunciations) {
            FSComponent.render(FSComponent.buildComponent(CASAnnunciation, { bus: this.props.bus, logicHandler: this.props.logicHandler, config: ann, stateCb: this.setDisplayed.bind(this, AlertState.New), stateShown: AlertState.New }), this.newRef.instance);
            FSComponent.render(FSComponent.buildComponent(CASAnnunciation, { bus: this.props.bus, logicHandler: this.props.logicHandler, config: ann, stateCb: this.setDisplayed.bind(this, AlertState.Acked), stateShown: AlertState.Acked }), this.ackRef.instance);
        }
    }
    /**
     * Render the CAS.
     * @returns A VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", { class: "annunciations", ref: this.divRef },
            FSComponent.buildComponent("div", { class: "annunciations-new", ref: this.newRef }),
            FSComponent.buildComponent("div", { class: "annunciations-divider", ref: this.dividerRef }),
            FSComponent.buildComponent("div", { class: "annunciations-acked", ref: this.ackRef })));
    }
}
/** An individual annunciation. */
class CASAnnunciation extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.divRef = FSComponent.createRef();
        /** Whether or not the actual alert condition is currently active. */
        this.active = false;
        /** Whether or not we are currently showing ourselves. */
        this.shown = false;
    }
    /** Show ourselves and let the CAS know, if we're not already shown. */
    showSelf() {
        if (!this.shown) {
            this.divRef.instance.style.display = 'block';
            this.props.stateCb(true);
            this.shown = true;
        }
    }
    /** Hide ourselves and let the CAS know, if we're currently shown. */
    hideSelf() {
        if (this.shown) {
            this.divRef.instance.style.display = 'none';
            this.props.stateCb(false);
            this.shown = false;
        }
    }
    /** Register our alert logic handlers and subscribe to the G1000 bus for alert push events. */
    onAfterRender() {
        const g1000ControlEvents = this.props.bus.getSubscriber();
        g1000ControlEvents.on('pfd_alert_push').handle((evt) => {
            if (evt) {
                // If we are the new alert, we need to hide ourselves so the acked version can show.
                if (this.props.stateShown == AlertState.New) {
                    this.hideSelf();
                }
                else {
                    // But if we're the acked div, we need to activate ourselves, assuming the alert is hot.
                    if (this.active) {
                        this.showSelf();
                    }
                }
            }
        });
        // The composite logic host passes a 1 in the callback if the alert has entered an active state,
        // or 0 if it has become inactive.
        this.props.logicHandler.addLogicAsNumber(this.props.config.condition, (v) => {
            if (v == 1) {
                this.active = true;
                // We're going active, which means we can't be acked yet.  In this case, we only need to
                // take action if we show the new alerts;  acked alert divs stay idle.
                if (this.props.stateShown == AlertState.New) {
                    this.showSelf();
                }
            }
            else {
                this.active = false;
                // We're toggling false.  Whether we're acked or unacked, we need to hide ourselves and
                // let the CAS know.
                this.hideSelf();
            }
        }, 0);
    }
    /**
     * Render an annunciation.
     * @returns A VNode.
     */
    render() {
        let type;
        switch (this.props.config.type) {
            case AnnunciationType.Advisory:
                type = 'advisory';
                break;
            case AnnunciationType.Caution:
                type = 'caution';
                break;
            case AnnunciationType.SafeOp:
                type = 'safeop';
                break;
            case AnnunciationType.Warning:
                type = 'warning';
                break;
        }
        return (FSComponent.buildComponent("div", { class: `annunciation ${type}`, style: "display: none;", ref: this.divRef }, this.props.config.text));
    }
}
