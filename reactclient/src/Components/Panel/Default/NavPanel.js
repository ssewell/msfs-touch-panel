import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { simActions } from '../../../Services/ActionProviders/simConnectActionHandler';
import Grid from '@mui/material/Grid';
import ExpandableCard from '../../Control/ExpandableCard';
import Adf from '../../ControlGroup/Default/Adf';
import Obs from '../../ControlGroup/Default/Obs';
import NavRadio from '../../ControlGroup/Default/NavRadio'

const useStyles = makeStyles((theme) => ({
    grid: theme.custom.panelGrid,
    section: theme.custom.panelSection,
    navButton: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    }
}));

const NavPanel = () => {
    const classes = useStyles();

    return (
        <ExpandableCard title='Navigation'>
            <Grid container className={classes.grid}>
                <Grid item xs={5}>
                    <NavRadio
                        id={'NAV1'}
                        label={'NAV 1'}
                        activeFreqKey={'NAV1_ACTIVE_FREQUENCY'}
                        standbyFreqKey={'NAV1_STANDBY_FREQUENCY'}
                        radioSelectAction={simActions.Navigation.NAV1.select}
                        radioSetAction={simActions.Navigation.NAV1.set}
                        radioSwappedAction={simActions.Navigation.NAV1.swap} />
                </Grid>
                <Grid item xs={2}>
                    <Obs
                        id={'obs1'}
                        label={'OBS 1'}
                        obsValueKey={'NAV_OBS_1'}
                        entrySetAction={simActions.Navigation.OBS1.set}
                        entrySelectAction={simActions.Navigation.OBS1.select} />
                </Grid>
                <Grid item xs={5}>
                    <Adf></Adf>
                </Grid>
                <Grid item xs={5}>
                    <NavRadio
                        id={'NAV2'}
                        label={'NAV 2'}
                        activeFreqKey={'NAV2_ACTIVE_FREQUENCY'}
                        standbyFreqKey={'NAV2_STANDBY_FREQUENCY'}
                        radioSelectAction={simActions.Navigation.NAV2.select}
                        radioSetAction={simActions.Navigation.NAV2.set}
                        radioSwappedAction={simActions.Navigation.NAV2.swap} />
                </Grid>
                <Grid item xs={2}>
                    <Obs
                        id={'obs2'}
                        label={'OBS 2'}
                        obsValueKey={'NAV_OBS_2'}
                        entrySetAction={simActions.Navigation.OBS2.set}
                        entrySelectAction={simActions.Navigation.OBS2.select} />
                </Grid>
                <Grid item xs={5} className={classes.navButton}></Grid>                
            </Grid>
        </ExpandableCard>
    )
}

export default NavPanel;