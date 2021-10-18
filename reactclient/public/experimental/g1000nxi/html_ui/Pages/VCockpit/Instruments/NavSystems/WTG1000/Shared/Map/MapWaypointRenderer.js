import { BitFlags } from 'msfssdk';
/**
 * Render roles for MapWaypointRenderer.
 */
export var MapWaypointRenderRole;
(function (MapWaypointRenderRole) {
    /** A highlighted waypoint. */
    MapWaypointRenderRole[MapWaypointRenderRole["Highlight"] = 1] = "Highlight";
    /** A waypoint which is the active waypoint in a flight plan. */
    MapWaypointRenderRole[MapWaypointRenderRole["FlightPlanActive"] = 2] = "FlightPlanActive";
    /** A waypoint in a flight plan which is not the active waypoint. */
    MapWaypointRenderRole[MapWaypointRenderRole["FlightPlanInactive"] = 4] = "FlightPlanInactive";
    /** A normally displayed waypoint. */
    MapWaypointRenderRole[MapWaypointRenderRole["Normal"] = 8] = "Normal";
    /** A waypoint in an airway. */
    MapWaypointRenderRole[MapWaypointRenderRole["Airway"] = 16] = "Airway";
    /** A VNAV waypoint. */
    MapWaypointRenderRole[MapWaypointRenderRole["VNav"] = 32] = "VNav";
})(MapWaypointRenderRole || (MapWaypointRenderRole = {}));
/**
 * A renderer that draws waypoints. Waypoints can be rendered in one of multiple roles: normal, as part of an airway,
 * as part of a flight plan, as the active waypoint in a flight plan, and as a highlighted waypoint. For the renderer
 * to draw a waypoint, the waypoint must first be registered with the renderer. Waypoints may be registered under
 * multiple render roles. However, a waypoint will only be rendered in one role at any point in time, chosen based on
 * the following order of precedence: highlighted > active flight plan > flight plan > normal > airway.
 */
export class MapWaypointRenderer {
    /**
     * Constructor.
     * @param textManager The text manager to use for waypoint labels.
     */
    constructor(textManager) {
        this.textManager = textManager;
        this.registered = new Map();
        this.toCleanUp = new Set();
        this.roleInfos = {
            [MapWaypointRenderRole.Highlight]: Object.assign({}, MapWaypointRenderer.DEFAULT_ROLE_INFO),
            [MapWaypointRenderRole.FlightPlanActive]: Object.assign({}, MapWaypointRenderer.DEFAULT_ROLE_INFO),
            [MapWaypointRenderRole.FlightPlanInactive]: Object.assign({}, MapWaypointRenderer.DEFAULT_ROLE_INFO),
            [MapWaypointRenderRole.Normal]: Object.assign({}, MapWaypointRenderer.DEFAULT_ROLE_INFO),
            [MapWaypointRenderRole.Airway]: Object.assign({}, MapWaypointRenderer.DEFAULT_ROLE_INFO),
            [MapWaypointRenderRole.VNav]: Object.assign({}, MapWaypointRenderer.DEFAULT_ROLE_INFO)
        };
        this.allRoles = Object.keys(this.roleInfos);
    }
    /**
     * Sets the factory to use to create waypoint icons for a render role.
     * @param role A render role.
     * @param factory A waypoint icon factory.
     */
    setIconFactory(role, factory) {
        this.roleInfos[role].iconFactory = factory;
    }
    /**
     * Sets the factory to use to create waypoint labels for a render role.
     * @param role A render role.
     * @param factory A waypoint label factory.
     */
    setLabelFactory(role, factory) {
        this.roleInfos[role].labelFactory = factory;
    }
    /**
     * Sets the canvas rendering context for a render role.
     * @param role A render role.
     * @param context - a canvas 2D rendering context.
     */
    setCanvasContext(role, context) {
        this.roleInfos[role].canvasContext = context;
    }
    /**
     * Sets the handler that determines if a waypoint should visible for a render role.
     * @param role A render role.
     * @param handler A function that determines if a waypoint should be visible.
     */
    setVisibilityHandler(role, handler) {
        this.roleInfos[role].visibilityHandler = handler;
    }
    /**
     * Checks if a waypoint is registered with this renderer. A role or roles can be optionally specified such that the
     * method will only return true if the waypoint is registered under those specific roles.
     * @param waypoint A waypoint.
     * @param role The specific role(s) to check.
     * @returns whether the waypoint is registered with this renderer.
     */
    isRegistered(waypoint, role) {
        if (!waypoint) {
            return false;
        }
        const entry = this.registered.get(waypoint.uid);
        if (!entry) {
            return false;
        }
        if (role === undefined) {
            return true;
        }
        return entry.isAllRoles(role);
    }
    /**
     * Registers a waypoint with this renderer under a specific role or roles. Registered waypoints will be drawn as
     * appropriate the next time this renderer's update() method is called. Registering a waypoint under a role under
     * which it is already registered has no effect unless the source of the registration is different.
     * @param waypoint The waypoint to register.
     * @param role The role(s) under which the waypoint should be registered.
     * @param sourceId A unique string ID for the source of the registration.
     */
    register(waypoint, role, sourceId) {
        if (role === 0 || sourceId === '') {
            return;
        }
        let entry = this.registered.get(waypoint.uid);
        if (!entry) {
            entry = new MapWaypointRenderer.MapWaypointRendererEntry(this, waypoint);
            this.registered.set(waypoint.uid, entry);
        }
        entry.addRole(role, sourceId);
    }
    /**
     * Removes a registration for a waypoint for a specific role or roles. Once all of a waypoint's registrations for a
     * role are removed, it will no longer be rendered in that role the next this renderer's update() method is called.
     * @param waypoint The waypoint to deregister.
     * @param role The role(s) from which the waypoint should be deregistered.
     * @param sourceId The unique string ID for the source of the registration to remove.
     */
    deregister(waypoint, role, sourceId) {
        if (role === 0 || sourceId === '') {
            return;
        }
        const entry = this.registered.get(waypoint.uid);
        if (!entry) {
            return;
        }
        entry.removeRole(role, sourceId);
        if (entry.roles === 0) {
            this.deleteEntry(entry);
        }
    }
    /**
     * Deletes and cleans up a registered waypoint entry.
     * @param entry The entry to delete.
     */
    deleteEntry(entry) {
        this.registered.delete(entry.waypoint.uid);
        this.toCleanUp.add(entry);
    }
    /**
     * Redraws waypoints registered with this renderer.
     * @param mapProjection The map projection to use.
     */
    update(mapProjection) {
        this.toCleanUp.forEach(entry => {
            entry.destroy();
        });
        this.toCleanUp.clear();
        const entriesToDrawIcon = [];
        this.registered.forEach(entry => {
            entry.update(mapProjection);
            if (entry.icon) {
                entriesToDrawIcon.push(entry);
            }
        });
        const projectedSize = mapProjection.getProjectedSize();
        const len = this.allRoles.length;
        for (let i = 0; i < len; i++) {
            const context = this.roleInfos[this.allRoles[i]].canvasContext;
            if (context) {
                context.clearRect(0, 0, projectedSize[0], projectedSize[1]);
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        entriesToDrawIcon.sort((a, b) => a.icon.priority - b.icon.priority);
        const len2 = entriesToDrawIcon.length;
        for (let i = 0; i < len2; i++) {
            const entry = entriesToDrawIcon[i];
            const icon = entry.icon;
            const context = this.roleInfos[entry.lastShownRole].canvasContext;
            if (context) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                icon.draw(context, mapProjection);
            }
        }
    }
}
MapWaypointRenderer.DEFAULT_ROLE_INFO = {
    iconFactory: null,
    labelFactory: null,
    canvasContext: null,
    visibilityHandler: () => true
};
/**
 * An entry for a waypoint registered with MapWaypointRenderer.
 */
MapWaypointRenderer.MapWaypointRendererEntry = class {
    /**
     * Constructor.
     * @param renderer The renderer to which this entry belongs.
     * @param waypoint The waypoint associated with this entry.
     */
    constructor(renderer, waypoint) {
        this.renderer = renderer;
        this.waypoint = waypoint;
        this.registrations = {
            [MapWaypointRenderRole.Highlight]: new Set(),
            [MapWaypointRenderRole.FlightPlanActive]: new Set(),
            [MapWaypointRenderRole.FlightPlanInactive]: new Set(),
            [MapWaypointRenderRole.Normal]: new Set(),
            [MapWaypointRenderRole.Airway]: new Set(),
            [MapWaypointRenderRole.VNav]: new Set(),
        };
        this._roles = 0;
        this._icon = null;
        this._label = null;
        this._lastShownRole = 0;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** The render role(s) assigned to this entry. */
    get roles() {
        return this._roles;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** The role under which this entry was last rendered, or 0 if this entry has not yet been rendered. */
    get lastShownRole() {
        return this._lastShownRole;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** This entry's waypoint icon. */
    get icon() {
        return this._icon;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /** This entry's waypoint label. */
    get label() {
        return this._label;
    }
    /**
     * Checks whether this entry is assigned any of the specified render roles. Optionally, this method can also check
     * if this entry was last rendered in any of the specified roles instead.
     * @param roles The render roles against which to check.
     * @param useLastShown Whether to check the role in which this entry was last rendered instead of the current roles
     * assigned to this entry. False by default.
     * @returns whether the check passed.
     */
    isAnyRole(roles, useLastShown = false) {
        let toCompare;
        if (useLastShown) {
            toCompare = this.lastShownRole;
        }
        else {
            toCompare = this.roles;
        }
        return BitFlags.isAny(toCompare, roles);
    }
    /**
     * Checks whether this entry is assigned only the specified render role(s). Optionally, this method can also check
     * if this entry was last rendered in only the specified role(s) instead.
     * @param roles The render roles against which to check.
     * @param lastShown Whether to check the role in which this entry was last rendered instead of the current roles
     * assigned to this entry. False by default.
     * @returns whether the check passed.
     */
    isOnlyRole(roles, lastShown = false) {
        let toCompare;
        if (lastShown) {
            toCompare = this.lastShownRole;
        }
        else {
            toCompare = this.roles;
        }
        return toCompare === roles;
    }
    /**
     * Checks whether this entry is assigned all the specified render role(s). Optionally, this method can also check
     * if this entry was last rendered in all the specified role(s) instead.
     * @param roles - the render role(s) against which to check.
     * @param lastShown Whether to check the role in which this entry was last rendered instead of the current roles
     * assigned to this entry. False by default.
     * @returns whether the check passed.
     */
    isAllRoles(roles, lastShown = false) {
        let toCompare;
        if (lastShown) {
            toCompare = this.lastShownRole;
        }
        else {
            toCompare = this.roles;
        }
        return BitFlags.isAll(toCompare, roles);
    }
    /**
     * Assigns one or more render roles to this entry.
     * @param roles The render role(s) to assign.
     * @param sourceId The unique string ID of the source of the assignment.
     */
    addRole(roles, sourceId) {
        BitFlags.forEach(roles, (value, index) => { this.registrations[1 << index].add(sourceId); }, true, 0, 6);
        this._roles = this._roles | roles;
    }
    /**
     * Removes one or more render roles from this entry.
     * @param roles The render role(s) to remove.
     * @param sourceId The unique string ID of the soruce of the de-assignment.
     */
    removeRole(roles, sourceId) {
        BitFlags.forEach(roles, (value, index) => {
            const role = 1 << index;
            const registrations = this.registrations[role];
            registrations.delete(sourceId);
            if (registrations.size === 0) {
                this._roles = this._roles & ~role;
            }
        }, true, 0, 6);
    }
    /**
     * Prepares this entry for rendering.
     * @param showRole The role in which this entry should be rendered.
     * @param iconFactory The factory to use to get a waypoint icon.
     * @param labelFactory The factory to use to get a waypoint label.
     */
    prepareRender(showRole, iconFactory, labelFactory) {
        var _a, _b;
        if (showRole === this._lastShownRole) {
            return;
        }
        this._icon = (_a = iconFactory === null || iconFactory === void 0 ? void 0 : iconFactory.getIcon(this.waypoint)) !== null && _a !== void 0 ? _a : null;
        const label = (_b = labelFactory === null || labelFactory === void 0 ? void 0 : labelFactory.getLabel(this.waypoint)) !== null && _b !== void 0 ? _b : null;
        if (this._label && this._label !== label) {
            this.renderer.textManager.deregister(this._label);
        }
        if (label && label !== this._label) {
            this.renderer.textManager.register(label);
        }
        this._label = label;
        this._lastShownRole = showRole;
    }
    /**
     * Updates this entry. An appropriate render role is selected, then the icon and label are updated as appropriate
     * for the chosen role. If the waypoint's label should be visible, it is added to the appropriate text manager.
     * Of note, this method will not draw the waypoint icon to a canvas element; it will simply ensure the .showIcon
     * property contains the correct value depending on whether the icon should be visible.
     * @param mapProjection The map projection to use.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(mapProjection) {
        var _a, _b, _c, _d;
        let showRole = 0;
        if (this.isAnyRole(MapWaypointRenderRole.Highlight)
            && this.renderer.roleInfos[MapWaypointRenderRole.Highlight].visibilityHandler(this.waypoint)) {
            showRole = MapWaypointRenderRole.Highlight;
        }
        else if (this.isAnyRole(MapWaypointRenderRole.FlightPlanActive)
            && this.renderer.roleInfos[MapWaypointRenderRole.FlightPlanActive].visibilityHandler(this.waypoint)) {
            showRole = MapWaypointRenderRole.FlightPlanActive;
        }
        else if (this.isAnyRole(MapWaypointRenderRole.FlightPlanInactive)
            && this.renderer.roleInfos[MapWaypointRenderRole.FlightPlanInactive].visibilityHandler(this.waypoint)) {
            showRole = MapWaypointRenderRole.FlightPlanInactive;
        }
        else if (this.isAnyRole(MapWaypointRenderRole.Normal)
            && this.renderer.roleInfos[MapWaypointRenderRole.Normal].visibilityHandler(this.waypoint)) {
            showRole = MapWaypointRenderRole.Normal;
        }
        else if (this.isAnyRole(MapWaypointRenderRole.Airway)
            && this.renderer.roleInfos[MapWaypointRenderRole.Airway].visibilityHandler(this.waypoint)) {
            showRole = MapWaypointRenderRole.Airway;
        }
        else if (this.isAnyRole(MapWaypointRenderRole.VNav)
            && this.renderer.roleInfos[MapWaypointRenderRole.VNav].visibilityHandler(this.waypoint)) {
            showRole = MapWaypointRenderRole.VNav;
        }
        const iconFactory = (_b = (_a = this.renderer.roleInfos[showRole]) === null || _a === void 0 ? void 0 : _a.iconFactory) !== null && _b !== void 0 ? _b : null;
        const labelFactory = (_d = (_c = this.renderer.roleInfos[showRole]) === null || _c === void 0 ? void 0 : _c.labelFactory) !== null && _d !== void 0 ? _d : null;
        this.prepareRender(showRole, iconFactory, labelFactory);
    }
    /**
     * Destroys this entry. Any label from this entry currently registered with the text manager will be deregistered.
     */
    destroy() {
        if (this._label) {
            this.renderer.textManager.deregister(this._label);
        }
    }
};
