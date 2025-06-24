import React, { useState, useEffect, useContext } from 'react';
import { Section } from '../styles/MyStyled';
import { StyledMonth, StyledLabel, StyledRankingsSection, StandardPageTitleGreen, StyledRankingPage, CenteredRankings, RankingsTitle, RankingPageSection, ModernStyledLabel } from '../styles/MyStyled';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';


// Component for the rankings section
function RankingsSection({ theme, language, title, rankings, isHidden }) {
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
            textToDisplay = `${languages[language].leaderboard.compliments} ${Math.min(rankings, 99)}%. ${languages[language].leaderboard.lowerExpense}`;
          } else if (isRankingBelow20) {
            textToDisplay = `${languages[language].leaderboard.top} ${Math.min(rankings, 99)}%. ${languages[language].leaderboard.higherExpense}`;
          } else {
            textToDisplay = `${languages[language].leaderboard.top} ${Math.min(rankings, 99)}%. ${languages[language].leaderboard.mediumRank}`;
          }

        } else {

          if (!isRankingsAbove50) {
            textToDisplay = `${languages[language].leaderboard.compliments} ${Math.min(rankings, 99)}% ${languages[language].leaderboard.users}`;
          } else if (isRankingBelow20) {
            textToDisplay = `${languages[language].leaderboard.superCompliments} ${Math.min(rankings, 99)}%. ${languages[language].leaderboard.higherIncome}`;
          } else {
            textToDisplay = `${languages[language].leaderboard.top} ${Math.min(rankings, 99)}% ${languages[language].leaderboard.users}`;
          }

        }
      }
    } else {
        // Set the text to display if rankings is not a number
        textToDisplay = languages[language].leaderboard.noRank;
    }

    const areNotEmpty = (typeof rankings === 'string' && rankings.length > 0) || (typeof rankings === 'number' && rankings > 0);

    return (
      <StyledRankingsSection theme={theme}>
        <h2>
          {safeTitle}
          {isExpenseTitle && (
            <Tooltip title={languages[language].leaderboard.infoExpenseRank} arrow>
              <InfoIcon style={{ color: 'white' }} />
            </Tooltip>
          )}
        </h2>
        {areNotEmpty ? (
          <p>{textToDisplay}</p>
        ) : (
          <p> {languages[language].general.noData} </p>
        )}
      </StyledRankingsSection>
    );
  }

function Leaderboard({ theme, userData, handleSetIsUpdated, isHidden}) {
    const { language } = useContext(LanguageContext);
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
          ? new Date(userData.preMonthDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' })
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
                        {languages[language].leaderboard.monthRanking} <StyledMonth>{formattedPreMonthDate}</StyledMonth>
                        {/* <Tooltip title={languages[language].leaderboard.infoMonthRanking || 'Il ranking si riferisce al mese selezionato.'}>
                          <InfoIcon style={{ color: theme.buttonBackgroundColor, fontSize: '1.1em', marginLeft: 6 }} />
                        </Tooltip> */}
                        {userType === 'demo' && (
                          <span className="block bg-red-400 border border-black rounded-xl p-2 mt-2">
                            {languages[language].leaderboard.demoWarning}
                          </span>
                        )}
                      </ModernStyledLabel>
                      <RankingsTitle style={{ color: theme.textColor }}>{languages[language].leaderboard.generalRanking} </RankingsTitle>
                      <CenteredRankings theme={theme}>
                          <RankingsSection theme={theme} language={language} title={languages[language].leaderboard.balanceRanking} rankings={balanceRank} isHidden={isHidden} />
                          <RankingsSection theme={theme} language={language} title={languages[language].leaderboard.incomeRanking} rankings={incomeRank} isHidden={isHidden} />
                          <RankingsSection theme={theme} language={language} title={languages[language].leaderboard.expenseRanking} rankings={expenseRank} isHidden={isHidden} />
                      </CenteredRankings>
                      <RankingsTitle style={{ color: theme.textColor }}>{languages[language].leaderboard.similarRanking} </RankingsTitle>
                      <CenteredRankings theme={theme}>
                          <RankingsSection theme={theme} language={language} title={languages[language].leaderboard.balanceRanking} rankings={balanceSimilarUsersRank} isHidden={isHidden} />
                          <RankingsSection theme={theme} language={language} title={languages[language].leaderboard.incomeRanking} rankings={incomesSimilarUsersRank} isHidden={isHidden} />
                          <RankingsSection theme={theme} language={language} title={languages[language].leaderboard.expenseRanking} rankings={expensesSimilarUsersRank} isHidden={isHidden} />
                      </CenteredRankings>
                  </StyledRankingPage>
            </div>
        </RankingPageSection>
    )
}

export default Leaderboard;