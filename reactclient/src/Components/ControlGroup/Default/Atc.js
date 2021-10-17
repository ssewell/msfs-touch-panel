import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { simActions } from '../../../Services/ActionProviders/simConnectActionHandler';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';

const useStyles = makeStyles((theme) => ({
    section: theme.custom.panelSection
}));

const Atc = () => {
    const classes = useStyles();

    return (
        <div className={classes.section}>
            <Typography variant='body1'>ATC</Typography>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit, index) => {
                return (
                    <Button key={'atc' + index} variant="contained" size='small' color='primary' onClick={() => simActions.ATC.select(digit)}>{digit}</Button>
                )
            })}
        </div>
    )
}

export default Atc;