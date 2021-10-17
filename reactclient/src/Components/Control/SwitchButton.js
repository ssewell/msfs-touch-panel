import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { Typography } from '@mui/material';
import Switch from '@mui/material/Switch';

const useStyles = makeStyles(() => ({
    switchGroup: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'sapce',
        alignItems: 'center'
    },
    switch: {
        transform: 'rotate(-90deg)',
    },
    switchLabel: {
        paddingLeft: '4px',
        marginTop: '8px',
    }
}));

const SwitchButton = ({ label, value, onChange }) => {
    const classes = useStyles();

    return (
        <div className={classes.switchGroup}>
            <div className={classes.switch}>
                <Switch
                    checked={Boolean(value)}
                    onChange={() => onChange(Number(!Boolean(value)))}
                    size='small'/>
            </div>
            <div className={classes.switchLabel}>
                <Typography variant='body2' >{label}</Typography>
            </div>
        </div>
    )
}

export default SwitchButton;