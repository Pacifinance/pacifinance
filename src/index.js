import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router}  from "react-router-dom";
import './index.css';
import AppRouter from './AppRouter';
import Dashboard from './DashboardPage';



ReactDOM.render(
  <React.StrictMode>
    {/* <Dashboard /> */}
    <Router>
      <AppRouter />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);


