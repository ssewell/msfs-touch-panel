import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { simActions } from '../../../Services/ActionProviders/simConnectActionHandler';
import Grid from '@mui/material/Grid';
import ExpandableCard from '../../Control/ExpandableCard';
import Obs from '../../ControlGroup/Default/Obs';
import NavRadio from '../../ControlGroup/Default/NavRadio'
import Adf from '../../ControlGroup//G1000NXi/Adf';
import Fms from '../../ControlGroup/G1000NXi/Fms';
import Transponder from '../../ControlGroup/Default/Transponder';
import Barometer from '../../ControlGroup/Default/Barometer';

const useStyles = makeStyles((theme) => ({
    grid: theme.custom.panelGrid,
    section: theme.custom.panelSection
}));

const NavPanel = () => {
    const classes = useStyles();

    return (
        <ExpandableCard title='Navigation / Transponder / FMS'>
            <Grid container className={classes.grid}>
                <Grid item xs={6}>
                    <NavRadio
                        id={'NAV1'}
                        label={'NAV 1'}
                        activeFreqKey={'NAV1_ACTIVE_FREQUENCY'}
                        standbyFreqKey={'NAV1_STANDBY_FREQUENCY'}
                        radioSelectAction={simActions.Navigation.NAV1.select}
                        radioSetAction={simActions.Navigation.NAV1.set}
                        radioSwappedAction={simActions.Navigation.NAV1.swap} />
                </Grid>
                <Grid item xs={3}>
                    <Obs
                        id={'obs1'}
                        label={'OBS 1'}
                        obsValueKey={'NAV_OBS_1'}
                        entrySetAction={simActions.Navigation.OBS1.set}
                        entrySelectAction={simActions.Navigation.OBS1.select} />
                </Grid>
                <Grid item xs={3}>
                    <Barometer></Barometer>
                </Grid>
                <Grid item xs={6}>
                    <NavRadio
                        id={'NAV2'}
                        label={'NAV 2'}
                        activeFreqKey={'NAV2_ACTIVE_FREQUENCY'}
                        standbyFreqKey={'NAV2_STANDBY_FREQUENCY'}
                        radioSelectAction={simActions.Navigation.NAV2.select}
                        radioSetAction={simActions.Navigation.NAV2.set}
                        radioSwappedAction={simActions.Navigation.NAV2.swap} />
                </Grid>
                <Grid item xs={3}>
                    <Obs
                        id={'obs2'}
                        label={'OBS 2'}
                        obsValueKey={'NAV_OBS_2'}
                        entrySetAction={simActions.Navigation.OBS2.set}
                        entrySelectAction={simActions.Navigation.OBS2.select} />
                </Grid>
                <Grid item xs={3}>
                    <Transponder></Transponder>
                </Grid>
                <Grid item xs={9}>
                    <Adf></Adf>
                </Grid>
                <Grid item xs={3}>
                    <Fms></Fms>
                </Grid>
            </Grid>
        </ExpandableCard>
    )
}

export default NavPanel;