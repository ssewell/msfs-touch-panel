import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { simActions } from '../../../Services/ActionProviders/simConnectActionHandler';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import PfdEntry from './PfdEntry';
import MfdEntry from './MfdEntry';


const useStyles = makeStyles((theme) => ({
    section: theme.custom.panelSection,
    button: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    }
}));

const Fms = () => {
    const classes = useStyles();
    const [mfdEntryOpen, setMfdEntryOpen] = useState(false);
    const [pfdEntryOpen, setPfdEntryOpen] = useState(false);

    const handlePFDEntryOpen = () => {
        setPfdEntryOpen(true);
        simActions.ProfileSpecific.G1000NXi.PFD.FMS.select();
    }

    const handlePfdEntryClose = () => {
        setPfdEntryOpen(!pfdEntryOpen);
    }

    const handleMFDEntryOpen = () => {
        setMfdEntryOpen(true);
        simActions.ProfileSpecific.G1000NXi.MFD.FMS.select();
    }

    const handleMfdEntryClose = () => {
        setMfdEntryOpen(!mfdEntryOpen);
    }

    return (
        <div className={classes.section}>
            <Grid container>
                <Grid item xs={3} className={classes.button}>
                    <Typography variant='body1'>FMS</Typography>
                </Grid>
                <Grid item xs={9} className={classes.button}>
                    <Button variant="contained" size='small' color='primary' onClick={handlePFDEntryOpen}>PFD</Button>
                    <Button variant="contained" size='small' color='primary' onClick={handleMFDEntryOpen}>MFD</Button>
                </Grid>
            </Grid>
            <PfdEntry
                open={pfdEntryOpen}
                onClose={handlePfdEntryClose}>
            </PfdEntry>
            <MfdEntry
                open={mfdEntryOpen}
                onClose={handleMfdEntryClose}>
            </MfdEntry>
        </div>
    )
}

export default Fms;