import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { simActions } from '../../../Services/ActionProviders/simConnectActionHandler';
import Grid from '@mui/material/Grid';
import ExpandableCard from '../../Control/ExpandableCard';
import ComRadio from '../../ControlGroup/Default/ComRadio';

const useStyles = makeStyles((theme) => ({
    grid: theme.custom.panelGrid
}));

const ComPanel = () => {
    const classes = useStyles();

    return (
        <ExpandableCard title='Communication'>
            <Grid container className={classes.grid} >
                <Grid item xs={6}>
                    <ComRadio
                        id={'COM1'}
                        label={'COM 1'}
                        transmitOnKey={'COM1_TRANSMIT'}
                        activeFreqKey={'COM1_ACTIVE_FREQUENCY'}
                        standbyFreqKey={'COM1_STANDBY_FREQUENCY'}
                        radioSelectAction={simActions.Communication.COM1.select}
                        radioSetAction={simActions.Communication.COM1.set}
                        radioSwappedAction={simActions.Communication.COM1.swap}
                        transmitChangedAction={simActions.Communication.COM1.toggle} />
                </Grid>
                <Grid item xs={6} >
                    <ComRadio
                        id={'COM2'}
                        label={'COM 2'}
                        transmitOnKey={'COM2_TRANSMIT'}
                        activeFreqKey={'COM2_ACTIVE_FREQUENCY'}
                        standbyFreqKey={'COM2_STANDBY_FREQUENCY'}
                        radioSelectAction={simActions.Communication.COM2.select}
                        radioSetAction={simActions.Communication.COM2.set}
                        radioSwappedAction={simActions.Communication.COM2.swap}
                        transmitChangedAction={simActions.Communication.COM2.toggle} />
                </Grid>
            </Grid>
        </ExpandableCard>
    )
}

export default ComPanel;