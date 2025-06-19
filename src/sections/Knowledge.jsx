
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
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import styled from 'styled-components';

const KnowledgeContainer = styled.div`
  flex: 1;
  padding: ${props => props.isMobile ? '1rem' : '2rem'};
  background: ${props => props.theme.backgroundColor};
  color: ${props => props.theme.textColor};
  min-height: 100vh;
  overflow-y: auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: ${props => props.isMobile ? '1.8rem' : '2.5rem'};
  font-weight: bold;
  color: ${props => props.theme.buttonBackgroundColor};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: ${props => props.isMobile ? '1rem' : '1.2rem'};
  opacity: 0.8;
  margin-bottom: 1.5rem;
`;

const Disclaimer = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  color: #856404;
  font-size: 0.9rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
`;

const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))'};
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const SectionCard = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white'};
  border: 2px solid ${props => props.isActive ? props.theme.buttonBackgroundColor : 'transparent'};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    border-color: ${props => props.theme.buttonBackgroundColor};
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const SectionIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.theme.buttonBackgroundColor};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const SectionTitleText = styled.h3`
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0;
`;

const SectionSubtitle = styled.p`
  opacity: 0.7;
  font-size: 0.9rem;
  margin: 0;
`;

const ContentArea = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8f9fa'};
  border-radius: 12px;
  padding: 2rem;
  margin-top: 2rem;
`;

const ContentTitle = styled.h2`
  color: ${props => props.theme.buttonBackgroundColor};
  font-size: 1.8rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SubsectionCard = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white'};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid ${props => props.theme.buttonBackgroundColor};
`;

const SubsectionTitle = styled.h4`
  color: ${props => props.theme.buttonBackgroundColor};
  font-size: 1.2rem;
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;

const ProsCons = styled.div`
  display: grid;
  grid-template-columns: ${props => props.isMobile ? '1fr' : '1fr 1fr'};
  gap: 1rem;
  margin-top: 1rem;
`;

const ProsConsBox = styled.div`
  padding: 1rem;
  border-radius: 6px;
  background: ${props => props.type === 'pros' ? '#d4edda' : '#f8d7da'};
  border: 1px solid ${props => props.type === 'pros' ? '#c3e6cb' : '#f5c6cb'};
`;

const ProsConsTitle = styled.h6`
  margin: 0 0 0.5rem 0;
  font-weight: bold;
  color: ${props => props.type === 'pros' ? '#155724' : '#721c24'};
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
`;

const ListItem = styled.li`
  padding: 0.5rem 0;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#eee'};
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  
  &:last-child {
    border-bottom: none;
  }
`;

const BackButton = styled.button`
  background: ${props => props.theme.buttonBackgroundColor};
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;
  
  &:hover {
    opacity: 0.9;
  }
`;

const Knowledge = () => {
  const { theme } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  const [activeSection, setActiveSection] = useState(null);
  const [expandedSubsections, setExpandedSubsections] = useState({});

  const knowledge = languages[language].knowledge;

  const sectionIcons = {
    investments: <TrendingUpIcon fontSize="large" />,
    saving: <SavingsIcon fontSize="large" />,
    budgeting: <AccountBalanceWalletIcon fontSize="large" />,
    salary_management: <PaidIcon fontSize="large" />,
    portfolio_management: <PieChartIcon fontSize="large" />,
    general_knowledge: <SchoolIcon fontSize="large" />
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
          <SubsectionCard key={key} theme={theme}>
            <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>{value}</p>
          </SubsectionCard>
        );
      }

      const isExpanded = expandedSubsections[`${sectionKey}_${key}`];

      return (
        <SubsectionCard key={key} theme={theme}>
          <SubsectionTitle 
            theme={theme} 
            onClick={() => toggleSubsection(`${sectionKey}_${key}`)}
          >
            {value.title}
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </SubsectionTitle>
          
          {isExpanded && (
            <div>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                {value.description}
              </p>
              
              {value.pros && value.cons && (
                <ProsCons isMobile={isMobileScreen}>
                  <ProsConsBox type="pros">
                    <ProsConsTitle type="pros">✅ Vantaggi</ProsConsTitle>
                    <div style={{ whiteSpace: 'pre-line', fontSize: '0.9rem', color: '#155724' }}>
                      {value.pros}
                    </div>
                  </ProsConsBox>
                  <ProsConsBox type="cons">
                    <ProsConsTitle type="cons">❌ Svantaggi</ProsConsTitle>
                    <div style={{ whiteSpace: 'pre-line', fontSize: '0.9rem', color: '#721c24' }}>
                      {value.cons}
                    </div>
                  </ProsConsBox>
                </ProsCons>
              )}
              
              {value.tips && (
                <List>
                  {value.tips.map((tip, index) => (
                    <ListItem key={index} theme={theme}>
                      <CheckCircleIcon style={{ color: theme.buttonBackgroundColor, fontSize: '16px', marginTop: '2px' }} />
                      <span>{tip}</span>
                    </ListItem>
                  ))}
                </List>
              )}
              
              {value.strategies && (
                <List>
                  {value.strategies.map((strategy, index) => (
                    <ListItem key={index} theme={theme}>
                      <CheckCircleIcon style={{ color: theme.buttonBackgroundColor, fontSize: '16px', marginTop: '2px' }} />
                      <span>{strategy}</span>
                    </ListItem>
                  ))}
                </List>
              )}
              
              {value.steps && (
                <List>
                  {value.steps.map((step, index) => (
                    <ListItem key={index} theme={theme}>
                      <span style={{ 
                        background: theme.buttonBackgroundColor, 
                        color: 'white', 
                        borderRadius: '50%', 
                        width: '20px', 
                        height: '20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </ListItem>
                  ))}
                </List>
              )}
              
              {value.methods && (
                <div>
                  {Object.entries(value.methods).map(([methodKey, methodValue]) => (
                    <div key={methodKey} style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: theme.buttonBackgroundColor }}>
                        {methodValue.split(':')[0]}:
                      </strong>
                      <span> {methodValue.split(':').slice(1).join(':')}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {value.breakdown && (
                <div>
                  {Object.entries(value.breakdown).map(([breakdownKey, breakdownValue]) => (
                    <div key={breakdownKey} style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: theme.buttonBackgroundColor }}>
                        {breakdownValue.split(':')[0]}:
                      </strong>
                      <span> {breakdownValue.split(':').slice(1).join(':')}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {value.principles && (
                <List>
                  {value.principles.map((principle, index) => (
                    <ListItem key={index} theme={theme}>
                      <CheckCircleIcon style={{ color: theme.buttonBackgroundColor, fontSize: '16px', marginTop: '2px' }} />
                      <span>{principle}</span>
                    </ListItem>
                  ))}
                </List>
              )}
              
              {value.risk_levels && (
                <List>
                  {value.risk_levels.map((level, index) => (
                    <ListItem key={index} theme={theme}>
                      <span style={{ 
                        background: index === 0 ? '#28a745' : index === 1 ? '#ffc107' : '#dc3545', 
                        color: 'white', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {index === 0 ? 'BASSO' : index === 1 ? 'MEDIO' : 'ALTO'}
                      </span>
                      <span>{level}</span>
                    </ListItem>
                  ))}
                </List>
              )}
              
              {(value.short_term || value.medium_term || value.long_term) && (
                <div>
                  {value.short_term && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: theme.buttonBackgroundColor }}>📅 {value.short_term.split(':')[0]}:</strong>
                      <span> {value.short_term.split(':').slice(1).join(':')}</span>
                    </div>
                  )}
                  {value.medium_term && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: theme.buttonBackgroundColor }}>📅 {value.medium_term.split(':')[0]}:</strong>
                      <span> {value.medium_term.split(':').slice(1).join(':')}</span>
                    </div>
                  )}
                  {value.long_term && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: theme.buttonBackgroundColor }}>📅 {value.long_term.split(':')[0]}:</strong>
                      <span> {value.long_term.split(':').slice(1).join(':')}</span>
                    </div>
                  )}
                </div>
              )}
              
              {(value.conservative || value.moderate || value.aggressive) && (
                <div>
                  {value.conservative && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: '#28a745' }}>🛡️ {value.conservative.split(':')[0]}:</strong>
                      <span> {value.conservative.split(':').slice(1).join(':')}</span>
                    </div>
                  )}
                  {value.moderate && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: '#ffc107' }}>⚖️ {value.moderate.split(':')[0]}:</strong>
                      <span> {value.moderate.split(':').slice(1).join(':')}</span>
                    </div>
                  )}
                  {value.aggressive && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: '#dc3545' }}>🚀 {value.aggressive.split(':')[0]}:</strong>
                      <span> {value.aggressive.split(':').slice(1).join(':')}</span>
                    </div>
                  )}
                </div>
              )}
              
              {(value.frequency || value.trigger || value.method) && (
                <div>
                  {value.frequency && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: theme.buttonBackgroundColor }}>📅 Frequenza:</strong>
                      <span> {value.frequency}</span>
                    </div>
                  )}
                  {value.trigger && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: theme.buttonBackgroundColor }}>🎯 Trigger:</strong>
                      <span> {value.trigger}</span>
                    </div>
                  )}
                  {value.method && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: theme.buttonBackgroundColor }}>🔄 Metodo:</strong>
                      <span> {value.method}</span>
                    </div>
                  )}
                </div>
              )}
              
              {value.example && (
                <div style={{ 
                  background: theme.mode === 'dark' ? 'rgba(7, 145, 100, 0.2)' : '#e8f5e8', 
                  padding: '1rem', 
                  borderRadius: '6px', 
                  marginTop: '1rem' 
                }}>
                  <strong style={{ color: theme.buttonBackgroundColor }}>💡 Esempio:</strong>
                  <div style={{ marginTop: '0.5rem', fontFamily: 'monospace' }}>{value.example}</div>
                </div>
              )}
              
              {(value.rule_25 || value.withdrawal_rate || value.protection) && (
                <div>
                  {value.rule_25 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: theme.buttonBackgroundColor }}>📊 {value.rule_25.split(':')[0]}:</strong>
                      <span> {value.rule_25.split(':').slice(1).join(':')}</span>
                    </div>
                  )}
                  {value.withdrawal_rate && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: theme.buttonBackgroundColor }}>💰 {value.withdrawal_rate.split(':')[0]}:</strong>
                      <span> {value.withdrawal_rate.split(':').slice(1).join(':')}</span>
                    </div>
                  )}
                  {value.protection && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: theme.buttonBackgroundColor }}>🛡️ Protezione:</strong>
                      <span> {value.protection}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </SubsectionCard>
      );
    });
  };

  if (activeSection) {
    const section = knowledge.sections[activeSection];
    return (
      <KnowledgeContainer theme={theme} isMobile={isMobileScreen}>
        <BackButton theme={theme} onClick={() => setActiveSection(null)}>
          ← {language === 'it' ? 'Torna alle sezioni' : 'Back to sections'}
        </BackButton>
        
        <ContentArea theme={theme}>
          <ContentTitle theme={theme}>
            {sectionIcons[activeSection]}
            {section.title}
          </ContentTitle>
          <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '2rem' }}>
            {section.subtitle}
          </p>
          
          {renderContent(section.content, activeSection)}
        </ContentArea>
      </KnowledgeContainer>
    );
  }

  return (
    <KnowledgeContainer theme={theme} isMobile={isMobileScreen}>
      <Header>
        <Title theme={theme} isMobile={isMobileScreen}>
          {knowledge.title}
        </Title>
        <Subtitle isMobile={isMobileScreen}>
          {knowledge.subtitle}
        </Subtitle>
        
        <Disclaimer>
          <InfoIcon style={{ fontSize: '20px', marginTop: '2px' }} />
          <span>{knowledge.disclaimer}</span>
        </Disclaimer>
      </Header>

      <SectionsGrid isMobile={isMobileScreen}>
        {Object.entries(knowledge.sections).map(([key, section]) => (
          <SectionCard
            key={key}
            theme={theme}
            isActive={activeSection === key}
            onClick={() => setActiveSection(key)}
          >
            <SectionHeader>
              <SectionIcon theme={theme}>
                {sectionIcons[key]}
              </SectionIcon>
              <div>
                <SectionTitleText>{section.title}</SectionTitleText>
                <SectionSubtitle>{section.subtitle}</SectionSubtitle>
              </div>
            </SectionHeader>
          </SectionCard>
        ))}
      </SectionsGrid>
    </KnowledgeContainer>
  );
};

export default Knowledge;
