import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import GoalsAndLimits from '../components/GoalsAndLimits';
import SEOHead from '../components/SEOHead';
import Sidebar from '../sections/Sidebar';
import { useAuth } from '../hooks/useAuth';
import styled from 'styled-components';
import { FaHardHat } from 'react-icons/fa';

const ProfilePageContainer = styled.div`
  position: relative;
`;

const ContentWrapper = styled.div`
  background-color: ${(props) => props.theme.backgroundColor};
  min-height: 100vh;
  margin-left: 0;
  margin-top: 80px;
  padding: 0;
  width: 100%;

  @media (min-width: 768px) {
    margin-left: 5.5rem;
    margin-top: 0;
    width: calc(100% - 5.5rem);
  }
`;

const DevelopmentOverlay = styled.div`
  position: relative;
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;

  @media (min-width: 768px) {
    min-height: 100vh;
  }
`;

const DevelopmentCard = styled.div`
  background: ${props => props.theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)'
    : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)'};
  border: 2px solid ${props => props.theme.mode === 'dark' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.4)'};
  border-radius: 20px;
  padding: 3rem 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const IconWrapper = styled.div`
  font-size: 3rem;
  color: #f59e0b;
  margin-bottom: 1.5rem;
  animation: bounce 2s ease-in-out infinite;

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
`;

const Title = styled.h2`
  color: ${props => props.theme.textColor};
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
`;

const Description = styled.p`
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'};
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
`;

const Badge = styled.span`
  display: inline-block;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

function GoalsAndLimitsPage() {
  const { theme } = useContext(ThemeContext);
  const { language, translations } = useContext(LanguageContext);
  const auth = useAuth();
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = auth;

  return (
    <ProfilePageContainer>
      <SEOHead 
        title={language === 'it' ? 'Obiettivi e Limiti | PaciFinance' : 'Goals & Limits | PaciFinance'}
        description={language === 'it' ? 'Gestisci i tuoi obiettivi finanziari, limiti di spesa e preferenze personali su PaciFinance.' : 'Manage your financial goals, spending limits and personal preferences on PaciFinance.'}
        noindex={true}
      />
      <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />
      
      <ContentWrapper theme={theme}>
        <DevelopmentOverlay>
          <DevelopmentCard theme={theme}>
            <IconWrapper>
              <FaHardHat />
            </IconWrapper>
            <Badge>{translations?.general?.inDevelopment || 'In development'}</Badge>
            <Title theme={theme}>
              {translations?.sidebar?.goalsLimits || 'Goals & Limits'}
            </Title>
            <Description theme={theme}>
              {translations?.general?.featureComingSoon || 'This feature is under development and will be available soon!'}
            </Description>
          </DevelopmentCard>
        </DevelopmentOverlay>
      </ContentWrapper>
    </ProfilePageContainer>
  );
}

export default GoalsAndLimitsPage;