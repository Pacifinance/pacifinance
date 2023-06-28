import React, {useState, useContext} from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../contexts/ThemeContext';

const ComingSoon = () => {
  const { theme } = useContext(ThemeContext);
  const { mode } = theme;
  const Section = styled.section `
        font-family: Roboto, sans-serif; 
        margin-left: 6vw;
        padding: 2rem;
        height: 100vh;
        background-color: ${theme.backgroundColor};
        .grid{ 
            margin-top: 2rem;
            z-index: 2;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        
        }`;
  const StyledComingSoon = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center; /* centra gli elementi orizzontalmente */
    min-height: 100vh;

    .coming-soon-title {
      font-size: 4rem;
      font-weight: bold;
      text-align: center; /* centra il testo orizzontalmente */
    }

    .coming-soon-subtitle {
      font-size: 1.5rem;
      font-weight: normal;
      text-align: center; /* centra il testo orizzontalmente */
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