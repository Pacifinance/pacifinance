import React, {useState, useContext} from 'react';
import BalancesStatsMonth from '../components/BalancesStatsMonth';
import BalancesStatsYear from '../components/BalancesStatsYear';
import BalancesCharts from '../components/BalancesCharts';
import InOutCharts from '../components/InOutChart';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { ModifiedTitleDashboard, StyledSectionStats, ButtonGroup, MySectionButton, SecondaryTitle } from '../contexts/MyStyled';
import InExStatsMonth from '../components/InExStatsMonth';
import InExStatsYear from '../components/InExStatsYear';



export default function StatsCharts() {
    const { userData } = useContext(UserContext);
    const { theme } = useContext(ThemeContext);
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
                <SecondaryTitle theme={theme}>Il tuo patrimonio rispetto a {formattedPreMonthDate} (un mese fa)</SecondaryTitle>
                <BalancesStatsMonth />
                <SecondaryTitle theme={theme}>Il tuo patrimonio rispetto a {formattedPreYearSameMonthDate} (un anno fa)</SecondaryTitle>
                <BalancesStatsYear />
                <SecondaryTitle theme={theme}>Check del bilancio negli ultimi 12 mesi</SecondaryTitle>
                <BalancesCharts />

            </>
          );
        } else if (activePage === "statsIncomesExpenses") {
          return (
            <>
                <SecondaryTitle theme={theme}>Le tue entrate e uscite rispetto a {formattedPreMonthDate} (un mese fa)</SecondaryTitle>
                <InExStatsMonth />
                <SecondaryTitle theme={theme}>Le tue entrate e uscite rispetto a {formattedPreYearSameMonthDate} (un anno fa)</SecondaryTitle>
                <InExStatsYear />
                <SecondaryTitle theme={theme}>Check delle entrate e delle uscite negli ultimi 12 mesi </SecondaryTitle>
                <InOutCharts />
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
                Statistiche Bilancio
              </MySectionButton>
              <MySectionButton
                theme={theme}
                onClick={() => handlePageChange("statsIncomesExpenses")}
                style={{
                  backgroundColor:
                    activePage === "statsIncomesExpenses" ? "" : "#222831",
                }}
              >
                Statistiche Entrate e Spese
              </MySectionButton>
            </ButtonGroup>
            {renderPage()}
        </StyledSectionStats>
      );
}


