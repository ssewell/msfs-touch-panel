import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
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
                    <Route exact path='/:experimentalItem' render={() => <App/>}/>
                    <Route exact path='/' render={() => <App/>}/>
                    </BrowserRouter>
                </LocalStorageProvider>
            </ThemeProvider>
        </StyledEngineProvider>
    </React.Fragment>,
    document.getElementById('root')
);