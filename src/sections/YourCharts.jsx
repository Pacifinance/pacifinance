import React from 'react'
import styled from 'styled-components'
import NavbarCharts from '../components/NavbarCharts'
import AnalyticCharts from '../components/AnalyticCharts'
import BalanceCharts from '../components/BalanceCharts'
import InOutCharts from '../components/InOutChart'
//import Expenses from './Expenses'
function Dashboard() {
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
//<Incomes /> 
//<Expenses />  
export default Dashboard
const Section = styled.section `
font-family: Roboto, sans-serif;
margin-left: 5vw;
margin-right: 14px;
padding: 2rem;
height: 60rem;
background-color: #3d3d3d;
.grid{ 
    margin-top: 0.5rem;
    z-index: 2;
    width: 80%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
   
}

// `;



