import React, { useMemo, useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { useSimConnectData } from '../../../Services/DataProviders/SimConnectDataProvider';
import { simActions } from '../../../Services/ActionProviders/simConnectActionHandler';
import { useLocalStorageData } from '../../../LocalStorageProvider';
import { softkeyLabel, softkeyLabelValue } from './softkeyLabel';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import DualKnob from '../../Control/DualKnob';
import Joystick from '../../Control/Joystick';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        touchAction: 'none'
    },
    softkeys: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0.5em',
        padding: '0 0 0.5em 0',
        width: '95%',
        borderBottom: '1px solid ' + theme.palette.divider
    },
    softkeyGrid: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'

    },
    softkeyGridItem: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    softkeyLabel: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: '0.25em',
        border: '1px solid ' + theme.palette.divider,
        width: '100%',
        height: '1.75em'
    },
    softkeyLabelOn: {
        borderBottom: '0.25em solid rgb(32, 217, 32, 1)',
        width: '40%',
        height: '0'
    },
    softkeyLabelOff: {
        borderBottom: '0.25em solid ' + theme.palette.divider,
        width: '40%',
        height: '0'
    },
    softkeyLabelNotBoolean: {
        width: '40%',
        height: '0.25em'
    },
    softkeyLabelDisable: {
        color: theme.palette.divider
    },
    buttonGridItem: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px !important'
    },
    buttonGridItemBorder: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px !important',
        borderTop: '1px solid ' + theme.palette.divider,
    },
    buttonControls: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        [theme.breakpoints.up('sm')]: { marginTop: '10px' },
        [theme.breakpoints.up('md')]: { marginTop: '20px' }
    },
    knob: {
        [theme.breakpoints.up('sm')]: { width: '230px' },
        [theme.breakpoints.up('md')]: { width: '300px' }
    },
    fmsButtonArduino: {
        [theme.breakpoints.up('sm')]: { width: '130px' },
        [theme.breakpoints.up('md')]: { width: '180px' },
    },
    fmsButton: {
        [theme.breakpoints.up('sm')]: { width: '130px' },
        [theme.breakpoints.up('md')]: { width: '180px' },
        padding: '0 15px'
    },
    knobPush: {
        [theme.breakpoints.up('sm')]: { width: '80px' },
        [theme.breakpoints.up('md')]: { width: '100px' }
    },
    button: {
        width: '4em',
    },
    joystick: {
        [theme.breakpoints.up('sm')]: { width: '180px' },
        [theme.breakpoints.up('md')]: { width: '180px' }
    }
}));

const FmsEntry = ({ functionDisplay }) => {
    const classes = useStyles();
    const { simConnectData } = useSimConnectData();
    const { isUsedArduino } = useLocalStorageData().configurationData;
    const [showMapControl, setShowMapControl] = useState();

    let softKeyValue = {};
    for (let i = 1; i <= 12; i++) {
        softKeyValue['key' + i] = simConnectData[functionDisplay + '_SOFTKEY_' + i + '_LABEL'];
    }

    const raiseEvent = (event, showMap = false) => {
        setShowMapControl(showMap);
        event();
    }

    const handleSoftkeyClick = (digit) => {
        setShowMapControl(false);
        simActions.ProfileSpecific.G1000NXi[functionDisplay].SoftKey.select(digit);
    }

    // To get the label, integer divide the value with 100 (403 / 100 = 4). This will give the label associated with value of 4.

    // To get the bit value for various status of the label, just modular the label value by 100 will give you integer of with 3 bits
    // For example 403 has first and second bits turned on 403 % 100 = 3 (as bit)
    // bit 1 - on if menu is disable
    // bit 2 - on if menu can be toggled 
    // bit 3 - on if menu can be toggled and active
    // when all bits are zero, it is just a regular menu item

    const parseLabelData = (digit) => {
        let dataValue = softKeyValue['key' + digit];
        let bitValues = parseInt((dataValue % 100).toString(2), 2);

        let labelKey = Object.keys(softkeyLabel[functionDisplay]).find(key => softkeyLabel[functionDisplay][key].value === Math.floor(dataValue / 100));
        let labelValueKey = Object.keys(softkeyLabelValue[functionDisplay]).find(key => softkeyLabelValue[functionDisplay][key].value === Math.floor((dataValue % 1) * 100));
        let isEnabled = Boolean(bitValues & 1);
        let isBooleanMenuType = Boolean(bitValues >> 1 & 1);
        let isBooleanMenuStatusActve = Boolean(bitValues >> 2 & 1);

        let labelData = {
            isEmpty: labelKey === undefined,
            labelKey: labelKey,
            labelValueKey: labelValueKey,
            isEnabled: isEnabled,
            isBooleanMenuType: isBooleanMenuType,
            isBooleanMenuStatusActve: isBooleanMenuStatusActve
        };

        return labelData;
    }


    const getLabel = (labelData) => {
        if (labelData.labelKey !== undefined)
            return softkeyLabel[functionDisplay][labelData.labelKey].desc;

        return null;
    }

    const getLabelValue = (labelData) => {
        if (labelData.labelValueKey !== undefined)
            return softkeyLabelValue[functionDisplay][labelData.labelValueKey].desc;

        return null;
    }

    const getActiveStatusClass = (labelData) => {
        if (labelData.isEmpty || !labelData.isBooleanMenuType)
            return classes.softkeyLabelNotBoolean;

        if (labelData.isBooleanMenuStatusActve)
            return classes.softkeyLabelOn;

        return classes.softkeyLabelOff;
    }

    return useMemo(() => (
        <div className={classes.root}>
            <div className={classes.softkeys}>
                <Grid container className={classes.softkeyGrid}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((digit, index) => {
                        let labelData = parseLabelData(digit);
                        return (
                            <Grid key={'softkeyLabel' + index} item xs={1} className={classes.softkeyGridItem}>
                                <div className={[classes.softkeyLabel, (labelData.isEmpty || !labelData.isEnabled) ? classes.softkeyLabelDisable : ''].join(' ')}>
                                    <Typography variant='body1'>{getLabel(labelData)}<span style={{ paddingLeft: '0.4em', color: 'rgb(54, 235, 229, 1)' }}>{getLabelValue(labelData)}</span></Typography>
                                    <div className={getActiveStatusClass(labelData)}>&nbsp;</div>
                                </div>
                                <Button variant="contained" size='small' color='primary' onClick={() => handleSoftkeyClick(digit)} disabled={labelData.isEmpty || !labelData.isEnabled}>
                                    <ArrowDropUpIcon></ArrowDropUpIcon>
                                </Button>
                            </Grid>
                        )
                    })}
                </Grid>
            </div>
            <div className={classes.buttonControls}>
                {!isUsedArduino &&
                    <div className={classes.knob}>
                        <DualKnob
                            showUpperKnob={!showMapControl}
                            onUpperKnobIncrease={() => raiseEvent(simActions.ProfileSpecific.G1000NXi[functionDisplay].FMS.upperInc, showMapControl)}
                            onUpperKnobDecrease={() => raiseEvent(simActions.ProfileSpecific.G1000NXi[functionDisplay].FMS.upperDec, showMapControl)}
                            onLowerKnobIncrease={() => raiseEvent(showMapControl ? simActions.ProfileSpecific.G1000NXi[functionDisplay].MAP.rangeInc : simActions.ProfileSpecific.G1000NXi[functionDisplay].FMS.lowerInc, showMapControl)}
                            onLowerKnobDecrease={() => raiseEvent(showMapControl ? simActions.ProfileSpecific.G1000NXi[functionDisplay].MAP.rangeDec : simActions.ProfileSpecific.G1000NXi[functionDisplay].FMS.lowerDec, showMapControl)}>
                        </DualKnob>
                    </div>
                }
                {(!isUsedArduino && !showMapControl) &&
                    <div className={classes.knobPush}>
                        <Button variant="contained" size='small' color='primary' className={classes.button} onClick={() => raiseEvent(simActions.ProfileSpecific.G1000NXi[functionDisplay].FMS.upperPush)}>PUSH</Button>
                    </div>
                }
                {(!isUsedArduino && showMapControl) &&
                    <div className={classes.joystick}>
                        <Joystick
                            onUpPush={() => raiseEvent(simActions.ProfileSpecific.G1000NXi[functionDisplay].MAP.joystickUp, true)}
                            onDownPush={() => raiseEvent(simActions.ProfileSpecific.G1000NXi[functionDisplay].MAP.joystickDown, true)}
                            onLeftPush={() => raiseEvent(simActions.ProfileSpecific.G1000NXi[functionDisplay].MAP.joystickLeft, true)}
                            onRightPush={() => raiseEvent(simActions.ProfileSpecific.G1000NXi[functionDisplay].MAP.joystickRight, true)}
                            onButtonPush={() => raiseEvent(simActions.ProfileSpecific.G1000NXi[functionDisplay].MAP.joystickPush, true)}>
                        </Joystick>
                    </div>
                }
                <div className={isUsedArduino ? classes.fmsButtonArduino : classes.fmsButton}>
                    <Grid container spacing={5}>
                        <Grid item xs={6} className={classes.buttonGridItem}>
                            <Button variant="contained" size='small' color='primary' className={classes.button} onClick={() => raiseEvent(simActions.ProfileSpecific.G1000NXi[functionDisplay].Menu.directTo)}>D<ArrowRightAltIcon></ArrowRightAltIcon></Button>
                        </Grid>
                        <Grid item xs={6} className={classes.buttonGridItem}>
                            <Button variant="contained" size='small' color='primary' className={classes.button} onClick={() => raiseEvent(simActions.ProfileSpecific.G1000NXi[functionDisplay].Menu.menu)}>MENU</Button>
                        </Grid>
                        <Grid item xs={6} className={classes.buttonGridItem}>
                            <Button variant="contained" size='small' color='primary' className={classes.button} onClick={() => raiseEvent(simActions.ProfileSpecific.G1000NXi[functionDisplay].Menu.flightPlan)}>FPL</Button>
                        </Grid>

                        <Grid item xs={6} className={classes.buttonGridItem}>
                            <Button variant="contained" size='small' color='primary' className={classes.button} onClick={() => raiseEvent(simActions.ProfileSpecific.G1000NXi[functionDisplay].Menu.procedure)}>PROC</Button>
                        </Grid>
                        <Grid item xs={6} className={classes.buttonGridItem}>
                            <Button variant="contained" size='small' color='primary' className={classes.button} onClick={() => raiseEvent(simActions.ProfileSpecific.G1000NXi[functionDisplay].Menu.clear)}>Clr</Button>
                        </Grid>
                        <Grid item xs={6} className={classes.buttonGridItem}>
                            <Button variant="contained" size='small' color='primary' className={classes.button} onClick={() => raiseEvent(simActions.ProfileSpecific.G1000NXi[functionDisplay].Menu.enter)}>Ent</Button>
                        </Grid>
                        <Grid item xs={6} className={classes.buttonGridItemBorder}>
                            <Button variant="contained" size='small' color='primary' className={classes.button} onClick={() => raiseEvent(simActions.ProfileSpecific.G1000NXi[functionDisplay].MAP.select, true)}>MAP</Button>
                        </Grid>
                        <Grid item xs={6} className={classes.buttonGridItemBorder}>
                            <Button variant="contained" size='small' color='primary' className={classes.button} onClick={() => raiseEvent(simActions.ProfileSpecific.G1000NXi[functionDisplay].FMS.select, false)}>FMS</Button>
                        </Grid>
                    </Grid>
                </div>
            </div>
        </div>
    ), [classes,
        isUsedArduino,
        showMapControl,
        softKeyValue.key1,
        softKeyValue.key2,
        softKeyValue.key3,
        softKeyValue.key4,
        softKeyValue.key5,
        softKeyValue.key6,
        softKeyValue.key7,
        softKeyValue.key8,
        softKeyValue.key9,
        softKeyValue.key10,
        softKeyValue.key11,
        softKeyValue.key12])
}

export default FmsEntry;