
import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SimConnectDataProvider from './Services/DataProviders/SimConnectDataProvider';
import { useLocalStorageData } from './LocalStorageProvider';
import makeStyles from '@mui/styles/makeStyles';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import ApplicationBar from './Components/ApplicationBar';
import PanelContainer from './Components/Panel/PanelContainer';
import G1000PfdPanel from './Experimental/g1000PfdPanel';
import G1000NXiPanel from './Experimental/g1000NXiPanel';

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
    rootFullWidth: {
        [theme.breakpoints.up('sm')]: { fontSize: '12px' },
        [theme.breakpoints.up('md')]: { fontSize: '16px' },
        [theme.breakpoints.up('lg')]: { fontSize: '18px' },
        [theme.breakpoints.up('xl')]: { fontSize: '18px' },
        padding: 0,
        maxWidth: '100vw',
        display: 'grid',
        overflow: 'hidden',
        maxHeight: '100vh',
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
    aspectRatioPanelContainer: {
        paddingTop: '35px',
    },
    aspectRatioContentPfd: {
        width: '100%',
        aspectRatio: '1408/914',            // PFD with mid panel background image aspect ratio (width/height)
        overflow: 'hidden',
        display: 'flex',
        maxHeight: '95vh',
        margin: '0 auto',
        backgroundColor: 'transparent'
    },
    aspectRatioContentMfd: {
        width: '100%',
        aspectRatio: '1408/914',            // PFD/MFD background image aspect ratio (width/height)
        overflow: 'hidden',
        display: 'flex',
        maxHeight: '95vh',
        margin: '0 auto',
        backgroundColor: 'transparent'
    }
}));

const App = () => {
    const classes = useStyles();
    const { configurationData } = useLocalStorageData();
    const [ mapOpen, setMapOpen] = useState(false);
    const { experimentalItem } = useParams();
    const [ experimentalOpen, setExperimentalOpen] = useState(!(experimentalItem == undefined));

    useEffect(() => {
        if(experimentalOpen)
            document.body.style.backgroundColor = 'transparent';
    }, []);

    const handleExperimentalOpenChanged = () => {
        if(experimentalItem !== undefined)
            setExperimentalOpen(!experimentalOpen)
    }

    return useMemo(() => (
       
            <SimConnectDataProvider>
                <CssBaseline />
                <Container className={!experimentalOpen ? classes.rootUseMediaQueryWidth : classes.rootFullWidth}>
                    <div className={classes.appbar}>
                        <ApplicationBar
                            mapOpenChanged={() => setMapOpen(!mapOpen)}
                            experimentalOpenChanged={() =>  handleExperimentalOpenChanged()}
                            experimentalLabel={experimentalItem == undefined ? null : experimentalItem.toUpperCase()}>
                        </ApplicationBar>
                    </div>
                    {experimentalOpen && experimentalItem != undefined &&
                        <div className={classes.aspectRatioPanelContainer}>
                            <div className={classes.aspectRatioContentMfd}>
                                <G1000NXiPanel functionDisplay={experimentalItem.toUpperCase()}></G1000NXiPanel>
                            </div>
                        </div>
                    }
                    {!experimentalOpen &&
                        <div className={classes.panelContainer}>
                            <PanelContainer mapOpen={mapOpen}></PanelContainer>
                        </div>
                    }
                </Container>
            </SimConnectDataProvider>
    ), [classes, configurationData, mapOpen, experimentalOpen, experimentalItem]);
}

export default App
