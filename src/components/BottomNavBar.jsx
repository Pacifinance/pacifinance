import React, { useState, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { removeLanguageFromPath } from '../utils/i18nRouting';
import { BiTrendingUp } from 'react-icons/bi';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { AiOutlineDotChart } from 'react-icons/ai';
import { BsBook, BsInfoCircle } from 'react-icons/bs';
import { FaUser, FaBullseye } from 'react-icons/fa';
import { IoGridOutline } from 'react-icons/io5';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserCog } from '@fortawesome/free-solid-svg-icons';

const BottomNavBar = ({ handleLogout }) => {
    const navigate = useLocalizedNavigate();
    const location = useLocation();
    const { theme } = useContext(ThemeContext);
    const { translations } = useContext(LanguageContext);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);

    const currentPath = removeLanguageFromPath(location.pathname);

    const isActive = (path) => currentPath === path;

    const closeMenus = () => {
        setShowMoreMenu(false);
        setShowAccountMenu(false);
    };

    const navigateTo = (path) => {
        navigate(path);
        closeMenus();
    };

    // Close menus on route change
    useEffect(() => {
        closeMenus();
    }, [location.pathname]);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                (showMoreMenu || showAccountMenu) &&
                !event.target.closest('.bottom-nav-bar') &&
                !event.target.closest('.bottom-nav-popup')
            ) {
                closeMenus();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMoreMenu, showAccountMenu]);

    const morePages = [
        { path: '/charts-statistics', icon: <AiOutlineDotChart size={20} />, label: translations?.sidebar?.chartsStatistics || 'Charts' },
        { path: '/comparison', icon: <CompareArrowsIcon style={{ fontSize: 20 }} />, label: translations?.sidebar?.comparison || 'Comparison' },
        { path: '/knowledge', icon: <BsBook size={20} />, label: translations?.sidebar?.knowledge || 'Knowledge' },
        { path: '/info', icon: <BsInfoCircle size={20} />, label: translations?.sidebar?.info || 'Info' },
    ];

    const accountPages = [
        { path: '/profile', icon: <FaUser size={16} />, label: translations?.sidebar?.account?.title || 'Profile' },
        { path: '/goals-limits', icon: <FaBullseye size={16} />, label: translations?.sidebar?.goalsLimits || 'Goals & Limits' },
        { path: '/settings', icon: <FontAwesomeIcon icon={faUserCog} />, label: translations?.sidebar?.settings?.title || 'Settings' },
    ];

    const isMoreActive = morePages.some(p => isActive(p.path));
    const isAccountActive = accountPages.some(p => isActive(p.path));

    const NAV_HEIGHT = 60;
    const SAFE_AREA = 'env(safe-area-inset-bottom, 0px)';

    const navItemStyle = (active) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: '2px',
        padding: '6px 0',
        cursor: 'pointer',
        color: active ? theme.buttonBackgroundColor : (theme.mode === 'dark' ? '#9ca3af' : '#6b7280'),
        transition: 'all 0.2s ease',
        position: 'relative',
        background: 'none',
        border: 'none',
        WebkitTapHighlightColor: 'transparent',
    });

    const navLabelStyle = (active) => ({
        fontSize: '10px',
        fontWeight: active ? '600' : '400',
        lineHeight: '1',
        letterSpacing: '0.01em',
    });

    const popupMenuStyle = {
        position: 'fixed',
        bottom: `calc(${NAV_HEIGHT}px + ${SAFE_AREA} + 8px)`,
        backgroundColor: theme.mode === 'dark' ? theme.backgroundColor : '#ffffff',
        borderRadius: '16px',
        padding: '8px',
        minWidth: '200px',
        border: `1px solid ${theme.mode === 'dark' ? theme.buttonBackgroundColor + '30' : '#e2e8f0'}`,
        boxShadow: theme.mode === 'dark'
            ? '0 -8px 30px rgba(0, 0, 0, 0.4)'
            : '0 -8px 30px rgba(0, 0, 0, 0.12)',
        zIndex: 10001,
        animation: 'slideUp 0.2s ease-out',
    };

    const popupItemStyle = (active) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '12px',
        border: 'none',
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: active ? '600' : '400',
        color: active ? '#ffffff' : theme.textColor,
        backgroundColor: active ? theme.buttonBackgroundColor : 'transparent',
        transition: 'all 0.15s ease',
    });

    return createPortal(
        <>
            {/* CSS animation for popup */}
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Backdrop overlay */}
            {(showMoreMenu || showAccountMenu) && (
                <div
                    data-testid="bottom-nav-backdrop"
                    onClick={closeMenus}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                        zIndex: 9998,
                        backdropFilter: 'blur(2px)',
                    }}
                />
            )}

            {/* More Menu Popup */}
            {showMoreMenu && (
                <div
                    className="bottom-nav-popup"
                    style={{
                        ...popupMenuStyle,
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}
                >
                    {morePages.map((page) => (
                        <button
                            key={page.path}
                            style={popupItemStyle(isActive(page.path))}
                            onMouseEnter={(e) => {
                                if (!isActive(page.path)) {
                                    e.currentTarget.style.backgroundColor = theme.mode === 'dark'
                                        ? `${theme.buttonBackgroundColor}15`
                                        : '#f1f5f9';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive(page.path)) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                            onClick={() => navigateTo(page.path)}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', opacity: isActive(page.path) ? 1 : 0.75 }}>
                                {page.icon}
                            </span>
                            {page.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Account Menu Popup */}
            {showAccountMenu && (
                <div
                    className="bottom-nav-popup"
                    style={{
                        ...popupMenuStyle,
                        right: '8px',
                    }}
                >
                    {accountPages.map((page) => (
                        <button
                            key={page.path}
                            style={popupItemStyle(isActive(page.path))}
                            onMouseEnter={(e) => {
                                if (!isActive(page.path)) {
                                    e.currentTarget.style.backgroundColor = theme.mode === 'dark'
                                        ? `${theme.buttonBackgroundColor}15`
                                        : '#f1f5f9';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive(page.path)) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                            onClick={() => navigateTo(page.path)}
                        >
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                {page.icon}
                            </span>
                            {page.label}
                        </button>
                    ))}
                    {/* Separator */}
                    <div style={{
                        height: '1px',
                        backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                        margin: '4px 8px',
                    }} />
                    {/* Logout */}
                    <button
                        data-umami-event="logoutButton-mobile"
                        style={{
                            ...popupItemStyle(false),
                            color: '#dc2626',
                            backgroundColor: 'rgba(220, 38, 38, 0.05)',
                            border: '1px solid rgba(220, 38, 38, 0.15)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                            e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.05)';
                            e.currentTarget.style.color = '#dc2626';
                        }}
                        onClick={handleLogout}
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        {translations?.sidebar?.logout || 'Logout'}
                    </button>
                </div>
            )}

            {/* Bottom Navigation Bar */}
            <nav
                className="bottom-nav-bar"
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `calc(${NAV_HEIGHT}px + ${SAFE_AREA})`,
                    paddingBottom: SAFE_AREA,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    backgroundColor: theme.mode === 'dark'
                        ? theme.backgroundColor
                        : '#ffffff',
                    borderTop: `1px solid ${theme.mode === 'dark' ? theme.buttonBackgroundColor + '20' : '#e2e8f0'}`,
                    boxShadow: theme.mode === 'dark'
                        ? '0 -2px 20px rgba(0, 0, 0, 0.3)'
                        : '0 -2px 20px rgba(0, 0, 0, 0.06)',
                    zIndex: 9999,
                }}
            >
                {/* Dashboard */}
                <button
                    style={navItemStyle(isActive('/dashboard'))}
                    onClick={() => navigateTo('/dashboard')}
                >
                    {isActive('/dashboard') && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '20px',
                            height: '3px',
                            borderRadius: '0 0 3px 3px',
                            backgroundColor: theme.buttonBackgroundColor,
                        }} />
                    )}
                    <BiTrendingUp size={22} />
                    <span style={navLabelStyle(isActive('/dashboard'))}>Dashboard</span>
                </button>

                {/* Insert Values */}
                <button
                    style={navItemStyle(isActive('/insert-values'))}
                    onClick={() => navigateTo('/insert-values')}
                >
                    {isActive('/insert-values') && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '20px',
                            height: '3px',
                            borderRadius: '0 0 3px 3px',
                            backgroundColor: theme.buttonBackgroundColor,
                        }} />
                    )}
                    <HiOutlinePencilAlt size={22} />
                    <span style={navLabelStyle(isActive('/insert-values'))}>
                        {translations?.sidebar?.insert || 'Insert'}
                    </span>
                </button>

                {/* More */}
                <button
                    style={navItemStyle(isMoreActive || showMoreMenu)}
                    onClick={() => {
                        setShowAccountMenu(false);
                        setShowMoreMenu(!showMoreMenu);
                    }}
                >
                    {isMoreActive && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '20px',
                            height: '3px',
                            borderRadius: '0 0 3px 3px',
                            backgroundColor: theme.buttonBackgroundColor,
                        }} />
                    )}
                    <IoGridOutline size={22} />
                    <span style={navLabelStyle(isMoreActive || showMoreMenu)}>
                        {translations?.sidebar?.more || 'More'}
                    </span>
                </button>

                {/* Account */}
                <button
                    style={navItemStyle(isAccountActive || showAccountMenu)}
                    onClick={() => {
                        setShowMoreMenu(false);
                        setShowAccountMenu(!showAccountMenu);
                    }}
                >
                    {isAccountActive && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '20px',
                            height: '3px',
                            borderRadius: '0 0 3px 3px',
                            backgroundColor: theme.buttonBackgroundColor,
                        }} />
                    )}
                    <FaUser size={20} />
                    <span style={navLabelStyle(isAccountActive || showAccountMenu)}>Account</span>
                </button>
            </nav>
        </>,
        document.body
    );
};

export default BottomNavBar;
