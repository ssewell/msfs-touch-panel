import { SimVarPublisher } from 'msfssdk/instruments';
import { SimVarValueType } from 'msfssdk/data';
export var LNavVars;
(function (LNavVars) {
    /** The name of the LVar used to publish the current dtk (magnetic). */
    LNavVars["DTK"] = "L:WT1000_LNav_DTK_Mag";
    /** The name of the LVar used to publish the current xtk. */
    LNavVars["XTK"] = "L:WT1000_LNav_XTK";
    /** The name of the LVar used to publish the next dtk (magnetic). */
    LNavVars["NextDTK"] = "L:WT1000_LNav_Next_DTK_Mag";
    /** The name of the LVar used to publish the next xtk. */
    LNavVars["NextXTK"] = "L:WT1000_LNav_Next_XTK";
    /** The name of the LVar used to publish the bearing (magnetic) to the current waypoint. */
    LNavVars["Bearing"] = "L:WT1000_LNav_BRG_Mag";
    /** The name of the LVar used to publish the distance to the current waypoint. */
    LNavVars["Distance"] = "L:WT1000_LNav_DIS";
    /** The name of the LVar used to publish the distance to the current waypoint. */
    LNavVars["DistanceToTurn"] = "L:WT1000_LNav_DIS_Turn";
    /** Whether or not the LNAV is in a leg-to-leg turn. */
    LNavVars["IsTurning"] = "L:WT1000_LNav_IsTurning";
    /** The current max CDI deflection, in NM. */
    LNavVars["CDIScale"] = "L:WT1000_CDI_Scale";
    /** The current value of the CDI scale label enum. */
    LNavVars["CDIScaleLabel"] = "L:WT1000_CDI_Scale_Label";
    /** The current index of the vector LNAV is tracking. */
    LNavVars["CurrentVector"] = "L:WT1000_LNav_Current_Vector";
    /** The current calculated Distance to the Destination. */
    LNavVars["DistanceToDestination"] = "L:WT1000_LNav_Destination_Dis";
})(LNavVars || (LNavVars = {}));
/**
 * Valid CDI scale labels for the LVar scale enum.
 */
export var CDIScaleLabel;
(function (CDIScaleLabel) {
    CDIScaleLabel[CDIScaleLabel["Departure"] = 0] = "Departure";
    CDIScaleLabel[CDIScaleLabel["Terminal"] = 1] = "Terminal";
    CDIScaleLabel[CDIScaleLabel["Enroute"] = 2] = "Enroute";
    CDIScaleLabel[CDIScaleLabel["Oceanic"] = 3] = "Oceanic";
    CDIScaleLabel[CDIScaleLabel["LNav"] = 4] = "LNav";
    CDIScaleLabel[CDIScaleLabel["LNavPlusV"] = 5] = "LNavPlusV";
    CDIScaleLabel[CDIScaleLabel["Visual"] = 6] = "Visual";
    CDIScaleLabel[CDIScaleLabel["LNavVNav"] = 7] = "LNavVNav";
    CDIScaleLabel[CDIScaleLabel["LP"] = 8] = "LP";
    CDIScaleLabel[CDIScaleLabel["LPPlusV"] = 9] = "LPPlusV";
    CDIScaleLabel[CDIScaleLabel["LPV"] = 10] = "LPV";
    CDIScaleLabel[CDIScaleLabel["MissedApproach"] = 11] = "MissedApproach";
})(CDIScaleLabel || (CDIScaleLabel = {}));
/** A publisher to poll and publish nav/com simvars. */
export class LNavSimVarPublisher extends SimVarPublisher {
    /**
     * Create a NavComSimVarPublisher
     * @param bus The EventBus to publish to
     */
    constructor(bus) {
        super(LNavSimVarPublisher.simvars, bus);
    }
}
LNavSimVarPublisher.simvars = new Map([
    ['lnavBrgMag', { name: LNavVars.Bearing, type: SimVarValueType.Degree }],
    ['lnavDis', { name: LNavVars.Distance, type: SimVarValueType.NM }],
    ['lnavDisTurn', { name: LNavVars.DistanceToTurn, type: SimVarValueType.NM }],
    ['lnavDtkMag', { name: LNavVars.DTK, type: SimVarValueType.Degree }],
    ['lnavXtk', { name: LNavVars.XTK, type: SimVarValueType.NM }],
    ['lnavNextDtkMag', { name: LNavVars.NextDTK, type: SimVarValueType.Degree }],
    ['lnavNextXtkMag', { name: LNavVars.NextXTK, type: SimVarValueType.NM }],
    ['lnavCdiScaling', { name: LNavVars.CDIScale, type: SimVarValueType.NM }],
    ['lnavCdiScalingLabel', { name: LNavVars.CDIScaleLabel, type: SimVarValueType.Number }],
    ['lnavCurrentVector', { name: LNavVars.CurrentVector, type: SimVarValueType.Number }],
    ['lnavDistanceToDestination', { name: LNavVars.DistanceToDestination, type: SimVarValueType.NM }],
]);
