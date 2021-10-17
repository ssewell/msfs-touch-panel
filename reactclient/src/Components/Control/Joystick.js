import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';


const useStyles = makeStyles(() => ({
    root: {
        touchAction: 'none',
    },
    joystickSection: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    up: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    leftRight: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '4em',
        width: '12em'
    },
    downn: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    button: {
        width: '4em'
    }
}));

const Joystick = ({ onUpPush, onDownPush, onLeftPush, onRightPush, onButtonPush }) => {
    const classes = useStyles();
    
    const raiseEvent = (event) => {
        if (event != null)
            event();
    }

    return (
        <div className={classes.root}>
            <div className={classes.joystickSection}>
                <div className={classes.up}>
                    <Button variant="contained" color='primary' aria-label='up' size='small' className={classes.button} onClick={() => raiseEvent(onUpPush)}>
                        <ArrowUpwardIcon />
                    </Button>
                </div>
                <div className={classes.leftRight}>
                    <Button variant="contained" color='primary' aria-label='left' size='small' className={classes.button} onClick={() => raiseEvent(onLeftPush)}>
                        <ArrowBackIcon />
                    </Button>
                    <Button variant="contained" color='primary' aria-label='PUSH' size='small' className={classes.button} onClick={() => raiseEvent(onButtonPush)}>
                        PUSH
                    </Button>
                    <Button variant="contained" color='primary' aria-label='right' size='small' className={classes.button} onClick={() => raiseEvent(onRightPush)}>
                        <ArrowForwardIcon />
                    </Button>
                </div>
                <div className={classes.down}>
                    <Button variant="contained" color='primary' aria-label='down'  size='small' className={classes.button} onClick={() => raiseEvent(onDownPush)}>
                        <ArrowDownwardIcon />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Joystick;