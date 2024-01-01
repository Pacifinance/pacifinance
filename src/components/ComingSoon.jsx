import React from 'react';
import { StyledComingSoon } from '../contexts/MyStyled';
import languages from '../contexts/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';


const ComingSoon = () => {
  const { language } = React.useContext(LanguageContext);
  return (
    <StyledComingSoon>
      <h1 className="coming-soon-title">{languages[language].general.comingSoon}</h1>
      <h2 className="coming-soon-subtitle">{languages[language].general.weAreWorking}</h2>
    </StyledComingSoon>
  );
};

export default ComingSoon;