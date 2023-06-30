import React, {useState, useContext} from 'react'
import styled from 'styled-components'
import NavbarCharts from '../components/NavbarCharts'
import AnalyticStatsMonth from '../components/AnalyticStatsMonth'
import AnalyticStatsYear from '../components/AnalyticStatsYear'
import BalanceCharts from '../components/BalanceCharts'
import InOutCharts from '../components/InOutChart'
import { ThemeContext } from '../contexts/ThemeContext';
import ModalsCustomStyled from '../contexts/ModalsCustomStyled';



function YourCharts() {
    const { theme } = useContext(ThemeContext);
    const { mode } = theme;
    const { TitleDashboard } = ModalsCustomStyled();
    const SecondaryTitle = styled.h2 `
        font-size: 1rem;
        color: ${theme.textColor};
        margin-left: 2rem;
    `;
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
        
        }
    `;

    return (
        <Section>
            <div className="grid">        
                    {/* <NavbarCharts /> */}
                    <TitleDashboard>Le tue Statistiche</TitleDashboard>
                    <SecondaryTitle>- rispetto al mese precedente</SecondaryTitle>
                    <AnalyticStatsMonth />
                    <SecondaryTitle>- rispetto allo stesso mese dell'anno precedente</SecondaryTitle>
                    <AnalyticStatsYear />
                    <TitleDashboard>I tuoi Grafici nei mesi</TitleDashboard>
                    <SecondaryTitle> - check del portafoglio nei mesi</SecondaryTitle>
                    <BalanceCharts />
                    <SecondaryTitle>- check delle entrate e delle uscite nei mesi</SecondaryTitle>
                    <InOutCharts />
            </div>
        </Section>
    )
}

export default YourCharts;



