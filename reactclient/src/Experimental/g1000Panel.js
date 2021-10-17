import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import { simActions } from '../Services/ActionProviders/simConnectActionHandler';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
    root:
    {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    wrapper: {
        backgroundColor: theme.palette.background,
        backgroundImage: `url(img/g1000/background2.png)`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100%',

        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        height: '100%'
    },
    panel: {
        width: '100%',
        touchAction: 'none'
    },
    button: {
        position: 'absolute',
        width: '4%',
        aspectRatio: 1.5
    },
    knob: {
        position: 'absolute',
        width: '5.5%',
        aspectRatio: 1
    },
    volKnob: {
        position: 'absolute',
        width: '3.5%',
        aspectRatio: 1
    },
    rangeKnob: {
        position: 'absolute',
        minWidth: '4.7%',
        aspectRatio: 1
    },
    iconButton: {
        width: '100%',
        height: '100%'
    },
    iconImage: {
        width: '100%',
        height: '100%' 
    }
}));

const G1000Panel = ({ functionDisplay }) => {
    const classes = useStyles();
    const [activeKnob, setActiveKnob] = useState();

    const handleOnClick = (action, knob = '') => {
        setActiveKnob(knob);

        if (action !== undefined)
            action();
    }

    return (
        <div className={classes.root}>
            <div className={classes.wrapper}>
                <div className={classes.panel}>
                    <div className={classes.volKnob} style={{ left: '4.5%', top: '4.7%' }}>
                        <IconButton
                            color='primary'
                            aria-label='VOL KNOB LEFT'
                            className={classes.iconButton}
                            component='span'
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].Volume.vol1Select, 'vol1')}
                            size="large">
                            <img className={classes.iconImage} src={activeKnob === 'vol1' ? 'img/g1000/knob_vol_hl.png' : 'img/g1000/knob_vol.png'} alt='knob_vol' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '7%', top: '11.5%' }}>
                        <IconButton
                            color='primary'
                            aria-label='NAV SWAP'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].NAV.swap)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_swap.png' alt='button_swap' />
                        </IconButton>
                    </div>
                    <div className={classes.knob} style={{ left: '3.5%', top: '18.7%' }}>
                        <IconButton
                            color='primary'
                            aria-label='NAV_RADIO KNOB'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].NAV.select, 'nav')}
                            size="large">
                            <img className={classes.iconImage} src={activeKnob === 'nav' ? 'img/g1000/knob_hl.png' : 'img/g1000/knob.png'} alt='knob' />
                        </IconButton>
                    </div>
                    <div className={classes.knob} style={{ left: '3.5%', top: '37.1%' }}>
                        <IconButton
                            color='primary'
                            aria-label='HDG KNOB'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.Autopilot.Heading.select, 'hdg')}
                            size="large">
                            <img className={classes.iconImage} src={activeKnob === 'hdg' ? 'img/g1000/knob_hdg_hl.png' : 'img/g1000/knob_hdg.png'} alt='knob_hdg' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '1.7%', top: '51.2%' }}>
                        <IconButton
                            color='primary'
                            aria-label='AP'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.Autopilot.apMaster)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_ap.png' alt='button_ap' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '1.7%', top: '56.4%' }}>
                        <IconButton
                            color='primary'
                            aria-label='HDG'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.Autopilot.Heading.hold)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_hdg.png' alt='button_hdg' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '1.7%', top: '61.8%' }}>
                        <IconButton
                            color='primary'
                            aria-label='NAV'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.Autopilot.nav)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_nav.png' alt='button_nav' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '1.7%', top: '67.4%' }}>
                        <IconButton
                            color='primary'
                            aria-label='APR'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.Autopilot.approach)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_apr.png' alt='button_apr' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '1.7%', top: '72.9%' }}>
                        <IconButton
                            color='primary'
                            aria-label='VS'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.Autopilot.VS.hold)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_vs.png' alt='button_vs' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '1.7%', top: '78.5%' }}>
                        <IconButton
                            color='primary'
                            aria-label='FLC'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.Autopilot.FLC.hold)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_flc.png' alt='button_flc' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '6.8%', top: '51.2%' }}>
                        <IconButton
                            color='primary'
                            aria-label='FD'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.Autopilot.flightDirector)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_fd.png' alt='button_fd' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '6.8%', top: '56.4%' }}>
                        <IconButton
                            color='primary'
                            aria-label='ALT'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.Autopilot.Altitude.hold)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_alt.png' alt='button_alt' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '6.8%', top: '61.8%' }}>
                        <IconButton
                            color='primary'
                            aria-label='VNV'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.Autopilot.vnav)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_vnv.png' alt='button_vnv' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '6.8%', top: '67.4%' }}>
                        <IconButton
                            color='primary'
                            aria-label='BC'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.Autopilot.backCourse)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_bc.png' alt='button_bc' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '6.8%', top: '72.9%' }}>
                        <IconButton
                            color='primary'
                            aria-label='NOSE UP'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.Autopilot.VS.increase)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_nose_up.png' alt='button_nose_up' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '6.8%', top: '78.5%' }}>
                        <IconButton
                            color='primary'
                            aria-label='NOSEDOWN'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.Autopilot.VS.decrease)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_nose_down.png' alt='button_nose_down' />
                        </IconButton>
                    </div>
                    <div className={classes.knob} style={{ left: '3.6%', top: '86.3%' }}>
                        <IconButton
                            color='primary'
                            aria-label='ALT KNOB'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.Autopilot.Altitude.select, 'alt')}
                            size="large">
                            <img className={classes.iconImage} src={activeKnob === 'alt' ? 'img/g1000/knob_hl.png' : 'img/g1000/knob.png'} alt='knob' />
                        </IconButton>
                    </div>


                    <div className={classes.volKnob} style={{ left: '92.1%', top: '4.7%' }}>
                        <IconButton
                            color='primary'
                            aria-label='VOL KNOB RIGHT'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].Volume.vol2Select, 'vol2')}
                            size="large">
                            <img className={classes.iconImage} src={activeKnob === 'vol2' ? 'img/g1000/knob_vol_hl.png' : 'img/g1000/knob_vol.png'} alt='knob_vol' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '89%', top: '11.5%' }}>
                        <IconButton
                            color='primary'
                            aria-label='COM SWAP'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].COM.swap)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_swap.png' alt='button_swap' />
                        </IconButton>
                    </div>
                    <div className={classes.knob} style={{ left: '91.1%', top: '18.7%' }}>
                        <IconButton
                            color='primary'
                            aria-label='COM KNOB'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].COM.select, 'com')}
                            size="large">
                            <img className={classes.iconImage} src={activeKnob === 'com' ? 'img/g1000/knob_hl.png' : 'img/g1000/knob.png'} alt='knob' />
                        </IconButton>
                    </div>
                    <div className={classes.knob} style={{ left: '91.1%', top: '36.7%' }}>
                        <IconButton
                            color='primary'
                            aria-label='CRS KNOB'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].CRS.select, 'crs')}
                            size="large">
                            <img className={classes.iconImage} src={activeKnob === 'crs' ? 'img/g1000/knob_crs_hl.png' : 'img/g1000/knob_crs.png'} alt='knob_crs' />
                        </IconButton>
                    </div>
                    <div className={classes.rangeKnob} style={{ left: '91.5%', top: '53.9%' }}>
                        <IconButton
                            color='primary'
                            aria-label='MAP RANGE KNOB'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].MAP.select, 'map')}
                            size="large">
                            <img className={classes.iconImage} src={activeKnob === 'map' ? 'img/g1000/knob_range_hl.png' : 'img/g1000/knob_range.png'} alt='knob_range' />
                        </IconButton>
                    </div>

                    <div className={classes.button} style={{ left: '89.2%', top: '67.6%' }}>
                        <IconButton
                            color='primary'
                            aria-label='DIR'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].Menu.directTo)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_dir.png' alt='button_dir' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '89.2%', top: '73%' }}>
                        <IconButton
                            color='primary'
                            aria-label='FPL'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].Menu.flightPlan)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_fpl.png' alt='button_fpl' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '89.2%', top: '78.6%' }}>
                        <IconButton
                            color='primary'
                            aria-label='CLR'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].Menu.clear)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_clr.png' alt='button_clr' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '94.3%', top: '67.6%' }}>
                        <IconButton
                            color='primary'
                            aria-label='MENU'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].Menu.menu)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_menu.png' alt='button_menu' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '94.3%', top: '73%' }}>
                        <IconButton
                            color='primary'
                            aria-label='PROC'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].Menu.procedure)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_proc.png' alt='button_proc' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '94.3%', top: '78.6%' }}>
                        <IconButton
                            color='primary'
                            aria-label='ENT'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].Menu.enter)}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_ent.png' alt='button_ent' />
                        </IconButton>
                    </div>
                    <div className={classes.knob} style={{ left: '90.9%', top: '86.4%' }}>
                        <IconButton
                            color='primary'
                            aria-label='FMS KNOB'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].FMS.select, 'fms')}
                            size="large">
                            <img className={classes.iconImage} src={activeKnob === 'fms' ? 'img/g1000/knob_hl.png' : 'img/g1000/knob.png'} alt='knob' />
                        </IconButton>
                    </div>


                    <div className={classes.button} style={{ left: '14.8%', top: '92.8%' }}>
                        <IconButton
                            color='primary'
                            aria-label='SOFTKEY_1'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].SoftKey.select(1))}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_softkey.png' alt='button_softkey' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '20.8%', top: '92.8%' }}>
                        <IconButton
                            color='primary'
                            aria-label='SOFTKEY_2'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].SoftKey.select(2))}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_softkey.png' alt='button_softkey' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '26.9%', top: '92.8%' }}>
                        <IconButton
                            color='primary'
                            aria-label='SOFTKEY_3'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].SoftKey.select(3))}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_softkey.png' alt='button_softkey' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '32.9%', top: '92.8%' }}>
                        <IconButton
                            color='primary'
                            aria-label='SOFTKEY_4'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].SoftKey.select(4))}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_softkey.png' alt='button_softkey' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '39%', top: '92.8%' }}>
                        <IconButton
                            color='primary'
                            aria-label='SOFTKEY_5'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].SoftKey.select(5))}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_softkey.png' alt='button_softkey' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '45.1%', top: '92.8%' }}>
                        <IconButton
                            color='primary'
                            aria-label='SOFTKEY_6'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].SoftKey.select(6))}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_softkey.png' alt='button_softkey' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '51.1%', top: '92.8%' }}>
                        <IconButton
                            color='primary'
                            aria-label='SOFTKEY_7'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].SoftKey.select(7))}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_softkey.png' alt='button_softkey' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '57.1%', top: '92.8%' }}>
                        <IconButton
                            color='primary'
                            aria-label='SOFTKEY_8'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].SoftKey.select(8))}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_softkey.png' alt='button_softkey' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '63.1%', top: '92.8%' }}>
                        <IconButton
                            color='primary'
                            aria-label='SOFTKEY_9'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].SoftKey.select(9))}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_softkey.png' alt='button_softkey' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '69.1%', top: '92.8%' }}>
                        <IconButton
                            color='primary'
                            aria-label='SOFTKEY_10'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].SoftKey.select(10))}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_softkey.png' alt='button_softkey' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '75.2%', top: '92.8%' }}>
                        <IconButton
                            color='primary'
                            aria-label='SOFTKEY_11'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].SoftKey.select(11))}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_softkey.png' alt='button_softkey' />
                        </IconButton>
                    </div>
                    <div className={classes.button} style={{ left: '81.2%', top: '92.8%' }}>
                        <IconButton
                            color='primary'
                            aria-label='SOFTKEY_12'
                            component='span'
                            className={classes.iconButton}
                            onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[functionDisplay].SoftKey.select(12))}
                            size="large">
                            <img className={classes.iconImage} src='img/g1000/button_softkey.png' alt='button_softkey' />
                        </IconButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default G1000Panel;