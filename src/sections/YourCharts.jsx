import React from 'react'
import AnalyticStatsMonth from '../components/AnalyticStatsMonth'
import AnalyticStatsYear from '../components/AnalyticStatsYear'
import BalanceCharts from '../components/BalanceCharts'
import InOutCharts from '../components/InOutChart'
import { TitleDashboard, Section, SecondaryTitle } from '../contexts/MyStyled';



function YourCharts() {
//     const { TitleDashboard, Section, SecondaryTitle } = MyStyled();

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



