import React, {useState, useContext} from 'react'
import styled from 'styled-components'
import AnalyticDashboard from '../components/AnalyticDashboard'
import { ThemeContext } from '../contexts/ThemeContext';
import ModalsCustomStyled from '../contexts/ModalsCustomStyled';

//import Expenses from './Expenses'
function Dashboard() {
    const { theme } = useContext(ThemeContext);
    const { mode } = theme;
    const { TitleDashboard } = ModalsCustomStyled();

    const Section = styled.section `
        font-family: Roboto, sans-serif; 
        margin-left: 6vw;
        padding: 2rem;
        height: 100vh;
        background-color: ${theme.backgroundColor};
        .grid{ 
            margin-top: 2rem;
            z-index: 2;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        
        }`;
    
    

    return (
        <Section>
            <div className="grid"> 
                    <TitleDashboard>Dashboard</TitleDashboard>
                    <AnalyticDashboard />
            </div>
        </Section>
    )
}
  
export default Dashboard;




