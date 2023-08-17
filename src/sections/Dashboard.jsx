import React, {useState, useContext} from 'react'
// import styled from 'styled-components'
import AnalyticDashboard from '../components/AnalyticDashboard'
// import { ThemeProvider } from '../contexts/ThemeContext';
import { TitleDashboard, Section } from '../contexts/MyStyled';
// import MyStyled from '../contexts/MyStyled';

function Dashboard() {
    // const { theme } = useContext(ThemeContext);
    // const { mode } = theme;
    // const { TitleDashboard, Section } = MyStyled();
    
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




