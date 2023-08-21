import React from 'react'
import { theme } from '../contexts/ThemeContext';
import { Section, TitleDashboard } from '../contexts/MyStyled';
import FinanceCheckAPI from '../components/FinanceCheckAPI';
import { Title } from 'chart.js';




function CheckPrice() {
    return (
        <Section theme = {theme}>
            <TitleDashboard theme={theme}>Controllo dei mercati</TitleDashboard>
            <FinanceCheckAPI />
        </Section>
    )
}

export default CheckPrice;
