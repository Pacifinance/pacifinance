import React, { useState, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import roadmapData, { getStatusCounts } from '../data/roadmapData';
import SEOHead from '../components/SEOHead';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../sections/LandingHeader';
import LandingFooter from '../sections/LandingFooter';
import Sidebar from '../sections/Sidebar';

/* ─── Styled Components ─── */

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${p => p.theme.mode === 'dark'
    ? `linear-gradient(135deg, ${p.theme.backgroundColor} 0%, #0a0a1a 100%)`
    : `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)`};
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;

  h1 {
    font-size: 2.4rem;
    font-weight: 800;
    color: ${p => p.theme.mode === 'dark' ? '#fff' : '#1a1a2e'};
    margin-bottom: 0.75rem;
  }

  p {
    font-size: 1.1rem;
    color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)'};
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    h1 { font-size: 1.8rem; }
    p { font-size: 0.95rem; }
  }
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const StatBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  background: ${p => p.$bg};
  color: ${p => p.$color};
`;

const FilterRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterChip = styled.button`
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  border: 1.5px solid ${p => p.$active
    ? p.theme.secondaryColor
    : p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'};
  background: ${p => p.$active
    ? `${p.theme.secondaryColor}20`
    : 'transparent'};
  color: ${p => p.$active
    ? p.theme.secondaryColor
    : p.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    border-color: ${p => p.theme.secondaryColor};
    background: ${p => `${p.theme.secondaryColor}15`};
  }
`;

const ColumnsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const Column = styled.div`
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)'};
  border-radius: 16px;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  padding: 1.25rem;
  backdrop-filter: blur(8px);
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid ${p => p.$accentColor}40;

  h2 {
    font-size: 1.1rem;
    font-weight: 700;
    color: ${p => p.theme.mode === 'dark' ? '#fff' : '#1a1a2e'};
    margin: 0;
  }

  .count {
    margin-left: auto;
    background: ${p => p.$accentColor}20;
    color: ${p => p.$accentColor};
    padding: 0.15rem 0.6rem;
    border-radius: 10px;
    font-size: 0.8rem;
    font-weight: 700;
  }
`;

const Card = styled.div`
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#ffffff'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  }
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.4rem;

  .icon { font-size: 1.2rem; }

  h3 {
    font-size: 0.95rem;
    font-weight: 650;
    color: ${p => p.theme.mode === 'dark' ? '#fff' : '#1a1a2e'};
    margin: 0;
  }
`;

const CardDesc = styled.p`
  font-size: 0.82rem;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)'};
  line-height: 1.5;
  margin: 0;
`;

const CategoryBadge = styled.span`
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 0.15rem 0.55rem;
  border-radius: 6px;
  margin-top: 0.5rem;
  background: ${p => {
    switch (p.$cat) {
      case 'feature': return 'rgba(59,130,246,0.15)';
      case 'ux': return 'rgba(168,85,247,0.15)';
      case 'community': return 'rgba(16,185,129,0.15)';
      case 'security': return 'rgba(239,68,68,0.15)';
      default: return 'rgba(107,114,128,0.15)';
    }
  }};
  color: ${p => {
    switch (p.$cat) {
      case 'feature': return '#3b82f6';
      case 'ux': return '#a855f7';
      case 'community': return '#10b981';
      case 'security': return '#ef4444';
      default: return '#6b7280';
    }
  }};
`;

const FeedbackCTA = styled.div`
  text-align: center;
  margin-top: 3rem;
  padding: 2rem;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)'};
  border-radius: 16px;
  border: 1px dashed ${p => p.theme.secondaryColor}50;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  h3 {
    font-size: 1.15rem;
    font-weight: 700;
    color: ${p => p.theme.mode === 'dark' ? '#fff' : '#1a1a2e'};
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.9rem;
    color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)'};
    margin-bottom: 1rem;
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 1.5rem;
    border-radius: 10px;
    background: ${p => p.theme.secondaryColor};
    color: #fff;
    font-weight: 600;
    font-size: 0.9rem;
    text-decoration: none;
    transition: opacity 0.2s;

    &:hover { opacity: 0.85; }
  }
`;

/* ─── Constants ─── */

const STATUS_CONFIG = {
  completed: { labelIt: 'Completato', labelEn: 'Completed', color: '#10b981', emoji: '✅' },
  'in-progress': { labelIt: 'In Corso', labelEn: 'In Progress', color: '#f59e0b', emoji: '🔨' },
  planned: { labelIt: 'Pianificato', labelEn: 'Planned', color: '#3b82f6', emoji: '📋' },
};

const CATEGORY_LABELS = {
  feature: { it: 'Funzionalità', en: 'Feature' },
  ux: { it: 'Esperienza', en: 'Experience' },
  community: { it: 'Community', en: 'Community' },
  security: { it: 'Sicurezza', en: 'Security' },
};

/* ─── Component ─── */

const RoadmapPage = () => {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, translations, toggleLanguage } = useContext(LanguageContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  const [activeFilter, setActiveFilter] = useState('all');
  const { isAuthenticated, userData, handleSetIsUpdated, handleSetIsAuthenticated } = useAuth();

  const { mode } = theme;

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const counts = getStatusCounts();
  const isIt = language === 'it';

  const filtered = activeFilter === 'all'
    ? roadmapData
    : roadmapData.filter(item => item.category === activeFilter);

  const statusOrder = ['planned', 'in-progress', 'completed'];

  const renderCards = (status) => {
    const items = filtered.filter(i => i.status === status);
    if (!items.length) return <CardDesc theme={theme}>{t.noItems || (isIt ? 'Nessun elemento' : 'No items')}</CardDesc>;
    return items.map(item => (
      <Card key={item.id} theme={theme}>
        <CardTitle theme={theme}>
          <span className="icon">{item.icon}</span>
          <h3>{item.title[language] || item.title.en}</h3>
        </CardTitle>
        <CardDesc theme={theme}>
          {item.description[language] || item.description.en}
        </CardDesc>
        <CategoryBadge $cat={item.category}>
          {CATEGORY_LABELS[item.category]?.[language] || item.category}
        </CategoryBadge>
      </Card>
    ));
  };

  const t = translations?.roadmap || {};

  const roadmapContent = (
    <PageWrapper theme={theme}>
      <SEOHead
        title={isIt ? 'Roadmap - PaciFinance' : 'Roadmap - PaciFinance'}
        description={isIt
          ? 'Scopri le funzionalità completate, in corso e pianificate di PaciFinance.'
          : 'Discover the completed, in progress and planned features of PaciFinance.'}
        path="/roadmap"
      />

      <PageHeader theme={theme}>
        <h1>🗺️ {t.title || (isIt ? 'Roadmap' : 'Roadmap')}</h1>
        <p>
          {t.subtitle || (isIt
            ? 'Scopri dove sta andando PaciFinance. Ogni funzionalità nasce dal feedback della community.'
            : 'Discover where PaciFinance is heading. Every feature is born from community feedback.')}
        </p>
      </PageHeader>

      <StatsRow>
        {statusOrder.map(status => {
          const cfg = STATUS_CONFIG[status];
          return (
            <StatBadge key={status} $bg={`${cfg.color}18`} $color={cfg.color}>
              {cfg.emoji} {counts[status]} {isIt ? cfg.labelIt : cfg.labelEn}
            </StatBadge>
          );
        })}
      </StatsRow>

      <FilterRow>
        {[
          { key: 'all', it: 'Tutto', en: 'All' },
          { key: 'feature', it: 'Funzionalità', en: 'Features' },
          { key: 'ux', it: 'Esperienza', en: 'Experience' },
          { key: 'community', it: 'Community', en: 'Community' },
          { key: 'security', it: 'Sicurezza', en: 'Security' },
        ].map(f => (
          <FilterChip
            key={f.key}
            theme={theme}
            $active={activeFilter === f.key}
            onClick={() => setActiveFilter(f.key)}
          >
            {isIt ? f.it : f.en}
          </FilterChip>
        ))}
      </FilterRow>

      {isMobileScreen ? (
        /* Mobile: stacked list with section headers */
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {statusOrder.map(status => {
            const cfg = STATUS_CONFIG[status];
            const items = filtered.filter(i => i.status === status);
            if (!items.length) return null;
            return (
              <div key={status} style={{ marginBottom: '1.5rem' }}>
                <ColumnHeader theme={theme} $accentColor={cfg.color}>
                  <span>{cfg.emoji}</span>
                  <h2>{isIt ? cfg.labelIt : cfg.labelEn}</h2>
                  <span className="count">{items.length}</span>
                </ColumnHeader>
                {renderCards(status)}
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop: 3-column kanban */
        <ColumnsGrid>
          {statusOrder.map(status => {
            const cfg = STATUS_CONFIG[status];
            const items = filtered.filter(i => i.status === status);
            return (
              <Column key={status} theme={theme}>
                <ColumnHeader theme={theme} $accentColor={cfg.color}>
                  <span>{cfg.emoji}</span>
                  <h2>{isIt ? cfg.labelIt : cfg.labelEn}</h2>
                  <span className="count">{items.length}</span>
                </ColumnHeader>
                {renderCards(status)}
              </Column>
            );
          })}
        </ColumnsGrid>
      )}

      {/* Feedback CTA */}
      <FeedbackCTA theme={theme}>
        <h3>
          {isIt ? '💡 Hai un\'idea o hai trovato un bug?' : '💡 Have an idea or found a bug?'}
        </h3>
        <p>
          {isIt
            ? 'PaciFinance è un progetto community-centrico. Il tuo feedback è fondamentale!'
            : 'PaciFinance is a community-centric project. Your feedback is essential!'}
        </p>
        <a
          href="https://github.com/Pacifinance/Pacifinance/issues/new/choose"
          target="_blank"
          rel="noopener noreferrer"
          data-umami-event="roadmap-feedback-click"
        >
          🐛 {isIt ? 'Invia Feedback' : 'Send Feedback'}
        </a>
      </FeedbackCTA>
    </PageWrapper>
  );

  if (isAuthenticated) {
    return (
      <>
        <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />
        {roadmapContent}
      </>
    );
  }

  return (
    <div className="w-full flex overflow-auto min-h-screen flex-col" style={{ backgroundColor: theme.backgroundColor }}>
      <Header theme={theme} mode={mode} toggleMode={toggleMode} toggleLanguage={toggleLanguage} />
      <main className="flex-1">
        {roadmapContent}
      </main>
      <LandingFooter theme={theme} />
    </div>
  );
};

export default RoadmapPage;
