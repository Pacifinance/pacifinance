
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
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

    const HamburgerMenu = () => (
        <div onClick={() => setIsSideBarMenuOpen(false)}>
            <div
                className={`hamburger-menu ${isSideBarMenuOpen ? "open" : ""} cursor-pointer p-2 ml-4 absolute top-3 right-4 flex flex-col`}
                style={{
                    zIndex: 10000,
                    backgroundColor: theme.buttonBackgroundColor,
                    borderRadius: "8px",
                    color: "white",
                }}
            >
                <FontAwesomeIcon
                    icon={faBars}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsSideBarMenuOpen(!isSideBarMenuOpen);
                    }}
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
                            color: theme.textColor,
                            backgroundColor: "transparent",
                            border: "none",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = theme.buttonBackgroundColor;
                            e.target.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.color = theme.textColor;
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
                            color: theme.textColor,
                            backgroundColor: "transparent",
                            border: "none",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = theme.buttonBackgroundColor;
                            e.target.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.color = theme.textColor;
                        }}
                        onClick={() => {
                            navigate("/your-charts");
                            setIsSideBarMenuOpen(false);
                        }}
                    >
                        {languages[language].sidebar.graphs}
                    </button>
                    <button
                        className="text-left p-3 rounded-md mb-1 transition-all duration-200 hover:scale-105"
                        style={{
                            color: theme.textColor,
                            backgroundColor: "transparent",
                            border: "none",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = theme.buttonBackgroundColor;
                            e.target.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.color = theme.textColor;
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
                            color: theme.textColor,
                            backgroundColor: "transparent",
                            border: "none",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = theme.buttonBackgroundColor;
                            e.target.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.color = theme.textColor;
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
                            color: theme.textColor,
                            backgroundColor: "transparent",
                            border: "none",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = theme.buttonBackgroundColor;
                            e.target.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.color = theme.textColor;
                        }}
                        onClick={() => {
                            navigate("/leaderboard");
                            setIsSideBarMenuOpen(false);
                        }}
                    >
                        {languages[language].sidebar.leaderboard}
                    </button>
                    <button
                        className="text-left p-3 rounded-md mb-1 transition-all duration-200 hover:scale-105"
                        style={{
                            color: theme.textColor,
                            backgroundColor: "transparent",
                            border: "none",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = theme.buttonBackgroundColor;
                            e.target.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.color = theme.textColor;
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
                            color: theme.textColor,
                            backgroundColor: "transparent",
                            border: "none",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = theme.buttonBackgroundColor;
                            e.target.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.color = theme.textColor;
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="account-container">
                <div className="account-image-wrapper">
                    <img
                        src={avatarImage}
                        title={languages[language].sidebar.account.title}
                        width="40px"
                        height="40px"
                        alt="Account"
                        className="account-image"
                        onClick={() => setShowDropdown(!showDropdown)}
                        onContextMenu={(e) => e.preventDefault()}
                        style={{
                            borderRadius: '50%',
                            cursor: 'pointer'
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
                            className="text-left p-3 rounded-md mb-1 transition-all duration-200 hover:scale-105 w-full"
                            style={{
                                color: theme.textColor,
                                backgroundColor: "transparent",
                                border: "none",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = theme.buttonBackgroundColor;
                                e.target.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = theme.textColor;
                            }}
                            onClick={() => {
                                navigate("/account");
                                setShowDropdown(false);
                            }}
                        >
                            {languages[language].sidebar.account.title}
                        </button>
                        <button
                            className="text-left p-3 rounded-md mb-1 transition-all duration-200 hover:scale-105 w-full"
                            style={{
                                color: theme.textColor,
                                backgroundColor: "transparent",
                                border: "none",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = theme.buttonBackgroundColor;
                                e.target.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = theme.textColor;
                            }}
                            onClick={() => {
                                navigate("/settings");
                                setShowDropdown(false);
                            }}
                        >
                            {languages[language].sidebar.settings.title}
                        </button>
                        <button
                            data-umami-event="logoutButton"
                            className="text-left p-3 rounded-md transition-all duration-200 hover:scale-105 w-full"
                            style={{
                                color: theme.textColor,
                                backgroundColor: "transparent",
                                border: "none",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = theme.buttonBackgroundColor;
                                e.target.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = theme.textColor;
                            }}
                            onClick={handleLogout}
                        >
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
