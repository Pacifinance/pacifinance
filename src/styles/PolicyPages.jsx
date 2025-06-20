import styled from 'styled-components';

export const PolicyContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: ${props => props.theme.backgroundColor};
  color: ${props => props.theme.textColor};
  min-height: 100vh;
  line-height: 1.6;
`;

export const PolicyHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid ${props => props.theme.secondaryColor};
`;

export const PolicyTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme.secondaryColor};
  margin-bottom: 1rem;
`;