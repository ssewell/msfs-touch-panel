import { FSComponent, ComputedSubject } from 'msfssdk';
import { Fms } from '../../FlightPlan/Fms';
import { UiControl } from '../UiControl';
/**
 * The PopoutMenuItem component.
 */
export class PopoutMenuItem extends UiControl {
    constructor() {
        super(...arguments);
        this.isEnabled = ComputedSubject.create(true, (v) => {
            return v ? 'popout-menu-item' : 'popout-menu-item text-disabled';
        });
        this.onIsEnabledChanged = (v, rv) => {
            this.setIsEnabled(rv);
        };
    }
    /**
     * A callback called after the component renders.
     */
    onAfterRender() {
        var _a;
        super.onAfterRender();
        this.isEnabled.sub(this.onIsEnabledChanged);
        this.isEnabled.set((_a = this.props.def.isEnabled) !== null && _a !== void 0 ? _a : true);
    }
    /** @inheritdoc */
    onEnter() {
        if (this.props.def.action) {
            this.props.def.action();
            if ((this.props.def.closeAfterAction === undefined || this.props.def.closeAfterAction) && Fms.viewService.getOpenViews().includes(this.props.parent)) {
                this.props.parent.close();
            }
            return true;
        }
        else if (this.props.onEnter) {
            return this.props.onEnter(this);
        }
        return false;
    }
    /** @inheritdoc */
    getHighlightElement() {
        var _a, _b;
        return (_b = (_a = this.containerRef.instance.firstElementChild) === null || _a === void 0 ? void 0 : _a.firstElementChild) !== null && _b !== void 0 ? _b : null;
    }
    /** @inheritdoc */
    renderControl() {
        return (FSComponent.buildComponent("div", { class: this.isEnabled }, this.props.def.renderContent()));
    }
}
