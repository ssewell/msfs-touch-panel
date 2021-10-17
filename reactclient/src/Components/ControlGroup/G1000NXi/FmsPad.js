import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FmsEntry from './FmsEntry';

const useStyles = makeStyles((theme) => ({
    dialog: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none'
    },
    paper: {
        width: '430px',
        height: '310px',
        ...theme.custom.defaultDialog
    },
    controlBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid ' + theme.palette.divider,
        height: '3em'
    },
}));

const FmsPad = ({ open, onClose}) => {
    const classes = useStyles();

    const handleClose = () => {
        if (onClose !== undefined)
            onClose();
    }

    return (
        <div>
            <Dialog aria-labelledby='KeyPad' aria-describedby='KeyPad' className={classes.dialog} open={open} onClose={handleClose}>
                <div className={classes.paper}>
                    <div className={classes.controlBar}>
                        <IconButton color='inherit' aria-label='close' size='medium' style={{ paddingLeft: '0.5em' }} onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                    <FmsEntry></FmsEntry>
                </div>
            </Dialog>
        </div>
    )
}

export default FmsPad;