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

const ElectricalLights = () => {
    const classes = useStyles();
    const { LIGHT_LANDING_ON, LIGHT_TAXI_ON, LIGHT_BEACON_ON, LIGHT_NAV_ON, LIGHT_STROBE_ON, LIGHT_PANEL_ON } = useSimConnectData().simConnectData;

    return useMemo(() => (
        <div className={classes.section}>
            <Typography variant='body1'>LIGHTS</Typography>
            <div className={classes.buttonGroup}>
                <SwitchButton label='BEACON' value={LIGHT_BEACON_ON} onChange={simActions.Electrical.Light.beacon}></SwitchButton>
                <SwitchButton label='LANDING' value={LIGHT_LANDING_ON} onChange={simActions.Electrical.Light.landing}></SwitchButton>
                <SwitchButton label='TAXI' value={LIGHT_TAXI_ON} onChange={simActions.Electrical.Light.taxi}></SwitchButton>
                <SwitchButton label='NAV' value={LIGHT_NAV_ON} onChange={simActions.Electrical.Light.nav}></SwitchButton>
                <SwitchButton label='STROBE' value={LIGHT_STROBE_ON} onChange={simActions.Electrical.Light.strobe}></SwitchButton>
                <SwitchButton label='PANEL' value={LIGHT_PANEL_ON} onChange={simActions.Electrical.Light.panel}></SwitchButton>
            </div>
        </div>
    ), [classes, LIGHT_LANDING_ON, LIGHT_TAXI_ON, LIGHT_BEACON_ON, LIGHT_NAV_ON, LIGHT_STROBE_ON, LIGHT_PANEL_ON])
}

export default ElectricalLights;

