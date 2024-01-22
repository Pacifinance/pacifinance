import React, { useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { UserContext } from '../contexts/UserContext';
import InfoIcon from '@mui/icons-material/Info';
import languages from '../contexts/languages.json';
import {
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
  SignIn,
  SignInButton,
  MuiUseStyles,
} from '../contexts/MyStyled';

// import MyStyled from '../contexts/MyStyled';

// const handleUsernameChange = (setUsername, event) => {
//   setUsername(event.target.value);
// };

// const handlePasswordChange = (event) => {
//     setPassword(event.target.value);
// };

export default function SignInForm() {
    const { theme } = useContext(ThemeContext);
    const { language } = useContext(LanguageContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showUsername, setShowUsername] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const { setUserData, handleSetIsAuthenticated } = useContext(UserContext);
    const navigate = useNavigate();

    const classes = MuiUseStyles();

    const handleOpenModal = () => {
      setShowErrorModal(true);
    };
  
    const handleCloseModal = () => {
      setShowErrorModal(false);
    };

    const handleClickShowPassword = () => {
      setShowPassword(!showPassword);
    };

    const handleClickShowUsername = () => {
      setShowUsername(!showUsername);
    };

    const handleMouseDown = (event) => {
      event.preventDefault();
    };

    
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
          handleSetIsAuthenticated(false); //to be sure that the user will se his data
          //navigate('/dashboard'); //da commentare, utile solo per test in locale
          //username could be user_id o username
          const response = await axios.post('/login', { user_id: username, password: password }, { withCredentials: true }); //the path in the db is called login
          if(response.status === 200) {
            handleSetIsAuthenticated(true); // Imposta l'autenticazione dell'utente su true
            navigate('/dashboard'); //direct redirect
            window.umami.trackEvent('signIn', 'SignIn');
    
          }
          else {
            handleOpenModal();
            
          }
          
        } catch (error) {
          // console.error(error);
          setUsername('');
          setPassword('');
          handleOpenModal();
        }
    
    };

    

    return (
        <SignIn theme={theme}>
            <div className="sign-in-page">
                <div className="sign-in-form" >
                    <h1>{languages[language].header.login.titleButton}</h1>
                    <div className="icon-with-text">
                        <InfoIcon theme={theme}/>
                        <h4>{languages[language].header.login.info}</h4>
                    </div>
                    <form id = "signIn-IdPassword" onSubmit={handleSubmit}>
                        <MuiCustomTextField theme={theme}
                          id = "username"
                          label="Id o Username"
                          type={showUsername ? 'text' : 'password'}
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                          fullWidth
                          required
                          className={classes.signIn}
                          InputProps={{
                            endAdornment: (
                              <MuiCustomInputAdornment theme={theme} position="end">
                                <MuiCustomIconButton theme={theme}
                                  aria-label="toggle username visibility"
                                  onClick={handleClickShowUsername}
                                  onMouseDown={handleMouseDown}
                                  className={classes.icon}
                                >
                                  {showUsername ? <MuiCustomVisibility /> : <MuiCustomVisibilityOff />}
                                </MuiCustomIconButton>
                              </MuiCustomInputAdornment>
                            ),
                          }}
                        />
                        <MuiCustomTextField theme={theme}
                          id = "passwordSignIn"
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          required
                          fullWidth
                          className={classes.signIn}
                          InputProps={{
                            endAdornment: (
                              <MuiCustomInputAdornment theme={theme} position="end">
                                <MuiCustomIconButton theme={theme}
                                  aria-label="toggle password visibility"
                                  onClick={handleClickShowPassword}
                                  onMouseDown={handleMouseDown}
                                  className={classes.icon}
                                >
                                  {showPassword ? <MuiCustomVisibility /> : <MuiCustomVisibilityOff />}
                                </MuiCustomIconButton>
                              </MuiCustomInputAdornment>
                            ),
                          }}
                        />
                        <div className="button-wrapper">
                          <SignInButton theme={theme} type="submit" fullWidth>
                            {languages[language].header.login.titleButton}
                          </SignInButton>
                        </div>

                    </form>
                </div>
            </div>
            {showErrorModal && (
                <MuiCustomDialog
                    open={showErrorModal}
                    onClose={handleCloseModal}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <MuiCustomDialogTitle id="alert-dialog-title">
                      {languages[language].header.login.errorPopup.title}
                    </MuiCustomDialogTitle>
                    <MuiCustomDialogContent>
                        <MuiCustomDialogContentText id="alert-dialog-description" 
                          dangerouslySetInnerHTML={{ __html: languages[language].header.login.errorPopup.message}}>
                        </MuiCustomDialogContentText>
                    </MuiCustomDialogContent>
                    <MuiCustomDialogActions>
                        <MuiCustomButton onClick={handleCloseModal} autoFocus>
                          {languages[language].header.login.errorPopup.okButton}
                        </MuiCustomButton>
                    </MuiCustomDialogActions>
                </MuiCustomDialog>
            )}
        </SignIn>
    );
}