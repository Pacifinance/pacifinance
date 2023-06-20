import React, {useState, useContext} from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../contexts/ThemeContext';

const ComingSoon = () => {
  const { theme } = useContext(ThemeContext);
  const { mode } = theme;

  const StyledComingSoon = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
  //   align-items: center;
    min-height: 100vh;

    .coming-soon-title {
      font-size: 4rem;
      font-weight: bold;
      text-align: left;
      margin-left: 35%;
    }

    .coming-soon-subtitle {
      font-size: 1.5rem;
      font-weight: normal;
      text-align: left;
      margin-left: 37%;
    }
  `;
  return (
    <StyledComingSoon>
      <h1 className="coming-soon-title">Coming Soon</h1>
      <h2 className="coming-soon-subtitle">We are working on this feature</h2>
    </StyledComingSoon>
  );
};

export default ComingSoon;