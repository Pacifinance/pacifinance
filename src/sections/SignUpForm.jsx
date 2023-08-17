import React, {useState, useRef, useContext} from 'react';
// import Modal from 'react-modal';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { CopyToClipboard } from "react-copy-to-clipboard";
import InfoIcon from '@mui/icons-material/Info';
import { ThemeContext } from '../contexts/ThemeContext';

//for the modal and styled components
import {
    SignUp,
    SignUpButton,
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
} from '../contexts/MyStyled';
// import MyStyled from '../contexts/MyStyled';

var generated_user_id = '';

// export { generated_user_id };
export default function SignUpForm() {
    const { theme } = useContext(ThemeContext);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const inputRef = useRef(null);

    const navigate = useNavigate();


    const openSuccessModal = () => {
        setShowSuccessModal(true);
    };

    const openErrorModal = () => {
        setShowErrorModal(true);
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        copyToClipboard();
        navigate('/');
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

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleToggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
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
            // console.error(error);
            setPassword('');
            setConfirmPassword('');
            openErrorModal();
        //   alert("Si è verificato un errore nella registrazione del tuo account. Per favore riprova tra un istante.");
        }
    
    };

    const classes = MuiUseStyles();

    return (
        
        <SignUp theme={theme}>
            <div className="signUp-page">
                <div className="signUp-form" style={{ display: 'flex' }}>
                    <h1>Registrazione</h1>
                    <div className="icon-with-text">
                        <InfoIcon theme={theme}/>
                        <h4>Il sistema genererà per te un id univoco e casuale</h4>
                    </div>
                    <form id="signUp-PasswordConfirm" onSubmit={handleSubmit}>
                        <MuiCustomTextField
                            theme={theme}
                            id="passwordSignUp"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={handlePasswordChange}
                            required
                            fullWidth
                            className={classes.root}
                            InputProps={{
                                endAdornment: (
                                <MuiCustomInputAdornment theme={theme} position="end">
                                    <MuiCustomIconButton theme={theme}
                                    aria-label="toggle password visibility"
                                    onClick={handleTogglePasswordVisibility}
                                    onMouseDown={handleMouseDownPassword}
                                    className={classes.icon}
                                    >
                                        {showPassword ? <MuiCustomVisibility /> : <MuiCustomVisibilityOff />}
                                    </MuiCustomIconButton>
                                </MuiCustomInputAdornment>
                                ),
                            }}
                            />
                            <MuiCustomTextField
                                theme={theme}
                                id="confirmPassword"    
                                label="Conferma Password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                required
                                fullWidth
                                className={classes.root}
                                InputProps={{
                                    endAdornment: (
                                    <MuiCustomInputAdornment theme={theme} position="end">
                                        <MuiCustomIconButton
                                            theme={theme}
                                            aria-label="toggle password visibility"
                                            onClick={handleToggleConfirmPasswordVisibility}
                                            onMouseDown={handleMouseDownPassword}
                                            className={classes.icon}
                                        >
                                        {showConfirmPassword ? <MuiCustomVisibility /> : <MuiCustomVisibilityOff />}
                                        </MuiCustomIconButton>
                                    </MuiCustomInputAdornment>
                                    ),
                                }}
                            />
                        <div className="button-wrapper">
                            <SignUpButton theme={theme} type="submit" style={{ marginTop: '20px', alignSelf: 'center' }}>Registrati</SignUpButton>
                        </div>

                    </form>
                </div>
            </div>
            
            {showSuccessModal && (
                <MuiCustomDialog
                    theme={theme}
                    open={showSuccessModal}
                    onClose={closeSuccessModal}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <MuiCustomDialogTitle theme={theme} id="alert-dialog-title">
                        {" Registrazione avvenuta con successo"}
                    </MuiCustomDialogTitle>
                    <MuiCustomDialogContent theme={theme}>
                        <MuiCustomDialogContentText theme={theme} id="alert-dialog-description">
                            Il tuo id utente è: {generated_user_id}.<br></br> Ti consigliamo di salvarlo in un posto sicuro per i prossimi accessi.
                        </MuiCustomDialogContentText>
                    </MuiCustomDialogContent>
                    <MuiCustomDialogActions theme={theme}>
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
                            <MuiCustomButton theme={theme} onClick={closeSuccessModal} autofocus>
                                <span>{isCopied ? 'Copiato!' : 'Copia il tuo ID'}</span>
                            </MuiCustomButton>
                        </CopyToClipboard>
                    </MuiCustomDialogActions>
                </MuiCustomDialog>   
            )}
            {showErrorModal && (
                <MuiCustomDialog theme={theme}
                    open={showErrorModal}
                    onClose={closeErrorModal}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <MuiCustomDialogTitle theme={theme} id="alert-dialog-title">
                        {"Errore in fase di registrazione"}
                    </MuiCustomDialogTitle>
                    <MuiCustomDialogContent theme={theme}>
                        <MuiCustomDialogContentText theme={theme} id="alert-dialog-description">
                            Si è verificato un errore nella registrazione del tuo account. <br></br>
                            Per favore riprova tra un istante.<br></br>
                        </MuiCustomDialogContentText>
                    </MuiCustomDialogContent>
                    <MuiCustomDialogActions theme={theme}>
                        <MuiCustomButton theme={theme} onClick={closeErrorModal} autoFocus>
                            Ok, va bene
                        </MuiCustomButton>
                    </MuiCustomDialogActions>
                </MuiCustomDialog>
            )}

            
        </SignUp>
    );
}