
import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SimConnectDataProvider from './Services/DataProviders/SimConnectDataProvider';
import { useLocalStorageData } from './LocalStorageProvider';
import makeStyles from '@mui/styles/makeStyles';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import ApplicationBar from './Components/ApplicationBar';
import PanelContainer from './Components/Panel/PanelContainer';
import G1000Panel from './Experimental/g1000Panel';

const useStyles = makeStyles((theme) => ({
    root: {
        [theme.breakpoints.up('sm')]: { fontSize: '12px' },
        [theme.breakpoints.up('md')]: { fontSize: '16px' },
        [theme.breakpoints.up('lg')]: { fontSize: '18px' },
        [theme.breakpoints.up('xl')]: { fontSize: '18px' },
        padding: 0,
    },
    rootUseMediaQueryWidth: {
        backgroundColor: theme.palette.background.default,
        height: '100vh',
        margin: '0 auto',
    },
    rootFullWidth: {
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
    aspectRatioContent: {
        width: '100%',
        aspectRatio: '1412/917',            // PFD / MFD background image aspect ratio (width/height)
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
        <div className={!experimentalOpen ? classes.rootUseMediaQueryWidth : classes.rootFullWidth}>
            <SimConnectDataProvider>
                <CssBaseline />
                <Container className={classes.root}>
                    <div className={classes.appbar}>
                        <ApplicationBar
                            mapOpenChanged={() => setMapOpen(!mapOpen)}
                            experimentalOpenChanged={() =>  handleExperimentalOpenChanged()}
                            experimentalLabel={experimentalItem == undefined ? null : experimentalItem.toUpperCase()}>
                        </ApplicationBar>
                    </div>
                    {experimentalOpen &&
                        <div className={classes.aspectRatioPanelContainer}>
                            <div className={classes.aspectRatioContent}>
                                <G1000Panel functionDisplay={experimentalItem == undefined ? null : experimentalItem.toUpperCase()}></G1000Panel>
                            </div>
                        </div>
                    }
                    {!experimentalOpen &&
                        <div className={classes.panelContainer}>
                            <PanelContainer mapOpen={mapOpen}></PanelContainer>
                        </div>
                    }
                </Container>
            </SimConnectDataProvider >
        </div>
    ), [classes, configurationData, mapOpen, experimentalOpen, experimentalItem]);
}

export default App
