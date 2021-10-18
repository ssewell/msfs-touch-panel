import { ComputedSubject, FSComponent } from 'msfssdk';
import { ICAO } from 'msfssdk/navigation';
import { Regions } from '../../Navigation/Regions';
import { AirportWaypoint, FacilityWaypoint } from '../../Navigation/Waypoint';
import { WaypointComponent } from './WaypointComponent';
/**
 * A text display for waypoint region.
 */
export class WaypointRegion extends WaypointComponent {
    constructor() {
        super(...arguments);
        this.textSub = ComputedSubject.create(null, (waypoint) => {
            if (waypoint instanceof FacilityWaypoint) {
                if (waypoint instanceof AirportWaypoint) {
                    // airports don't have region codes in their ICAO strings, we will try to grab the code from the first 2
                    // letters of the ident. However, some airports (e.g. in the US and those w/o 4-letter idents) don't use the
                    // region code for the ident, so we need a third fallback, which is to just display the city name instead.
                    const airport = waypoint.facility;
                    const ident = ICAO.getIdent(airport.icao).trim();
                    let text = ident.length === 4 ? Regions.getName(ident.substr(0, 2)) : '';
                    if (text === '' && airport.city !== '') {
                        text = airport.city.split(', ').map(name => Utils.Translate(name)).join(', ');
                    }
                    if (text) {
                        return text;
                    }
                }
                else {
                    return Regions.getName(waypoint.facility.icao.substr(1, 2));
                }
            }
            return '__________';
        });
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onWaypointChanged(waypoint) {
        this.textSub.set(waypoint);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        var _a;
        return (FSComponent.buildComponent("div", { class: (_a = this.props.class) !== null && _a !== void 0 ? _a : '' }, this.textSub));
    }
}
