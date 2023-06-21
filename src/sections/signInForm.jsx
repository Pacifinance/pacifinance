import React, {useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import axios from 'axios';
import { ThemeContext } from '../contexts/ThemeContext';
// import { generated_user_id } from './signUpForm.jsx';

function SignInPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { theme } = useContext(ThemeContext);
    const { mode } = theme;
    const navigate = useNavigate();

    const SignIn = styled.div`
      font-family: Roboto, sans-serif;
      
      .sign-in-page {
        background-color: ${theme.backgroundColor};
        height: 5vh;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    
      .sign-in-form {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    
      .sign-in-form h2 {
        color: ${theme.textColor};
        margin-bottom: 20px;
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
    
      .sign-in-form button {
        padding: 8px 16px;
        background-color: ${theme.buttonBackgroundColor}};
        color: ${theme.textColor};
        border: none;
        cursor: pointer;
      }
    `;

    // if (generated_user_id !== '') {
    //   setUsername(generated_user_id);
    // }  

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

    return (
        <SignIn>
            <div className="sign-in-page">
                <div className="sign-in-form">
                    <h2>Benvenuto</h2>
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

                        <button type="submit">Accedi</button>
                    </form>
                </div>
            </div>
        </SignIn>
    );
    }

    export default SignInPage;