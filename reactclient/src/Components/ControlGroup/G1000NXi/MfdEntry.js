import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Dialog from '@mui/material/Dialog';
import FmsEntry from './FmsEntry';

const useStyles = makeStyles((theme) => ({
    dialog: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
    },
    paper: {
        [theme.breakpoints.up('sm')]: { width: '700px', height: '400px !important' },
        [theme.breakpoints.up('md')]: { width: '860px', height: '360px !important' },
        [theme.breakpoints.up('lg')]: { width: '1000px', height: '360px !important' },
        [theme.breakpoints.up('xl')]: { width: '1180px', height: '360px' },
        ...theme.custom.defaultDialog,
    }
}));

const MfdEntry = ({ open, onClose }) => {
    const classes = useStyles();

    const handleClose = () => {
        if (onClose !== undefined)
            onClose();
    }

    return (
        <div>
            <Dialog aria-labelledby='KeyPad' aria-describedby='KeyPad' className={classes.dialog} open={open} onClose={handleClose} maxWidth='xl'>
                <div className={classes.paper}>
                    <FmsEntry functionDisplay={'MFD'}></FmsEntry>
                </div>
            </Dialog>
        </div>
    )
}

export default MfdEntry;