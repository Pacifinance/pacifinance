/**
 * GamificationSection Component
 * 
 * Displays badges, achievements, level progress, and streaks.
 * Supports filtering by unlock status and by badge category.
 * Fully client-side — no backend needed.
 */

import React, { useContext, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useGamification, BADGE_CATEGORY_ORDER } from '../hooks/useGamification';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { getLevelColor, getLevelProgress } from '../utils/gamificationLevel';

const GamificationContainer = styled.div`
  margin: 2rem 0;
  padding: 2rem;
  background: ${props => props.theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'
    : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)'};
  border-radius: 1.5rem;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
  
  @media (max-width: 768px) {
    margin: 1rem 0;
    padding: 1rem;
    border-radius: 1rem;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.textColor};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
`;

const LevelBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  background: ${props => props.theme.mode === 'dark'
    ? `${props.$levelColor}16`
    : `${props.$levelColor}10`};
  border-radius: 1rem;
  border: 1px solid ${props => `${props.$levelColor}35`};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    padding: 0.75rem;
  }
`;

const LevelCircle = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.$levelColor};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 1rem;
    align-self: center;
  }
`;

const ProgressBarContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProgressBarTrack = styled.div`
  height: 8px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.25rem;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: ${props => props.$levelColor};
  border-radius: 4px;
  transition: width 0.8s ease;
  width: ${props => props.$progress}%;
`;

const ProgressText = styled.div`
  font-size: 0.85rem;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'};
  display: flex;
  justify-content: space-between;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
`;

const StatCard = styled.div`
  flex: 1;
  min-width: 120px;
  padding: 0.75rem 1rem;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
  border-radius: 0.75rem;
  text-align: center;
  
  .stat-value {
    font-size: 1.4rem;
    font-weight: 700;
    color: ${props => props.$color || props.theme.textColor};
  }
  
  .stat-label {
    font-size: 0.75rem;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'};
    margin-top: 0.25rem;
  }
  
  @media (max-width: 768px) {
    min-width: 80px;
    padding: 0.5rem;
    
    .stat-value { font-size: 1.1rem; }
    .stat-label { font-size: 0.65rem; }
  }
`;

const BadgesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.5rem;
  }
`;

const BadgeCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0.5rem;
  border-radius: 1rem;
  text-align: center;
  transition: all 0.2s ease;
  cursor: default;
  background: ${props => props.$unlocked
    ? (props.theme.mode === 'dark' ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.08)')
    : (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)')};
  border: 1px solid ${props => props.$unlocked
    ? 'rgba(34,197,94,0.3)'
    : 'transparent'};
  opacity: ${props => props.$unlocked ? 1 : 0.45};
  filter: ${props => props.$unlocked ? 'none' : 'grayscale(100%)'};
  
  &:hover {
    transform: ${props => props.$unlocked ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.$unlocked ? '0 4px 12px rgba(34,197,94,0.15)' : 'none'};
  }
  
  .badge-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .badge-name {
    font-size: 0.8rem;
    font-weight: 600;
    color: ${props => props.theme.textColor};
    line-height: 1.2;
  }
  
  .badge-desc {
    font-size: 0.65rem;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'};
    margin-top: 0.25rem;
    line-height: 1.3;
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 0.3rem;
    
    .badge-icon { font-size: 1.5rem; }
    .badge-name { font-size: 0.7rem; }
    .badge-desc { font-size: 0.55rem; }
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const Tab = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid ${props => props.$active ? 'rgba(34,197,94,0.5)' : 'transparent'};
  background: ${props => props.$active
    ? (props.theme.mode === 'dark' ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)')
    : 'transparent'};
  color: ${props => props.$active ? '#22c55e' : props.theme.textColor};
  font-size: 0.85rem;
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
  }
  
  @media (max-width: 768px) {
    padding: 0.4rem 0.6rem;
    font-size: 0.75rem;
  }
`;

const CategoryFilterRow = styled.div`
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CategoryChip = styled.button`
  padding: 0.35rem 0.75rem;
  border-radius: 1rem;
  border: 1px solid ${props => props.$active ? 'rgba(34,197,94,0.4)' : (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')};
  background: ${props => props.$active
    ? (props.theme.mode === 'dark' ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.08)')
    : 'transparent'};
  color: ${props => props.$active ? '#22c55e' : (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)')};
  font-size: 0.75rem;
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover {
    border-color: rgba(34,197,94,0.3);
    color: ${props => props.$active ? '#22c55e' : props.theme.textColor};
  }
  
  @media (max-width: 768px) {
    padding: 0.3rem 0.6rem;
    font-size: 0.65rem;
  }
`;

const CategoryDivider = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  margin-top: ${props => props.$first ? '0' : '0.25rem'};
  
  &::before {
    content: '';
    width: 3px;
    height: 1rem;
    border-radius: 2px;
    background: rgba(34,197,94,0.5);
    flex-shrink: 0;
  }
  
  .category-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'};
  }
  
  .category-count {
    font-size: 0.65rem;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'};
  }
  
  @media (max-width: 768px) {
    .category-name { font-size: 0.65rem; }
    .category-count { font-size: 0.55rem; }
  }
`;

const GamificationSection = ({ theme, userData, gamificationData: externalGamification }) => {
  const { translations } = useContext(LanguageContext);
  useContext(MediaQueryContext);
  const internalGamification = useGamification(userData);
  // Use externally provided gamification data if available, otherwise compute internally
  const gamification = externalGamification || internalGamification;
  const [activeTab, setActiveTab] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');

  const { badges = [], unlockedBadges = [], lockedBadges = [], stats, level, points = 0, nextLevelPoints = 1, categoryTranslations } = gamification || {};
  const progressPercentage = getLevelProgress(points, level);
  const levelColor = getLevelColor(level);

  const t = translations?.gamification || {};

  // Apply status filter
  const statusFiltered = activeTab === 'unlocked' 
    ? unlockedBadges 
    : activeTab === 'locked' 
      ? lockedBadges 
      : badges;

  // Apply category filter
  const displayedBadges = activeCategory === 'all'
    ? statusFiltered
    : statusFiltered.filter(b => b.category === activeCategory);

  // Group badges by category for grouped display (when showing all categories)
  const groupedBadges = useMemo(() => {
    if (activeCategory !== 'all') return null;
    const groups = {};
    for (const badge of displayedBadges) {
      if (!groups[badge.category]) groups[badge.category] = [];
      groups[badge.category].push(badge);
    }
    return groups;
  }, [displayedBadges, activeCategory]);

  // Category counts for chips
  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const badge of statusFiltered) {
      counts[badge.category] = (counts[badge.category] || 0) + 1;
    }
    return counts;
  }, [statusFiltered]);

  if (!userData) return null;

  return (
    <GamificationContainer theme={theme}>
      <SectionTitle theme={theme}>
        🏅 {t.title || 'I tuoi Traguardi'}
      </SectionTitle>

      {/* Level Progress */}
      <LevelBar theme={theme} $levelColor={levelColor}>
        <LevelCircle $levelColor={levelColor}>{level}</LevelCircle>
        <ProgressBarContainer>
          <ProgressText theme={theme}>
            <span>{t.level || 'Livello'} {level}</span>
            <span>{points} / {nextLevelPoints} {t.points || 'punti'}</span>
          </ProgressText>
          <ProgressBarTrack theme={theme}>
            <ProgressBarFill $progress={progressPercentage} $levelColor={levelColor} />
          </ProgressBarTrack>
        </ProgressBarContainer>
      </LevelBar>

      {/* Quick Stats */}
      <StatsRow>
        <StatCard theme={theme} $color="#22c55e">
          <div className="stat-value">{stats.unlockedCount}/{stats.totalBadges}</div>
          <div className="stat-label">{t.badgesUnlocked || 'Badge sbloccati'}</div>
        </StatCard>
        <StatCard theme={theme} $color={theme.warningColor}>
          <div className="stat-value">{stats.savingsStreak}</div>
          <div className="stat-label">{t.savingsStreak || 'Mesi risparmiato'}</div>
        </StatCard>
        <StatCard theme={theme} $color="#8b5cf6">
          <div className="stat-value">{stats.dataStreak}</div>
          <div className="stat-label">{t.dataStreak || 'Mesi consecutivi'}</div>
        </StatCard>
        <StatCard theme={theme} $color="#3b82f6">
          <div className="stat-value">{stats.activeAssets}</div>
          <div className="stat-label">{t.assetTypes || 'Tipi di asset'}</div>
        </StatCard>
      </StatsRow>

      {/* Badge Status Filter Tabs */}
      <TabContainer>
        <Tab theme={theme} $active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
          {t.all || 'Tutti'} ({badges.length})
        </Tab>
        <Tab theme={theme} $active={activeTab === 'unlocked'} onClick={() => setActiveTab('unlocked')}>
          ✅ {t.unlocked || 'Sbloccati'} ({unlockedBadges.length})
        </Tab>
        <Tab theme={theme} $active={activeTab === 'locked'} onClick={() => setActiveTab('locked')}>
          🔒 {t.locked || 'Da sbloccare'} ({lockedBadges.length})
        </Tab>
      </TabContainer>

      {/* Category Filter Chips */}
      <CategoryFilterRow theme={theme}>
        {BADGE_CATEGORY_ORDER.map(cat => {
          const count = categoryCounts[cat] || 0;
          if (count === 0) return null;
          return (
            <CategoryChip
              key={cat}
              theme={theme}
              $active={activeCategory === cat}
              onClick={() => setActiveCategory(prev => prev === cat ? 'all' : cat)}
            >
              {categoryTranslations?.[cat] || cat} ({count})
            </CategoryChip>
          );
        })}
      </CategoryFilterRow>

      {/* Badges - Single continuous grid, with inline category dividers */}
      <BadgesGrid>
        {activeCategory === 'all' && groupedBadges ? (
          BADGE_CATEGORY_ORDER.map((cat, catIdx) => {
            const catBadges = groupedBadges[cat];
            if (!catBadges || catBadges.length === 0) return null;
            const unlockedInCat = catBadges.filter(b => b.unlocked).length;
            const isFirst = BADGE_CATEGORY_ORDER.slice(0, catIdx).every(c => !groupedBadges[c]?.length);
            return [
              <CategoryDivider key={`div-${cat}`} theme={theme} $first={isFirst}>
                <span className="category-name">{categoryTranslations?.[cat] || cat}</span>
                <span className="category-count">{unlockedInCat}/{catBadges.length}</span>
              </CategoryDivider>,
              ...catBadges.map((badge) => (
                <BadgeCard key={badge.id} theme={theme} $unlocked={badge.unlocked}>
                  <div className="badge-icon">{badge.icon}</div>
                  <div className="badge-name">{badge.name}</div>
                  <div className="badge-desc">{badge.description}</div>
                </BadgeCard>
              ))
            ];
          })
        ) : (
          displayedBadges.map((badge) => (
            <BadgeCard key={badge.id} theme={theme} $unlocked={badge.unlocked}>
              <div className="badge-icon">{badge.icon}</div>
              <div className="badge-name">{badge.name}</div>
              <div className="badge-desc">{badge.description}</div>
            </BadgeCard>
          ))
        )}
      </BadgesGrid>

      {/* Completion message */}
      {stats.completionPercentage === 100 && (
        <div style={{
          textAlign: 'center',
          marginTop: '1rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))',
          borderRadius: '1rem',
          color: '#22c55e',
          fontWeight: '600',
        }}>
          🎉 {t.allBadgesUnlocked || 'Complimenti! Hai sbloccato tutti i badge!'}
        </div>
      )}
    </GamificationContainer>
  );
};

export default React.memo(GamificationSection);
