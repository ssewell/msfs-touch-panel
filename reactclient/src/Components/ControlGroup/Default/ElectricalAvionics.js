import React, { useMemo } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { useSimConnectData } from '../../../Services/DataProviders/SimConnectDataProvider';
import { simActions } from '../../../Services/ActionProviders/simConnectActionHandler';
import { Typography } from '@mui/material';
import SwitchButton from '../../Control/SwitchButton';

const useStyles = makeStyles((theme) => ({
    section: {
        ...theme.custom.panelSection,
        flexDirection: 'column !important',
        padding: '4px'
    },
    buttonGroup: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        paddingTop: '8px'
    }
}));

const ElectricalAvionics = () => {
    const classes = useStyles();
    const { AVIONICS_MASTER_ON, FUEL_PUMP_ON, DEICE_ON, PITOT_HEAT_ON } = useSimConnectData().simConnectData;

    return useMemo(() => (
        <div className={classes.section}>
            <Typography variant='body1'>AVIONICS</Typography>
            <div className={classes.buttonGroup}>
                <SwitchButton label='MASTER' value={AVIONICS_MASTER_ON} onChange={simActions.Electrical.Avionic.master}></SwitchButton>
                <SwitchButton label='FUEL PUMP' value={FUEL_PUMP_ON} onChange={simActions.Electrical.Avionic.fuelPump}></SwitchButton>
                <SwitchButton label='PITOT HEAT' value={PITOT_HEAT_ON} onChange={simActions.Electrical.Avionic.pitotHeat}></SwitchButton>
                <SwitchButton label='DE-ICE' value={DEICE_ON} onChange={simActions.Electrical.Avionic.deIce}></SwitchButton>
            </div>
        </div>
    ), [classes, AVIONICS_MASTER_ON, FUEL_PUMP_ON, DEICE_ON, PITOT_HEAT_ON])
}

export default ElectricalAvionics;

