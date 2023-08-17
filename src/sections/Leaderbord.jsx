import React from 'react'
import RankingComponent from '../components/RankingComponent'
import { TitleDashboard, Section } from '../contexts/MyStyled';
// import MyStyled from '../contexts/MyStyled';

//import Expenses from './Expenses'
function Dashboard() {
    // const { TitleDashboard, Section } = MyStyled();
    
    

    return (
        <Section>
            <div className="grid"> 
                    <TitleDashboard>Classifiche nel tempo</TitleDashboard>
                    <RankingComponent />
            </div>
        </Section>
    )
}
  
export default Dashboard;