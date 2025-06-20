import React from 'react'
import { theme } from '../contexts/ThemeContext';
import { Section } from '../contexts/MyStyled';
import FinanceCheckAPI from '../components/FinanceCheckAPI';




function CheckPrice() {
    return (
        <Section theme = {theme}>
           
            <FinanceCheckAPI />
        </Section>
    )
}

export default CheckPrice;