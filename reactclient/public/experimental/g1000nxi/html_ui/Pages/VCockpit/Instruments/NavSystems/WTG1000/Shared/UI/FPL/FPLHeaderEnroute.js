import { FPLStringHeader } from './FPLStringHeader';
/**
 * An FPL section header for enroute segments.
 */
export class FPLHeaderEnroute extends FPLStringHeader {
    /** @inheritdoc */
    setCollapsed(setCollapsed) {
        this._isCollapsed = setCollapsed;
        this.updateName();
    }
    /** @inheritdoc */
    updateName() {
        var _a;
        const segment = this.props.fms.getFlightPlan().getSegment((_a = this.props.segmentIndex) === null || _a === void 0 ? void 0 : _a.get());
        this.setIsVisible(segment.airway !== undefined || this.props.fms.isFirstEnrouteSegment(segment.segmentIndex));
        let name = '';
        if (segment !== undefined) {
            if (segment.airway !== undefined) {
                name = 'Airway - ' + segment.airway;
            }
            else {
                name = 'Enroute';
            }
            if (this.isCollapsed) {
                name += ' (collapsed)';
            }
        }
        this.textSub.set(name);
    }
}
