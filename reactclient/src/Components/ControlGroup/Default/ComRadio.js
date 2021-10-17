import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { useSimConnectData } from '../../../Services/DataProviders/SimConnectDataProvider';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import RadioDisplay from '../../Control/RadioDisplay';

const useStyles = makeStyles((theme) => ({
    section: theme.custom.panelSection,
    gridItem: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    
}));

const comSmallIncrementFunc = (value) => {
    let val = Number(value);
    let decimalPart = Number((val * 10 % 1).toFixed(3));

    if (decimalPart === 0.90 || decimalPart === 0.65 || decimalPart === 0.40 || decimalPart === 0.15)
        return val += 0.01;

    return val += 0.005;
}

const comSmallDecrementFunc = (value) => {
    let val = Number(value);
    let decimalPart = Number((val * 10 % 1).toFixed(3));

    if (decimalPart === 0 || decimalPart === 0.75 || decimalPart === 0.50 || decimalPart === 0.25)
        return val -= 0.01;

    return val -= 0.005;
}

const ComRadio = ({ id, label, transmitOnKey, activeFreqKey, standbyFreqKey, transmitChangedAction, radioSelectAction, radioSetAction, radioSwappedAction }) => {
    const classes = useStyles();
    const onColor = 'rgb(32, 217, 32, 1)';

    const { simConnectData } = useSimConnectData();
    const transmitOn = Boolean(simConnectData[transmitOnKey]);

    return (
        <div className={classes.section}>
            <Grid container>
                <Grid item xs={2} className={classes.gridItem}>
                    <Button
                        variant="contained"
                        size='small'
                        color='primary'
                        style={{ backgroundColor: transmitOn ? onColor : '', minWidth: '4.5em' }}
                        onClick={() => transmitChangedAction(Number(!transmitOn))}>
                        {label}
                    </Button>
                </Grid>
                <Grid item xs={10} className={classes.gridItem}>
                    <RadioDisplay
                        id={id}
                        numberOfDigit={6}
                        decimalPlaces={3}
                        activeFreqKey={activeFreqKey}
                        standbyFreqKey={standbyFreqKey}
                        minFreqValue={118}
                        maxFreqValue={136.99}
                        smallIncrementStep={comSmallIncrementFunc}
                        smallDecrementStep={comSmallDecrementFunc}
                        largeIncrementStep={1}
                        largeDecrementStep={-1}
                        radioSelectAction={radioSelectAction}
                        radioSetAction={radioSetAction}
                        radioSwappedAction={radioSwappedAction} />
                </Grid>
            </Grid>
        </div>
    )
}

export default ComRadio;