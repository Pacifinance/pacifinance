import React, { useState, useRef, useContext, useEffect } from "react";
import { Select, MenuItem } from "@mui/material";
import { BiTrendingUp } from "react-icons/bi";
import {
    AiOutlineFundProjectionScreen,
    AiOutlineTrophy,
    AiOutlineDotChart,
} from "react-icons/ai";
import { BsBook, BsInfoCircle } from "react-icons/bs";
import { FaUser, FaBullseye } from "react-icons/fa";
import Tooltip from "@mui/material/Tooltip";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { useLocation } from "react-router-dom";
import { LocalizedLink } from "../components/LocalizedLink";
import AvatarIcon from '../components/AvatarIcon';
import axios from "axios";
import { useLocalizedNavigate } from "../hooks/useLocalizedNavigate";
import LogoPaci from "../components/Logo";
import SidebarMobile from "../components/SidebarMobile";
import BottomNavBar from "../components/BottomNavBar";
import SidebarModals from "../components/SidebarModals";
import { ThemeContext } from "../contexts/ThemeContext";
import { PrivacyContext } from "../contexts/PrivacyContext";
import { IconContext } from "../contexts/PageContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { MediaQueryContext } from "../contexts/MediaQueryContext";
import { sortTagsByLanguage } from '../utils/sortingUtils';
import {
    SidebarPrivacyToggleModeButton,
    SidebarSection,
    Notification,
    DropdownContainer,
    Top,
    ToggleButton,
} from "../styles/MyStyled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTrashCan, faSignOutAlt, faUserCog, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
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
    const inputRef = useRef(null);
    const { theme, toggleMode } = useContext(ThemeContext);
    const { mode } = theme;
    const { isHidden, toggleHidden } = useContext(PrivacyContext);
    const { language, translations, toggleLanguage } = useContext(LanguageContext);
    const { isMobileScreen } = useContext(MediaQueryContext);
    const [isSideBarMenuOpen, setIsSideBarMenuOpen] = useState(false);
    const { activeIcon, setActiveIcon } = useContext(IconContext);
    const location = useLocation();

    // User data states
    const [userId, setUserId] = useState("");
    const [userType, setUserType] = useState("");
    const [username, setUsername] = useState("");
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
    const [selectedOption, setSelectedOption] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

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

    // Form states
    const [newID, setNewID] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [OldPassword, setOldPassword] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const navigate = useLocalizedNavigate();

    // Funzione per verificare se una pagina è attiva
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

    const handleIconClick = (iconIndex, pageLink) => {
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
        try {
            const response = await axios.post("/user/delete", {
                withCredentials: true,
            });
            if (response.status === 200) {
                handleSetIsAuthenticated(false);
                navigate("/");
                setShowSuccessDeleteAccount(true);
            } else {
                console.log("Delete account failed");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCopyToClipboard = (newID) => (event) => {
        event.preventDefault();
        navigator.clipboard
            .writeText(newID)
            .then(() => {
                alert(translations.sidebar.changeID.message + newID);
            })
            .catch((error) => {
                console.error(translations.sidebar.changeID.errorCopy + error);
            });
        handleCloseModalAndLogout();
    };

    const handleGenerateID = async (event) => {
        event.preventDefault();
        try {
            handleCloseModal();
            const data = { password: password };
            const response = await axios.post("/user/set-id", data, {
                withCredentials: true,
            });
            const newID = response.data.new_id;
            setNewID(newID);
            setShowID(true);
            event.preventDefault();
        } catch (error) {
            console.log(error);
        }
    };

    const handleGenerateUsername = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post("/user/set-username", null, {
                withCredentials: true,
            });
            const newUsername = response.data;
            setNewUsername(newUsername);
            setShowUsername(true);
        } catch (error) {
            console.log(error);
        }
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();
        try {
            if (password === confirmPassword) {
                const data = {
                    old_pwd: OldPassword,
                    new_pwd: password,
                    repeated_pwd: confirmPassword,
                };
                const response = await axios.post("/user/set-password", data, {
                    withCredentials: true,
                });
                if (response.status === 200) {
                    handleCloseModal();
                    setShowChangePWDSuccess(true);
                } else {
                    console.log("Change password failed");
                }
            }
        } catch (error) {
            console.log(error);
            handleCloseModal();
            setShowChangePWDError(true);
        }
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
            const response = await axios.post("/logout", null, {
                withCredentials: true,
            });
            if (response.status === 200) {
                handleSetIsAuthenticated(false);
                navigate("/");
            } else {
                console.log("Logout failed");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateProfile = async (event) => {
        event.preventDefault();
        try {
            const data = {
                country: userNationality.key,
                job: userJob.key,
                job_type: userJobType.key,
                job_country: userWhereWorks.key,
                work_time: userWorkTime.key,
                remote_type: userRemoteType.key,
            };
            const response = await axios.post("/user/set", data, {
                withCredentials: true,
            });
            if (response.status === 200) {
                handleSetIsUpdated(false);
                fetchData();
                setShowAccountModal(false);
                setShowUpdateProfileSuccess(true);
            } else {
                console.log("Update failed");
                alert(translations.sidebar.account.errorUpdateProfile);
            }
        } catch (error) {
            console.error(error);
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
                          height: '70px',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0 1rem',
                          zIndex: 1001,
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
                <LogoPaci />
                {isMobileScreen ? (
                    <button
                        onClick={toggleHidden}
                        data-umami-event="mobile-privacy-toggle"
                        aria-label={translations?.sidebar?.settings?.privacy || 'Privacy'}
                        style={{
                            background: 'none',
                            border: `1.5px solid ${isHidden ? 'rgba(239,68,68,0.4)' : (theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)')}`,
                            borderRadius: '8px',
                            padding: '6px 8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isHidden ? '#ef4444' : (theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'),
                            fontSize: '1rem',
                            transition: 'all 0.2s ease',
                            backgroundColor: isHidden ? 'rgba(239,68,68,0.08)' : 'transparent',
                        }}
                    >
                        <FontAwesomeIcon icon={isHidden ? faEyeSlash : faEye} />
                    </button>
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
                                    icon: BsInfoCircle,
                                    route: "/info",
                                    tooltip: translations.sidebar.info,
                                    index: 5,
                                },
                            ].map(({ icon: Icon, route, tooltip, index }) => (
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
                                        <Icon
                                            style={{
                                                fontSize: "22px",
                                                filter:
                                                    activePageIndex === index
                                                        ? `drop-shadow(0 0 4px ${theme.buttonBackgroundColor}40)`
                                                        : "none",
                                                pointerEvents: "none",
                                            }}
                                        />
                                    </LocalizedLink>
                                </Tooltip>
                            ))}
                        </div>

                        <Notification theme={theme}>
                            <div className="account-container">
                                <div className="account-image-wrapper">
                                    <AvatarIcon
                                        size={40}
                                        theme={theme}
                                        title={translations.sidebar.account.title}
                                        onClick={() => setShowDropdown(!showDropdown)}
                                    />
                                </div>
                            </div>
                            <DropdownContainer theme={theme}>
                                {showDropdown && (
                                    <div
                                        className="dropdown-menu"
                                        style={{
                                            position: "absolute",
                                            top: "50px",
                                            left: "60px",
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
                <BottomNavBar handleLogout={handleLogout} />
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