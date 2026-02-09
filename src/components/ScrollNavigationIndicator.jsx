import React, { useContext } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { LanguageContext } from '../contexts/LanguageContext';

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

const slideInFromBottom = keyframes`
  from {
    transform: translateY(20px);
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

const spinner = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Componente principale per gli indicatori di navigazione (pallini)
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
  
  ${props => props.$isActive && css`
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

// Nuovo componente per il caricamento in fondo alla pagina
const BottomLoadingIndicator = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(180deg, transparent 0%, rgba(13, 15, 19, 0.9) 30%, rgba(13, 15, 19, 0.95) 100%)'
    : 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.9) 30%, rgba(255, 255, 255, 0.95) 100%)'
  };
  backdrop-filter: blur(10px);
  border-top: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'
  };
  z-index: 998;
  animation: ${slideInFromBottom} 0.3s ease-out;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 839px) {
    bottom: 68px;
    min-height: 100px;
    border-radius: 16px 16px 0 0;
  }
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    gap: 0.8rem;
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${props => props.theme.mode === 'dark' ? '#ffffff20' : '#00000020'};
  border-top: 3px solid ${props => props.theme.buttonBackgroundColor};
  border-radius: 50%;
  animation: ${spinner} 1s linear infinite;
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    border-width: 2px;
  }
`;

const LoadingText = styled.div`
  color: ${props => props.theme.textColor};
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  font-family: 'Inter', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const LoadingProgressBar = styled.div`
  width: 200px;
  height: 6px;
  background: ${props => props.theme.mode === 'dark' ? '#ffffff20' : '#00000020'};
  border-radius: 3px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 150px;
    height: 4px;
  }
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, 
    ${props => props.theme.buttonBackgroundColor}, 
    ${props => props.theme.buttonBackgroundColor}80,
    ${props => props.theme.buttonBackgroundColor}
  );
  transition: width 0.1s ease-out;
  border-radius: 3px;
  box-shadow: 0 0 10px ${props => props.theme.buttonBackgroundColor}40;
`;

const DirectionIcon = styled.div`
  font-size: 1.5rem;
  color: ${props => props.theme.buttonBackgroundColor};
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const SubText = styled.div`
  color: ${props => props.theme.textColor};
  font-size: 0.8rem;
  opacity: 0.7;
  text-align: center;
  margin-top: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

// Overlay per la navigazione (solo durante il cambio pagina effettivo)
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
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${slideIn} 0.3s ease-out;
`;

const CenterLoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid ${props => props.theme.mode === 'dark' ? '#ffffff20' : '#00000020'};
  border-top: 4px solid ${props => props.theme.buttonBackgroundColor};
  border-radius: 50%;
  animation: ${spinner} 1s linear infinite;
`;

const CenterLoadingText = styled.div`
  margin-top: 1rem;
  color: ${props => props.theme.textColor};
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  font-family: 'Inter', sans-serif;
`;

const NavigationHint = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'
  };
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(0, 0, 0, 0.2)'
  };
  color: ${props => props.theme.textColor};
  padding: 0.8rem 1.5rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 999;
  animation: ${slideInFromBottom} 0.5s ease-out, ${pulse} 3s ease-in-out infinite 2s;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.8rem;
    bottom: 1.5rem;
  }
`;

const NavigationKeys = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.5rem;
`;

const KeyIcon = styled.span`
  background: ${props => props.theme.buttonBackgroundColor};
  color: white;
  padding: 0.2rem 0.4rem;
  border-radius: 0.3rem;
  font-size: 0.7rem;
  font-weight: 600;
`;
const ScrollNavigationIndicator = ({ 
  theme, 
  isNavigating,
  showTriggerZone,
  triggerDirection,
  triggerProgress,
  currentPageIndex, 
  totalPages, 
  nextPage, 
  prevPage,
  onPageClick,
  pageHasScrollableContent = true,
  cancelTrigger,
  dismissTrigger,
  navigateManually,
  isAutoScrolling = false
}) => {
  const { language, translations } = useContext(LanguageContext);
  
  // Guardia per verificare che il theme sia disponibile
  if (!theme) {
    return null;
  }

  const pageNames = language === 'en' ? [
    'Dashboard',
    'Charts',
    'Insert', 
    'Comparison'
  ] : [
    'Dashboard',
    'Grafici',
    'Inserimenti', 
    'Confronto'
  ];

  // Mostra overlay di loading solo durante il caricamento effettivo della pagina
  if (isNavigating) {
    return (
      <NavigationOverlay theme={theme}>
        <div>
          <CenterLoadingSpinner theme={theme} />
          <CenterLoadingText theme={theme}>
            Caricamento...
          </CenterLoadingText>
        </div>
      </NavigationOverlay>
    );
  }

    // Mostra pulsante quando l'utente è nella zona appropriata
  if (showTriggerZone && triggerDirection && pageHasScrollableContent) {
    // Traduzioni per i testi
    const translations = {
      it: {
        goToNext: 'Vai alla prossima pagina',
        goToPrev: 'Torna alla pagina precedente',
        hide: 'Nascondi'
      },
      en: {
        goToNext: 'Go to next page',
        goToPrev: 'Go to previous page', 
        hide: 'Hide'
      }
    };
    
    const t = translations[language] || translations.it;
    
    const directionText = triggerDirection === 'down' ? t.goToNext : t.goToPrev;
    const directionIcon = triggerDirection === 'down' ? '↓' : '↑';
    const targetPage = triggerDirection === 'down' 
      ? pageNames[currentPageIndex + 1] 
      : pageNames[currentPageIndex - 1];
    
    return (
      <>
        {/* Mantieni i pallini di navigazione sempre visibili */}
        {currentPageIndex !== -1 && (
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
        )}
        
        {/* Pulsante per navigare */}
        <BottomLoadingIndicator theme={theme}>
          <LoadingContent>
            <DirectionIcon theme={theme}>
              {directionIcon}
            </DirectionIcon>
            <LoadingText theme={theme}>
              {targetPage}
            </LoadingText>
            <SubText theme={theme} style={{ marginBottom: '1rem' }}>
              {directionText}
            </SubText>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={() => navigateManually && navigateManually(triggerDirection)}
                style={{
                  background: theme.buttonBackgroundColor,
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                }}
              >
                {directionIcon} {targetPage}
              </button>
              
              {(cancelTrigger || dismissTrigger) && (
                <button
                  onClick={dismissTrigger || cancelTrigger}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}`,
                    borderRadius: '8px',
                    color: theme.textColor,
                    padding: '8px 16px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                  }}
                >
                  ✕ {t.hide}
                </button>
              )}
            </div>
          </LoadingContent>
        </BottomLoadingIndicator>
      </>
    );
  }

  // Mostra solo i pallini di navigazione se la pagina è nel ciclo
  if (currentPageIndex === -1) return null;

  return (
    <>
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
      
      {/* Rimosso l'hint di navigazione fastidioso */}
    </>
  );
};

export default ScrollNavigationIndicator;
