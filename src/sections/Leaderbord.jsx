import React, {useContext} from 'react'
import RankingComponent from '../components/RankingComponent'
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { TitleDashboard, Section } from '../contexts/MyStyled';


function Dashboard() {
    const { theme } = useContext(ThemeContext);
    const { userData, handleSetIsUpdated } = useContext(UserContext);
    
    
    return (
        <Section theme={theme}>
            <div className="grid"> 
                    <TitleDashboard theme={theme}>Classifiche nel tempo</TitleDashboard>
                    <RankingComponent />
            </div>
        </Section>
    )
}
  
export default Dashboard;