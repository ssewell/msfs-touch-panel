import { FSComponent, CollectionComponent } from 'msfssdk';
/** test component */
export class TestFPL extends CollectionComponent {
    constructor() {
        super(...arguments);
        this.counter = 0;
    }
    /**
     * A callback after the component renders.
     */
    onAfterRender() {
        const sub = this.props.bus.getSubscriber();
        sub.on('hEvent').handle(this.addThingy.bind(this));
    }
    /**
     * Add a thingy.
     */
    addThingy() {
        let val = this.addItem(FSComponent.buildComponent("div", null,
            "I HAVE ADDED THINGY NUMBER ",
            this.counter.toFixed(0)));
        this.counter++;
        console.log(`added thingy number ${val}`);
        val = this.insertBefore(FSComponent.buildComponent("div", null,
            "THIS IS INSERTED BEFORE ",
            val,
            "."), val);
        this.insertAfter(FSComponent.buildComponent("div", null,
            "AND THEN THIS IS INSERTED AFTER ",
            val), val);
    }
}
