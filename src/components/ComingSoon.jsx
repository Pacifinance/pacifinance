import React from 'react';
import { StyledComingSoon } from '../styles/MyStyled';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';

const ComingSoon = () => {
  const { translations } = React.useContext(LanguageContext);
  const { theme } = React.useContext(ThemeContext);
  
  return (
    <StyledComingSoon theme={theme}>
      <h1 className="coming-soon-title">{translations.general.comingSoon}</h1>
      <h2 className="coming-soon-subtitle">{translations.general.weAreWorking}</h2>
    </StyledComingSoon>
  );
};

export default ComingSoon;