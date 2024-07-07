import React, {useState, useContext} from 'react';
import BalancesStatsMonth from '../components/BalancesStatsMonth';
import BalancesStatsYear from '../components/BalancesStatsYear';
import BalancesCharts from '../components/BalancesCharts';
import BalancesLinesCharts from '../components/BalancesLinesChart';
import InOutCharts from '../components/InOutChart';
import PercentageExpensesChart from '../components/PercentageExpensesChart';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { ModifiedTitleDashboard, StyledSectionStats, ButtonGroup, MySectionButton, SecondaryTitle } from '../styles/MyStyled';
import InExStatsMonth from '../components/InExStatsMonth';
import InExStatsYear from '../components/InExStatsYear';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { CustomTick } from '../utils/customGraphsInfo';
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';



export default function StatsCharts() {
    const { userData } = useContext(UserContext);
    const { theme } = useContext(ThemeContext);
    const { language } = useContext(LanguageContext);
    const { isHidden } = useContext(PrivacyContext);
    const [activePage, setActivePage] = useState("statsBilancio");
    const formattedPreMonthDate = userData?.preMonthDate
      ? new Date(userData.preMonthDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' })
      : "";

    const formattedPreYearSameMonthDate = userData?.preYearSameMonthDate
      ? new Date(userData.preYearSameMonthDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' })
      : "";
    

    const handlePageChange = (page) => {
        setActivePage(page);
    };

    const renderPage = () => {
        if (activePage === "statsBilancio") {
          return (
            
            <>
                <SecondaryTitle theme={theme}>{languages[language].graphs.statsBalance.titleGraph}</SecondaryTitle>
                <BalancesLinesCharts theme={theme} userData={userData} isHidden={isHidden} CustomTick={CustomTick}/>
                <SecondaryTitle theme={theme}>{languages[language].graphs.statsBalance.titleGraph2}</SecondaryTitle>
                <BalancesCharts theme={theme} userData={userData} isHidden={isHidden} CustomTick={CustomTick}/>
                <SecondaryTitle theme={theme}>{languages[language].graphs.statsBalance.detailedVision}</SecondaryTitle>
                <BalancesStatsMonth theme={theme} userData={userData} isHidden={isHidden}/>
                <BalancesStatsYear theme={theme} userData={userData} isHidden={isHidden}/>
                
            </>
          );
        } else if (activePage === "statsIncomesExpenses") {
          return (
            <>
                <SecondaryTitle theme={theme}>{languages[language].graphs.statsExpenses.titleGraph}</SecondaryTitle>
                <InOutCharts theme={theme} userData={userData} isHidden={isHidden} CustomTick={CustomTick}/>
                <SecondaryTitle theme={theme}>{languages[language].graphs.statsExpenses.titleGraph2}</SecondaryTitle>
                <PercentageExpensesChart theme={theme} userData={userData} isHidden={isHidden}/>
                <SecondaryTitle theme={theme}>{languages[language].graphs.statsExpenses.detailedVision}</SecondaryTitle>
                <SecondaryTitle theme={theme}>{languages[language].graphs.statsExpenses.titleDetailsMonth} - {formattedPreMonthDate}</SecondaryTitle>
                <InExStatsMonth theme={theme} userData={userData} isHidden={isHidden}/>
                <SecondaryTitle theme={theme}>{languages[language].graphs.statsExpenses.titleDetailsYear} - {formattedPreYearSameMonthDate}</SecondaryTitle>
                <InExStatsYear theme={theme} userData={userData} isHidden={isHidden}/>
                
            </>
          );
        }
      };

    return (
        <StyledSectionStats theme={theme}>
            <ModifiedTitleDashboard theme={theme} >Le tue Statistiche</ModifiedTitleDashboard>
            <ButtonGroup theme={theme} variant="contained" aria-label="outlined primary button group">
              <MySectionButton
                theme={theme}
                onClick={() => handlePageChange("statsBilancio")}
                style={{
                  backgroundColor:
                    activePage === "statsBilancio" ? "" : "#222831",
                  marginLeft: "6vw",
                }}
              >
                {languages[language].graphs.statsBalance.title}
              </MySectionButton>
              <MySectionButton
                theme={theme}
                onClick={() => handlePageChange("statsIncomesExpenses")}
                style={{
                  backgroundColor:
                    activePage === "statsIncomesExpenses" ? "" : "#222831",
                }}
              >
                {languages[language].graphs.statsExpenses.title}
              </MySectionButton>
            </ButtonGroup>
            {renderPage()}
        </StyledSectionStats>
      );
}


