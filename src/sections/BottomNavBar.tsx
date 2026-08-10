import React, { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { BiTrendingUp } from 'react-icons/bi';
import { AiOutlineDotChart } from 'react-icons/ai';
import { BsBook, BsGraphUp, BsInfoCircle } from 'react-icons/bs';
import { FaBullseye } from 'react-icons/fa';
import { IoAdd, IoGridOutline } from 'react-icons/io5';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { removeLanguageFromPath } from '../utils/i18nRouting';

interface BottomNavBarProps {
  onQuickAdd: () => void;
}

export default function BottomNavBar({ onQuickAdd }: BottomNavBarProps) {
  const navigate = useLocalizedNavigate();
  const location = useLocation();
  const { theme } = useContext(ThemeContext);
  const { translations } = useContext(LanguageContext);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const currentPath = removeLanguageFromPath(location.pathname);
  const isActive = (path: string) => currentPath === path;

  const morePages = [
    { path: '/goals-limits', icon: <FaBullseye size={18} />, label: translations?.sidebar?.goalsShort || 'Obiettivi' },
    { path: '/market-prices', icon: <BsGraphUp size={20} />, label: translations?.sidebar?.marketPrices || 'Market Prices' },
    { path: '/knowledge', icon: <BsBook size={20} />, label: translations?.sidebar?.knowledge || 'Knowledge' },
    { path: '/settings', icon: <SettingsOutlinedIcon style={{ fontSize: 20 }} />, label: translations?.sidebar?.settings?.title || 'Settings' },
    { path: '/info', icon: <BsInfoCircle size={20} />, label: translations?.sidebar?.info || 'Info' },
  ];
  const isMoreActive = morePages.some((page) => isActive(page.path));

  const closeMenu = () => setShowMoreMenu(false);
  const navigateTo = (path: string) => {
    if (navigator.vibrate) navigator.vibrate(8);
    navigate(path);
    closeMenu();
  };

  useEffect(closeMenu, [location.pathname]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (showMoreMenu && target instanceof Element
        && !target.closest('.bottom-nav-bar') && !target.closest('.bottom-nav-popup')) closeMenu();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  const navItemStyle = (active: boolean) => ({
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center',
    flex: 1, gap: 2, height: '100%', padding: '6px 0', cursor: 'pointer', position: 'relative' as const,
    color: active ? theme.buttonBackgroundColor : (theme.mode === 'dark' ? '#9ca3af' : '#6b7280'),
    background: 'none', border: 'none', WebkitTapHighlightColor: 'transparent', transition: 'color 0.2s ease',
  });
  const labelStyle = (active: boolean) => ({
    fontSize: 10, fontWeight: active ? 650 : 450, lineHeight: 1, letterSpacing: '0.01em',
  });
  const activeMarker = <span style={{ position: 'absolute', top: 0, width: 22, height: 3, borderRadius: '0 0 4px 4px', background: theme.buttonBackgroundColor }} />;

  return createPortal(
    <>
      <style>{`@keyframes bottomNavPopupIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      {showMoreMenu && (
        <>
          <div data-testid="bottom-nav-backdrop" onClick={closeMenu} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }} />
          <div
            className="bottom-nav-popup"
            data-testid="bottom-nav-more-popup"
            style={{
              position: 'fixed', bottom: 'calc(66px + env(safe-area-inset-bottom, 0px) + 10px)',
              left: 12, right: 12, width: 'calc(100vw - 24px)', maxWidth: 240, margin: '0 auto',
              boxSizing: 'border-box', padding: 8, borderRadius: 18, zIndex: 10001,
              color: theme.textColor, background: theme.mode === 'dark' ? theme.backgroundColor : '#fff',
              border: `1px solid ${theme.mode === 'dark' ? `${theme.buttonBackgroundColor}30` : '#e2e8f0'}`,
              boxShadow: theme.mode === 'dark' ? '0 -8px 30px rgba(0,0,0,.4)' : '0 -8px 30px rgba(0,0,0,.12)',
              animation: 'bottomNavPopupIn .18s ease-out',
            }}
          >
            {morePages.map((page) => {
              const active = isActive(page.path);
              return (
                <button
                  type="button"
                  key={page.path}
                  onClick={() => navigateTo(page.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px',
                    border: 0, borderRadius: 12, cursor: 'pointer', textAlign: 'left', fontSize: 14,
                    fontWeight: active ? 650 : 450, color: active ? '#fff' : theme.textColor,
                    background: active ? theme.buttonBackgroundColor : 'transparent',
                  }}
                >
                  <span style={{ display: 'flex', opacity: active ? 1 : 0.72 }}>{page.icon}</span>
                  {page.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      <nav
        className="bottom-nav-bar"
        aria-label={translations?.sidebar?.mobileNavigation || 'Main navigation'}
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 9999,
          height: 'calc(66px + env(safe-area-inset-bottom, 0px))', paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          display: 'flex', alignItems: 'center', background: theme.mode === 'dark' ? theme.backgroundColor : '#fff',
          borderTop: `1px solid ${theme.mode === 'dark' ? `${theme.buttonBackgroundColor}20` : '#e2e8f0'}`,
          boxShadow: theme.mode === 'dark' ? '0 -2px 20px rgba(0,0,0,.3)' : '0 -2px 20px rgba(0,0,0,.06)',
        }}
      >
        <button type="button" style={navItemStyle(isActive('/dashboard'))} onClick={() => navigateTo('/dashboard')}>
          {isActive('/dashboard') && activeMarker}<BiTrendingUp size={22} />
          <span style={labelStyle(isActive('/dashboard'))}>{translations?.sidebar?.dashboard || 'Dashboard'}</span>
        </button>
        <button type="button" style={navItemStyle(isActive('/charts-statistics'))} onClick={() => navigateTo('/charts-statistics')}>
          {isActive('/charts-statistics') && activeMarker}<AiOutlineDotChart size={22} />
          <span style={labelStyle(isActive('/charts-statistics'))}>{translations?.sidebar?.statisticsShort || 'Statistiche'}</span>
        </button>
        <button
          type="button"
          aria-label={translations?.dashboard?.quickAdd?.title || 'Quick add'}
          data-umami-event="bottom-nav-quick-add"
          onClick={() => { if (navigator.vibrate) navigator.vibrate(8); closeMenu(); onQuickAdd(); }}
          style={{
            alignSelf: 'flex-start', width: 54, height: 54, flexShrink: 0, margin: '-16px 5px 0',
            borderRadius: '50%', border: `5px solid ${theme.mode === 'dark' ? theme.backgroundColor : '#fff'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff',
            background: `linear-gradient(135deg, ${theme.buttonBackgroundColor}, ${theme.buttonBackgroundColor}cc)`,
            boxShadow: `0 7px 20px ${theme.buttonBackgroundColor}55`, WebkitTapHighlightColor: 'transparent',
          }}
        >
          <IoAdd size={29} />
        </button>
        <button type="button" style={navItemStyle(isActive('/comparison'))} onClick={() => navigateTo('/comparison')}>
          {isActive('/comparison') && activeMarker}<CompareArrowsIcon style={{ fontSize: 22 }} />
          <span style={labelStyle(isActive('/comparison'))}>{translations?.sidebar?.comparison || 'Comparison'}</span>
        </button>
        <button type="button" style={navItemStyle(isMoreActive || showMoreMenu)} onClick={() => { if (navigator.vibrate) navigator.vibrate(8); setShowMoreMenu((open) => !open); }}>
          {isMoreActive && activeMarker}<IoGridOutline size={22} />
          <span style={labelStyle(isMoreActive || showMoreMenu)}>{translations?.sidebar?.more || 'More'}</span>
        </button>
      </nav>
    </>,
    document.body,
  );
}
