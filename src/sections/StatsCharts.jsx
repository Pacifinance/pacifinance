import React, {useState, useContext} from 'react';
import BalancesStatsMonth from '../components/BalancesStatsMonth';
import BalancesStatsYear from '../components/BalancesStatsYear';
import BalancesCharts from '../components/BalancesCharts';
import BalancesLinesCharts from '../components/BalancesLinesChart';
import InOutCharts from '../components/InOutChart';
import PercentageOutflowsChart from '../components/PercentageOutflowsChart';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { StandardPageTitle, StyledSectionStats, ButtonGroup, MySectionButton, SecondaryTitle } from '../styles/MyStyled';
import styled from 'styled-components';
import InOutStatsMonth from '../components/InOutStatsMonth';
import InOutStatsYear from '../components/InOutStatsYear';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { CustomTick } from '../utils/customGraphsInfo';
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';

const StatsContainer = styled.div`
  background: ${props => props.theme.backgroundColor};
  min-height: 100vh;
  padding: 0;
  margin: 0;
  border: none;
`;

const StatsTitle = styled(StandardPageTitle)`
  margin-top: 2rem;
  margin-bottom: 2rem;
`;

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
                <SecondaryTitle theme={theme}>{languages[language].graphs.title}</SecondaryTitle>
                <BalancesLinesCharts theme={theme} userData={userData} isHidden={isHidden} CustomTick={CustomTick}/>
                <SecondaryTitle theme={theme}>{languages[language].graphs.statsBalance.titleGraph2}</SecondaryTitle>
                <BalancesCharts theme={theme} userData={userData} isHidden={isHidden} CustomTick={CustomTick}/>
                <SecondaryTitle theme={theme}>{languages[language].graphs.statsBalance.detailedVision}</SecondaryTitle>
                <BalancesStatsMonth theme={theme} userData={userData} isHidden={isHidden}/>
                <BalancesStatsYear theme={theme} userData={userData} isHidden={isHidden}/>

            </>
          );
        } else if (activePage === "statsIncomesOutflows") {
          return (
            <>
                <SecondaryTitle theme={theme}>{languages[language].graphs.title}</SecondaryTitle>
                <InOutCharts theme={theme} userData={userData} isHidden={isHidden} CustomTick={CustomTick}/>
                <SecondaryTitle theme={theme}>{languages[language].graphs.statsOutflows.titleGraph2}</SecondaryTitle>
                <PercentageOutflowsChart theme={theme} userData={userData} isHidden={isHidden}/>
                <SecondaryTitle theme={theme}>{languages[language].graphs.statsOutflows.detailedVision}</SecondaryTitle>
                <SecondaryTitle theme={theme}>{languages[language].graphs.statsOutflows.titleDetailsMonth} - {formattedPreMonthDate}</SecondaryTitle>
                <InOutStatsMonth theme={theme} userData={userData} isHidden={isHidden}/>
                <SecondaryTitle theme={theme}>{languages[language].graphs.statsOutflows.titleDetailsYear} - {formattedPreYearSameMonthDate}</SecondaryTitle>
                <InOutStatsYear theme={theme} userData={userData} isHidden={isHidden}/>

            </>
          );
        }
      };

    return (
        <StatsContainer theme={theme}>
            <StatsTitle theme={theme}>
                {activePage === "statsBilancio" 
                    ? languages[language].graphs.statsBalance.title 
                    : languages[language].graphs.statsOutflows.title}
            </StatsTitle>
            <StyledSectionStats theme={theme}>
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
                    onClick={() => handlePageChange("statsIncomesOutflows")}
                    style={{
                      backgroundColor:
                        activePage === "statsIncomesOutflows" ? "" : "#222831",
                    }}
                  >
                    {languages[language].graphs.statsOutflows.title}
                  </MySectionButton>
                </ButtonGroup>
                {renderPage()}
            </StyledSectionStats>
        </StatsContainer>
      );
}