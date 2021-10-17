import React, { useMemo } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { useSimConnectData } from '../../../Services/DataProviders/SimConnectDataProvider';
import { Typography } from '@mui/material';
import SevenSegmentDisplay from '../../Control/SevenSegmentDisplay';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex=start',
        alignItems: 'center'
    },
    telemetry:
    {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '0 0.25em',
        '&:not(:last-child)':
        {
            borderRight: '1px solid ' + theme.palette.divider
        }
    }
}));

const MapTelemetry = () => {
    const classes = useStyles();
    const { PLANE_ALTITUDE, PLANE_AIRSPEED, PLANE_VERTICAL_SPEED, PLANE_HEADING } = useSimConnectData().simConnectData;

    return useMemo(() => (
        <div className={classes.root}>
            <div className={classes.telemetry}>
                <Typography variant='body1'>Heading</Typography>
                <SevenSegmentDisplay numberOfDisplayDigit={3} value={PLANE_HEADING} fontSizeInEm={0.8}></SevenSegmentDisplay>
            </div>
            <div className={classes.telemetry}>
                <Typography variant='body1'>Altitude</Typography>
                <SevenSegmentDisplay numberOfDisplayDigit={5} value={PLANE_ALTITUDE} fontSizeInEm={0.8}></SevenSegmentDisplay>
            </div>
            <div className={classes.telemetry}>
                <Typography variant='body1'>Airspeed</Typography>
                <SevenSegmentDisplay numberOfDisplayDigit={3} value={PLANE_AIRSPEED} fontSizeInEm={0.8}></SevenSegmentDisplay>
            </div>
            <div className={classes.telemetry}>
                <Typography variant='body1'>V.Speed</Typography>
                <SevenSegmentDisplay numberOfDisplayDigit={4} value={PLANE_VERTICAL_SPEED} fontSizeInEm={0.8}></SevenSegmentDisplay>
            </div>
        </div>
    ), [classes, PLANE_ALTITUDE, PLANE_AIRSPEED, PLANE_VERTICAL_SPEED, PLANE_HEADING])
}

export default MapTelemetry