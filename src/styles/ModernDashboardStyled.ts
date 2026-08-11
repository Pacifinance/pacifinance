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


// Main layout for the dashboard
export const MainDashboardLayout = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(circle at 85% 2%, ${props => props.theme.buttonBackgroundColor}14 0, transparent 28rem),
    radial-gradient(circle at 8% 32%, ${props => props.theme.mode === 'dark' ? 'rgba(59,130,246,0.07)' : 'rgba(59,130,246,0.05)'} 0, transparent 24rem),
    ${props => props.theme.backgroundColor};
  position: relative;
  overflow-x: hidden;
  
  /* Desktop sidebar handling */
  @media (min-width: 769px) {
    margin-left: 5.5rem;
    width: calc(100% - 5.5rem);
  }
`;

export const DashboardContent = styled.div`
  padding: 2rem 0;
  max-width: none; /* Remove max-width to use all the available space */
  margin: 0;
  animation: ${fadeInUp} 0.8s ease-out;
  /* useScrollNavigation only needs documentHeight > windowHeight + 100px to
     trigger scroll-to-next-page: these values are a safety margin,
     not the main mechanism (real content already exceeds a viewport by now). */
  min-height: 100vh;
  padding-bottom: 7rem;

  @media (max-width: 768px) {
    padding: 78px 0 7rem;
    min-height: 100vh;
  }
`;

// Dashboard header
export const ModernDashboardHeader = styled.header`
  margin-bottom: 1.5rem;
  animation: ${fadeInUp} 0.8s ease-out;

  @media (max-width: 768px) {
    margin-bottom: 0.75rem;
  }
`;

export const ModernDashboardTitle = styled.h1`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background: ${props => props.theme.mode === 'dark'
    ? 'linear-gradient(120deg, #fff 0%, #dbeafe 58%, #34d399 100%)'
    : 'linear-gradient(120deg, #0f172a 0%, #334155 58%, #079164 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: clamp(1.85rem, 3vw, 2.65rem);
  font-weight: 780;
  letter-spacing: -0.045em;
  margin: 0 0 1rem;
  text-align: left;

  @media (max-width: 768px) {
    align-items: flex-start;
    font-size: 1.55rem;
    margin-bottom: 0.75rem;
  }
`;

// Balance overview
export const ModernBalanceOverview = styled.div`
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(420px, 1.5fr);
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
  border-radius: 1.5rem;
  padding: 1.75rem;
  margin-bottom: 1rem;
  box-shadow: ${props => props.theme.mode === 'dark'
    ? '0 24px 60px rgba(0, 0, 0, 0.28), inset 0 1px rgba(255,255,255,0.05)'
    : '0 24px 60px rgba(15, 23, 42, 0.09), inset 0 1px rgba(255,255,255,0.9)'
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
    text-align: left;
    margin: 0;
    padding-right: 1.5rem;

    h2 {
      color: ${props => props.theme.textColor};
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      opacity: 0.8;
    }

    .balance-value {
      font-size: clamp(2rem, 4vw, 2.8rem);
      font-weight: 800;
      color: #079164;
      margin-bottom: 0.3rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .balance-subtitle {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      color: ${props => props.theme.textColor};
      font-size: 0.85rem;
      opacity: 0.7;
    }
  }

  .balance-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 1rem;

    @media (max-width: 768px) {
      flex-direction: row;
      gap: 0.5rem;
      width: 100%;
    }
  }

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 1rem 0.75rem;
    margin-bottom: 0.75rem;
    border-radius: 0.8rem;

    .balance-main {
      margin-bottom: 0.75rem;
      padding-right: 0;
      text-align: left;

      h2 {
        font-size: 0.85rem;
      }

      .balance-value {
        font-size: clamp(1.4rem, 5.5vw, 1.8rem);
      }

      .balance-subtitle {
        font-size: 0.75rem;
        justify-content: flex-start;
      }
    }

    .balance-metrics { display: flex; }
  }
`;

export const ModernMetricCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.8)'
  };
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(7, 145, 100, 0.2)'
  };
  border-radius: 0.8rem;
  padding: 1rem;
  min-width: 0;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  .metric-icon {
    font-size: 1.8rem;
    color: #079164;
  }

  .metric-content {
    .metric-value {
      font-size: 1.4rem;
      font-weight: 700;
      color: ${props => props.theme.textColor};
      line-height: 1;
    }

    .metric-label {
      font-size: 0.75rem;
      color: ${props => props.theme.textColor};
      opacity: 0.7;
      margin-bottom: 0.2rem;
    }

    .metric-percentage {
      font-size: 0.7rem;
      color: #079164;
      font-weight: 600;
    }
  }
  
  @media (max-width: 768px) {
    flex: 1 1 0;
    min-width: 0;
    padding: 0.65rem 0.5rem;
    gap: 0.35rem;
    flex-direction: column;
    align-items: center;
    text-align: center;
    border-radius: 0.6rem;
    
    .metric-icon {
      font-size: 1.2rem;
    }
    
    .metric-content {
      width: 100%;
      overflow: hidden;
    }

    .metric-content .metric-value {
      font-size: clamp(0.85rem, 3.5vw, 1.1rem);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .metric-content .metric-label {
      font-size: clamp(0.6rem, 2.5vw, 0.75rem);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .metric-content .metric-percentage {
      font-size: 0.65rem;
    }
  }
`;

// ─────────────────────────────────────────────────────────────────
// Portfolio section (Liquidity / Emergency / Investments) — card view
// Elegant, uniform, collapsible groups + responsive auto-fill grid.
// ─────────────────────────────────────────────────────────────────

export const PortfolioSectionCard = styled.section`
  background: ${props => props.theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.015) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.6) 100%)'
  };
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(15, 23, 42, 0.07)'
  };
  border-radius: 1.25rem;
  padding: 1.1rem;
  margin-bottom: 1.1rem;

  @media (max-width: 768px) {
    border-radius: 0.9rem;
    padding: 0.65rem;
    margin-bottom: 0.65rem;
  }
`;

export const PortfolioSectionHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  color: inherit;
  font: inherit;

  .title-group {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    min-width: 0;
  }

  .section-icon {
    font-size: 1.15rem;
    color: ${props => props.$accent || props.theme.textColor};
    flex-shrink: 0;
  }

  .section-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: ${props => props.theme.textColor};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .section-total {
    font-size: 0.85rem;
    font-weight: 600;
    color: ${props => props.$accent || props.theme.textColor};
    opacity: 0.85;
    flex-shrink: 0;
    margin-left: auto;
    padding-right: 0.5rem;
  }

  .chevron {
    flex-shrink: 0;
    display: flex;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'};
    transform: rotate(${props => props.$collapsed ? '-90deg' : '0deg'});
    transition: transform 0.25s ease;
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    .section-title {
      font-size: 0.95rem;
    }

    .section-total {
      font-size: 0.72rem;
    }
  }
`;

export const PortfolioSectionBody = styled.div`
  margin-top: 0.9rem;
  animation: ${fadeInUp} 0.35s ease-out;

  @media (max-width: 768px) {
    margin-top: 0.6rem;
  }
`;

export const PortfolioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(188px, 1fr));
  gap: 0.9rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.6rem;
  }
`;

export const PortfolioCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.045)'
    : 'rgba(255, 255, 255, 0.85)'
  };
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.09)'
    : 'rgba(15, 23, 42, 0.08)'
  };
  border-radius: 0.9rem;
  padding: 0.85rem;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: ${props => props.theme.mode === 'dark'
    ? '0 6px 16px rgba(0,0,0,0.18)'
    : '0 6px 16px rgba(15,23,42,0.06)'
  };

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: ${props => props.$gradient || props.$color || '#079164'};
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.theme.mode === 'dark'
      ? '0 12px 26px rgba(0,0,0,0.28)'
      : '0 12px 26px rgba(15,23,42,0.12)'
    };
  }

  @media (max-width: 768px) {
    border-radius: 0.7rem;
    padding: 0.6rem;

    &:hover {
      transform: none;
      box-shadow: ${props => props.theme.mode === 'dark'
        ? '0 6px 16px rgba(0,0,0,0.18)'
        : '0 6px 16px rgba(15,23,42,0.06)'
      };
    }

    &:active {
      transform: scale(0.98);
      transition: transform 0.1s ease;
    }
  }

  .card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.4rem;
    margin-bottom: 0.5rem;
  }

  .icon-chip {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.1rem;
    height: 2.1rem;
    border-radius: 0.55rem;
    background: ${props => props.$gradient || props.$color || '#079164'};
    flex-shrink: 0;

    svg {
      color: white;
      font-size: 1.05rem;
    }
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    flex-shrink: 0;
  }

  .icon-action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.7rem;
    height: 1.7rem;
    border-radius: 0.5rem;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.045)'};
    color: ${props => props.theme.textColor};
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s ease;
    flex-shrink: 0;

    svg { font-size: 0.85rem; }

    &:hover {
      background: ${props => props.$gradient || props.$color || '#079164'};
      color: white;
      transform: scale(1.06);
    }
  }

  .card-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${props => props.theme.textColor};
    opacity: 0.65;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin-bottom: 0.2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-value {
    font-size: 1.25rem;
    font-weight: 800;
    color: ${props => props.theme.textColor};
    line-height: 1.15;
    margin-bottom: 0.35rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin-bottom: 0.5rem;
  }

  .card-pill {
    font-size: 0.63rem;
    font-weight: 700;
    color: ${props => props.$color || '#079164'};
    background: ${props => props.$color || '#079164'}1a;
    border-radius: 0.4rem;
    padding: 0.15rem 0.4rem;
    white-space: nowrap;
  }

  .progress-track {
    height: 3px;
    border-radius: 2px;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.07)'};
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 2px;
    background: ${props => props.$gradient || props.$color || '#079164'};
    transition: width 1s ease-out;
  }

  @media (max-width: 768px) {
    .card-name { font-size: 0.6rem; }
    .card-value { font-size: 0.9rem; }
    .card-pill { font-size: 0.56rem; }
    .icon-action { width: 1.5rem; height: 1.5rem; svg { font-size: 0.75rem; } }
  }
`;

export const PortfolioCardDetailsToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  margin-top: 0.5rem;
  padding: 0.3rem;
  width: 100%;
  border: none;
  border-top: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.07)'};
  background: none;
  color: ${props => props.theme.textColor};
  opacity: 0.6;
  font-size: 0.65rem;
  font-weight: 600;
  cursor: pointer;

  svg {
    font-size: 0.8rem;
    transform: rotate(${props => props.$expanded ? '180deg' : '0deg'});
    transition: transform 0.2s ease;
  }

  &:hover { opacity: 1; }
`;

export const PortfolioCardDetails = styled.div`
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.07)'};
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  animation: ${fadeInUp} 0.25s ease-out;
`;

export const SubEntryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  color: ${props => props.theme.textColor};

  .sub-entry-label {
    opacity: 0.7;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sub-entry-value {
    font-weight: 700;
    flex-shrink: 0;
  }
`;

export const SubEntriesMore = styled.div`
  font-size: 0.66rem;
  opacity: 0.55;
  color: ${props => props.theme.textColor};
  text-align: right;
`;

export const PortfolioExtraInfo = styled.div`
  font-size: 0.68rem;
  line-height: 1.35;
  color: ${props => props.theme.textColor};
  opacity: 0.75;
`;

// Sezione grafici
export const ModernChartsSection = styled.section`
  margin-top: 1.5rem;
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;

  @media (max-width: 768px) {
    margin-top: 1rem;
  }
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
  border-radius: 1.25rem;
  padding: 1.25rem;
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

  @media (max-width: 768px) {
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }

  h4 {
    color: ${props => props.theme.textColor};
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  @media (max-width: 768px) {
    border-radius: 1rem;
    padding: 0.85rem;

    h4 {
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }
  }

  .chart-legend {
    margin-top: 1rem;
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
  margin: 1.5rem 0;
  padding: 1.75rem;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.02)'
    : 'rgba(255, 255, 255, 0.8)'
  };
  border-radius: 24px;
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
    margin: 1rem 0;
    padding: 0.85rem;
    border-radius: 16px;
  }
`;

export const ModernIncomeExpenseCard = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.03)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid ${props => props.itemColor}20;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.2)' 
    : '0 4px 20px rgba(0, 0, 0, 0.08)'
  };
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 220px;
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
    font-size: 2rem;
    color: ${props => props.itemColor};
    margin-bottom: 0.75rem;
    display: flex;
    justify-content: center;
  }

  .expense-content {
    h4.expense-name {
      font-size: 1rem;
      font-weight: 600;
      color: ${props => props.theme.textColor};
      margin-bottom: 0.6rem;
    }

    .expense-value {
      font-size: 1.6rem;
      font-weight: 700;
      color: ${props => props.itemColor};
      margin-bottom: 0.4rem;
    }

    .expense-description {
      font-size: 0.9rem;
      color: ${props => props.theme.mode === 'dark' ? '#ffffff' : props.theme.textColor + '80'};
      font-style: italic;
      margin-bottom: 1rem;
    }

    .income-outflow-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: ${props => props.itemColor}20;
      color: ${props => props.itemColor};
      border: 1px solid ${props => props.itemColor}40;
      border-radius: 8px;
      padding: 0.6rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;
      margin-top: 0.5rem;

      &:hover {
        background: ${props => props.itemColor}30;
        border-color: ${props => props.itemColor}60;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px ${props => props.itemColor}20;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 0.7rem 0.35rem;
    min-width: auto;
    border-radius: 12px;

    .expense-icon {
      font-size: 1.2rem;
      margin-bottom: 0.4rem;
    }

    .expense-content {
      h4.expense-name {
        font-size: 0.72rem;
      }

      .expense-value {
        font-size: clamp(0.82rem, 3.2vw, 1.05rem);
        white-space: nowrap;
      }

      .expense-description {
        display: none;
      }

      .income-outflow-button {
        padding: 0.35rem 0.45rem;
        font-size: 0.65rem;
      }
    }
  }
`;

// Elementi fluttuanti
export const FloatingElement = styled.div`
  animation: ${float} 3s ease-in-out infinite;
  animation-delay: ${props => props.delay || 0}s;

  @media (max-width: 768px) {
    animation: none;
  }
`;

export const PulseAnimation = styled.div`
  animation: ${pulse} 2s ease-in-out infinite;
  animation-delay: ${props => props.delay || 0}s;

  @media (max-width: 768px) {
    animation: none;
  }
`;
