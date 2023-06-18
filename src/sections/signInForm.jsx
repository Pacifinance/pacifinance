import React, {useState} from 'react';
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import axios from 'axios';
// import { generated_user_id } from './signUpForm.jsx';

function SignInPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

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
          alert("Sign in failed");
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

    const SignIn = styled.div`
    .sign-in-page {
      background-color: black;
      height: 100vh;
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
      color: white;
      margin-bottom: 20px;
    }
  
    .sign-in-form label {
      color: white;
      margin-bottom: 8px;
    }
  
    .sign-in-form input {
      padding: 8px;
      border: none;
      background-color: transparent;
      color: white;
      margin-bottom: 16px;
    }
  
    .sign-in-form input::placeholder {
      color: orange;
    }
  
    .sign-in-form button {
      padding: 8px 16px;
      background-color: orange;
      color: white;
      border: none;
      cursor: pointer;
    }
  `;