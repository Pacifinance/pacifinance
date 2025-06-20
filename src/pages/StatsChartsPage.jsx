import React, {useEffect, useContext} from 'react';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { LanguageContext } from '../contexts/LanguageContext';
import styled from 'styled-components';
import Sidebar from '../sections/Sidebar';
import StatsCharts from '../sections/StatsCharts';
import { StandardPageTitle } from '../styles/MyStyled';
import languages from '../data/languages.json';

function StatsChartsPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useContext(UserContext);
  const { isHidden, toggleHidden } = useContext(PrivacyContext);
  const { language } = useContext(LanguageContext);
  const { mode } = theme;
  // Chiamata per caricare i dati dell'utente
  const loadUserData = () => {
    handleSetIsUpdated(false); // Forza il re-render di UserProvider
  };

  useEffect(() => {
    loadUserData(); // Chiamata iniziale per caricare i dati dell'utente al caricamento della pagina
  }, []);

  // Matomo Tag Manager
  // React.useEffect(() => {
  //   var _mtm = window._mtm = window._mtm || [];
  //   _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
  //   var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  //   g.async=true; g.src='https://cdn.matomo.cloud/pacifinance.matomo.cloud/container_geUS8Fsk.js'; s.parentNode.insertBefore(g,s);
  // }, [])

  return (
    <Div>
      <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />
      <ContentWrapper theme={theme}>
        <StandardPageTitle theme={theme} style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          marginTop: '2rem'
        }}>
          {languages[language].graphs.title}
        </StandardPageTitle>
        <StatsCharts />
      </ContentWrapper>
    </Div>
  );
}

export default StatsChartsPage;

const Div = styled.div `
  position: relative;
`;

const ContentWrapper = styled.div `
  background-color: ${(props) => props.theme.backgroundColor};
  min-height: 100vh;
  margin-left: 0;
  margin-top: 80px;
  padding: 0;

  @media (min-width: 768px) {
    margin-left: 16.666667%;
    margin-top: 0;
  }
`;