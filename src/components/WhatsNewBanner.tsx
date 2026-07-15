/**
 * WhatsNewBanner — Inline notification icon for the DashboardToolbar.
 *
 * Behaviour:
 * - Renders as a single icon button that sits alongside Compact / Customize.
 * - A red notification badge pulses when there are unseen updates.
 * - Clicking opens a dropdown panel anchored to the button (top-right).
 * - Closing the panel marks updates as "seen" (badge disappears).
 * - Always re-openable to review news or jump to the roadmap.
 */
import React, { useState, useContext, useMemo, useCallback, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import roadmapData from '../data/roadmapData';
import CloseIcon from '@mui/icons-material/Close';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import { LocalizedLink } from './LocalizedLink';

const STORAGE_KEY = 'pacifinance-whats-new-seen';
const MONTHS_LOOKBACK = 3;

/* ── Animations ───────────────────────────────────────────── */

const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(-6px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.18); }
`;

/* ── Styled Components ────────────────────────────────────── */

const Wrapper = styled.div`
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
`;

const IconBtn = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.75rem;
  border-radius: 0.6rem;
  border: 1px solid ${p =>
    p.$active
      ? `${p.theme.buttonBackgroundColor}70`
      : `${p.theme.buttonBackgroundColor}28`};
  background: ${p =>
    p.$active
      ? `${p.theme.buttonBackgroundColor}28`
      : `${p.theme.buttonBackgroundColor}0d`};
  color: ${p => p.$active ? p.theme.buttonBackgroundColor : p.theme.textColor};
  font-size: 0.8rem;
  font-weight: ${p => p.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${p => p.theme.buttonBackgroundColor}20;
    border-color: ${p => p.theme.buttonBackgroundColor}55;
  }

  svg { font-size: 1rem; }

  @media (max-width: 768px) {
    padding: 0.35rem 0.5rem;
    font-size: 0.7rem;
    svg { font-size: 0.9rem; }
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #e74c3c;
  border: 2px solid ${p => p.theme.mode === 'dark' ? '#1a1a2e' : '#fff'};
  animation: ${pulse} 2s ease-in-out infinite;
  pointer-events: none;
`;

const DropdownOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 12000;
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 340px;
  max-height: 70vh;
  overflow-y: auto;
  background: ${p => p.theme.mode === 'dark' ? '#1e293b' : '#ffffff'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  border-radius: 14px;
  padding: 1rem 1.1rem;
  z-index: 12001;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  animation: ${fadeSlideIn} 0.2s ease-out;

  @media (max-width: 768px) {
    width: 290px;
    right: -0.5rem;
    padding: 0.8rem 0.9rem;
  }
`;

const DropdownHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.7rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
`;

const DropdownTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-weight: 600;
  font-size: 0.9rem;
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
  gap: 0.45rem;
`;

const Item = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  font-size: 0.82rem;
  color: ${p => p.theme.textColor};
  opacity: 0.85;
  line-height: 1.45;
`;

const ItemIcon = styled.span`
  font-size: 0.95rem;
  flex-shrink: 0;
  margin-top: 1px;
`;

const RoadmapLink = styled.span`
  display: block;
  margin-top: 0.7rem;
  padding-top: 0.5rem;
  border-top: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
  font-size: 0.8rem;

  a {
    color: #079164;
    text-decoration: none;
    font-weight: 500;
    &:hover { text-decoration: underline; }
  }
`;

/* ── Helpers ──────────────────────────────────────────────── */

const getVersionSignature = (items) =>
  items.map(i => i.id).sort().join(',');

const getRecentItems = () => {
  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() - MONTHS_LOOKBACK, 1);
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}`;

  return roadmapData
    .filter(item => item.status === 'completed' && item.completedDate && item.completedDate >= cutoffStr)
    .sort((a, b) => (b.completedDate || '').localeCompare(a.completedDate || ''));
};

/* ── Component ───────────────────────────────────────────── */

const WhatsNewBanner = () => {
  const { theme } = useContext(ThemeContext);
  const { language, translations } = useContext(LanguageContext);
  const t = translations?.whatsNew || {};
  const wrapperRef = useRef(null);

  const recentItems = useMemo(() => getRecentItems(), []);
  const versionSig = useMemo(() => getVersionSignature(recentItems), [recentItems]);

  const [seen, setSeen] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === versionSig;
    } catch {
      return false;
    }
  });

  const [open, setOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    if (!seen) {
      setSeen(true);
      try {
        localStorage.setItem(STORAGE_KEY, versionSig);
      } catch { /* ignore */ }
    }
  }, [seen, versionSig]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  if (recentItems.length === 0) return null;

  const hasNotification = !seen;

  return (
    <Wrapper ref={wrapperRef}>
      <IconBtn
        theme={theme}
        $active={open}
        onClick={handleToggle}
        aria-label={t.title || "What's New"}
        data-umami-event="whats-new-toggle"
      >
        <NewReleasesIcon style={{ color: open ? '#22c55e' : '#079164', fontSize: 18 }} />
        {hasNotification && <Badge theme={theme} />}
      </IconBtn>

      {open && (
        <>
          <DropdownOverlay onClick={handleClose} />
          <Dropdown theme={theme}>
            <DropdownHeader theme={theme}>
              <DropdownTitle theme={theme}>
                <NewReleasesIcon style={{ color: '#079164', fontSize: 18 }} />
                {t.title || "What's New"}
              </DropdownTitle>
              <CloseButton theme={theme} onClick={handleClose} aria-label="Close">
                <CloseIcon style={{ fontSize: 16 }} />
              </CloseButton>
            </DropdownHeader>

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

            <RoadmapLink theme={theme}>
              <LocalizedLink to="/roadmap" data-umami-event="whats-new-roadmap-link" onClick={handleClose}>
                {t.viewRoadmap || 'View full roadmap →'}
              </LocalizedLink>
            </RoadmapLink>
          </Dropdown>
        </>
      )}
    </Wrapper>
  );
};

export default WhatsNewBanner;
