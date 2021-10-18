import { Subject } from 'msfssdk';
import { UiView } from './UiView';
/** A UiPage component. */
export class UiPage extends UiView {
    /** @inheritdoc */
    constructor(props) {
        props.title = '';
        props.showTitle = false;
        super(props);
        this._title = Subject.create('');
        this.isPaused = false;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** The title of this page. */
    get title() {
        return this._title;
    }
    /**
     * Opens the page.
     */
    open() {
        super.open(false);
    }
    /**
     * This method has no effect.
     */
    setZIndex() {
        // noop
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    processScrollEvent(evt) {
        // Do not handle scroll inputs while paused.
        if (this.isPaused) {
            return false;
        }
        return super.processScrollEvent(evt);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewResumed() {
        this.isPaused = false;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewPaused() {
        this.isPaused = true;
        // commenting this out for now because it seems to break some stuff with components expecting lists to keep track
        // of selections even when the list is not in the active view.
        //this.blur();
    }
}
