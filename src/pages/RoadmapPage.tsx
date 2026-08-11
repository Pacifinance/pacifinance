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
import { LocalizedLink } from '../components/LocalizedLink';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { useServices } from '../contexts/ServiceContext';
import { GITHUB_REPO_URL } from '../data/externalLinks';

const CARDS_PER_COLUMN = 4;

/* ─── Styled Components ─── */

const PageWrapper = styled.div`
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: ${p => p.theme.mode === 'dark'
    ? `linear-gradient(135deg, ${p.theme.backgroundColor} 0%, #0a0a1a 100%)`
    : `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)`};
  padding: 2rem;
  padding-top: ${p => p.$withTopOffset ? 'calc(2rem + 72px)' : '2rem'};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(600px circle at 12% 0%, ${p => p.theme.secondaryColor}${p => p.theme.mode === 'dark' ? '1c' : '12'}, transparent 55%),
      radial-gradient(500px circle at 90% 15%, #10b981${p => p.theme.mode === 'dark' ? '14' : '0d'}, transparent 50%);
  }

  > * { position: relative; z-index: 1; }

  @media (max-width: 768px) {
    padding: 1rem;
    padding-top: ${p => p.$withTopOffset ? 'calc(1rem + 72px)' : '1rem'};
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
  border-radius: 20px;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  box-shadow: ${p => p.theme.mode === 'dark' ? 'none' : '0 4px 24px rgba(15,23,42,0.04)'};
  padding: 1.25rem;
  backdrop-filter: blur(10px);
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
  padding-bottom: 0.85rem;
  border-bottom: 2px solid ${p => p.$accentColor}40;

  .status-dot {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 50%;
    background: ${p => p.$accentColor};
    box-shadow: 0 0 0 4px ${p => p.$accentColor}22;
  }

  h2 {
    font-size: 1.05rem;
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
  position: relative;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#ffffff'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  border-radius: 14px;
  padding: 1rem 1rem 1rem 1.1rem;
  margin-bottom: 0.75rem;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: ${p => CATEGORY_COLORS[p.$cat] || CATEGORY_COLORS.default};
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(0,0,0,0.1);
  }
`;

const CardTitle = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin-bottom: 0.4rem;

  .icon {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.9rem;
    height: 1.9rem;
    border-radius: 9px;
    font-size: 1rem;
    background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  }

  h3 {
    font-size: 0.95rem;
    font-weight: 650;
    color: ${p => p.theme.mode === 'dark' ? '#fff' : '#1a1a2e'};
    margin: 0;
    padding-top: 0.15rem;
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

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.6rem;
  gap: 0.5rem;
`;

const VoteButton = styled.button<{ $voted?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  border: 1.5px solid ${p => p.$voted ? p.theme.secondaryColor : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)')};
  background: ${p => p.$voted ? `${p.theme.secondaryColor}20` : 'transparent'};
  color: ${p => p.$voted ? p.theme.secondaryColor : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)')};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${p => p.theme.secondaryColor};
    color: ${p => p.theme.secondaryColor};
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
`;

const GithubIssueLink = styled.a`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'};
  text-decoration: none;

  &:hover { text-decoration: underline; }
`;

const VoteCountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1.5px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'};
`;

const BugReportLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(239,68,68,0.85)' : '#dc2626'};
  text-decoration: none;

  &:hover { text-decoration: underline; }
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ShowMoreButton = styled.button`
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.55rem;
  border-radius: 10px;
  border: 1.5px dashed ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'};
  background: transparent;
  color: ${p => p.theme.secondaryColor};
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${p => p.theme.secondaryColor};
    background: ${p => `${p.theme.secondaryColor}12`};
  }
`;

const HeaderKicker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.9rem;
  margin-bottom: 1rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: ${p => p.theme.secondaryColor};
  background: ${p => `${p.theme.secondaryColor}15`};
  border: 1px solid ${p => `${p.theme.secondaryColor}30`};
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

const CATEGORY_COLORS = {
  feature: '#3b82f6',
  ux: '#a855f7',
  community: '#10b981',
  security: '#ef4444',
  default: '#6b7280',
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
  const { roadmapVotesService } = useServices();
  const navigate = useLocalizedNavigate();
  const [voteCounts, setVoteCounts] = useState({});
  const [myVotes, setMyVotes] = useState([]);
  const [expandedColumns, setExpandedColumns] = useState({});

  const { mode } = theme;

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Vote counts are public (visible logged out too); "mine" only once authenticated.
  useEffect(() => {
    roadmapVotesService.getVoteCounts().then(setVoteCounts).catch(() => {});
  }, [roadmapVotesService]);

  useEffect(() => {
    if (!isAuthenticated) {
      setMyVotes([]);
      return;
    }
    roadmapVotesService.getMyVotes().then(setMyVotes).catch(() => {});
  }, [isAuthenticated, roadmapVotesService]);

  const handleToggleVote = async (itemId) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    const hadVoted = myVotes.includes(itemId);
    // Optimistic update, reconciled with the server response.
    setMyVotes(prev => hadVoted ? prev.filter(id => id !== itemId) : [...prev, itemId]);
    setVoteCounts(prev => ({ ...prev, [itemId]: Math.max(0, (prev[itemId] || 0) + (hadVoted ? -1 : 1)) }));
    try {
      const result = await roadmapVotesService.toggleVote(itemId);
      if (result.voted !== !hadVoted) {
        // Server disagreed with the optimistic guess (e.g. stale local state) - refetch to reconcile.
        roadmapVotesService.getMyVotes().then(setMyVotes).catch(() => {});
        roadmapVotesService.getVoteCounts().then(setVoteCounts).catch(() => {});
      }
    } catch {
      // Roll back on failure.
      setMyVotes(prev => hadVoted ? [...prev, itemId] : prev.filter(id => id !== itemId));
      setVoteCounts(prev => ({ ...prev, [itemId]: Math.max(0, (prev[itemId] || 0) + (hadVoted ? 1 : -1)) }));
    }
  };

  const counts = getStatusCounts();
  const isIt = language === 'it';

  const filtered = activeFilter === 'all'
    ? roadmapData
    : roadmapData.filter(item => item.category === activeFilter);

  const statusOrder = ['planned', 'in-progress', 'completed'];

  const buildBugReportUrl = (item) => {
    // GitHub issues are triaged in English regardless of the reporter's UI
    // language, so the pre-filled title always uses the English title.
    return `${GITHUB_REPO_URL}/issues/new?template=bug_report.md&title=${encodeURIComponent(`[Bug] ${item.title.en}`)}`;
  };

  const toggleColumnExpanded = (status) => {
    setExpandedColumns(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const renderCards = (status) => {
    const items = filtered.filter(i => i.status === status);
    if (!items.length) return <CardDesc theme={theme}>{t.noItems || (isIt ? 'Nessun elemento' : 'No items')}</CardDesc>;

    const isExpanded = !!expandedColumns[status];
    const visibleItems = isExpanded ? items : items.slice(0, CARDS_PER_COLUMN);
    const hiddenCount = items.length - visibleItems.length;

    const cards = visibleItems.map(item => {
      const isCompleted = item.status === 'completed';
      return (
        <Card key={item.id} theme={theme} $cat={item.category}>
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
          <CardFooter>
            {isCompleted ? (
              <VoteCountBadge
                theme={theme}
                title={t.vote?.frozen || (isIt ? 'Votazione chiusa: già rilasciata' : 'Voting closed: already shipped')}
              >
                🗳️ {voteCounts[item.id] || 0}
              </VoteCountBadge>
            ) : (
              <VoteButton
                theme={theme}
                $voted={myVotes.includes(item.id)}
                onClick={() => handleToggleVote(item.id)}
                title={isAuthenticated ? undefined : (t.vote?.loginPrompt || (isIt ? 'Accedi per votare' : 'Sign in to vote'))}
              >
                🗳️ {voteCounts[item.id] || 0}
              </VoteButton>
            )}
            <CardActions>
              {isCompleted && (
                <BugReportLink
                  theme={theme}
                  href={buildBugReportUrl(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🐛 {t.reportBug || (isIt ? 'Segnala bug' : 'Report bug')}
                </BugReportLink>
              )}
              {item.githubIssue && (
                <GithubIssueLink
                  theme={theme}
                  href={`${GITHUB_REPO_URL}/issues/${item.githubIssue}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub #{item.githubIssue}
                </GithubIssueLink>
              )}
            </CardActions>
          </CardFooter>
        </Card>
      );
    });

    if (hiddenCount > 0 || isExpanded) {
      cards.push(
        <ShowMoreButton key={`${status}-toggle`} theme={theme} onClick={() => toggleColumnExpanded(status)}>
          {isExpanded
            ? (t.showLess || (isIt ? 'Mostra meno' : 'Show less'))
            : `${t.showAll || (isIt ? 'Mostra tutti' : 'Show all')} (${items.length})`}
        </ShowMoreButton>
      );
    }

    return cards;
  };

  const t = translations?.roadmap || {};

  const roadmapContent = (
    <PageWrapper theme={theme} $withTopOffset={!isAuthenticated || isMobileScreen}>
      <SEOHead
        title={isIt ? 'Roadmap - Pacifinance' : 'Roadmap - Pacifinance'}
        description={isIt
          ? 'Scopri le funzionalità completate, in corso e pianificate di Pacifinance.'
          : 'Discover the completed, in progress and planned features of Pacifinance.'}
        canonical="/roadmap"
        language={language}
      />

      <PageHeader theme={theme}>
        <HeaderKicker theme={theme}>
          🤝 {t.kicker || (isIt ? 'Roadmap community-driven' : 'Community-driven roadmap')}
        </HeaderKicker>
        <h1>🗺️ {t.title || (isIt ? 'Roadmap' : 'Roadmap')}</h1>
        <p>
          {t.subtitle || (isIt
            ? 'Scopri dove sta andando Pacifinance. Ogni funzionalità nasce dal feedback della community.'
            : 'Discover where Pacifinance is heading. Every feature is born from community feedback.')}
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
                  <span className="status-dot" />
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
                  <span className="status-dot" />
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
            ? 'Pacifinance è un progetto community-centrico. Il tuo feedback è fondamentale!'
            : 'Pacifinance is a community-centric project. Your feedback is essential!'}
        </p>
        <LocalizedLink to="/contribute" data-umami-event="roadmap-feedback-click">
          🐛 {isIt ? 'Invia Feedback' : 'Send Feedback'}
        </LocalizedLink>
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
