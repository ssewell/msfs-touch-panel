import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import ExpandableCard from '../../Control/ExpandableCard';
import ElectricalMaster from '../../ControlGroup/Default/ElectricalMaster';
import ElectricalAvionics from '../../ControlGroup/Default/ElectricalAvionics';
import ElectricalLights from '../../ControlGroup/C172_G1000NXi/ElectricalLights';

const useStyles = makeStyles((theme) => ({
    grid: theme.custom.panelGrid
}));

const ElectricalPanel = () => {
    const classes = useStyles();

    return (
        <ExpandableCard title='Electrical'>
            <Grid container className={classes.grid}>
                <Grid item xs={3}>
                    <ElectricalMaster></ElectricalMaster>
                </Grid>
                <Grid item xs={4}>
                    <ElectricalAvionics></ElectricalAvionics>
                </Grid>
                <Grid item xs={5}>
                    <ElectricalLights></ElectricalLights>
                </Grid>
            </Grid>
        </ExpandableCard>
    )
}

export default ElectricalPanel;

