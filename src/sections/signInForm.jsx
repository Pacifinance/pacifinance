import React, {useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import axios from 'axios';
import { ThemeContext } from '../contexts/ThemeContext';
import { Grid } from '@material-ui/core';
import InfoIcon from '@mui/icons-material/Info';

// import { generated_user_id } from './signUpForm.jsx';
import ModalsCustomStyled from '../contexts/ModalsCustomStyled';

function SignInForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const { theme } = useContext(ThemeContext);
    const { mode } = theme;
    const navigate = useNavigate();

    const {
      MyGenericModal,
      MyGenericModalContent,
      MyButton,
      MuiCloseButton,
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
    } = ModalsCustomStyled();

    const handleOpenModal = () => {
      setShowErrorModal(true);
    };
  
    const handleCloseModal = () => {
      setShowErrorModal(false);
    };

    const handleUsernameChange = (event) => {
      setUsername(event.target.value);
    };
  
    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleClickShowPassword = () => {
      setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
      event.preventDefault();
    };
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        
        try {
          const response = await axios.post('/login', { user_id: username, password: password }); //the path in the db is called login
          console.log(response.data);
          if(response.status === 200) {
            console.log("Sign in successfull");
            navigate('/dashboard'); //direct redirect
            // alert("Sign in successfull");
    
          }
          else {
            // console.log("sign-in failed");
            handleOpenModal();
            
          }
          
        } catch (error) {
          console.error(error);
          setUsername('');
          setPassword('');
          handleOpenModal();
        }
    
    };

    const classes = MuiUseStyles();

    const SignIn = styled.div`
      font-family: Roboto, sans-serif;
      
      .sign-in-page {
        background-color: ${theme.backgroundColor};
        height: 50vh;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    
      .sign-in-form {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    
      .sign-in-form h1 {
        color: ${theme.textColor};
        margin-bottom: 20px;
      }

      .icon-with-text {
        display: flex;
        color: ${theme.buttonBackgroundColor};
        align-items: center; /* Allinea verticalmente gli elementi */
        margin-bottom: 50px;
      }
      
      .icon-with-text h4 {
        color: ${theme.buttonBackgroundColor};
        margin-left: 10px; /* Aggiungi uno spazio tra l'icona e il testo */
      }
    
      .sign-in-form label {
        color: ${theme.textColor};
        margin-bottom: 8px;
      }
    
      .sign-in-form input {
        padding: 8px;
        border: none;
        background-color: transparent;
        color: ${theme.textColor};
        margin-bottom: 16px;
      }
    
      .sign-in-form input::placeholder {
        color: ${theme.textColor};
      }
    `;

    //voglio prendere il generic modL rinominarlo e aggiungergli delle caratteristiche
    const GenericModalSignIn = styled(MyGenericModal)`
      // background-color: ${theme.backgroundColor};
      // color: ${theme.textColor};
      // border: 1px solid ${theme.buttonBackgroundColor};
      // border-radius: 4px;
      // padding: 16px;
      // width: 400px;
      // height: 200px;
      // display: flex;
      // flex-direction: column;
      // justify-content: space-between;
      // align-items: center;
    `;

    // if (generated_user_id !== '') {
    //   setUsername(generated_user_id);
    // }  

    return (
        <SignIn>
            <div className="sign-in-page">
                <div className="sign-in-form">
                    <h1>Accedi</h1>
                    <div class="icon-with-text">
                        <InfoIcon />
                        <h4>Inserisci il tuo id e la tua password per continuare</h4>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <MuiCustomTextField
                          label="Username"
                          type="text"
                          value={username}
                          onChange={handleUsernameChange}
                          fullWidth
                          required
                          className={classes.root}
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
                        <MyButton type="submit" fullWidth>
                          Accedi
                        </MyButton>

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

    export default SignInForm;

    {/* <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={handleUsernameChange}
                            required
                        /> */}

    {/* <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="passwordSignIn"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        /> */}