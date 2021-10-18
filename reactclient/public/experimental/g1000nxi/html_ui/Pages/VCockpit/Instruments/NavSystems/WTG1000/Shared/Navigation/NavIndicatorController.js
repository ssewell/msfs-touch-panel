import { NavMath, Subject, UnitType } from 'msfssdk';
import { FrequencyBank, NavSourceType, RadioType, VorToFrom } from 'msfssdk/instruments';
import { VNavApproachGuidanceMode, VNavPathMode } from 'msfssdk/autopilot';
import { CDIScaleLabel } from '../Autopilot/LNavSimVars';
import { AdditionalApproachType } from 'msfssdk/navigation';
export var NavSensitivity;
(function (NavSensitivity) {
    NavSensitivity["DPRT"] = "DPRT";
    NavSensitivity["TERM"] = "TERM";
    NavSensitivity["ENR"] = "ENR";
    NavSensitivity["OCN"] = "OCN";
    NavSensitivity["LNAV"] = "LNAV+V";
    NavSensitivity["VIS"] = "VISUAL";
    NavSensitivity["LVNAV"] = "L/VNAV";
    NavSensitivity["LPV"] = "LPV";
    NavSensitivity["LP"] = "LP+V";
    NavSensitivity["MAPR"] = "MAPR";
    NavSensitivity["VOR"] = "VOR";
    NavSensitivity["ILS"] = "ILS";
})(NavSensitivity || (NavSensitivity = {}));
export var ObsSuspModes;
(function (ObsSuspModes) {
    ObsSuspModes[ObsSuspModes["NONE"] = 0] = "NONE";
    ObsSuspModes[ObsSuspModes["SUSP"] = 1] = "SUSP";
    ObsSuspModes[ObsSuspModes["OBS"] = 2] = "OBS";
})(ObsSuspModes || (ObsSuspModes = {}));
export var VNavDisplayMode;
(function (VNavDisplayMode) {
    VNavDisplayMode[VNavDisplayMode["NONE"] = 0] = "NONE";
    VNavDisplayMode[VNavDisplayMode["PATH"] = 1] = "PATH";
})(VNavDisplayMode || (VNavDisplayMode = {}));
export var GPDisplayMode;
(function (GPDisplayMode) {
    GPDisplayMode[GPDisplayMode["NONE"] = 0] = "NONE";
    GPDisplayMode[GPDisplayMode["PREVIEW"] = 1] = "PREVIEW";
    GPDisplayMode[GPDisplayMode["ACTIVE"] = 2] = "ACTIVE";
})(GPDisplayMode || (GPDisplayMode = {}));
/**
 * Encapsulation of the logic for an nav source.
 */
export class HsiSource {
    /**
     * Create an HSI Source
     * @param id The navsourceid.
     */
    constructor(id) {
        this.valid = false;
        this.bearing = null;
        this.distance = null;
        this.deviation = null;
        this.deviationScale = 1.0;
        this.deviationScaleLabel = null;
        this.toFrom = VorToFrom.OFF;
        this.dtk_obs = null;
        this.isLocalizer = false;
        this.hasSignal = false;
        this.hasLocalizer = false;
        this.localizerCourse = null;
        this.hasGlideslope = false;
        this.gsDeviation = null;
        this.altDeviation = null;
        this.hasDme = false;
        this.frequency = null;
        this.source = id;
        if (this.source.type === NavSourceType.Nav) {
            this.dtk_obs = 0;
        }
    }
}
/**
 * A NavIndicatorController to control what nav sources are being indicated on the panel.
 */
export class NavIndicatorController {
    /**
     * Initialize an instance of the NavIndicatorController.
     * @param bus is the event bus
     * @param fms is the fms
     */
    constructor(bus, fms) {
        this.fms = fms;
        this.navStates = [];
        this.activeSensitivity = NavSensitivity.VOR;
        this.activeSourceIndex = 0;
        this.hsiMapActive = false;
        this.courseNeedleRefs = { hsiRose: undefined, hsiMap: undefined };
        this.hsiRefs = { hsiRose: undefined, hsiMap: undefined };
        this.hsiMapDeviationRef = undefined;
        this.vdi = undefined;
        this.bearingPointerStatus = [false, false];
        this.bearingPointerAdf = [false, false];
        this.bearingPointerDirection = [null, null];
        this.firstRun = true;
        this.obsSuspMode = ObsSuspModes.NONE;
        this.missedApproachActive = false;
        this.currentSpeed = 30;
        this.currentHeading = 0;
        this.currentAltitude = 0;
        this.currentVNavTodDistance = -1;
        this.currentVNavBodDistance = -1;
        this.vnavPathInRange = false;
        this.currentVNavTargetAltitude = -1;
        this.currentVNavConstraintAltitude = -1;
        this.currentVNavFpa = 0;
        this.currentVNavPathMode = VNavPathMode.None;
        this.vnavDisplayMode = Subject.create(VNavDisplayMode.NONE);
        this.gpDisplayMode = Subject.create(GPDisplayMode.NONE);
        this.currentVnavApproachMode = VNavApproachGuidanceMode.None;
        this.currentLpvDeviation = Number.POSITIVE_INFINITY;
        this.currentLpvDistance = Number.POSITIVE_INFINITY;
        this.dmeSourceIndex = Subject.create(0);
        this.dmeDistanceSubject = Subject.create(-1);
        this.isLnavCalculating = Subject.create(false);
        /**
         * A callback called when the CDI Source Changes.
         * @param source The current selected CDI Source.
         */
        this.onUpdateCdiSelect = (source) => {
            if (source.type !== this.navStates[this.activeSourceIndex].source.type
                || source.index !== this.navStates[this.activeSourceIndex].source.index) {
                switch (source.type) {
                    case NavSourceType.Nav:
                        if (source.index == 1) {
                            this.activeSourceIndex = 0;
                        }
                        else {
                            this.activeSourceIndex = 1;
                        }
                        if (this.navStates[this.activeSourceIndex].isLocalizer && this.navStates[this.activeSourceIndex].hasLocalizer) {
                            this.slewObs();
                        }
                        break;
                    case NavSourceType.Gps:
                        this.activeSourceIndex = 2;
                        break;
                }
                this.updateSensitivity();
                this.updateVNavDisplayMode();
            }
        };
        /**
         * A callback called when the obs updates from the event bus.
         * @param obs The current obs/dtk value.
         */
        this.onUpdateDtk = (obs) => {
            if (obs.source.type === NavSourceType.Nav) {
                switch (obs.source.index) {
                    case 1:
                        this.navStates[0].dtk_obs = obs.heading;
                        break;
                    case 2:
                        this.navStates[1].dtk_obs = obs.heading;
                        break;
                }
                this.updateComponentsData(obs.source);
            }
        };
        /**
         * A callback called when the lnav dtk updates from the event bus.
         * @param dtk The current lnav dtk value.
         */
        this.onUpdateLnavDtk = (dtk) => {
            if (!this.isLnavCalculating.get()) {
                this.navStates[2].dtk_obs = this.currentHeading;
            }
            else if (dtk !== this.navStates[2].dtk_obs) {
                this.navStates[2].dtk_obs = dtk;
            }
            if (this.activeSourceIndex == 2) {
                this.updateComponentsData();
            }
        };
        /**
         * A callback called when the lnav xtk updates from the event bus.
         * @param xtk The current lnav xtk value.
         */
        this.onUpdateLnavXtk = (xtk) => {
            // Check for both a full or direct to flight plan.
            if (!this.isLnavCalculating.get()) {
                if (this.navStates[2].toFrom !== VorToFrom.OFF) {
                    this.navStates[2].toFrom = VorToFrom.OFF;
                    this.updateComponentsDisplay(this.navStates[2].source);
                }
            }
            else if (this.navStates[2].deviation === null || -xtk !== (this.navStates[2].deviation * this.navStates[2].deviationScale)) {
                this.navStates[2].deviation = (-xtk / this.navStates[2].deviationScale);
                if (this.navStates[2].toFrom !== VorToFrom.TO) {
                    this.navStates[2].toFrom = VorToFrom.TO;
                    this.updateComponentsDisplay(this.navStates[2].source);
                }
            }
            if (this.activeSourceIndex == 2) {
                this.updateComponentsData();
            }
        };
        /**
         * A callback called when the bearing to an lnav fix updates across the event bus to set the to/from flag for GPS.
         * @param brg The current bearing to the current fix.
         */
        this.onUpdateLnavBrg = (brg) => {
            if (this.isLnavCalculating.get()) {
                const dtk = this.navStates[2].dtk_obs;
                if (dtk !== null && Math.abs(NavMath.diffAngle(brg, dtk)) > 120) {
                    this.navStates[2].toFrom = VorToFrom.FROM;
                }
                else {
                    this.navStates[2].toFrom = VorToFrom.TO;
                }
                this.updateComponentsDisplay(this.navStates[2].source);
            }
        };
        /**
         * A callback called when the cdi deviation updates from the event bus.
         * @param deviation The current deviation value.
         */
        this.onUpdateCdiDeviation = (deviation) => {
            if (deviation.source.type !== NavSourceType.Nav) {
                return;
            }
            switch (deviation.source.index) {
                case this.navStates[0].source.index:
                    this.navStates[0].deviation = deviation.deviation !== null ? deviation.deviation / 127 : -100;
                    break;
                case this.navStates[1].source.index:
                    this.navStates[1].deviation = deviation.deviation !== null ? deviation.deviation / 127 : -100;
                    break;
            }
            this.updateComponentsData(deviation.source);
        };
        /**
         * A callback called when the vor to/from updates from the event bus.
         * @param toFrom The current to/from value.
         */
        this.onUpdateToFrom = (toFrom) => {
            if (toFrom.source.type !== NavSourceType.Nav) {
                return;
            }
            switch (toFrom.source.index) {
                case this.navStates[0].source.index:
                    this.navStates[0].toFrom = toFrom.toFrom;
                    break;
                case this.navStates[1].source.index:
                    this.navStates[1].toFrom = toFrom.toFrom;
                    break;
            }
            this.updateComponentsDisplay(toFrom.source);
        };
        /**
         * A callback called when the dme updates from the event bus.
         * @param dme The current deviation value.
         */
        this.onUpdateDme = (dme) => {
            if (dme.source.type !== NavSourceType.Nav) {
                return;
            }
            switch (dme.source.index) {
                case this.navStates[0].source.index:
                    this.navStates[0].hasDme = dme.hasDme;
                    this.navStates[0].distance = dme.dmeDistance;
                    break;
                case this.navStates[1].source.index:
                    this.navStates[1].hasDme = dme.hasDme;
                    this.navStates[1].distance = dme.dmeDistance;
                    break;
            }
            const dmeSource = this.dmeSourceIndex.get();
            const dmeDistance = this.navStates[dmeSource].distance;
            if (this.navStates[dmeSource].hasDme && dmeDistance !== null && dmeDistance > 0) {
                this.dmeDistanceSubject.set(dmeDistance);
            }
            else {
                this.dmeDistanceSubject.set(-1);
            }
        };
        /**
         * A callback called when the localizer data updates from the event bus.
         * @param localizer The current localizer data.
         */
        this.onUpdateLocalizer = (localizer) => {
            if (localizer.source.type !== NavSourceType.Nav) {
                return;
            }
            switch (localizer.source.index) {
                case this.navStates[0].source.index:
                    this.navStates[0].hasLocalizer = localizer.isValid;
                    if (localizer.isValid) {
                        this.navStates[0].localizerCourse = localizer.course;
                    }
                    break;
                case this.navStates[1].source.index:
                    this.navStates[1].hasLocalizer = localizer.isValid;
                    if (localizer.isValid) {
                        this.navStates[1].localizerCourse = localizer.course;
                    }
                    break;
            }
            this.slewObs();
            this.updateSensitivity(localizer.source);
            this.updateVNavDisplayMode();
        };
        /**
         * A callback called when the glideslope data updates from the event bus.
         * @param glideslope The current glideslope data.
         */
        this.onUpdateGlideslope = (glideslope) => {
            var _a, _b;
            if (glideslope.source.type !== NavSourceType.Nav) {
                return;
            }
            switch (glideslope.source.index) {
                case this.navStates[0].source.index:
                    if (glideslope.isValid == this.navStates[0].hasGlideslope && glideslope.isValid) {
                        this.navStates[0].gsDeviation = glideslope.deviation;
                        (_a = this.vdi) === null || _a === void 0 ? void 0 : _a.updateDeviation();
                        return;
                    }
                    else {
                        this.navStates[0].hasGlideslope = glideslope.isValid;
                        if (glideslope.isValid) {
                            this.navStates[0].gsDeviation = glideslope.deviation;
                        }
                    }
                    break;
                case this.navStates[1].source.index:
                    if (glideslope.isValid == this.navStates[1].hasGlideslope && glideslope.isValid) {
                        this.navStates[1].gsDeviation = glideslope.deviation;
                        (_b = this.vdi) === null || _b === void 0 ? void 0 : _b.updateDeviation();
                        return;
                    }
                    else {
                        this.navStates[1].hasGlideslope = glideslope.isValid;
                        if (glideslope.isValid) {
                            this.navStates[1].gsDeviation = glideslope.deviation;
                        }
                    }
                    break;
            }
        };
        /**
         * A callback called when isLoc value updates from the event bus.
         * @param isLoc The current isLoc value.
         */
        this.onUpdateIsLocFreq = (isLoc) => {
            if (isLoc.source.type !== NavSourceType.Nav) {
                return;
            }
            switch (isLoc.source.index) {
                case this.navStates[0].source.index:
                    this.navStates[0].isLocalizer = isLoc.isLocalizer;
                    break;
                case this.navStates[1].source.index:
                    this.navStates[1].isLocalizer = isLoc.isLocalizer;
                    break;
            }
            this.updateComponentsDisplay(isLoc.source);
        };
        /**
         * Update the source of a bearing pointer.
         * @param data The new bearing source info.
         */
        this.updateBearingSrc = (data) => {
            var _a;
            if (((_a = data.source) === null || _a === void 0 ? void 0 : _a.type) === undefined) {
                this.bearingPointerStatus[data.index] = false;
                this.bearingPointerAdf[data.index] = false;
            }
            else if (data.source.type === NavSourceType.Adf) {
                this.bearingPointerStatus[data.index] = true;
                this.bearingPointerAdf[data.index] = true;
            }
            else {
                this.bearingPointerStatus[data.index] = true;
                this.bearingPointerAdf[data.index] = false;
            }
            if (this.bearingPointerDirection[data.index] !== null) {
                this.updateBearingDir({ index: data.index, direction: this.bearingPointerDirection[data.index] });
            }
            if (this.bearingPointerStatus[0] == true || this.bearingPointerStatus[1] == true) {
                this.hsiRefs.hsiRose.instance.compassRoseComponent.instance.setCircleVisible(true);
            }
            else {
                this.hsiRefs.hsiRose.instance.compassRoseComponent.instance.setCircleVisible(false);
            }
            this.updateBearingPointers(data.index, (element) => {
                if (element !== null && element.instance !== null && data.source) {
                    const source = data.source;
                    if (source.type !== NavSourceType.Nav && source.type !== NavSourceType.Gps && source.type !== NavSourceType.Adf) {
                        element.instance.style.display = 'none';
                        this.bearingPointerStatus[data.index] = false;
                    }
                    else if (source.type == NavSourceType.Nav && this.navStates[source.index - 1].isLocalizer) {
                        element.instance.style.display = 'none';
                    }
                    else {
                        element.instance.style.display = '';
                    }
                }
            });
        };
        /**
         * Update the validity of a bearing source.
         * @param data The validity event.
         */
        this.updateBearingValidity = (data) => {
            this.updateBearingPointers(data.index, (element) => {
                if (element !== null && element.instance !== null) {
                    if (data.valid) {
                        element.instance.style.display = '';
                    }
                    else {
                        element.instance.style.display = 'none';
                    }
                }
            });
        };
        /**
         * Update the heading of a bearing pointer.
         * @param data The BearingDirection message.
         */
        this.updateBearingDir = (data) => {
            let direction = data.direction;
            this.bearingPointerDirection[data.index] = direction;
            if (this.bearingPointerAdf[data.index] && data.direction !== null) {
                direction = NavMath.normalizeHeading(data.direction + this.currentHeading);
            }
            this.updateBearingPointers(data.index, (element) => {
                if (element !== null && element.instance !== null && direction !== null) {
                    const newDirection = Math.round(direction * 100) / 100;
                    element.instance.style.transform = `rotate3d(0, 0, 1, ${newDirection}deg)`;
                }
                else if (element !== null && element.instance !== null && direction == null) {
                    element.instance.style.display = 'none';
                }
            });
        };
        this.bus = bus;
        for (let i = 0; i < 3; i++) {
            const type = i < 2 ? NavSourceType.Nav : NavSourceType.Gps;
            const index = i == 1 ? 2 : 1;
            const sourceId = { type: type, index: index };
            const source = new HsiSource(sourceId);
            source.toFrom = VorToFrom.OFF;
            this.navStates.push(source);
        }
        this.monitorEvents();
    }
    /**
     * Method to monitor nav processor events to keep track of HSI-related data.
     */
    monitorEvents() {
        const g1000 = this.bus.getSubscriber();
        g1000.on('approach_details_set').handle(() => {
            this.updateSensitivity();
            this.onUpdateLpv(this.currentLpvDeviation, this.currentLpvDistance);
        });
        this.bus.getSubscriber().on('ground_speed').handle(speed => this.currentSpeed = speed);
        const adc = this.bus.getSubscriber();
        adc.on('hdg_deg').withPrecision(1).handle(hdg => this.currentHeading = hdg);
        adc.on('alt').atFrequency(1).handle(alt => this.currentAltitude = alt);
        const navcom = this.bus.getSubscriber();
        navcom.on('setFrequency').handle((setFrequency) => {
            if (setFrequency.radio.radioType === RadioType.Nav && setFrequency.bank == FrequencyBank.Active) {
                this.navStates[setFrequency.radio.index - 1].frequency = setFrequency.frequency;
            }
        });
        const nav = this.bus.getSubscriber();
        nav.on('cdi_select').handle(this.onUpdateCdiSelect);
        nav.on('obs_set').handle(this.onUpdateDtk);
        nav.on('cdi_deviation').handle(this.onUpdateCdiDeviation);
        nav.on('vor_to_from').handle(this.onUpdateToFrom);
        nav.on('localizer').handle(this.onUpdateLocalizer);
        nav.on('glideslope').handle(this.onUpdateGlideslope);
        nav.on('is_localizer_frequency').handle(this.onUpdateIsLocFreq);
        nav.on('brg_source').whenChanged().handle(this.updateBearingSrc);
        nav.on('brg_direction').handle(this.updateBearingDir);
        nav.on('dme_state').handle(this.onUpdateDme);
        nav.on('brg_validity').handle(this.updateBearingValidity);
        nav.on('gps_obs_active').handle(obsActive => {
            if (obsActive) {
                this.obsSuspMode = ObsSuspModes.OBS;
            }
            else {
                this.obsSuspMode = ObsSuspModes.NONE;
            }
            if (this.onUpdateDtkBox !== undefined) {
                this.onUpdateDtkBox();
            }
            this.updateSensitivity();
        });
        const lnavSimVars = this.bus.getSubscriber();
        lnavSimVars.on('lnavDtkMag').handle(this.onUpdateLnavDtk);
        lnavSimVars.on('lnavXtk').handle(this.onUpdateLnavXtk);
        lnavSimVars.on('lnavBrgMag').whenChangedBy(5).handle(this.onUpdateLnavBrg);
        lnavSimVars.on('lnavCdiScaling').handle(scale => {
            this.navStates[2].deviationScale = scale;
        });
        lnavSimVars.on('lnavCdiScalingLabel').handle(label => {
            this.navStates[2].deviationScaleLabel = label;
            this.updateSensitivity();
        });
        const lnavEvents = this.bus.getSubscriber();
        lnavEvents.on('suspChanged').handle(isSuspended => {
            if (isSuspended) {
                this.obsSuspMode = ObsSuspModes.SUSP;
            }
            else {
                this.obsSuspMode = ObsSuspModes.NONE;
            }
            this.updateSensitivity();
        });
        const vnav = this.bus.getSubscriber();
        vnav.on('vnavVDev').withPrecision(0).handle(deviation => this.onUpdateVnav(deviation));
        vnav.on('vnavLpvVDev').withPrecision(0).handle(deviation => this.onUpdateLpv(deviation, this.currentLpvDistance));
        vnav.on('vnavLpvDistance').withPrecision(0).handle(distance => this.onUpdateLpv(this.currentLpvDeviation, distance));
        vnav.on('vnavApproachMode').whenChanged().handle((mode) => {
            this.currentVnavApproachMode = mode;
            this.updateVNavDisplayMode();
        });
        vnav.on('vnavPathMode').handle(mode => {
            this.currentVNavPathMode = mode;
            this.updateVNavDisplayMode();
        });
        vnav.on('vnavTodDistance').atFrequency(1).handle(distance => {
            this.currentVNavTodDistance = distance;
        });
        vnav.on('vnavBodDistance').atFrequency(1).handle(distance => {
            this.currentVNavBodDistance = distance;
            this.checkIfVnavPathInRange();
        });
        vnav.on('vnavTargetAlt').handle(alt => {
            if (alt > 45000 || alt <= 0) {
                this.currentVNavTargetAltitude = -1;
            }
            else {
                this.currentVNavTargetAltitude = alt;
            }
            this.updateVNavDisplayMode();
        });
        vnav.on('vnavConstraintAltitude').whenChanged().handle(alt => {
            if (alt > 45000 || alt <= 0) {
                this.currentVNavConstraintAltitude = -1;
            }
            else {
                this.currentVNavConstraintAltitude = alt;
            }
            this.updateVNavDisplayMode();
        });
        vnav.on('vnavFpa').handle(fpa => {
            this.currentVNavFpa = fpa;
            this.updateVNavDisplayMode();
        });
        const fpl = this.bus.getSubscriber();
        fpl.on('fplLegChange').handle((e) => {
            if (e.planIndex === this.fms.flightPlanner.activePlanIndex) {
                this.onFplChange();
            }
        });
        fpl.on('fplIndexChanged').handle(() => this.onFplChange());
        fpl.on('fplLoaded').handle(() => this.onFplChange());
        this.dmeSourceIndex.sub((v) => {
            const dmeSource = v;
            const dmeDistance = this.navStates[dmeSource].distance;
            if (this.navStates[dmeSource].hasDme && dmeDistance !== null && dmeDistance > 0) {
                this.dmeDistanceSubject.set(dmeDistance);
            }
            else {
                this.dmeDistanceSubject.set(-1);
            }
        });
        this.isLnavCalculating.sub((v) => {
            if (!v) {
                this.onUpdateLnavXtk(0);
            }
            else {
                this.updateComponentsDisplay(this.navStates[2].source);
            }
        });
    }
    /**
     * A method to check if the VNAV Path is in a displayable range.
     */
    checkIfVnavPathInRange() {
        let vnavPathInRange = false;
        if (this.currentVNavBodDistance > 0
            && this.currentSpeed > 30
            && this.navStates[2].altDeviation !== null
            && this.currentVNavTargetAltitude > 0
            && this.currentVNavConstraintAltitude > 0
            && this.currentVNavConstraintAltitude < this.currentAltitude
            && Math.abs(this.currentVNavFpa) > 0) {
            const todNM = UnitType.METER.convertTo(this.currentVNavTodDistance, UnitType.NMILE);
            const bodNM = UnitType.METER.convertTo(this.currentVNavBodDistance, UnitType.NMILE);
            if (todNM < this.currentSpeed / 60 && bodNM > 0) {
                vnavPathInRange = true;
            }
        }
        if (vnavPathInRange !== this.vnavPathInRange) {
            this.vnavPathInRange = vnavPathInRange;
            this.updateVNavDisplayMode();
        }
    }
    /**
     * A method to update the VNAV Display Mode Subject.
     */
    updateVNavDisplayMode() {
        var _a;
        const activeSource = this.navStates[this.activeSourceIndex];
        let vnavMode = VNavDisplayMode.NONE;
        let gpMode = GPDisplayMode.NONE;
        if (this.currentVNavPathMode === VNavPathMode.PathActive) {
            vnavMode = VNavDisplayMode.PATH;
            if (activeSource.source.type === NavSourceType.Gps && activeSource.hasGlideslope && !this.missedApproachActive) {
                gpMode = GPDisplayMode.PREVIEW;
            }
        }
        else if (this.currentVnavApproachMode === VNavApproachGuidanceMode.GPActive) {
            vnavMode = VNavDisplayMode.NONE;
            gpMode = GPDisplayMode.ACTIVE;
        }
        else if (activeSource.source.type === NavSourceType.Gps) {
            if (this.vnavPathInRange) {
                vnavMode = VNavDisplayMode.PATH;
            }
            if (activeSource.hasGlideslope && !this.missedApproachActive) {
                switch (this.activeSensitivity) {
                    case NavSensitivity.VIS:
                    case NavSensitivity.LNAV:
                    case NavSensitivity.LP:
                    case NavSensitivity.LPV:
                    case NavSensitivity.LVNAV:
                        gpMode = GPDisplayMode.ACTIVE;
                        break;
                    default:
                        gpMode = GPDisplayMode.PREVIEW;
                }
            }
        }
        this.vnavDisplayMode.set(vnavMode);
        this.gpDisplayMode.set(gpMode);
        (_a = this.vdi) === null || _a === void 0 ? void 0 : _a.updateSourceSensitivity();
    }
    /**
     * A method called on flight plan changes to set whether lnav has a valid plan.
     */
    onFplChange() {
        const length = this.fms.flightPlanner.hasActiveFlightPlan() ? this.fms.flightPlanner.getActiveFlightPlan().length : 0;
        if (length < 2) {
            this.isLnavCalculating.set(false);
        }
        else {
            this.isLnavCalculating.set(true);
        }
    }
    /**
     * A method called from hsimap when the HSI format is changed.
     * @param hsiMap a bool set to true when the hsiMap should be displayed and false when the rose should be displayed.
     */
    onFormatChange(hsiMap) {
        switch (hsiMap) {
            case true:
                this.hsiMapActive = true;
                this.hsiRefs.hsiRose.instance.setVisible(false);
                this.hsiRefs.hsiMap.instance.setVisible(true);
                break;
            case false:
                this.hsiMapActive = false;
                this.hsiRefs.hsiMap.instance.setVisible(false);
                this.hsiRefs.hsiRose.instance.setVisible(true);
        }
        this.updateComponentsDisplay();
    }
    /**
     * A method to compare the incoming NavSourceId with the Active Nav Source.
     * @param source The current selected CDI Source.
     * @returns a bool of whether the incoming NavSourceId is the active nav source.
     */
    checkIfActive(source) {
        const type = source.type;
        const index = source.index;
        if (type === this.navStates[this.activeSourceIndex].source.type && index === this.navStates[this.activeSourceIndex].source.index) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * A callback called to update the nav sensitivity.
     * @param updatedSource is the source that was updated
     */
    updateSensitivity(updatedSource = undefined) {
        const update = updatedSource === undefined ? true : this.checkIfActive(updatedSource);
        if (update) {
            switch (this.navStates[this.activeSourceIndex].source.type) {
                case NavSourceType.Nav:
                    if (this.navStates[this.activeSourceIndex].isLocalizer) {
                        this.activeSensitivity = NavSensitivity.ILS;
                    }
                    else {
                        this.activeSensitivity = NavSensitivity.VOR;
                    }
                    break;
                case NavSourceType.Gps:
                    this.setGpsSensitivity();
                    break;
            }
            this.updateComponentsDisplay();
        }
    }
    /**
     * Sets the GPS nav sentitivity value.
     */
    setGpsSensitivity() {
        const nav = this.navStates[this.activeSourceIndex];
        let missedApproachActive = false;
        switch (nav.deviationScaleLabel) {
            case CDIScaleLabel.Departure:
                this.activeSensitivity = NavSensitivity.DPRT;
                break;
            case CDIScaleLabel.Terminal:
                this.activeSensitivity = NavSensitivity.TERM;
                break;
            case CDIScaleLabel.LNav:
            case CDIScaleLabel.LNavPlusV:
                this.activeSensitivity = NavSensitivity.LNAV;
                break;
            case CDIScaleLabel.LNavVNav:
                this.activeSensitivity = NavSensitivity.LVNAV;
                break;
            case CDIScaleLabel.LP:
            case CDIScaleLabel.LPPlusV:
                this.activeSensitivity = NavSensitivity.LP;
                break;
            case CDIScaleLabel.LPV:
                this.activeSensitivity = NavSensitivity.LPV;
                break;
            case CDIScaleLabel.Visual:
                this.activeSensitivity = NavSensitivity.VIS;
                break;
            case CDIScaleLabel.MissedApproach:
                this.activeSensitivity = NavSensitivity.MAPR;
                missedApproachActive = true;
                break;
            default:
                this.activeSensitivity = NavSensitivity.ENR;
        }
        if (missedApproachActive !== this.missedApproachActive) {
            this.missedApproachActive = missedApproachActive;
        }
    }
    /**
     * A callback called when the LPV data is updated.
     * @param deviation The LPV vertical deviation.
     * @param distance The LPV lateral distance.
     */
    onUpdateLpv(deviation, distance) {
        var _a;
        this.currentLpvDeviation = deviation;
        const hasGlideslope = this.navStates[2].hasGlideslope;
        if (distance !== this.currentLpvDistance) {
            this.currentLpvDistance = distance;
            const approachType = this.fms.approachDetails.approachType;
            if (this.fms.approachDetails.approachIsActive && Math.abs(distance) < 30000 &&
                (approachType === ApproachType.APPROACH_TYPE_GPS || approachType === ApproachType.APPROACH_TYPE_RNAV || approachType === AdditionalApproachType.APPROACH_TYPE_VISUAL)) {
                if (!hasGlideslope) {
                    this.navStates[2].hasGlideslope = true;
                    this.updateVNavDisplayMode();
                }
            }
            else if (hasGlideslope) {
                this.navStates[2].hasGlideslope = false;
                this.updateVNavDisplayMode();
            }
        }
        else if (distance <= 0 && hasGlideslope) {
            this.navStates[2].hasGlideslope = false;
            this.updateVNavDisplayMode();
        }
        if (isFinite(deviation) && isFinite(distance) && this.navStates[2].hasGlideslope) {
            const scale = Math.tan(UnitType.DEGREE.convertTo(2.0, UnitType.RADIAN)) * distance;
            const scaleClamped = NavMath.clamp(scale, 200, 1000) * -1;
            this.navStates[2].gsDeviation = deviation / scaleClamped;
            (_a = this.vdi) === null || _a === void 0 ? void 0 : _a.updateDeviation();
        }
    }
    /**
     * A callback called when the VNAV data is updated.
     * @param deviation The vnav vertical deviation.
     */
    onUpdateVnav(deviation) {
        var _a;
        this.navStates[2].altDeviation = deviation / -750;
        (_a = this.vdi) === null || _a === void 0 ? void 0 : _a.updateDeviation();
    }
    /**
     * A callback called to slew the obs to the ILS inbound course when an loc becomes valid.
     */
    slewObs() {
        const course = this.navStates[this.activeSourceIndex].localizerCourse;
        if (this.activeSourceIndex < 2 && this.navStates[this.activeSourceIndex].isLocalizer &&
            this.navStates[this.activeSourceIndex].hasLocalizer && course !== null) {
            SimVar.SetSimVarValue(`K:VOR${this.activeSourceIndex + 1}_SET`, 'number', Math.round(course));
        }
    }
    /**
     * A method called when xtk/dtk data updates.
     * @param updatedSource is the source that was updated
     */
    updateComponentsData(updatedSource = undefined) {
        const update = updatedSource === undefined ? true : this.checkIfActive(updatedSource);
        if (update || this.firstRun) {
            if (this.onUpdateDtkBox !== undefined) {
                this.onUpdateDtkBox();
            }
            if (this.hsiMapActive) {
                this.courseNeedleRefs.hsiMap.instance.updateData();
                this.hsiMapDeviationRef.instance.updateData();
            }
            else {
                this.courseNeedleRefs.hsiRose.instance.updateData();
            }
            if (this.firstRun) {
                this.firstRun = false;
            }
        }
    }
    /**
     * A method called when any value updates that needs to trigger a component update.
     * @param updatedSource is the source that was updated
     */
    updateComponentsDisplay(updatedSource = undefined) {
        const update = updatedSource === undefined ? true : this.checkIfActive(updatedSource);
        if (update || this.firstRun) {
            if (this.hsiMapActive) {
                this.courseNeedleRefs.hsiMap.instance.updateSourceSensitivity();
                this.hsiMapDeviationRef.instance.updateSourceSensitivity();
            }
            else {
                this.courseNeedleRefs.hsiRose.instance.updateSourceSensitivity();
                this.hsiRefs.hsiRose.instance.updateSourceSensitivity();
            }
            this.updateComponentsData(updatedSource);
        }
    }
    /**
     * Utility function to update a given bearing pointer in both the rose and map.
     * @param index The index of the bearing pointer to update.
     * @param func A function to execute on the pointer instances.
     */
    updateBearingPointers(index, func) {
        const elements = [
            index === 0 ? this.hsiRefs.hsiRose.instance.bearingPointer1Element :
                index === 1 ? this.hsiRefs.hsiRose.instance.bearingPointer2Element : null,
            index === 0 ? this.hsiRefs.hsiMap.instance.bearingPointer1Element :
                index === 1 ? this.hsiRefs.hsiMap.instance.bearingPointer2Element : null
        ];
        for (const element of elements) {
            func(element);
        }
    }
}
