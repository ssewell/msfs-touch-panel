import React, { useMemo } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { useSimConnectData } from '../../../Services/DataProviders/SimConnectDataProvider';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import ExpandableCard from '../../Control/ExpandableCard';
import SevenSegmentDisplay from '../../Control/SevenSegmentDisplay';

const useStyles = makeStyles((theme) => ({
    grid: {
        ...theme.custom.panelGrid,
        paddingRight: 0
    },
    sectionLeft: {
        ...theme.custom.panelSection,
        paddingTop: '4px !important'
    },
    sectionRight: {
        marginLeft: '-4px',
        width: 'calc(100% + 4px)'
    },
    sectionSmall: {
        ...theme.custom.panelSection,
        justifyContent: 'space-between',
        paddingLeft: '8px',
        paddingRight: '8px',
        minHeight: '1.5em'
    },
    telemetryDisplay: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    segmentDisplay:
    {
        display: 'flex',
        justifyContent: 'center'
    }
}));

const TelemetryPanel = () => {
    const classes = useStyles();
    const onColor = 'rgb(32, 217, 32, 1)';
    const waitingColor = 'rgb(250, 186, 57, 1)';
    const offColor = 'rgb(97, 99, 105, 1)';

    const { PLANE_ALTITUDE, PLANE_AIRSPEED, PLANE_VERTICAL_SPEED, PLANE_HEADING, FLAPS_ANGLE, TRIM_PERCENT,
        ENG_PROP_RPM, ENG_THROTTLE_PERCENT, ENG_MIXTURE_PERCENT, GEAR_CENTER_POSITION, GEAR_LEFT_POSITION,
        GEAR_RIGHT_POSITION } = useSimConnectData().simConnectData;

    const gearColor = (gear) => {
        if (gear === 0)
            return offColor;
        else if (gear === 100)
            return onColor;
        else
            return waitingColor;
    }

    return useMemo(() => (
        <ExpandableCard title='Telemetry'>
            <Grid container className={classes.grid}>
                <Grid item xs={6}>
                    <div className={classes.sectionLeft}>
                        <div className={classes.telemetryDisplay}>
                            <Typography variant='body1'>HEADING</Typography>
                            <div className={classes.segmentDisplay}>
                                <SevenSegmentDisplay value={PLANE_HEADING}></SevenSegmentDisplay>
                            </div>
                        </div>
                        <div className={classes.telemetryDisplay}>
                            <Typography variant='body1'>ALTITUDE</Typography>
                            <div className={classes.segmentDisplay}>
                                <SevenSegmentDisplay value={PLANE_ALTITUDE}></SevenSegmentDisplay>
                            </div>
                        </div>
                        <div className={classes.telemetryDisplay}>
                            <Typography variant='body1'>AIRSPEED</Typography>
                            <div className={classes.segmentDisplay}>
                                <SevenSegmentDisplay value={PLANE_AIRSPEED}></SevenSegmentDisplay>
                            </div>
                        </div>
                        <div className={classes.telemetryDisplay}>
                            <Typography variant='body1'>V SPEED</Typography>
                            <div className={classes.segmentDisplay}>
                                <SevenSegmentDisplay value={PLANE_VERTICAL_SPEED}></SevenSegmentDisplay>
                            </div>
                        </div>
                    </div>
                </Grid>
                <Grid item xs={6} style={{paddingTop: 0, paddingBottom: 0}}>
                    <div className={classes.sectionRight}>
                        <Grid container>
                            <Grid item xs={4}>
                                <div className={classes.sectionSmall}>
                                    <Typography variant='body1'>Trim:</Typography>
                                    <Typography variant='body1'>{TRIM_PERCENT}</Typography>
                                </div>
                            </Grid>
                            <Grid item xs={4}>
                                <div className={classes.sectionSmall}>
                                    <Typography variant='body1'>Mixture:</Typography>
                                    <Typography variant='body1'>{ENG_MIXTURE_PERCENT}</Typography>
                                </div>
                            </Grid>
                            <Grid item xs={4}>
                                <div className={classes.sectionSmall}>
                                    <Typography variant='body1'>Flap:</Typography>
                                    <Typography variant='body1'>{FLAPS_ANGLE}</Typography>
                                </div>
                            </Grid>
                            <Grid item xs={4}>
                                <div className={classes.sectionSmall}>
                                    <Typography variant='body1'>Prop:</Typography>
                                    <Typography variant='body1'>{ENG_PROP_RPM}</Typography>
                                </div>
                            </Grid>
                            <Grid item xs={4}>
                                <div className={classes.sectionSmall}>
                                    <Typography variant='body1'>Throttle:</Typography>
                                    <Typography variant='body1'>{ENG_THROTTLE_PERCENT}</Typography>
                                </div>
                            </Grid>
                            <Grid item xs={4}>
                                <div className={classes.sectionSmall}>
                                    <Typography variant='body1'>Gear:</Typography>
                                    <div><Typography variant='body1' style={{ color: gearColor(GEAR_LEFT_POSITION) }}>L</Typography></div>
                                    <div><Typography variant='body1' style={{ color: gearColor(GEAR_CENTER_POSITION) }}>N</Typography></div>
                                    <div><Typography variant='body1' style={{ color: gearColor(GEAR_RIGHT_POSITION) }}>R</Typography></div>
                                </div>
                            </Grid>
                        </Grid>
                    </div>
                </Grid>
            </Grid>
        </ExpandableCard >
    ), [classes, PLANE_ALTITUDE, PLANE_AIRSPEED, PLANE_VERTICAL_SPEED, PLANE_HEADING, FLAPS_ANGLE, TRIM_PERCENT, ENG_PROP_RPM,
        ENG_THROTTLE_PERCENT, ENG_MIXTURE_PERCENT, GEAR_CENTER_POSITION, GEAR_LEFT_POSITION, GEAR_RIGHT_POSITION])
}

export default TelemetryPanel