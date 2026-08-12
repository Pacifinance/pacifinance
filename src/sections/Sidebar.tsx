import React, { useState, useContext, useEffect } from "react";
import { Select, MenuItem } from "@mui/material";
import { BiTrendingUp } from "react-icons/bi";
import {
    AiOutlineTrophy,
    AiOutlineDotChart,
} from "react-icons/ai";
import { BsBook, BsInfoCircle, BsGraphUp } from "react-icons/bs";
import { FaUser, FaBullseye } from "react-icons/fa";
import Tooltip from "@mui/material/Tooltip";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { useLocation } from "react-router-dom";
import { LocalizedLink } from "../components/LocalizedLink";
import AvatarIcon from '../components/AvatarIcon';
import { useDemoServices } from "../hooks/useDemoServices";
import { useAccountActions } from "../hooks/useAccountActions";
import { useToast } from "../contexts/ToastContext";
import { useLocalizedNavigate } from "../hooks/useLocalizedNavigate";
import PacifinanceLogo from "../components/PacifinanceLogo";
import SidebarMobile from "../components/SidebarMobile";
import BottomNavBar from "./BottomNavBar";
import QuickAddTransaction from "./QuickAddTransaction";
import SidebarModals from "../components/SidebarModals";
import { ThemeContext } from "../contexts/ThemeContext";
import { PrivacyContext } from "../contexts/PrivacyContext";
import { IconContext } from "../contexts/PageContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { MediaQueryContext } from "../contexts/MediaQueryContext";
import { sortTagsByLanguage } from '../utils/sortingUtils';
import { useGamification } from '../hooks/useGamification';
import { getLevelColor, getLevelProgress } from '../utils/gamificationLevel';
import {
    SidebarPrivacyToggleModeButton,
    SidebarSection,
    Notification,
    DropdownContainer,
    Top,
    ToggleButton,
    MobilePrivacyToggleButton,
} from "../styles/MyStyled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faUserCog, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import {
    SidebarToggleModeButton,
    SettingsToggleButton,
    MuiFixedDimDialog,
    MuiCustomButton,
    MuiCustomDialogTitle,
    MuiCustomDialogContent,
    MuiCustomDialogProfileContent,
    MuiCustomDialogContentText,
    MuiCustomDialogActions,
    MuiCustomTextField,
    MuiCustomIconButton,
    MuiCustomInputAdornment,
    EyeVisibility,
    EyeVisibilityOff,
} from "../styles/MyStyled";

function Sidebar({ userData, handleSetIsUpdated, handleSetIsAuthenticated }) {
    const { theme, toggleMode } = useContext(ThemeContext);
    const { mode } = theme;
    const { isHidden, toggleHidden } = useContext(PrivacyContext);
    const { language, translations, toggleLanguage } = useContext(LanguageContext);
    const { isMobileScreen } = useContext(MediaQueryContext);
    const { userService } = useDemoServices();
    const { setActiveIcon } = useContext(IconContext);
    const location = useLocation();

    // User data states
    const [userId, setUserId] = useState("");
    const [userType, setUserType] = useState("");
    const [, setUsername] = useState("");
    const [userNationality, setUserNationality] = useState({ key: "", value: "" });
    const [userWhereWorks, setUserWhereWorks] = useState({ key: "", value: "" });
    const [userJob, setUserJob] = useState({ key: "", value: "" });
    const [userJobType, setUserJobType] = useState({ key: "", value: "" });
    const [userWorkTime, setUserWorkTime] = useState({ key: "", value: "" });
    const [userRemoteType, setUserRemoteType] = useState({ key: "", value: "" });
    const [nationalityTags, setNationalityTags] = useState([]);
    const [jobTags, setJobTags] = useState([]);
    const [jobTypeTags, setJobTypeTags] = useState([]);
    const [workTimeTags, setWorkTimeTags] = useState([]);
    const [remoteTypeTags, setRemoteTypeTags] = useState([]);
    const [selectedOption] = useState(null);
    const [showPopup] = useState(false);

    // Modal states
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showChangeIDModal, setShowChangeIDModal] = useState(false);
    const [showID, setShowID] = useState(false);
    const [showUsername, setShowUsername] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showUpdateProfileSuccess, setShowUpdateProfileSuccess] = useState(false);
    const [showModalDeleteAccount, setShowModalDeleteAccount] = useState(false);
    const [showSuccessDeleteAccount, setShowSuccessDeleteAccount] = useState(false);
    const [showChangeUsernameModal, setShowChangeUsernameModal] = useState(false);
    const [showChangePWDModal, setShowChangePWDModal] = useState(false);
    const [showSettingsPopup, setShowSettingsPopup] = useState(false);
    const [showChangePWDSuccess, setShowChangePWDSuccess] = useState(false);
    const [showChangePWDError, setShowChangePWDError] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMobileQuickAdd, setShowMobileQuickAdd] = useState(false);

    // Form states
    const [newID, setNewID] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [OldPassword, setOldPassword] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const navigate = useLocalizedNavigate();
    const { showSuccess, showError } = useToast();
    const gamification = useGamification(userData);
    const levelProgress = getLevelProgress(gamification.points, gamification.level);
    const levelColor = getLevelColor(gamification.level);
    const levelTitle = (translations?.gamification?.levelProgress || 'Level {level}: {progress}% to the next level')
        .replace('{level}', String(gamification.level))
        .replace('{progress}', String(levelProgress));

    // Shared account actions via DI hook
    const accountActions = useAccountActions({
        onSuccess: (key, value) => {
            if (key === 'idGenerated') {
                setNewID(value);
                setShowID(true);
            } else if (key === 'usernameReset') {
                setNewUsername(value);
                setShowUsername(true);
            } else if (key === 'passwordChanged') {
                handleCloseModal();
                setShowChangePWDSuccess(true);
            } else if (key === 'profileUpdated') {
                handleSetIsUpdated(false);
                fetchData();
                setShowAccountModal(false);
                setShowUpdateProfileSuccess(true);
            }
        },
        onError: (key) => {
            if (key === 'changePasswordError') {
                handleCloseModal();
                setShowChangePWDError(true);
            } else {
                showError(translations.sidebar?.account?.errorGeneric || 'Operation failed');
            }
        },
        onLogout: () => {
            handleSetIsAuthenticated(false);
            navigate("/");
            setShowSuccessDeleteAccount(true);
        },
    });

    // Function to check whether a page is active
    const isActivePage = (path) => {
        return location.pathname === path;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showDropdown &&
                !event.target.closest(".account-container") &&
                !event.target.closest(".dropdown-menu")
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showDropdown]);

    const fetchData = async () => {
        if (userData) {
            try {
                setUserId(userData.userId);
                setUserType(userData.userType);
                setUsername(userData.username);
                setUserNationality(userData.userNationality);
                setUserWhereWorks(userData.userWhereWorks);
                setUserJob(userData.userJob);
                setUserJobType(userData.userJobType);
                setUserWorkTime(userData.userWorkTime);
                setUserRemoteType(userData.userRemoteType);
                setNationalityTags(userData.nationalityTags);
                setJobTags(userData.jobTags);
                setJobTypeTags(userData.jobTypeTags);
                setWorkTimeTags(userData.workTimeTags);
                setRemoteTypeTags(userData.remoteTypeTags);
            } catch (error) {
                console.error("Error:", error);
            }
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData]);

    const getActivePageIndex = () => {
        const path = location.pathname;
        if (path === "/dashboard") return 0;
        if (path === "/charts-statistics") return 1;
        if (path === "/insert-values") return 2;
        if (path === "/comparison") return 3;
        if (path === "/knowledge") return 4;
        if (path === "/info") return 5;
        return -1;
    };

    const activePageIndex = getActivePageIndex();

    const handleIconClick = (iconIndex) => {
        setActiveIcon(iconIndex);
    };

    // Form handlers
    const handleOldPasswordInput = (event) => setOldPassword(event.target.value);
    const handlePasswordInput = (event) => setPassword(event.target.value);
    const handleConfirmPasswordInput = (event) => setConfirmPassword(event.target.value);
    const handleToggleOldPasswordVisibility = () => setShowOldPassword(!showOldPassword);
    const handleTogglePasswordVisibility = () => setShowPassword(!showPassword);
    const handleToggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);
    const handleMouseDownPassword = (event) => event.preventDefault();
    const handleShowModalDeleteAccount = () => setShowModalDeleteAccount(true);

    // API handlers
    const handleDeleteAccount = async (event) => {
        event.preventDefault();
        await accountActions.deleteAccount();
    };

    const handleCopyToClipboard = (copiedID) => (event) => {
        event.preventDefault();
        navigator.clipboard
            .writeText(copiedID)
            .then(() => {
                showSuccess(translations.sidebar.changeID.message + copiedID);
            })
            .catch(() => {
                showError(translations.sidebar.changeID.errorCopy || 'Copy failed');
            });
        handleCloseModalAndLogout();
    };

    const handleGenerateID = async (event) => {
        event.preventDefault();
        handleCloseModal();
        await accountActions.generateNewId(password);
    };

    const handleGenerateUsername = async (event) => {
        event.preventDefault();
        await accountActions.resetUsername();
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();
        await accountActions.changePassword(OldPassword, password, confirmPassword);
    };

    // Modal close handlers
    const handleCloseModal = () => {
        setShowAccountModal(false);
        setShowChangeIDModal(false);
        setShowChangeUsernameModal(false);
        setShowChangePWDModal(false);
        setShowUpdateProfileSuccess(false);
        setShowSettingsPopup(false);
        setShowSuccessDeleteAccount(false);
    };

    const handleCloseSecondaryModal = () => {
        setShowChangePWDError(false);
        setShowUsername(false);
    };

    const handleCloseModalAndLogout = () => {
        setShowID(false);
        setShowChangePWDSuccess(false);
        navigate("/");
    };

    const handleLogout = async (event) => {
        event.preventDefault();
        try {
            await userService.logout();
            handleSetIsAuthenticated(false);
            navigate("/");
        } catch {
            showError(translations.sidebar?.account?.errorLogout || 'Logout failed');
        }
    };

    const handleUpdateProfile = async (event) => {
        event.preventDefault();
        const data = {
            country: userNationality.key,
            job: userJob.key,
            job_type: userJobType.key,
            job_country: userWhereWorks.key,
            work_time: userWorkTime.key,
            remote_type: userRemoteType.key,
        };
        const ok = await accountActions.updateProfile(data);
        if (!ok) {
            showError(translations.sidebar.account.errorUpdateProfile);
        }
    };

    // Sort tags using the utility function
    const sortedNationalityTags = sortTagsByLanguage(nationalityTags, language);
    const sortedJobTags = sortTagsByLanguage(jobTags, language);

    return (
        <SidebarSection
            theme={theme}
            style={{
                ...(isMobileScreen
                    ? {
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          right: 0,
                          width: '100%',
                          height: '58px',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0 0.55rem 0 0.75rem',
                          zIndex: 9000,
                      }
                    : {}),
            }}
        >
            <Top
                style={{
                    ...(isMobileScreen
                        ? {
                              width: '100%',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                          }
                        : {}),
                }}
            >
                <PacifinanceLogo showText={false} />
                {isMobileScreen ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
                        <MobilePrivacyToggleButton
                            theme={theme}
                            $active={isHidden}
                            onClick={toggleHidden}
                            data-umami-event="mobile-privacy-toggle"
                            aria-label={translations?.sidebar?.settings?.privacy || 'Privacy'}
                        >
                            <FontAwesomeIcon key={isHidden ? 'hidden' : 'visible'} icon={isHidden ? faEyeSlash : faEye} />
                        </MobilePrivacyToggleButton>
                        <button
                            type="button"
                            className="account-container"
                            title={levelTitle}
                            aria-label={levelTitle}
                            aria-haspopup="menu"
                            aria-expanded={showDropdown}
                            onClick={() => setShowDropdown((open) => !open)}
                            style={{
                                position: 'relative',
                                width: '42px',
                                height: '42px',
                                padding: '3px',
                                boxSizing: 'border-box',
                                borderRadius: '50%',
                                aspectRatio: '1',
                                flexShrink: 0,
                                background: `conic-gradient(${levelColor} ${levelProgress}%, ${theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.14)'} 0)`,
                                boxShadow: `0 2px 8px ${levelColor}30`,
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <AvatarIcon
                                size={36}
                                theme={theme}
                                title={levelTitle}
                                style={{ display: 'block', pointerEvents: 'none' }}
                            />
                            <span style={{
                                position: 'absolute', right: '-2px', bottom: '-3px', minWidth: '20px', height: '15px',
                                padding: '0 3px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: levelColor, color: '#fff', border: `2px solid ${theme.backgroundColor}`,
                                fontSize: '8px', lineHeight: 1, fontWeight: 800, boxSizing: 'content-box',
                                pointerEvents: 'none',
                            }}>
                                {translations?.gamification?.levelShort} {gamification.level}
                            </span>
                        </button>
                        {showDropdown && (
                            <div
                                className="dropdown-menu"
                                role="menu"
                                style={{
                                    position: 'fixed',
                                    top: '54px',
                                    right: '8px',
                                    width: 'min(230px, calc(100vw - 16px))',
                                    padding: '10px',
                                    borderRadius: '12px',
                                    backgroundColor: theme.backgroundColor,
                                    border: `1px solid ${theme.borderColor}`,
                                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.28)',
                                    zIndex: 10002,
                                }}
                            >
                                <button
                                    type="button"
                                    role="menuitem"
                                    className="dropdown-option"
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '11px 12px', border: 'none', borderRadius: '8px',
                                        color: theme.textColor, background: 'transparent', cursor: 'pointer',
                                        textAlign: 'left',
                                    }}
                                    onClick={() => {
                                        setShowDropdown(false);
                                        navigate('/profile');
                                    }}
                                >
                                    <FaUser size={14} />
                                    {translations.sidebar.account.title}
                                </button>
                                <button
                                    type="button"
                                    role="menuitem"
                                    className="dropdown-option"
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '11px 12px', border: 'none', borderRadius: '8px',
                                        color: theme.textColor, background: 'transparent', cursor: 'pointer',
                                        textAlign: 'left',
                                    }}
                                    onClick={() => {
                                        setShowDropdown(false);
                                        navigate('/settings');
                                    }}
                                >
                                    <FontAwesomeIcon icon={faUserCog} />
                                    {translations.sidebar.settings.title}
                                </button>
                                <button
                                    type="button"
                                    role="menuitem"
                                    className="dropdown-option logout"
                                    data-umami-event="mobile-logout-button"
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                        marginTop: '4px', padding: '11px 12px', borderRadius: '8px',
                                        color: '#dc2626', background: 'rgba(220, 38, 38, 0.06)',
                                        border: '1px solid rgba(220, 38, 38, 0.2)', cursor: 'pointer',
                                        textAlign: 'left',
                                    }}
                                    onClick={(event) => {
                                        setShowDropdown(false);
                                        void handleLogout(event);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faSignOutAlt} />
                                    {translations.sidebar.logout}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                padding: "20px 0",
                                flex: 1,
                            }}
                        >
                            {[
                                {
                                    icon: BiTrendingUp,
                                    route: "/dashboard",
                                    tooltip: "Dashboard",
                                    index: 0,
                                },
                                {
                                    icon: AiOutlineDotChart,
                                    route: "/charts-statistics",
                                    tooltip: translations.sidebar.chartsStatistics,
                                    index: 1,
                                },
                                {
                                    icon: HiOutlinePencilAlt,
                                    route: "/insert-values",
                                    tooltip: translations.sidebar.insert,
                                    index: 2,
                                },
                                {
                                    icon: CompareArrowsIcon,
                                    route: "/comparison",
                                    tooltip: translations.sidebar.comparison,
                                    index: 3,
                                },
                                {
                                    icon: BsBook,
                                    route: "/knowledge",
                                    tooltip: translations.sidebar.knowledge,
                                    index: 4,
                                },
                                {
                                    icon: BsGraphUp,
                                    route: "/market-prices",
                                    tooltip: translations.sidebar.marketPrices,
                                    index: 5,
                                    iconSize: "18px",
                                },
                                {
                                    icon: BsInfoCircle,
                                    route: "/info",
                                    tooltip: translations.sidebar.info,
                                    index: 6,
                                },
                            ].map(({ icon, route, tooltip, index, iconSize }) => {
                                const MenuIcon = icon;
                                return (
                                <Tooltip key={index} title={tooltip} placement="right">
                                    <LocalizedLink
                                        to={route}
                                        onClick={() => handleIconClick(index, route.substring(1))}
                                        style={{
                                            position: "relative",
                                            display: "flex",
                                            alignItems: "center",
                                            padding: "12px 16px",
                                            margin: "0 8px",
                                            borderRadius: "12px",
                                            cursor: "pointer",
                                            backgroundColor:
                                                activePageIndex === index
                                                    ? `${theme.buttonBackgroundColor}15`
                                                    : "transparent",
                                            border:
                                                activePageIndex === index
                                                    ? `1px solid ${theme.buttonBackgroundColor}30`
                                                    : "1px solid transparent",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            transform:
                                                activePageIndex === index
                                                    ? "translateX(4px)"
                                                    : "translateX(0)",
                                            boxShadow:
                                                activePageIndex === index
                                                    ? `0 4px 12px ${theme.buttonBackgroundColor}20`
                                                    : "0 2px 4px rgba(0,0,0,0.1)",
                                            textDecoration: "none",
                                            color:
                                                activePageIndex === index
                                                    ? theme.buttonBackgroundColor
                                                    : theme.textColor,
                                            fontSize: "20px",
                                            fontWeight: activePageIndex === index ? "600" : "400",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (activePageIndex !== index) {
                                                e.currentTarget.style.backgroundColor = `${theme.buttonBackgroundColor}08`;
                                                e.currentTarget.style.transform = "translateX(2px)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (activePageIndex !== index) {
                                                e.currentTarget.style.backgroundColor = "transparent";
                                                e.currentTarget.style.transform = "translateX(0)";
                                            }
                                        }}
                                    >
                                        <div
                                            style={{
                                                position: "absolute",
                                                left: "0",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                width: activePageIndex === index ? "4px" : "0",
                                                height: "60%",
                                                backgroundColor: theme.buttonBackgroundColor,
                                                borderRadius: "0 4px 4px 0",
                                                transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                pointerEvents: "none",
                                            }}
                                        />
                                        <MenuIcon
                                            style={{
                                                fontSize: iconSize || "22px",
                                                filter:
                                                    activePageIndex === index
                                                        ? `drop-shadow(0 0 4px ${theme.buttonBackgroundColor}40)`
                                                        : "none",
                                                pointerEvents: "none",
                                            }}
                                        />
                                    </LocalizedLink>
                                </Tooltip>
                                );
                            })}
                        </div>

                        <Notification theme={theme}>
                            <div className="account-container">
                                <div
                                    className="account-image-wrapper"
                                    title={levelTitle}
                                    style={{
                                        position: 'relative', width: '46px', height: '46px', padding: '3px',
                                        boxSizing: 'border-box', borderRadius: '50%', aspectRatio: '1', flexShrink: 0,
                                        background: `conic-gradient(${levelColor} ${levelProgress}%, ${theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.14)'} 0)`,
                                    }}
                                >
                                    <AvatarIcon
                                        size={40}
                                        theme={theme}
                                        title={levelTitle}
                                        style={{ display: 'block' }}
                                        onClick={() => setShowDropdown(!showDropdown)}
                                    />
                                    <span style={{
                                        position: 'absolute', right: '-3px', bottom: '-3px', minWidth: '20px', height: '15px',
                                        padding: '0 3px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: levelColor, color: '#fff', border: `2px solid ${theme.backgroundColor}`,
                                        fontSize: '8px', lineHeight: 1, fontWeight: 800, boxSizing: 'content-box',
                                    }}>
                                        {translations?.gamification?.levelShort} {gamification.level}
                                    </span>
                                </div>
                            </div>
                            <DropdownContainer className="desktop-account-dropdown" theme={theme}>
                                {showDropdown && (
                                    <div
                                        className="dropdown-menu"
                                        style={{
                                            backgroundColor: theme.backgroundColor,
                                            borderRadius: "12px",
                                            padding: "12px",
                                            minWidth: "200px",
                                            border: `2px solid ${theme.buttonBackgroundColor}`,
                                            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                                            zIndex: 10001,
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
                                            {translations.sidebar.account.title}
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
                                            {translations?.sidebar?.goalsLimits || 'Goals & Limits'}
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
                                            {translations.sidebar.settings.title}
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
                                            {translations.sidebar.logout}
                                        </button>
                                    </div>
                                )}
                            </DropdownContainer>
                        </Notification>

                        <ToggleButton title={translations.sidebar.settings.privacy}>
                            <SidebarPrivacyToggleModeButton
                                theme={theme}
                                mode={mode}
                                toggleHidden={toggleHidden}
                                isHidden={isHidden}
                            />
                        </ToggleButton>
                    </>
                )}
            </Top>

            {isMobileScreen && (
                <>
                    <QuickAddTransaction
                        theme={theme}
                        showFab={false}
                        menuOpen={showMobileQuickAdd}
                        onMenuOpenChange={setShowMobileQuickAdd}
                    />
                    <BottomNavBar onQuickAdd={() => setShowMobileQuickAdd(true)} />
                </>
            )}

            <SidebarModals
                theme={theme}
                language={language}
                isHidden={isHidden}
                userType={userType}
                mode={mode}
                toggleMode={toggleMode}
                toggleHidden={toggleHidden}
                toggleLanguage={toggleLanguage}
                showAccountModal={showAccountModal}
                userId={userId}
                userNationality={userNationality}
                userWhereWorks={userWhereWorks}
                userJob={userJob}
                userJobType={userJobType}
                userWorkTime={userWorkTime}
                userRemoteType={userRemoteType}
                sortedNationalityTags={sortedNationalityTags}
                sortedJobTags={sortedJobTags}
                jobTypeTags={jobTypeTags}
                workTimeTags={workTimeTags}
                remoteTypeTags={remoteTypeTags}
                setUserNationality={setUserNationality}
                setUserWhereWorks={setUserWhereWorks}
                setUserJob={setUserJob}
                setUserJobType={setUserJobType}
                setUserWorkTime={setUserWorkTime}
                setUserRemoteType={setUserRemoteType}
                handleUpdateProfile={handleUpdateProfile}
                showChangeUsernameModal={showChangeUsernameModal}
                handleGenerateUsername={handleGenerateUsername}
                showChangeIDModal={showChangeIDModal}
                password={password}
                showPassword={showPassword}
                handlePasswordInput={handlePasswordInput}
                handleTogglePasswordVisibility={handleTogglePasswordVisibility}
                handleMouseDownPassword={handleMouseDownPassword}
                handleGenerateID={handleGenerateID}
                showChangePWDModal={showChangePWDModal}
                OldPassword={OldPassword}
                showOldPassword={showOldPassword}
                confirmPassword={confirmPassword}
                showConfirmPassword={showConfirmPassword}
                handleOldPasswordInput={handleOldPasswordInput}
                handleToggleOldPasswordVisibility={handleToggleOldPasswordVisibility}
                handleConfirmPasswordInput={handleConfirmPasswordInput}
                handleToggleConfirmPasswordVisibility={handleToggleConfirmPasswordVisibility}
                handleChangePassword={handleChangePassword}
                showID={showID}
                newID={newID}
                handleCopyToClipboard={handleCopyToClipboard}
                showUsername={showUsername}
                newUsername={newUsername}
                showUpdateProfileSuccess={showUpdateProfileSuccess}
                showModalDeleteAccount={showModalDeleteAccount}
                handleDeleteAccount={handleDeleteAccount}
                showSuccessDeleteAccount={showSuccessDeleteAccount}
                showChangePWDSuccess={showChangePWDSuccess}
                showChangePWDError={showChangePWDError}
                showSettingsPopup={showSettingsPopup}
                selectedOption={selectedOption}
                showPopup={showPopup}
                handleShowModalDeleteAccount={handleShowModalDeleteAccount}
                handleCloseModal={handleCloseModal}
                handleCloseSecondaryModal={handleCloseSecondaryModal}
                handleCloseModalAndLogout={handleCloseModalAndLogout}
            />
        </SidebarSection>
    );
}

export default Sidebar;
