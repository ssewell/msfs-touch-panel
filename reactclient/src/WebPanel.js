import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWindowDimensions } from './Components/Util/hooks';
import makeStyles from '@mui/styles/makeStyles';
import Container from '@mui/material/Container';
import ApplicationBar from './Experimental/ApplicationBar';
import TelemetryPanel from './Experimental/TelemetryPanel';
import MapPanel from './Components/Panel/Default/MapPanel';
import PopoutPanelContainer from './Experimental/PopoutPanelContainer';
import { POPOUT_PANEL_INFO } from './Experimental/PopoutPanelInfo';

const useStyles = props => makeStyles((theme) => ({
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
    g1000NXiContainerBase: {
        position: 'relative',
        backgroundColor: 'transparent',
        touchAction: 'none',
        margin: '3.5em auto 0 auto', 
    },
    g1000NXiContainer: {
        position: 'relative',
        backgroundColor: 'transparent',
        margin: '3.5em auto 0 auto', 
        height: `calc(${props.windowHeight - 1}px - 3.6em)`, 
        aspectRatio: 1
    },
    panelContainer: {
        position: 'relative',
        backgroundColor: 'transparent',
        margin: '2em auto 0 auto', 
        height: `calc(${props.windowHeight - 1}px - 2em)`,
        aspectRatio: 1
    },
}));

const WebPanel = ({experimentalClick}) => {
    const classes = useStyles(useWindowDimensions())();
    const [ mapOpen, setMapOpen] = useState(false);
    const { planetype = 'undefined', panel, format = 'buttonpanel' } = useParams();
        
    useEffect(() => {
        if(format === 'framepanel')
            document.body.style.backgroundColor = 'transparent';
        else
            document.body.style.backgroundColor = 'black';
    }, []);

    let panelInfo = POPOUT_PANEL_INFO.find(x => x.planetype === planetype && x.panel === panel);
    if(panelInfo === undefined)
        panelInfo = { planetype: planetype, panel: panel, width: '100%', height: '100%', panelRatio: 1, definitions: [], styles: props => makeStyles({}) }; 

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
            {panelInfo !== undefined && planetype.toLowerCase() === 'g1000nxi' &&
                <div className={classes.g1000NXiContainer} style={{aspectRatio: String(panelInfo.panelRatio)}}>
                    { mapOpen && <MapPanel /> }
                    <PopoutPanelContainer panelInfo={panelInfo} frameonly={format.toLowerCase() !== 'buttonpanel'} />
                </div>
            }
            {planetype.toLowerCase() !== 'g1000nxi' &&
                <div className={classes.panelContainer} style={{aspectRatio: String(panelInfo.panelRatio)}}>
                    <PopoutPanelContainer panelInfo={panelInfo} frameonly={format.toLowerCase() !== 'buttonpanel'} />
                </div>
            }
        </Container>
    )
}

export default WebPanel