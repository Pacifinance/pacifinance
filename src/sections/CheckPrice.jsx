import React from 'react'
import styled from 'styled-components'
import Navbar from '../components/Navbar'
import Analytic from '../components/AnalyticDashboard'
//import Expenses from './Expenses'
function CheckPrice() {
    return (
        <Section>
            <div className="grid">        
                    <Navbar />
                    <Analytic />
            </div>
        </Section>
    )
}
//<Incomes /> 
//<Expenses />  
export default Dashboard
const Section = styled.section `
margin-left: 5vw;
margin-right: 14px;
padding: 2rem;
height: 60rem;
background-color: #F5F5FD;
.grid{ 
    margin-top: 0.5rem;
    z-index: 2;
    width: 80%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
   
}

// `;