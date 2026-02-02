import React, { useState, useEffect, useContext } from 'react';
import { Section } from '../styles/MyStyled';
import { StyledMonth, StyledLabel, StyledRankingsSection, StandardPageTitleGreen, StyledRankingPage, CenteredRankings, RankingsTitle, RankingPageSection, ModernStyledLabel } from '../styles/MyStyled';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';
import { LanguageContext } from '../contexts/LanguageContext';


// Component for the rankings section
function RankingsSection({ theme, language, title, rankings, isHidden, translations }) {
    // Defensive: avoid crash if title is undefined
    const safeTitle = title || '';
    // Verify if there is a title for expenses
    const isExpenseTitle = safeTitle.toLowerCase().includes("uscite") || safeTitle.toLowerCase().includes("expenses");

    // Verify if there are rankings > 50 (top 50%)
    const isRankingsAbove50 = rankings > 50;
    const isRankingBelow20 = rankings < 20;

    // Calculate the text to display
    let textToDisplay = "";
    if (!isNaN(parseFloat(rankings))) {
      if (isHidden) {
        textToDisplay = '****';
      } else {
        if (isExpenseTitle) {

          if (isRankingsAbove50) {
            textToDisplay = `${translations.leaderboard.compliments} ${Math.min(rankings, 99)}%. ${translations.leaderboard.lowerOutflow}`;
          } else if (isRankingBelow20) {
            textToDisplay = `${translations.leaderboard.top} ${Math.min(rankings, 99)}%. ${translations.leaderboard.higherOutflow}`;
          } else {
            textToDisplay = `${translations.leaderboard.top} ${Math.min(rankings, 99)}%. ${translations.leaderboard.mediumRank}`;
          }

        } else {

          if (!isRankingsAbove50) {
            textToDisplay = `${translations.leaderboard.compliments} ${Math.min(rankings, 99)}% ${translations.leaderboard.users}`;
          } else if (isRankingBelow20) {
            textToDisplay = `${translations.leaderboard.superCompliments} ${Math.min(rankings, 99)}%. ${translations.leaderboard.higherIncome}`;
          } else {
            textToDisplay = `${translations.leaderboard.top} ${Math.min(rankings, 99)}% ${translations.leaderboard.users}`;
          }

        }
      }
    } else {
        // Set the text to display if rankings is not a number
        textToDisplay = translations.leaderboard.noRank;
    }

    const areNotEmpty = (typeof rankings === 'string' && rankings.length > 0) || (typeof rankings === 'number' && rankings > 0);

    return (
      <StyledRankingsSection theme={theme}>
        <h2>
          {safeTitle}
          {isExpenseTitle && (
            <Tooltip title={translations.leaderboard.infoOutflowRank} arrow>
              <InfoIcon style={{ color: 'white' }} />
            </Tooltip>
          )}
        </h2>
        {areNotEmpty ? (
          <p>{textToDisplay}</p>
        ) : (
          <p> {translations.general.noData} </p>
        )}
      </StyledRankingsSection>
    );
  }

function Leaderboard({ theme, userData, handleSetIsUpdated, isHidden}) {
    const { language, translations } = useContext(LanguageContext);
    const [selectedMonth, setSelectedMonth] = useState(1);
    const [selectedYear, setSelectedYear] = useState(2023);
    const [userType, setUserType] = useState('');
    const [balanceRank, setBalanceRank] = useState([]);
    const [incomeRank, setIncomeRank] = useState([]);
    const [expenseRank, setExpenseRank] = useState([]);
    const [balanceSimilarUsersRank, setBalanceSimilarUsersRank] = useState([]);
    const [incomesSimilarUsersRank, setIncomeSimilarUsersRank] = useState([]);
    const [expensesSimilarUsersRank, setExpenseSimilarUsersRank] = useState([]);

    const fetchData = async () => {
        if (userData) {
          try {
              setUserType(userData.userType);
              setBalanceRank(userData ? userData.percentageRankOnBalance : []);
              setIncomeRank(userData ? userData.percentageRankOnIncomes : []);
              setExpenseRank(userData ? userData.percentageRankOnExpenses : []);
              setBalanceSimilarUsersRank(userData ? userData.percentageRankOnBalanceSimilar : []);
              setIncomeSimilarUsersRank(userData ? userData.percentageRankOnIncomesSimilar : []);
              setExpenseSimilarUsersRank(userData ? userData.percentageRankOnExpensesSimilar : []);

          } catch (error) {
            console.error('Error:', error);
          }
        }
    };

    useEffect(() => {
        fetchData();
      }, [userData]);

      const formattedPreMonthDate = userData?.preMonthDate
          ? new Date(userData.preMonthDate).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { 
              year: 'numeric', 
              month: 'long' 
            })
          : "";


    return (
        <RankingPageSection theme={theme}>
            <div className="grid">
                  {/* <RankingComponent /> */}
                  <StyledRankingPage theme={theme}>
                      {/* <MonthYearSelector
                          selectedMonth={selectedMonth}
                          selectedYear={selectedYear}
                          onMonthChange={handleMonthChange}
                          onYearChange={handleYearChange}
                      /> */}
                      <ModernStyledLabel theme={theme}>
                        <InfoIcon style={{ color: theme.buttonBackgroundColor, fontSize: '1.3em' }} />
                        {translations.leaderboard.monthRanking} <StyledMonth>{formattedPreMonthDate}</StyledMonth>
                        {/* <Tooltip title={translations.leaderboard.infoMonthRanking || 'Il ranking si riferisce al mese selezionato.'}>
                          <InfoIcon style={{ color: theme.buttonBackgroundColor, fontSize: '1.1em', marginLeft: 6 }} />
                        </Tooltip> */}
                        {userType === 'demo' && (
                          <span className="block bg-red-400 border border-black rounded-xl p-2 mt-2">
                            {translations.leaderboard.demoWarning}
                          </span>
                        )}
                      </ModernStyledLabel>
                      <RankingsTitle style={{ color: theme.textColor }}>{translations.leaderboard.generalRanking} </RankingsTitle>
                      <CenteredRankings theme={theme}>
                          <RankingsSection theme={theme} language={language} title={translations.leaderboard.balanceRanking} rankings={balanceRank} isHidden={isHidden} translations={translations} />
                          <RankingsSection theme={theme} language={language} title={translations.leaderboard.incomeRanking} rankings={incomeRank} isHidden={isHidden} translations={translations} />
                          <RankingsSection theme={theme} language={language} title={translations.leaderboard.outflowRanking} rankings={expenseRank} isHidden={isHidden} translations={translations} />
                      </CenteredRankings>
                      <RankingsTitle style={{ color: theme.textColor }}>{translations.leaderboard.similarRanking} </RankingsTitle>
                      <CenteredRankings theme={theme}>
                          <RankingsSection theme={theme} language={language} title={translations.leaderboard.balanceRanking} rankings={balanceSimilarUsersRank} isHidden={isHidden} translations={translations} />
                          <RankingsSection theme={theme} language={language} title={translations.leaderboard.incomeRanking} rankings={incomesSimilarUsersRank} isHidden={isHidden} translations={translations} />
                          <RankingsSection theme={theme} language={language} title={translations.leaderboard.outflowRanking} rankings={expensesSimilarUsersRank} isHidden={isHidden} translations={translations} />
                      </CenteredRankings>
                  </StyledRankingPage>
            </div>
        </RankingPageSection>
    )
}

export default Leaderboard;