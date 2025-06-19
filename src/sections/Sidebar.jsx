import React, { useState, useRef, useContext, useEffect } from "react";
// import ReactSelect from 'react-select';
import { Select, MenuItem } from "@mui/material";
import { BiHomeAlt } from "react-icons/bi";
import {
    AiOutlineFundProjectionScreen,
    AiOutlineTrophy,
    AiOutlineDotChart,
    AiOutlineCaretDown,
} from "react-icons/ai";
import { BsBook, BsInfoCircle } from "react-icons/bs";
import Tooltip from "@mui/material/Tooltip";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";
import avatarImage from "../assets/account-logo.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LogoPaci from "../components/Logo";
import { ThemeContext } from "../contexts/ThemeContext";
import { PrivacyContext } from "../contexts/PrivacyContext";
import { IconContext } from "../contexts/PageContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { MediaQueryContext } from "../contexts/MediaQueryContext";
import languages from "../data/languages.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import BuyMeACoffeeWidget from "../components/BuyMeACoffeeWidget";
import {
    SidebarToggleModeButton,
    SidebarPrivacyToggleModeButton,
    SidebarSection,
    Notification,
    DropdownContainer,
    Top,
    Links,
    SettingsToggleButton,
    ToggleButton,
    MuiCustomDialog,
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
import { Media } from "reactstrap";
// import PrivacyToggleModeButton from '../components/PrivacyToggleModeButton';

function Sidebar({ userData, handleSetIsUpdated, handleSetIsAuthenticated }) {
    const inputRef = useRef(null);
    const { theme, toggleMode } = useContext(ThemeContext);
    const { mode } = theme;
    const { isHidden, toggleHidden } = useContext(PrivacyContext);
    const { language, toggleLanguage } = useContext(LanguageContext);
    const { isMobileScreen } = useContext(MediaQueryContext);
    const [isSideBarMenuOpen, setIsSideBarMenuOpen] = useState(false);
    const { activeIcon, setActiveIcon } = useContext(IconContext); // Stato per l'icona attiva
    const location = useLocation(); // Per rilevare la pagina corrente
    // const [currentPage, setCurrentPage] = useState('dashboard'); // Stato per la pagina corrente
    const [userId, setUserId] = useState("");
    const [userType, setUserType] = useState(""); // [0, 1, 2, 3] -> [regular, premium, test, demo]
    const [username, setUsername] = useState("");
    const [userNationality, setUserNationality] = useState({
        key: "",
        value: "",
    });
    const [userWhereWorks, setUserWhereWorks] = useState({
        key: "",
        value: "",
    });
    const [userJob, setUserJob] = useState({ key: "", value: "" });
    const [userJobType, setUserJobType] = useState({ key: "", value: "" });
    const [userWorkTime, setUserWorkTime] = useState({ key: "", value: "" });
    const [userRemoteType, setUserRemoteType] = useState({
        key: "",
        value: "",
    });
    const [nationalityTags, setNationalityTags] = useState([]);
    const [jobTags, setJobTags] = useState([]);
    const [jobTypeTags, setJobTypeTags] = useState([]);
    const [workTimeTags, setWorkTimeTags] = useState([]);
    const [remoteTypeTags, setRemoteTypeTags] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showChangeIDModal, setShowChangeIDModal] = useState(false);
    const [showID, setShowID] = useState(false);
    const [showUsername, setShowUsername] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showUpdateProfileSuccess, setShowUpdateProfileSuccess] =
        useState(false);
    const [showModalDeleteAccount, setShowModalDeleteAccount] = useState(false);
    const [showSuccessDeleteAccount, setShowSuccessDeleteAccount] =
        useState(false);
    const [showChangeUsernameModal, setShowChangeUsernameModal] =
        useState(false);
    const [showChangePWDModal, setShowChangePWDModal] = useState(false);
    const [showSettingsPopup, setShowSettingsPopup] = useState(false);
    const [showChangePWDSuccess, setShowChangePWDSuccess] = useState(false);
    const [showChangePWDError, setShowChangePWDError] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [OldId, setOldId] = useState("");
    const [newID, setNewID] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [OldPassword, setOldPassword] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    // Chiudi il dropdown quando si clicca fuori
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
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
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

    // Funzione per determinare la pagina attiva basata sulla route corrente
    const getActivePageIndex = () => {
        const path = location.pathname;
        if (path === "/dashboard") return 0;
        if (path === "/your-charts") return 1;
        if (path === "/insert-values") return 2;
        if (path === "/check-prices") return 3;
        if (path === "/leaderboard") return 4;
        if (path === "/knowledge") return 5;
        if (path === "/info") return 6;
        return -1; // Nessuna pagina attiva
    };

    const activePageIndex = getActivePageIndex();

    const handleIconClick = (iconIndex, pageLink) => {
        setActiveIcon(iconIndex);
        // setCurrentPage(pageLink);
    };

    const handleOldPasswordInput = (event) => {
        setOldPassword(event.target.value);
    };

    const handleOldIdInput = (event) => {
        setOldId(event.target.value);
    };

    const handlePasswordInput = (event) => {
        setPassword(event.target.value);
    };

    const handleConfirmPasswordInput = (event) => {
        setConfirmPassword(event.target.value);
    };

    const handleToggleOldPasswordVisibility = () => {
        setShowOldPassword(!showOldPassword);
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleToggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleShowModalDeleteAccount = () => {
        setShowModalDeleteAccount(true);
    };

    const handleDeleteAccount = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post("/user/delete", {
                withCredentials: true,
            });
            if (response.status === 200) {
                handleSetIsAuthenticated(false); // Set the user authentication to false
                navigate("/"); //direct redirect
                //window.umami.trackEvent('deleteAccount', 'Account');
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
                // Copiato negli appunti con successo
                alert(languages[language].sidebar.changeID.message + newID);
            })
            .catch((error) => {
                console.error(
                    languages[language].sidebar.changeID.errorCopy + error,
                );
            });
        handleCloseModalAndLogout();
    };

    const handleGenerateID = async (event) => {
        event.preventDefault();
        try {
            handleCloseModal();
            const data = {
                password: password,
            };
            const response = await axios.post("/user/set-id", data, {
                withCredentials: true,
            }); //only the first element of the array is needed (the last one)
            const newID = response.data.new_id;
            setNewID(newID);
            setShowID(true);
            event.preventDefault();
            //window.umami.trackEvent('changedID', 'ID');
        } catch (error) {
            console.log(error);
        }
    };

    const handleGenerateUsername = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post("/user/set-username", null, {
                withCredentials: true,
            }); //only the first element of the array is needed (the last one)
            const newUsername = response.data;
            setNewUsername(newUsername);
            setShowUsername(true);
            //window.umami.trackEvent('changedUsername', 'Username');
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
                }); //only the first element of the array is needed (the last one)
                if (response.status === 200) {
                    handleCloseModal();
                    setShowChangePWDSuccess(true);
                    //window.umami.trackEvent('changedPassword', 'Password');
                } else {
                    console.log("Change password failed");
                }
            }
        } catch (error) {
            console.log(error);
            handleCloseModal();
            setShowChangePWDError(true);
            // alert("Errore nel cambio password: le password non coincidono");
        }
    };

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
                handleSetIsAuthenticated(false); // Set the user authentication to false
                navigate("/"); //direct redirect
                //window.umami.trackEvent('logout', 'Logut');
            } else {
                console.log("Logout failed");
            }
        } catch (error) {
            console.error(error);
        }
    };

    //we could update the modal with an x button to close it and avoid the automate close
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
                handleSetIsUpdated(false); // Forza il re-render di UserProvider
                fetchData();
                setShowAccountModal(false);
                setShowUpdateProfileSuccess(true);
                //window.umami.trackEvent('updateAccount', 'Account');
            } else {
                console.log("Update failed");
                alert(languages[language].sidebar.account.errorUpdateProfile);
            }
        } catch (error) {
            console.error(error);
        }
    };

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
                            e.target.style.backgroundColor =
                                theme.buttonBackgroundColor;
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
                            e.target.style.backgroundColor =
                                theme.buttonBackgroundColor;
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
                            e.target.style.backgroundColor =
                                theme.buttonBackgroundColor;
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
                            e.target.style.backgroundColor =
                                theme.buttonBackgroundColor;
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
                            e.target.style.backgroundColor =
                                theme.buttonBackgroundColor;
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
                            e.target.style.backgroundColor =
                                theme.buttonBackgroundColor;
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
                            e.target.style.backgroundColor =
                                theme.buttonBackgroundColor;
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

    // const HamburgerMenu = () => (
    //     <div>
    //         <FontAwesomeIcon icon={faBars} onClick={() => setIsSideBarMenuOpen(!isSideBarMenuOpen)} />
    //     </div>
    //     <>
    //     {isSideBarMenuOpen ? (
    //         <div className={`hamburger-menu ${isSideBarMenuOpen ? 'open' : ''} bg-white rounded-md cursor-pointer p-0.5 px-1.5 ml-4 fixed top-4 right-4 flex flex-col z-50`}>
    //             <button className="text-black hover:text-white hover:bg-paciGreen hover:font-bold rounded-md p-0.5" onClick={() => navigate('/dashboard')}>
    //             Dashboard
    //             </button>
    //             <button className="text-black hover:text-white hover:bg-paciGreen hover:font-bold rounded-md p-0.5" onClick={() => navigate('/your-charts')}>
    //                 {languages[language].sidebar.graphs}
    //             </button>
    //             <button className="text-black hover:text-white hover:bg-paciGreen hover:font-bold rounded-md p-0.5" onClick={() => navigate('/insert-values')}>
    //                 {languages[language].sidebar.insert}
    //             </button>
    //             <button className="text-black hover:text-white hover:bg-paciGreen hover:font-bold rounded-md p-0.5" onClick={() => navigate('/check-prices')}>
    //                 {languages[language].sidebar.check}
    //             </button>
    //             <button className="text-black hover:text-white hover:bg-paciGreen hover:font-bold rounded-md p-0.5" onClick={() => navigate('/leaderboard')}>
    //                 {languages[language].sidebar.leaderboard}
    //             </button>
    //             <button className="text-black hover:text-white hover:bg-paciGreen hover:font-bold rounded-md p-0.5" onClick={() => navigate('/knowledge')}>
    //                 {languages[language].sidebar.learn}
    //             </button>
    //             <button className="text-black hover:text-white hover:bg-paciGreen hover:font-bold rounded-md p-0.5" onClick={() => navigate('/info')}>
    //                 {languages[language].sidebar.info}
    //             </button>
    //         </div>
    //     ) : null}
    //     </>
    //     )}
    // );

    // Filter out the "Other" option
    const otherNationalityOption = nationalityTags.find(
        (tag) => tag.index === 9999,
    ); // option "Altro" ("Other")
    const otherNationalityTags = nationalityTags.filter(
        (tag) => tag.index !== 9999,
    ); // Remove the "Other" option from the array

    // Sort the other tags alphabetically
    const sortedNationalityTags = otherNationalityTags.sort((a, b) =>
        a.translations.it.localeCompare(b.translations.it),
    );

    // Add the "Other" option back to the end of the array
    if (otherNationalityOption) {
        sortedNationalityTags.push(otherNationalityOption);
    }

    const otherJobOption = jobTags.find((tag) => tag.index === 9999); // option "Altro" ("Other")
    const otherJobTags = jobTags.filter((tag) => tag.index !== 9999); // Remove the "Other" option from the array

    // Sort the other tags alphabetically
    const sortedJobTags = otherJobTags.sort((a, b) =>
        a.translations.it.localeCompare(b.translations.it),
    );

    // Add the "Other" option back to the end of the array
    if (otherJobOption) {
        sortedJobTags.push(otherJobOption);
    }

    return (
        <SidebarSection theme={theme} style={{ 
            ...(isMobileScreen && {
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
                zIndex: 1001
            })
        }}>
            <Top style={{
                ...(isMobileScreen && {
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                })
            }}>
                <LogoPaci />
                {isMobileScreen ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Notification theme={theme}>
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
                        </Notification>
                        <HamburgerMenu />
                    </div>
                ) : (
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
                                icon: BiHomeAlt,
                                route: "/dashboard",
                                tooltip: "Dashboard",
                                index: 0,
                            },
                            {
                                icon: AiOutlineDotChart,
                                route: "/your-charts",
                                tooltip: languages[language].sidebar.graphs,
                                index: 1,
                            },
                            {
                                icon: HiOutlinePencilAlt,
                                route: "/insert-values",
                                tooltip: languages[language].sidebar.insert,
                                index: 2,
                            },
                            {
                                icon: AiOutlineFundProjectionScreen,
                                route: "/check-prices",
                                tooltip: languages[language].sidebar.check,
                                index: 3,
                            },
                            {
                                icon: AiOutlineTrophy,
                                route: "/leaderboard",
                                tooltip:
                                    languages[language].sidebar.leaderboard,
                                index: 4,
                            },
                            {
                                icon: BsBook,
                                route: "/knowledge",
                                tooltip: languages[language].sidebar.knowledge,
                                index: 5,
                            },
                            {
                                icon: BsInfoCircle,
                                route: "/info",
                                tooltip: languages[language].sidebar.info,
                                index: 6,
                            },
                        ].map(({ icon: Icon, route, tooltip, index }) => (
                            <Tooltip
                                key={index}
                                title={tooltip}
                                placement="right"
                            >
                                <Link
                                    to={route}
                                    onClick={() =>
                                        handleIconClick(
                                            index,
                                            route.substring(1),
                                        )
                                    }
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
                                        transition:
                                            "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
                                        fontWeight:
                                            activePageIndex === index
                                                ? "600"
                                                : "400",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (activePageIndex !== index) {
                                            e.currentTarget.style.backgroundColor = `${theme.buttonBackgroundColor}08`;
                                            e.currentTarget.style.transform =
                                                "translateX(2px)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (activePageIndex !== index) {
                                                                           e.currentTarget.style.backgroundColor =
                                                "transparent";
                                            e.currentTarget.style.transform =
                                                "translateX(0)";
                                        }
                                    }}
                                >
                                    {/* Barra di indicazione a sinistra */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: "0",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            width:
                                                activePageIndex === index
                                                    ? "4px"
                                                    : "0",
                                            height: "60%",
                                            backgroundColor:
                                                theme.buttonBackgroundColor,
                                            borderRadius: "0 4px 4px 0",
                                            transition:
                                                "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
                                </Link>
                            </Tooltip>
                        ))}
                    </div>
                )}

                {!isMobileScreen && (
                    <Notification theme={theme}>
                        <div className="account-container">
                            <div className="account-image-wrapper">
                                <img
                                    src={avatarImage}
                                    title={languages[language].sidebar.account.title}
                                    width="100%"
                                    height="100%"
                                    alt="Account"
                                    className="account-image"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    onContextMenu={(e) => e.preventDefault()}
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
                    </Notification>
                )}
                    {showPopup && (
                        <div className="popup-container">
                            <div className="popup-window">
                                <h3>{selectedOption.label}</h3>
                                {/* Add content for the popup here */}
                            </div>
                            <div
                                className="overlay"
                                onClick={() => setShowPopup(false)}
                            ></div>
                        </div>
                    )}
                    {showAccountModal && (
                        <MuiFixedDimDialog
                            theme={theme}
                            open={showAccountModal}
                            onClose={handleCloseModal}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <MuiCustomDialogTitle id="alert-dialog-title">
                                {languages[language].sidebar.account.title}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogProfileContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    {languages[language].sidebar.account.id}{" "}
                                    {isHidden ? "****" : userId} <br></br>
                                    {/* Username: {username} <br></br> */}
                                    {
                                        languages[language].sidebar.account
                                            .nationality
                                    }{" "}
                                    <Select
                                        value={
                                            isHidden
                                                ? "****"
                                                : userNationality.value
                                        }
                                        onChange={(event) => {
                                            setUserNationality({
                                                key: event.target.value.key,
                                                value: event.target.value.label,
                                            });
                                        }}
                                        style={{
                                            backgroundColor: "white",
                                            height: "2em",
                                            marginBottom: "0.5em",
                                        }}
                                        displayEmpty
                                        renderValue={(value) => {
                                            if (value === "") {
                                                return `${languages[language].sidebar.account.selectNationality}`;
                                            }
                                            return value;
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>
                                                {
                                                    languages[language].sidebar
                                                        .account
                                                        .selectNationality
                                                }
                                            </em>
                                        </MenuItem>
                                        {sortedNationalityTags.map((tag) => (
                                            <MenuItem
                                                key={tag.index}
                                                value={{
                                                    key: tag.index,
                                                    label: tag.translations[
                                                        language
                                                    ],
                                                }}
                                            >
                                                {tag.translations[language]}
                                            </MenuItem>
                                        ))}
                                    </Select>{" "}
                                    <br></br>
                                    {
                                        languages[language].sidebar.account
                                            .whereWork
                                    }{" "}
                                    <Select
                                        value={
                                            isHidden
                                                ? "****"
                                                : userWhereWorks.value
                                        }
                                        onChange={(event) => {
                                            setUserWhereWorks({
                                                key: event.target.value.key,
                                                value: event.target.value.label,
                                            });
                                        }}
                                        style={{
                                            backgroundColor: "white",
                                            height: "2em",
                                            marginBottom: "0.5em",
                                        }}
                                        displayEmpty
                                        renderValue={(value) => {
                                            if (value === "") {
                                                return `${languages[language].sidebar.account.selectWhereWork}`;
                                            }
                                            return value;
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>
                                                {
                                                    languages[language].sidebar
                                                        .account.selectWhereWork
                                                }
                                            </em>
                                        </MenuItem>
                                        {sortedNationalityTags.map((tag) => (
                                            <MenuItem
                                                key={tag.index}
                                                value={{
                                                    key: tag.index,
                                                    label: tag.translations[
                                                        language
                                                    ],
                                                }}
                                            >
                                                {tag.translations[language]}
                                            </MenuItem>
                                        ))}
                                    </Select>{" "}
                                    <br></br>
                                    {
                                        languages[language].sidebar.account.work
                                    }{" "}
                                    <Select
                                        value={
                                            isHidden ? "****" : userJob.value
                                        }
                                        onChange={(event) => {
                                            setUserJob({
                                                key: event.target.value.key,
                                                value: event.target.value.label,
                                            });
                                        }}
                                        style={{
                                            backgroundColor: "white",
                                            height: "2em",
                                            marginBottom: "0.5em",
                                        }}
                                        displayEmpty
                                        renderValue={(value) => {
                                            if (value === "") {
                                                return `${languages[language].sidebar.account.selectWork}`;
                                            }
                                            return value;
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>
                                                {
                                                    languages[language].sidebar
                                                        .account.selectWork
                                                }
                                            </em>
                                        </MenuItem>
                                        {sortedJobTags.map((tag) => (
                                            <MenuItem
                                                key={tag.index}
                                                value={{
                                                    key: tag.index,
                                                    label: tag.translations[
                                                        language
                                                    ],
                                                }}
                                            >
                                                {tag.translations[language]}
                                            </MenuItem>
                                        ))}
                                    </Select>{" "}
                                    <br></br>
                                    {
                                        languages[language].sidebar.account
                                            .workType
                                    }{" "}
                                    <Select
                                        value={
                                            isHidden
                                                ? "****"
                                                : userJobType.value
                                        }
                                        onChange={(event) => {
                                            setUserJobType({
                                                key: event.target.value.key,
                                                value: event.target.value.label,
                                            });
                                        }}
                                        style={{
                                            backgroundColor: "white",
                                            height: "2em",
                                            marginBottom: "0.5em",
                                        }}
                                        displayEmpty
                                        renderValue={(value) => {
                                            if (value === "") {
                                                return `${languages[language].sidebar.account.selectWorkType}`;
                                            }
                                            return value;
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>
                                                {
                                                    languages[language].sidebar
                                                        .account.selectWorkType
                                                }
                                            </em>
                                        </MenuItem>
                                        {jobTypeTags.map((tag) => (
                                            <MenuItem
                                                key={tag.index}
                                                value={{
                                                    key: tag.index,
                                                    label: tag.translations[
                                                        language
                                                    ],
                                                }}
                                            >
                                                {tag.translations[language]}
                                            </MenuItem>
                                        ))}
                                    </Select>{" "}
                                    <br></br>
                                    {
                                        languages[language].sidebar.account
                                            .hoursContract
                                    }{" "}
                                    <Select
                                        value={
                                            isHidden
                                                ? "****"
                                                : userWorkTime.value
                                        }
                                        onChange={(event) => {
                                            setUserWorkTime({
                                                key: event.target.value.key,
                                                value: event.target.value.label,
                                            });
                                        }}
                                        style={{
                                            backgroundColor: "white",
                                            height: "2em",
                                            marginBottom: "0.5em",
                                        }}
                                        displayEmpty
                                        renderValue={(value) => {
                                            if (value === "")
                                                return `${languages[language].sidebar.account.selectHoursContract}`;
                                            return value;
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>
                                                {
                                                    languages[language].sidebar
                                                        .account
                                                        .selectHoursContract
                                                }
                                            </em>
                                        </MenuItem>
                                        {workTimeTags.map((tag) => (
                                            <MenuItem
                                                key={tag.index}
                                                value={{
                                                    key: tag.index,
                                                    label: tag.translations[
                                                        language
                                                    ],
                                                }}
                                            >
                                                {tag.translations[language]}
                                            </MenuItem>
                                        ))}
                                    </Select>{" "}
                                    <br></br>
                                    {
                                        languages[language].sidebar.account
                                            .remoteWork
                                    }{" "}
                                    <Select
                                        value={
                                            isHidden
                                                ? "****"
                                                : userRemoteType.value
                                        }
                                        onChange={(event) => {
                                            setUserRemoteType({
                                                key: event.target.value.key,
                                                value: event.target.value.label,
                                            });
                                        }}
                                        style={{
                                            backgroundColor: "white",
                                            height: "2em",
                                            marginBottom: "0.5em",
                                        }}
                                        displayEmpty
                                        renderValue={(value) => {
                                            if (value === "")
                                                return `${languages[language].sidebar.account.selectRemoteWork}`;
                                            return value;
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>
                                                {
                                                    languages[language].sidebar
                                                        .account
                                                        .selectRemoteWork
                                                }
                                            </em>
                                        </MenuItem>
                                        {remoteTypeTags.map((tag) => (
                                            <MenuItem
                                                key={tag.index}
                                                value={{
                                                    key: tag.index,
                                                    label: tag.translations[
                                                        language
                                                    ],
                                                }}
                                            >
                                                {tag.translations[language]}
                                            </MenuItem>
                                        ))}
                                    </Select>{" "}
                                    <br></br>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogProfileContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton
                                    data-umami-event="profileUpdate"
                                    onClick={handleUpdateProfile}
                                    autoFocus
                                >
                                    {
                                        languages[language].sidebar.account
                                            .saveButton
                                    }
                                </MuiCustomButton>
                            </MuiCustomDialogActions>
                        </MuiFixedDimDialog>
                    )}

                    {showChangeUsernameModal && (
                        <MuiCustomDialog
                            theme={theme}
                            open={showChangeUsernameModal}
                            onClose={handleCloseModal}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <MuiCustomDialogTitle id="alert-dialog-title">
                                {
                                    languages[language].sidebar.changeUsername
                                        .title
                                }
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    {languages[language].sidebar.changeID.info}{" "}
                                    <br></br>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton
                                    data-umami-event="usernameChange"
                                    onClick={handleGenerateUsername}
                                    autoFocus
                                >
                                    {
                                        languages[language].sidebar.changeID
                                            .confirmButton
                                    }
                                </MuiCustomButton>
                            </MuiCustomDialogActions>
                        </MuiCustomDialog>
                    )}

                    {showChangeIDModal && (
                        <MuiCustomDialog
                            theme={theme}
                            open={showChangeIDModal}
                            onClose={handleCloseModal}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <MuiCustomDialogTitle id="alert-dialog-title">
                                {languages[language].sidebar.changeID.title}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    {languages[language].sidebar.changeID.info}{" "}
                                    <br></br>
                                    <form
                                        id="changeID"
                                        onSubmit={handleGenerateID}
                                    >
                                        <MuiCustomTextField
                                            id="passwordChangeID"
                                            theme={theme}
                                            label="Password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={password}
                                            onChange={handlePasswordInput}
                                            required
                                            fullWidth
                                            className="w-3/5"
                                            InputProps={{
                                                endAdornment: (
                                                    <MuiCustomInputAdornment position="end">
                                                        <MuiCustomIconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={
                                                                handleTogglePasswordVisibility
                                                            }
                                                            onMouseDown={
                                                                handleMouseDownPassword
                                                            }
                                                            className=""
                                                        >
                                                            {showPassword ? (
                                                                <EyeVisibility />
                                                            ) : (
                                                                <EyeVisibilityOff />
                                                            )}
                                                        </MuiCustomIconButton>
                                                    </MuiCustomInputAdornment>
                                                ),
                                            }}
                                        />
                                    </form>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton
                                    data-umami-event="IDChange"
                                    onClick={handleGenerateID}
                                    autoFocus
                                >
                                    {
                                        languages[language].sidebar.changeID
                                            .confirmButton
                                    }
                                </MuiCustomButton>
                            </MuiCustomDialogActions>
                        </MuiCustomDialog>
                    )}

                    {showChangePWDModal && (
                        <MuiCustomDialog
                            theme={theme}
                            open={showChangePWDModal}
                            onClose={handleCloseModal}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <MuiCustomDialogTitle
                                theme={theme}
                                id="alert-dialog-title"
                            >
                                {
                                    languages[language].sidebar.changePassword
                                        .title
                                }
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText
                                    theme={theme}
                                    id="alert-dialog-description"
                                >
                                    {
                                        languages[language].sidebar
                                            .changePassword.info
                                    }{" "}
                                    <br></br>
                                    {/* Ti invieremo un'email con un link per il cambio password.<br></br> */}
                                    <form
                                        id="changePWD"
                                        onSubmit={handleChangePassword}
                                    >
                                        <MuiCustomTextField
                                            id="oldPasswordChangePWD"
                                            theme={theme}
                                            label={
                                                languages[language].sidebar
                                                    .changePassword.oldPassword
                                            }
                                            type={
                                                showOldPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={OldPassword}
                                            onChange={handleOldPasswordInput}
                                            required
                                            fullWidth
                                            className="w-3/4"
                                            InputProps={{
                                                endAdornment: (
                                                    <MuiCustomInputAdornment
                                                        theme={theme}
                                                        position="end"
                                                    >
                                                        <MuiCustomIconButton
                                                            theme={theme}
                                                            aria-label="toggle password visibility"
                                                            onClick={
                                                                handleToggleOldPasswordVisibility
                                                            }
                                                            onMouseDown={
                                                                handleMouseDownPassword
                                                            }
                                                            className=""
                                                        >
                                                            {showOldPassword ? (
                                                                <EyeVisibility />
                                                            ) : (
                                                                <EyeVisibilityOff />
                                                            )}
                                                        </MuiCustomIconButton>
                                                    </MuiCustomInputAdornment>
                                                ),
                                            }}
                                        />
                                        <br></br>
                                        <MuiCustomTextField
                                            id="passwordChangePWD"
                                            theme={theme}
                                            label={
                                                languages[language].sidebar
                                                    .changePassword.newPassword
                                            }
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={password}
                                            onChange={handlePasswordInput}
                                            required
                                            fullWidth
                                            className="w-3/4"
                                            InputProps={{
                                                endAdornment: (
                                                    <MuiCustomInputAdornment position="end">
                                                        <MuiCustomIconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={
                                                                handleTogglePasswordVisibility
                                                            }
                                                            onMouseDown={
                                                                handleMouseDownPassword
                                                            }
                                                            className=""
                                                        >
                                                            {showPassword ? (
                                                                <EyeVisibility />
                                                            ) : (
                                                                <EyeVisibilityOff />
                                                            )}
                                                        </MuiCustomIconButton>
                                                    </MuiCustomInputAdornment>
                                                ),
                                            }}
                                        />
                                        <br></br>
                                        <MuiCustomTextField
                                            id="confirmPasswordChangePWD"
                                            theme={theme}
                                            label={
                                                languages[language].sidebar
                                                    .changePassword
                                                    .confirmPassword
                                            }
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={confirmPassword}
                                            onChange={
                                                handleConfirmPasswordInput
                                            }
                                            required
                                            fullWidth
                                            className="w-3/4"
                                            InputProps={{
                                                endAdornment: (
                                                    <MuiCustomInputAdornment position="end">
                                                        <MuiCustomIconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={
                                                                handleToggleConfirmPasswordVisibility
                                                            }
                                                            onMouseDown={
                                                                handleMouseDownPassword
                                                            }
                                                            className=""
                                                        >
                                                            {showConfirmPassword ? (
                                                                <EyeVisibility />
                                                            ) : (
                                                                <EyeVisibilityOff />
                                                            )}
                                                        </MuiCustomIconButton>
                                                    </MuiCustomInputAdornment>
                                                ),
                                            }}
                                        />
                                    </form>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton
                                    data-umami-event="changePassword"
                                    onClick={handleChangePassword}
                                    autoFocus
                                >
                                    {
                                        languages[language].sidebar
                                            .changePassword.confirmButton
                                    }
                                </MuiCustomButton>
                            </MuiCustomDialogActions>
                        </MuiCustomDialog>
                    )}

                    {showID && (
                        <MuiCustomDialog
                            theme={theme}
                            open={showID}
                            onClose={handleCopyToClipboard(newID)}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <MuiCustomDialogTitle id="alert-dialog-title">
                                {languages[language].sidebar.changeID
                                    .successPopup.message + newID}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText
                                    id="alert-dialog-description"
                                    dangerouslySetInnerHTML={{
                                        __html: languages[language].sidebar
                                            .changeID.successPopup
                                            .securityMessage,
                                    }}
                                ></MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton
                                    onClick={handleCopyToClipboard(newID)}
                                    autoFocus
                                >
                                    {
                                        languages[language].sidebar.changeID
                                            .successPopup.toCopy
                                    }
                                </MuiCustomButton>
                            </MuiCustomDialogActions>
                        </MuiCustomDialog>
                    )}

                    {showUsername && (
                        <MuiCustomDialog
                            theme={theme}
                            open={showUsername}
                            onClose={handleCloseSecondaryModal}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <MuiCustomDialogTitle id="alert-dialog-title">
                                {languages[language].sidebar.changeUsername
                                    .successPopup.message + newUsername}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    {
                                        languages[language].sidebar
                                            .changeUsername.successPopup
                                            .securityMessage
                                    }{" "}
                                    <br></br>
                                    {
                                        languages[language].sidebar
                                            .changeUsername.successPopup
                                            .redirectMessage
                                    }{" "}
                                    <br></br>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton
                                    onClick={handleCloseSecondaryModal}
                                    autoFocus
                                >
                                    {
                                        languages[language].sidebar
                                            .changeUsername.successPopup
                                            .okButton
                                    }
                                </MuiCustomButton>
                            </MuiCustomDialogActions>
                        </MuiCustomDialog>
                    )}

                    {showUpdateProfileSuccess && (
                        <MuiCustomDialog
                            theme={theme}
                            open={showUpdateProfileSuccess}
                            onClose={handleCloseModal}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <MuiCustomDialogTitle id="alert-dialog-title">
                                {
                                    languages[language].sidebar.account
                                        .successPopup.title
                                }
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    {
                                        languages[language].sidebar.account
                                            .successPopup.message
                                    }{" "}
                                    <br></br>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton
                                    onClick={handleCloseModal}
                                    autoFocus
                                >
                                    {
                                        languages[language].sidebar.account
                                            .successPopup.okButton
                                    }
                                </MuiCustomButton>
                            </MuiCustomDialogActions>
                        </MuiCustomDialog>
                    )}
                    {showModalDeleteAccount && (
                        <MuiCustomDialog
                            theme={theme}
                            open={showModalDeleteAccount}
                            onClose={handleCloseModal}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <MuiCustomDialogTitle id="alert-dialog-title">
                                {
                                    languages[language].sidebar.deleteAccount
                                        .title
                                }
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    {
                                        languages[language].sidebar
                                            .deleteAccount.info
                                    }{" "}
                                    <br></br>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton
                                    onClick={handleDeleteAccount}
                                    autoFocus
                                >
                                    {
                                        languages[language].sidebar
                                            .deleteAccount.confirmButton
                                    }
                                </MuiCustomButton>
                                <MuiCustomButton
                                    onClick={handleDeleteAccount}
                                    autoFocus
                                >
                                    {
                                        languages[language].sidebar
                                            .deleteAccount.cancelButton
                                    }
                                </MuiCustomButton>
                            </MuiCustomDialogActions>
                        </MuiCustomDialog>
                    )}

                    {showSuccessDeleteAccount && (
                        <MuiCustomDialog
                            theme={theme}
                            open={showSuccessDeleteAccount}
                            onClose={handleCloseModalAndLogout}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <MuiCustomDialogTitle id="alert-dialog-title">
                                {
                                    languages[language].sidebar.deleteAccount
                                        .successPopup.title
                                }
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    {
                                        languages[language].sidebar
                                            .deleteAccount.successPopup.message
                                    }{" "}
                                    <br></br>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton
                                    onClick={handleCloseModalAndLogout}
                                    autoFocus
                                >
                                    {
                                        languages[language].sidebar
                                            .deleteAccount.successPopup.okButton
                                    }
                                </MuiCustomButton>
                            </MuiCustomDialogActions>
                        </MuiCustomDialog>
                    )}

                    {showChangePWDSuccess && (
                        <MuiCustomDialog
                            theme={theme}
                            open={showChangePWDSuccess}
                            onClose={handleCloseModalAndLogout}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <MuiCustomDialogTitle id="alert-dialog-title">
                                {
                                    languages[language].sidebar.changePassword
                                        .successPopup.title
                                }
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    {
                                        languages[language].sidebar
                                            .changePassword.successPopup.message
                                    }{" "}
                                    <br></br>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton
                                    onClick={handleCloseModalAndLogout}
                                    autoFocus
                                >
                                    {
                                        languages[language].sidebar
                                            .changePassword.successPopup
                                            .okButton
                                    }
                                </MuiCustomButton>
                            </MuiCustomDialogActions>
                        </MuiCustomDialog>
                    )}

                    {showChangePWDError && (
                        <MuiCustomDialog
                            theme={theme}
                            open={showChangePWDModal}
                            onClose={handleCloseSecondaryModal}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <MuiCustomDialogTitle id="alert-dialog-title">
                                {
                                    languages[language].sidebar.changePassword
                                        .errorPopup.title
                                }
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent>
                                <MuiCustomDialogContentText
                                    id="alert-dialog-description"
                                    dangerouslySetInnerHTML={{
                                        __html: languages[language].sidebar
                                            .changePassword.errorPopup.message,
                                    }}
                                ></MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton
                                    onClick={handleCloseSecondaryModal}
                                    autoFocus
                                >
                                    {
                                        languages[language].sidebar
                                            .changePassword.errorPopup.okButton
                                    }
                                </MuiCustomButton>
                            </MuiCustomDialogActions>
                        </MuiCustomDialog>
                    )}

                    {showSettingsPopup && (
                        <MuiCustomDialog
                            theme={theme}
                            open={showSettingsPopup}
                            onClose={handleCloseModal}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <MuiCustomDialogTitle id="alert-dialog-title">
                                {languages[language].sidebar.settings.title}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                {/* <MuiCustomDialogContentText id="alert-dialog-description">
                                {languages[language].sidebar.settings.info} <br></br>
                            </MuiCustomDialogContentText> */}

                                <div>
                                    <label>
                                        {
                                            languages[language].sidebar.settings
                                                .light
                                        }
                                    </label>
                                    <SettingsToggleButton
                                        title={
                                            languages[language].sidebar.settings
                                                .light
                                        }
                                        data-umami-event="setTheme-settings"
                                    >
                                        <SidebarToggleModeButton
                                            theme={theme}
                                            mode={mode}
                                            toggleMode={toggleMode}
                                        />
                                    </SettingsToggleButton>
                                </div>

                                <div>
                                    <label>
                                        {
                                            languages[language].sidebar.settings
                                                .privacy
                                        }
                                    </label>
                                    <SettingsToggleButton
                                        title={
                                            languages[language].sidebar.settings
                                                .privacy
                                        }
                                        data-umami-event="setPrivacy-settings"
                                    >
                                        <SidebarPrivacyToggleModeButton
                                            theme={theme}
                                            mode={mode}
                                            toggleHidden={toggleHidden}
                                            isHidden={isHidden}
                                        />
                                    </SettingsToggleButton>
                                </div>

                                <div>
                                    <label>
                                        {
                                            languages[language].sidebar.settings
                                                .language
                                        }
                                    </label>
                                    <SettingsToggleButton
                                        data-umami-event="setLanguage-settings"
                                        onClick={toggleLanguage}
                                    >
                                        {language === "it" ? "IT" : "EN"}
                                    </SettingsToggleButton>
                                </div>

                                <div
                                    style={{ color: "red", marginTop: "20px" }}
                                >
                                    <label>
                                        {" "}
                                        {
                                            languages[language].sidebar.settings
                                                .deleteAccount
                                        }
                                    </label>
                                    <SettingsToggleButton
                                        data-umami-event="deleteAccount-settings"
                                        title="deleteAccountButton"
                                        onClick={() => {
                                            if (
                                                !["test", "demo"].includes(
                                                    userType,
                                                )
                                            ) {
                                                handleShowModalDeleteAccount();
                                            }
                                        }}
                                        style={{
                                            backgroundColor: [
                                                "test",
                                                "demo",
                                            ].includes(userType)
                                                ? "#d3d3d3"
                                                : "",
                                            color: ["test", "demo"].includes(
                                                userType,
                                            )
                                                ? "#a9a9a9"
                                                : "",
                                            cursor: ["test", "demo"].includes(
                                                userType,
                                            )
                                                ? "not-allowed"
                                                : "pointer",
                                        }}
                                        disabled={["test", "demo"].includes(
                                            userType,
                                        )}
                                    >
                                        <FontAwesomeIcon icon={faTrashCan} />
                                        {/* {languages[language].sidebar.deleteAccount.deleteButton}  */}
                                    </SettingsToggleButton>
                                </div>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton
                                    data-umami-event="saveSettings"
                                    onClick={handleCloseModal}
                                    autoFocus
                                >
                                    {
                                        languages[language].sidebar.settings
                                            .saveSettings
                                    }
                                </MuiCustomButton>
                            </MuiCustomDialogActions>
                        </MuiCustomDialog>
                    )}
                </Notification>
            
                {!isMobileScreen && (
                <ToggleButton
                    title={languages[language].sidebar.settings.privacy}
                >
                    <SidebarPrivacyToggleModeButton
                        theme={theme}
                        mode={mode}
                        toggleHidden={toggleHidden}
                        isHidden={isHidden}
                    />
                </ToggleButton>
                )}
            </Top>
            {/* <BuyMeACoffeeWidget isMobileScreen={isMobileScreen}/> */}
        </SidebarSection>
    );
}

export default Sidebar;