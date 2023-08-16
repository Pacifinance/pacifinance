import React, { useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import InfoIcon from '@mui/icons-material/Info';
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

import MyStyled from '../contexts/MyStyled';

// const handleUsernameChange = (setUsername, event) => {
//   setUsername(event.target.value);
// };

// const handlePasswordChange = (event) => {
//     setPassword(event.target.value);
// };

const handleUsernameChange = ({ MuiCustomTextField, username, setUsername }) => {
  // return <input value={email} onChange={(e) => setUsername(e.target.value)} />;
  return <MuiCustomTextField
    id = "username"
    label="Id o Username"
    type="text"
    value={username}
    onChange={(event) => setUsername(event.target.value)}
    fullWidth
    required
    // className={classes.root}
  />
};

export default function SignInForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const { setUserData, handleSetIsAuthenticated } = useContext(UserContext);
    const navigate = useNavigate();

    // const {
    //   MuiCustomDialog,
    //   MuiCustomButton,
    //   MuiCustomDialogTitle,
    //   MuiCustomDialogContent,
    //   MuiCustomDialogContentText,
    //   MuiCustomDialogActions,
    //   MuiCustomTextField,
    //   MuiCustomIconButton,
    //   MuiCustomInputAdornment,
    //   MuiCustomVisibility,
    //   MuiCustomVisibilityOff,
    //   SignIn,
    //   SignInButton,
    //   MuiUseStyles,
    // } = MyStyled()

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

    const handleMouseDownPassword = (event) => {
      event.preventDefault();
    };

    
    const handleSubmit = async (event) => {
        event.preventDefault();
        navigate('/dashboard'); //da commentare solo per test in locale
        try {
          //username could be user_id o username
          const response = await axios.post('/login', { user_id: username, password: password }); //the path in the db is called login
          console.log(response.data);
          if(response.status === 200) {
            console.log("Sign in successfull");
            handleSetIsAuthenticated(true); // Imposta l'autenticazione dell'utente su true
            navigate('/dashboard'); //direct redirect
            // alert("Sign in successfull");
    
          }
          else {
            // console.log("sign-in failed");
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
        <SignIn>
            <div className="sign-in-page">
                <div className="sign-in-form" >
                    <h1>Accedi</h1>
                    <div className="icon-with-text">
                        <InfoIcon />
                        <h4>Inserisci il tuo id e la tua password per continuare</h4>
                    </div>
                    <form id = "signIn-IdPassword" onSubmit={handleSubmit}>
                        {handleUsernameChange({MuiCustomTextField, username, setUsername})}
                        <MuiCustomTextField
                          id = "passwordSignIn"
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          required
                          fullWidth
                          className={classes.root}
                          InputProps={{
                            endAdornment: (
                              <MuiCustomInputAdornment position="end">
                                <MuiCustomIconButton
                                  aria-label="toggle password visibility"
                                  onClick={handleClickShowPassword}
                                  onMouseDown={handleMouseDownPassword}
                                  className={classes.icon}
                                >
                                  {showPassword ? <MuiCustomVisibility /> : <MuiCustomVisibilityOff />}
                                </MuiCustomIconButton>
                              </MuiCustomInputAdornment>
                            ),
                          }}
                        />
                        <div className="button-wrapper">
                          <SignInButton type="submit" fullWidth>
                            Accedi
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
                        {"Errore in fase di accesso"}
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
        </SignIn>
    );
}