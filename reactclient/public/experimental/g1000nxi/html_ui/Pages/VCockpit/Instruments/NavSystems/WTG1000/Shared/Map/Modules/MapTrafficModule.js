import { ComputedSubject, NumberUnitSubject, Subject, UnitType } from 'msfssdk';
import { TCASOperatingMode } from 'msfssdk/traffic';
/**
 * Traffic alert level modes.
 */
export var MapTrafficAlertLevelMode;
(function (MapTrafficAlertLevelMode) {
    MapTrafficAlertLevelMode[MapTrafficAlertLevelMode["All"] = 0] = "All";
    MapTrafficAlertLevelMode[MapTrafficAlertLevelMode["Advisories"] = 1] = "Advisories";
    MapTrafficAlertLevelMode[MapTrafficAlertLevelMode["TA_RA"] = 2] = "TA_RA";
    MapTrafficAlertLevelMode[MapTrafficAlertLevelMode["RA"] = 3] = "RA";
})(MapTrafficAlertLevelMode || (MapTrafficAlertLevelMode = {}));
/**
 * Traffic motion vector modes.
 */
export var MapTrafficMotionVectorMode;
(function (MapTrafficMotionVectorMode) {
    MapTrafficMotionVectorMode[MapTrafficMotionVectorMode["Off"] = 0] = "Off";
    MapTrafficMotionVectorMode[MapTrafficMotionVectorMode["Absolute"] = 1] = "Absolute";
    MapTrafficMotionVectorMode[MapTrafficMotionVectorMode["Relative"] = 2] = "Relative";
})(MapTrafficMotionVectorMode || (MapTrafficMotionVectorMode = {}));
/**
 * Traffic display altitude restriction modes.
 */
export var MapTrafficAltitudeRestrictionMode;
(function (MapTrafficAltitudeRestrictionMode) {
    MapTrafficAltitudeRestrictionMode[MapTrafficAltitudeRestrictionMode["Unrestricted"] = 0] = "Unrestricted";
    MapTrafficAltitudeRestrictionMode[MapTrafficAltitudeRestrictionMode["Above"] = 1] = "Above";
    MapTrafficAltitudeRestrictionMode[MapTrafficAltitudeRestrictionMode["Normal"] = 2] = "Normal";
    MapTrafficAltitudeRestrictionMode[MapTrafficAltitudeRestrictionMode["Below"] = 3] = "Below";
})(MapTrafficAltitudeRestrictionMode || (MapTrafficAltitudeRestrictionMode = {}));
/**
 * A module describing the display of traffic.
 */
export class MapTrafficModule {
    /**
     * Constructor.
     * @param tcas This module's associated TCAS.
     */
    constructor(tcas) {
        this.tcas = tcas;
        /** Whether to show traffic information. */
        this.show = Subject.create(true);
        /** The TCAS operating mode. */
        this.operatingMode = Subject.create(TCASOperatingMode.Standby);
        /** Whether to show intruder labels. */
        this.showIntruderLabel = Subject.create(true);
        /** The index of the outer ring range. */
        this.outerRangeIndex = Subject.create(0);
        /** The index of the inner ring range. */
        this.innerRangeIndex = Subject.create(0);
        /** The alert level mode. */
        this.alertLevelMode = Subject.create(MapTrafficAlertLevelMode.All);
        /** The altitude restriction mode. */
        this.altitudeRestrictionMode = Subject.create(MapTrafficAltitudeRestrictionMode.Unrestricted);
        /** The motion vector mode. */
        this.altitudeRestrictionAbove = ComputedSubject.create(MapTrafficAltitudeRestrictionMode.Unrestricted, mode => {
            return mode === MapTrafficAltitudeRestrictionMode.Unrestricted || mode === MapTrafficAltitudeRestrictionMode.Above
                ? MapTrafficModule.ALTITUDE_RESTRICTION_UNRES
                : MapTrafficModule.ALTITUDE_RESTRICTION_NORMAL;
        });
        /** The motion vector mode. */
        this.altitudeRestrictionBelow = ComputedSubject.create(MapTrafficAltitudeRestrictionMode.Unrestricted, mode => {
            return mode === MapTrafficAltitudeRestrictionMode.Unrestricted || mode === MapTrafficAltitudeRestrictionMode.Below
                ? MapTrafficModule.ALTITUDE_RESTRICTION_UNRES
                : MapTrafficModule.ALTITUDE_RESTRICTION_NORMAL;
        });
        /** Whether displayed intruder altitude is relative. */
        this.isAltitudeRelative = Subject.create(true);
        /** The motion vector mode. */
        this.motionVectorMode = Subject.create(MapTrafficMotionVectorMode.Off);
        /** The motion vector mode. */
        this.motionVectorLookahead = NumberUnitSubject.createFromNumberUnit(UnitType.SECOND.createNumber(60));
        this.altitudeRestrictionMode.sub(mode => {
            this.altitudeRestrictionAbove.set(mode);
            this.altitudeRestrictionBelow.set(mode);
        });
        tcas.getEventSubscriber().on('tcas_operating_mode').whenChanged().handle(mode => {
            this.operatingMode.set(mode);
        });
    }
}
MapTrafficModule.ALTITUDE_RESTRICTION_UNRES = UnitType.FOOT.createNumber(9900);
MapTrafficModule.ALTITUDE_RESTRICTION_NORMAL = UnitType.FOOT.createNumber(2700);
