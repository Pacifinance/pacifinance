import React, { useContext, useState } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import languages from '../data/languages.json';
import {
  TrendingUp as TrendingUpIcon,
  Savings as SavingsIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Paid as PaidIcon,
  PieChart as PieChartIcon,
  School as SchoolIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  LightbulbOutlined as LightbulbIcon,
  TipsAndUpdates as TipsIcon,
  AutoGraph as AutoGraphIcon,
  Security as SecurityIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import styled, { keyframes } from 'styled-components';
import { StandardPageTitle } from '../styles/MyStyled';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

const KnowledgeContainer = styled.div`
  flex: 1;
  padding: ${props => props.isMobile ? '1rem' : '2rem 3rem'};
  background: ${props => props.theme.backgroundColor};
  color: ${props => props.theme.textColor};
  min-height: 100vh;
  overflow-y: auto;
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const HeaderIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.buttonBackgroundColor} 0%, #0a5d3a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(7, 145, 100, 0.3);
  
  svg {
    font-size: 40px;
    color: white;
  }
`;

const Subtitle = styled.p`
  font-size: ${props => props.isMobile ? '1rem' : '1.2rem'};
  opacity: 0.8;
  margin-bottom: 1.5rem;
  text-align: center;
  color: ${props => props.theme.textColor};
  line-height: 1.6;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

const Disclaimer = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 152, 0, 0.1) 100%)'
    : 'linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 193, 7, 0.3)' : '#ffeaa7'};
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 2rem;
  color: ${props => props.theme.mode === 'dark' ? '#ffd54f' : '#856404'};
  font-size: 0.9rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  
  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))'};
  gap: 1.25rem;
  margin-bottom: 2rem;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
`;

const SectionCard = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)' 
    : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'};
  border: 2px solid ${props => props.isActive ? props.theme.buttonBackgroundColor : 'transparent'};
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.theme.mode === 'dark'
    ? '0 4px 20px rgba(0,0,0,0.3)'
    : '0 4px 20px rgba(0,0,0,0.08)'};
  animation: ${fadeIn} 0.5s ease-out;
  animation-delay: ${props => props.delay || '0s'};
  animation-fill-mode: both;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${props => props.theme.buttonBackgroundColor}, #0a5d3a);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.mode === 'dark'
      ? '0 12px 40px rgba(0,0,0,0.4)'
      : '0 12px 40px rgba(0,0,0,0.12)'};
    border-color: ${props => props.theme.buttonBackgroundColor};
    
    &::before {
      transform: scaleX(1);
    }
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SectionIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, ${props => props.theme.buttonBackgroundColor} 0%, #0a5d3a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(7, 145, 100, 0.25);
  flex-shrink: 0;
  
  svg {
    font-size: 28px;
  }
`;

const SectionInfo = styled.div`
  flex: 1;
`;

const SectionTitleText = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 0.35rem 0;
  color: ${props => props.theme.textColor};
`;

const SectionSubtitle = styled.p`
  opacity: 0.65;
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.4;
`;

const SectionArrow = styled.div`
  color: ${props => props.theme.buttonBackgroundColor};
  opacity: 0.5;
  transition: all 0.3s ease;
  
  ${SectionCard}:hover & {
    opacity: 1;
    transform: translateX(4px);
  }
`;

// Content Area Styles
const ContentArea = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8f9fa'};
  border-radius: 16px;
  padding: ${props => props.isMobile ? '1.25rem' : '2rem'};
  margin-top: 1rem;
  animation: ${slideIn} 0.4s ease-out;
`;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
`;

const ContentIconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, ${props => props.theme.buttonBackgroundColor} 0%, #0a5d3a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 6px 20px rgba(7, 145, 100, 0.3);
  
  svg {
    font-size: 32px;
  }
`;

const ContentTitleWrapper = styled.div`
  flex: 1;
`;

const ContentTitle = styled.h2`
  color: ${props => props.theme.textColor};
  font-size: ${props => props.isMobile ? '1.5rem' : '1.75rem'};
  font-weight: 700;
  margin: 0 0 0.25rem 0;
`;

const ContentSubtitle = styled.p`
  color: ${props => props.theme.textColor};
  opacity: 0.6;
  margin: 0;
  font-size: 0.95rem;
`;

const IntroCard = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(7, 145, 100, 0.15) 0%, rgba(7, 145, 100, 0.05) 100%)'
    : 'linear-gradient(135deg, #e8f5e8 0%, #f0fff0 100%)'};
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid ${props => props.theme.buttonBackgroundColor};
  
  p {
    margin: 0;
    line-height: 1.7;
    font-size: 1.05rem;
    color: ${props => props.theme.textColor};
  }
`;

const SubsectionCard = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white'};
  border-radius: 12px;
  margin-bottom: 1rem;
  overflow: hidden;
  box-shadow: ${props => props.theme.mode === 'dark'
    ? '0 2px 8px rgba(0,0,0,0.2)'
    : '0 2px 8px rgba(0,0,0,0.06)'};
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: ${props => props.theme.mode === 'dark'
      ? '0 4px 16px rgba(0,0,0,0.3)'
      : '0 4px 16px rgba(0,0,0,0.1)'};
  }
`;

const SubsectionHeader = styled.div`
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background: ${props => props.isExpanded 
    ? (props.theme.mode === 'dark' ? 'rgba(7, 145, 100, 0.1)' : 'rgba(7, 145, 100, 0.05)')
    : 'transparent'};
  transition: background 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(7, 145, 100, 0.15)' : 'rgba(7, 145, 100, 0.08)'};
  }
`;

const SubsectionTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SubsectionIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(7, 145, 100, 0.2)' : 'rgba(7, 145, 100, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.buttonBackgroundColor};
  
  svg {
    font-size: 20px;
  }
`;

const SubsectionTitle = styled.h4`
  color: ${props => props.theme.textColor};
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
`;

const ExpandIcon = styled.div`
  color: ${props => props.theme.buttonBackgroundColor};
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
  transform: ${props => props.isExpanded ? 'rotate(180deg)' : 'rotate(0)'};
`;

const SubsectionContent = styled.div`
  padding: ${props => props.isExpanded ? '0 1.25rem 1.25rem' : '0'};
  max-height: ${props => props.isExpanded ? '2000px' : '0'};
  opacity: ${props => props.isExpanded ? '1' : '0'};
  overflow: hidden;
  transition: all 0.4s ease;
`;

const Description = styled.p`
  line-height: 1.7;
  font-size: 1rem;
  margin-bottom: 1rem;
  color: ${props => props.theme.textColor};
  opacity: 0.9;
`;

const ProsCons = styled.div`
  display: grid;
  grid-template-columns: ${props => props.isMobile ? '1fr' : '1fr 1fr'};
  gap: 1rem;
  margin-top: 1rem;
`;

const ProsConsBox = styled.div`
  padding: 1rem;
  border-radius: 10px;
  background: ${props => props.type === 'pros' 
    ? (props.theme.mode === 'dark' ? 'rgba(40, 167, 69, 0.15)' : '#d4edda')
    : (props.theme.mode === 'dark' ? 'rgba(220, 53, 69, 0.15)' : '#f8d7da')};
  border: 1px solid ${props => props.type === 'pros' 
    ? (props.theme.mode === 'dark' ? 'rgba(40, 167, 69, 0.3)' : '#c3e6cb')
    : (props.theme.mode === 'dark' ? 'rgba(220, 53, 69, 0.3)' : '#f5c6cb')};
`;

const ProsConsTitle = styled.h6`
  margin: 0 0 0.75rem 0;
  font-weight: 700;
  font-size: 0.95rem;
  color: ${props => props.type === 'pros' 
    ? (props.theme.mode === 'dark' ? '#6fcf97' : '#155724')
    : (props.theme.mode === 'dark' ? '#f77b7b' : '#721c24')};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProsConsList = styled.div`
  white-space: pre-line;
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${props => props.type === 'pros' 
    ? (props.theme.mode === 'dark' ? '#6fcf97' : '#155724')
    : (props.theme.mode === 'dark' ? '#f77b7b' : '#721c24')};
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
`;

const ListItem = styled.li`
  padding: 0.6rem 0;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.95rem;
  line-height: 1.5;

  &:last-child {
    border-bottom: none;
  }
`;

const ListIcon = styled.span`
  color: ${props => props.theme.buttonBackgroundColor};
  flex-shrink: 0;
  margin-top: 2px;
`;

const StepNumber = styled.span`
  background: linear-gradient(135deg, ${props => props.theme.buttonBackgroundColor} 0%, #0a5d3a 100%);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
`;

const InfoBlock = styled.div`
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
`;

const InfoLabel = styled.strong`
  color: ${props => props.color || props.theme.buttonBackgroundColor};
  font-size: 0.95rem;
`;

const ExampleBox = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(7, 145, 100, 0.15)' : '#e8f5e8'};
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(7, 145, 100, 0.3)' : 'rgba(7, 145, 100, 0.2)'};
`;

const ExampleTitle = styled.strong`
  color: ${props => props.theme.buttonBackgroundColor};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const ExampleContent = styled.div`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${props => props.theme.textColor};
`;

const RiskBadge = styled.span`
  background: ${props => {
    if (props.level === 0) return 'linear-gradient(135deg, #28a745, #20c997)';
    if (props.level === 1) return 'linear-gradient(135deg, #ffc107, #fd7e14)';
    return 'linear-gradient(135deg, #dc3545, #c82333)';
  }};
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const BackButton = styled.button`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  color: ${props => props.theme.textColor};
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  margin-bottom: 1rem;

  &:hover {
    background: ${props => props.theme.buttonBackgroundColor};
    color: white;
    transform: translateX(-4px);
  }
  
  svg {
    font-size: 20px;
  }
`;

const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: ${props => props.theme.textColor};
  opacity: 0.6;
  margin-bottom: 1rem;
`;

const Knowledge = () => {
  const { theme } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  const [activeSection, setActiveSection] = useState(null);
  const [expandedSubsections, setExpandedSubsections] = useState({});

  const knowledge = languages[language].knowledge;

  const sectionIcons = {
    investments: <TrendingUpIcon />,
    saving: <SavingsIcon />,
    budgeting: <AccountBalanceWalletIcon />,
    salary_management: <PaidIcon />,
    portfolio_management: <PieChartIcon />,
    general_knowledge: <SchoolIcon />
  };

  const getSubsectionIcon = (key) => {
    const iconMap = {
      etf: <AutoGraphIcon />,
      stocks: <TrendingUpIcon />,
      bonds: <SecurityIcon />,
      crypto: <TipsIcon />,
      government_bonds: <SecurityIcon />,
      beginner_tips: <LightbulbIcon />,
      emergency_fund: <SecurityIcon />,
      savings_goals: <LightbulbIcon />,
      saving_strategies: <TipsIcon />,
      budget_creation: <AccountBalanceWalletIcon />,
      budget_methods: <TipsIcon />,
      expense_tracking: <AutoGraphIcon />,
      salary_allocation: <PaidIcon />,
      tax_optimization: <LightbulbIcon />,
      income_growth: <TrendingUpIcon />,
      asset_allocation: <PieChartIcon />,
      diversification: <TipsIcon />,
      rebalancing: <AutoGraphIcon />,
      compound_interest: <AutoGraphIcon />,
      risk_return: <WarningIcon />,
      inflation: <TrendingUpIcon />,
      financial_independence: <LightbulbIcon />
    };
    return iconMap[key] || <LightbulbIcon />;
  };

  const toggleSubsection = (key) => {
    setExpandedSubsections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderContent = (content, sectionKey) => {
    return Object.entries(content).map(([key, value]) => {
      if (key === 'intro') {
        return (
          <IntroCard key={key} theme={theme}>
            <p>{value}</p>
          </IntroCard>
        );
      }

      const subsectionKey = `${sectionKey}_${key}`;
      const isExpanded = expandedSubsections[subsectionKey];

      return (
        <SubsectionCard key={key} theme={theme}>
          <SubsectionHeader 
            theme={theme} 
            isExpanded={isExpanded}
            onClick={() => toggleSubsection(subsectionKey)}
          >
            <SubsectionTitleWrapper>
              <SubsectionIcon theme={theme}>
                {getSubsectionIcon(key)}
              </SubsectionIcon>
              <SubsectionTitle theme={theme}>{value.title}</SubsectionTitle>
            </SubsectionTitleWrapper>
            <ExpandIcon isExpanded={isExpanded} theme={theme}>
              <ExpandMoreIcon />
            </ExpandIcon>
          </SubsectionHeader>

          <SubsectionContent isExpanded={isExpanded}>
            {value.description && (
              <Description theme={theme}>{value.description}</Description>
            )}

            {value.pros && value.cons && (
              <ProsCons isMobile={isMobileScreen}>
                <ProsConsBox type="pros" theme={theme}>
                  <ProsConsTitle type="pros" theme={theme}>
                    ✅ {knowledge.advantages}
                  </ProsConsTitle>
                  <ProsConsList type="pros" theme={theme}>
                    {value.pros}
                  </ProsConsList>
                </ProsConsBox>
                <ProsConsBox type="cons" theme={theme}>
                  <ProsConsTitle type="cons" theme={theme}>
                    ❌ {knowledge.disadvantages}
                  </ProsConsTitle>
                  <ProsConsList type="cons" theme={theme}>
                    {value.cons}
                  </ProsConsList>
                </ProsConsBox>
              </ProsCons>
            )}

            {value.tips && (
              <List>
                {value.tips.map((tip, index) => (
                  <ListItem key={index} theme={theme}>
                    <ListIcon theme={theme}>
                      <CheckCircleIcon style={{ fontSize: '18px' }} />
                    </ListIcon>
                    <span>{tip}</span>
                  </ListItem>
                ))}
              </List>
            )}

            {value.strategies && (
              <List>
                {value.strategies.map((strategy, index) => (
                  <ListItem key={index} theme={theme}>
                    <ListIcon theme={theme}>
                      <CheckCircleIcon style={{ fontSize: '18px' }} />
                    </ListIcon>
                    <span>{strategy}</span>
                  </ListItem>
                ))}
              </List>
            )}

            {value.steps && (
              <List>
                {value.steps.map((step, index) => (
                  <ListItem key={index} theme={theme}>
                    <StepNumber theme={theme}>{index + 1}</StepNumber>
                    <span>{step.replace(/^\d+\.\s*/, '')}</span>
                  </ListItem>
                ))}
              </List>
            )}

            {value.methods && (
              <div>
                {Object.entries(value.methods).map(([methodKey, methodValue]) => (
                  <InfoBlock key={methodKey} theme={theme}>
                    <InfoLabel theme={theme}>
                      {methodValue.split(':')[0]}:
                    </InfoLabel>
                    <span> {methodValue.split(':').slice(1).join(':')}</span>
                  </InfoBlock>
                ))}
              </div>
            )}

            {value.breakdown && (
              <div>
                {Object.entries(value.breakdown).map(([breakdownKey, breakdownValue]) => (
                  <InfoBlock key={breakdownKey} theme={theme}>
                    <InfoLabel theme={theme}>
                      {breakdownValue.split(':')[0]}:
                    </InfoLabel>
                    <span> {breakdownValue.split(':').slice(1).join(':')}</span>
                  </InfoBlock>
                ))}
              </div>
            )}

            {value.principles && (
              <List>
                {value.principles.map((principle, index) => (
                  <ListItem key={index} theme={theme}>
                    <ListIcon theme={theme}>
                      <CheckCircleIcon style={{ fontSize: '18px' }} />
                    </ListIcon>
                    <span>{principle}</span>
                  </ListItem>
                ))}
              </List>
            )}

            {value.risk_levels && (
              <List>
                {value.risk_levels.map((level, index) => (
                  <ListItem key={index} theme={theme}>
                    <RiskBadge level={index}>
                      {index === 0 ? knowledge.riskLevels.low : index === 1 ? knowledge.riskLevels.medium : knowledge.riskLevels.high}
                    </RiskBadge>
                    <span>{level}</span>
                  </ListItem>
                ))}
              </List>
            )}

            {(value.short_term || value.medium_term || value.long_term) && (
              <div>
                {value.short_term && (
                  <InfoBlock theme={theme}>
                    <InfoLabel theme={theme}>📅 {value.short_term.split(':')[0]}:</InfoLabel>
                    <span> {value.short_term.split(':').slice(1).join(':')}</span>
                  </InfoBlock>
                )}
                {value.medium_term && (
                  <InfoBlock theme={theme}>
                    <InfoLabel theme={theme}>📅 {value.medium_term.split(':')[0]}:</InfoLabel>
                    <span> {value.medium_term.split(':').slice(1).join(':')}</span>
                  </InfoBlock>
                )}
                {value.long_term && (
                  <InfoBlock theme={theme}>
                    <InfoLabel theme={theme}>📅 {value.long_term.split(':')[0]}:</InfoLabel>
                    <span> {value.long_term.split(':').slice(1).join(':')}</span>
                  </InfoBlock>
                )}
              </div>
            )}

            {(value.conservative || value.moderate || value.aggressive) && (
              <div>
                {value.conservative && (
                  <InfoBlock theme={theme}>
                    <InfoLabel color="#28a745">🛡️ {value.conservative.split(':')[0]}:</InfoLabel>
                    <span> {value.conservative.split(':').slice(1).join(':')}</span>
                  </InfoBlock>
                )}
                {value.moderate && (
                  <InfoBlock theme={theme}>
                    <InfoLabel color="#ffc107">⚖️ {value.moderate.split(':')[0]}:</InfoLabel>
                    <span> {value.moderate.split(':').slice(1).join(':')}</span>
                  </InfoBlock>
                )}
                {value.aggressive && (
                  <InfoBlock theme={theme}>
                    <InfoLabel color="#dc3545">🚀 {value.aggressive.split(':')[0]}:</InfoLabel>
                    <span> {value.aggressive.split(':').slice(1).join(':')}</span>
                  </InfoBlock>
                )}
              </div>
            )}

            {(value.frequency || value.trigger || value.method) && (
              <div>
                {value.frequency && (
                  <InfoBlock theme={theme}>
                    <InfoLabel theme={theme}>📅 {knowledge.frequency}:</InfoLabel>
                    <span> {value.frequency}</span>
                  </InfoBlock>
                )}
                {value.trigger && (
                  <InfoBlock theme={theme}>
                    <InfoLabel theme={theme}>🎯 {knowledge.trigger}:</InfoLabel>
                    <span> {value.trigger}</span>
                  </InfoBlock>
                )}
                {value.method && (
                  <InfoBlock theme={theme}>
                    <InfoLabel theme={theme}>🔄 {knowledge.method}:</InfoLabel>
                    <span> {value.method}</span>
                  </InfoBlock>
                )}
              </div>
            )}

            {value.example && (
              <ExampleBox theme={theme}>
                <ExampleTitle theme={theme}>
                  💡 {knowledge.example}
                </ExampleTitle>
                <ExampleContent theme={theme}>{value.example}</ExampleContent>
              </ExampleBox>
            )}

            {(value.rule_25 || value.withdrawal_rate || value.protection) && (
              <div>
                {value.rule_25 && (
                  <InfoBlock theme={theme}>
                    <InfoLabel theme={theme}>📊 {value.rule_25.split(':')[0]}:</InfoLabel>
                    <span> {value.rule_25.split(':').slice(1).join(':')}</span>
                  </InfoBlock>
                )}
                {value.withdrawal_rate && (
                  <InfoBlock theme={theme}>
                    <InfoLabel theme={theme}>💰 {value.withdrawal_rate.split(':')[0]}:</InfoLabel>
                    <span> {value.withdrawal_rate.split(':').slice(1).join(':')}</span>
                  </InfoBlock>
                )}
                {value.protection && (
                  <InfoBlock theme={theme}>
                    <InfoLabel theme={theme}>🛡️ {knowledge.protection}:</InfoLabel>
                    <span> {value.protection}</span>
                  </InfoBlock>
                )}
              </div>
            )}
          </SubsectionContent>
        </SubsectionCard>
      );
    });
  };

  if (activeSection) {
    const section = knowledge.sections[activeSection];
    const sectionKeys = Object.keys(knowledge.sections);
    const currentIndex = sectionKeys.indexOf(activeSection);
    
    return (
      <KnowledgeContainer theme={theme} isMobile={isMobileScreen}>
        <BackButton theme={theme} onClick={() => setActiveSection(null)}>
          <ArrowBackIcon />
          {language === 'it' ? 'Torna alle sezioni' : 'Back to sections'}
        </BackButton>

        <ProgressIndicator theme={theme}>
          {language === 'it' ? 'Sezione' : 'Section'} {currentIndex + 1} / {sectionKeys.length}
        </ProgressIndicator>

        <ContentArea theme={theme} isMobile={isMobileScreen}>
          <ContentHeader theme={theme}>
            <ContentIconWrapper theme={theme}>
              {sectionIcons[activeSection]}
            </ContentIconWrapper>
            <ContentTitleWrapper>
              <ContentTitle theme={theme} isMobile={isMobileScreen}>
                {section.title}
              </ContentTitle>
              <ContentSubtitle theme={theme}>
                {section.subtitle}
              </ContentSubtitle>
            </ContentTitleWrapper>
          </ContentHeader>

          {renderContent(section.content, activeSection)}
        </ContentArea>
      </KnowledgeContainer>
    );
  }

  return (
    <KnowledgeContainer theme={theme} isMobile={isMobileScreen}>
      <Header>
        <HeaderIcon theme={theme}>
          <SchoolIcon />
        </HeaderIcon>
        <StandardPageTitle theme={theme}>
          {knowledge.title}
        </StandardPageTitle>
        <Subtitle theme={theme} isMobile={isMobileScreen}>
          {knowledge.subtitle}
        </Subtitle>

        <Disclaimer theme={theme}>
          <InfoIcon style={{ fontSize: '20px' }} />
          <span>{knowledge.disclaimer}</span>
        </Disclaimer>
      </Header>

      <SectionsGrid isMobile={isMobileScreen}>
        {Object.entries(knowledge.sections).map(([key, section], index) => (
          <SectionCard
            key={key}
            theme={theme}
            isActive={activeSection === key}
            onClick={() => setActiveSection(key)}
            delay={`${index * 0.1}s`}
          >
            <SectionHeader>
              <SectionIcon theme={theme}>
                {sectionIcons[key]}
              </SectionIcon>
              <SectionInfo>
                <SectionTitleText theme={theme}>{section.title}</SectionTitleText>
                <SectionSubtitle>{section.subtitle}</SectionSubtitle>
              </SectionInfo>
              <SectionArrow theme={theme}>
                <ExpandMoreIcon style={{ transform: 'rotate(-90deg)' }} />
              </SectionArrow>
            </SectionHeader>
          </SectionCard>
        ))}
      </SectionsGrid>
    </KnowledgeContainer>
  );
};

export default Knowledge;