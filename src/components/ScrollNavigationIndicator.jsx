import React from 'react';
import styled, { keyframes } from 'styled-components';

// Animazioni
const slideIn = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

const NavigationIndicator = styled.div`
  position: fixed;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: ${slideIn} 0.3s ease-out;
  
  @media (max-width: 768px) {
    right: 1rem;
    gap: 0.3rem;
  }
`;

const PageDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$isActive 
    ? props.theme.buttonBackgroundColor 
    : props.theme.mode === 'dark' ? '#ffffff40' : '#00000030'};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  
  ${props => props.$isActive && `
    box-shadow: 0 0 0 4px ${props.theme.buttonBackgroundColor}30;
    animation: ${pulse} 2s infinite;
  `}
  
  &:hover {
    transform: scale(1.2);
    background: ${props => props.theme.buttonBackgroundColor};
  }
  
  @media (max-width: 768px) {
    width: 10px;
    height: 10px;
  }
`;

const NavigationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.8)' 
    : 'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(10px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${slideIn} 0.3s ease-out;
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid ${props => props.theme.mode === 'dark' ? '#ffffff20' : '#00000020'};
  border-top: 4px solid ${props => props.theme.buttonBackgroundColor};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const NavigationText = styled.div`
  margin-top: 1rem;
  color: ${props => props.theme.textColor};
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  font-family: 'Inter', sans-serif;
`;

const ScrollNavigationIndicator = ({ 
  theme, 
  isNavigating, 
  currentPageIndex, 
  totalPages, 
  nextPage, 
  prevPage,
  onPageClick 
}) => {
  const pageNames = [
    'Dashboard',
    'Grafici',
    'Inserimenti', 
    'Confronto'
  ];

  if (isNavigating) {
    return (
      <NavigationOverlay theme={theme}>
        <div>
          <LoadingSpinner theme={theme} />
          <NavigationText theme={theme}>
            Caricamento...
          </NavigationText>
        </div>
      </NavigationOverlay>
    );
  }

  if (currentPageIndex === -1) return null;

  return (
    <NavigationIndicator>
      {Array.from({ length: totalPages }, (_, index) => (
        <PageDot
          key={index}
          theme={theme}
          $isActive={index === currentPageIndex}
          onClick={() => onPageClick && onPageClick(index)}
          title={pageNames[index]}
        />
      ))}
    </NavigationIndicator>
  );
};

export default ScrollNavigationIndicator;
