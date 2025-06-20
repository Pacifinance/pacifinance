import React, {useEffect, useContext, useState} from 'react';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import styled from 'styled-components';
import Sidebar from '../sections/Sidebar';
import Leaderboard from '../sections/Leaderbord';
import ComingSoon from '../components/ComingSoon';

function LeaderboardPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useContext(UserContext);
  const { isHidden, toggleHidden } = useContext(PrivacyContext);
  const { mode } = theme;
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth <= 768);

  // Chiamata per caricare i dati dell'utente
  const loadUserData = () => {
    handleSetIsUpdated(false); // Forza il re-render di UserProvider
  };

  useEffect(() => {
    loadUserData(); // Chiamata iniziale per caricare i dati dell'utente al caricamento della pagina
    
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // // Matomo Tag Manager
  // React.useEffect(() => {
  //   var _mtm = window._mtm = window._mtm || [];
  //   _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
  //   var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  //   g.async=true; g.src='https://cdn.matomo.cloud/pacifinance.matomo.cloud/container_geUS8Fsk.js'; s.parentNode.insertBefore(g,s);
  // }, [])

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />
      <div style={{ 
        marginLeft: isMobileScreen ? '0' : '5.5rem', 
        paddingTop: isMobileScreen ? '80px' : '0',
        width: '100%' 
      }}>
        <Leaderboard theme={theme} userData={userData} handleSetIsUpdated={handleSetIsUpdated} isHidden={isHidden}/>
      </div>
      {/* <ComingSoon /> */}
    </div>
  );
}

export default LeaderboardPage;
const Div = styled.div `
position: relative;
`;