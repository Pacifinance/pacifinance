import React, {useState, useContext} from 'react'
import styled from 'styled-components'
import Navbar from '../components/Navbar'
import Notification from '../components/Notification'
import Analytic from '../components/AnalyticDashboard'
import { ThemeContext } from '../contexts/ThemeContext';

//import Expenses from './Expenses'
function Dashboard() {
    const { theme } = useContext(ThemeContext);
    const { mode } = theme;

    const Section = styled.section `
        font-family: Roboto, sans-serif; 
        margin-left: 6vw;
        padding: 2rem;
        height: 60rem;
        background-color: ${theme.backgroundColor};
        .grid{ 
            margin-top: 0.5rem;
            z-index: 2;
            width: 80%;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        
        }`;

    return (
        <Section>
            <div className="grid"> 
                    {/* <Notification />       */}
                    <Navbar />
                    <Analytic />
            </div>
        </Section>
    )
}
  
export default Dashboard;




