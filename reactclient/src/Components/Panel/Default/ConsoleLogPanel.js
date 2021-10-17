import React, { useEffect, useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { Typography } from '@mui/material';
import { Hook, Console, Unhook } from 'console-feed'

const useStyles = makeStyles((theme) => ({
    root: {
        ...theme.custom.defaultRoot,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        padding: '0.5em'
    }
}));

const ConsoleLogPanel = () => {
    const classes = useStyles();
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        Hook(
            window.console,
            (log) => setLogs([log]),
            false
        )

        return () => Unhook(window.console);
    }, [])

    return (
        <div className={classes.root}>
            <Typography variant={'body1'} style={{ width: '7em' }}>Console Log:</Typography>
            <Console logs={logs} variant="dark" />
        </div>
    )
}

export default ConsoleLogPanel;