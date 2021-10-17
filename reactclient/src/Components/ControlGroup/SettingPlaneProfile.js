import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { useLocalStorageData } from '../../LocalStorageProvider';
import { planeType } from '../../planeType';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import FlightIcon from '@mui/icons-material/Flight';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    panel: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '300px'
    },
    grid: {
        padding: '8px'
    },
    gridTitle: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '8px 0',
        marginTop: '8px',
        borderTop: '1px solid ' + theme.palette.border,
        borderBottom: '1px solid ' + theme.palette.border
    },
    gridItemKey: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-Start',
        alignItems: 'center',
        padding: '0 0 0 8px'
    },
    gridItemIcon: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 8px 0 0'
    },
    menuButton: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-Start',
        alignItems: 'center',
        color: 'rgb(255, 255, 255, 1)',
        backgroundColor: 'transparent',
        '&:hover': {
            backgroundColor: 'transparent'
        }
    },
}));

const SettingPlaneProfile = () => {
    const classes = useStyles();
    const { planeProfile, updatePlaneProfile } = useLocalStorageData();
    const [ configSettingsIsOpen, setConfigSettingsIsOpen] = useState(false);
          
    const handleProfileSelect = (profile) => {
        console.log(profile);
        updatePlaneProfile(profile);
        setConfigSettingsIsOpen(false);
    };

    const PlaneProfileItem = ({profileKey, profileName, isActive}) => (
        <>
            <Grid item xs={10} className={classes.gridItemKey}>
                <Button variant="text" className={classes.menuButton} onClick={() => handleProfileSelect(profileKey)}>{profileName}</Button>
            </Grid>
            <Grid item xs={2} className={classes.gridItemIcon}>
                {isActive && <FlightIcon size="small"></FlightIcon>}
            </Grid>
        </>
    )

    return (
        <div className={classes.root}>
            <FlightIcon onClick={() => setConfigSettingsIsOpen(true)} />
            <SwipeableDrawer
                anchor='right'
                open={configSettingsIsOpen}
                onClose={() => setConfigSettingsIsOpen(false)}
                onOpen={() => setConfigSettingsIsOpen(true)}>
                <div className={classes.panel}>
                    <Grid container className={classes.grid}>
                        <Grid item xs={12} className={classes.gridTitle}>
                            <Typography variant='h5'>Plane Profile</Typography>
                        </Grid>

                        {Object.keys(planeType).map(key => planeType[key]).map((type, index) => {
                            return (
                                <PlaneProfileItem key={index} profileKey={type.key} profileName={type.description} isActive={planeProfile === type.key}>
                                </PlaneProfileItem>
                            )
                        })}
                      
                    </Grid>
                </div>
            </SwipeableDrawer>
        </div>
    )
}

export default SettingPlaneProfile;