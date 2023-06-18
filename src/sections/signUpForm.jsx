import React, {useState} from 'react';
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import axios from 'axios';

function SignUpPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();
    
    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleConfirmPasswordChange = (event) => {
        setConfirmPassword(event.target.value);
    };
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        
        try {
          const response = await axios.post('/registration', { user_pwd: password, repeated_pwd: confirmPassword });
          console.log(response.data);
          if(response.status === 200) {
            console.log("Login successfull");
            navigate('/login'); //direct redirect
            alert("Ti sei registrato con successo, Grazie. Ora puoi effettuare il login");
    
          }
          else {
            // console.log("Login failed");
            alert("Non ha funzionato qualcosa");
            
          }
          
        } catch (error) {
          console.error(error);ù
          setPassword('');
          setConfirmPassword('');
          alert("Si è verificato un errore nella registrazione del tuo account. Per favore riprova tra un istante.");
        }
    
      };

    return (
        <SignUp>
            <div className="signUp-page">
                <div className="signUp-form">
                    <h1>Registrazione</h1>
                    <h2>Il sistema genererà per te un id casuale</h2>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />

                        <label htmlFor="password">Conferma password:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            required
                        />

                        <button type="submit">Registrati</button>
                    </form>
                </div>
            </div>
        </SignUp>
    );
    }

    export default SignUpPage;

    const SignUp = styled.div`
    .signUp-page {
      background-color: black;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  
    .signUp-form {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  
    .signUp-form h2 {
      color: white;
    }
  
    .signUp-form label {
      color: white;
      margin-bottom: 8px;
    }
  
    .signUp-form input {
      padding: 8px;
      border: none;
      background-color: transparent;
      color: white;
      margin-bottom: 16px;
    }
  
    .signUp-form input::placeholder {
      color: orange;
    }
  
    .signUp-form button {
      padding: 8px 16px;
      background-color: orange;
      color: white;
      border: none;
      cursor: pointer;
    }
  `;