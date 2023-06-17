import React, {useState} from 'react';
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import axios from 'axios';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };
    
    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        
        try {
          const response = await axios.post('/login', { user_id: username, password: password });
          console.log(response.data);
          if(response.status === 200) {
            console.log("Login successfull");
            navigate('/dashboard'); //direct redirect
            alert("Login successfull");
    
          }
          else {
            // console.log("Login failed");
            alert("Nothing done");
            
          }
          
        } catch (error) {
          console.error(error);
          setUsername('');
          setPassword('');
          alert("Login failed");
        }
    
      };

    return (
        <Login>
            <div className="login-page">
                <div className="login-form">
                    <h2>Login</h2>
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
        </Login>
    );
    }

    export default LoginPage;

    const Login = styled.div`
    .login-page {
      background-color: black;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  
    .login-form {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  
    .login-form h2 {
      color: white;
    }
  
    .login-form label {
      color: white;
      margin-bottom: 8px;
    }
  
    .login-form input {
      padding: 8px;
      border: none;
      background-color: transparent;
      color: white;
      margin-bottom: 16px;
    }
  
    .login-form input::placeholder {
      color: orange;
    }
  
    .login-form button {
      padding: 8px 16px;
      background-color: orange;
      color: white;
      border: none;
      cursor: pointer;
    }
  `;