import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { useLocalStorageData } from '../../Services/LocalStorageProvider';
import { Typography } from '@mui/material';
import SevenSegmentDisplay from '../Control/SevenSegmentDisplay';
import NumPad from '../ControlDialog/NumPad';
import StepperPad from '../ControlDialog/StepperPad'
import KnobPad from '../ControlDialog/KnobPad';

const useStyles = makeStyles((theme) => ({
    segmentContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    digitContainer: {
        ...theme.custom.sevenDigitPanelContainer,
        paddingRight: '4px'
    },
    digitClickableContainer: {
        ...theme.custom.sevenDigitPanelClickableContainer,
        paddingRight: '4px'
    },
    segmentDisplayLabel: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '0.4em',
        padding: '0em 1em 0em 1em',
        width: '3em'
    }
}));

const NumericEntryDisplay = ({ id, initialValue, labelLeft, labelRight, numberOfDigit, numberOfDisplayDigit, decimalPlaces, minValue, maxValue, loopBack, disableNumPadKeys,
    largeIncrementStep, smallIncrementStep, largeDecrementStep, smallDecrementStep, onSelect, onSet, disableEntry, allowDirectInput, usedByArduino, onColor, stepperOnly }) => {

    const classes = useStyles();
    const { configurationData, updateConfigurationData } = useLocalStorageData();
    const { isUsedArduino, planeProfile } = configurationData;
    const [keyPadOpen, setKeyPadOpen] = useState(false);

    let disabled = (isUsedArduino && usedByArduino) || disableEntry;

    if(isNaN(initialValue)) initialValue = 0;

    const handleOpen = () => {
        if (!disabled)
            setKeyPadOpen(!keyPadOpen);
    }

    const handleClose = () => {
        if (!disabled)
            setKeyPadOpen(!keyPadOpen);
    }

    const handleOnClick = () => {
        if (onSelect != null)
            onSelect(this, null);
    }

    const handleOnSet = (value) => {
        if (!disabled && onSet !== null)
            onSet(value);
    }

    const handleDirectInputChanged = (value) => {
        let updatedData = { ...configurationData };
        updatedData['directInput_' + id] = value;
        updateConfigurationData(updatedData);
    }

    return (
        <div>
            <div className={classes.segmentContainer} >
                {labelLeft !== null &&
                    <Typography className={classes.segmentDisplayLabel} variant='body1'>{labelLeft}</Typography>
                }
                <div className={disableEntry ? classes.digitContainer : classes.digitClickableContainer}
                    onClick={() => { handleOpen(); handleOnClick(); }}>
                    <SevenSegmentDisplay
                        numberOfDigit={numberOfDigit}
                        numberOfDisplayDigit={numberOfDisplayDigit}
                        decimalPlaces={decimalPlaces}
                        value={initialValue}
                        onColor={onColor}>
                    </SevenSegmentDisplay>
                </div>
                {labelRight !== null &&
                    <Typography className={classes.segmentDisplayLabel} variant='body1'>{labelRight}</Typography>
                }
            </div>
            {!disabled && keyPadOpen && configurationData['directInput_' + id] &&
                <NumPad
                    open={keyPadOpen}
                    onSet={handleOnSet}
                    numberOfDigit={numberOfDigit}
                    decimalPlaces={decimalPlaces}
                    onClose={handleClose}
                    minValue={minValue}
                    maxValue={maxValue}
                    disableNumPadKeys={disableNumPadKeys}
                    isDirectInput={configurationData['directInput_' + id]}
                    allowDirectInput={allowDirectInput}
                    onDirectInputChanged={handleDirectInputChanged}>
                </NumPad>
            }
            {!disabled && keyPadOpen && !configurationData['directInput_' + id] &&
                ((stepperOnly === undefined && !configurationData['numericInputTypeStepper'] &&
                    <KnobPad
                        open={keyPadOpen}
                        onSet={handleOnSet}
                        onClose={handleClose}
                        initialValue={initialValue}
                        minValue={minValue}
                        maxValue={maxValue}
                        decimalPlaces={decimalPlaces}
                        largeIncrementStep={largeIncrementStep}
                        smallIncrementStep={smallIncrementStep}
                        largeDecrementStep={largeDecrementStep}
                        smallDecrementStep={smallDecrementStep}
                        loopBack={loopBack}
                        planeProfile={planeProfile}
                        isDirectInput={!configurationData['directInput_' + id]}
                        allowDirectInput={allowDirectInput}
                        onDirectInputChanged={handleDirectInputChanged}>
                    </KnobPad>
                )
                ||
                ((stepperOnly || configurationData['numericInputTypeStepper']) &&
                    <StepperPad
                        open={keyPadOpen}
                        onSet={handleOnSet}
                        onClose={handleClose}
                        initialValue={initialValue}
                        minValue={minValue}
                        maxValue={maxValue}
                        decimalPlaces={decimalPlaces}
                        largeIncrementStep={largeIncrementStep}
                        smallIncrementStep={smallIncrementStep}
                        largeDecrementStep={largeDecrementStep}
                        smallDecrementStep={smallDecrementStep}
                        loopBack={loopBack}
                        planeProfile={planeProfile}
                        isDirectInput={!configurationData['directInput_' + id]}
                        allowDirectInput={allowDirectInput}
                        onDirectInputChanged={handleDirectInputChanged}>
                    </StepperPad>
                ))
            }
        </div>
    )
}

NumericEntryDisplay.defaultProps = {
    initialValue: 0,
    labelLeft: null,
    labelRight: null,
    numberOfDigit: 0,
    numberOfDisplayDigit: 1,
    decimalPlaces: 0,
    minValue: 0,
    maxValue: 0,
    loopBack: false,
    largeIncrementStep: null,
    smallIncrementStep: 1,
    largeDecrementStep: null,
    smallDecrementStep: -1,
    disableNumPadKeys: [],
    disableEntry: false,
    usedByArduino: true,
    allowDirectInput: true
};

export default NumericEntryDisplay;