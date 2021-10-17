import React, { useMemo } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { useSimConnectData } from '../../../Services/DataProviders/SimConnectDataProvider';
import { simActions } from '../../../Services/ActionProviders/simConnectActionHandler';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

const useStyles = makeStyles((theme) => ({
    section: theme.custom.panelSection,
    gridItem: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    }
}));

const onColor = 'rgb(32, 217, 32, 1)';

const Dme = () => {
    const classes = useStyles();
    const { DME_SELECTED, DME_NAV1_SELECTED, DME_NAV2_SELECTED } = useSimConnectData().simConnectData;

    return useMemo(() => (
        <div className={classes.section}>
            <Grid container>
                <Grid item xs={3} className={classes.gridItem}>
                    <Typography variant='body1'>DME</Typography>
                </Grid>
                <Grid item xs={9} className={classes.gridItem}>
                    <Button variant="contained" size='small' color='primary' style={{ backgroundColor: DME_SELECTED ? onColor : '' }} onClick={() => simActions.ProfileSpecific.G1000NXi.MID.dme()}>DME</Button>
                    <Button variant="contained" size='small' color='primary' style={{ backgroundColor: DME_NAV1_SELECTED ? onColor : '' }} onClick={() => simActions.ProfileSpecific.G1000NXi.MID.dmeNav1()}>NAV 1</Button>
                    <Button variant="contained" size='small' color='primary' style={{ backgroundColor: DME_NAV2_SELECTED ? onColor : '' }} onClick={() => simActions.ProfileSpecific.G1000NXi.MID.dmeNav2()}>NAV 2</Button>
                </Grid>
            </Grid>
        </div>
    ), [classes, DME_SELECTED, DME_NAV1_SELECTED, DME_NAV2_SELECTED])
}

export default Dme;