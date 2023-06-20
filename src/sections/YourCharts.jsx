import React, {useState, useContext} from 'react'
import styled from 'styled-components'
import NavbarCharts from '../components/NavbarCharts'
import AnalyticCharts from '../components/AnalyticCharts'
import BalanceCharts from '../components/BalanceCharts'
import InOutCharts from '../components/InOutChart'
import { ThemeContext } from '../contexts/ThemeContext';



function Dashboard() {
    const { theme } = useContext(ThemeContext);
    const { mode } = theme;

    const Section = styled.section `
    font-family: Roboto, sans-serif;
    margin-left: 5vw;
    margin-right: 14px;
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
    
    }

    // `;
    return (
        <Section>
            <div className="grid">        
                    <NavbarCharts />
                    <AnalyticCharts />
                    <BalanceCharts />
                    <InOutCharts />
            </div>
        </Section>
    )
}

export default Dashboard;



