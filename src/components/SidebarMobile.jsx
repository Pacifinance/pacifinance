
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSignOutAlt, faUserCog } from '@fortawesome/free-solid-svg-icons';
import { FaBullseye, FaUser } from 'react-icons/fa';
import avatarImage from '../assets/account-logo.png';
import languages from '../data/languages.json';
import { DropdownContainer } from '../styles/MyStyled';

const SidebarMobile = ({
    theme,
    language,
    isSideBarMenuOpen,
    setIsSideBarMenuOpen,
    showDropdown,
    setShowDropdown,
    handleLogout
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Guardia per verificare che il theme sia disponibile
    if (!theme) {
        return null;
    }

    // Funzione per verificare se una pagina è attiva
    const isActivePage = (path) => {
        return location.pathname === path;
    };

    const HamburgerMenu = () => (
        <div onClick={() => setIsSideBarMenuOpen(false)}>
            <div
                className={`hamburger-menu ${isSideBarMenuOpen ? "open" : ""} cursor-pointer flex flex-col`}
                style={{
                    zIndex: 10000,
                    backgroundColor: theme.buttonBackgroundColor,
                    borderRadius: "8px",
                    color: "white",
                    padding: '10px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    // Chiudi l'account dropdown se aperto
                    if (showDropdown) {
                        setShowDropdown(false);
                    }
                    setIsSideBarMenuOpen(!isSideBarMenuOpen);
                }}
            >
                <FontAwesomeIcon
                    icon={faBars}
                />
            </div>
            {isSideBarMenuOpen ? (
                <div
                    className={`hamburger-menu-dropdown fixed top-14 right-4 flex flex-col shadow-lg border`}
                    style={{
                        zIndex: 10001,
                        backgroundColor: theme.backgroundColor,
                        borderRadius: "12px",
                        padding: "12px",
                        minWidth: "200px",
                        border: `2px solid ${theme.buttonBackgroundColor}`,
                        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                    }}
                >
                    <button
                        className="text-left p-3 rounded-md mb-1 transition-all duration-200 hover:scale-105"
                        style={{
                            color: isActivePage("/dashboard") ? "white" : theme.textColor,
                            backgroundColor: isActivePage("/dashboard") ? theme.buttonBackgroundColor : "transparent",
                            border: "none",
                            fontWeight: isActivePage("/dashboard") ? "600" : "normal",
                        }}
                        onMouseEnter={(e) => {
                            if (!isActivePage("/dashboard")) {
                                e.target.style.backgroundColor = theme.buttonBackgroundColor;
                                e.target.style.color = "white";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActivePage("/dashboard")) {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = theme.textColor;
                            }
                        }}
                        onClick={() => {
                            navigate("/dashboard");
                            setIsSideBarMenuOpen(false);
                        }}
                    >
                        Dashboard
                    </button>
                    <button
                        className="text-left p-3 rounded-md mb-1 transition-all duration-200 hover:scale-105"
                        style={{
                            color: isActivePage("/charts-statistics") ? "white" : theme.textColor,
                            backgroundColor: isActivePage("/charts-statistics") ? theme.buttonBackgroundColor : "transparent",
                            border: "none",
                            fontWeight: isActivePage("/charts-statistics") ? "600" : "normal",
                        }}
                        onMouseEnter={(e) => {
                            if (!isActivePage("/charts-statistics")) {
                                e.target.style.backgroundColor = theme.buttonBackgroundColor;
                                e.target.style.color = "white";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActivePage("/charts-statistics")) {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = theme.textColor;
                            }
                        }}
                        onClick={() => {
                            navigate("/charts-statistics");
                            setIsSideBarMenuOpen(false);
                        }}
                    >
                        {languages[language].sidebar.chartsStatistics}
                    </button>
                    <button
                        className="text-left p-3 rounded-md mb-1 transition-all duration-200 hover:scale-105"
                        style={{
                            color: isActivePage("/insert-values") ? "white" : theme.textColor,
                            backgroundColor: isActivePage("/insert-values") ? theme.buttonBackgroundColor : "transparent",
                            border: "none",
                            fontWeight: isActivePage("/insert-values") ? "600" : "normal",
                        }}
                        onMouseEnter={(e) => {
                            if (!isActivePage("/insert-values")) {
                                e.target.style.backgroundColor = theme.buttonBackgroundColor;
                                e.target.style.color = "white";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActivePage("/insert-values")) {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = theme.textColor;
                            }
                        }}
                        onClick={() => {
                            navigate("/insert-values");
                            setIsSideBarMenuOpen(false);
                        }}
                    >
                        {languages[language].sidebar.insert}
                    </button>
                    <button
                        className="text-left p-3 rounded-md mb-1 transition-all duration-200 hover:scale-105"
                        style={{
                            color: isActivePage("/check-prices") ? "white" : theme.textColor,
                            backgroundColor: isActivePage("/check-prices") ? theme.buttonBackgroundColor : "transparent",
                            border: "none",
                            fontWeight: isActivePage("/check-prices") ? "600" : "normal",
                        }}
                        onMouseEnter={(e) => {
                            if (!isActivePage("/check-prices")) {
                                e.target.style.backgroundColor = theme.buttonBackgroundColor;
                                e.target.style.color = "white";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActivePage("/check-prices")) {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = theme.textColor;
                            }
                        }}
                        onClick={() => {
                            navigate("/check-prices");
                            setIsSideBarMenuOpen(false);
                        }}
                    >
                        {languages[language].sidebar.check}
                    </button>
                    <button
                        className="text-left p-3 rounded-md mb-1 transition-all duration-200 hover:scale-105"
                        style={{
                            color: isActivePage("/comparison") ? "white" : theme.textColor,
                            backgroundColor: isActivePage("/comparison") ? theme.buttonBackgroundColor : "transparent",
                            border: "none",
                            fontWeight: isActivePage("/comparison") ? "600" : "normal",
                        }}
                        onMouseEnter={(e) => {
                            if (!isActivePage("/comparison")) {
                                e.target.style.backgroundColor = theme.buttonBackgroundColor;
                                e.target.style.color = "white";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActivePage("/comparison")) {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = theme.textColor;
                            }
                        }}
                        onClick={() => {
                            navigate("/comparison");
                            setIsSideBarMenuOpen(false);
                        }}
                    >
                        {languages[language].sidebar.comparison}
                    </button>
                    <button
                        className="text-left p-3 rounded-md mb-1 transition-all duration-200 hover:scale-105"
                        style={{
                            color: isActivePage("/knowledge") ? "white" : theme.textColor,
                            backgroundColor: isActivePage("/knowledge") ? theme.buttonBackgroundColor : "transparent",
                            border: "none",
                            fontWeight: isActivePage("/knowledge") ? "600" : "normal",
                        }}
                        onMouseEnter={(e) => {
                            if (!isActivePage("/knowledge")) {
                                e.target.style.backgroundColor = theme.buttonBackgroundColor;
                                e.target.style.color = "white";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActivePage("/knowledge")) {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = theme.textColor;
                            }
                        }}
                        onClick={() => {
                            navigate("/knowledge");
                            setIsSideBarMenuOpen(false);
                        }}
                    >
                        {languages[language].sidebar.knowledge}
                    </button>
                    <button
                        className="text-left p-3 rounded-md transition-all duration-200 hover:scale-105"
                        style={{
                            color: isActivePage("/info") ? "white" : theme.textColor,
                            backgroundColor: isActivePage("/info") ? theme.buttonBackgroundColor : "transparent",
                            border: "none",
                            fontWeight: isActivePage("/info") ? "600" : "normal",
                        }}
                        onMouseEnter={(e) => {
                            if (!isActivePage("/info")) {
                                e.target.style.backgroundColor = theme.buttonBackgroundColor;
                                e.target.style.color = "white";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActivePage("/info")) {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = theme.textColor;
                            }
                        }}
                        onClick={() => {
                            navigate("/info");
                            setIsSideBarMenuOpen(false);
                        }}
                    >
                        {languages[language].sidebar.info}
                    </button>
                </div>
            ) : null}
        </div>
    );

    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.2rem',
            height: '48px' // Ensure consistent height for proper alignment
        }}>
            <div className="account-container">
                <div className="account-image-wrapper" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white',
                    border: `2px solid ${theme.buttonBackgroundColor}`,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                }}>
                    <img
                        src={avatarImage}
                        title={languages[language].sidebar.account.title}
                        width="100%"
                        height="100%"
                        alt="Account"
                        className="account-image"
                        onClick={() => {
                            // Chiudi l'hamburger menu se aperto
                            if (isSideBarMenuOpen) {
                                setIsSideBarMenuOpen(false);
                            }
                            setShowDropdown(!showDropdown);
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                        style={{
                            borderRadius: '50%',
                            cursor: 'pointer',
                            objectFit: 'cover'
                        }}
                    />
                </div>
            </div>
            <DropdownContainer theme={theme}>
                {showDropdown && (
                    <div
                        className="dropdown-menu"
                        style={{
                            position: 'fixed',
                            top: '70px',
                            right: '60px',
                            backgroundColor: theme.backgroundColor,
                            borderRadius: '12px',
                            padding: '12px',
                            minWidth: '200px',
                            border: `2px solid ${theme.buttonBackgroundColor}`,
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                            zIndex: 10002,
                        }}
                    >
                        <button
                            className="text-left p-2 rounded-md mb-1 transition-all duration-200 hover:scale-105 w-full flex items-center gap-2 text-sm"
                            style={{
                                color: isActivePage("/profile") ? "white" : theme.textColor,
                                backgroundColor: isActivePage("/profile") ? theme.buttonBackgroundColor : "transparent",
                                border: "none",
                                fontWeight: isActivePage("/profile") ? "600" : "normal",
                            }}
                            onMouseEnter={(e) => {
                                if (!isActivePage("/profile")) {
                                    e.target.style.backgroundColor = theme.buttonBackgroundColor;
                                    e.target.style.color = "white";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActivePage("/profile")) {
                                    e.target.style.backgroundColor = "transparent";
                                    e.target.style.color = theme.textColor;
                                }
                            }}
                            onClick={() => {
                                navigate("/profile");
                                setShowDropdown(false);
                            }}
                        >
                            <FaUser size={14} />
                            {languages[language].sidebar.account.title}
                        </button>
                        <button
                            className="text-left p-2 rounded-md mb-1 transition-all duration-200 hover:scale-105 w-full flex items-center gap-2 text-sm"
                            style={{
                                color: isActivePage("/goals-limits") ? "white" : theme.textColor,
                                backgroundColor: isActivePage("/goals-limits") ? theme.buttonBackgroundColor : "transparent",
                                border: "none",
                                fontWeight: isActivePage("/goals-limits") ? "600" : "normal",
                            }}
                            onMouseEnter={(e) => {
                                if (!isActivePage("/goals-limits")) {
                                    e.target.style.backgroundColor = theme.buttonBackgroundColor;
                                    e.target.style.color = "white";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActivePage("/goals-limits")) {
                                    e.target.style.backgroundColor = "transparent";
                                    e.target.style.color = theme.textColor;
                                }
                            }}
                            onClick={() => {
                                navigate("/goals-limits");
                                setShowDropdown(false);
                            }}
                        >
                            <FaBullseye size={14} />
                            Goals and limits
                        </button>
                        <button
                            className="text-left p-2 rounded-md mb-1 transition-all duration-200 hover:scale-105 w-full flex items-center gap-2 text-sm"
                            style={{
                                color: isActivePage("/settings") ? "white" : theme.textColor,
                                backgroundColor: isActivePage("/settings") ? theme.buttonBackgroundColor : "transparent",
                                border: "none",
                                fontWeight: isActivePage("/settings") ? "600" : "normal",
                            }}
                            onMouseEnter={(e) => {
                                if (!isActivePage("/settings")) {
                                    e.target.style.backgroundColor = theme.buttonBackgroundColor;
                                    e.target.style.color = "white";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActivePage("/settings")) {
                                    e.target.style.backgroundColor = "transparent";
                                    e.target.style.color = theme.textColor;
                                }
                            }}
                            onClick={() => {
                                navigate("/settings");
                                setShowDropdown(false);
                            }}
                        >
                            <FontAwesomeIcon icon={faUserCog} size="sm" />
                            {languages[language].sidebar.settings.title}
                        </button>
                        <button
                            data-umami-event="logoutButton"
                            className="text-left p-2 rounded-md transition-all duration-200 hover:scale-105 w-full flex items-center gap-2 text-sm"
                            style={{
                                color: "#dc2626", // Rosso elegante
                                backgroundColor: "rgba(220, 38, 38, 0.05)", // Sfondo rosso molto leggero
                                border: "1px solid rgba(220, 38, 38, 0.2)",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#dc2626";
                                e.target.style.color = "white";
                                e.target.style.borderColor = "#dc2626";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "rgba(220, 38, 38, 0.05)";
                                e.target.style.color = "#dc2626";
                                e.target.style.borderColor = "rgba(220, 38, 38, 0.2)";
                            }}
                            onClick={handleLogout}
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            {languages[language].sidebar.logout}
                        </button>
                    </div>
                )}
            </DropdownContainer>
            <HamburgerMenu />
        </div>
    );
};

export default SidebarMobile;
