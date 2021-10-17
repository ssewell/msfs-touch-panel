import React, { useState, useMemo } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { useLocalStorageData } from '../../../LocalStorageProvider';
import { MapContainer } from 'react-leaflet';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import AirplanemodeInactiveIcon from '@mui/icons-material/AirplanemodeInactive';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LabelIcon from '@mui/icons-material/Label';
import LabelOffIcon from '@mui/icons-material/LabelOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import MapDisplay from '../../ControlGroup/Default/MapDisplay';
import MapTelemetry from '../../ControlGroup/Default/MapTelemetry';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        height: '100%',
        border: '1px solid ' + theme.palette.divider,
        borderRadius: theme.spacing(1),
    },
    controlbar: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        background: 'linear-gradient(rgb(82, 83, 124, 1), rgb(17, 19, 24, 1) 60%)'
    },
    telemetry:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        flexGrow: 1,
        paddingLeft: '8px'
    },
    buttonGroup: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0em 0.5em 0em 1em',
        borderLeft: '1px solid ' + theme.palette.divider,
    },
    buttonGroupTitle: {
        paddingRight: '1em',
    },
    button: {
        margin: '0.25em 0.5em'
    }
}));

const MapPanel = () => {
    const classes = useStyles();
    const { mapConfig, updateMapConfig } = useLocalStorageData();
    const [loadFlightPlan, setLoadFlightPlan] = useState(1);
    const [centerPlane, setCenterPlane] = useState(1);

    const handleUpdateMapConfig = (key, value) => {
        let config = { ...mapConfig };
        config[key] = value;
        updateMapConfig(config);
    }

    return useMemo(() => (
        <div className={classes.root}>
            <div className={classes.controlbar}>
                <div className={classes.telemetry}>
                    <MapTelemetry></MapTelemetry>
                </div>
                <div className={classes.buttonGroup}>
                    <Typography variant='body1' className={classes.buttonGroupTitle}>Flight Following:</Typography>
                    <Tooltip title='Center map on flight'>
                        <IconButton color='inherit' aria-label='Center map on flight' size='small' className={classes.button} onClick={() => { setCenterPlane(centerPlane + 1) }}>
                            <CenterFocusStrongIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title='Follow flight'>
                        <IconButton color='inherit' aria-label='Follow flight' size='small' className={classes.button} onClick={() => { handleUpdateMapConfig('flightFollowing', !mapConfig.flightFollowing) }}>
                            {mapConfig.flightFollowing ? <AirplanemodeActiveIcon style={{ margin: '0 !important' }} /> : <AirplanemodeInactiveIcon style={{ margin: '0 !important' }} />}
                        </IconButton>
                    </Tooltip>
                </div>
                <div className={classes.buttonGroup}>
                    <Typography variant='body1' className={classes.buttonGroupTitle}>Flight Plan:</Typography>
                    <Tooltip title='Show flight plan'>
                        <IconButton color='inherit' aria-label='Show flight plan' size='small' className={classes.button} onClick={() => { handleUpdateMapConfig('showFlightPlan', !mapConfig.showFlightPlan) }}>
                            {mapConfig.showFlightPlan ? <VisibilityIcon style={{ margin: '0 !important' }} /> : <VisibilityOffIcon style={{ margin: '0 !important' }} />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title='Show flight plan label'>
                        <IconButton color='inherit' aria-label='Show flight plan label' size='small' className={classes.button} onClick={() => { handleUpdateMapConfig('showFlightPlanLabel', !mapConfig.showFlightPlanLabel) }}>
                            {mapConfig.showFlightPlanLabel ? <LabelIcon style={{ margin: '0 !important' }} /> : <LabelOffIcon style={{ margin: '0 !important' }} />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title='Reload flight plan'>
                        <IconButton color='inherit' aria-label='Reload flight plan' size='small' className={classes.button} onClick={() => { setLoadFlightPlan(loadFlightPlan + 1) }}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            <MapContainer zoom={15} scrollWheelZoom={true} style={{ height: '100%'}}>
                <MapDisplay
                    centerPlane={centerPlane}
                    flightFollowing={mapConfig.flightFollowing}
                    showFlightPlan={mapConfig.showFlightPlan}
                    showFlightPlanLabel={mapConfig.showFlightPlanLabel}
                    loadFlightPlan={loadFlightPlan}
                    dragstart={() => { handleUpdateMapConfig('flightFollowing', false) }}
                />
            </MapContainer>
        </div>
    ), [classes, centerPlane, loadFlightPlan, mapConfig.flightFollowing, mapConfig.showFlightPlan, mapConfig.showFlightPlanLabel])
}

export default MapPanel;

