import React, {useState, useRef, useContext} from 'react';
// import Modal from 'react-modal';
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import axios from 'axios';
import { CopyToClipboard } from "react-copy-to-clipboard";
import { ThemeContext } from '../contexts/ThemeContext';
import InfoIcon from '@mui/icons-material/Info';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

//for the modal
import ModalsCustomStyled from '../contexts/ModalsCustomStyled';

var generated_user_id = '';

function SignUpForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const inputRef = useRef(null);
    const { theme } = useContext(ThemeContext);
    const { mode } = theme;

    // const [redirectToSignIn, setRedirectToSignIn] = useState(false);
    const {
        MyGenericModal,
        MyGenericModalContent,
        MyButton,
        MyCloseButton,
        MuiCustomDialog,
        MuiCustomButton,
        MuiCustomDialogTitle,
        MuiCustomDialogContent,
        MuiCustomDialogContentText,
        MuiCustomDialogActions,
    } = ModalsCustomStyled();

    const navigate = useNavigate();
    // useeffect used to ensure that it runs only after the component has rendered and the state has been updated
    // useEffect(() => {
    //     if (redirectToSignIn) {
    //       navigate('/sign-in');
    //     }
    // }, [redirectToSignIn, navigate]);


    const openSuccessModal = () => {
        setShowSuccessModal(true);
    };

    const openErrorModal = () => {
        setShowErrorModal(true);
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        copyToClipboard();
        navigate('/sign-in');
    };
    
    const closeErrorModal = () => {
        setShowErrorModal(false);
    };

    // const ModalSuccessSignUp = styled(MyGenericModal)`
    //     display: ${setShowSuccessModal ? 'flex' : 'none'};
    // `;

    // const ModalErrorSignUp = styled(MyGenericModal)`
    //     display: ${setShowErrorModal ? 'flex' : 'none'};
    // `;

    

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

    const copyToClipboard = () => {
        if ('clipboard' in navigator) {
            navigator.clipboard.writeText(generated_user_id);
            setIsCopied(true);
        }
        setIsCopied(true);
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
            // alert("Ti sei registrato con successo, Grazie.\n Ora puoi effettuare il login.\n Il tuo id utente è: " + generated_user_id + ".\n Ti consigliamo di salvarlo in un posto sicuro per i prossimi accessi. ");
            // navigate('/sign-in');
          }
          else {
            // alert("Si è verificato un errore nella registrazione del tuo account. Per favore riprova tra un istante.");
            openErrorModal();
            
          }
          
        } catch (error) {
            console.error(error);
            setPassword('');
            setConfirmPassword('');
            openErrorModal();
        //   alert("Si è verificato un errore nella registrazione del tuo account. Per favore riprova tra un istante.");
        }
    
    };

    const SignUp = styled.div`
        font-family: Roboto, sans-serif;
        
        .signUp-page {
            background-color: ${theme.backgroundColor};
            height: 50vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    
        .signUp-form {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .signUp-form h1 {
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

        .input-wrapper {
            position: relative;
        }
        
        .password-icon {
            position: absolute;
            top: 51%;
            right: 56%;
            transform: translateY(50%);
            cursor: pointer;
        }

        .password-icon2 {
            font-size: 16px;
            position: absolute;
            top: 51%;
            right: 34%;
            transform: translateY(50%);
            cursor: pointer;
        }
          
    
        .signUp-form label {
            color: ${theme.textColor};
            margin-bottom: 8px;
        }
    
        .signUp-form input {
            padding: 8px;
            border: none;
            background-color: transparent;
            color: ${theme.textColor};
            margin-bottom: 16px;
        }
    
        .signUp-form input::placeholder {
            color: ${theme.textColor};
        }
    
        .signUp-form button {
            padding: 8px 16px;
            background-color: ${theme.buttonBackgroundColor}};
            color: ${theme.textColor};
            // border: none;
            cursor: pointer;
        }
        

        // .modal {
        //     position: fixed;
        //     top: 50%;
        //     left: 50%;
        //     transform: translate(-50%, -50%);
        //     background-color: ${theme.backgroundColor};
        //     border: 4px solid ${theme.buttonBackgroundColor};
        //     box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
        //     color: ${theme.textColor};
        //     text-align: center;
        //     padding: 20px;
        
    `;

    return (
        
        <SignUp>
            <div className="signUp-page">
                <div className="signUp-form">
                    <h1>Registrazione</h1>
                    <div className="icon-with-text">
                        <InfoIcon />
                        <h4>Il sistema genererà per te un id casuale</h4>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="password">Password:</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="passwordSignUp"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                            ref={inputRef} 
                        />
                        <div className="password-icon" onClick={handleTogglePasswordVisibility}>
                            {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </div>


                        <label htmlFor="password">Conferma password:</label>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPasswordSignUp"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            required
                            ref={inputRef} 
                        />
                        <div className="password-icon2" onClick={handleToggleConfirmPasswordVisibility}>
                            {showConfirmPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </div>


                        <MyButton type="submit">Registrati</MyButton>

                    </form>
                </div>
            </div>
            
            {showSuccessModal && (
                <MuiCustomDialog
                    open={showSuccessModal}
                    onClose={closeSuccessModal}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <MuiCustomDialogTitle id="alert-dialog-title">
                        {" Registrazione avvenuta con successo"}
                    </MuiCustomDialogTitle>
                    <MuiCustomDialogContent>
                        <MuiCustomDialogContentText id="alert-dialog-description">
                            Il tuo id utente è: {generated_user_id}.<br></br> Ti consigliamo di salvarlo in un posto sicuro per i prossimi accessi.
                        </MuiCustomDialogContentText>
                    </MuiCustomDialogContent>
                    <MuiCustomDialogActions>
                        <input type="text" ref={inputRef} value={generated_user_id} readOnly style={{ position: 'fixed', top: '-9999px' }} />
                        <CopyToClipboard
                            text={generated_user_id}
                            onCopy={() => {
                                setIsCopied(true);
                                setTimeout(() => {
                                setIsCopied(false);
                                    }, 1000);
                            }}
                        >
                            <MuiCustomButton onClick={closeSuccessModal} autofocus>
                                <span>{isCopied ? 'Copiato!' : 'Copia il tuo ID'}</span>
                            </MuiCustomButton>
                        </CopyToClipboard>
                    </MuiCustomDialogActions>
                </MuiCustomDialog>   
            )}
            {showErrorModal && (
                <MuiCustomDialog
                    open={showErrorModal}
                    onClose={closeErrorModal}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <MuiCustomDialogTitle id="alert-dialog-title">
                        {"Errore in fase di registrazione"}
                    </MuiCustomDialogTitle>
                    <MuiCustomDialogContent>
                        <MuiCustomDialogContentText id="alert-dialog-description">
                            Si è verificato un errore nella registrazione del tuo account. <br></br>
                            Per favore riprova tra un istante.<br></br>
                        </MuiCustomDialogContentText>
                    </MuiCustomDialogContent>
                    <MuiCustomDialogActions>
                        <MuiCustomButton onClick={closeErrorModal} autoFocus>
                            Ok, va bene
                        </MuiCustomButton>
                    </MuiCustomDialogActions>
                </MuiCustomDialog>
            )}

            
        </SignUp>
    );
}
// export { generated_user_id };
export default SignUpForm;


    {/* <ModalSuccessSignUp
                isOpen={showSuccessModal}
                onRequestClose={closeSuccessModal}
                contentLabel="Registrazione avvenuta con successo"
            >
                <GenericModalContent>
                    <CloseButton className="close" onClick={closeSuccessModal}>
                        &times;
                    </CloseButton>
                    <h1>Registrazione avvenuta con successo</h1>
                </GenericModalContent>
            </ModalSuccessSignUp>
            <ModalErrorSignUp
                isOpen={showErrorModal}
                onRequestClose={closeErrorModal}
                contentLabel="Errore nella registrazione"
            >
                <GenericModalContent>
                    <CloseButton className="close" onClick={closeErrorModal}>
                        &times;
                    </CloseButton>
                    <h1>Si è verificato un errore nella registrazione del tuo account</h1>
                </GenericModalContent>
            </ModalErrorSignUp> */}