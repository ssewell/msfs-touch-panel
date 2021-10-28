import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, useParams } from 'react-router-dom';
import './index.css';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { darkTheme } from './themes';
import App from './App';
import LocalStorageProvider from './LocalStorageProvider';

ReactDOM.render(
    <React.Fragment>
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={darkTheme} >
                <LocalStorageProvider initialData={{}}>
                    <BrowserRouter>
                    <Route exact path='/' render={() => <App/>}/>
                    <Route exact path='/buttonpanel/:planetype/:panel/:frameonly' render={() => <App/>}/>
                    <Route exact path='/webpanel/:planetype/:panel' render={(props) => { window.location.href='/assets/panel.html?planetype=' + props.match.params.planetype + '&panel=' + props.match.params.panel }}/>
                    </BrowserRouter>
                </LocalStorageProvider>
            </ThemeProvider>
        </StyledEngineProvider>
    </React.Fragment>,
    document.getElementById('root')
);