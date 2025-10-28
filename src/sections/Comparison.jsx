import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Section } from '../styles/MyStyled';
import { 
    getTotalValue,
    getPercentageRankOnBalance,
    getPercentageRankOnIncomes,
    getPercentageRankOnExpenses,
    getPercentageRankOnBalanceSimilar,
    getPercentageRankOnIncomesSimilar,
    getPercentageRankOnExpensesSimilar,
    getIncomesArray,
    getOutflowsArray,
    getBalanceGrowth12Months,
    getProfileCompletionPercentage
} from '../utils/userDataSelectors';
import { 
  StyledMonth, 
  StyledLabel, 
  StyledRankingsSection, 
  StandardPageTitleGreen, 
  StyledRankingPage, 
  CenteredRankings 
} from '../styles/MyStyled';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EqualIcon from '@mui/icons-material/DragHandle';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SavingsIcon from '@mui/icons-material/Savings';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import GroupIcon from '@mui/icons-material/Group';
import PublicIcon from '@mui/icons-material/Public';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StarIcon from '@mui/icons-material/Star';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import Tooltip from '@mui/material/Tooltip';
import styled from 'styled-components';
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';
import Leaderboard from './Leaderboard';

const ComparisonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 150vh;
  padding-bottom: 60vh;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    gap: 1.5rem;
    min-height: 130vh;
    padding-bottom: 50vh;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    background: linear-gradient(135deg, white 0%, white 70%, #079164 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }
  
  p {
    color: ${props => props.theme.textColor};
    font-size: 1.1rem;
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
`;

export const SectionTabs = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
  background: ${props => props.theme.cardBackgroundColor};
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: fit-content;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 0.5rem;
    width: 100%;
    max-width: 100%;
  }
`;

const TabButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.active ? props.theme.buttonBackgroundColor : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.textColor};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.active ? props.theme.buttonBackgroundColor : `${props.theme.buttonBackgroundColor}15`};
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ComparisonCard = styled.div`
  background: ${props => props.theme.mode === 'dark' ? props.theme.primaryColor : 'white'};
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border: 1px solid ${props => props.theme.borderColor || 'transparent'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  font-weight: 500;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 35px rgba(0,0,0,0.15);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.accent || props.theme.buttonBackgroundColor};
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  h3 {
    color: ${props => props.theme.textColor};
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#eee'};
  
  &:last-child {
    border-bottom: none;
  }
  
  .label {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'};
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  .value {
    color: ${props => props.theme.textColor};
    font-weight: 600;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const BalanceValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  
  .main-value {
    color: ${props => props.theme.textColor};
    font-weight: 600;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .growth-value {
    color: ${props => props.growth > 0 ? '#27ae60' : props.growth < 0 ? '#e74c3c' : props.theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
    font-size: 0.8rem;
    font-weight: 500;
    text-align: right;
  }
`;

const ComingSoonCard = styled(ComparisonCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 200px;
  background: linear-gradient(135deg, ${props => props.theme.mode === 'dark' ? props.theme.primaryColor : 'white'} 0%, ${props => props.theme.buttonBackgroundColor}15 100%);
  
  h3 {
    color: ${props => props.theme.textColor};
    font-weight: 600;
    margin: 0.5rem 0;
  }
  
  p {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'};
    font-weight: 500;
  }
  
  .coming-soon-text {
    color: ${props => props.theme.buttonBackgroundColor};
    font-size: 1.2rem;
    font-weight: 600;
    margin-top: 1rem;
  }
`;

const InsightCard = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.buttonBackgroundColor}15 0%, ${props => props.theme.buttonBackgroundColor}05 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  border-left: 4px solid ${props => props.theme.buttonBackgroundColor};
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  
  h4 {
    color: ${props => props.theme.textColor};
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }
  
  p {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'};
    margin: 0;
    line-height: 1.5;
    font-weight: 500;
  }
`;

const ProfileBanner = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.buttonBackgroundColor}20 0%, ${props => props.theme.buttonBackgroundColor}10 100%);
  border: 2px solid ${props => props.theme.buttonBackgroundColor}40;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px ${props => props.theme.buttonBackgroundColor}30;
    border-color: ${props => props.theme.buttonBackgroundColor}60;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${props => props.theme.buttonBackgroundColor}, ${props => props.theme.buttonBackgroundColor}aa);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
    gap: 1rem;
  }
`;

const BannerIcon = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.buttonBackgroundColor}, ${props => props.theme.buttonBackgroundColor}dd);
  border-radius: 50%;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px ${props => props.theme.buttonBackgroundColor}40;
  min-width: 80px;
  height: 80px;
`;

const BannerContent = styled.div`
  flex: 1;
  
  h3 {
    color: ${props => props.theme.textColor};
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
  }
  
  p {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'};
    font-size: 1rem;
    line-height: 1.5;
    margin: 0;
    
    @media (max-width: 768px) {
      font-size: 0.9rem;
    }
  }
`;

const BannerAction = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.buttonBackgroundColor};
  font-weight: 600;
  font-size: 1rem;
  
  @media (max-width: 768px) {
    justify-content: center;
    margin-top: 0.5rem;
  }
`;

// Modern Rankings Components
const RankingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: none;
  
  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`;

const RankingsHeader = styled.div`
  text-align: center;
  background: linear-gradient(135deg, ${props => props.theme.mode === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)'} 0%, ${props => props.theme.mode === 'dark' ? 'rgba(17, 24, 39, 0.9)' : '#f8fafc'} 100%);
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(156, 163, 175, 0.2)'};
  box-shadow: ${props => props.theme.mode === 'dark' ? '0 10px 15px -3px rgba(0, 0, 0, 0.4)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
  
  h2 {
    color: ${props => props.theme.textColor};
    font-size: 2rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
      flex-direction: column;
      gap: 0.5rem;
    }
  }
  
  .month-indicator {
    background: linear-gradient(135deg, ${props => props.theme.buttonBackgroundColor}, ${props => props.theme.buttonBackgroundColor}cc);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 1rem auto 0;
    width: fit-content;
    box-shadow: 0 4px 12px ${props => props.theme.buttonBackgroundColor}40;
  }
`;

const RankingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  width: 100%;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const RankingGroup = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(156, 163, 175, 0.2)'};
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.mode === 'dark' ? '0 20px 25px -5px rgba(0, 0, 0, 0.6)' : '0 10px 25px -3px rgba(0, 0, 0, 0.1)'};
  }
  
  .group-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid ${props => props.theme.mode === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(156, 163, 175, 0.2)'};
    
    .icon-container {
      background: linear-gradient(135deg, ${props => props.theme.buttonBackgroundColor}, ${props => props.theme.buttonBackgroundColor}dd);
      border-radius: 50%;
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 16px ${props => props.theme.buttonBackgroundColor}30;
    }
    
    h3 {
      color: ${props => props.theme.textColor};
      font-size: 1.4rem;
      font-weight: 700;
      margin: 0;
    }
  }
`;

const RankingCard = styled.div`
  background: ${props => {
    if (props.isTop) return `linear-gradient(135deg, ${props.theme.buttonBackgroundColor}20, ${props.theme.buttonBackgroundColor}10)`;
    if (props.isLow) return props.theme.mode === 'dark' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.05)';
    return props.theme.mode === 'dark' ? 'rgba(75, 85, 99, 0.2)' : 'rgba(243, 244, 246, 0.8)';
  }};
  border: 2px solid ${props => {
    if (props.isTop) return props.theme.buttonBackgroundColor + '40';
    if (props.isLow) return props.theme.mode === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)';
    return 'transparent';
  }};
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${props => {
      if (props.isTop) return `linear-gradient(180deg, ${props.theme.buttonBackgroundColor}, ${props.theme.buttonBackgroundColor}cc)`;
      if (props.isLow) return 'linear-gradient(180deg, #6366f1, #4f46e5)';
      return 'linear-gradient(180deg, #6b7280, #4b5563)';
    }};
  }
  
  .rank-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    
    h4 {
      color: ${props => props.theme.textColor};
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .rank-badge {
      background: ${props => {
        if (props.isTop) return `linear-gradient(135deg, ${props.theme.buttonBackgroundColor}, ${props.theme.buttonBackgroundColor}dd)`;
        if (props.isLow) return 'linear-gradient(135deg, #6366f1, #4f46e5)';
        return 'linear-gradient(135deg, #6b7280, #4b5563)';
      }};
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  }
  
  .rank-description {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'};
    font-size: 0.95rem;
    line-height: 1.4;
    margin: 0;
  }
`;

const MotivationalPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${props => props.theme.mode === 'dark' ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2.5rem;
  max-width: 500px;
  width: 90%;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(156, 163, 175, 0.2)'};
  box-shadow: ${props => props.theme.mode === 'dark' ? '0 25px 50px -12px rgba(0, 0, 0, 0.8)' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'};
  z-index: 1000;
  text-align: center;
  animation: popupSlideIn 0.3s ease-out;
  
  @keyframes popupSlideIn {
    from {
      opacity: 0;
      transform: translate(-50%, -60%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }
  
  .popup-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  
  h3 {
    color: ${props => props.theme.textColor};
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
  }
  
  p {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'};
    font-size: 1rem;
    line-height: 1.5;
    margin: 0 0 2rem 0;
  }
  
  button {
    background: linear-gradient(135deg, ${props => props.theme.buttonBackgroundColor}, ${props => props.theme.buttonBackgroundColor}dd);
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 20px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px ${props => props.theme.buttonBackgroundColor}40;
    }
  }
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

function Comparison({ theme, userData, handleSetIsUpdated, isHidden}) {
    const { language } = useContext(LanguageContext);
    const [activeTab, setActiveTab] = useState('insights');
    const [showMotivationalPopup, setShowMotivationalPopup] = useState(false);
    const [popupContent, setPopupContent] = useState({ type: '', title: '', message: '', icon: '' });
    const navigate = useNavigate();

    // Funzioni helper per Rankings
    const getRankLevel = (rank) => {
        if (!rank || rank === '' || isNaN(rank)) return 'none';
        const numRank = parseFloat(rank);
        if (numRank <= 20) return 'top';
        if (numRank >= 70) return 'low';
        return 'medium';
    };

    const getRankDescription = (rank, category, isExpense = false) => {
        if (!rank || rank === '' || isNaN(rank)) return languages[language].leaderboard.rankings.noData;
        
        const numRank = Math.min(parseFloat(rank), 99);
        const level = getRankLevel(numRank);
        
        const categoryKey = isExpense ? 'expenses' : category;
        const descriptions = languages[language].leaderboard.rankings.descriptions[categoryKey];
        
        if (descriptions) {
            return descriptions[level] || descriptions.medium;
        }
        
        // Fallback generico
        if (level === 'top') return `${languages[language].leaderboard.rankings.topPerformance} Top ${numRank}%`;
        if (level === 'low') return `${languages[language].leaderboard.rankings.canImprove} Top ${numRank}%`;
        return `${languages[language].leaderboard.rankings.goodPerformance} Top ${numRank}%`;
    };

    const showMotivationalMessage = (rank, category, isExpense = false) => {
        if (!rank || rank === '' || isNaN(rank)) return;
        
        const numRank = parseFloat(rank);
        const level = getRankLevel(numRank);
        
        const categoryKey = isExpense ? 'expenses' : category;
        const motivationalTexts = languages[language].leaderboard.rankings.motivational[level];
        
        let content = {
            type: level,
            title: motivationalTexts.title,
            message: motivationalTexts[categoryKey] || motivationalTexts.balance,
            icon: level === 'top' ? '🏆' : level === 'medium' ? '⭐' : '💪'
        };
        
        setPopupContent(content);
        setShowMotivationalPopup(true);
    };

    const getCurrentMonth = () => {
        const monthDate = userData?.preMonthDate || new Date();
        
        // Get the month number and year
        const date = new Date(monthDate);
        const monthNumber = date.getMonth(); // 0-based month (0 = January, 8 = September)
        const year = date.getFullYear();
        
        // Manual mapping for reliable translation
        const monthNames = {
            it: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 
                 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
            en: ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December']
        };
        
        const monthName = monthNames[language] ? monthNames[language][monthNumber] : monthNames.en[monthNumber];
        return `${monthName} ${year}`;
    };

    // Mock data for comparisons - in a real app, this would come from API
    // Calculate 12-month averages for user
    const userIncomesArray = getIncomesArray(userData) || [];
    const userOutflowsArray = getOutflowsArray(userData) || [];

    const ProfileCompletionPercentage = getProfileCompletionPercentage(userData);
    
    const calculateAverage = (array) => {
        const validValues = array.slice(0, 12).filter(val => val && val > 0);
        return validValues.length > 0 ? validValues.reduce((sum, val) => sum + val, 0) / validValues.length : 0;
    };

    const mockData = {
        avgBalance: {
            user: {
                current: getTotalValue(userData) || 0,
                growth12Months: getBalanceGrowth12Months(userData)
            },
            similarUsers: {
                current: 45000,
                growth12Months: 8.5
            },
            allUsers: {
                current: 38000,
                growth12Months: 6.2
            }
        },
        avgIncome: {
            user: calculateAverage(userIncomesArray),
            similarUsers: 3200,
            allUsers: 2800
        },
        avgOutflows: {
            user: calculateAverage(userOutflowsArray),
            similarUsers: 2400,
            allUsers: 2200
        }
    };    const formatCurrency = (value) => {
        if (isHidden) return '****';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatGrowthPercentage = (value) => {
        if (isHidden) return '****';
        if (value === 0) return languages[language].comparison.cards.avgBalance.noGrowthData;
        
        const sign = value > 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}% ${languages[language].comparison.cards.avgBalance.growth12Months}`;
    };

    const getComparisonIcon = (userValue, compareValue) => {
        if (userValue > compareValue) return <TrendingUpIcon style={{ color: '#27ae60' }} />;
        if (userValue < compareValue) return <TrendingDownIcon style={{ color: '#e74c3c' }} />;
        return <EqualIcon style={{ color: '#f39c12' }} />;
    };

    const getBalanceComparisonIcon = (userBalance, compareBalance) => {
        if (userBalance.current > compareBalance.current) return <TrendingUpIcon style={{ color: '#27ae60' }} />;
        if (userBalance.current < compareBalance.current) return <TrendingDownIcon style={{ color: '#e74c3c' }} />;
        return <EqualIcon style={{ color: '#f39c12' }} />;
    };

    const generateInsights = () => {
        const insights = [];
        const { avgBalance, avgIncome, avgOutflows } = mockData;
        
        if (avgBalance.user.current > avgBalance.similarUsers.current) {
            insights.push({
                type: 'positive',
                title: languages[language].comparison.insights.betterThan + ' 70% ' + languages[language].comparison.insights.ofUsers,
                description: languages[language].comparison.tips.goodBalance
            });
        }
        
        if (avgOutflows.user > avgIncome.user * 0.8) {
            insights.push({
                type: 'warning',
                title: languages[language].comparison.tips.title,
                description: languages[language].comparison.tips.highOutflows
            });
        }
        
        return insights;
    };    const renderProfileBanner = () => (
        <ProfileBanner 
            theme={theme} 
            onClick={() => navigate('/profile')}
            data-umami-event="comparison-complete-profile"
        >
            <BannerIcon theme={theme}>
                <PersonIcon style={{ fontSize: '2rem', color: 'white' }} />
            </BannerIcon>
            <BannerContent theme={theme}>
                <h3>{languages[language].comparison.profileBanner?.title || '🚀 Sblocca confronti personalizzati!'}</h3>
                <p>
                    {languages[language].comparison.profileBanner?.description || 'Completa il tuo profilo nella pagina Account per ottenere confronti anonimi e automatizzati con utenti simili a te. Scopri come ti posizioni rispetto ad altri professionisti!'}
                </p>
            </BannerContent>
            <BannerAction theme={theme}>
                {languages[language].comparison.profileBanner?.action || 'Completa profilo'}
                <ArrowForwardIcon />
            </BannerAction>
        </ProfileBanner>
    );

    const renderInsightsTab = () => (
        <>
            {ProfileCompletionPercentage !== 100 && renderProfileBanner()}
            <GridContainer>
                <ComparisonCard theme={theme} accent="#3498db">
                    <CardHeader theme={theme}>
                        <h3><AccountBalanceIcon /> {languages[language].comparison.cards.avgBalance.title}</h3>
                        <Tooltip title={languages[language].comparison.cards.avgBalance.description}>
                            <InfoIcon style={{ color: theme.textColor }} />
                        </Tooltip>
                    </CardHeader>
                    <MetricRow theme={theme}>
                        <span className="label">{languages[language].comparison.cards.avgBalance.yourBalance}</span>
                        <BalanceValueContainer theme={theme} growth={mockData.avgBalance.user.growth12Months}>
                            <div className="main-value">
                                {formatCurrency(mockData.avgBalance.user.current)}
                            </div>
                            <div className="growth-value">
                                {formatGrowthPercentage(mockData.avgBalance.user.growth12Months)}
                            </div>
                        </BalanceValueContainer>
                    </MetricRow>
                    <MetricRow theme={theme}>
                        <span className="label">{languages[language].comparison.cards.avgBalance.avgSimilar}</span>
                        <BalanceValueContainer theme={theme} growth={mockData.avgBalance.similarUsers.growth12Months}>
                            <div className="main-value">
                                {formatCurrency(mockData.avgBalance.similarUsers.current)}
                                {getBalanceComparisonIcon(mockData.avgBalance.user, mockData.avgBalance.similarUsers)}
                            </div>
                            <div className="growth-value">
                                {formatGrowthPercentage(mockData.avgBalance.similarUsers.growth12Months)}
                            </div>
                        </BalanceValueContainer>
                    </MetricRow>
                    <MetricRow theme={theme}>
                        <span className="label">{languages[language].comparison.cards.avgBalance.avgAll}</span>
                        <BalanceValueContainer theme={theme} growth={mockData.avgBalance.allUsers.growth12Months}>
                            <div className="main-value">
                                {formatCurrency(mockData.avgBalance.allUsers.current)}
                                {getBalanceComparisonIcon(mockData.avgBalance.user, mockData.avgBalance.allUsers)}
                            </div>
                            <div className="growth-value">
                                {formatGrowthPercentage(mockData.avgBalance.allUsers.growth12Months)}
                            </div>
                        </BalanceValueContainer>
                    </MetricRow>
                </ComparisonCard>

                <ComparisonCard theme={theme} accent="#27ae60">
                    <CardHeader theme={theme}>
                        <h3><MonetizationOnIcon /> {languages[language].comparison.cards.avgIncome.title}</h3>
                        <Tooltip title={languages[language].comparison.cards.avgIncome.description}>
                            <InfoIcon style={{ color: theme.textColor }} />
                        </Tooltip>
                    </CardHeader>
                    <MetricRow theme={theme}>
                        <span className="label">{languages[language].comparison.cards.avgIncome.yourIncome}</span>
                        <span className="value">
                            {formatCurrency(mockData.avgIncome.user)}
                        </span>
                    </MetricRow>
                    <MetricRow theme={theme}>
                        <span className="label">{languages[language].comparison.cards.avgIncome.avgSimilar}</span>
                        <span className="value">
                            {formatCurrency(mockData.avgIncome.similarUsers)}
                            {getComparisonIcon(mockData.avgIncome.user, mockData.avgIncome.similarUsers)}
                        </span>
                    </MetricRow>
                    <MetricRow theme={theme}>
                        <span className="label">{languages[language].comparison.cards.avgIncome.avgAll}</span>
                        <span className="value">
                            {formatCurrency(mockData.avgIncome.allUsers)}
                            {getComparisonIcon(mockData.avgIncome.user, mockData.avgIncome.allUsers)}
                        </span>
                    </MetricRow>
                </ComparisonCard>

                <ComparisonCard theme={theme} accent="#e74c3c">
                    <CardHeader theme={theme}>
                        <h3><TrendingDownIcon /> {languages[language].comparison.cards.avgOutflows.title}</h3>
                        <Tooltip title={languages[language].comparison.cards.avgOutflows.description}>
                            <InfoIcon style={{ color: theme.textColor }} />
                        </Tooltip>
                    </CardHeader>
                    <MetricRow theme={theme}>
                        <span className="label">{languages[language].comparison.cards.avgOutflows.yourOutflows}</span>
                        <span className="value">
                            {formatCurrency(mockData.avgOutflows.user)}
                        </span>
                    </MetricRow>
                    <MetricRow theme={theme}>
                        <span className="label">{languages[language].comparison.cards.avgOutflows.avgSimilar}</span>
                        <span className="value">
                            {formatCurrency(mockData.avgOutflows.similarUsers)}
                            {getComparisonIcon(mockData.avgOutflows.similarUsers, mockData.avgOutflows.user)}
                        </span>
                    </MetricRow>
                    <MetricRow theme={theme}>
                        <span className="label">{languages[language].comparison.cards.avgOutflows.avgAll}</span>
                        <span className="value">
                            {formatCurrency(mockData.avgOutflows.allUsers)}
                            {getComparisonIcon(mockData.avgOutflows.allUsers, mockData.avgOutflows.user)}
                        </span>
                    </MetricRow>
                </ComparisonCard>

                <ComingSoonCard theme={theme}>
                    <SavingsIcon style={{ fontSize: '3rem', color: theme.buttonBackgroundColor }} />
                    <h3>{languages[language].comparison.cards.savingsRate.title}</h3>
                    <p>{languages[language].comparison.cards.savingsRate.description}</p>
                    <div className="coming-soon-text">{languages[language].comparison.cards.savingsRate.comingSoon}</div>
                </ComingSoonCard>

                <ComingSoonCard theme={theme}>
                    <PieChartIcon style={{ fontSize: '3rem', color: theme.buttonBackgroundColor }} />
                    <h3>{languages[language].comparison.cards.assetAllocation.title}</h3>
                    <p>{languages[language].comparison.cards.assetAllocation.description}</p>
                    <div className="coming-soon-text">{languages[language].comparison.cards.assetAllocation.comingSoon}</div>
                </ComingSoonCard>

                <ComingSoonCard theme={theme}>
                    <BarChartIcon style={{ fontSize: '3rem', color: theme.buttonBackgroundColor }} />
                    <h3>{languages[language].comparison.cards.spendingCategories.title}</h3>
                    <p>{languages[language].comparison.cards.spendingCategories.description}</p>
                    <div className="coming-soon-text">{languages[language].comparison.cards.spendingCategories.comingSoon}</div>
                </ComingSoonCard>
            </GridContainer>

            {generateInsights().map((insight, index) => (
                <InsightCard key={index} theme={theme}>
                    <h4><TipsAndUpdatesIcon /> {insight.title}</h4>
                    <p>{insight.description}</p>
                </InsightCard>
            ))}
        </>
    );

    const renderRankingsTab = () => {
        const balanceRank = getPercentageRankOnBalance(userData);
        const incomeRank = getPercentageRankOnIncomes(userData);
        const expenseRank = getPercentageRankOnExpenses(userData);
        const balanceSimilarRank = getPercentageRankOnBalanceSimilar(userData);
        const incomeSimilarRank = getPercentageRankOnIncomesSimilar(userData);
        const expenseSimilarRank = getPercentageRankOnExpensesSimilar(userData);

        const RankCard = ({ title, rank, icon, isExpense = false, category }) => (
            <RankingCard 
                theme={theme} 
                isTop={getRankLevel(rank) === 'top'}
                isLow={getRankLevel(rank) === 'low'}
                onClick={() => showMotivationalMessage(rank, category, isExpense)}
            >
                <div className="rank-header">
                    <h4>
                        {icon}
                        {title}
                    </h4>
                    <div className="rank-badge">
                        {getRankLevel(rank) === 'top' && <EmojiEventsIcon style={{ fontSize: '1rem' }} />}
                        {getRankLevel(rank) === 'low' && <TrendingDownIcon style={{ fontSize: '1rem' }} />}
                        {getRankLevel(rank) === 'medium' && <TrendingUpIcon style={{ fontSize: '1rem' }} />}
                        {rank && !isNaN(rank) ? `Top ${Math.min(parseFloat(rank), 99)}%` : 'N/A'}
                    </div>
                </div>
                <p className="rank-description">
                    {isHidden ? '****' : getRankDescription(rank, category, isExpense)}
                </p>
            </RankingCard>
        );

        return (
            <RankingsContainer>
                {ProfileCompletionPercentage !== 100 && renderProfileBanner()}
                
                <RankingsHeader theme={theme}>
                    <h2>
                        <EmojiEventsIcon style={{ fontSize: '2.5rem', color: theme.buttonBackgroundColor }} />
                        {languages[language].leaderboard.rankings.title}
                    </h2>
                    <div className="month-indicator">
                        <CalendarTodayIcon style={{ fontSize: '1rem' }} />
                        {languages[language].leaderboard.rankings.monthData} {getCurrentMonth()}
                    </div>
                </RankingsHeader>

                <RankingsGrid>
                    {/* Classifica Generale */}
                    <RankingGroup theme={theme}>
                        <div className="group-header">
                            <div className="icon-container">
                                <PublicIcon style={{ fontSize: '1.5rem', color: 'white' }} />
                            </div>
                            <div>
                                <h3>{languages[language].leaderboard.rankings.generalRanking}</h3>
                                <p style={{ 
                                    color: theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', 
                                    margin: 0, 
                                    fontSize: '0.9rem' 
                                }}>
                                    {languages[language].leaderboard.rankings.generalSubtitle}
                                </p>
                            </div>
                        </div>
                        
                        <RankCard 
                            title={languages[language].leaderboard.rankings.balance} 
                            rank={balanceRank}
                            icon={<AccountBalanceIcon style={{ fontSize: '1.2rem', marginRight: '0.25rem' }} />}
                            category="balance"
                        />
                        
                        <RankCard 
                            title={languages[language].leaderboard.rankings.income} 
                            rank={incomeRank}
                            icon={<MonetizationOnIcon style={{ fontSize: '1.2rem', marginRight: '0.25rem' }} />}
                            category="income"
                        />
                        
                        <RankCard 
                            title={languages[language].leaderboard.rankings.expenses} 
                            rank={expenseRank}
                            icon={<TrendingDownIcon style={{ fontSize: '1.2rem', marginRight: '0.25rem' }} />}
                            category="expenses"
                            isExpense={true}
                        />
                    </RankingGroup>

                    {/* Classifica Utenti Simili */}
                    <RankingGroup theme={theme}>
                        <div className="group-header">
                            <div className="icon-container">
                                <GroupIcon style={{ fontSize: '1.5rem', color: 'white' }} />
                            </div>
                            <div>
                                <h3>{languages[language].leaderboard.rankings.similarRanking}</h3>
                                <p style={{ 
                                    color: theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', 
                                    margin: 0, 
                                    fontSize: '0.9rem' 
                                }}>
                                    {languages[language].leaderboard.rankings.similarSubtitle}
                                </p>
                            </div>
                        </div>
                        
                        <RankCard 
                            title={languages[language].leaderboard.rankings.balance} 
                            rank={balanceSimilarRank}
                            icon={<AccountBalanceIcon style={{ fontSize: '1.2rem', marginRight: '0.25rem' }} />}
                            category="balance"
                        />
                        
                        <RankCard 
                            title={languages[language].leaderboard.rankings.income} 
                            rank={incomeSimilarRank}
                            icon={<MonetizationOnIcon style={{ fontSize: '1.2rem', marginRight: '0.25rem' }} />}
                            category="income"
                        />
                        
                        <RankCard 
                            title={languages[language].leaderboard.rankings.expenses} 
                            rank={expenseSimilarRank}
                            icon={<TrendingDownIcon style={{ fontSize: '1.2rem', marginRight: '0.25rem' }} />}
                            category="expenses"
                            isExpense={true}
                        />
                    </RankingGroup>
                </RankingsGrid>

                {/* Popup Motivazionale */}
                {showMotivationalPopup && (
                    <>
                        <PopupOverlay onClick={() => setShowMotivationalPopup(false)} />
                        <MotivationalPopup theme={theme}>
                            <div className="popup-icon">{popupContent.icon}</div>
                            <h3>{popupContent.title}</h3>
                            <p>{popupContent.message}</p>
                            <button onClick={() => setShowMotivationalPopup(false)}>
                                {languages[language].leaderboard.rankings.popup.close}
                            </button>
                        </MotivationalPopup>
                    </>
                )}
            </RankingsContainer>
        );
    };

    return (
        <Section theme={theme}>
            <ComparisonContainer>
                <SectionHeader theme={theme}>
                    <h1>{languages[language].comparison.title}</h1>
                    <p>{languages[language].comparison.subtitle}</p>
                </SectionHeader>

                <SectionTabs theme={theme}>
                    <TabButton 
                        theme={theme} 
                        active={activeTab === 'insights'} 
                        onClick={() => setActiveTab('insights')}
                        data-umami-event="comparison-tab-insights"
                    >
                        <BarChartIcon />
                        {languages[language].comparison.sections.insights.title}
                    </TabButton>
                    <TabButton 
                        theme={theme} 
                        active={activeTab === 'rankings'} 
                        onClick={() => setActiveTab('rankings')}
                        data-umami-event="comparison-tab-rankings"
                    >
                        <CompareArrowsIcon />
                        {languages[language].comparison.sections.rankings.title}
                    </TabButton>
                </SectionTabs>

                {activeTab === 'insights' && renderInsightsTab()}
                {activeTab === 'rankings' && renderRankingsTab()}
            </ComparisonContainer>
        </Section>
    );
}

export default Comparison;

