import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import ModernDashboard from '../sections/ModernDashboard';
import SidebarMobile from '../components/SidebarMobile';
import ScrollNavigationIndicator from '../components/ScrollNavigationIndicator';
import ConsentBanner from '../components/ConsentBanner';
import { Section } from '../styles/MyStyled';
import { useScrollNavigation } from '../hooks/useScrollNavigation';
import { BsArrowLeft, BsHouseDoor } from 'react-icons/bs';
import styled from 'styled-components';

function ModernDashboardPage() {
    const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useContext(UserContext);
    const { isHidden } = useContext(PrivacyContext);
    const { theme } = useContext(ThemeContext);
    const { isMobileScreen } = useContext(MediaQueryContext);
    
    const CustomTick = (props) => {
        const { x, y, payload } = props;
        return (
            <g transform={`translate(${x},${y})`}>
                <text 
                    x={0} 
                    y={0} 
                    dy={16} 
                    textAnchor="middle" 
                    fill={theme.textColor}
                    fontSize="12"
                >
                    {payload.value}
                </text>
            </g>
        );
    };

    const { 
        isLoading: navigationLoading, 
        loadingDirection, 
        loadingProgress,
        pageHasScrollableContent
    } = useScrollNavigation([
        '/dashboard', // Dashboard classica
        '/modern-dashboard', // Dashboard moderna (questa pagina)
        '/insert-values',
        '/stats-charts',
        '/comparison'
    ]);

    if (!userData) {
        return (
            <Section theme={theme}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    color: theme.textColor,
                    fontSize: '1.2rem'
                }}>
                    Effettua l'accesso per visualizzare la dashboard moderna
                </div>
            </Section>
        );
    }

    return (
        <>
            {isMobileScreen && <SidebarMobile theme={theme} />}
            
            {/* Pulsante per tornare alla Dashboard Classica */}
            <BackToDashboardButton theme={theme}>
                <Link to="/dashboard">
                    <BsArrowLeft style={{ marginRight: '8px' }} />
                    Dashboard Classica
                    <BsHouseDoor style={{ marginLeft: '8px' }} />
                </Link>
            </BackToDashboardButton>
            
            <Section theme={theme}>
                <ModernDashboard 
                    theme={theme} 
                    userData={userData} 
                    isHidden={isHidden} 
                    CustomTick={CustomTick}
                />
            </Section>

            <ScrollNavigationIndicator 
                theme={theme}
                isLoading={navigationLoading}
                loadingDirection={loadingDirection}
                loadingProgress={loadingProgress}
                pageHasScrollableContent={pageHasScrollableContent}
            />
            
            <ConsentBanner theme={theme} />
        </>
    );
}

const BackToDashboardButton = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  
  a {
    display: flex;
    align-items: center;
    background: ${props => props.theme.mode === 'dark' 
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
      : 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)'
    };
    color: ${props => props.theme.mode === 'dark' ? 'white' : 'white'};
    text-decoration: none;
    padding: 12px 20px;
    border-radius: 25px;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    border: 1px solid ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(255, 255, 255, 0.3)'
    };
    backdrop-filter: blur(10px);

    &:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      background: ${props => props.theme.mode === 'dark' 
        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)'
        : 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 100%)'
      };
    }

    &:active {
      transform: translateY(0px) scale(1.02);
    }
  }

  @media (max-width: 768px) {
    top: 10px;
    left: 10px;
    
    a {
      padding: 8px 12px;
      font-size: 12px;
      border-radius: 20px;
    }
  }
`;

export default ModernDashboardPage;