import styled, { keyframes } from 'styled-components';

// Animazioni
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Container principale
export const ModernInfoContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, #0D0F13 0%, #1A1D23 100%)'
    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
  };
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(135deg, #079164 0%, #27ae60 100%);
    opacity: 0.1;
    z-index: 0;
  }
`;

export const ModernInfoContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

// Header principale
export const ModernInfoHeader = styled.header`
  text-align: center;
  margin-bottom: 4rem;
  animation: ${fadeInUp} 0.8s ease-out;
  
  @media (max-width: 768px) {
    margin-bottom: 2.5rem;
  }
`;

export const ModernInfoTitle = styled.h1`
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  background: linear-gradient(135deg, #079164 0%, #27ae60 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
`;

export const ModernInfoSubtitle = styled.h2`
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 600;
  color: ${props => props.theme.textColor};
  margin-bottom: 1.5rem;
  opacity: 0.9;
`;

export const ModernInfoDescription = styled.p`
  font-size: clamp(1.1rem, 2.5vw, 1.3rem);
  color: ${props => props.theme.textColor};
  opacity: 0.8;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
`;

// Sezioni principali
export const ModernInfoSection = styled.section`
  margin-bottom: 4rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: ${props => props.delay || '0s'};
  animation-fill-mode: both;
  
  @media (max-width: 768px) {
    margin-bottom: 2.5rem;
  }
`;

export const ModernSectionCard = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'
  };
  border-radius: 2rem;
  padding: 3rem;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 20px 40px rgba(0, 0, 0, 0.3)' 
    : '0 20px 40px rgba(0, 0, 0, 0.1)'
  };
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 30px 60px rgba(0, 0, 0, 0.4)' 
      : '0 30px 60px rgba(0, 0, 0, 0.15)'
    };
  }
  
  @media (max-width: 768px) {
    padding: 2rem;
    border-radius: 1.5rem;
  }
`;

export const ModernSectionTitle = styled.h3`
  font-size: clamp(1.8rem, 4vw, 2.2rem);
  font-weight: 700;
  color: ${props => props.theme.textColor};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  &::before {
    content: '';
    width: 4px;
    height: 40px;
    background: linear-gradient(135deg, #079164 0%, #27ae60 100%);
    border-radius: 2px;
  }
`;

export const ModernSectionText = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.1rem);
  color: ${props => props.theme.textColor};
  opacity: 0.9;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// Support Section (Call to Action)
export const ModernSupportSection = styled.div`
  background: linear-gradient(135deg, #079164 0%, #27ae60 100%);
  border-radius: 2rem;
  padding: 3rem;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.6s;
  animation-fill-mode: both;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
    animation: ${shimmer} 3s infinite;
  }
  
  @media (max-width: 768px) {
    padding: 2rem;
    border-radius: 1.5rem;
  }
`;

export const ModernSupportTitle = styled.h3`
  font-size: clamp(1.8rem, 4vw, 2.2rem);
  font-weight: 700;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
`;

export const ModernSupportText = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
  position: relative;
  z-index: 1;
`;

export const ModernCoffeeButton = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #079164, #0ba374);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 1rem;
  padding: 1rem 2rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 15px rgba(7, 145, 100, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #0ba374, #079164);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
    animation: ${pulse} 2s infinite;
    box-shadow: 0 6px 20px rgba(7, 145, 100, 0.4);
  }
  
  /* Nascondi il widget BMC se presente per evitare duplicazioni */
  #supportByBMC {
    display: none;
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem 1.5rem;
  }
`;

// FAQ Section
export const ModernFAQContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const ModernFAQItem = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.03)' 
    : 'rgba(255, 255, 255, 0.7)'
  };
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.08)'
  };
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #079164;
  }
`;

export const ModernFAQQuestion = styled.button`
  width: 100%;
  padding: 1.5rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: clamp(1rem, 2.5vw, 1.1rem);
  font-weight: 600;
  color: ${props => props.theme.textColor};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.03)'
    };
  }
  
  .icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #079164 0%, #27ae60 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: 300;
    transition: transform 0.3s ease;
    
    ${props => props.$isOpen && `
      transform: rotate(45deg);
    `}
  }
  
  @media (max-width: 768px) {
    padding: 1.2rem;
  }
`;

export const ModernFAQAnswer = styled.div`
  max-height: ${props => props.$isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

export const ModernFAQAnswerContent = styled.div`
  padding: ${props => props.$isOpen ? '0 1.5rem 1.5rem 1.5rem' : '0'};
  color: ${props => props.theme.textColor};
  opacity: 0.8;
  line-height: 1.6;
  font-size: clamp(0.95rem, 2vw, 1rem);
  
  @media (max-width: 768px) {
    padding: ${props => props.$isOpen ? '0 1.2rem 1.2rem 1.2rem' : '0'};
  }
`;

// Features Grid
export const ModernFeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: 2rem;
  }
`;

export const ModernFeatureCard = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.03)' 
    : 'rgba(255, 255, 255, 0.8)'
  };
  backdrop-filter: blur(15px);
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.08)'
  };
  border-radius: 1.5rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  animation: ${slideInLeft} 0.6s ease-out;
  animation-delay: ${props => props.delay || '0s'};
  animation-fill-mode: both;
  
  &:hover {
    transform: translateY(-5px);
    border-color: #079164;
    box-shadow: 0 20px 40px rgba(7, 145, 100, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

export const ModernFeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #079164 0%, #27ae60 100%);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  font-size: 1.8rem;
  color: white;
`;

export const ModernFeatureTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${props => props.theme.textColor};
  margin-bottom: 0.8rem;
`;

export const ModernFeatureText = styled.p`
  font-size: 0.95rem;
  color: ${props => props.theme.textColor};
  opacity: 0.8;
  line-height: 1.5;
`;