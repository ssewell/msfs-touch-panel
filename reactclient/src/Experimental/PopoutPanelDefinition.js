import { simActions } from '../Services/ActionProviders/simConnectActionHandler';

export const G1000NXI_PFD_DEF = [
    { id: 'btn_vol1knob', action: simActions.ProfileSpecific.G1000NXi.PFD.Volume.vol1Select, classes: ['knobBase', 'volKnob'], image: 'knob_vol.png', left: 60, top: 41 },
    { id: 'btn_navswap', action: simActions.ProfileSpecific.G1000NXi.PFD.NAV.swap, classes: ['buttonBase'], image: 'button_swap.png', left: 97, top: 104 },
    { id: 'btn_navknob', action: simActions.ProfileSpecific.G1000NXi.PFD.NAV.select, classes: ['knobBase', 'regularKnob'], image: 'knob.png', left: 46, top: 171 },
    { id: 'btn_hdgknob', action: simActions.ProfileSpecific.G1000NXi.PFD.HEADING.select, classes: ['knobBase', 'regularKnob'], image: 'knob_hdg.png', left: 46, top: 338 },
    { id: 'btn_ap', action: simActions.Autopilot.apMaster, classes: ['buttonBase'], image: 'button_ap.png', left: 22, top: 467 },
    { id: 'btn_hdg', action: simActions.Autopilot.Heading.hold, classes: ['buttonBase'], image: 'button_hdg.png', left: 22, top: 518 },
    { id: 'btn_nav', action: simActions.Autopilot.nav, classes: ['buttonBase'], image: 'button_nav.png', left: 22, top: 568 },
    { id: 'btn_apr', action: simActions.Autopilot.approach, classes: ['buttonBase'], image: 'button_apr.png', left: 22, top: 618 },
    { id: 'btn_vs', action: simActions.Autopilot.VS.hold, classes: ['buttonBase'], image: 'button_vs.png', left: 22, top: 668 },
    { id: 'btn_flc', action: simActions.Autopilot.FLC.hold, classes: ['buttonBase'], image: 'button_flc.png', left: 22, top: 718 },
    { id: 'btn_fd', action: simActions.Autopilot.flightDirector, classes: ['buttonBase'], image: 'button_fd.png', left: 94, top: 467 },
    { id: 'btn_alt', action: simActions.Autopilot.Altitude.hold, classes: ['buttonBase'], image: 'button_alt.png', left: 94, top: 518 },
    { id: 'btn_vnv', action: simActions.Autopilot.vnav, classes: ['buttonBase'], image: 'button_vnv.png', left: 94, top: 568 },
    { id: 'btn_bc', action: simActions.Autopilot.backCourse, classes: ['buttonBase'], image: 'button_bc.png', left: 94, top: 618 },
    { id: 'btn_nose_up', 
        action: [{element: 'btn_vs', action: simActions.Autopilot.VS.increase}, 
                {element: 'btn_flc', action: simActions.Autopilot.FLC.decrease}],
        classes: ['buttonBase'], image: 'button_nose_up.png', left: 94, top: 668 },
    { id: 'btn_nose_down',
        action: [{element: 'btn_vs', action: simActions.Autopilot.VS.decrease}, 
                {element: 'btn_flc', action: simActions.Autopilot.FLC.increase}],
        classes: ['buttonBase'], image: 'button_nose_down.png', left: 94, top: 718 },
    { id: 'btn_altknob', action: simActions.Autopilot.Altitude.select, classes: ['knobBase', 'regularKnob'], image: 'knob.png', left: 46.5, top: 790 },

    { id: 'btn_vol2knob', action: simActions.ProfileSpecific.G1000NXi.PFD.Volume.vol2Select, classes: ['knobBase', 'volKnob'], image: 'knob_vol.png', left: 1296, top: 41 },
    { id: 'btn_comswap', action: simActions.ProfileSpecific.G1000NXi.PFD.COM.swap, classes: ['buttonBase'], image: 'button_swap.png', left: 1253, top: 104 },
    { id: 'btn_comknob', action: simActions.ProfileSpecific.G1000NXi.PFD.COM.select, classes: ['knobBase', 'regularKnob'], image: 'knob.png', left: 1282, top: 170 },
    { id: 'btn_crsknob', action: simActions.ProfileSpecific.G1000NXi.PFD.CRS.select, classes: ['knobBase', 'crsKnob'], image: 'knob_crs.png', left: 1282, top: 334 },
    { id: 'btn_rangeknob', action: simActions.ProfileSpecific.G1000NXi.PFD.MAP.select, classes: ['knobBase', 'rangeKnob'], image: 'knob_range.png', left: 1288, top: 492 },
    { id: 'btn_dir', action: simActions.ProfileSpecific.G1000NXi.PFD.Menu.directTo, classes: ['buttonBase'], image: 'button_dir.png', left: 1256, top: 617 },
    { id: 'btn_fpl', action: simActions.ProfileSpecific.G1000NXi.PFD.Menu.flightPlan, classes: ['buttonBase'], image: 'button_fpl.png', left: 1256, top: 670 },
    { id: 'btn_clr', action: simActions.ProfileSpecific.G1000NXi.PFD.Menu.clear, classes: ['buttonBase'], image: 'button_clr.png', left: 1256, top: 722 },
    { id: 'btn_menu', action: simActions.ProfileSpecific.G1000NXi.PFD.Menu.menu, classes: ['buttonBase'], image: 'button_menu.png', left: 1328, top: 617 },
    { id: 'btn_proc', action: simActions.ProfileSpecific.G1000NXi.PFD.Menu.procedure, classes: ['buttonBase'], image: 'button_proc.png', left: 1328, top: 670 },
    { id: 'btn_ent', action: simActions.ProfileSpecific.G1000NXi.PFD.Menu.enter, classes: ['buttonBase'], image: 'button_ent.png', left: 1328, top: 722 },
    { id: 'btn_fmsknob', action: simActions.ProfileSpecific.G1000NXi.PFD.FMS.select, classes: ['knobBase', 'regularKnob'], image: 'knob.png', left: 1281, top: 790 },

    { id: 'btn_softkey_1', action: () => simActions.ProfileSpecific.G1000NXi.PFD.SoftKey.select(1), classes: ['buttonBase'], image: 'button_softkey.png', left: 207, top: 848 },
    { id: 'btn_softkey_2', action: () => simActions.ProfileSpecific.G1000NXi.PFD.SoftKey.select(2), classes: ['buttonBase'], image: 'button_softkey.png', left: 292, top: 848 },
    { id: 'btn_softkey_3', action: () => simActions.ProfileSpecific.G1000NXi.PFD.SoftKey.select(3), classes: ['buttonBase'], image: 'button_softkey.png', left: 377, top: 848 },
    { id: 'btn_softkey_4', action: () => simActions.ProfileSpecific.G1000NXi.PFD.SoftKey.select(4), classes: ['buttonBase'], image: 'button_softkey.png', left: 462, top: 848 },
    { id: 'btn_softkey_5', action: () => simActions.ProfileSpecific.G1000NXi.PFD.SoftKey.select(5), classes: ['buttonBase'], image: 'button_softkey.png', left: 547, top: 848 },
    { id: 'btn_softkey_6', action: () => simActions.ProfileSpecific.G1000NXi.PFD.SoftKey.select(6), classes: ['buttonBase'], image: 'button_softkey.png', left: 632, top: 848 },
    { id: 'btn_softkey_7', action: () => simActions.ProfileSpecific.G1000NXi.PFD.SoftKey.select(7), classes: ['buttonBase'], image: 'button_softkey.png', left: 717, top: 848 },
    { id: 'btn_softkey_8', action: () => simActions.ProfileSpecific.G1000NXi.PFD.SoftKey.select(8), classes: ['buttonBase'], image: 'button_softkey.png', left: 802, top: 848 },
    { id: 'btn_softkey_9', action: () => simActions.ProfileSpecific.G1000NXi.PFD.SoftKey.select(9), classes: ['buttonBase'], image: 'button_softkey.png', left: 888, top: 848 },
    { id: 'btn_softkey_10', action: () => simActions.ProfileSpecific.G1000NXi.PFD.SoftKey.select(10), classes: ['buttonBase'], image: 'button_softkey.png', left: 973, top: 848 },
    { id: 'btn_softkey_11', action: () => simActions.ProfileSpecific.G1000NXi.PFD.SoftKey.select(11), classes: ['buttonBase'], image: 'button_softkey.png', left: 1058, top: 848 },
    { id: 'btn_softkey_12', action: () => simActions.ProfileSpecific.G1000NXi.PFD.SoftKey.select(12), classes: ['buttonBase'], image: 'button_softkey.png', left: 1142, top: 848 },
]

export const G1000NXI_MFD_DEF = [
    { id: 'btn_vol1knob', action: simActions.ProfileSpecific.G1000NXi.MFD.Volume.vol1Select, classes: ['knobBase', 'volKnob'], image: 'knob_vol.png', left: 60, top: 41 },
    { id: 'btn_navswap', action: simActions.ProfileSpecific.G1000NXi.MFD.NAV.swap, classes: ['buttonBase'], image: 'button_swap.png', left: 97, top: 104 },
    { id: 'btn_navknob', action: simActions.ProfileSpecific.G1000NXi.MFD.NAV.select, classes: ['knobBase', 'regularKnob'], image: 'knob.png', left: 46, top: 171 },
    { id: 'btn_hdgknob', action: simActions.ProfileSpecific.G1000NXi.MFD.HEADING.select, classes: ['knobBase', 'regularKnob'], image: 'knob_hdg.png', left: 46, top: 338 },
    { id: 'btn_ap', action: simActions.Autopilot.apMaster, classes: ['buttonBase'], image: 'button_ap.png', left: 22, top: 467 },
    { id: 'btn_hdg', action: simActions.Autopilot.Heading.hold, classes: ['buttonBase'], image: 'button_hdg.png', left: 22, top: 518 },
    { id: 'btn_nav', action: simActions.Autopilot.nav, classes: ['buttonBase'], image: 'button_nav.png', left: 22, top: 568 },
    { id: 'btn_apr', action: simActions.Autopilot.approach, classes: ['buttonBase'], image: 'button_apr.png', left: 22, top: 618 },
    { id: 'btn_vs', action: simActions.Autopilot.VS.hold, classes: ['buttonBase'], image: 'button_vs.png', left: 22, top: 668 },
    { id: 'btn_flc', action: simActions.Autopilot.FLC.hold, classes: ['buttonBase'], image: 'button_flc.png', left: 22, top: 718 },
    { id: 'btn_fd', action: simActions.Autopilot.flightDirector, classes: ['buttonBase'], image: 'button_fd.png', left: 94, top: 467 },
    { id: 'btn_alt', action: simActions.Autopilot.Altitude.hold, classes: ['buttonBase'], image: 'button_alt.png', left: 94, top: 518 },
    { id: 'btn_vnv', action: simActions.Autopilot.vnav, classes: ['buttonBase'], image: 'button_vnv.png', left: 94, top: 568 },
    { id: 'btn_bc', action: simActions.Autopilot.backCourse, classes: ['buttonBase'], image: 'button_bc.png', left: 94, top: 618 },
    { id: 'btn_nose_up', 
        action: [{element: 'btn_vs', action: simActions.Autopilot.VS.increase}, 
                {element: 'btn_flc', action: simActions.Autopilot.FLC.decrease}],
        classes: ['buttonBase'], image: 'button_nose_up.png', left: 94, top: 668 },
    { id: 'btn_nose_down',
        action: [{element: 'btn_vs', action: simActions.Autopilot.VS.decrease}, 
                {element: 'btn_flc', action: simActions.Autopilot.FLC.increase}],
        classes: ['buttonBase'], image: 'button_nose_down.png', left: 94, top: 718 },
    { id: 'btn_altknob', action: simActions.Autopilot.Altitude.select, classes: ['knobBase', 'regularKnob'], image: 'knob.png', left: 46.5, top: 790 },

    { id: 'btn_vol2knob', action: simActions.ProfileSpecific.G1000NXi.MFD.Volume.vol2Select, classes: ['knobBase', 'volKnob'], image: 'knob_vol.png', left: 1296, top: 41 },
    { id: 'btn_comswap', action: simActions.ProfileSpecific.G1000NXi.MFD.COM.swap, classes: ['buttonBase'], image: 'button_swap.png', left: 1253, top: 104 },
    { id: 'btn_comknob', action: simActions.ProfileSpecific.G1000NXi.MFD.COM.select, classes: ['knobBase', 'regularKnob'], image: 'knob.png', left: 1282, top: 170 },
    { id: 'btn_crsknob', action: simActions.ProfileSpecific.G1000NXi.MFD.CRS.select, classes: ['knobBase', 'crsKnob'], image: 'knob_crs.png', left: 1282, top: 334 },
    { id: 'btn_rangeknob', action: simActions.ProfileSpecific.G1000NXi.MFD.MAP.select, classes: ['knobBase', 'rangeKnob'], image: 'knob_range.png', left: 1288, top: 492 },
    { id: 'btn_dir', action: simActions.ProfileSpecific.G1000NXi.MFD.Menu.directTo, classes: ['buttonBase'], image: 'button_dir.png', left: 1256, top: 617 },
    { id: 'btn_fpl', action: simActions.ProfileSpecific.G1000NXi.MFD.Menu.flightPlan, classes: ['buttonBase'], image: 'button_fpl.png', left: 1256, top: 670 },
    { id: 'btn_clr', action: simActions.ProfileSpecific.G1000NXi.MFD.Menu.clear, classes: ['buttonBase'], image: 'button_clr.png', left: 1256, top: 722 },
    { id: 'btn_menu', action: simActions.ProfileSpecific.G1000NXi.MFD.Menu.menu, classes: ['buttonBase'], image: 'button_menu.png', left: 1328, top: 617 },
    { id: 'btn_proc', action: simActions.ProfileSpecific.G1000NXi.MFD.Menu.procedure, classes: ['buttonBase'], image: 'button_proc.png', left: 1328, top: 670 },
    { id: 'btn_ent', action: simActions.ProfileSpecific.G1000NXi.MFD.Menu.enter, classes: ['buttonBase'], image: 'button_ent.png', left: 1328, top: 722 },
    { id: 'btn_fmsknob', action: simActions.ProfileSpecific.G1000NXi.MFD.FMS.select, classes: ['knobBase', 'regularKnob'], image: 'knob.png', left: 1281, top: 790 },

    { id: 'btn_softkey_1', action: () => simActions.ProfileSpecific.G1000NXi.MFD.SoftKey.select(1), classes: ['buttonBase'], image: 'button_softkey.png', left: 207, top: 848 },
    { id: 'btn_softkey_2', action: () => simActions.ProfileSpecific.G1000NXi.MFD.SoftKey.select(2), classes: ['buttonBase'], image: 'button_softkey.png', left: 292, top: 848 },
    { id: 'btn_softkey_3', action: () => simActions.ProfileSpecific.G1000NXi.MFD.SoftKey.select(3), classes: ['buttonBase'], image: 'button_softkey.png', left: 377, top: 848 },
    { id: 'btn_softkey_4', action: () => simActions.ProfileSpecific.G1000NXi.MFD.SoftKey.select(4), classes: ['buttonBase'], image: 'button_softkey.png', left: 462, top: 848 },
    { id: 'btn_softkey_5', action: () => simActions.ProfileSpecific.G1000NXi.MFD.SoftKey.select(5), classes: ['buttonBase'], image: 'button_softkey.png', left: 547, top: 848 },
    { id: 'btn_softkey_6', action: () => simActions.ProfileSpecific.G1000NXi.MFD.SoftKey.select(6), classes: ['buttonBase'], image: 'button_softkey.png', left: 632, top: 848 },
    { id: 'btn_softkey_7', action: () => simActions.ProfileSpecific.G1000NXi.MFD.SoftKey.select(7), classes: ['buttonBase'], image: 'button_softkey.png', left: 717, top: 848 },
    { id: 'btn_softkey_8', action: () => simActions.ProfileSpecific.G1000NXi.MFD.SoftKey.select(8), classes: ['buttonBase'], image: 'button_softkey.png', left: 802, top: 848 },
    { id: 'btn_softkey_9', action: () => simActions.ProfileSpecific.G1000NXi.MFD.SoftKey.select(9), classes: ['buttonBase'], image: 'button_softkey.png', left: 888, top: 848 },
    { id: 'btn_softkey_10', action: () => simActions.ProfileSpecific.G1000NXi.MFD.SoftKey.select(10), classes: ['buttonBase'], image: 'button_softkey.png', left: 973, top: 848 },
    { id: 'btn_softkey_11', action: () => simActions.ProfileSpecific.G1000NXi.MFD.SoftKey.select(11), classes: ['buttonBase'], image: 'button_softkey.png', left: 1058, top: 848 },
    { id: 'btn_softkey_12', action: () => simActions.ProfileSpecific.G1000NXi.MFD.SoftKey.select(12), classes: ['buttonBase'], image: 'button_softkey.png', left: 1142, top: 848 },
]

export const FBWA32NX_CDU_DEF = [
    { id: 'btn_selectleft1', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('L1'), classes: ['selectButtonBase'], image: 'cdu/button_select.png', left: 14, top: 89 },
    { id: 'btn_selectleft2', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('L2'), classes: ['selectButtonBase'], image: 'cdu/button_select.png', left: 14, top: 125 },
    { id: 'btn_selectleft3', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('L3'), classes: ['selectButtonBase'], image: 'cdu/button_select.png', left: 14, top: 161 },
    { id: 'btn_selectleft4', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('L4'), classes: ['selectButtonBase'], image: 'cdu/button_select.png', left: 14, top: 196 },
    { id: 'btn_selectleft5', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('L5'), classes: ['selectButtonBase'], image: 'cdu/button_select.png', left: 14, top: 231 },
    { id: 'btn_selectleft6', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('L6'), classes: ['selectButtonBase'], image: 'cdu/button_select.png', left: 14, top: 268 },
    { id: 'btn_selectright1', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('R1'), classes: ['selectButtonBase'], image: 'cdu/button_select.png', left: 401, top: 89 },
    { id: 'btn_selectright2', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('R2'), classes: ['selectButtonBase'], image: 'cdu/button_select.png', left: 401, top: 125 },
    { id: 'btn_selectright3', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('R3'), classes: ['selectButtonBase'], image: 'cdu/button_select.png', left: 401, top: 161 },
    { id: 'btn_selectright4', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('R4'), classes: ['selectButtonBase'], image: 'cdu/button_select.png', left: 401, top: 196 },
    { id: 'btn_selectright5', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('R5'), classes: ['selectButtonBase'], image: 'cdu/button_select.png', left: 401, top: 231 },
    { id: 'btn_selectright6', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('R6'), classes: ['selectButtonBase'], image: 'cdu/button_select.png', left: 401, top: 268 },

    { id: 'btn_dir', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('DIR'), classes: ['rectangleButtonBase'], image: 'cdu/button_dir.png', left: 53, top: 329 },
    { id: 'btn_prog', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('PROG'), classes: ['rectangleButtonBase'], image: 'cdu/button_prog.png', left: 103, top: 329 },
    { id: 'btn_perf', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('PERF'), classes: ['rectangleButtonBase'], image: 'cdu/button_perf.png', left: 153, top: 329 },
    { id: 'btn_init', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('INIT'), classes: ['rectangleButtonBase'], image: 'cdu/button_int.png', left: 203, top: 329 },
    { id: 'btn_data', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('DATA'), classes: ['rectangleButtonBase'], image: 'cdu/button_data.png', left: 253, top: 329 },
    { id: 'btn_blank1', action: null, classes: ['rectangleButtonBase'], image: 'cdu/button_blank.png', left: 303, top: 329 },
    { id: 'btn_fpln', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('FPLN'), classes: ['rectangleButtonBase'], image: 'cdu/button_fpln.png', left: 53, top: 363 },
    { id: 'btn_radnav', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('RAD'), classes: ['rectangleButtonBase'], image: 'cdu/button_radnav.png', left: 103, top: 363 },
    { id: 'btn_fuelpred', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('FUEL'), classes: ['rectangleButtonBase'], image: 'cdu/button_fuelpred.png', left: 153, top: 363 },
    { id: 'btn_secfpln', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('SEC'), classes: ['rectangleButtonBase'], image: 'cdu/button_secfpln.png', left: 203, top: 363 },
    { id: 'btn_atcomm', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('ATC'), classes: ['rectangleButtonBase'], image: 'cdu/button_atccomm.png', left: 253, top: 363 },
    { id: 'btn_mcdumenu', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('MENU'), classes: ['rectangleButtonBase'], image: 'cdu/button_mcdumenu.png', left: 303, top: 363 },
    { id: 'btn_airport', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('AIRPORT'), classes: ['rectangleButtonBase'], image: 'cdu/button_airport.png', left: 53, top: 400 },
    { id: 'btn_blank2', action: null, classes: ['rectangleButtonBase'], image: 'cdu/button_blank.png', left: 103, top: 400 },
    { id: 'btn_arrowleft', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('PREVPAGE'), classes: ['rectangleButtonBase'], image: 'cdu/button_arrowleft.png', left: 53, top: 437 },
    { id: 'btn_arrowright', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('NEXTPAGE'), classes: ['rectangleButtonBase'], image: 'cdu/button_arrowright.png', left: 53, top: 474 },
    { id: 'btn_arrowup', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('UP'), classes: ['rectangleButtonBase'], image: 'cdu/button_arrowup.png', left: 103, top: 437 },
    { id: 'btn_arrowdown', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('DOWN'), classes: ['rectangleButtonBase'], image: 'cdu/button_arrowdown.png', left: 103, top: 474 },
    { id: 'btn_bright', action: () => null, classes: ['brightdimButtonBase'], image: 'cdu/button_bright.png', left: 368, top: 327 },
    { id: 'btn_dim', action: () => null, classes: ['brightdimButtonBase'], image: 'cdu/button_dim.png', left: 368, top: 363 },

    { id: 'btn_1', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('1'), classes: ['squareButtonBase'], image: 'cdu/button_1.png', left: 53, top: 521 },
    { id: 'btn_2', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('2'), classes: ['squareButtonBase'], image: 'cdu/button_2.png', left: 99, top: 521 },
    { id: 'btn_3', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('3'), classes: ['squareButtonBase'], image: 'cdu/button_3.png', left: 142, top: 521 },
    { id: 'btn_4', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('4'), classes: ['squareButtonBase'], image: 'cdu/button_4.png', left: 53, top: 556 },
    { id: 'btn_5', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('5'), classes: ['squareButtonBase'], image: 'cdu/button_5.png', left: 99, top: 556 },
    { id: 'btn_6', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('6'), classes: ['squareButtonBase'], image: 'cdu/button_6.png', left: 142, top: 556 },
    { id: 'btn_7', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('7'), classes: ['squareButtonBase'], image: 'cdu/button_7.png', left: 53, top: 591 },
    { id: 'btn_8', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('8'), classes: ['squareButtonBase'], image: 'cdu/button_8.png', left: 99, top: 591 },
    { id: 'btn_9', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('9'), classes: ['squareButtonBase'], image: 'cdu/button_9.png', left: 142, top: 591 },
    { id: 'btn_dot', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('DOT'), classes: ['squareButtonBase'], image: 'cdu/button_period.png', left: 53, top: 624 },
    { id: 'btn_0', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('0'), classes: ['squareButtonBase'], image: 'cdu/button_0.png', left: 99, top: 624 },
    { id: 'btn_plusminus', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('PLUSMINUS'), classes: ['squareButtonBase'], image: 'cdu/button_plusminus.png', left: 142, top: 624 },

    { id: 'btn_a', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('A'), classes: ['squareButtonBase'], image: 'cdu/button_a.png', left: 186, top: 420 },
    { id: 'btn_b', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('B'), classes: ['squareButtonBase'], image: 'cdu/button_b.png', left: 228, top: 420 },
    { id: 'btn_c', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('C'), classes: ['squareButtonBase'], image: 'cdu/button_c.png', left: 271, top: 420 },
    { id: 'btn_d', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('D'), classes: ['squareButtonBase'], image: 'cdu/button_d.png', left: 313, top: 420 },
    { id: 'btn_e', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('E'), classes: ['squareButtonBase'], image: 'cdu/button_e.png', left: 356, top: 420 },
    { id: 'btn_f', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('F'), classes: ['squareButtonBase'], image: 'cdu/button_f.png', left: 186, top: 461 },
    { id: 'btn_g', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('G'), classes: ['squareButtonBase'], image: 'cdu/button_g.png', left: 228, top: 461 },
    { id: 'btn_h', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('H'), classes: ['squareButtonBase'], image: 'cdu/button_h.png', left: 271, top: 461 },
    { id: 'btn_i', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('I'), classes: ['squareButtonBase'], image: 'cdu/button_i.png', left: 313, top: 461 },
    { id: 'btn_j', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('J'), classes: ['squareButtonBase'], image: 'cdu/button_j.png', left: 356, top: 461 },
    { id: 'btn_k', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('K'), classes: ['squareButtonBase'], image: 'cdu/button_k.png', left: 186, top: 502 },
    { id: 'btn_l', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('L'), classes: ['squareButtonBase'], image: 'cdu/button_l.png', left: 228, top: 502 },
    { id: 'btn_m', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('M'), classes: ['squareButtonBase'], image: 'cdu/button_m.png', left: 271, top: 502 },
    { id: 'btn_n', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('N'), classes: ['squareButtonBase'], image: 'cdu/button_n.png', left: 313, top: 502 },
    { id: 'btn_o', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('O'), classes: ['squareButtonBase'], image: 'cdu/button_o.png', left: 356, top: 502 },
    { id: 'btn_p', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('P'), classes: ['squareButtonBase'], image: 'cdu/button_p.png', left: 186, top: 543 },
    { id: 'btn_q', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('Q'), classes: ['squareButtonBase'], image: 'cdu/button_q.png', left: 228, top: 543 },
    { id: 'btn_r', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('R'), classes: ['squareButtonBase'], image: 'cdu/button_r.png', left: 271, top: 543 },
    { id: 'btn_s', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('S'), classes: ['squareButtonBase'], image: 'cdu/button_s.png', left: 313, top: 543 },
    { id: 'btn_t', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('T'), classes: ['squareButtonBase'], image: 'cdu/button_t.png', left: 356, top: 543 },
    { id: 'btn_u', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('U'), classes: ['squareButtonBase'], image: 'cdu/button_u.png', left: 186, top: 583 },
    { id: 'btn_v', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('V'), classes: ['squareButtonBase'], image: 'cdu/button_v.png', left: 228, top: 583 },
    { id: 'btn_w', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('W'), classes: ['squareButtonBase'], image: 'cdu/button_w.png', left: 271, top: 583 },
    { id: 'btn_x', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('X'), classes: ['squareButtonBase'], image: 'cdu/button_x.png', left: 313, top: 583 },
    { id: 'btn_y', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('Y'), classes: ['squareButtonBase'], image: 'cdu/button_y.png', left: 356, top: 583 },
    { id: 'btn_z', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('Z'), classes: ['squareButtonBase'], image: 'cdu/button_z.png', left: 186, top: 623 },
    { id: 'btn_slash', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('DIV'), classes: ['squareButtonBase'], image: 'cdu/button_slash.png', left: 228, top: 623 },
    { id: 'btn_sp', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('SP'), classes: ['squareButtonBase'], image: 'cdu/button_sp.png', left: 271, top: 623 },
    { id: 'btn_ovfy', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('OVFY'), classes: ['squareButtonBase'], image: 'cdu/button_ovfy.png', left: 313, top: 623 },
    { id: 'btn_clr', action: () => simActions.ProfileSpecific.A320.MCDU.buttonSelect('CLR'), classes: ['squareButtonBase'], image: 'cdu/button_clr.png', left: 356, top: 623 }
]