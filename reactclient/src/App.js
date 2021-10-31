
import React, { useState } from 'react';
import LocalStorageProvider from './Services/LocalStorageProvider';
import SimConnectDataProvider from './Services/DataProviders/SimConnectDataProvider';
import CssBaseline from '@mui/material/CssBaseline';
import makeStyles from '@mui/styles/makeStyles';
import TouchPanel from './TouchPanel';
import WebPanel from './WebPanel';
import MapPanel from './Components/Panel/Default/MapPanel';


const useStyles = makeStyles((theme) => ({
    mapLayout: {
        touchAction: 'none',
    },
    mappanel: {
        height: '100vh',
    },
}));

const App = ({experimental, mapPanel = false}) => {
    const classes = useStyles();
    const [ experimentalOpen, setExperimentalOpen] = useState(experimental);

    return (
        <LocalStorageProvider initialData={{}}>
            <SimConnectDataProvider>
                <CssBaseline />
                { !mapPanel && !experimentalOpen && <TouchPanel experimentalClick={() => setExperimentalOpen(true)}></TouchPanel> }
                { !mapPanel && experimentalOpen && <WebPanel experimentalClick={() => setExperimentalOpen(false)}></WebPanel> }
                { mapPanel &&
                    <div className={classes.mappanel} >
                        <MapPanel showTelemetry={false}></MapPanel>
                    </div>
                }
            </SimConnectDataProvider>
        </LocalStorageProvider>
    );
}

export default App
