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

const ElectricalMaster = () => {
    const classes = useStyles();
    const { BATTERY_MASTER_ON, ALTERNATOR_MASTER_ON } = useSimConnectData().simConnectData;

    return useMemo(() => (
        <div className={classes.section}>
            <Typography variant='body1'>MASTER</Typography>
            <div className={classes.buttonGroup}>
                <SwitchButton label='BATTERY' value={BATTERY_MASTER_ON} onChange={simActions.Electrical.Master.battery}></SwitchButton>
                <SwitchButton label='ALTERNATOR' value={ALTERNATOR_MASTER_ON} onChange={simActions.Electrical.Master.alternator}></SwitchButton>
            </div>
        </div>
    ), [classes, BATTERY_MASTER_ON, ALTERNATOR_MASTER_ON])
}

export default ElectricalMaster;

