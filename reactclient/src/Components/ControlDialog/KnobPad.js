import React, { useState, useEffect } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { Typography } from '@mui/material'
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DualKnob from '../Control/DualKnob';
import { calcIncrementDecrementValue } from '../Util/algorithm';

const useStyles = makeStyles((theme) => ({
    root: {
        touchAction: 'none'
    },
    dialog: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none'
    },
    paper: {
        width: '300px',
        height: '350px',
        ...theme.custom.defaultDialog
    },
    controlBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '3em',
        padding: '0 8px'
    },
    directInputSwitch: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    numericDisplay: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        border: '1px solid ' + theme.palette.border
    },
    knob: {
        [theme.breakpoints.up('sm')]: { marginTop: '100px' },
        [theme.breakpoints.up('md')]: { marginTop: '125px' }
    }
}));

const KnobPad = ({ open, onSet, onClose, initialValue, decimalPlaces, largeIncrementStep, largeDecrementStep, smallIncrementStep,
    smallDecrementStep, minValue, maxValue, loopBack, isDirectInput, allowDirectInput, onDirectInputChanged }) => {
    const classes = useStyles();
    const [dataValue, setDataValue] = useState(0);

    useEffect(() => {
        setDataValue(Number(initialValue));
    }, [initialValue])

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

    const handleClose = () => {
        if (onClose !== undefined)
            onClose();
    }

    const handleKnobValueChanged = (step) => {
        // apply increment or decrement function
        let newValue = calcIncrementDecrementValue(step, dataValue, minValue, maxValue, loopBack, decimalPlaces);

        if (newValue != null)
            setDataValue(newValue);
    }

    return (
        <div className={classes.root}>
            <Dialog aria-labelledby='KeyPad' aria-describedby='KeyPad' className={classes.dialog} open={open} onClose={handleClose}>
                <div className={classes.paper}>
                    <div className={classes.controlBar}>
                        <IconButton color='inherit' aria-label='close' size='medium' onClick={handleClose}>
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
                        <IconButton color='inherit' aria-label='accept' size='medium' onClick={handleOnSet}>
                            <CheckIcon />
                        </IconButton>
                    </div>
                    <div className={classes.numericDisplay}>
                        <Typography variant='h2'>{Number(dataValue).toFixed(decimalPlaces)}</Typography>
                    </div>
                    <div className={classes.knob}>
                        <DualKnob
                            onUpperKnobIncrease={() => handleKnobValueChanged(smallIncrementStep)}
                            onUpperKnobDecrease={() => handleKnobValueChanged(smallDecrementStep)}
                            onLowerKnobIncrease={() => handleKnobValueChanged(largeIncrementStep ?? smallIncrementStep)}
                            onLowerKnobDecrease={() => handleKnobValueChanged(largeDecrementStep ?? smallDecrementStep)}
                            showUpperKnob={largeIncrementStep !== null && largeDecrementStep !== null}>
                        </DualKnob>
                    </div>
                </div>
            </Dialog>
        </div>
    )

}

export default KnobPad;