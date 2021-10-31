import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { darkTheme } from './themes';
import './index.css';
import App from './App';


ReactDOM.render(
    <React.Fragment>
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={darkTheme} >
                <BrowserRouter>
                <Route exact path='/' render={() => <App experimental={false}/>}/>
                <Route exact path='/mappanel' render={() => <App mapPanel={true}/>}/>
                <Route exact path='/webpanel/:planetype/:panel' render={(props) => { window.location.href='/assets/webpanel.html?planetype=' + props.match.params.planetype + '&panel=' + props.match.params.panel }}/>
                <Route exact path='/:format/:planetype/:panel' render={() => <App experimental={true}/>}/>
                </BrowserRouter>
            </ThemeProvider>
        </StyledEngineProvider>
    </React.Fragment>,
    document.getElementById('root')
);