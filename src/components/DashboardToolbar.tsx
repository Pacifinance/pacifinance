/**
 * DashboardToolbar Component
 * 
 * Controls for dashboard customization:
 * - View mode toggle (cards / compact)
 * - Section reorder (drag-and-drop panel)
 * - Reset layout
 */

import React, { useState, useContext, useRef } from 'react';
import styled from 'styled-components';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { MdDragIndicator, MdViewModule, MdTableRows, MdSettings, MdRefresh, MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import { IoClose } from 'react-icons/io5';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import WhatsNewBanner from './WhatsNewBanner';

const ToolbarContainer = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  width: fit-content;
  margin: 0 0 1rem auto;
  padding: 0.3rem;
  border-radius: 0.85rem;
  border: 1px solid ${props => props.theme.buttonBackgroundColor}38;
  background: linear-gradient(135deg,
    ${props => props.theme.buttonBackgroundColor}18,
    ${props => props.theme.buttonBackgroundColor}08);
  box-shadow: 0 10px 30px ${props => props.theme.buttonBackgroundColor}12;
  
  @media (max-width: 768px) {
    margin-bottom: 0.75rem;
    gap: 0.35rem;
  }
`;

const ToolbarButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.75rem;
  border-radius: 0.65rem;
  border: 1px solid ${props => props.$active
    ? `${props.theme.buttonBackgroundColor}70`
    : `${props.theme.buttonBackgroundColor}28`};
  background: ${props => props.$active
    ? `${props.theme.buttonBackgroundColor}28`
    : `${props.theme.buttonBackgroundColor}0d`};
  color: ${props => props.$active ? props.theme.buttonBackgroundColor : props.theme.textColor};
  font-size: 0.8rem;
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.buttonBackgroundColor}20;
    border-color: ${props => props.theme.buttonBackgroundColor}55;
  }
  
  svg {
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    padding: 0.35rem 0.5rem;
    font-size: 0.7rem;
    
    svg { font-size: 0.9rem; }
    
    .btn-label { display: none; }
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10000;
  backdrop-filter: blur(2px);
`;

const Panel = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 420px;
  max-height: 80vh;
  overflow-y: auto;
  background: ${props => props.theme.mode === 'dark' ? '#1e293b' : '#ffffff'};
  border-radius: 1.5rem;
  padding: 1.5rem;
  z-index: 10001;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    width: 95%;
    padding: 1rem;
    border-radius: 1rem;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: ${props => props.theme.textColor};
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.textColor};
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.5rem;
  font-size: 1.2rem;
  display: flex;
  
  &:hover {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  }
`;

const SectionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 0.75rem;
  background: ${props => props.$isDragging
    ? (props.theme.mode === 'dark' ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.08)')
    : (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)')};
  border: 1px solid ${props => props.$isDragging
    ? 'rgba(34,197,94,0.4)'
    : 'transparent'};
  cursor: grab;
  transition: all 0.15s ease;
  user-select: none;
  
  &:active { cursor: grabbing; }
  
  &:hover {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'};
  }
  
  .drag-handle {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'};
    font-size: 1.2rem;
    flex-shrink: 0;
  }
  
  .section-name {
    flex: 1;
    font-size: 0.9rem;
    color: ${props => props.$visible ? props.theme.textColor : (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)')};
    font-weight: ${props => props.$visible ? '500' : '400'};
    text-decoration: ${props => props.$visible ? 'none' : 'line-through'};
  }
  
  .visibility-toggle {
    background: none;
    border: none;
    cursor: pointer;
    color: ${props => props.$visible ? '#22c55e' : (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)')};
    font-size: 1rem;
    padding: 0.25rem;
    border-radius: 0.25rem;
    display: flex;
    
    &:hover {
      background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
    }
  }

  .reorder-actions {
    display: inline-flex;
    gap: 0.15rem;
  }

  .reorder-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    border: 0;
    border-radius: 0.45rem;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.055)' : 'rgba(15,23,42,0.045)'};
    color: ${props => props.theme.textColor};
    cursor: pointer;

    &:hover:not(:disabled) { background: ${props => props.theme.buttonBackgroundColor}1c; }
    &:disabled { opacity: 0.22; cursor: default; }
  }
`;

const ResetButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.6rem 1rem;
  width: 100%;
  justify-content: center;
  border-radius: 0.75rem;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
  background: transparent;
  color: ${props => props.theme.textColor};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
  }
`;

// Section name translations mapping
const getSectionNames = (t) => ({
  'balance-overview': t?.dashboard?.totalBalance ? (t?.dashboardLayout?.balanceOverview || 'Panoramica Bilancio') : 'Panoramica Bilancio',
  'liquidity-investments': t?.dashboardLayout?.liquidityInvestments || 'Liquidità & Investimenti',
  'income-expense': t?.dashboardLayout?.incomeExpense || 'Entrate & Uscite',
  'charts': t?.dashboardLayout?.charts || 'Grafici',
  'financial-insights': t?.dashboardLayout?.financialInsights || 'Analisi Finanziaria',
  'goal-tracker': t?.dashboardLayout?.goalTracker || 'Obiettivi',
  'gamification': t?.dashboardLayout?.gamification || 'Traguardi',
});

const DashboardToolbar = ({
  theme,
  sections,
  moveSection,
  toggleSection,
  resetLayout,
  viewMode,
  toggleViewMode,
}) => {
  const { language, translations } = useContext(LanguageContext);
  useContext(MediaQueryContext);
  const [showPanel, setShowPanel] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragItem = useRef(null);

  const sectionNames = getSectionNames(translations);

  const t = translations?.dashboardLayout || {};

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Required for Firefox
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e, toIndex) => {
    e.preventDefault();
    const fromIndex = dragItem.current;
    if (fromIndex !== null && fromIndex !== toIndex) {
      moveSection(fromIndex, toIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
    dragItem.current = null;
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
    dragItem.current = null;
  };

  // Touch-based drag for mobile
  const touchStart = useRef(null);
  const [touchDragIndex, setTouchDragIndex] = useState(null);

  const handleTouchStart = (index) => {
    touchStart.current = index;
    setTouchDragIndex(index);
  };

  const handleTouchMove = (e, index) => {
    if (touchStart.current !== null && touchStart.current !== index) {
      moveSection(touchStart.current, index);
      touchStart.current = index;
      setTouchDragIndex(index);
    }
  };

  const handleTouchEnd = () => {
    touchStart.current = null;
    setTouchDragIndex(null);
  };

  return (
    <>
      <ToolbarContainer>
        {/* What's New notification */}
        <WhatsNewBanner />

        {/* View Mode Toggle */}
        <ToolbarButton 
          theme={theme} 
          $active={viewMode === 'compact'}
          onClick={toggleViewMode}
          title={viewMode === 'cards' ? (t.switchToCompact || 'Vista compatta') : (t.switchToCards || 'Vista card')}
          aria-label={viewMode === 'cards' ? (t.switchToCompact || 'Switch to compact view') : (t.switchToCards || 'Switch to card view')}
          data-umami-event="dashboard-toggle-view"
        >
          {viewMode === 'cards' ? <MdTableRows /> : <MdViewModule />}
          <span className="btn-label">
            {viewMode === 'cards' ? (t.compact || 'Compatta') : (t.cards || 'Card')}
          </span>
        </ToolbarButton>

        {/* Customize Layout */}
        <ToolbarButton 
          theme={theme} 
          $active={showPanel}
          onClick={() => {
            if (viewMode === 'compact') toggleViewMode();
            setShowPanel(true);
          }}
          title={t.customize || 'Personalizza layout'}
          data-umami-event="dashboard-customize"
        >
          <MdSettings />
          <span className="btn-label">{t.customize || 'Personalizza'}</span>
        </ToolbarButton>
      </ToolbarContainer>

      {/* Customization Panel */}
      {showPanel && (
        <>
          <Overlay onClick={() => setShowPanel(false)} />
          <Panel theme={theme}>
            <PanelHeader theme={theme}>
              <h3>⚙️ {t.customizeTitle || 'Personalizza Dashboard'}</h3>
              <CloseButton theme={theme} onClick={() => setShowPanel(false)}>
                <IoClose />
              </CloseButton>
            </PanelHeader>

            <p style={{
              fontSize: '0.8rem',
              color: theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
              marginBottom: '1rem',
            }}>
              {t.dragHint || 'Trascina le sezioni per riordinarle. Clicca l\'icona occhio per nasconderle.'}
            </p>

            {/* Section List */}
            {sections.map((section, index) => (
              <SectionItem
                key={section.id}
                theme={theme}
                $visible={section.visible}
                $isDragging={dragIndex === index || touchDragIndex === index || dragOverIndex === index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onTouchStart={() => handleTouchStart(index)}
                onTouchMove={() => handleTouchMove(null, index)}
                onTouchEnd={handleTouchEnd}
              >
                <MdDragIndicator className="drag-handle" />
                <span className="section-name">
                  {sectionNames[section.id] || section.id}
                </span>
                <div className="reorder-actions">
                  <button
                    type="button"
                    className="reorder-button"
                    disabled={index === 0}
                    onClick={() => moveSection(index, index - 1)}
                    aria-label={language === 'it' ? 'Sposta sezione in alto' : 'Move section up'}
                    title={language === 'it' ? 'Sposta in alto' : 'Move up'}
                  >
                    <MdKeyboardArrowUp />
                  </button>
                  <button
                    type="button"
                    className="reorder-button"
                    disabled={index === sections.length - 1}
                    onClick={() => moveSection(index, index + 1)}
                    aria-label={language === 'it' ? 'Sposta sezione in basso' : 'Move section down'}
                    title={language === 'it' ? 'Sposta in basso' : 'Move down'}
                  >
                    <MdKeyboardArrowDown />
                  </button>
                </div>
                <button
                  className="visibility-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection(section.id);
                  }}
                >
                  {section.visible ? <BsEye /> : <BsEyeSlash />}
                </button>
              </SectionItem>
            ))}

            <ResetButton theme={theme} onClick={() => { resetLayout(); setShowPanel(false); }}>
              <MdRefresh />
              {t.resetLayout || 'Ripristina layout predefinito'}
            </ResetButton>
          </Panel>
        </>
      )}
    </>
  );
};

export default DashboardToolbar;
