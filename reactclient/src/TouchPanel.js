import React, { useMemo, useState, useEffect } from 'react';
import { useLocalStorageData } from './Services/LocalStorageProvider';
import makeStyles from '@mui/styles/makeStyles';
import Container from '@mui/material/Container';
import ApplicationBar from './Components/ApplicationBar';
import PanelContainer from './Components/Panel/PanelContainer';

const useStyles = makeStyles((theme) => ({
    rootUseMediaQueryWidth: {
        [theme.breakpoints.up('sm')]: { fontSize: '12px' },
        [theme.breakpoints.up('md')]: { fontSize: '16px' },
        [theme.breakpoints.up('lg')]: { fontSize: '18px' },
        [theme.breakpoints.up('xl')]: { fontSize: '18px' },
        padding: 0,
        backgroundColor: theme.palette.background.default,
        height: '100vh',
        margin: '0 auto',
    },
    appbar: {
        touchAction: 'none',
        position: 'fixed',
        width: '100vw',
        maxWidth: 'inherit',
        zIndex: 100,
    },
    panelContainer: {
        paddingTop: '35px',
    },
}));

const TouchPanel = ({experimentalClick}) => {
    const classes = useStyles();
    const { configurationData } = useLocalStorageData();
    const [ mapOpen, setMapOpen] = useState(false);

    useEffect(() => {
        document.body.style.backgroundColor = 'rgb(17, 19, 24, 1)';
    }, []);


    return useMemo(() => (
       <Container className={classes.rootUseMediaQueryWidth}>
            <div className={classes.appbar}>
                <ApplicationBar 
                    mapOpenChanged={() => setMapOpen(!mapOpen)}
                    experimentalOpenChanged={() => experimentalClick()}>
                </ApplicationBar>
            </div>
            <div className={classes.panelContainer}>
                <PanelContainer mapOpen={mapOpen}></PanelContainer>
            </div>
        </Container>
    ), [classes, configurationData, mapOpen]);
}

export default TouchPanel
