import { FmsHEvent } from '../../../Shared/UI/FmsHEvent';
import { ViewService } from '../../../Shared/UI/ViewService';
/**
 * A service to manage views.
 */
export class MFDViewService extends ViewService {
    constructor() {
        super(...arguments);
        this.fmsEventMap = new Map([
            ['AS1000_MFD_FMS_Upper_INC', FmsHEvent.UPPER_INC],
            ['AS1000_MFD_FMS_Upper_DEC', FmsHEvent.UPPER_DEC],
            ['AS1000_MFD_FMS_Lower_INC', FmsHEvent.LOWER_INC],
            ['AS1000_MFD_FMS_Lower_DEC', FmsHEvent.LOWER_DEC],
            ['AS1000_MFD_MENU_Push', FmsHEvent.MENU],
            ['AS1000_MFD_CLR', FmsHEvent.CLR],
            ['AS1000_MFD_ENT_Push', FmsHEvent.ENT],
            ['AS1000_MFD_FMS_Upper_PUSH', FmsHEvent.UPPER_PUSH],
            ['AS1000_MFD_DIRECTTO', FmsHEvent.DIRECTTO],
            ['AS1000_MFD_FPL_Push', FmsHEvent.FPL],
            ['AS1000_MFD_PROC_Push', FmsHEvent.PROC],
            ['AS1000_MFD_RANGE_INC', FmsHEvent.RANGE_INC],
            ['AS1000_MFD_RANGE_DEC', FmsHEvent.RANGE_DEC],
            ['AS1000_MFD_JOYSTICK_PUSH', FmsHEvent.JOYSTICK_PUSH],
            ['AS1000_MFD_JOYSTICK_LEFT', FmsHEvent.JOYSTICK_LEFT],
            ['AS1000_MFD_JOYSTICK_UP', FmsHEvent.JOYSTICK_UP],
            ['AS1000_MFD_JOYSTICK_RIGHT', FmsHEvent.JOYSTICK_RIGHT],
            ['AS1000_MFD_JOYSTICK_DOWN', FmsHEvent.JOYSTICK_DOWN]
        ]);
    }
    /**
     * Routes the HEvents to the views.
     * @param hEvent The event identifier.
     */
    onInteractionEvent(hEvent) {
        console.log(hEvent);
        const evt = this.fmsEventMap.get(hEvent);
        if (evt !== undefined) {
            if (this.routeInteractionEventToViews(evt)) {
                return;
            }
        }
        switch (evt) {
            case FmsHEvent.UPPER_INC:
            case FmsHEvent.UPPER_DEC:
            case FmsHEvent.LOWER_INC:
            case FmsHEvent.LOWER_DEC:
                this.open('PageSelect', true);
                break;
        }
    }
}
