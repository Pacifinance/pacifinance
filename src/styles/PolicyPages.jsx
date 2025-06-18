
import styled from 'styled-components';

export const PolicyContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background-color: ${props => props.theme?.backgroundColor || '#ffffff'};
  color: ${props => props.theme?.textColor || '#000000'};
  
  h1, h2, h3, h4, h5, h6 {
    color: ${props => props.theme?.textColor || '#000000'};
    margin-bottom: 1rem;
  }
  
  p, li, span {
    color: ${props => props.theme?.textColor || '#000000'};
    line-height: 1.6;
  }
  
  a {
    color: ${props => props.theme?.primaryColor || '#079164'};
    text-decoration: underline;
    
    &:hover {
      opacity: 0.8;
    }
  }
  
  ul, ol {
    margin: 1rem 0;
    padding-left: 2rem;
  }
  
  .section {
    margin-bottom: 2rem;
  }
  
  .highlight {
    background-color: ${props => props.theme?.mode === 'dark' ? 'rgba(7, 145, 100, 0.2)' : 'rgba(7, 145, 100, 0.1)'};
    padding: 0.5rem;
    border-radius: 4px;
    margin: 1rem 0;
  }
`;

export const PolicyHeader = styled.header`
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    font-size: 2.5rem;
    color: ${props => props.theme?.primaryColor || '#079164'};
    margin-bottom: 0.5rem;
  }
  
  .last-updated {
    color: ${props => props.theme?.textColor || '#000000'};
    opacity: 0.7;
    font-size: 0.9rem;
  }
`;
