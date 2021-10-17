import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import ExpandableCard from '../../Control/ExpandableCard';
import Grid from '@mui/material/Grid';
import Atc from '../../ControlGroup/Default/Atc';
import SimRate from '../../ControlGroup/Default/SimRate';

const useStyles = makeStyles((theme) => ({
    grid: theme.custom.panelGrid,
    section: theme.custom.panelSection,
}));

const AtcPanel = () => {
    const classes = useStyles();

    return (
        <ExpandableCard title='ATC / Sim Rate'>
            <Grid container className={classes.grid}>
                <Grid item xs={10}>
                    <Atc></Atc>
                </Grid>
                <Grid item xs={2}>
                    <SimRate></SimRate>
                </Grid>
            </Grid>
        </ExpandableCard>
    )
}

export default AtcPanel;