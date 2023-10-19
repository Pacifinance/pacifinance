import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router}  from "react-router-dom";
import './index.css';
import AppRouter from './AppRouter';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { PageProvider } from './contexts/PageContext'; // Importa il contesto della pagina attiva

ReactDOM.render(
    <ThemeProvider>
      <UserProvider>
        <PageProvider>
          <React.StrictMode>
            <Router>
              <AppRouter />
            </Router>
          </React.StrictMode>
        </PageProvider>
      </UserProvider>
    </ThemeProvider>,
    document.getElementById('root')
);

{/* <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              </head> */}


//SPUNTO DI RIFLESSIONE:
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();


