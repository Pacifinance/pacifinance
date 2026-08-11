import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import styled from 'styled-components';
import Sidebar from '../sections/Sidebar';
import Knowledge from '../sections/Knowledge';
import { appBackgroundValue } from '../styles/appBackground';

function KnowledgePage() {
  useContext(ThemeContext);
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useContext(UserContext);
  useContext(PrivacyContext);
  const { isMobileScreen } = useContext(MediaQueryContext);

  return (
    <PageLayout>
      <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />
      <ContentWrapper $isMobile={isMobileScreen}>
        <Knowledge />
      </ContentWrapper>
    </PageLayout>
  );
}

export default KnowledgePage;

const PageLayout = styled.div`
  display: flex;
  min-height: 100vh;
`;

const ContentWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${p => appBackgroundValue(p.theme)};
  margin-left: ${p => p.$isMobile ? '0' : '5.5rem'};
  padding-top: ${p => p.$isMobile ? '72px' : '0'};

  @media (max-width: 839px) {
    margin-left: 0;
    padding-top: 72px;
  }
`;