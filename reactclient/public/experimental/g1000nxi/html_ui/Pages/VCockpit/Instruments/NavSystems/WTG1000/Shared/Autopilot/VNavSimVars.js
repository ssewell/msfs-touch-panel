import { SimVarValueType } from 'msfssdk/data';
import { SimVarPublisher } from 'msfssdk/instruments';
/**
 * Events published by the VNAV system on the bus.
 */
export var VNavSimVars;
(function (VNavSimVars) {
    /** The vertical deviation. */
    VNavSimVars["VerticalDeviation"] = "L:WT1000_VNav_Vertical_Deviation";
    /** The VNAV target altitude. */
    VNavSimVars["TargetAltitude"] = "L:WT1000_VNav_Target_Altitude";
    /** The VNAV path mode. */
    VNavSimVars["PathMode"] = "L:WT1000_VNav_Path_Mode";
    /** The VNAV mode. */
    VNavSimVars["VNAVMode"] = "L:WT1000_VNav_Mode";
    /** The VNAV approach guidance mode. */
    VNavSimVars["ApproachMode"] = "L:WT1000_VNav_Approach_Mode";
    /** The distance to the next TOD, or -1 if one does not exist. */
    VNavSimVars["TODDistance"] = "L:WT1000_VNav_Distance_To_TOD";
    /** The index of the leg for the next TOD. */
    VNavSimVars["TODLegIndex"] = "L:WT1000_VNav_TOD_Leg_Index";
    /** The distance from the end of the TOD leg that the TOD is. */
    VNavSimVars["TODDistanceInLeg"] = "L:WT1000_VNav_TOD_Distance_In_Leg";
    /** The index of the leg for the next BOD. */
    VNavSimVars["BODLegIndex"] = "L:WT1000_VNav_BOD_Leg_Index";
    /** The index of the leg for the next constraint. */
    VNavSimVars["CurrentConstraintLegIndex"] = "L:WT1000_VNav_Constraint_Leg_Index";
    /** The current constraint altitude. */
    VNavSimVars["CurrentConstraintAltitude"] = "L:WT1000_VNav_Constraint_Altitude";
    /** The distance to the next BOD, or -1 if one does not exist. */
    VNavSimVars["BODDistance"] = "L:WT1000_VNav_Distance_To_BOD";
    /** The VNAV current altitude capture type. */
    VNavSimVars["CaptureType"] = "L:WT1000_VNav_Alt_Capture_Type";
    /** The current required flight path angle. */
    VNavSimVars["FPA"] = "L:WT1000_VNav_FPA";
    /** The current LPV vertical deviation. */
    VNavSimVars["LPVVerticalDeviation"] = "L:WT1000_LPV_Vertical_Deviation";
    /** The current remaining LPV distance. */
    VNavSimVars["LPVDistance"] = "L:WT1000_LPV_Distance";
    /** The required VS to the current constraint. */
    VNavSimVars["RequiredVS"] = "L:WT1000_VNAV_Required_VS";
})(VNavSimVars || (VNavSimVars = {}));
/** A publisher to poll and publish nav/com simvars. */
export class VNavSimVarPublisher extends SimVarPublisher {
    /**
     * Create a NavComSimVarPublisher
     * @param bus The EventBus to publish to
     */
    constructor(bus) {
        super(VNavSimVarPublisher.simvars, bus);
    }
}
VNavSimVarPublisher.simvars = new Map([
    ['vnavVDev', { name: VNavSimVars.VerticalDeviation, type: SimVarValueType.Feet }],
    ['vnavTargetAlt', { name: VNavSimVars.TargetAltitude, type: SimVarValueType.Feet }],
    ['vnavPathMode', { name: VNavSimVars.PathMode, type: SimVarValueType.Number }],
    ['vnavMode', { name: VNavSimVars.VNAVMode, type: SimVarValueType.Number }],
    ['vnavApproachMode', { name: VNavSimVars.ApproachMode, type: SimVarValueType.Number }],
    ['vnavTodDistance', { name: VNavSimVars.TODDistance, type: SimVarValueType.Number }],
    ['vnavTodLegDistance', { name: VNavSimVars.TODDistanceInLeg, type: SimVarValueType.Number }],
    ['vnavTodLegIndex', { name: VNavSimVars.TODLegIndex, type: SimVarValueType.Number }],
    ['vnavBodLegIndex', { name: VNavSimVars.BODLegIndex, type: SimVarValueType.Number }],
    ['vnavConstraintLegIndex', { name: VNavSimVars.CurrentConstraintLegIndex, type: SimVarValueType.Number }],
    ['vnavConstraintAltitude', { name: VNavSimVars.CurrentConstraintAltitude, type: SimVarValueType.Feet }],
    ['vnavBodDistance', { name: VNavSimVars.BODDistance, type: SimVarValueType.Number }],
    ['vnavAltCaptureType', { name: VNavSimVars.CaptureType, type: SimVarValueType.Number }],
    ['vnavFpa', { name: VNavSimVars.FPA, type: SimVarValueType.FPM }],
    ['vnavLpvVDev', { name: VNavSimVars.LPVVerticalDeviation, type: SimVarValueType.Feet }],
    ['vnavLpvDistance', { name: VNavSimVars.LPVDistance, type: SimVarValueType.Number }],
    ['vnavRequiredVs', { name: VNavSimVars.RequiredVS, type: SimVarValueType.Number }]
]);
