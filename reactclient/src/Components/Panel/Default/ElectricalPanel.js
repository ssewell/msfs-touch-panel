import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import ExpandableCard from '../../Control/ExpandableCard';
import ElectricalMaster from '../../ControlGroup/Default/ElectricalMaster';
import ElectricalAvionics from '../../ControlGroup/Default/ElectricalAvionics';
import ElectricalLights from '../../ControlGroup/Default/ElectricalLights';

const useStyles = makeStyles((theme) => ({
    grid: theme.custom.panelGrid
}));

const ElectricalPanel = () => {
    const classes = useStyles();

    return (
        <ExpandableCard title='Electrical'>
            <Grid container className={classes.grid}>
                <Grid item xs={2}>
                    <ElectricalMaster></ElectricalMaster>
                </Grid>
                <Grid item xs={4}>
                    <ElectricalAvionics></ElectricalAvionics>
                </Grid>
                <Grid item xs={6}>
                    <ElectricalLights></ElectricalLights>
                </Grid>
            </Grid>
        </ExpandableCard>
    )
}

export default ElectricalPanel;

