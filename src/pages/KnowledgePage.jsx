import React, {useEffect, useContext, useState} from 'react';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import styled from 'styled-components';
import Sidebar from '../sections/Sidebar';
import Knowledge from '../sections/Knowledge';

function KnowledgePage() {
  useContext(ThemeContext);
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useContext(UserContext);
  useContext(PrivacyContext);
  useContext(MediaQueryContext);
  const [isMobileScreenLocal, setIsMobileScreenLocal] = useState(window.innerWidth <= 768);

  useEffect(() => {
    handleSetIsUpdated(false);
    
    const handleResize = () => {
      setIsMobileScreenLocal(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Div>
      {!isMobileScreenLocal && <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />}
      <div style={{ 
        marginLeft: isMobileScreenLocal ? '0' : '5.5rem', 
        paddingTop: isMobileScreenLocal ? '80px' : '0',
        width: '100%',
        minHeight: '100vh'
      }}>
        <Knowledge />
      </div>
      {isMobileScreenLocal && <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />}
    </Div>
  );
}

export default KnowledgePage;
const Div = styled.div `
  display: flex;
  height: 100vh;
`;