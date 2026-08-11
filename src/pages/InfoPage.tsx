import React, {useEffect, useContext, useState} from 'react';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import Sidebar from '../sections/Sidebar';
import Info from '../sections/Info';
import { appBackgroundValue } from '../styles/appBackground';
function InfoPage() {
  const { theme } = useContext(ThemeContext);
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useContext(UserContext);
  useContext(PrivacyContext);
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', position: 'relative' }}>
      <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated}  />
      <div style={{
        marginLeft: isMobileScreen ? '0' : '5.5rem',
        paddingTop: isMobileScreen ? '70px' : '0',
        width: '100%',
        minHeight: '100vh',
        background: appBackgroundValue(theme),
      }}>
        <Info theme={theme}/>
      </div>
      {/* <ComingSoon /> */}
    </div>
  );
}

export default InfoPage;
