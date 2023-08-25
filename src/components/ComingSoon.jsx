import React from 'react';
import styled from 'styled-components';
import { StyledComingSoon } from '../contexts/MyStyled';


const ComingSoon = () => {

  return (
    <StyledComingSoon>
      <h1 className="coming-soon-title">Coming Soon</h1>
      <h2 className="coming-soon-subtitle">We are working on this feature</h2>
    </StyledComingSoon>
  );
};

export default ComingSoon;