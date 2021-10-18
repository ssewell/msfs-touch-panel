import { NavMath } from 'msfssdk';
import { WaypointIconImageCache } from '../WaypointIconImageCache';
/**
 * A blank waypoint icon.
 */
export class MapBlankWaypointIcon {
    /**
     * Constructor.
     * @param waypoint The waypoint associated with this icon.
     * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
     * with lower priorities.
     */
    constructor(waypoint, priority) {
        this.waypoint = waypoint;
        this.priority = priority;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc, @typescript-eslint/no-unused-vars
    draw(context, mapProjection) {
        // noop
    }
}
/**
 * An abstract implementation of MapWaypointIcon which supports an arbitrary anchor point and offset.
 */
export class AbstractMapWaypointIcon {
    /**
     * Constructor.
     * @param waypoint The waypoint associated with this icon.
     * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
     * with lower priorities.
     * @param width The width at which this icon should be rendered, in pixels.
     * @param height The height at which this icon should be rendered, in pixels.
     * @param options Options with which to initialize this icon.
     */
    constructor(waypoint, priority, width, height, options) {
        this.waypoint = waypoint;
        this.priority = priority;
        this.width = width;
        this.height = height;
        /**
         * The anchor point of this icon, expressed relative to its width and height. [0, 0] is the top-left corner, and
         * [1, 1] is the bottom-right corner.
         */
        this.anchor = new Float64Array([0.5, 0.5]);
        /** The offset of this icon from the projected position of its associated waypoint, in pixels. */
        this.offset = new Float64Array(2);
        (options === null || options === void 0 ? void 0 : options.anchor) && this.anchor.set(options.anchor);
        (options === null || options === void 0 ? void 0 : options.offset) && this.offset.set(options.offset);
        this.totalOffsetX = this.offset[0] - this.anchor[0] * this.width;
        this.totalOffsetY = this.offset[1] - this.anchor[1] * this.height;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    draw(context, mapProjection) {
        const projected = mapProjection.project(this.waypoint.location, MapWaypointImageIcon.tempVec2);
        const left = projected[0] + this.totalOffsetX;
        const top = projected[1] + this.totalOffsetY;
        this.drawIconAt(context, mapProjection, left, top);
    }
}
AbstractMapWaypointIcon.tempVec2 = new Float64Array(2);
/**
 * A waypoint icon with an image as the icon's graphic source.
 */
export class MapWaypointImageIcon extends AbstractMapWaypointIcon {
    /**
     * Constructor.
     * @param waypoint The waypoint associated with this icon.
     * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
     * with lower priorities.
     * @param img This icon's image.
     * @param width The width at which this icon should be rendered, in pixels.
     * @param height The height at which this icon should be rendered, in pixels.
     * @param options Options with which to initialize this icon.
     */
    constructor(waypoint, priority, img, width, height, options) {
        super(waypoint, priority, width, height, options);
        this.img = img;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    drawIconAt(context, mapProjection, left, top) {
        context.drawImage(this.img, left, top, this.width, this.height);
    }
}
/**
 * A waypoint icon with a sprite as the icon's graphic source.
 */
export class MapWaypointSpriteIcon extends AbstractMapWaypointIcon {
    /**
     * Constructor.
     * @param waypoint The waypoint associated with this icon.
     * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
     * with lower priorities.
     * @param img This icon's sprite's image source.
     * @param frameWidth The frame width of the sprite, in pixels.
     * @param frameHeight The frame height of the sprite, in pixels.
     * @param width The width at which this icon should be rendered, in pixels.
     * @param height The height at which this icon should be rendered, in pixels.
     * @param options Options with which to initialize this icon.
     */
    constructor(waypoint, priority, img, frameWidth, frameHeight, width, height, options) {
        super(waypoint, priority, width, height, options);
        this.img = img;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    drawIconAt(context, mapProjection, left, top) {
        const spriteIndex = this.getSpriteFrame(mapProjection);
        const rowCount = Math.floor(this.img.naturalHeight / this.frameHeight);
        const colCount = Math.floor(this.img.naturalWidth / this.frameWidth);
        const row = Math.min(rowCount - 1, Math.floor(spriteIndex / colCount));
        const col = Math.min(colCount - 1, spriteIndex % colCount);
        const spriteLeft = col * this.frameWidth;
        const spriteTop = row * this.frameHeight;
        context.drawImage(this.img, spriteLeft, spriteTop, this.frameWidth, this.frameHeight, left, top, this.width, this.height);
    }
}
/**
 * An airport icon.
 */
export class MapAirportIcon extends MapWaypointSpriteIcon {
    /**
     * Constructor.
     * @param waypoint The waypoint associated with this icon.
     * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
     * with lower priorities.
     * @param width The width at which this icon should be rendered, in pixels.
     * @param height The height at which this icon should be rendered, in pixels.
     * @param options Options with which to initialize this icon.
     */
    constructor(waypoint, priority, width, height, options) {
        super(waypoint, priority, WaypointIconImageCache.getAirportIcon(waypoint.facility), 32, 32, width, height, options);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    getSpriteFrame(mapProjection) {
        if (!this.waypoint.longestRunway) {
            return 0;
        }
        const mapRotationDeg = mapProjection.getRotation() * Avionics.Utils.RAD2DEG;
        return Math.round(NavMath.normalizeHeading((this.waypoint.longestRunway.direction + mapRotationDeg)) / 22.5) % 8;
    }
}
/**
 * A VOR icon.
 */
export class MapVorIcon extends MapWaypointImageIcon {
    /**
     * Constructor.
     * @param waypoint The waypoint associated with this icon.
     * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
     * with lower priorities.
     * @param width The width at which this icon should be rendered, in pixels.
     * @param height The height at which this icon should be rendered, in pixels.
     * @param options Options with which to initialize this icon.
     */
    constructor(waypoint, priority, width, height, options) {
        super(waypoint, priority, WaypointIconImageCache.getVorIcon(waypoint.facility.type), width, height, options);
    }
}
/**
 * An intersection icon.
 */
export class MapNdbIcon extends MapWaypointImageIcon {
    /**
     * Constructor.
     * @param waypoint The waypoint associated with this icon.
     * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
     * with lower priorities.
     * @param width The width at which this icon should be rendered, in pixels.
     * @param height The height at which this icon should be rendered, in pixels.
     * @param options Options with which to initialize this icon.
     */
    constructor(waypoint, priority, width, height, options) {
        super(waypoint, priority, WaypointIconImageCache.get('NDB'), width, height, options);
    }
}
/**
 * An intersection icon.
 */
export class MapIntersectionIcon extends MapWaypointImageIcon {
    /**
     * Constructor.
     * @param waypoint The waypoint associated with this icon.
     * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
     * with lower priorities.
     * @param width The width at which this icon should be rendered, in pixels.
     * @param height The height at which this icon should be rendered, in pixels.
     * @param options Options with which to initialize this icon.
     */
    constructor(waypoint, priority, width, height, options) {
        super(waypoint, priority, WaypointIconImageCache.get('INTERSECTION_CYAN'), width, height, options);
    }
}
/**
 * A runway waypoint icon.
 */
export class MapRunwayWaypointIcon extends MapWaypointImageIcon {
    /**
     * Constructor.
     * @param waypoint The waypoint associated with this icon.
     * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
     * with lower priorities.
     * @param width The width at which this icon should be rendered, in pixels.
     * @param height The height at which this icon should be rendered, in pixels.
     * @param options Options with which to initialize this icon.
     */
    constructor(waypoint, priority, width, height, options) {
        super(waypoint, priority, WaypointIconImageCache.get('INTERSECTION_CYAN'), width, height, options);
    }
}
/**
 * A user waypoint icon.
 */
export class MapUserWaypointIcon extends MapWaypointImageIcon {
    /**
     * Constructor.
     * @param waypoint The waypoint associated with this icon.
     * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
     * with lower priorities.
     * @param width The width at which this icon should be rendered, in pixels.
     * @param height The height at which this icon should be rendered, in pixels.
     * @param options Options with which to initialize this icon.
     */
    constructor(waypoint, priority, width, height, options) {
        super(waypoint, priority, WaypointIconImageCache.get('USER'), width, height, options);
    }
}
/**
 * A flight path waypoint icon.
 */
export class MapFlightPathWaypointIcon extends MapWaypointImageIcon {
    /**
     * Constructor.
     * @param waypoint The waypoint associated with this icon.
     * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
     * with lower priorities.
     * @param width The width at which this icon should be rendered, in pixels.
     * @param height The height at which this icon should be rendered, in pixels.
     * @param options Options with which to initialize this icon.
     */
    constructor(waypoint, priority, width, height, options) {
        super(waypoint, priority, WaypointIconImageCache.get('FPLN_WAYPOINT'), width, height, options);
    }
}
/**
 * A VNAV waypoint icon.
 */
export class MapVNavWaypointIcon extends MapWaypointImageIcon {
    /**
     * Constructor.
     * @param waypoint The waypoint associated with this icon.
     * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
     * with lower priorities.
     * @param width The width at which this icon should be rendered, in pixels.
     * @param height The height at which this icon should be rendered, in pixels.
     * @param options Options with which to initialize this icon.
     */
    constructor(waypoint, priority, width, height, options) {
        super(waypoint, priority, WaypointIconImageCache.get('VNAV'), width, height, options);
    }
}
/**
 * An icon for a highlighted waypoint. This icon embellishes a pre-existing ("base") icon with a surrounding ring and
 * background.
 */
export class MapWaypointHighlightIcon extends AbstractMapWaypointIcon {
    /**
     * Constructor.
     * @param baseIcon This icon's base waypoint icon.
     * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
     * with lower priorities.
     * @param options Options with which to initialize this icon.
     */
    constructor(baseIcon, priority, options) {
        var _a, _b, _c, _d, _e, _f;
        super(baseIcon.waypoint, priority, baseIcon.width, baseIcon.height, { offset: baseIcon.offset, anchor: baseIcon.anchor });
        this.baseIcon = baseIcon;
        this.ringRadiusBuffer = (_a = options === null || options === void 0 ? void 0 : options.ringRadiusBuffer) !== null && _a !== void 0 ? _a : 0;
        this.strokeWidth = (_b = options === null || options === void 0 ? void 0 : options.strokeWidth) !== null && _b !== void 0 ? _b : 2;
        this.strokeColor = (_c = options === null || options === void 0 ? void 0 : options.strokeColor) !== null && _c !== void 0 ? _c : 'white';
        this.outlineWidth = (_d = options === null || options === void 0 ? void 0 : options.outlineWidth) !== null && _d !== void 0 ? _d : 0;
        this.outlineColor = (_e = options === null || options === void 0 ? void 0 : options.outlineColor) !== null && _e !== void 0 ? _e : 'black';
        this.bgColor = (_f = options === null || options === void 0 ? void 0 : options.bgColor) !== null && _f !== void 0 ? _f : '#3c3c3c';
        this.radius = Math.hypot(baseIcon.width, baseIcon.height) / 2 + this.ringRadiusBuffer;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    drawIconAt(context, mapProjection, left, top) {
        const x = left + this.baseIcon.width / 2;
        const y = top + this.baseIcon.height / 2;
        context.beginPath();
        context.arc(x, y, this.radius, 0, 2 * Math.PI);
        this.drawRingBackground(context);
        this.baseIcon.draw(context, mapProjection);
        this.drawRing(context);
    }
    /**
     * Draws the ring background for this icon.
     * @param context  A canvas rendering context.
     */
    drawRingBackground(context) {
        context.fillStyle = this.bgColor;
        context.fill();
    }
    /**
     * Draws the ring for this icon.
     * @param context  A canvas rendering context.
     */
    drawRing(context) {
        if (this.outlineWidth > 0) {
            this.applyStroke(context, (this.strokeWidth + 2 * this.outlineWidth), this.outlineColor);
        }
        this.applyStroke(context, this.strokeWidth, this.strokeColor);
    }
    /**
     * Applies a stroke to a canvas rendering context.
     * @param context A canvas rendering context.
     * @param lineWidth The width of the stroke.
     * @param strokeStyle The style of the stroke.
     */
    applyStroke(context, lineWidth, strokeStyle) {
        context.lineWidth = lineWidth;
        context.strokeStyle = strokeStyle;
        context.stroke();
    }
}
