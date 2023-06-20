import React, {useState, useContext} from 'react'
import styled from 'styled-components'
import Navbar from '../components/Navbar'
import Analytic from '../components/AnalyticDashboard'
import { ThemeContext } from '../contexts/ThemeContext';


function CheckPrice() {
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
                    <Navbar />
                    <Analytic />
            </div>
        </Section>
    )
}

export default CheckPrice;
