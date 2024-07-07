import React, {useState, useRef, useContext, useEffect} from 'react';
// import ReactSelect from 'react-select';
import { Select, MenuItem } from "@mui/material";
import { BiHomeAlt } from "react-icons/bi";
import { AiOutlineFundProjectionScreen, AiOutlineTrophy, AiOutlineDotChart, AiOutlineCaretDown } from "react-icons/ai";
import { BsBook, BsInfoCircle } from "react-icons/bs";
import Tooltip from '@mui/material/Tooltip';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { Link } from "react-router-dom";
import avatarImage from "../assets/account-logo.png"
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import LogoPaci from '../components/Logo';
import { ThemeContext } from '../contexts/ThemeContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { IconContext } from '../contexts/PageContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import languages from '../data/languages.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import BuyMeACoffeeWidget from '../components/BuyMeACoffeeWidget';
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
    EyeVisibilityOff
} from '../styles/MyStyled';
import { Media } from 'reactstrap';
// import PrivacyToggleModeButton from '../components/PrivacyToggleModeButton';


function Sidebar({ userData, handleSetIsUpdated, handleSetIsAuthenticated }) {
    const inputRef = useRef(null);
    const { theme, toggleMode } = useContext(ThemeContext);
    const { mode } = theme;
    const { isHidden, toggleHidden } = useContext(PrivacyContext);
    const { language, toggleLanguage } = useContext(LanguageContext);
    const { isMobileScreen } = useContext(MediaQueryContext);
    const [isSideBarMenuOpen, setIsSideBarMenuOpen] = useState(false);
    const { activeIcon, setActiveIcon} = useContext(IconContext); // Stato per l'icona attiva
    // const [currentPage, setCurrentPage] = useState('dashboard'); // Stato per la pagina corrente
    const [userId, setUserId] = useState('');
    const [userType, setUserType] = useState(''); // [0, 1, 2, 3] -> [regular, premium, test, demo]
    const [username, setUsername] = useState(''); 
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
    const [showChangePWDSuccess, setShowChangePWDSuccess]= useState(false);
    const [showChangePWDError, setShowChangePWDError] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [OldId, setOldId] = useState('');
    const [newID, setNewID] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [OldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

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
            console.error('Error:', error);
          }
        }
    };
  
    useEffect(() => {
      fetchData();
    }, [userData]);

    const options = [
        { value: 'account', label: languages[language].sidebar.account.title },
        { value: 'changeUsername', label: languages[language].sidebar.changeUsername.title },
        { value: 'changeid', label: languages[language].sidebar.changeID.title },
        { value: 'changePassword', label: languages[language].sidebar.changePassword.title },
        { value: 'settings', label: languages[language].sidebar.settings.title },
    ];

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
            const response = await axios.post('/user/delete', { withCredentials: true });
            if(response.status === 200) {
                handleSetIsAuthenticated(false); // Set the user authentication to false
                navigate('/'); //direct redirect
                //window.umami.trackEvent('deleteAccount', 'Account');
                setShowSuccessDeleteAccount(true);
            }
            else {
                console.log("Delete account failed");
            }

        } catch (error) {
            console.error(error);
        }
    };

    const handleCopyToClipboard = (newID) => (event) => {
        event.preventDefault();
        navigator.clipboard.writeText(newID)
          .then(() => {
            // Copiato negli appunti con successo
            alert(languages[language].sidebar.changeID.message + newID);
          })
          .catch((error) => {
            console.error(languages[language].sidebar.changeID.errorCopy + error);
          });
        handleCloseModalAndLogout();
    }


    const handleOptionSelect = (option) => {
        // console.log(`Option selected:`, option);
        // console.log(`Option selected:`, option.value);
        if (option && option.value) {
            setSelectedOption(option);
            if(option.value === 'account') setShowAccountModal(true);
            else if(option.value === 'changeUsername') setShowChangeUsernameModal(true);
            else if(option.value === 'changeid') setShowChangeIDModal(true);
            else if(option.value === 'changePassword') setShowChangePWDModal(true);
            else if(option.value === 'settings') setShowSettingsPopup(true);
            // if(selectedOption.value === 'account') setShowAccountModal(true);
            // else if(selectedOption.value === 'changeUsername') setShowChangeUsernameModal(true);
            // else if(selectedOption.value === 'changeid') setShowChangeIDModal(true);
            // else if(selectedOption.value === 'changePassword') setShowChangePWDModal(true);
            setShowDropdown(false);
        }

    };

    const handleGenerateID = async (event) => {
        event.preventDefault();
        try{
            handleCloseModal();
            const data = {
                password: password
            }
            const response = await axios.post('/user/set-id', data, { withCredentials: true }); //only the first element of the array is needed (the last one)
            const newID = response.data.new_id;
            setNewID(newID);
            setShowID(true);
            event.preventDefault();    
            //window.umami.trackEvent('changedID', 'ID');
        }
        catch(error){
            console.log(error);
        }

    };

    const handleGenerateUsername = async (event) => {
        event.preventDefault();
        try{
            const response = await axios.post('/user/set-username', null, { withCredentials: true }); //only the first element of the array is needed (the last one)
            const newUsername = response.data;
            setNewUsername(newUsername);
            setShowUsername(true);
            //window.umami.trackEvent('changedUsername', 'Username');
        }   
        catch(error){
            console.log(error);
        }
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();
        try{
            if(password === confirmPassword){ 
                const data = {
                    old_pwd: OldPassword,
                    new_pwd: password,
                    repeated_pwd: confirmPassword
                }
                const response = await axios.post('/user/set-password', data, { withCredentials: true }); //only the first element of the array is needed (the last one)
                if(response.status === 200) {
                    handleCloseModal();
                    setShowChangePWDSuccess(true);
                    //window.umami.trackEvent('changedPassword', 'Password');
                }
                else {
                    console.log("Change password failed");
                }
            }
        }
        catch(error){
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
        navigate('/');
    };

    const handleLogout = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('/logout', null, { withCredentials: true });
            if(response.status === 200) {
                handleSetIsAuthenticated(false); // Set the user authentication to false
                navigate('/'); //direct redirect 
                //window.umami.trackEvent('logout', 'Logut');
            }
            else {
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
                remote_type: userRemoteType.key
            }
            const response = await axios.post('/user/set', data, { withCredentials: true });
            if(response.status === 200) {
                handleSetIsUpdated(false); // Forza il re-render di UserProvider
                fetchData();
                setShowAccountModal(false);
                setShowUpdateProfileSuccess(true);
                //window.umami.trackEvent('updateAccount', 'Account');
            }
            else {
                console.log("Update failed");
                alert(languages[language].sidebar.account.errorUpdateProfile)
            }
            
        } catch(error) {
            console.error(error);
        }
    };

    const HamburgerMenu = () => (
        <div onClick={() => setIsSideBarMenuOpen(false)}>
          <div className={`hamburger-menu ${isSideBarMenuOpen ? 'open' : ''} bg-white rounded-md cursor-pointer p-0.5 px-1.5 ml-4 absolute top-4 right-4 flex flex-col z-50`}>
            <FontAwesomeIcon icon={faBars} onClick={(e) => {e.stopPropagation(); setIsSideBarMenuOpen(!isSideBarMenuOpen)}} />
          </div>
          {isSideBarMenuOpen ? (
            <div className={`hamburger-menu ${isSideBarMenuOpen ? 'open' : ''} bg-white rounded-md cursor-pointer p-0.5 px-1.5 ml-10 absolute top-11 right-4 flex flex-col z-9000`}>
              <button className="text-black hover:text-white hover:bg-paciGreen hover:font-bold rounded-md p-0.5" onClick={() => navigate('/dashboard')}>
                Dashboard
              </button>
              <button className="text-black hover:text-white hover:bg-paciGreen hover:font-bold rounded-md p-0.5" onClick={() => navigate('/your-charts')}>
                    {languages[language].sidebar.graphs}
                </button>
                <button className="text-black hover:text-white hover:bg-paciGreen hover:font-bold rounded-md p-0.5" onClick={() => navigate('/insert-values')}>
                    {languages[language].sidebar.insert}
                </button>
                <button className="text-black hover:text-white hover:bg-paciGreen hover:font-bold rounded-md p-0.5" onClick={() => navigate('/check-prices')}>
                    {languages[language].sidebar.check}
                </button>
                <button className="text-black hover:text-white hover:bg-paciGreen hover:font-bold rounded-md p-0.5" onClick={() => navigate('/leaderboard')}>
                    {languages[language].sidebar.leaderboard}
                </button>
                <button className="text-black hover:text-white hover:bg-paciGreen hover:font-bold rounded-md p-0.5" onClick={() => navigate('/knowledge')}>
                    {languages[language].sidebar.learn}
                </button>
                <button className="text-black hover:text-white hover:bg-paciGreen hover:font-bold rounded-md p-0.5" onClick={() => navigate('/info')}>
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
    const otherNationalityOption = nationalityTags.find(tag => tag.index === 9999); // option "Altro" ("Other")
    const otherNationalityTags = nationalityTags.filter(tag => tag.index !== 9999); // Remove the "Other" option from the array

    // Sort the other tags alphabetically
    const sortedNationalityTags = otherNationalityTags.sort((a, b) => a.translations.it.localeCompare(b.translations.it));

    // Add the "Other" option back to the end of the array
    if (otherNationalityOption ) {
        sortedNationalityTags.push(otherNationalityOption);
    }

    const otherJobOption = jobTags.find(tag => tag.index === 9999); // option "Altro" ("Other")
    const otherJobTags = jobTags.filter(tag => tag.index !== 9999); // Remove the "Other" option from the array

    // Sort the other tags alphabetically
    const sortedJobTags = otherJobTags.sort((a, b) => a.translations.it.localeCompare(b.translations.it));

    // Add the "Other" option back to the end of the array
    if (otherJobOption ) {
        sortedJobTags.push(otherJobOption);
    }

    

    return (
        // <section className="font-roboto fixed top-0 md:left-0 bg-paciGray h-screen w-5 flex flex-row md:flex-col items-center justify-between p-4 md:p-8 gap-8 sm:sticky sm:mr-8 sm:w-screen sm:h-20 sm:gap-4">
        <SidebarSection theme={theme}>
            <Top>
                <LogoPaci />
                {isMobileScreen ? (
                    <HamburgerMenu /> 
                ) : (
                    <Links theme={theme}>
                        <ul>
                            <Tooltip title="Dashboard" placement="right">
                                <li
                                    className={activeIcon === 0 ? "active" : ""}
                                >   
                                    <div onClick={() => handleIconClick(0, 'dashboard')} >
                                        <Link to="/dashboard">
                                            <BiHomeAlt />
                                        </Link>
                                    </div>
                                </li>
                            </Tooltip>
                            <Tooltip title={languages[language].sidebar.graphs} placement="right">
                                <li
                                    className={activeIcon === 1 ? "active" : ""}
                                >
                                    <div onClick={() => handleIconClick(1, 'your-charts')}>
                                        <Link to="/your-charts">
                                            <AiOutlineDotChart />
                                        </Link>
                                    </div>
                                </li>
                            </Tooltip>
                            <Tooltip title={languages[language].sidebar.insert} placement="right">
                                <li
                                    className={activeIcon === 2 ? "active" : ""}
                                >
                                    <div onClick={() => handleIconClick(2, 'insert-values')}>
                                        <Link to="/insert-values">
                                            <HiOutlinePencilAlt />
                                        </Link>
                                    </div>
                                </li>
                            </Tooltip>
                            <Tooltip title={languages[language].sidebar.check} placement="right">
                                <li
                                    className={activeIcon === 3 ? "active" : ""}
                                >
                                    <div onClick={() => handleIconClick(3, 'check-prices')}>
                                        <Link to="/check-prices">
                                            <AiOutlineFundProjectionScreen />
                                        </Link>
                                    </div>
                                </li>
                            </Tooltip>
                            <Tooltip title={languages[language].sidebar.leaderboard} placement="right">
                                <li
                                    className={activeIcon === 4 ? "active" : ""}
                                >
                                    <div onClick={() => handleIconClick(4, 'leaderboard')}>
                                        <Link to="/leaderboard">
                                            <AiOutlineTrophy />
                                        </Link>
                                    </div>
                                </li>
                            </Tooltip>
                            
                            <Tooltip title={languages[language].sidebar.learn} placement="right">
                                <li
                                    className={activeIcon === 5 ? "active" : ""}
                                >
                                    <div onClick={() => handleIconClick(5, 'knowledge')}>
                                        <Link to="/knowledge">
                                            <BsBook />
                                        </Link>
                                    </div>
                                </li>
                            </Tooltip>
                            <Tooltip title={languages[language].sidebar.info} placement="right">
                                <li
                                    className={activeIcon === 6 ? "active" : ""}
                                >
                                    <div onClick={() => handleIconClick(6, 'info')}>
                                        <Link to="/info">
                                                <BsInfoCircle/>
                                        </Link>
                                    </div>
                                </li>
                            </Tooltip>
                            
                        </ul>
                    </Links>
                )}
                        
                <Notification theme={theme}>
                    {/* <AiOutlineBell /> */}
                    <div className="account-container">
                        <div className="account-image-wrapper">
                            <img src={avatarImage} title={languages[language].sidebar.account.title} width="100%" height="100%" alt="Account" className="account-image" onClick={() => setShowDropdown(!showDropdown)} onContextMenu={(e) => e.preventDefault()}/>
                        </div>
                    </div>
                    {/* <div className="dropdown-header" onClick={() => setShowDropdown(!showDropdown)}>
                            <AiOutlineCaretDown />
                        </div> */}
                    <DropdownContainer> 
                        {showDropdown && (
                            <div className="dropdown-menu">
                                {options.map((option) => {
                                    // Aggiorna qui la condizione per controllare se userType è 'test' o 'demo'
                                    
                                    const isDisabled = ['changeUsername'].includes(option.value) || (['changeid', 'changePassword'].includes(option.value) && (userType === 'test' || userType === 'demo'));
                                    return (
                                        <div
                                            key={option.value}
                                            className={`dropdown-option ${selectedOption === option ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                            onClick={() => {
                                                if (!isDisabled) {
                                                    handleOptionSelect(option);
                                                }
                                            }}
                                            style={{
                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                opacity: isDisabled ? 0.5 : 1,
                                                // Aggiungi qui ulteriori stili per rendere l'opzione più grigia se necessario
                                                backgroundColor: isDisabled ? '#d3d3d3' : ''
                                            }}
                                        >
                                            {option.label}
                                        </div>
                                    );
                                })}
                                <div data-umami-event="logoutButton" className="dropdown-option logout" onClick={handleLogout}>
                                    {languages[language].sidebar.logout}
                                </div>
                            </div>
                        )}
                    </DropdownContainer>
                    {showPopup && (
                        <div className="popup-container">
                            <div className="popup-window">
                            <h3>{selectedOption.label}</h3>
                            {/* Add content for the popup here */}
                            </div>
                            <div className="overlay" onClick={() => setShowPopup(false)}></div>
                        </div>
                    )}
                    {showAccountModal && (
                        <MuiFixedDimDialog theme={theme}
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
                                    {languages[language].sidebar.account.id} {isHidden ? '****' : userId} <br></br>
                                    {/* Username: {username} <br></br> */}
                                    {languages[language].sidebar.account.nationality} <Select
                                                    value={isHidden ? '****' : userNationality.value}
                                                    onChange={(event) => {
                                                       
                                                        setUserNationality({key: event.target.value.key, value: event.target.value.label});
                                                    }}
                                                    style={{ backgroundColor: 'white', height: '2em', marginBottom: '0.5em' }}
                                                    displayEmpty
                                                    renderValue={(value) => {
                                                        if (value === "") {
                                                            return `${languages[language].sidebar.account.selectNationality}`;
                                                        }
                                                        return value;
                                                    }}
                                                    >
                                                    <MenuItem value="">
                                                        <em>{languages[language].sidebar.account.selectNationality}</em>
                                                    </MenuItem>
                                                    {sortedNationalityTags.map((tag) => (
                                                        <MenuItem key={tag.index} value={{ key: tag.index, label: tag.translations[language] }}>
                                                        {tag.translations[language]}
                                                        </MenuItem>
                                                    ))}
                                                </Select> <br></br>
                                    {languages[language].sidebar.account.whereWork} <Select
                                                    value={isHidden ? '****' : userWhereWorks.value}
                                                    onChange={(event) => {
                                                        setUserWhereWorks({key: event.target.value.key, value: event.target.value.label});
                                                    }}
                                                    style={{ backgroundColor: 'white', height: '2em', marginBottom: '0.5em' }}
                                                    displayEmpty
                                                    renderValue={(value) => {
                                                        if (value === "") {
                                                        return `${languages[language].sidebar.account.selectWhereWork}`;
                                                        }
                                                        return value;
                                                    }}
                                                    >
                                                    <MenuItem value="">
                                                        <em>{languages[language].sidebar.account.selectWhereWork}</em>
                                                    </MenuItem>
                                                    {sortedNationalityTags.map((tag) => (
                                                        <MenuItem key={tag.index} value={{ key: tag.index, label: tag.translations[language] }}>
                                                        {tag.translations[language]}
                                                        </MenuItem>
                                                    ))}
                                                </Select> <br></br>
                                    {languages[language].sidebar.account.work} <Select
                                                value={isHidden ? '****' : userJob.value}
                                                onChange={(event) => {
                                                    setUserJob({key: event.target.value.key, value: event.target.value.label});
                                                }}
                                                style={{ backgroundColor: 'white', height: '2em', marginBottom: '0.5em' }}
                                                displayEmpty
                                                renderValue={(value) => {
                                                    if (value === "") {
                                                    return `${languages[language].sidebar.account.selectWork}`;
                                                    }
                                                    return value;
                                                }}
                                                >
                                                <MenuItem value="">
                                                    <em>{languages[language].sidebar.account.selectWork}</em>
                                                </MenuItem>
                                                {sortedJobTags.map((tag) => (
                                                    <MenuItem key={tag.index} value={{ key: tag.index, label: tag.translations[language] }}>
                                                    {tag.translations[language]}
                                                    </MenuItem>
                                                ))}
                                            </Select> <br></br>
                                    {languages[language].sidebar.account.workType} <Select
                                                        value={isHidden ? '****' : userJobType.value}
                                                        onChange={(event) => {
                                                            setUserJobType({key: event.target.value.key, value: event.target.value.label});
                                                        }}
                                                        style={{ backgroundColor: 'white', height: '2em', marginBottom: '0.5em'  }}
                                                        displayEmpty
                                                        renderValue={(value) => {
                                                            if (value === "") {
                                                            return `${languages[language].sidebar.account.selectWorkType}`;
                                                            }
                                                            return value;
                                                        }}
                                                        >
                                                        <MenuItem value="">
                                                            <em>{languages[language].sidebar.account.selectWorkType}</em>
                                                        </MenuItem>
                                                        {jobTypeTags.map((tag) => (
                                                            <MenuItem key={tag.index} value={{ key: tag.index, label: tag.translations[language] }}>
                                                            {tag.translations[language]}
                                                            </MenuItem>
                                                        ))}
                                                    </Select> <br></br>
                                    {languages[language].sidebar.account.hoursContract} <Select
                                                                value={isHidden ? '****' : userWorkTime.value}
                                                                onChange={(event) => {
                                                                    setUserWorkTime({key: event.target.value.key, value: event.target.value.label});
                                                                }}
                                                                style={{ backgroundColor: 'white', height: '2em', marginBottom: '0.5em'  }}
                                                                displayEmpty
                                                                renderValue={(value) => {
                                                                    if (value === "") return `${languages[language].sidebar.account.selectHoursContract}`;
                                                                    return value;
                                                                }}
                                                                >
                                                                <MenuItem value="">
                                                                    <em>{languages[language].sidebar.account.selectHoursContract}</em>
                                                                </MenuItem>
                                                                {workTimeTags.map((tag) => (
                                                                    <MenuItem key={tag.index} value={{ key: tag.index, label: tag.translations[language] }}>
                                                                    {tag.translations[language]}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select> <br></br>
                                    {languages[language].sidebar.account.remoteWork} <Select
                                                        value={isHidden ? '****' : userRemoteType.value}
                                                        onChange={(event) => {
                                                            setUserRemoteType({key: event.target.value.key, value: event.target.value.label});
                                                        }}
                                                        style={{ backgroundColor: 'white', height: '2em', marginBottom: '0.5em'  }}
                                                        displayEmpty
                                                        renderValue={(value) => {
                                                            if (value === "") return `${languages[language].sidebar.account.selectRemoteWork}`;
                                                            return value;
                                                        }}
                                                        >
                                                        <MenuItem value="">
                                                            <em>{languages[language].sidebar.account.selectRemoteWork}</em>
                                                        </MenuItem>
                                                        {remoteTypeTags.map((tag) => (
                                                            <MenuItem key={tag.index} value={{ key: tag.index, label: tag.translations[language] }}>
                                                            {tag.translations[language]}
                                                            </MenuItem>
                                                        ))}
                                                    </Select> <br></br>
                                    
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogProfileContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton data-umami-event="profileUpdate" onClick={handleUpdateProfile} autoFocus> 
                                    {languages[language].sidebar.account.saveButton}
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
                                {languages[language].sidebar.changeUsername.title}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    {languages[language].sidebar.changeID.info} <br></br>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton data-umami-event="usernameChange" onClick={handleGenerateUsername} autoFocus>
                                    {languages[language].sidebar.changeID.confirmButton}
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
                                <MuiCustomDialogContentText  id="alert-dialog-description">
                                    {languages[language].sidebar.changeID.info} <br></br>
                                    <form id="changeID" onSubmit={handleGenerateID}>
                                        <MuiCustomTextField
                                            id="passwordChangeID"
                                            theme={theme}
                                            label="Password"
                                            type={showPassword ? 'text' : 'password'}
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
                                                    onClick={handleTogglePasswordVisibility}
                                                    onMouseDown={handleMouseDownPassword}
                                                    className=""
                                                    >
                                                    {showPassword ? <EyeVisibility /> : <EyeVisibilityOff />}
                                                    </MuiCustomIconButton>
                                                </MuiCustomInputAdornment>
                                                ),
                                            }}
                                        />
                                    </form>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton data-umami-event="IDChange" onClick={handleGenerateID} autoFocus>
                                    {languages[language].sidebar.changeID.confirmButton}
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
                            <MuiCustomDialogTitle theme={theme} id="alert-dialog-title">
                                {languages[language].sidebar.changePassword.title}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText theme={theme} id="alert-dialog-description">
                                    {languages[language].sidebar.changePassword.info} <br></br>
                                    {/* Ti invieremo un'email con un link per il cambio password.<br></br> */}
                                    <form id="changePWD" onSubmit={handleChangePassword}>
                                        <MuiCustomTextField
                                            id="oldPasswordChangePWD"
                                            theme={theme}
                                            label={languages[language].sidebar.changePassword.oldPassword}
                                            type={showOldPassword ? 'text' : 'password'}
                                            value={OldPassword}
                                            onChange={handleOldPasswordInput}
                                            required
                                            fullWidth
                                            className="w-3/4"
                                            InputProps={{
                                                endAdornment: (
                                                <MuiCustomInputAdornment theme={theme} position="end">
                                                    <MuiCustomIconButton
                                                        theme={theme}
                                                        aria-label="toggle password visibility"
                                                        onClick={handleToggleOldPasswordVisibility}
                                                        onMouseDown={handleMouseDownPassword}
                                                        className=""
                                                    >
                                                    {showOldPassword ? <EyeVisibility /> : <EyeVisibilityOff />}
                                                    </MuiCustomIconButton>
                                                </MuiCustomInputAdornment>
                                                ),
                                            }}
                                        />
                                        <br></br>
                                        <MuiCustomTextField
                                            id="passwordChangePWD"
                                            theme={theme}
                                            label={languages[language].sidebar.changePassword.newPassword}
                                            type={showPassword ? 'text' : 'password'}
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
                                                        onClick={handleTogglePasswordVisibility}
                                                        onMouseDown={handleMouseDownPassword}
                                                        className=""
                                                        >
                                                        {showPassword ? <EyeVisibility /> : <EyeVisibilityOff />}
                                                    </MuiCustomIconButton>
                                                </MuiCustomInputAdornment>
                                                ),
                                            }}
                                        />
                                        <br></br>
                                        <MuiCustomTextField
                                            id="confirmPasswordChangePWD"
                                            theme={theme}
                                            label={languages[language].sidebar.changePassword.confirmPassword}
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={handleConfirmPasswordInput}
                                            required
                                            fullWidth
                                            className="w-3/4"
                                            InputProps={{
                                                endAdornment: (
                                                <MuiCustomInputAdornment position="end">
                                                    <MuiCustomIconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleToggleConfirmPasswordVisibility}
                                                        onMouseDown={handleMouseDownPassword}
                                                        className=""
                                                        >
                                                        {showConfirmPassword ? <EyeVisibility /> : <EyeVisibilityOff />}
                                                    </MuiCustomIconButton>
                                                </MuiCustomInputAdornment>
                                                ),
                                            }}
                                        />
                                    </form>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton data-umami-event="changePassword" onClick={handleChangePassword} autoFocus>
                                    {languages[language].sidebar.changePassword.confirmButton}
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
                                {languages[language].sidebar.changeID.successPopup.message + newID}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description"
                                    dangerouslySetInnerHTML={{ __html: languages[language].sidebar.changeID.successPopup.securityMessage}}>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton onClick={handleCopyToClipboard(newID)} autoFocus>
                                    {languages[language].sidebar.changeID.successPopup.toCopy}
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
                                {languages[language].sidebar.changeUsername.successPopup.message + newUsername}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    {languages[language].sidebar.changeUsername.successPopup.securityMessage}  <br></br> 
                                    {languages[language].sidebar.changeUsername.successPopup.redirectMessage} <br></br>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton onClick={handleCloseSecondaryModal} autoFocus>
                                    {languages[language].sidebar.changeUsername.successPopup.okButton}
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
                                {languages[language].sidebar.account.successPopup.title}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    {languages[language].sidebar.account.successPopup.message} <br></br> 
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton onClick={handleCloseModal} autoFocus>
                                    {languages[language].sidebar.account.successPopup.okButton}
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
                                {languages[language].sidebar.deleteAccount.title}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>

                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    {languages[language].sidebar.deleteAccount.info} <br></br>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton onClick={handleDeleteAccount} autoFocus>
                                    {languages[language].sidebar.deleteAccount.confirmButton}
                                </MuiCustomButton>
                                <MuiCustomButton onClick={handleDeleteAccount} autoFocus>
                                    {languages[language].sidebar.deleteAccount.cancelButton}
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
                                {languages[language].sidebar.deleteAccount.successPopup.title}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    {languages[language].sidebar.deleteAccount.successPopup.message} <br></br>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton onClick={handleCloseModalAndLogout} autoFocus>
                                    {languages[language].sidebar.deleteAccount.successPopup.okButton}
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
                                {languages[language].sidebar.changePassword.successPopup.title}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    {languages[language].sidebar.changePassword.successPopup.message} <br></br> 
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton onClick={handleCloseModalAndLogout} autoFocus>
                                    {languages[language].sidebar.changePassword.successPopup.okButton}
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
                                {languages[language].sidebar.changePassword.errorPopup.title}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent>
                                <MuiCustomDialogContentText id="alert-dialog-description" 
                                    dangerouslySetInnerHTML={{ __html: languages[language].sidebar.changePassword.errorPopup.message}}>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions >
                                <MuiCustomButton onClick={handleCloseSecondaryModal} autoFocus>
                                    {languages[language].sidebar.changePassword.errorPopup.okButton}
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
                                    <label>{languages[language].sidebar.settings.light}</label>
                                    <SettingsToggleButton title={languages[language].sidebar.settings.light} data-umami-event="setTheme-settings">
                                        <SidebarToggleModeButton theme={theme} mode={mode} toggleMode={toggleMode}/>
                                    </SettingsToggleButton>
                                </div>

                                <div>
                                    <label>{languages[language].sidebar.settings.privacy}</label>
                                    <SettingsToggleButton title={languages[language].sidebar.settings.privacy} data-umami-event="setPrivacy-settings">
                                        <SidebarPrivacyToggleModeButton theme={theme} mode={mode} toggleHidden={toggleHidden} isHidden={isHidden}/>
                                    </SettingsToggleButton>
                                </div>

                                <div>
                                    <label>{languages[language].sidebar.settings.language}</label>
                                    <SettingsToggleButton data-umami-event="setLanguage-settings" onClick={toggleLanguage}>
                                        {language === 'it' ? 'IT' : 'EN'} 
                                    </SettingsToggleButton>
                                </div>

                                <div style={{color: 'red', marginTop: '20px'}}>
                                    <label> {languages[language].sidebar.settings.deleteAccount}</label>
                                    <SettingsToggleButton 
                                        data-umami-event="deleteAccount-settings" 
                                        title="deleteAccountButton" 
                                        onClick={() => {
                                            if (!['test', 'demo'].includes(userType)) {
                                                handleShowModalDeleteAccount();
                                            }
                                        }}
                                        style={{ 
                                            backgroundColor: ['test', 'demo'].includes(userType) ? '#d3d3d3' : '', 
                                            color: ['test', 'demo'].includes(userType) ? '#a9a9a9' : '',
                                            cursor: ['test', 'demo'].includes(userType) ? 'not-allowed' : 'pointer'
                                        }}
                                        disabled={['test','demo'].includes(userType)}>
                                        
                                        <FontAwesomeIcon icon={faTrashCan} />
                                        {/* {languages[language].sidebar.deleteAccount.deleteButton}  */}
                                    </SettingsToggleButton>
                                </div>

                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                            <MuiCustomButton data-umami-event="saveSettings" onClick={handleCloseModal} autoFocus>
                                {languages[language].sidebar.settings.saveSettings}
                            </MuiCustomButton>
                            </MuiCustomDialogActions>
                        </MuiCustomDialog>
                    )}

                </Notification>

                {/* <ToggleButton title={languages[language].sidebar.settings.light}>
                    <SidebarToggleModeButton theme={theme} mode={mode} toggleMode={toggleMode}/>
                </ToggleButton> */}

                <ToggleButton title={languages[language].sidebar.settings.privacy} >
                    <SidebarPrivacyToggleModeButton theme={theme} mode={mode} toggleHidden={toggleHidden} isHidden={isHidden}/>
                </ToggleButton>
                
            </Top>
            {/* <BuyMeACoffeeWidget isMobileScreen={isMobileScreen}/> */}
        </SidebarSection>
  );
}

export default Sidebar