import React, {useState, useContext} from 'react'
// import { Button, ButtonGroup, Select, MenuItem } from "@mui/material";
import BalancesStatsMonth from '../components/BalancesStatsMonth'
import BalancesStatsYear from '../components/BalancesStatsYear'
import BalancesCharts from '../components/BalancesCharts'
import InOutCharts from '../components/InOutChart'
// import { TitleDashboard, Section, SecondaryTitle } from '../contexts/MyStyled';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { ModifiedTitleDashboard, StyledSection, ButtonGroup, MySectionButton, SecondaryTitle } from '../contexts/MyStyled';
import InExStatsMonth from '../components/InExStatsMonth'
import InExStatsYear from '../components/InExStatsYear'



export default function StatsCharts() {
    const { userData } = useContext(UserContext);
    const { theme } = useContext(ThemeContext);
    const [activePage, setActivePage] = useState("statsBilancio");
    const formattedPreMonthDate = userData?.preMonthDate ? new Date(userData.preMonthDate).toISOString().slice(0, 10) : "";
    const formattedPreYearSameMonthDate = userData?.preYearSameMonthDate ? new Date(userData.preYearSameMonthDate).toISOString().slice(0, 10) : "";
    

    const handlePageChange = (page) => {
        setActivePage(page);
    };

    const renderPage = () => {
        if (activePage === "statsBilancio") {
          return (
            
            <>
                <SecondaryTitle theme={theme}>- Il tuo patrimonio rispetto a {formattedPreMonthDate} (un mese fa)</SecondaryTitle>
                <BalancesStatsMonth />
                <SecondaryTitle theme={theme}>- Il tuo patrimonio rispetto a {formattedPreYearSameMonthDate} (un anno fa)</SecondaryTitle>
                <BalancesStatsYear />
                <SecondaryTitle theme={theme}>- check del bilancio negli ultimi 12 mesi</SecondaryTitle>
                <BalancesCharts />

            </>
          );
        } else if (activePage === "statsIncomesExpenses") {
          return (
            <>
                <SecondaryTitle theme={theme}>- le tue entrate e uscite rispetto a {formattedPreMonthDate} (un mese fa)</SecondaryTitle>
                <InExStatsMonth />
                <SecondaryTitle theme={theme}>- le tue entrate e uscite rispetto a {formattedPreYearSameMonthDate} (un anno fa)</SecondaryTitle>
                <InExStatsYear />
                <SecondaryTitle theme={theme}>- check delle entrate e delle uscite negli ultimi 12 mesi </SecondaryTitle>
                <InOutCharts />
            </>
          );
        }
      };

    return (
        <StyledSection theme={theme}>
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
        </StyledSection>
      );
}


