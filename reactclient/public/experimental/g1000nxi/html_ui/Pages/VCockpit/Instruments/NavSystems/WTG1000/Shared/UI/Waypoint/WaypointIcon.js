import { ComputedSubject, FSComponent, NavMath } from 'msfssdk';
import { AirportPrivateType, FacilityType, ICAO, VorType } from 'msfssdk/navigation';
import { AirportWaypoint, FacilityWaypoint } from '../../Navigation/Waypoint';
import { WaypointComponent } from './WaypointComponent';
/**
 * A waypoint icon.
 */
export class WaypointIcon extends WaypointComponent {
    constructor() {
        super(...arguments);
        this.imgRef = FSComponent.createRef();
        this.planeHeadingChangedHandler = this.onPlaneHeadingChanged.bind(this);
        this.srcSub = ComputedSubject.create(null, (waypoint) => {
            if (!waypoint) {
                return '';
            }
            if (waypoint instanceof FacilityWaypoint) {
                return this.getFacilityIconSrc(waypoint);
            }
            return '';
        });
        this.needUpdateAirportSpriteSub = ComputedSubject.create(null, (waypoint) => {
            if (!waypoint) {
                return false;
            }
            return !!this.props.planeHeading && waypoint instanceof AirportWaypoint;
        });
        this.imgFrameRowCount = 1;
        this.imgFrameColCount = 1;
        this.imgOffset = '0px 0px';
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onAfterRender() {
        this.initImageLoadListener();
        super.onAfterRender();
        this.initPlaneHeadingListener();
    }
    /**
     * Initializes the image onload listener.
     */
    initImageLoadListener() {
        this.imgRef.instance.onload = this.onImageLoaded.bind(this);
    }
    /**
     * Initializes the plane heading listener.
     */
    initPlaneHeadingListener() {
        if (this.props.planeHeading) {
            this.props.planeHeading.sub(this.planeHeadingChangedHandler, true);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    onWaypointChanged(waypoint) {
        this.srcSub.set(waypoint);
        this.needUpdateAirportSpriteSub.set(waypoint);
    }
    /**
     * A callback which is called when this component's image element finishes loading an image.
     */
    onImageLoaded() {
        const img = this.imgRef.instance;
        this.imgFrameRowCount = Math.floor(img.naturalHeight / 32);
        this.imgFrameColCount = Math.floor(img.naturalWidth / 32);
    }
    /**
     * A callback which is called when plane heading changes.
     * @param planeHeading The true heading of the airplane, in degrees.
     */
    onPlaneHeadingChanged(planeHeading) {
        if (this.needUpdateAirportSpriteSub.get()) {
            this.updateAirportSprite(planeHeading);
        }
    }
    /**
     * Updates this icon's airport sprite.
     * @param planeHeading The true heading of the airplane, in degrees.
     */
    updateAirportSprite(planeHeading) {
        const waypoint = this.props.waypoint.get();
        if (!(waypoint instanceof AirportWaypoint) || !waypoint.longestRunway) {
            return;
        }
        const headingDelta = waypoint.longestRunway.direction - planeHeading;
        const frame = Math.round(NavMath.normalizeHeading(headingDelta) / 22.5) % 8;
        const row = Math.min(Math.floor(frame / 4), this.imgFrameRowCount - 1);
        const col = Math.min(frame % 4, this.imgFrameColCount - 1);
        const xOffset = col * -32;
        const yOffset = row * -32;
        this.setImgOffset(`${xOffset}px ${yOffset}px`);
    }
    /**
     * Sets the object offset of this icon's image element.
     * @param offset The new offset.
     */
    setImgOffset(offset) {
        if (offset === this.imgOffset) {
            return;
        }
        this.imgOffset = offset;
        this.imgRef.instance.style.objectPosition = offset;
    }
    /**
     * Gets the appropriate icon src for a facility waypoint.
     * @param waypoint A facility waypoint.
     * @returns the appropriate icon src for the facility waypoint.
     */
    getFacilityIconSrc(waypoint) {
        switch (ICAO.getFacilityType(waypoint.facility.icao)) {
            case FacilityType.Airport:
                return this.getAirportIconSrc(waypoint);
            case FacilityType.VOR:
                return this.getVorIconSrc(waypoint);
            case FacilityType.NDB:
                return this.getNdbIconSrc();
            case FacilityType.Intersection:
                return this.getIntersectionIconSrc();
            case FacilityType.USR:
                return this.getUserIconSrc();
            case FacilityType.RWY:
                return this.getRunwayIconSrc();
            default:
                return '';
        }
    }
    /**
     * Gets the appropriate icon src for an airport waypoint.
     * @param waypoint An airport waypoint.
     * @returns the appropriate icon src for the airport waypoint.
     */
    getAirportIconSrc(waypoint) {
        const airport = waypoint.facility;
        const serviced = (airport.fuel1 !== '' || airport.fuel2 !== '') || airport.airportClass === 1;
        if (airport.airportPrivateType !== AirportPrivateType.Public) {
            return `${WaypointIcon.PATH}/airport_r.png`;
        }
        else if (serviced) {
            if (airport.towered) {
                return `${WaypointIcon.PATH}/airport_large_blue.png`;
            }
            else if (airport.airportClass === 1) {
                return `${WaypointIcon.PATH}/airport_large_magenta.png`;
            }
            else {
                return `${WaypointIcon.PATH}/airport_small_b.png`;
            }
        }
        else {
            if (airport.towered) {
                return `${WaypointIcon.PATH}/airport_med_blue.png`;
            }
            else if (airport.airportClass === 1) {
                return `${WaypointIcon.PATH}/airport_med_magenta.png`;
            }
            else {
                return `${WaypointIcon.PATH}/airport_small_a.png`;
            }
        }
    }
    /**
     * Gets the appropriate icon src for a VOR waypoint.
     * @param waypoint A VOR waypoint.
     * @returns the appropriate icon src for the VOR waypoint.
     */
    getVorIconSrc(waypoint) {
        switch (waypoint.facility.type) {
            case VorType.DME:
                return `${WaypointIcon.PATH}/dme.png`;
            case VorType.ILS:
            case VorType.VORDME:
                return `${WaypointIcon.PATH}/vor_dme.png`;
            case VorType.VORTAC:
            case VorType.TACAN:
                return `${WaypointIcon.PATH}/vortac.png`;
            default:
                return `${WaypointIcon.PATH}/vor.png`;
        }
    }
    /**
     * Gets the appropriate icon src for an NDB waypoint.
     * @returns the appropriate icon src for the NDB waypoint.
     */
    getNdbIconSrc() {
        return `${WaypointIcon.PATH}/ndb.png`;
    }
    /**
     * Gets the appropriate icon src for an intersection waypoint.
     * @returns the appropriate icon src for the intersection waypoint.
     */
    getIntersectionIconSrc() {
        return `${WaypointIcon.PATH}/intersection_cyan.png`;
    }
    /**
     * Gets the appropriate icon src for an intersection waypoint.
     * @returns the appropriate icon src for the intersection waypoint.
     */
    getUserIconSrc() {
        return `${WaypointIcon.PATH}/user.png`;
    }
    /**
     * Gets the appropriate icon src for a runway waypoint.
     * @returns the appropriate icon src for the runway waypoint.
     */
    getRunwayIconSrc() {
        return `${WaypointIcon.PATH}/intersection_cyan.png`;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        var _a;
        return (FSComponent.buildComponent("img", { ref: this.imgRef, class: (_a = this.props.class) !== null && _a !== void 0 ? _a : '', src: this.srcSub, style: `width: 32px; height: 32px; object-fit: none; object-position: ${this.imgOffset};` }));
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    destroy() {
        super.destroy();
        if (this.props.planeHeading) {
            this.props.planeHeading.unsub(this.planeHeadingChangedHandler);
        }
    }
}
WaypointIcon.PATH = 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/icons-map';
