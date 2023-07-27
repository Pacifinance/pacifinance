import React, {useState, useContext} from 'react'
// import { Button, ButtonGroup, Select, MenuItem } from "@mui/material";
import BalancesStatsMonth from '../components/BalancesStatsMonth'
import BalancesStatsYear from '../components/BalancesStatsYear'
import BalancesCharts from '../components/BalancesCharts'
import InOutCharts from '../components/InOutChart'
// import { TitleDashboard, Section, SecondaryTitle } from '../contexts/MyStyled';
import { UserContext } from '../contexts/UserContext';
import MyStyled from '../contexts/MyStyled';
import InExStatsMonth from '../components/InExStatsMonth'
import InExStatsYear from '../components/InExStatsYear'



function StatsCharts() {
    const { userData } = useContext(UserContext);
    const { ModifiedTitleDashboard, StyledSection, ButtonGroup, MySectionButton, SecondaryTitle } = MyStyled();
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
                <SecondaryTitle>- Il tuo patrimonio rispetto a {formattedPreMonthDate} (un mese fa)</SecondaryTitle>
                <BalancesStatsMonth />
                <SecondaryTitle>- Il tuo patrimonio rispetto a {formattedPreYearSameMonthDate} (un anno fa)</SecondaryTitle>
                <BalancesStatsYear />
                <SecondaryTitle>- check del bilancio negli ultimi 12 mesi</SecondaryTitle>
                <BalancesCharts />

            </>
          );
        } else if (activePage === "statsIncomesExpenses") {
          return (
            <>
                <SecondaryTitle>- le tue entrate e uscite rispetto a {formattedPreMonthDate} (un mese fa)</SecondaryTitle>
                <InExStatsMonth />
                <SecondaryTitle>- le tue entrate e uscite rispetto a {formattedPreYearSameMonthDate} (un anno fa)</SecondaryTitle>
                <InExStatsYear />
                <SecondaryTitle>- check delle entrate e delle uscite negli ultimi 12 mesi </SecondaryTitle>
    //          <InOutCharts />
            </>
          );
        }
      };

    return (
        <StyledSection>
            <ModifiedTitleDashboard>Le tue Statistiche</ModifiedTitleDashboard>
            <ButtonGroup variant="contained" aria-label="outlined primary button group">
              <MySectionButton
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

export default StatsCharts;



