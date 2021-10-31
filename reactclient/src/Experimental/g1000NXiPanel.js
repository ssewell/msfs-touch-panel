import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import { simActions } from '../Services/ActionProviders/simConnectActionHandler';
import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';

const useStyles = makeStyles((theme) => ({
    root:
    {
        position: 'relative',
        backgroundColor: theme.palette.background,
        backgroundImage: `url(/img/g1000/backgroundmfd.png)`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        height: '100%',
        touchAction: 'none',
        zIndex: 1003
    },
    panelSwitch : {
        position: 'absolute',
        left: '95%', 
        top: '0.5%', 
        minHeight: '0.8em', 
        minWidth: '4em', 
        padding: '0.3em'
    },
    panel: {
        width: '100%',
        touchAction: 'none',
        zIndex: 1003
    },
    iframePanel: {
        position: 'absolute',
        top: '4.9%',
        left: '13.3%',
        width: '73.2%',
        aspectRatio: '1024/768',
        border: '0',
        backgroundColor: 'black',
    },
    iframe: {
        width: '100%',
        height: '100%',
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
    },

}));

const imagePath = '/img/g1000/';

const G1000NXiPanel = ({panel, frameonly}) => {

    const classes = useStyles();
    const [activeKnob, setActiveKnob] = useState();
    const [activePanel, setActivePanel] = useState(panel);
    
    const handleOnClick = (action, knob = '') => {
        if(knob !== '')
            setActiveKnob(knob);
        
        if (action !== undefined && action !== null)
            action();
    }

    const handlePanelSwitch = () => {
        setActivePanel(activePanel === 'PFD' ? 'MFD' : 'PFD');
    }

    return (
        <div className={classes.root}>
            { !frameonly && 
                <div className={classes.iframePanel}>
                    <iframe title='iframePanel' className={classes.iframe} src={'/assets/webpanel.html?planetype=g1000nxi&panel=' + activePanel} frameBorder="0"></iframe>
                </div> 
            }
            <Button className={classes.panelSwitch} variant="contained" size='small' color='primary' onClick={() => handlePanelSwitch()}>{activePanel}</Button>
            <div className={classes.volKnob} style={{ left: '4.3%', top: '4.6%' }}>
                <IconButton
                    color='primary'
                    aria-label='VOL KNOB LEFT'
                    className={classes.iconButton}
                    component='span'
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].Volume.vol1Select, 'vol1')}
                    size="large">
                    { activeKnob === 'vol1' && <img className={classes.iconImage} src={`${imagePath}knob_vol_hl.png`} alt='knob' />}
                    { activeKnob !== 'vol1' && <img className={classes.iconImage} src={`${imagePath}knob_vol.png`} alt='knob' />}
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '6.9%', top: '11.1%' }}>
                <IconButton
                    color='primary'
                    aria-label='NAV SWAP'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].NAV.swap)}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_swap.png`} alt='button_swap' />
                </IconButton>
            </div>
            <div className={classes.knob} style={{ left: '3.3%', top: '18.6%' }}>
                <IconButton
                    color='primary'
                    aria-label='NAV_RADIO KNOB'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].NAV.select, 'nav')}
                    size="large">
                    { activeKnob === 'nav' && <img className={classes.iconImage} src={`${imagePath}knob_hl.png`} alt='knob' />}
                    { activeKnob !== 'nav' && <img className={classes.iconImage} src={`${imagePath}knob.png`} alt='knob' />}
                </IconButton>
            </div>
            <div className={classes.knob} style={{ left: '3.3%', top: '37%' }}>
                <IconButton
                    color='primary'
                    aria-label='HDG KNOB'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].HEADING.select, 'hdg')}
                    size="large">
                    { activeKnob === 'hdg' && <img className={classes.iconImage} src={`${imagePath}knob_hdg_hl.png`} alt='knob' />}
                    { activeKnob !== 'hdg' && <img className={classes.iconImage} src={`${imagePath}knob_hdg.png`} alt='knob' />}
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '1.6%', top: '50.9%' }}>
                <IconButton
                    color='primary'
                    aria-label='AP'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.Autopilot.apMaster)}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_ap.png`} alt='button_ap' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '1.6%', top: '56.4%' }}>
                <IconButton
                    color='primary'
                    aria-label='HDG'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.Autopilot.Heading.hold)}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_hdg.png`} alt='button_hdg' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '1.6%', top: '61.8%' }}>
                <IconButton
                    color='primary'
                    aria-label='NAV'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.Autopilot.nav)}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_nav.png`} alt='button_nav' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '1.6%', top: '67.4%' }}>
                <IconButton
                    color='primary'
                    aria-label='APR'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.Autopilot.approach)}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_apr.png`} alt='button_apr' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '1.6%', top: '72.8%' }}>
                <IconButton
                    color='primary'
                    aria-label='VS'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => { handleOnClick(simActions.Autopilot.VS.hold, 'VS'); handleOnClick(simActions.Autopilot.VS.select, 'VS')}}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_vs.png`} alt='button_vs' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '1.6%', top: '78.2%' }}>
                <IconButton
                    color='primary'
                    aria-label='FLC'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => { handleOnClick(simActions.Autopilot.FLC.hold, 'FLC'); handleOnClick(simActions.Autopilot.FLC.select, 'FLC')}}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_flc.png`} alt='button_flc' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '6.7%', top: '50.9%' }}>
                <IconButton
                    color='primary'
                    aria-label='FD'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.Autopilot.flightDirector)}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_fd.png`} alt='button_fd' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '6.7%', top: '56.4%' }}>
                <IconButton
                    color='primary'
                    aria-label='ALT'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.Autopilot.Altitude.hold)}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_alt.png`} alt='button_alt' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '6.7%', top: '61.8%' }}>
                <IconButton
                    color='primary'
                    aria-label='VNV'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.Autopilot.vnav)}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_vnv.png`} alt='button_vnv' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '6.7%', top: '67.4%' }}>
                <IconButton
                    color='primary'
                    aria-label='BC'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.Autopilot.backCourse)}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_bc.png`} alt='button_bc' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '6.7%', top: '72.8%' }}>
                <IconButton
                    color='primary'
                    aria-label='NOSE UP'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(activeKnob === 'VS' ? simActions.Autopilot.VS.increase : activeKnob === 'FLC' ? simActions.Autopilot.FLC.decrease : null)}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_nose_up.png`} alt='button_nose_up' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '6.7%', top: '78.2%' }}>
                <IconButton
                    color='primary'
                    aria-label='NOSEDOWN'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(activeKnob === 'VS' ? simActions.Autopilot.VS.decrease : activeKnob === 'FLC' ? simActions.Autopilot.FLC.increase : null)}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_nose_down.png`} alt='button_nose_down' />
                </IconButton>
            </div>
            <div className={classes.knob} style={{ left: '3.3%', top: '86.2%' }}>
                <IconButton
                    color='primary'
                    aria-label='ALT KNOB'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.Autopilot.Altitude.select, 'alt')}
                    size="large">
                    { activeKnob === 'alt' && <img className={classes.iconImage} src={`${imagePath}knob_hl.png`} alt='knob' />}
                    { activeKnob !== 'alt' && <img className={classes.iconImage} src={`${imagePath}knob.png`} alt='knob' />}
                </IconButton>
            </div>


            <div className={classes.volKnob} style={{ left: '92.1%', top: '4.6%' }}>
                <IconButton
                    color='primary'
                    aria-label='VOL KNOB RIGHT'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].Volume.vol2Select, 'vol2')}
                    size="large">
                    { activeKnob === 'vol2' && <img className={classes.iconImage} src={`${imagePath}knob_vol_hl.png`} alt='knob' />}
                    { activeKnob !== 'vol2' && <img className={classes.iconImage} src={`${imagePath}knob_vol.png`} alt='knob' />}
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '89%', top: '11.1%' }}>
                <IconButton
                    color='primary'
                    aria-label='COM SWAP'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].COM.swap)}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_swap.png`} alt='button_swap' />
                </IconButton>
            </div>
            <div className={classes.knob} style={{ left: '91.1%', top: '18.7%' }}>
                <IconButton
                    color='primary'
                    aria-label='COM KNOB'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].COM.select, 'com')}
                    size="large">
                    { activeKnob === 'com' && <img className={classes.iconImage} src={`${imagePath}knob_hl.png`} alt='knob' />}
                    { activeKnob !== 'com' && <img className={classes.iconImage} src={`${imagePath}knob.png`} alt='knob' />}
                </IconButton>
            </div>
            <div className={classes.knob} style={{ left: '91.1%', top: '36.7%' }}>
                <IconButton
                    color='primary'
                    aria-label='CRS KNOB'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].CRS.select, 'crs')}
                    size="large">
                    { activeKnob === 'crs' && <img className={classes.iconImage} src={`${imagePath}knob_crs_hl.png`} alt='knob' />}
                    { activeKnob !== 'crs' && <img className={classes.iconImage} src={`${imagePath}knob_crs.png`} alt='knob' />}
                </IconButton>
            </div>
            <div className={classes.rangeKnob} style={{ left: '91.5%', top: '53.9%' }}>
                <IconButton
                    color='primary'
                    aria-label='MAP RANGE KNOB'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].MAP.select, 'map')}
                    size="large">
                    { activeKnob === 'map' && <img className={classes.iconImage} src={`${imagePath}knob_range_hl.png`} alt='knob' />}
                    { activeKnob !== 'map' && <img className={classes.iconImage} src={`${imagePath}knob_range.png`} alt='knob' />}
                </IconButton>
            </div>

            <div className={classes.button} style={{ left: '89.2%', top: '67.3%' }}>
                <IconButton
                    color='primary'
                    aria-label='DIR'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].Menu.directTo, 'fms')}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_dir.png`} alt='button_dir' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '89.2%', top: '73%' }}>
                <IconButton
                    color='primary'
                    aria-label='FPL'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].Menu.flightPlan, 'fms')}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_fpl.png`} alt='button_fpl' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '89.2%', top: '78.5%' }}>
                <IconButton
                    color='primary'
                    aria-label='CLR'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].Menu.clear, 'fms')}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_clr.png`} alt='button_clr' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '94.3%', top: '67.3%' }}>
                <IconButton
                    color='primary'
                    aria-label='MENU'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].Menu.menu, 'fms')}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_menu.png`} alt='button_menu' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '94.3%', top: '73%' }}>
                <IconButton
                    color='primary'
                    aria-label='PROC'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].Menu.procedure, 'fms')}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_proc.png`} alt='button_proc' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '94.3%', top: '78.5%' }}>
                <IconButton
                    color='primary'
                    aria-label='ENT'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].Menu.enter, 'fms')}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_ent.png`} alt='button_ent' />
                </IconButton>
            </div>
            <div className={classes.knob} style={{ left: '91%', top: '86.4%' }}>
                <IconButton
                    color='primary'
                    aria-label='FMS KNOB'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].FMS.select, 'fms')}
                    size="large">
                    { activeKnob === 'fms' && <img className={classes.iconImage} src={`${imagePath}knob_hl.png`} alt='knob' />}
                    { activeKnob !== 'fms' && <img className={classes.iconImage} src={`${imagePath}knob.png`} alt='knob' />}
                </IconButton>
            </div>


            <div className={classes.button} style={{ left: '14.7%', top: '92.4%' }}>
                <IconButton
                    color='primary'
                    aria-label='SOFTKEY_1'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].SoftKey.select(1), 'fms')}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_softkey.png`} alt='button_softkey' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '20.7%', top: '92.4%' }}>
                <IconButton
                    color='primary'
                    aria-label='SOFTKEY_2'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].SoftKey.select(2), 'fms')}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_softkey.png`} alt='button_softkey' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '26.8%', top: '92.4%' }}>
                <IconButton
                    color='primary'
                    aria-label='SOFTKEY_3'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].SoftKey.select(3), 'fms')}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_softkey.png`} alt='button_softkey' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '32.8%', top: '92.4%' }}>
                <IconButton
                    color='primary'
                    aria-label='SOFTKEY_4'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].SoftKey.select(4), 'fms')}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_softkey.png`} alt='button_softkey' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '38.9%', top: '92.4%' }}>
                <IconButton
                    color='primary'
                    aria-label='SOFTKEY_5'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].SoftKey.select(5), 'fms')}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_softkey.png`} alt='button_softkey' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '45.0%', top: '92.4%' }}>
                <IconButton
                    color='primary'
                    aria-label='SOFTKEY_6'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].SoftKey.select(6), 'fms')}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_softkey.png`} alt='button_softkey' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '51.0%', top: '92.4%' }}>
                <IconButton
                    color='primary'
                    aria-label='SOFTKEY_7'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].SoftKey.select(7), 'fms')}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_softkey.png`} alt='button_softkey' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '57.0%', top: '92.4%' }}>
                <IconButton
                    color='primary'
                    aria-label='SOFTKEY_8'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].SoftKey.select(8), 'fms')}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_softkey.png`} alt='button_softkey' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '63.1%', top: '92.4%' }}>
                <IconButton
                    color='primary'
                    aria-label='SOFTKEY_9'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].SoftKey.select(9), 'fms')}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_softkey.png`} alt='button_softkey' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '69.1%', top: '92.4%' }}>
                <IconButton
                    color='primary'
                    aria-label='SOFTKEY_10'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].SoftKey.select(10), 'fms')}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_softkey.png`} alt='button_softkey' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '75.1%', top: '92.4%' }}>
                <IconButton
                    color='primary'
                    aria-label='SOFTKEY_11'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].SoftKey.select(11), 'fms')}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_softkey.png`} alt='button_softkey' />
                </IconButton>
            </div>
            <div className={classes.button} style={{ left: '81.2%', top: '92.4%' }}>
                <IconButton
                    color='primary'
                    aria-label='SOFTKEY_12'
                    component='span'
                    className={classes.iconButton}
                    onClick={() => handleOnClick(simActions.ProfileSpecific.G1000NXi[activePanel].SoftKey.select(12), 'fms')}
                    size="large">
                    <img className={classes.iconImage}  src={`${imagePath}button_softkey.png`} alt='button_softkey' />
                </IconButton>
            </div>
        </div>
    );
}

export default G1000NXiPanel;