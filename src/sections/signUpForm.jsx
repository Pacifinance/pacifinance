import React, {useState} from 'react';
import Modal from 'react-modal';
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import axios from 'axios';
var generated_user_id = '';

function SignUpPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [redirectToSignIn, setRedirectToSignIn] = useState(false);

    const navigate = useNavigate();
    // useeffect used to ensure that it runs only after the component has rendered and the state has been updated
    useEffect(() => {
        if (redirectToSignIn) {
          navigate('/sign-in');
        }
    }, [redirectToSignIn, navigate]);


    const openSuccessModal = () => {
        setShowSuccessModal(true);
    };
    
    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        setRedirectToSignIn(true);
    };
    
    const openErrorModal = () => {
        setShowErrorModal(true);
    };
    
    const closeErrorModal = () => {
        setShowErrorModal(false);
    };

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
            console.log("Sign up successfull");
            generated_user_id = response.data.user_id;
            openSuccessModal();
            // alert("Ti sei registrato con successo, Grazie. Ora puoi effettuare il login");
    
          }
          else {
            // console.log("Login failed");
            openErrorModal();
            
          }
          
        } catch (error) {
          console.error(error);
          setPassword('');
          setConfirmPassword('');
          openErrorModal();
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
            {showSuccessModal && (
                <Modal
                isOpen={showSuccessModal}
                onRequestClose={closeSuccessModal}
                className="modal"
                overlayClassName="modal-overlay"
                contentLabel="Popup"
                >
                <h2>Ti sei registrato con successo, Grazie. Ora puoi effettuare il login</h2>
                <h3>Il tuo id utente è: {generated_user_id}</h3>
                <button onClick={closeSuccessModal}>Chiudi</button>
                </Modal>
            )}
            {showErrorModal && (
                <Modal
                isOpen={showErrorModal}
                onRequestClose={closeErrorModal}
                className="modal"
                overlayClassName="modal-overlay"
                contentLabel="Popup"
                >
                <h2>Si è verificato un errore nella registrazione del tuo account. Per favore riprova tra un istante.</h2>
                <button onClick={closeErrorModal}>Chiudi</button>
                </Modal>
            )}
        </SignUp>
    );
    }
    export { generated_user_id };
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

    .modal {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        border: 2px solid orange;
        color: black;
        text-align: center;
        padding: 20px;
    }
      
    .modal-content {
        background-color: white;
        border: 2px solid orange;
        color: black;
        text-align: center;
        padding: 20px;
    }
      
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
    }
      
  `;