import React, {useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import axios from 'axios';
import { ThemeContext } from '../contexts/ThemeContext';
import InfoIcon from '@mui/icons-material/Info';
// import { generated_user_id } from './signUpForm.jsx';
import ModalsCustomStyled from '../contexts/ModalsCustomStyled';

function SignInForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(true);
    const { theme } = useContext(ThemeContext);
    const { mode } = theme;
    const navigate = useNavigate();

    const {
      GenericModal,
      Button,
      CloseButton,
      CustomDialog,
      CustomButton,
      CustomDialogTitle,
      CustomDialogContent,
      CustomDialogContentText,
      CustomDialogActions,
      GenericModalContent,
    } = ModalsCustomStyled();

    const handleOpenModal = () => {
      setModalIsOpen(true);
    };
  
    const handleCloseModal = () => {
      setModalIsOpen(false);
    };

    const handleUsernameChange = (event) => {
      setUsername(event.target.value);
    };
  
    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
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
            alert("Nothing done");
            
          }
          
        } catch (error) {
          console.error(error);
          setUsername('');
          setPassword('');
          alert("L'utente non è presente nel nostro database.");
        }
    
    };

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
    const GenericModalSignIn = styled(GenericModal)`
      background-color: ${theme.backgroundColor};
      color: ${theme.textColor};
      border: 1px solid ${theme.buttonBackgroundColor};
      border-radius: 4px;
      padding: 16px;
      width: 400px;
      height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
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
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={handleUsernameChange}
                            required
                        />

                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />

                        <Button type="submit">Accedi</Button>
                    </form>
                </div>
            </div>
        </SignIn>
    );
    }

    export default SignInForm;