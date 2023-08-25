import React, {useState, useContext} from 'react'
import AnalyticDashboard from '../components/AnalyticDashboard'
import { ThemeContext } from '../contexts/ThemeContext';
import { TitleDashboard, Section } from '../contexts/MyStyled';

function Dashboard() {
    const { theme } = useContext(ThemeContext);
    
    return (
        <Section theme={theme}>
            <TitleDashboard theme={theme}>Dashboard</TitleDashboard>
            <AnalyticDashboard /> 
        </Section>
    )
}
  
export default Dashboard;




