import { FmsHEvent } from '../../../Shared/UI/FmsHEvent';
import { UiPage } from '../../../Shared/UI/UiPage';
import './MFDUiPage.css';
/**
 *
 */
export class MFDUiPage extends UiPage {
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAfterRender() {
        this.scrollController.gotoFirst();
        this.setScrollEnabled(false);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onInteractionEvent(evt) {
        // TODO: Move the close operations out of here into their respective views.
        switch (evt) {
            case FmsHEvent.FPL:
                return this.onFPLPressed();
            case FmsHEvent.PROC:
                return this.onPROCPressed();
            case FmsHEvent.DIRECTTO:
                return this.onDirectToPressed();
            case FmsHEvent.MENU:
                return this.onMenuPressed();
        }
        return false;
    }
    /**
     * This method is called when a MENU button event occurs.
     * @returns whether the event was handled.
     */
    onMenuPressed() {
        return false;
    }
    /**
     * This method is called when a PROC button event occurs.
     * @returns whether the event was handled.
     */
    onDirectToPressed() {
        this.props.viewService.open('DirectTo');
        return true;
    }
    /**
     * This method is called when a FPL button event occurs.
     * @returns whether the event was handled.
     */
    onFPLPressed() {
        this.props.viewService.open('FPLPage');
        return true;
    }
    /**
     * This method is called when a PROC button event occurs.
     * @returns whether the event was handled.
     */
    onPROCPressed() {
        this.props.viewService.open('PROC');
        return true;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onViewClosed() {
        this.setScrollEnabled(false);
    }
}
