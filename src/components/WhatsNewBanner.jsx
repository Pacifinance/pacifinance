/**
 * WhatsNewBanner — Shows recent updates from the roadmap to keep users informed.
 * Dismissible and stored per-version in localStorage.
 * Reads completed items from roadmapData.js and displays the most recent ones.
 */
import React, { useState, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import roadmapData from '../data/roadmapData';
import CloseIcon from '@mui/icons-material/Close';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import { LocalizedLink } from './LocalizedLink';

const STORAGE_KEY = 'pacifinance-whats-new-dismissed';

// How many months back to show completed items
const MONTHS_LOOKBACK = 3;

const BannerContainer = styled.div`
  background: ${p => p.theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(7, 145, 100, 0.12) 0%, rgba(7, 145, 100, 0.04) 100%)'
    : 'linear-gradient(135deg, rgba(7, 145, 100, 0.08) 0%, rgba(7, 145, 100, 0.02) 100%)'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(7, 145, 100, 0.25)' : 'rgba(7, 145, 100, 0.2)'};
  border-radius: 16px;
  padding: 1rem 1.2rem;
  margin-bottom: 1rem;
  position: relative;
  animation: fadeSlideIn 0.3s ease-out;

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const BannerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
`;

const BannerTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: ${p => p.theme.textColor};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${p => p.theme.textColor};
  opacity: 0.5;
  padding: 4px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  transition: all 0.15s ease;

  &:hover {
    opacity: 1;
    background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
  }
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: ${p => p.theme.textColor};
  opacity: 0.85;
  line-height: 1.4;
`;

const ItemIcon = styled.span`
  font-size: 1rem;
  flex-shrink: 0;
`;

const RoadmapLink = styled.span`
  display: block;
  margin-top: 0.6rem;
  font-size: 0.8rem;

  a {
    color: #079164;
    text-decoration: none;
    font-weight: 500;
    &:hover { text-decoration: underline; }
  }
`;

/**
 * Get the current version signature from recent completed items.
 * Used to show the banner again when new items are completed.
 */
const getVersionSignature = (items) => {
  return items.map(i => i.id).sort().join(',');
};

/**
 * Filter roadmap items completed in the last N months
 */
const getRecentItems = () => {
  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() - MONTHS_LOOKBACK, 1);
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}`;

  return roadmapData
    .filter(item => item.status === 'completed' && item.completedDate && item.completedDate >= cutoffStr)
    .sort((a, b) => (b.completedDate || '').localeCompare(a.completedDate || ''));
};

const WhatsNewBanner = () => {
  const { theme } = useContext(ThemeContext);
  const { language, translations } = useContext(LanguageContext);
  const t = translations?.whatsNew || {};

  const recentItems = useMemo(() => getRecentItems(), []);
  const versionSig = useMemo(() => getVersionSignature(recentItems), [recentItems]);

  const [dismissed, setDismissed] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === versionSig;
    } catch {
      return false;
    }
  });

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, versionSig);
    } catch { /* ignore */ }
  };

  // Don't show if no recent items or already dismissed
  if (recentItems.length === 0 || dismissed) return null;

  return (
    <BannerContainer theme={theme}>
      <BannerHeader>
        <BannerTitle theme={theme}>
          <NewReleasesIcon style={{ color: '#079164', fontSize: 20 }} />
          {t.title || "What's New"}
        </BannerTitle>
        <CloseButton theme={theme} onClick={handleDismiss} aria-label="Dismiss">
          <CloseIcon style={{ fontSize: 18 }} />
        </CloseButton>
      </BannerHeader>

      <ItemList>
        {recentItems.map(item => (
          <Item key={item.id} theme={theme}>
            <ItemIcon>{item.icon}</ItemIcon>
            <span>
              <strong>{item.title[language] || item.title.en}</strong>
              {' — '}
              {item.description[language] || item.description.en}
            </span>
          </Item>
        ))}
      </ItemList>

      <RoadmapLink>
        <LocalizedLink to="/roadmap" data-umami-event="whats-new-roadmap-link">
          {t.viewRoadmap || 'View full roadmap →'}
        </LocalizedLink>
      </RoadmapLink>
    </BannerContainer>
  );
};

export default WhatsNewBanner;
