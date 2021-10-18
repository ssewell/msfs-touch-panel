import { FSComponent, Subject } from 'msfssdk';
import { UiPage } from './UiPage';
/**
 * A service to manage views.
 */
export class ViewService {
    /**
     * Constructs the view service.
     * @param bus The event bus.
     */
    constructor(bus) {
        this.bus = bus;
        this.registeredViews = new Map();
        this.refsMap = new Map();
        this.openViews = [];
        this.openPageKeySub = Subject.create('');
        this.openPageSub = this.openPageKeySub.map(key => { var _a, _b; return (_b = (_a = this.refsMap.get(key)) === null || _a === void 0 ? void 0 : _a.instance) !== null && _b !== void 0 ? _b : null; });
        /** override in child class */
        this.fmsEventMap = new Map([]);
        const hEvtPub = this.bus.getSubscriber();
        hEvtPub.on('hEvent').handle(hEvent => {
            this.onInteractionEvent(hEvent);
        });
        this.viewClosedHandler = this.handleViewClosed.bind(this);
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** The key of the currently open page. */
    get openPageKey() {
        return this.openPageKeySub;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** The currently open page. */
    get openPage() {
        return this.openPageSub;
    }
    /**
     * Routes the HEvents to the views.
     * @param hEvent The event identifier.
     */
    onInteractionEvent(hEvent) {
        console.log(hEvent);
        const evt = this.fmsEventMap.get(hEvent);
        if (evt !== undefined) {
            this.routeInteractionEventToViews(evt);
        }
    }
    /**
     * Routes an interaction to the active view, and if it is not handled, re-routes the interaction to the currently
     * open page if it exists and is not the active view.
     * @param evt An interaction event.
     * @returns Whether the event was handled.
     */
    routeInteractionEventToViews(evt) {
        const activeView = this.getActiveView();
        if (activeView) {
            let handled = activeView.processHEvent(evt);
            if (!handled) {
                // If the event was not handled, then give the open page (if any) a chance to handle the event.
                const page = this.openPage.get();
                if (page && page !== activeView) {
                    handled = page.processHEvent(evt);
                }
            }
            if (handled) {
                return true;
            }
        }
        return false;
    }
    /**
     * Gets the active view.
     * @returns The topmost view that is considered active.
     */
    getActiveView() {
        return this.openViews[this.openViews.length - 1];
    }
    /**
     * Gets an array of all currently open views.
     * @returns an array of all currently open views.
     */
    getOpenViews() {
        return this.openViews;
    }
    /**
     * Registers a view with the service.
     * @param [type] The type of the view.
     * @param vnodeFn A function creating the VNode.
     */
    registerView(type, vnodeFn) {
        console.log('registering ' + type);
        this.registeredViews.set(type, vnodeFn);
    }
    /**
     * Opens a view. The opened view can be a page, regular view, or subview. Opening a page will close all other views,
     * including the currently open page. Opening a regular view will close all other views except the currently open
     * page. Opening a subview does not close any other views. The opened view will immediately become the active view,
     * and the previously active view (if one exists) will be paused.
     * @param type The type of the view to open.
     * @param isSubView A boolean indicating if the view to be opened is a subview.
     * @returns The view that was opened.
     * @throws Error if the view type is not registered with this service.
     */
    open(type, isSubView = false) {
        var _a;
        let viewRef = this.refsMap.get(type);
        if (viewRef === undefined) {
            // when we hve no ref, create the view
            viewRef = this.createView(type);
            this.refsMap.set(type, viewRef);
        }
        const view = viewRef.instance;
        const isPage = view instanceof UiPage;
        if (isPage) {
            this.clearStack(true);
        }
        else if (!isSubView) {
            this.clearStack(false);
        }
        (_a = this.getActiveView()) === null || _a === void 0 ? void 0 : _a.pause();
        view.open(isSubView, 900 + this.openViews.length);
        view.onClose.clear();
        view.onClose.on(this.viewClosedHandler);
        const index = this.openViews.indexOf(view);
        if (index >= 0) {
            this.openViews.splice(index, 1);
        }
        this.openViews.push(view);
        if (isPage) {
            this.openPageKeySub.set(type);
        }
        return view;
    }
    /**
     * Creates a view.
     * @param type The type string of the view to create.
     * @returns A NodeReference to the created view.
     * @throws When type of view is not registered.
     */
    createView(type) {
        const vnodeFn = this.registeredViews.get(type);
        if (vnodeFn === undefined) {
            console.error(`Could not find a registered view of type ${type.toString()}!`);
            throw new Error(`Could not find a registered view of type ${type.toString()}!`);
        }
        const node = vnodeFn();
        FSComponent.render(node, document.getElementById('InstrumentsContainer'));
        const viewRef = FSComponent.createRef();
        viewRef.instance = node.instance;
        return viewRef;
    }
    /**
     * Handles views that got closed, removing them from the stack.
     * @param closedView The view that was closed.
     */
    handleViewClosed(closedView) {
        var _a;
        const viewIndex = this.openViews.findIndex((v) => {
            return v === closedView;
        });
        closedView.onClose.off(this.viewClosedHandler);
        if (viewIndex > -1) {
            this.openViews.splice(viewIndex, 1);
            // need to reset z-indices.
            const len = this.openViews.length;
            for (let i = viewIndex; i < len; i++) {
                this.openViews[i].setZIndex(900 + i);
            }
            (_a = this.getActiveView()) === null || _a === void 0 ? void 0 : _a.resume();
        }
        if (closedView === this.openPageSub.get()) {
            this.openPageKeySub.set('');
        }
    }
    /**
     * Closes the currently active view.
     */
    closeActiveView() {
        this.getActiveView().close();
    }
    /**
     * Closes all open views except for the currently open page, if one exists.
     */
    closeAllViews() {
        this.clearStack(false);
    }
    /**
     * Closes all open views and clears the stack.
     * @param closePage Whether to close the currently open page, if one exists.
     */
    clearStack(closePage) {
        if (this.openViews.length === 0) {
            return;
        }
        const views = [...this.openViews];
        const len = views.length;
        for (let i = len - 1; i > 0; i--) {
            views[i].close(true);
        }
        this.openViews.length = 1;
        if (closePage || !(views[0] instanceof UiPage)) {
            views[0].close(true);
            this.openViews.length = 0;
        }
    }
}
