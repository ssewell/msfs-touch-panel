import React, { useMemo } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { useSimConnectData } from '../../../Services/DataProviders/SimConnectDataProvider';
import { simActions } from '../../../Services/ActionProviders/simConnectActionHandler';
import { SteppedLineTo } from 'react-lineto';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

const useStyles = makeStyles((theme) => ({
    section: {
        ...theme.custom.panelSection,
        minHeight: '6.5em'
    },
    autoPilot: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    buttonBox: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '6px 0'
    }
}));

const AutoPilotMaster = () => {
    const classes = useStyles();
    const lineColor = 'rgb(54, 58, 71, 1)';
    const onColor = 'rgb(32, 217, 32, 1)';

    const { AP_MASTER_ON, AP_FLIGHT_DIRECTOR_ON, AP_NAV_ON, AP_APPROACH_ON, AP_BACK_COURSE_ON, AP_VNAV_ON, AP_YAW_DAMPER_ON} = useSimConnectData().simConnectData;

    return useMemo(() => (
        <div className={classes.section}>
            <Grid container className={classes.autoPilot}>
                <Grid item xs={4} className={classes.buttonBox}>
                    <Button variant="contained" size='small' className={'AP'} color='primary' style={{ backgroundColor: AP_MASTER_ON ? onColor : '', minWidth: '7em' }} onClick={simActions.Autopilot.apMaster}>AP Master</Button>
                </Grid>
                <Grid item xs={2} className={classes.buttonBox}>
                    <Button variant="contained" size='small' className={'FD'} color='primary' style={{ backgroundColor: AP_FLIGHT_DIRECTOR_ON ? onColor : '' }} onClick={simActions.Autopilot.flightDirector}>FD</Button>
                </Grid>
                <Grid item xs={2} className={classes.buttonBox}>
                    <Button variant="contained" size='small' className={'GPS'} color='primary' onClick={simActions.Autopilot.cdi}>CDI</Button>
                </Grid>
                <Grid item xs={2} className={classes.buttonBox}>
                    <Button variant="contained" size='small' className={'NAV'} color='primary' style={{ backgroundColor: AP_NAV_ON ? onColor : '' }} onClick={simActions.Autopilot.nav}>NAV</Button>
                </Grid>
                <Grid item xs={2} className={classes.buttonBox}>
                    <Button variant="contained" size='small' className={'YD'} color='primary' style={{ backgroundColor: AP_YAW_DAMPER_ON ? onColor : '' }} onClick={simActions.Autopilot.yawDamper}>YD</Button>
                </Grid>
                <Grid item xs={4} className={classes.buttonBox}>
                </Grid>
                <Grid item xs={2} className={classes.buttonBox}>
                    <Button variant="contained" size='small' className={'APR'} color='primary' style={{ backgroundColor: AP_APPROACH_ON ? onColor : '' }} onClick={simActions.Autopilot.approach}>APR</Button>
                </Grid>
                <Grid item xs={2} className={classes.buttonBox}>
                    <Button variant="contained" size='small' className={'BC'} color='primary' style={{ backgroundColor: AP_BACK_COURSE_ON ? onColor : '' }} onClick={simActions.Autopilot.backCourse}>BC</Button>
                </Grid>
                <Grid item xs={2} className={classes.buttonBox}>
                    <Button variant="contained" size='small' className={'VNV'} color='primary' style={{ backgroundColor: AP_VNAV_ON ? onColor : '' }} onClick={simActions.Autopilot.vnav}>VNV</Button>
                </Grid>
                <Grid item xs={2} className={classes.buttonBox}></Grid>
                <SteppedLineTo from='AP' to='FD' fromAnchor="right" toAnchor="left" orientation="h" borderColor={lineColor} delay={true} within='AP' />
                <SteppedLineTo from='AP' to='APR' fromAnchor="right" toAnchor="left" orientation="h" borderColor={lineColor} delay={true} within='AP' />
                <SteppedLineTo from='FD' to='GPS' fromAnchor="right" toAnchor="left" orientation="h" borderColor={lineColor} delay={true} within='FD' />
                <SteppedLineTo from='GPS' to='NAV' fromAnchor="right" toAnchor="left" orientation="h" borderColor={lineColor} delay={true} within='GPS' />
                <SteppedLineTo from='APR' to='BC' fromAnchor="right" toAnchor="left" orientation="h" borderColor={lineColor} delay={true} within='APR' />
                <SteppedLineTo from='NAV' to='VNV' fromAnchor="bottom" toAnchor="top" orientation="v" borderColor={lineColor} delay={true} within='NAV' />
            </Grid>
        </div>
    ), [classes, AP_MASTER_ON, AP_FLIGHT_DIRECTOR_ON, AP_NAV_ON, AP_APPROACH_ON, AP_BACK_COURSE_ON, AP_VNAV_ON, AP_YAW_DAMPER_ON])
}

export default AutoPilotMaster;