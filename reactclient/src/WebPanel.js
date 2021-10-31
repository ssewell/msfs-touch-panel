
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import Container from '@mui/material/Container';
import ApplicationBar from './Experimental/ApplicationBar';
import G1000NXiPanel from './Experimental/g1000NXiPanel';
import TelemetryPanel from './Experimental/TelemetryPanel';
import MapPanel from './Components/Panel/Default/MapPanel';

const useStyles = makeStyles((theme) => ({
    rootFullWidth: {
        [theme.breakpoints.up('sm')]: { fontSize: '12px' },
        [theme.breakpoints.up('md')]: { fontSize: '16px' },
        [theme.breakpoints.up('lg')]: { fontSize: '18px' },
        [theme.breakpoints.up('xl')]: { fontSize: '18px' },
        padding: 0,
        maxWidth: '100vw',
        display: 'grid',
        overflow: 'hidden',
        height: '100%'
    },
    appbar: {
        touchAction: 'none',
        position: 'fixed',
        width: '100vw',
        maxWidth: 'inherit',
        zIndex: 10000,
    },
    aspectRatioPanelContainer: {
        position: 'relative',
        marginTop: '60px',
        margin: '0 auto',
        height: '92vh',
        width: 'calc(92vh * 1408/914)'
        //aspectRatio: '1408/914',            // PFD/MFD background image aspect ratio (width/height)
    },
    aspectRatioContentMfd: {
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        height: '100%',
        width: '100%',
        backgroundColor: 'transparent'
    },
    mappanel: {
        height: '100%',
        width: '100%',
        zIndex: 1000,
        overflow: 'hidden',
        touchAction: 'none',
    },
}));

const WebPanel = ({experimentalClick}) => {
    const classes = useStyles();
    const [ mapOpen, setMapOpen] = useState(false);
    const { planetype, panel, format = 'buttonpanel' } = useParams();

    useEffect(() => {
        if(format === 'framepanel')
            document.body.style.backgroundColor = 'transparent';
        else
            document.body.style.backgroundColor = 'black';
    }, []);

    return (
        <Container className={classes.rootFullWidth}>
             <div className={classes.appbar}>
                <ApplicationBar
                    mapOpenChanged={() => setMapOpen(!mapOpen)}
                    experimentalOpenChanged={() => experimentalClick()}>
                </ApplicationBar>
                {(planetype === undefined || planetype.toLowerCase() === 'g1000nxi') && 
                    <TelemetryPanel></TelemetryPanel>
                }
            </div>
            {(planetype === undefined || planetype.toLowerCase() === 'g1000nxi') &&
                 <div className={classes.aspectRatioPanelContainer}>
                    { mapOpen && 
                        <div className={classes.mappanel} >
                            <MapPanel></MapPanel>
                        </div>
                    }
                    <div className={classes.aspectRatioContentMfd} style={{display: !mapOpen ? 'inherit' : 'none'}}>
                        <G1000NXiPanel panel={panel === undefined ? 'PFD' : panel.toUpperCase()} frameonly={format.toLowerCase() !== 'buttonpanel'}></G1000NXiPanel>
                    </div>
                </div>
            }
        </Container>
    )
}

export default WebPanel
