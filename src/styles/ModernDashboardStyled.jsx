import styled, { keyframes, css } from 'styled-components';

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

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
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
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const gradientShift = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`;

// Layout principale per la dashboard
export const MainDashboardLayout = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.backgroundColor};
  position: relative;
  overflow-x: hidden;
`;

export const DashboardContent = styled.div`
  padding: 2rem 0rem; /* Rimuoviamo padding laterale per attaccare alla sidebar */
  max-width: none; /* Rimuoviamo max-width per utilizzare tutto lo spazio */
  margin: 0;
  animation: ${fadeInUp} 0.8s ease-out;
  min-height: 150vh; /* Allunga la pagina per il controllo dello scroll */
  padding-bottom: 80vh; /* Spazio extra in fondo per evitare cambio pagina immediato */
  
  @media (max-width: 768px) {
    padding: 1rem;
    min-height: 130vh;
    padding-bottom: 60vh;
  }
`;

// Container principale
export const ModernDashboardContainer = styled.div`
  position: relative;
  min-height: 100vh;
  background: ${props => props.theme.backgroundColor};
  padding: 2rem;
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  overflow-x: auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

// Sfondo gradiente animato
export const GradientBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme.mode === 'dark' 
    ? 'radial-gradient(circle at 20% 20%, rgba(7, 145, 100, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 102, 0, 0.05) 0%, transparent 50%)'
    : 'radial-gradient(circle at 20% 20%, rgba(7, 145, 100, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 102, 0, 0.03) 0%, transparent 50%)'
  };
  pointer-events: none;
  z-index: -1;
`;

// Header della dashboard
export const ModernDashboardHeader = styled.header`
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.8s ease-out;
`;

export const ModernDashboardTitle = styled.h1`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.textColor};
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 2rem;
  text-align: center;
  
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, #079164 0%, #74b9ff 50%, #FFD700 100%)'
    : 'linear-gradient(135deg, #079164 0%, #2980b9 50%, #FF6600 100%)'
  };
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${gradientShift} 3s ease-in-out infinite;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

// Overview del bilancio
export const ModernBalanceOverview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)'
  };
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(7, 145, 100, 0.2)'
  };
  border-radius: 2rem;
  padding: 3rem 2rem;
  margin-bottom: 3rem;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(7, 145, 100, 0.1)'
    : '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 30px rgba(7, 145, 100, 0.1)'
  };
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #079164, #74b9ff, #FF6600, #079164);
    background-size: 400% 100%;
    animation: ${shimmer} 3s ease-in-out infinite;
  }

  .balance-main {
    text-align: center;
    margin-bottom: 2rem;

    h2 {
      color: ${props => props.theme.textColor};
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      opacity: 0.8;
    }

    .balance-value {
      font-size: clamp(3rem, 6vw, 4.5rem);
      font-weight: 800;
      color: #079164;
      margin-bottom: 0.5rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .balance-subtitle {
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${props => props.theme.textColor};
      font-size: 1.1rem;
      opacity: 0.7;
    }
  }

  .balance-metrics {
    display: flex;
    gap: 2rem;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 1rem;
    }
  }

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    margin-bottom: 2rem;
  }
`;

export const ModernMetricCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.8)'
  };
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(7, 145, 100, 0.2)'
  };
  border-radius: 1rem;
  padding: 1.5rem;
  min-width: 200px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .metric-icon {
    font-size: 2.5rem;
    color: #079164;
  }

  .metric-content {
    .metric-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: ${props => props.theme.textColor};
      line-height: 1;
    }

    .metric-label {
      font-size: 0.9rem;
      color: ${props => props.theme.textColor};
      opacity: 0.7;
      margin-bottom: 0.25rem;
    }

    .metric-percentage {
      font-size: 0.8rem;
      color: #079164;
      font-weight: 600;
    }
  }
`;

// Grid per i bilanci tradizionali
export const ModernAssetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

// Grid per gli investimenti
export const ModernInvestmentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

// Card per i bilanci tradizionali
export const ModernAssetCard = styled.div`
  background: ${props => props.gradient || 'linear-gradient(135deg, #079164 0%, #27ae60 100%)'};
  border-radius: 1.5rem;
  padding: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.2);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0);
    transition: all 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);

    &::before {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    .icon-container {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 1rem;
      padding: 1rem;
      backdrop-filter: blur(10px);

      .asset-icon {
        font-size: 2rem;
        color: white;
      }
    }

    .action-button {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }
    }
  }

  .card-content {
    margin-bottom: 1.5rem;

    .asset-name {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      opacity: 0.9;
    }

    .asset-value {
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .asset-percentage {
      font-size: 0.9rem;
      opacity: 0.8;
    }
  }

  .card-footer {
    .progress-bar {
      height: 4px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        background: white;
        border-radius: 2px;
        transition: width 1s ease-out;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
      }
    }
  }
`;

// Card per gli investimenti
export const ModernInvestmentCard = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)'
  };
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'
  };
  border-radius: 1.5rem;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => props.gradient || 'linear-gradient(135deg, #FF6600 0%, #ff7675 100%)'};
    transition: width 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 20px 40px rgba(0, 0, 0, 0.3)'
      : '0 20px 40px rgba(0, 0, 0, 0.15)'
    };

    &::before {
      width: 100%;
      opacity: 0.1;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    .icon-container {
      background: ${props => props.gradient || 'linear-gradient(135deg, #FF6600 0%, #ff7675 100%)'};
      border-radius: 1rem;
      padding: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      .investment-icon {
        font-size: 1.8rem;
        color: white;
      }
    }

    .investment-type {
      span {
        background: ${props => props.gradient || 'linear-gradient(135deg, #FF6600 0%, #ff7675 100%)'};
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
  }

  .card-content {
    margin-bottom: 1.5rem;

    .investment-name {
      font-size: 1.3rem;
      font-weight: 700;
      color: ${props => props.theme.textColor};
      margin-bottom: 0.8rem;
    }

    .investment-value {
      font-size: 2rem;
      font-weight: 800;
      color: ${props => props.theme.textColor};
      margin-bottom: 1rem;
    }

    .investment-stats {
      display: flex;
      gap: 1.5rem;

      .stat {
        display: flex;
        flex-direction: column;

        .stat-label {
          font-size: 0.8rem;
          color: ${props => props.theme.textColor};
          opacity: 0.6;
          margin-bottom: 0.2rem;
        }

        .stat-value {
          font-size: 1rem;
          font-weight: 600;
          color: #079164;
        }
      }
    }
  }

  .card-footer {
    .update-button {
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${props => props.gradient || 'linear-gradient(135deg, #FF6600 0%, #ff7675 100%)'};
      color: white;
      border: none;
      border-radius: 0.8rem;
      padding: 0.8rem 1.5rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      }
    }
  }
`;

// Sezione grafici
export const ModernChartsSection = styled.section`
  margin-top: 4rem;
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
`;

export const ModernChartContainer = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)'
  };
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(7, 145, 100, 0.2)'
  };
  border-radius: 2rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 15px 35px rgba(0, 0, 0, 0.3)'
      : '0 15px 35px rgba(0, 0, 0, 0.1)'
    };
  }

  h4 {
    color: ${props => props.theme.textColor};
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }

  .chart-legend {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;

    &.detailed {
      max-height: 200px;
      overflow-y: auto;
      padding-right: 10px;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: #079164;
        border-radius: 3px;
      }
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 0.5rem;
      border-radius: 0.5rem;
      transition: all 0.2s ease;

      &:hover {
        background: ${props => props.theme.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'rgba(0, 0, 0, 0.05)'
        };
      }

      .legend-color {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      span {
        color: ${props => props.theme.textColor};
        font-size: 0.9rem;

        &.legend-value {
          margin-left: auto;
          font-weight: 600;
          color: #079164;
        }
      }
    }
  }
`;

// Sezione Income/Expense
export const ModernIncomeExpenseSection = styled.section`
  margin: 4rem 0;
  padding: 2.5rem;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.02)' 
    : 'rgba(255, 255, 255, 0.8)'
  };
  border-radius: 20px;
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'
  };
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
    : '0 8px 32px rgba(0, 0, 0, 0.1)'
  };
  animation: ${fadeInUp} 0.8s ease-out 0.6s both;

  @media (max-width: 768px) {
    margin: 2rem 0;
    padding: 1.5rem;
  }
`;

export const ModernIncomeExpenseCard = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.03)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  border: 1px solid ${props => props.itemColor}20;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.2)' 
    : '0 4px 20px rgba(0, 0, 0, 0.08)'
  };
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 250px;
  flex: 1;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${props => props.itemColor}, ${props => props.itemColor}80);
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 8px 30px rgba(0, 0, 0, 0.3)' 
      : '0 8px 30px rgba(0, 0, 0, 0.15)'
    };
    border-color: ${props => props.itemColor}40;
  }

  .expense-icon {
    font-size: 2.5rem;
    color: ${props => props.itemColor};
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
  }

  .expense-content {
    h4.expense-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: ${props => props.theme.textColor};
      margin-bottom: 0.8rem;
    }

    .expense-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: ${props => props.itemColor};
      margin-bottom: 0.5rem;
    }

    .expense-description {
      font-size: 0.9rem;
      color: ${props => props.theme.textColor}80;
      font-style: italic;
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    min-width: auto;

    .expense-icon {
      font-size: 2rem;
    }

    .expense-content .expense-value {
      font-size: 1.5rem;
    }
  }
`;

// Elementi fluttuanti
export const FloatingElement = styled.div`
  animation: ${float} 3s ease-in-out infinite;
  animation-delay: ${props => props.delay || 0}s;
`;

export const PulseAnimation = styled.div`
  animation: ${pulse} 2s ease-in-out infinite;
  animation-delay: ${props => props.delay || 0}s;
`;