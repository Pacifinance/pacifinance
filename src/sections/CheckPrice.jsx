import React from 'react'
import Navbar from '../components/Navbar'
import Analytic from '../components/AnalyticDashboard'
import { Section } from '../contexts/MyStyled';



function CheckPrice() {
    // const { Section } = MyStyled();
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
