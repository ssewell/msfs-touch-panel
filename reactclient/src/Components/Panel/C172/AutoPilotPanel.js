import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import ExpandableCard from '../../Control/ExpandableCard';
import AutoPilotMaster from '../../ControlGroup/C172_G1000NXi/AutopilotMaster';
import AutoPilotSettings from '../../ControlGroup/Default/AutopilotSettings';

const useStyles = makeStyles((theme) => ({
    grid: theme.custom.panelGrid,
}));

const AutoPilotPanel = () => {
    const classes = useStyles();

    return (
        <ExpandableCard title='Autopilot'>
            <Grid container className={classes.grid}>
                <Grid item xs={6}>
                    <AutoPilotMaster></AutoPilotMaster>
                </Grid>
                <Grid item xs={6} style={{paddingLeft: 0, paddingRight: 0}}>
                    <AutoPilotSettings></AutoPilotSettings>
                </Grid>
            </Grid>
        </ExpandableCard>
    )
}

export default AutoPilotPanel;