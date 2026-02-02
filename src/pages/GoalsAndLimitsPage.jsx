import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import GoalsAndLimits from '../components/GoalsAndLimits';
import SEOHead from '../components/SEOHead';
import Sidebar from '../sections/Sidebar';
import { useAuth } from '../hooks/useAuth';
import styled from 'styled-components';

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
        <GoalsAndLimits theme={theme} userData={userData} />
      </ContentWrapper>
    </ProfilePageContainer>
  );
}

export default GoalsAndLimitsPage;