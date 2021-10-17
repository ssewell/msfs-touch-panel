import React, { useState, useEffect } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { Typography } from '@mui/material'
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { calcIncrementDecrementValue } from '../Util/algorithm';

const useStyles = makeStyles((theme) => ({
    dialog: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none'
    },
    paper: {
        width: '430px',
        ...theme.custom.defaultDialog
    },
    controlBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid ' + theme.palette.divider,
        height: '3em'
    },
    stepper: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5em 1em'
    },
    numericDisplay: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '9em',
        background: theme.palette.secondary.main,
        border: '1px solid ' + theme.palette.divider
    },
    directInputSwitch: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    }
}));

const StepperPad = ({ open, onSet, onClose, initialValue, decimalPlaces, largeIncrementStep, smallIncrementStep, largeDecrementStep,
    smallDecrementStep, minValue, maxValue, loopBack, isDirectInput, allowDirectInput, onDirectInputChanged }) => {
    const classes = useStyles();
    const [dataValue, setDataValue] = useState(0);

    useEffect(() => {
        setDataValue(Number(initialValue));
    }, [initialValue])

    const handleClose = () => {
        if (onClose !== undefined)
            onClose();
    }

    const handleOnChange = (step) => {
        // apply increment or decrement function
        let newValue = calcIncrementDecrementValue(step, dataValue, minValue, maxValue, loopBack, decimalPlaces);

        if (newValue != null)
            setDataValue(newValue);
    }

    const handleOnSet = () => {
        if (onSet !== undefined)
            onSet(Number(dataValue));

        if (onClose !== undefined)
            onClose();
    }

    const handleDirectInputChanged = () => {
        if (onDirectInputChanged != null)
            onDirectInputChanged(true);
    }

    return (
        <div>
            <Dialog aria-labelledby='KeyPad' aria-describedby='KeyPad' className={classes.dialog} open={open} onClose={handleClose}>
                <div className={classes.paper}>
                    <div className={classes.controlBar}>
                        <IconButton color='inherit' aria-label='close' size='medium' style={{ paddingLeft: '0.5em' }} onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                        {allowDirectInput &&
                            <div className={classes.directInputSwitch}>
                                <Typography variant='h6' style={{ paddingRight: '8px' }}>Direct Input</Typography>
                                <Switch
                                    checked={!isDirectInput}
                                    onChange={handleDirectInputChanged}
                                    color='primary'
                                    size='small'
                                />
                            </div>
                        }
                        <IconButton color='inherit' aria-label='accept' size='medium' style={{ paddingRight: '0.5em' }} onClick={handleOnSet}>
                            <CheckIcon />
                        </IconButton>
                    </div>
                    <div className={classes.stepper}>
                        {largeDecrementStep !== null &&
                            <IconButton color='inherit' aria-label='backspace' size='medium' onClick={() => { handleOnChange(largeDecrementStep) }}>
                                <NavigateBeforeIcon style={{ fontSize: '1.5em' }} />
                            </IconButton>
                        }
                        {smallDecrementStep !== null &&
                            <IconButton color='inherit' aria-label='backspace' size='medium' onClick={() => { handleOnChange(smallDecrementStep) }}>
                                <NavigateBeforeIcon />
                            </IconButton>
                        }
                        <div className={classes.numericDisplay}>
                            <Typography variant='h2'>{dataValue.toFixed(decimalPlaces)}</Typography>
                        </div>
                        {smallIncrementStep !== null &&
                            <IconButton color='inherit' aria-label='backspace' size='medium' onClick={() => { handleOnChange(smallIncrementStep) }}>
                                <NavigateNextIcon />
                            </IconButton>
                        }
                        {largeIncrementStep !== null &&
                            <IconButton color='inherit' aria-label='backspace' size='medium' onClick={() => { handleOnChange(largeIncrementStep) }}>
                                <NavigateNextIcon style={{ fontSize: '1.5em' }} />
                            </IconButton>
                        }
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

StepperPad.defaultProps = {
    open: false,
    initialValue: 0,
    decimalPlaces: 0,
    largeIncrementStep: 10,
    smallIncrementStep: 1,
    largeDecrementStep: 10,
    smallDecrementStep: 1,
    loopBack: false
};

export default StepperPad;