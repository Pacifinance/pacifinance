import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router}  from "react-router-dom";
import './index.css';
import AppRouter from './AppRouter';
import { ThemeProvider } from './contexts/ThemeContext';


ReactDOM.render(
  <ThemeProvider>
    <React.StrictMode>
      <Router>
        <AppRouter />
      </Router>
    </React.StrictMode>
  </ThemeProvider>,
  document.getElementById('root')
);

//SPUNTO DI RIFLESSIONE:
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();


