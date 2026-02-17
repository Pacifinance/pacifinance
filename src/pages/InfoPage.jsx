import React, {useEffect, useContext, useState} from 'react';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import styled from 'styled-components';
import Sidebar from '../sections/Sidebar';
import Info from '../sections/Info';
import { APP_VERSION } from '../data/appVersion';

function InfoPage() {
  const { theme } = useContext(ThemeContext);
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useContext(UserContext);
  useContext(PrivacyContext);
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth <= 768);

  useEffect(() => {
    handleSetIsUpdated(false);
    
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Matomo Tag Manager
  // React.useEffect(() => {
  //   var _mtm = window._mtm = window._mtm || [];
  //   _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
  //   var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  //   g.async=true; g.src='https://cdn.matomo.cloud/pacifinance.matomo.cloud/container_geUS8Fsk.js'; s.parentNode.insertBefore(g,s);
  // }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', position: 'relative' }}>
      <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated}  />
      <div style={{ 
        marginLeft: isMobileScreen ? '0' : '5.5rem', 
        paddingTop: isMobileScreen ? '70px' : '0',
        width: '100%' 
      }}>
        <Info theme={theme}/>
      </div>
      <VersionBadge theme={theme}>v{APP_VERSION}</VersionBadge>
      {/* <ComingSoon /> */}
    </div>
  );
}

export default InfoPage;
const VersionBadge = styled.div `
  position: fixed;
  right: 10px;
  bottom: 8px;
  font-size: 0.7rem;
  opacity: 0.6;
  z-index: 60;
  pointer-events: none;
  color: ${props => props.theme.mode === 'dark' ? '#d1d5db' : '#4b5563'};
`;