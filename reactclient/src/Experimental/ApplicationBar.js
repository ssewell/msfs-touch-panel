import React, {  useMemo } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { useSimConnectData } from '../Services/DataProviders/SimConnectDataProvider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import UsbIcon from '@mui/icons-material/Usb';
import MapIcon from '@mui/icons-material/Map';
import BiotechIcon from '@mui/icons-material/Biotech';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import SettingConfiguration from '../Components/ControlGroup/SettingConfiguration';

const useStyles = makeStyles(() => ({
    toolbar: {
        minHeight: '1.5em',
        padding: 0
    },
    menuIcons: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    statusIcons: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    planeTitle: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
    },
    menuButton: {
        marginRight: '0.5em',
        marginLeft: '0.5em'
    },
    networkConnected: {
        color: 'lightgreen'
    },
    networkDisconnected: {
        color: 'red'
    },
    drawer: {
        width: 250,
    },
}));

const ApplicationBar = ({ mapOpenChanged, experimentalOpenChanged }) => {
    const classes = useStyles();
    const { networkStatus, arduinoStatus } = useSimConnectData();

    return useMemo(() => (
        <div className={classes.root}>
            <AppBar position='static'>
                <Toolbar className={classes.toolbar}>
                    <Grid container>
                        <Grid item xs={3} className={classes.statusIcons}>
                            <IconButton color='inherit' aria-label='network status' size='small' className={classes.menuButton}>
                                <NetworkCheckIcon className={networkStatus ? classes.networkConnected : classes.networkDisconnected} />
                            </IconButton>
                            <IconButton color='inherit' aria-label='arduino status' size='small' className={classes.menuButton}>
                                <UsbIcon className={arduinoStatus ? classes.networkConnected : classes.networkDisconnected} />
                            </IconButton>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="h6" className={classes.planeTitle}>MSFS Touch Panel</Typography>
                        </Grid>
                        <Grid item xs={3} className={classes.menuIcons}>
                            <IconButton color='inherit' aria-label='map' size='small' className={classes.menuButton} onClick={() => mapOpenChanged()}>
                                <MapIcon />
                            </IconButton>
                            <IconButton color='inherit' aria-label='experimental feature' size='small' className={classes.menuButton} onClick={() => experimentalOpenChanged()}>
                                <BiotechIcon/>
                            </IconButton>
                            <IconButton color='inherit' aria-label='settings' size='small' className={classes.menuButton}>
                                <SettingConfiguration></SettingConfiguration>
                            </IconButton>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
        </div >
    ), [classes, networkStatus, arduinoStatus, mapOpenChanged]);
}

export default ApplicationBar;