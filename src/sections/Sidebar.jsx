import React, {useState, useRef, useContext, useEffect} from 'react';
import { ButtonGroup, Select, MenuItem } from "@mui/material";
import { BiHomeAlt } from "react-icons/bi";
import { AiOutlineFundProjectionScreen, AiOutlineTrophy, AiOutlineDotChart, AiOutlineBell, AiOutlineCaretDown } from "react-icons/ai";
import { BsBook, BsInfoCircle } from "react-icons/bs";
import Tooltip from '@material-ui/core/Tooltip';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { Link } from "react-router-dom";
import avatarImage from "../assets/account-logo.png"
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import LogoPaci from '../components/Logo';
import { ThemeContext } from '../contexts/ThemeContext';
import { UserContext } from '../contexts/UserContext';
import { IconContext } from '../contexts/PageContext';
import {
    SidebarToggleModeButton,
    SidebarSection,
    MyButton,
    Notification,
    DropdownContainer,
    Top,
    Links,
    ToggleButton,
    MuiCustomDialog,
    MuiCustomButton,
    MuiCustomDialogTitle,
    MuiCustomDialogContent,
    MuiCustomDialogProfileContent,
    MuiCustomDialogContentText,
    MuiCustomDialogActions,
    MuiCustomTextField,
    MuiCustomIconButton,
    MuiCustomInputAdornment,
    MuiCustomVisibility,
    MuiCustomVisibilityOff,
    MuiUseStyles,
} from '../contexts/MyStyled';


function Sidebar() {
    const { theme } = useContext(ThemeContext);
    const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useContext(UserContext);
    const inputRef = useRef(null);
    const { activeIcon, setActiveIcon} = useContext(IconContext); // Stato per l'icona attiva
    // const [currentPage, setCurrentPage] = useState('dashboard'); // Stato per la pagina corrente
    const [userId, setUserId] = useState(''); 
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
    const [showChangeUsernameModal, setShowChangeUsernameModal] = useState(false);
    const [showChangePWDModal, setShowChangePWDModal] = useState(false);
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

    const classes = MuiUseStyles();

    const fetchData = async () => {
    
        if (userData) {
          try {
                setUserId(userData.userId);
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
            console.error('Errore durante le operazioni:', error);
          }
        }
    };
  
    useEffect(() => {
      fetchData();
    }, [userData]);

    const options = [
        { value: 'account', label: 'Account' },
        { value: 'changeUsername', label: 'Genera username' },
        { value: 'changeid', label: 'Cambio id' },
        { value: 'changePassword', label: 'Cambio password' },
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

    const handleCopyToClipboard = (newID) => (event) => {
        event.preventDefault();
        navigator.clipboard.writeText(newID)
          .then(() => {
            // Copiato negli appunti con successo
            alert("ID copiato negli appunti: " + newID);
          })
          .catch((error) => {
            console.error("Errore durante la copia negli appunti: " + error);
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
                handleCloseModal();
                setShowChangePWDSuccess(true);
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
            }
            else {
                console.log("Update failed");
                alert("Errore nell'aggiornamento del profilo")
            }
            
        } catch(error) {
            console.error(error);
        }
    };

    return (
        <SidebarSection theme={theme}>
            <Top>
                <LogoPaci />
                <Links theme={theme}>
                    <ul>
                        <Tooltip title="Dashboard" placement="right">
                            <li
                                className={activeIcon === 0 ? "active" : ""}
                            >   
                                <div onClick={() => handleIconClick(0, 'dashboard')}>
                                    <Link to="/dashboard">
                                        <BiHomeAlt />
                                    </Link>
                                </div>
                            </li>
                        </Tooltip>
                        <Tooltip title="I tuoi grafici" placement="right">
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
                        <Tooltip title="Inserimento dati" placement="right">
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
                        <Tooltip title="Controlla i mercati" placement="right">
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
                        <Tooltip title="Classifica" placement="right">
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
                        
                        <Tooltip title="Conoscenze" placement="right">
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
                        <Tooltip title="Info" placement="right">
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
                        
                <Notification theme={theme}>
                    <AiOutlineBell />
                    <div className="account-container">
                        <div className="account-image-wrapper">
                            <img src={avatarImage} width="100%" height="100%" alt="Account" className="account-image" onContextMenu={(e) => e.preventDefault()}/>
                        </div>
                    </div> 
                    <DropdownContainer > {/* style={{ zIndex: 999 }}> */}
                        <div className="dropdown-header" onClick={() => setShowDropdown(!showDropdown)}>
                            <AiOutlineCaretDown />
                        </div>
                        {showDropdown && (
                            <div className="dropdown-menu">
                                {options.map((option) => (
                                    <div
                                        key={option.value}
                                        className={`dropdown-option ${selectedOption === option ? 'selected' : ''}`}
                                        onClick={() => {
                                            if (option.value !== 'changeUsername') {
                                                handleOptionSelect(option);
                                            }
                                        }}
                                        style={{
                                            cursor: option.value === 'changeUsername' ? 'not-allowed' : 'pointer',
                                            opacity: option.value === 'changeUsername' ? 0.5 : 1
                                        }}
                                    >
                                        {option.label}
                                    </div>
                                ))}
                                <div className="dropdown-option logout" onClick={handleLogout}>
                                    Logout
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
                        <MuiCustomDialog theme={theme}
                            open={showAccountModal}
                            onClose={handleCloseModal}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <MuiCustomDialogTitle id="alert-dialog-title">
                                {"Il tuo account"}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogProfileContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    ID: {userId} <br></br>
                                    Username: {username} <br></br>
                                    Nazionalità: <Select
                                                    value={userNationality.value}
                                                    onChange={(event) => {
                                                        
                                                            // const selectedKey = event.target.value;
                                                            // const selectedItem = incomesTags.find((item) => item.index === selectedKey);
                                      
                                                            // if (selectedItem) {
                                                            //   const selectedValue = selectedItem.translations.it;
                                                            //   setCategoryIncome({ key: selectedKey, value: selectedValue });
                                                            // }
                                                       
                                                        setUserNationality({key: event.target.value.key, value: event.target.value.label});
                                                    }}
                                                    style={{ backgroundColor: 'white', height: '2em', marginBottom: '0.5em' }}
                                                    displayEmpty
                                                    renderValue={(value) => {
                                                        if (value === "") {
                                                        return "Seleziona una nazionalità";
                                                        }
                                                        return value;
                                                    }}
                                                    >
                                                    <MenuItem value="">
                                                        <em>Seleziona una nazionalità</em>
                                                    </MenuItem>
                                                    {nationalityTags.map((tag) => (
                                                        <MenuItem key={tag.index} value={{ key: tag.index, label: tag.translations.it }}>
                                                        {tag.translations.it}
                                                        </MenuItem>
                                                    ))}
                                                </Select> <br></br>
                                    Dove lavori: <Select
                                                    value={userWhereWorks.value}
                                                    onChange={(event) => {
                                                        setUserWhereWorks({key: event.target.value.key, value: event.target.value.label});
                                                    }}
                                                    style={{ backgroundColor: 'white', height: '2em', marginBottom: '0.5em' }}
                                                    displayEmpty
                                                    renderValue={(value) => {
                                                        if (value === "") {
                                                        return "Seleziona un luogo di lavoro";
                                                        }
                                                        return value;
                                                    }}
                                                    >
                                                    <MenuItem value="">
                                                        <em>Seleziona un luogo di lavoro</em>
                                                    </MenuItem>
                                                    {nationalityTags.map((tag) => (
                                                        <MenuItem key={tag.index} value={{ key: tag.index, label: tag.translations.it }}>
                                                        {tag.translations.it}
                                                        </MenuItem>
                                                    ))}
                                                </Select> <br></br>
                                    Lavoro: <Select
                                                value={userJob.value}
                                                onChange={(event) => {
                                                    setUserJob({key: event.target.value.key, value: event.target.value.label});
                                                }}
                                                style={{ backgroundColor: 'white', height: '2em', marginBottom: '0.5em' }}
                                                displayEmpty
                                                renderValue={(value) => {
                                                    if (value === "") {
                                                    return "Seleziona il tuo lavoro";
                                                    }
                                                    return value;
                                                }}
                                                >
                                                <MenuItem value="">
                                                    <em>Seleziona il tuo lavoro</em>
                                                </MenuItem>
                                                {jobTags.map((tag) => (
                                                    <MenuItem key={tag.index} value={{ key: tag.index, label: tag.translations.it }}>
                                                    {tag.translations.it}
                                                    </MenuItem>
                                                ))}
                                            </Select> <br></br>
                                    Tipo di lavoro: <Select
                                                        value={userJobType.value}
                                                        onChange={(event) => {
                                                            setUserJobType({key: event.target.value.key, value: event.target.value.label});
                                                        }}
                                                        style={{ backgroundColor: 'white', height: '2em', marginBottom: '0.5em'  }}
                                                        displayEmpty
                                                        renderValue={(value) => {
                                                            if (value === "") {
                                                            return "Seleziona il tipo di lavoro";
                                                            }
                                                            return value;
                                                        }}
                                                        >
                                                        <MenuItem value="">
                                                            <em>Seleziona il tipo di lavoro</em>
                                                        </MenuItem>
                                                        {jobTypeTags.map((tag) => (
                                                            <MenuItem key={tag.index} value={{ key: tag.index, label: tag.translations.it }}>
                                                            {tag.translations.it}
                                                            </MenuItem>
                                                        ))}
                                                    </Select> <br></br>
                                    Part-time | Full-time: <Select
                                                                value={userWorkTime.value}
                                                                onChange={(event) => {
                                                                    setUserWorkTime({key: event.target.value.key, value: event.target.value.label});
                                                                }}
                                                                style={{ backgroundColor: 'white', height: '2em', marginBottom: '0.5em'  }}
                                                                displayEmpty
                                                                renderValue={(value) => {
                                                                    if (value === "") {
                                                                    return "Seleziona il tuo orario di lavoro";
                                                                    }
                                                                    return value;
                                                                }}
                                                                >
                                                                <MenuItem value="">
                                                                    <em>Seleziona il tuo orario di lavoro</em>
                                                                </MenuItem>
                                                                {workTimeTags.map((tag) => (
                                                                    <MenuItem key={tag.index} value={{ key: tag.index, label: tag.translations.it }}>
                                                                    {tag.translations.it}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select> <br></br>
                                    Lavoro remoto: <Select
                                                        value={userRemoteType.value}
                                                        onChange={(event) => {
                                                            setUserRemoteType({key: event.target.value.key, value: event.target.value.label});
                                                        }}
                                                        style={{ backgroundColor: 'white', height: '2em', marginBottom: '0.5em'  }}
                                                        displayEmpty
                                                        renderValue={(value) => {
                                                            if (value === "") {
                                                            return "Seleziona la modalità di lavoro remoto";
                                                            }
                                                            return value;
                                                        }}
                                                        >
                                                        <MenuItem value="">
                                                            <em>Seleziona la modalità di lavoro remoto</em>
                                                        </MenuItem>
                                                        {remoteTypeTags.map((tag) => (
                                                            <MenuItem key={tag.index} value={{ key: tag.index, label: tag.translations.it }}>
                                                            {tag.translations.it}
                                                            </MenuItem>
                                                        ))}
                                                    </Select> <br></br>
                                    
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogProfileContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton onClick={handleUpdateProfile} autoFocus> 
                                    Salva
                                </MuiCustomButton>
                            </MuiCustomDialogActions>
                        </MuiCustomDialog>
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
                                {"GeneraUsername"}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    Per aumentare la tua privacy e il tuo coinvolgimento <br></br>
                                    abbiamo pensato di creare un generatore di Username casuali e univoci.<br></br>
                                    La generazione sarà guidata da alcuni tuoi input. Se sarà necessario potrai cambiarlo in futuro.<br></br>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton onClick={handleGenerateUsername} autoFocus>
                                    Genera Username
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
                                {"Cambio ID"}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText  id="alert-dialog-description">
                                    Per mantenere la tua privacy ti diamo la <br></br> possibilità di 
                                    cambiare il tuo id.<br></br>
                                    Il sistema genererà un nuovo id casuale e univoco.<br></br>
                                    Inserisci la tua password per confermare.<br></br>
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
                                            className={classes.root}
                                            InputProps={{
                                                endAdornment: (
                                                <MuiCustomInputAdornment position="end">
                                                    <MuiCustomIconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleTogglePasswordVisibility}
                                                    onMouseDown={handleMouseDownPassword}
                                                    className={classes.icon}
                                                    >
                                                    {showPassword ? <MuiCustomVisibility /> : <MuiCustomVisibilityOff />}
                                                    </MuiCustomIconButton>
                                                </MuiCustomInputAdornment>
                                                ),
                                            }}
                                        />
                                    </form>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton onClick={handleGenerateID} autoFocus>
                                    Voglio cambiare id
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
                                {"Cambio Password"}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText theme={theme} id="alert-dialog-description">
                                    Per procedere serve che tu inserisca <br></br> 
                                    la tua password attuale e la nuova da te scelta:<br></br>
                                    {/* Ti invieremo un'email con un link per il cambio password.<br></br> */}
                                    <form id="changePWD" onSubmit={handleChangePassword}>
                                        <MuiCustomTextField
                                            id="oldPasswordChangePWD"
                                            theme={theme}
                                            label="Password attuale"
                                            type={showPassword ? 'text' : 'password'}
                                            value={OldPassword}
                                            onChange={handleOldPasswordInput}
                                            required
                                            fullWidth
                                            className={classes.root}
                                            InputProps={{
                                                endAdornment: (
                                                <MuiCustomInputAdornment theme={theme} position="end">
                                                    <MuiCustomIconButton
                                                        theme={theme}
                                                        aria-label="toggle password visibility"
                                                        onClick={handleToggleOldPasswordVisibility}
                                                        onMouseDown={handleMouseDownPassword}
                                                        className={classes.icon}
                                                    >
                                                    {showPassword ? <MuiCustomVisibility /> : <MuiCustomVisibilityOff />}
                                                    </MuiCustomIconButton>
                                                </MuiCustomInputAdornment>
                                                ),
                                            }}
                                        />
                                        <br></br>
                                        <MuiCustomTextField
                                            id="passwordChangePWD"
                                            theme={theme}
                                            label="Nuova Password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={handlePasswordInput}
                                            required
                                            fullWidth
                                            className={classes.root}
                                            InputProps={{
                                                endAdornment: (
                                                <MuiCustomInputAdornment position="end">
                                                    <MuiCustomIconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleTogglePasswordVisibility}
                                                    onMouseDown={handleMouseDownPassword}
                                                    className={classes.icon}
                                                    >
                                                    {showPassword ? <MuiCustomVisibility /> : <MuiCustomVisibilityOff />}
                                                    </MuiCustomIconButton>
                                                </MuiCustomInputAdornment>
                                                ),
                                            }}
                                        />
                                        <br></br>
                                        <MuiCustomTextField
                                            id="confirmPasswordChangePWD"
                                            theme={theme}
                                            label="Conferma Password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={handleConfirmPasswordInput}
                                            required
                                            fullWidth
                                            className={classes.root}
                                            InputProps={{
                                                endAdornment: (
                                                <MuiCustomInputAdornment position="end">
                                                    <MuiCustomIconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleToggleConfirmPasswordVisibility}
                                                    onMouseDown={handleMouseDownPassword}
                                                    className={classes.icon}
                                                    >
                                                    {showPassword ? <MuiCustomVisibility /> : <MuiCustomVisibilityOff />}
                                                    </MuiCustomIconButton>
                                                </MuiCustomInputAdornment>
                                                ),
                                            }}
                                        />
                                    </form>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton onClick={handleChangePassword} autoFocus>
                                    Cambia Password
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
                                {"Il tuo nuovo ID è: " + newID}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    Salvalo, in un posto sicuro, per i tuoi prossimi accessi. <br></br>
                                    Cliccando sul pulsante "Copia il tuo id", verrai reinderizzato <br></br>
                                    alla pagina di accesso  e l'id verrà salvato nei tuoi appunti. <br></br>
                                    Per poterlo incollare nella pagina d'accesso. <br></br>   
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton onClick={handleCopyToClipboard(newID)} autoFocus>
                                    Copia il tuo id
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
                                {"Il tuo nuovo Username è: " + newUsername}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    Salvalo per poter accedere tramite username <br></br> 
                                    Verrai reinderizzato alla pagina di sign-in. <br></br>
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton onClick={handleCloseSecondaryModal} autoFocus>
                                    Ok, va bene
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
                                {"Profilo aggiornato"}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                Le informazioni del tuo profilo sono state aggiornate e salvate correttamente. <br></br> 
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton onClick={handleCloseModal} autoFocus>
                                    Ok, va bene
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
                                {"La tua password è stata reimpostata correttamente"}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent theme={theme}>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    Verrai renderizzato alla pagina di accesso. <br></br> 
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions>
                                <MuiCustomButton onClick={handleCloseModalAndLogout} autoFocus>
                                    Ok, va bene
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
                                {"Errore nel reimpostare la tua password"}
                            </MuiCustomDialogTitle>
                            <MuiCustomDialogContent>
                                <MuiCustomDialogContentText id="alert-dialog-description">
                                    Sembra che la nuova password e la confirm non siano uguali <br></br> o che la vecchia password non sia corretta <br></br> 
                                </MuiCustomDialogContentText>
                            </MuiCustomDialogContent>
                            <MuiCustomDialogActions >
                                <MuiCustomButton onClick={handleCloseSecondaryModal} autoFocus>
                                    Ok, va bene
                                </MuiCustomButton>
                            </MuiCustomDialogActions>
                        </MuiCustomDialog>
                    )}

                </Notification>

                <ToggleButton>
                    <SidebarToggleModeButton theme={theme} />
                </ToggleButton>
            </Top>
        </SidebarSection>
  );
}

export default Sidebar