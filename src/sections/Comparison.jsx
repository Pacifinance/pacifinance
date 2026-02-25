import React, { useState, useContext } from 'react';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { Section } from '../styles/MyStyled';
import { 
    getTotalValue,
    getPercentageRankOnBalance,
    getPercentageRankOnIncomes,
    getPercentageRankOnOutflows,
    getPercentageRankOnBalanceSimilar,
    getPercentageRankOnIncomesSimilar,
    getPercentageRankOnOutflowsSimilar,
    getIncomesArray,
    getOutflowsArray,
    getBalanceGrowth12Months,
    getProfileCompletionPercentage,
    getTotalOutflowsPerCategoryPerMonth,
    getAveragesAllSavingsRates,
    getAveragesSimilarSavingsRates,
    getAveragesAllExpensesByCategory,
    getAveragesSimilarExpensesByCategory
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Tooltip from '@mui/material/Tooltip';
import styled from 'styled-components';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { getCategoryColor } from '../data/categoryColors';
import Leaderboard from './Leaderboard';

const ComparisonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 6rem;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    gap: 1.25rem;
    padding-bottom: 4rem;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 1.25rem;
  
  h1 {
    background: linear-gradient(135deg, white 0%, white 70%, #079164 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 0.4rem;
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }
  
  p {
    color: ${props => props.theme.textColor};
    font-size: 1rem;
    
    @media (max-width: 768px) {
      font-size: 0.9rem;
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
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const TopGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  
  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  margin-top: 1.25rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }
`;

const ExpandableCardContent = styled.div`
  max-height: ${props => props.expanded ? 'none' : '280px'};
  overflow: hidden;
  position: relative;
  transition: max-height 0.35s ease;
  
  ${props => !props.expanded && `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 48px;
      background: linear-gradient(transparent, ${props.theme.mode === 'dark' ? props.theme.primaryColor : 'white'});
      pointer-events: none;
    }
  `}
`;

const ExpandToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  width: 100%;
  padding: 0.4rem 0;
  margin-top: 0.25rem;
  background: none;
  border: none;
  border-top: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  color: ${props => props.theme.buttonBackgroundColor};
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
`;

const ComparisonCard = styled.div`
  background: ${props => props.theme.mode === 'dark' ? props.theme.primaryColor : 'white'};
  border-radius: 14px;
  padding: 1.25rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border: 1px solid ${props => props.theme.borderColor || 'transparent'};
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  font-weight: 500;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.accent || props.theme.buttonBackgroundColor};
    opacity: 0.7;
    border-radius: 0 0 2px 2px;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  
  h3 {
    color: ${props => props.theme.textColor};
    font-size: 1.1rem;
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
  background: linear-gradient(135deg, ${props => props.theme.buttonBackgroundColor}10 0%, ${props => props.theme.buttonBackgroundColor}05 100%);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin: 0.75rem 0;
  border-left: 3px solid ${props => props.theme.buttonBackgroundColor}aa;
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

// Progress bar for percentages
const ProgressBarContainer = styled.div`
  width: 100%;
  margin: 0.5rem 0;
`;

const ProgressBarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  
  .label {
    min-width: 80px;
    font-size: 0.85rem;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'};
    font-weight: 500;
  }
  
  .bar-wrapper {
    flex: 1;
    height: 10px;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb'};
    border-radius: 5px;
    overflow: hidden;
  }
  
  .bar-fill {
    height: 100%;
    border-radius: 5px;
    transition: width 0.5s ease;
  }
  
  .percentage {
    min-width: 45px;
    text-align: right;
    font-size: 0.85rem;
    font-weight: 600;
    color: ${props => props.theme.textColor};
  }
`;

const SavingsRateDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 0;
  
  .rate-value {
    font-size: 2rem;
    font-weight: 700;
    color: ${props => props.positive ? '#27ae60' : props.negative ? '#e74c3c' : props.theme.textColor};
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    
    span {
      font-size: 1.2rem;
    }
  }
  
  .rate-label {
    font-size: 0.8rem;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
    margin-top: 0.25rem;
  }
`;

const CategoryBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0;
  
  .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  
  .category-name {
    flex: 1;
    font-size: 0.85rem;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .category-value {
    font-size: 0.85rem;
    font-weight: 600;
    color: ${props => props.theme.textColor};
    min-width: 60px;
    text-align: right;
  }
  
  .category-percent {
    font-size: 0.8rem;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
    min-width: 40px;
    text-align: right;
  }
`;

const ProfileBanner = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.buttonBackgroundColor}15 0%, ${props => props.theme.buttonBackgroundColor}08 100%);
  border: 1px solid ${props => props.theme.buttonBackgroundColor}30;
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px ${props => props.theme.buttonBackgroundColor}20;
    border-color: ${props => props.theme.buttonBackgroundColor}50;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${props => props.theme.buttonBackgroundColor}, ${props => props.theme.buttonBackgroundColor}88);
    opacity: 0.6;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
    gap: 0.75rem;
  }
`;

const BannerIcon = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.buttonBackgroundColor}, ${props => props.theme.buttonBackgroundColor}dd);
  border-radius: 50%;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px ${props => props.theme.buttonBackgroundColor}30;
  min-width: 56px;
  height: 56px;
`;

const BannerContent = styled.div`
  flex: 1;
  
  h3 {
    color: ${props => props.theme.textColor};
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0 0 0.35rem 0;
    
    @media (max-width: 768px) {
      font-size: 1.05rem;
    }
  }
  
  p {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'};
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0;
    
    @media (max-width: 768px) {
      font-size: 0.85rem;
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
  gap: 1.5rem;
  width: 100%;
  max-width: none;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const RankingsHeader = styled.div`
  text-align: center;
  background: linear-gradient(135deg, ${props => props.theme.mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(255, 255, 255, 0.85)'} 0%, ${props => props.theme.mode === 'dark' ? 'rgba(17, 24, 39, 0.7)' : '#f8fafc'} 100%);
  border-radius: 18px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(75, 85, 99, 0.25)' : 'rgba(156, 163, 175, 0.15)'};
  box-shadow: ${props => props.theme.mode === 'dark' ? '0 4px 10px -2px rgba(0, 0, 0, 0.3)' : '0 2px 8px -2px rgba(0, 0, 0, 0.08)'};
  
  h2 {
    color: ${props => props.theme.textColor};
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.4rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    
    @media (max-width: 768px) {
      font-size: 1.25rem;
      flex-direction: column;
      gap: 0.4rem;
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
  gap: 1.25rem;
  width: 100%;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const RankingGroup = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(75, 85, 99, 0.25)' : 'rgba(156, 163, 175, 0.15)'};
  backdrop-filter: blur(10px);
  transition: all 0.25s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.mode === 'dark' ? '0 10px 20px -4px rgba(0, 0, 0, 0.4)' : '0 6px 16px -3px rgba(0, 0, 0, 0.08)'};
  }
  
  .group-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(75, 85, 99, 0.25)' : 'rgba(156, 163, 175, 0.15)'};
    
    .icon-container {
      background: linear-gradient(135deg, ${props => props.theme.buttonBackgroundColor}, ${props => props.theme.buttonBackgroundColor}dd);
      border-radius: 50%;
      padding: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px ${props => props.theme.buttonBackgroundColor}25;
    }
    
    h3 {
      color: ${props => props.theme.textColor};
      font-size: 1.15rem;
      font-weight: 700;
      margin: 0;
    }
  }
`;

const RankingCard = styled.div`
  background: ${props => {
    if (props.isTop) return `linear-gradient(135deg, ${props.theme.buttonBackgroundColor}15, ${props.theme.buttonBackgroundColor}08)`;
    if (props.isLow) return props.theme.mode === 'dark' ? 'rgba(99, 102, 241, 0.06)' : 'rgba(99, 102, 241, 0.04)';
    return props.theme.mode === 'dark' ? 'rgba(75, 85, 99, 0.15)' : 'rgba(243, 244, 246, 0.7)';
  }};
  border: 1px solid ${props => {
    if (props.isTop) return props.theme.buttonBackgroundColor + '30';
    if (props.isLow) return props.theme.mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)';
    return 'transparent';
  }};
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.65rem;
  transition: all 0.25s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateX(3px);
    box-shadow: 0 4px 14px rgba(0,0,0,0.08);
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    opacity: 0.7;
    background: ${props => {
      if (props.isTop) return `linear-gradient(180deg, ${props.theme.buttonBackgroundColor}, ${props.theme.buttonBackgroundColor}aa)`;
      if (props.isLow) return 'linear-gradient(180deg, #6366f1, #4f46e5)';
      return 'linear-gradient(180deg, #9ca3af, #6b7280)';
    }};
  }
  
  .rank-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    
    h4 {
      color: ${props => props.theme.textColor};
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.4rem;
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
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'};
    font-size: 0.85rem;
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
  border-radius: 20px;
  padding: 2rem;
  max-width: 440px;
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
    font-size: 3rem;
    margin-bottom: 0.75rem;
  }
  
  h3 {
    color: ${props => props.theme.textColor};
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0 0 0.75rem 0;
  }
  
  p {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'};
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0 0 1.5rem 0;
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

function Comparison({ theme, userData, isHidden}) {
    const { language, translations } = useContext(LanguageContext);
    const { formatAmount } = useContext(CurrencyContext);
    const [activeTab, setActiveTab] = useState('insights');
    const [expandedCards, setExpandedCards] = useState({});
    const [showMotivationalPopup, setShowMotivationalPopup] = useState(false);
    const [popupContent, setPopupContent] = useState({ type: '', title: '', message: '', icon: '' });
    const navigate = useLocalizedNavigate();

    // Funzioni helper per Rankings
    const getRankLevel = (rank) => {
        if (!rank || rank === '' || isNaN(rank)) return 'none';
        const numRank = parseFloat(rank);
        if (numRank <= 20) return 'top';
        if (numRank >= 70) return 'low';
        return 'medium';
    };

    const getRankDescription = (rank, category, isExpense = false) => {
        if (!rank || rank === '' || isNaN(rank)) return translations.leaderboard.rankings.noData;
        
        const numRank = Math.min(parseFloat(rank), 99);
        const level = getRankLevel(numRank);
        
        const categoryKey = isExpense ? 'outflows' : category;
        const descriptions = translations.leaderboard.rankings.descriptions[categoryKey];
        
        if (descriptions) {
            return descriptions[level] || descriptions.medium;
        }
        
        // Fallback generico
        if (level === 'top') return `${translations.leaderboard.rankings.topPerformance} Top ${numRank}%`;
        if (level === 'low') return `${translations.leaderboard.rankings.canImprove} Top ${numRank}%`;
        return `${translations.leaderboard.rankings.goodPerformance} Top ${numRank}%`;
    };

    const showMotivationalMessage = (rank, category, isExpense = false) => {
        if (!rank || rank === '' || isNaN(rank)) return;
        
        const numRank = parseFloat(rank);
        const level = getRankLevel(numRank);
        
        const categoryKey = isExpense ? 'outflows' : category;
        const motivationalTexts = translations.leaderboard.rankings.motivational[level];
        
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

    // Get averages from userData (fetched from /stats/averages API)
    const userAverages = userData?.averages || { all: {}, similar: {} };
    
    const comparisonData = {
        avgBalance: {
            user: {
                current: getTotalValue(userData) || 0,
                growth12Months: getBalanceGrowth12Months(userData)
            },
            similarUsers: {
                current: userAverages.similar?.balances ?? null,
                growth12Months: null // Will be added when API provides this data
            },
            allUsers: {
                current: userAverages.all?.balances ?? 0,
                growth12Months: null // Will be added when API provides this data
            }
        },
        avgIncome: {
            user: calculateAverage(userIncomesArray),
            similarUsers: userAverages.similar?.incomes ?? null,
            allUsers: userAverages.all?.incomes ?? 0
        },
        avgOutflows: {
            user: calculateAverage(userOutflowsArray),
            similarUsers: userAverages.similar?.expenses ?? null,
            allUsers: userAverages.all?.expenses ?? 0
        }
    };

    // Calculate Savings Rate (last 12 months)
    const calculateSavingsRate = () => {
        const totalIncomes = userIncomesArray.slice(0, 12).reduce((sum, val) => sum + (val || 0), 0);
        const totalOutflows = userOutflowsArray.slice(0, 12).reduce((sum, val) => sum + (val || 0), 0);
        
        if (totalIncomes <= 0) return null;
        return ((totalIncomes - totalOutflows) / totalIncomes) * 100;
    };
    
    const userSavingsRate = calculateSavingsRate();

    // Get averages savings rates from API
    const allUsersSavingsRate = getAveragesAllSavingsRates(userData);
    const similarUsersSavingsRate = getAveragesSimilarSavingsRates(userData);

    // Get averages expenses by category from API
    const allUsersExpensesByCategory = getAveragesAllExpensesByCategory(userData);
    const similarUsersExpensesByCategory = getAveragesSimilarExpensesByCategory(userData);

    // Calculate Asset Allocation
    const calculateAssetAllocation = () => {
        const currentBalance = userData?.balances?.[0]?.balance || {};
        const totalValue = getTotalValue(userData) || 0;
        
        if (totalValue <= 0) return [];
        
        // Group assets into categories
        const liquid = (currentBalance.cash || 0) + (currentBalance.bank || 0) + (currentBalance.digitalServices || 0) + (currentBalance.emergencyFund || 0);
        const investments = (currentBalance.stocks || 0) + (currentBalance.etf || 0) + (currentBalance.bonds || 0) + (currentBalance.funds || 0) + (currentBalance.gold || 0);
        const crypto = (currentBalance.bitcoin || 0) + (currentBalance.crypto || 0);
        
        const allocations = [
            { name: translations.comparison.cards.assetAllocation.liquid || 'Liquidità', value: liquid, percentage: (liquid / totalValue) * 100, color: '#3498db' },
            { name: translations.comparison.cards.assetAllocation.investments || 'Investimenti', value: investments, percentage: (investments / totalValue) * 100, color: '#27ae60' },
            { name: translations.comparison.cards.assetAllocation.crypto || 'Crypto', value: crypto, percentage: (crypto / totalValue) * 100, color: '#f39c12' }
        ].filter(a => a.value > 0);
        
        return allocations.sort((a, b) => b.percentage - a.percentage);
    };
    
    const assetAllocation = calculateAssetAllocation();

    // Calculate Spending by Category (last 12 months)
    const calculateSpendingByCategory = () => {
        const totalOutflowsPerCategory = getTotalOutflowsPerCategoryPerMonth(userData);
        const categoryTotals = {};
        
        // Sum up all categories across 12 months
        for (let i = 0; i < 12; i++) {
            const monthData = totalOutflowsPerCategory[i] || {};
            Object.entries(monthData).forEach(([category, amount]) => {
                categoryTotals[category] = (categoryTotals[category] || 0) + amount;
            });
        }
        
        const totalSpending = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
        if (totalSpending <= 0) return [];
        
        const categories = Object.entries(categoryTotals)
            .map(([name, value]) => ({
                name,
                value,
                percentage: (value / totalSpending) * 100,
                color: getCategoryColor(name, language)
            }))
            .sort((a, b) => b.value - a.value);
        
        return categories;
    };
    
    const spendingByCategory = calculateSpendingByCategory();

    const formatCurrency = (value) => {
        if (isHidden) return '****';
        if (value === null || value === undefined) return translations.general.comingSoon || 'Coming soon';
        return formatAmount(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const formatGrowthPercentage = (value) => {
        if (isHidden) return '****';
        if (value === null || value === undefined) return '';
        if (value === 0) return translations.comparison.cards.avgBalance.noGrowthData;
        
        const sign = value > 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}% ${translations.comparison.cards.avgBalance.growth12Months}`;
    };

    const getComparisonIcon = (userValue, compareValue) => {
        if (compareValue === null || compareValue === undefined) return null;
        if (userValue > compareValue) return <TrendingUpIcon style={{ color: '#27ae60' }} />;
        if (userValue < compareValue) return <TrendingDownIcon style={{ color: '#e74c3c' }} />;
        return <EqualIcon style={{ color: '#f39c12' }} />;
    };

    const getBalanceComparisonIcon = (userBalance, compareBalance) => {
        if (compareBalance?.current === null || compareBalance?.current === undefined) return null;
        if (userBalance.current > compareBalance.current) return <TrendingUpIcon style={{ color: '#27ae60' }} />;
        if (userBalance.current < compareBalance.current) return <TrendingDownIcon style={{ color: '#e74c3c' }} />;
        return <EqualIcon style={{ color: '#f39c12' }} />;
    };

    const generateInsights = () => {
        const insights = [];
        const { avgBalance, avgIncome, avgOutflows } = comparisonData;
        
        // Only generate insight if similarUsers data is available
        if (avgBalance.similarUsers.current !== null && avgBalance.user.current > avgBalance.similarUsers.current) {
            insights.push({
                type: 'positive',
                title: translations.comparison.insights.betterThan + ' 70% ' + translations.comparison.insights.ofUsers,
                description: translations.comparison.tips.goodBalance
            });
        }
        
        if (avgOutflows.user > avgIncome.user * 0.8) {
            insights.push({
                type: 'warning',
                title: translations.comparison.tips.title,
                description: translations.comparison.tips.highOutflows
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
                <h3>{translations.comparison.profileBanner?.title || '🚀 Sblocca confronti personalizzati!'}</h3>
                <p>
                    {translations.comparison.profileBanner?.description || 'Completa il tuo profilo nella pagina Account per ottenere confronti anonimi e automatizzati con utenti simili a te. Scopri come ti posizioni rispetto ad altri professionisti!'}
                </p>
            </BannerContent>
            <BannerAction theme={theme}>
                {translations.comparison.profileBanner?.action || 'Completa profilo'}
                <ArrowForwardIcon />
            </BannerAction>
        </ProfileBanner>
    );

    const toggleCardExpand = (cardId) => {
        setExpandedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
    };

    const renderInsightsTab = () => (
        <>
            {ProfileCompletionPercentage !== 100 && renderProfileBanner()}
            <TopGrid>
                <ComparisonCard theme={theme} accent="#3498db">
                    <CardHeader theme={theme}>
                        <h3><AccountBalanceIcon /> {translations.comparison.cards.avgBalance.title}</h3>
                        <Tooltip title={translations.comparison.cards.avgBalance.description}>
                            <InfoIcon style={{ color: theme.textColor }} />
                        </Tooltip>
                    </CardHeader>
                    <MetricRow theme={theme}>
                        <span className="label">{translations.comparison.cards.avgBalance.yourBalance}</span>
                        <BalanceValueContainer theme={theme} growth={comparisonData.avgBalance.user.growth12Months}>
                            <div className="main-value">
                                {formatCurrency(comparisonData.avgBalance.user.current)}
                            </div>
                            <div className="growth-value">
                                {formatGrowthPercentage(comparisonData.avgBalance.user.growth12Months)}
                            </div>
                        </BalanceValueContainer>
                    </MetricRow>
                    <MetricRow theme={theme}>
                        <span className="label">{translations.comparison.cards.avgBalance.avgSimilar}</span>
                        <BalanceValueContainer theme={theme} growth={comparisonData.avgBalance.similarUsers.growth12Months}>
                            <div className="main-value">
                                {formatCurrency(comparisonData.avgBalance.similarUsers.current)}
                                {getBalanceComparisonIcon(comparisonData.avgBalance.user, comparisonData.avgBalance.similarUsers)}
                            </div>
                            <div className="growth-value">
                                {formatGrowthPercentage(comparisonData.avgBalance.similarUsers.growth12Months)}
                            </div>
                        </BalanceValueContainer>
                    </MetricRow>
                    <MetricRow theme={theme}>
                        <span className="label">{translations.comparison.cards.avgBalance.avgAll}</span>
                        <BalanceValueContainer theme={theme} growth={comparisonData.avgBalance.allUsers.growth12Months}>
                            <div className="main-value">
                                {formatCurrency(comparisonData.avgBalance.allUsers.current)}
                                {getBalanceComparisonIcon(comparisonData.avgBalance.user, comparisonData.avgBalance.allUsers)}
                            </div>
                            <div className="growth-value">
                                {formatGrowthPercentage(comparisonData.avgBalance.allUsers.growth12Months)}
                            </div>
                        </BalanceValueContainer>
                    </MetricRow>
                </ComparisonCard>

                <ComparisonCard theme={theme} accent="#27ae60">
                    <CardHeader theme={theme}>
                        <h3><MonetizationOnIcon /> {translations.comparison.cards.avgIncome.title}</h3>
                        <Tooltip title={translations.comparison.cards.avgIncome.description}>
                            <InfoIcon style={{ color: theme.textColor }} />
                        </Tooltip>
                    </CardHeader>
                    <MetricRow theme={theme}>
                        <span className="label">{translations.comparison.cards.avgIncome.yourIncome}</span>
                        <span className="value">
                            {formatCurrency(comparisonData.avgIncome.user)}
                        </span>
                    </MetricRow>
                    <MetricRow theme={theme}>
                        <span className="label">{translations.comparison.cards.avgIncome.avgSimilar}</span>
                        <span className="value">
                            {formatCurrency(comparisonData.avgIncome.similarUsers)}
                            {getComparisonIcon(comparisonData.avgIncome.user, comparisonData.avgIncome.similarUsers)}
                        </span>
                    </MetricRow>
                    <MetricRow theme={theme}>
                        <span className="label">{translations.comparison.cards.avgIncome.avgAll}</span>
                        <span className="value">
                            {formatCurrency(comparisonData.avgIncome.allUsers)}
                            {getComparisonIcon(comparisonData.avgIncome.user, comparisonData.avgIncome.allUsers)}
                        </span>
                    </MetricRow>
                </ComparisonCard>

                <ComparisonCard theme={theme} accent="#e74c3c">
                    <CardHeader theme={theme}>
                        <h3><TrendingDownIcon /> {translations.comparison.cards.avgOutflows.title}</h3>
                        <Tooltip title={translations.comparison.cards.avgOutflows.description}>
                            <InfoIcon style={{ color: theme.textColor }} />
                        </Tooltip>
                    </CardHeader>
                    <MetricRow theme={theme}>
                        <span className="label">{translations.comparison.cards.avgOutflows.yourOutflows}</span>
                        <span className="value">
                            {formatCurrency(comparisonData.avgOutflows.user)}
                        </span>
                    </MetricRow>
                    <MetricRow theme={theme}>
                        <span className="label">{translations.comparison.cards.avgOutflows.avgSimilar}</span>
                        <span className="value">
                            {formatCurrency(comparisonData.avgOutflows.similarUsers)}
                            {getComparisonIcon(comparisonData.avgOutflows.similarUsers, comparisonData.avgOutflows.user)}
                        </span>
                    </MetricRow>
                    <MetricRow theme={theme}>
                        <span className="label">{translations.comparison.cards.avgOutflows.avgAll}</span>
                        <span className="value">
                            {formatCurrency(comparisonData.avgOutflows.allUsers)}
                            {getComparisonIcon(comparisonData.avgOutflows.allUsers, comparisonData.avgOutflows.user)}
                        </span>
                    </MetricRow>
                </ComparisonCard>

                {/* Savings Rate Card */}
                <ComparisonCard theme={theme} accent="#9b59b6">
                    <CardHeader theme={theme}>
                        <h3><SavingsIcon /> {translations.comparison.cards.savingsRate.title}</h3>
                        <Tooltip title={translations.comparison.cards.savingsRate.description}>
                            <InfoIcon style={{ color: theme.textColor }} />
                        </Tooltip>
                    </CardHeader>
                    {userSavingsRate !== null ? (
                        <>
                            <SavingsRateDisplay theme={theme} positive={userSavingsRate >= 20} negative={userSavingsRate < 0}>
                                <div className="rate-value">
                                    {isHidden ? '****' : `${userSavingsRate.toFixed(1)}`}<span>%</span>
                                </div>
                                <div className="rate-label">{translations.comparison.cards.savingsRate.last12Months}</div>
                            </SavingsRateDisplay>
                            <MetricRow theme={theme}>
                                <span className="label">{translations.comparison.cards.savingsRate.yourRate}</span>
                                <span className="value" style={{ color: userSavingsRate >= 20 ? '#27ae60' : userSavingsRate < 0 ? '#e74c3c' : theme.textColor }}>
                                    {isHidden ? '****' : `${userSavingsRate.toFixed(1)}%`}
                                </span>
                            </MetricRow>
                            <MetricRow theme={theme}>
                                <span className="label">{translations.comparison.cards.savingsRate.avgSimilar}</span>
                                <span className="value">
                                    {similarUsersSavingsRate !== null ? (
                                        <>
                                            {isHidden ? '****' : `${similarUsersSavingsRate.toFixed(1)}%`}
                                            {getComparisonIcon(userSavingsRate, similarUsersSavingsRate)}
                                        </>
                                    ) : (
                                        translations.general.comingSoon || 'Coming soon'
                                    )}
                                </span>
                            </MetricRow>
                            <MetricRow theme={theme}>
                                <span className="label">{translations.comparison.cards.savingsRate.avgAll}</span>
                                <span className="value">
                                    {allUsersSavingsRate !== null ? (
                                        <>
                                            {isHidden ? '****' : `${allUsersSavingsRate.toFixed(1)}%`}
                                            {getComparisonIcon(userSavingsRate, allUsersSavingsRate)}
                                        </>
                                    ) : (
                                        translations.general.comingSoon || 'Coming soon'
                                    )}
                                </span>
                            </MetricRow>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem 0', color: theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                            {translations.comparison.cards.savingsRate.noData}
                        </div>
                    )}
                </ComparisonCard>
            </TopGrid>

            <BottomGrid>
                {/* Asset Allocation Card */}
                <ComparisonCard theme={theme} accent="#16a085">
                    <CardHeader theme={theme}>
                        <h3><PieChartIcon /> {translations.comparison.cards.assetAllocation.title}</h3>
                        <Tooltip title={translations.comparison.cards.assetAllocation.description}>
                            <InfoIcon style={{ color: theme.textColor }} />
                        </Tooltip>
                    </CardHeader>
                    {assetAllocation.length > 0 ? (
                        <>
                            <ExpandableCardContent expanded={expandedCards['assets']} theme={theme}>
                                <ProgressBarContainer>
                                    {assetAllocation.map((asset, index) => (
                                        <ProgressBarRow key={index} theme={theme}>
                                            <span className="label">{asset.name}</span>
                                            <div className="bar-wrapper">
                                                <div 
                                                    className="bar-fill" 
                                                    style={{ 
                                                        width: `${asset.percentage}%`, 
                                                        background: asset.color 
                                                    }} 
                                                />
                                            </div>
                                            <span className="percentage">
                                                {isHidden ? '**%' : `${asset.percentage.toFixed(0)}%`}
                                            </span>
                                        </ProgressBarRow>
                                    ))}
                                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#eee'}` }}>
                                        {assetAllocation.map((asset, index) => (
                                            <CategoryBar key={index} theme={theme}>
                                                <div className="color-dot" style={{ background: asset.color }} />
                                                <span className="category-name">{asset.name}</span>
                                                <span className="category-value">
                                                    {isHidden ? '****' : formatCurrency(asset.value)}
                                                </span>
                                            </CategoryBar>
                                        ))}
                                    </div>
                                </ProgressBarContainer>
                            </ExpandableCardContent>
                            {assetAllocation.length > 3 && (
                                <ExpandToggle theme={theme} onClick={() => toggleCardExpand('assets')}>
                                    {expandedCards['assets'] ? (
                                        <><KeyboardArrowUpIcon sx={{ fontSize: 16 }} /> {translations.comparison.cards.showLess || 'Riduci'}</>
                                    ) : (
                                        <><KeyboardArrowDownIcon sx={{ fontSize: 16 }} /> {translations.comparison.cards.showMore || 'Mostra tutto'}</>
                                    )}
                                </ExpandToggle>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem 0', color: theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                            {translations.comparison.cards.assetAllocation.noAssets}
                        </div>
                    )}
                </ComparisonCard>

                {/* Spending by Category Card */}
                <ComparisonCard theme={theme} accent="#e67e22">
                    <CardHeader theme={theme}>
                        <h3><BarChartIcon /> {translations.comparison.cards.spendingCategories.title}</h3>
                        <Tooltip title={translations.comparison.cards.spendingCategories.description}>
                            <InfoIcon style={{ color: theme.textColor }} />
                        </Tooltip>
                    </CardHeader>
                    {spendingByCategory.length > 0 ? (
                        <>
                            <ExpandableCardContent expanded={expandedCards['spending']} theme={theme}>
                                <div style={{ fontSize: '0.85rem', color: theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', marginBottom: '0.5rem' }}>
                                    {translations.comparison.cards.spendingCategories.topCategories}
                                </div>
                                {spendingByCategory.slice(0, 5).map((category, index) => {
                                // Find the category index to look up averages
                                const categoryIndex = userData?.tags?.outflowsTags?.find(
                                    t => t.translations?.en === category.name || t.translations?.it === category.name || t.label === category.name.toLowerCase()
                                )?.index;
                                
                                const similarAvg = categoryIndex && similarUsersExpensesByCategory ? similarUsersExpensesByCategory[categoryIndex] : null;
                                const allAvg = categoryIndex && allUsersExpensesByCategory ? allUsersExpensesByCategory[categoryIndex] : null;
                                
                                return (
                                    <div key={index} style={{ marginBottom: '0.75rem' }}>
                                        <CategoryBar theme={theme}>
                                            <div className="color-dot" style={{ background: category.color }} />
                                            <span className="category-name">{category.name}</span>
                                            <span className="category-value">
                                                {isHidden ? '****' : formatCurrency(category.value)}
                                            </span>
                                            <span className="category-percent">
                                                {isHidden ? '**%' : `${category.percentage.toFixed(0)}%`}
                                            </span>
                                        </CategoryBar>
                                        {(similarAvg !== null && similarAvg !== undefined && similarAvg > 0) && (
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                paddingLeft: '1.5rem', 
                                                fontSize: '0.78rem', 
                                                color: theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                                                marginTop: '2px'
                                            }}>
                                                <span>{translations.comparison.cards.spendingCategories.avgSimilar || translations.comparison.cards.avgOutflows.avgSimilar}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {isHidden ? '****' : formatCurrency(similarAvg)}
                                                    {getComparisonIcon(similarAvg, category.value)}
                                                </span>
                                            </div>
                                        )}
                                        {(allAvg !== null && allAvg !== undefined && allAvg > 0) && (
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                paddingLeft: '1.5rem', 
                                                fontSize: '0.78rem', 
                                                color: theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
                                                marginTop: '1px'
                                            }}>
                                                <span>{translations.comparison.cards.spendingCategories.avgAll || translations.comparison.cards.avgOutflows.avgAll}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {isHidden ? '****' : formatCurrency(allAvg)}
                                                    {getComparisonIcon(allAvg, category.value)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                                {spendingByCategory.length > 5 && (
                                    <>
                                        <div style={{ fontSize: '0.8rem', color: theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', marginTop: '0.75rem', marginBottom: '0.25rem' }}>
                                            {translations.comparison.cards.spendingCategories.otherCategories} ({spendingByCategory.length - 5})
                                        </div>
                                        <CategoryBar theme={theme}>
                                            <div className="color-dot" style={{ background: '#7f8c8d' }} />
                                            <span className="category-name">{translations.comparison.cards.assetAllocation.other || 'Other'}</span>
                                            <span className="category-value">
                                                {isHidden ? '****' : formatCurrency(spendingByCategory.slice(5).reduce((sum, c) => sum + c.value, 0))}
                                            </span>
                                            <span className="category-percent">
                                                {isHidden ? '**%' : `${spendingByCategory.slice(5).reduce((sum, c) => sum + c.percentage, 0).toFixed(0)}%`}
                                            </span>
                                        </CategoryBar>
                                    </>
                                )}
                            </ExpandableCardContent>
                            <ExpandToggle theme={theme} onClick={() => toggleCardExpand('spending')}>
                                {expandedCards['spending'] ? (
                                    <><KeyboardArrowUpIcon sx={{ fontSize: 16 }} /> {translations.comparison.cards.showLess || 'Riduci'}</>
                                ) : (
                                    <><KeyboardArrowDownIcon sx={{ fontSize: 16 }} /> {translations.comparison.cards.showMore || 'Mostra tutto'}</>
                                )}
                            </ExpandToggle>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem 0', color: theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                            {translations.comparison.cards.spendingCategories.noExpenses}
                        </div>
                    )}
                </ComparisonCard>
            </BottomGrid>

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
        const expenseRank = getPercentageRankOnOutflows(userData);
        const balanceSimilarRank = getPercentageRankOnBalanceSimilar(userData);
        const incomeSimilarRank = getPercentageRankOnIncomesSimilar(userData);
        const expenseSimilarRank = getPercentageRankOnOutflowsSimilar(userData);

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
                        <EmojiEventsIcon style={{ fontSize: '1.8rem', color: theme.buttonBackgroundColor }} />
                        {translations.leaderboard.rankings.title}
                    </h2>
                    <div className="month-indicator">
                        <CalendarTodayIcon style={{ fontSize: '1rem' }} />
                        {translations.leaderboard.rankings.monthData} {getCurrentMonth()}
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
                                <h3>{translations.leaderboard.rankings.generalRanking}</h3>
                                <p style={{ 
                                    color: theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', 
                                    margin: 0, 
                                    fontSize: '0.9rem' 
                                }}>
                                    {translations.leaderboard.rankings.generalSubtitle}
                                </p>
                            </div>
                        </div>
                        
                        <RankCard 
                            title={translations.leaderboard.rankings.balance} 
                            rank={balanceRank}
                            icon={<AccountBalanceIcon style={{ fontSize: '1.2rem', marginRight: '0.25rem' }} />}
                            category="balance"
                        />
                        
                        <RankCard 
                            title={translations.leaderboard.rankings.income} 
                            rank={incomeRank}
                            icon={<MonetizationOnIcon style={{ fontSize: '1.2rem', marginRight: '0.25rem' }} />}
                            category="income"
                        />
                        
                        <RankCard 
                            title={translations.leaderboard.rankings.outflows} 
                            rank={expenseRank}
                            icon={<TrendingDownIcon style={{ fontSize: '1.2rem', marginRight: '0.25rem' }} />}
                            category="outflows"
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
                                <h3>{translations.leaderboard.rankings.similarRanking}</h3>
                                <p style={{ 
                                    color: theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', 
                                    margin: 0, 
                                    fontSize: '0.9rem' 
                                }}>
                                    {translations.leaderboard.rankings.similarSubtitle}
                                </p>
                            </div>
                        </div>
                        
                        <RankCard 
                            title={translations.leaderboard.rankings.balance} 
                            rank={balanceSimilarRank}
                            icon={<AccountBalanceIcon style={{ fontSize: '1.2rem', marginRight: '0.25rem' }} />}
                            category="balance"
                        />
                        
                        <RankCard 
                            title={translations.leaderboard.rankings.income} 
                            rank={incomeSimilarRank}
                            icon={<MonetizationOnIcon style={{ fontSize: '1.2rem', marginRight: '0.25rem' }} />}
                            category="income"
                        />
                        
                        <RankCard 
                            title={translations.leaderboard.rankings.outflows} 
                            rank={expenseSimilarRank}
                            icon={<TrendingDownIcon style={{ fontSize: '1.2rem', marginRight: '0.25rem' }} />}
                            category="outflows"
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
                                {translations.leaderboard.rankings.popup.close}
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
                    <h1>{translations.comparison.title}</h1>
                    <p>{translations.comparison.subtitle}</p>
                </SectionHeader>

                <SectionTabs theme={theme}>
                    <TabButton 
                        theme={theme} 
                        active={activeTab === 'insights'} 
                        onClick={() => setActiveTab('insights')}
                        data-umami-event="comparison-tab-insights"
                    >
                        <BarChartIcon />
                        {translations.comparison.sections.insights.title}
                    </TabButton>
                    <TabButton 
                        theme={theme} 
                        active={activeTab === 'rankings'} 
                        onClick={() => setActiveTab('rankings')}
                        data-umami-event="comparison-tab-rankings"
                    >
                        <CompareArrowsIcon />
                        {translations.comparison.sections.rankings.title}
                    </TabButton>
                </SectionTabs>

                {activeTab === 'insights' && renderInsightsTab()}
                {activeTab === 'rankings' && renderRankingsTab()}
            </ComparisonContainer>
        </Section>
    );
}

export default Comparison;

