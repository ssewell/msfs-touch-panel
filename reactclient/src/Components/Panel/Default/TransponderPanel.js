import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import ExpandableCard from '../../Control/ExpandableCard';
import Transponder from '../../ControlGroup/Default/Transponder';
import Barometer from '../../ControlGroup/Default/Barometer';

const useStyles = makeStyles((theme) => ({
    grid: theme.custom.panelGrid
}));

const TransponderPanel = () => {
    const classes = useStyles();

    return (
        <ExpandableCard title='Transponder / Barometer'>
            <Grid container className={classes.grid}>
                <Grid item xs={3}>
                    <Transponder></Transponder>
                </Grid>
                <Grid item xs={3}>
                    <Barometer></Barometer>
                </Grid>
            </Grid>
        </ExpandableCard>
    )
}

export default TransponderPanel;