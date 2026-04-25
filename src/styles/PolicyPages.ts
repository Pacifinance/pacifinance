import styled from 'styled-components';

export const PolicyContainer = styled.div`
  flex: 1;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background: ${props => props.theme.mode === 'dark' 
    ? `linear-gradient(135deg, ${props.theme.backgroundColor} 0%, ${props.theme.primaryColor} 100%)`
    : `linear-gradient(135deg, ${props.theme.backgroundColor} 0%, #f8f9fa 100%)`
  };
  color: ${props => props.theme.textColor};
  min-height: calc(100vh - 120px);
  line-height: 1.7;
  border-radius: 1rem;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 10px 30px rgba(0, 0, 0, 0.3)'
    : '0 10px 30px rgba(0, 0, 0, 0.1)'
  };
  margin-top: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 1rem;
    border-radius: 0.5rem;
  }
`;

export const PolicyHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: ${props => props.theme.mode === 'dark' 
    ? `linear-gradient(135deg, ${props.theme.primaryColor} 0%, rgba(7, 145, 100, 0.1) 100%)`
    : `linear-gradient(135deg, rgba(7, 145, 100, 0.05) 0%, rgba(7, 145, 100, 0.1) 100%)`
  };
  border-radius: 1rem;
  border: 2px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(7, 145, 100, 0.3)'
    : 'rgba(7, 145, 100, 0.2)'
  };
  
  h1 {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 800;
    color: #079164;
    margin-bottom: 1rem;
    text-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 2px 4px rgba(0, 0, 0, 0.3)'
      : '0 2px 4px rgba(0, 0, 0, 0.1)'
    };
  }
  
  .last-updated {
    font-size: 1rem;
    color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.7)'
      : 'rgba(0, 0, 0, 0.6)'
    };
    font-weight: 500;
  }
`;

export const PolicyTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme.secondaryColor};
  margin-bottom: 1rem;
`;