import React, {useState, useRef, useContext} from 'react';
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
// import {
//     SidebarToggleModeButton,
//     SidebarSection,
//     MyButton,
//     MuiCustomDialog,
//     MuiCustomButton,
//     MuiCustomDialogTitle,
//     MuiCustomDialogContent,
//     MuiCustomDialogContentText,
//     MuiCustomDialogActions,
//     MuiCustomTextField,
//     MuiCustomIconButton,
//     MuiCustomInputAdornment,
//     MuiCustomVisibility,
//     MuiCustomVisibilityOff,
//     MuiUseStyles,
// } from '../contexts/MyStyled';

import MyStyled from '../contexts/MyStyled';


function Sidebar() {
    const inputRef = useRef(null);
    const [currentLink, setCurrentLink] = useState(1);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showChangeIDModal, setShowChangeIDModal] = useState(false);
    const [showID, setShowID] = useState(false);
    const [showUsername, setShowUsername] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showChangeUsernameModal, setShowChangeUsernameModal] = useState(false);
    const [showChangePWDModal, setShowChangePWDModal] = useState(false);
    const [ShowChangePWDSuccess,setShowChangePWDSuccess]= useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [newID, setNewID] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [OldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const {
        SidebarToggleModeButton,
        SidebarSection,
        MyButton,
        MuiCustomDialog,
        MuiCustomButton,
        MuiCustomDialogTitle,
        MuiCustomDialogContent,
        MuiCustomDialogContentText,
        MuiCustomDialogActions,
        MuiCustomTextField,
        MuiCustomIconButton,
        MuiCustomInputAdornment,
        MuiCustomVisibility,
        MuiCustomVisibilityOff,
        MuiUseStyles,
    } = MyStyled();

    const classes = MuiUseStyles();

    const options = [
        { value: 'account', label: 'Account' },
        { value: 'changeUsername', label: 'Genera username' },
        { value: 'changeid', label: 'Cambio id' },
        { value: 'changePassword', label: 'Cambio password' },
    ];
    
    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
        inputRef.current.focus();
    };

    const handleConfirmPasswordChange = (event) => {
        setConfirmPassword(event.target.value);
        inputRef.current.focus();
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


    const handleOptionSelect = (option) => {
        console.log(`Option selected:`, option);
        console.log(`Option selected:`, option.value);
        if (option && option.value) {
            setSelectedOption(option);
            console.log(`Option selected:`, option);
            console.log(`Option selected:`, option.value);
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
        try{
            handleCloseModal();
            console.log("Genero id");
            const response = await axios.post('/user/set-id'); //only the first element of the array is needed (the last one)
            console.log(response);
            console.log(response.data);
            console.log(response.data.new_id)
            console.log("ID generato correttamente");
            const newID = response.data.new_id;
            setNewID(newID);
            setShowID(true);
            event.preventDefault();
            
            // handleLogout(event);
            
        }
        catch(error){
            console.log(error);
        }

    };

    const handleGenerateUsername = async (event) => {
        try{
            console.log("Genero username");
            const response = await axios.post('/user/set-username'); //only the first element of the array is needed (the last one)
            console.log(response);
            console.log(response.data);
            console.log("Username generato correttamente");
            const newUsername = response.data;
            setNewUsername(newUsername);
            setShowUsername(true);
        }   
        catch(error){
            console.log(error);
        }
    };

    const handleChangePassword = async (event) => {
        try{
            if(password === confirmPassword){ //forse inutile
                //richiesta al server per controllare che la vecchia password sia corretta
                //se è corretta, richiesta al server per cambiare la password
                //DA FARE
                
                console.log("Cambio password");
                const response = await axios.post('/user/set-password'); //only the first element of the array is needed (the last one)
                console.log(response);
                console.log(response.data);
                handleCloseModal();
                setShowChangePWDSuccess(true);
                handleLogout();
            }
        }
        catch(error){
            console.log(error);
        }
    };


    const handleCloseModal = () => {
        setShowAccountModal(false);
        setShowChangeIDModal(false);
        setShowChangeUsernameModal(false);
        setShowChangePWDModal(false);
    };

    const handleCloseSecondaryModal = () => {
        setShowChangePWDSuccess(false);
        // setShowID(false);
        setShowUsername(false);
    };

    const handleCloseModalAndLogout = () => {
        setShowID(false);
        navigate('/');
    };

    const handleLogout = async (event) => {
        // Perform logout logic here
        // Redirect the user to the login page
        event.preventDefault();
        try {
            const response = await axios.post('/logout');
            console.log(response.data);
            if(response.status === 200) {
                console.log("Logout successfull");
                navigate('/'); //direct redirect 
        
            }
            else {
                console.log("Logout failed");
            }
            
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <SidebarSection>
            <div className="top">
                    <LogoPaci />
                    <div className="links">
                        <ul>
                            <Tooltip title="Dashboard" placement="right">
                                <li
                                    className={currentLink === 1 ? "active" : ""}
                                    onClick={() => setCurrentLink(1)}
                                >   
                                    <div>
                                        <Link to="/dashboard">
                                            <BiHomeAlt />
                                        </Link>
                                    </div>
                                </li>
                            </Tooltip>
                            <Tooltip title="I tuoi grafici" placement="right">
                                <li
                                    className={currentLink === 6 ? "active" : ""}
                                    onClick={() => setCurrentLink(6)}
                                >
                                    <div>
                                        <Link to="/your-charts">
                                            <AiOutlineDotChart />
                                        </Link>
                                    </div>
                                </li>
                            </Tooltip>
                            <Tooltip title="Inserimento dati" placement="right">
                                <li
                                    className={currentLink === 3 ? "active" : ""}
                                    onClick={() => setCurrentLink(3)}
                                >
                                    <div>
                                        <Link to="/insert-values">
                                            <HiOutlinePencilAlt />
                                        </Link>
                                    </div>
                                </li>
                            </Tooltip>
                            <Tooltip title="Controlla i mercati" placement="right">
                                <li
                                    className={currentLink === 2 ? "active" : ""}
                                    onClick={() => setCurrentLink(2)}
                                >
                                    <div>
                                        <Link to="/check-prices">
                                            <AiOutlineFundProjectionScreen />
                                        </Link>
                                    </div>
                                </li>
                            </Tooltip>
                            <Tooltip title="Classifica" placement="right">
                                <li
                                    className={currentLink === 5 ? "active" : ""}
                                    onClick={() => setCurrentLink(5)}
                                >
                                    <div>
                                        <Link to="/leaderboard">
                                            <AiOutlineTrophy />
                                        </Link>
                                    </div>
                                </li>
                            </Tooltip>
                            
                            <Tooltip title="Conoscenze" placement="right">
                                <li
                                    className={currentLink === 7 ? "active" : ""}
                                    onClick={() => setCurrentLink(7)}
                                >
                                    <div>
                                        <Link to="/knowledge">
                                            <BsBook />
                                        </Link>
                                    </div>
                                </li>
                            </Tooltip>
                            <Tooltip title="Info" placement="right">
                                <li
                                    className={currentLink === 8 ? "active" : ""}
                                    onClick={() => setCurrentLink(8)}
                                >
                                    <div>
                                        <Link to="/info">
                                                <BsInfoCircle/>
                                        </Link>
                                    </div>
                                </li>
                            </Tooltip>
                          
                        </ul>
                    </div>
                        
                    <div className="notification">
                        <AiOutlineBell />
                        <div className="account-container">
                            <div className="account-image-wrapper">
                                <img src={avatarImage} alt="Account" className="account-image" />
                            </div>
                        </div>
                        <div className="dropdown-container">
                            <div className="dropdown-header" onClick={() => setShowDropdown(!showDropdown)}>
                                <AiOutlineCaretDown />
                            </div>
                            {showDropdown && (
                                <div className="dropdown-menu">
                                    {options.map((option) => (
                                        <div
                                            key={option.value}
                                            className={`dropdown-option ${selectedOption === option ? 'selected' : ''}`}
                                            
                                            onClick={() => handleOptionSelect(option)} >
                                        
                                            {option.label}

                                            
                                        </div>
                                    ))}
                                    <div className="dropdown-option logout" onClick={handleLogout}>
                                        Logout
                                    </div>
                                </div>
                            )}
                        </div>
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
                            <MuiCustomDialog
                                open={showAccountModal}
                                onClose={handleCloseModal}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <MuiCustomDialogTitle id="alert-dialog-title">
                                    {"Profilo"}
                                </MuiCustomDialogTitle>
                                <MuiCustomDialogContent>
                                    <MuiCustomDialogContentText id="alert-dialog-description">
                                        Si è verificato un errore nell'accesso con il tuo account. <br></br>
                                        Controlla di digitare correttamente id e password.<br></br>
                                    </MuiCustomDialogContentText>
                                </MuiCustomDialogContent>
                                <MuiCustomDialogActions>
                                    <MuiCustomButton onClick={handleCloseModal} autoFocus>
                                        Ok, va bene
                                    </MuiCustomButton>
                                </MuiCustomDialogActions>
                            </MuiCustomDialog>
                        )}

                        {showChangeUsernameModal && (
                            <MuiCustomDialog
                                open={showChangeUsernameModal}
                                onClose={handleCloseModal}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <MuiCustomDialogTitle id="alert-dialog-title">
                                    {"GeneraUsername"}
                                </MuiCustomDialogTitle>
                                <MuiCustomDialogContent>
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
                                open={showChangeIDModal}
                                onClose={handleCloseModal}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <MuiCustomDialogTitle id="alert-dialog-title">
                                    {"Cambio ID"}
                                </MuiCustomDialogTitle>
                                <MuiCustomDialogContent>
                                    <MuiCustomDialogContentText id="alert-dialog-description">
                                        Per mantenere la tua privacy ti diamo la possibilità di <br></br>
                                        cambiare il tuo id, quando ne hai bisogno.<br></br>
                                        Il sistema genererà un nuovo id casuale e univoco.<br></br>
                                        Inserisci il tuo vecchio id e la tua password per confermare il cambio.<br></br>
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
                                open={showChangePWDModal}
                                onClose={handleCloseModal}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <MuiCustomDialogTitle id="alert-dialog-title">
                                    {"Cambio Password"}
                                </MuiCustomDialogTitle>
                                <MuiCustomDialogContent>
                                    <MuiCustomDialogContentText id="alert-dialog-description">
                                        Per cambiare la tua password ti chiediamo di inserire <br></br> 
                                        la tua password <br></br>
                                        TI invieremo un'email con un link per il cambio password.<br></br>
                                        <form onSubmit={handleChangePassword}>
                                            <MuiCustomTextField
                                                label="OldPassword"
                                                type={showPassword ? 'text' : 'password'}
                                                value={OldPassword}
                                                onChange={handlePasswordChange}
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
                                            <MuiCustomTextField
                                                label="Password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={handlePasswordChange}
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
                                            <MuiCustomTextField
                                                label="Conferma Password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={handleConfirmPasswordChange}
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


                                            <MyButton type="submit">Cambia password</MyButton>

                                        </form>
                                    </MuiCustomDialogContentText>
                                </MuiCustomDialogContent>
                                <MuiCustomDialogActions>
                                    <MuiCustomButton onClick={handleChangePassword} autoFocus>
                                        Ok, va bene
                                    </MuiCustomButton>
                                </MuiCustomDialogActions>
                            </MuiCustomDialog>
                        )}

                        {showID && (
                            <MuiCustomDialog
                                open={showID}
                                onClose={handleCloseSecondaryModal}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <MuiCustomDialogTitle id="alert-dialog-title">
                                    {"Il tuo nuovo ID è: " + newID}
                                </MuiCustomDialogTitle>
                                <MuiCustomDialogContent>
                                    <MuiCustomDialogContentText id="alert-dialog-description">
                                        Salvalo per poterlo utilizzare per il login <br></br> 
                                        Verrai reinderizzato alla pagina di signin. <br></br>
                                    </MuiCustomDialogContentText>
                                </MuiCustomDialogContent>
                                <MuiCustomDialogActions>
                                    <MuiCustomButton onClick={handleCloseModalAndLogout} autoFocus>
                                        Ok, va bene
                                    </MuiCustomButton>
                                </MuiCustomDialogActions>
                            </MuiCustomDialog>
                        )}

                        {showUsername && (
                            <MuiCustomDialog
                                open={showUsername}
                                onClose={handleCloseSecondaryModal}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <MuiCustomDialogTitle id="alert-dialog-title">
                                    {"Il tuo nuovo Username è: " + newUsername}
                                </MuiCustomDialogTitle>
                                <MuiCustomDialogContent>
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

                        {ShowChangePWDSuccess && (
                            <MuiCustomDialog
                                open={showChangePWDModal}
                                onClose={handleCloseSecondaryModal}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <MuiCustomDialogTitle id="alert-dialog-title">
                                    {"La tua password è stata reimpostata correttamente"}
                                </MuiCustomDialogTitle>
                                <MuiCustomDialogContent>
                                    <MuiCustomDialogContentText id="alert-dialog-description">
                                        Verrai renderizzato alla pagina di sign-in. <br></br> 
                                    </MuiCustomDialogContentText>
                                </MuiCustomDialogContent>
                                <MuiCustomDialogActions>
                                    <MuiCustomButton onClick={handleCloseSecondaryModal} autoFocus>
                                        Ok, va bene
                                    </MuiCustomButton>
                                </MuiCustomDialogActions>
                            </MuiCustomDialog>
                        )}

                    </div>

                    <div className="toggle-button">
                        <SidebarToggleModeButton />
                    </div>
            </div>
        </SidebarSection>
  );
}

export default Sidebar