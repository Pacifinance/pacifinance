import React, {useState, useRef, useContext} from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { CopyToClipboard } from "react-copy-to-clipboard";
import InfoIcon from '@mui/icons-material/Info';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import languages from '../data/languages.json';

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
    EyeVisibility,
    EyeVisibilityOff
} from '../styles/MyStyled';

var generated_user_id = '';

// export { generated_user_id };
export default function SignUpForm() {
    const { theme } = useContext(ThemeContext);
    const { language } = useContext(LanguageContext);
    const { showSuccess, showError } = useToast();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const inputRef = useRef(null);

    const navigate = useNavigate();


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
          const response = await axios.post('/registration', { user_pwd: password, repeated_pwd: confirmPassword }, { withCredentials: true });
          if(response.status === 200) {
            generated_user_id = response.data.user_id;
            const successMessage = `
                    <div>
                        <strong>${languages[language].header.register.successPopup.title}</strong><br/>
                        ${languages[language].header.register.successPopup.message} ${generated_user_id}.<br/>
                         ${languages[language].header.register.successPopup.securityMessage}
                    </div>
                `;
                showSuccess(successMessage, 6000);
            //window.umami.trackEvent('SignUp');
            // openSuccessModal();
            // alert("Ti sei registrato con successo, Grazie.\n Ora puoi effettuare il login.\n Il tuo id utente è: " + generated_user_id + ".\n Ti consigliamo di salvarlo in un posto sicuro per i prossimi accessi. ");
            // navigate('/sign-in');
          }
          else {
            // alert("Si è verificato un errore nella registrazione del tuo account. Per favore riprova tra un istante.");
           showError(`
                <div>
                    <strong>${languages[language].header.register.errorPopup.title}</strong><br/>
                    ${languages[language].header.register.errorPopup.message}<br/>
                    ${languages[language].header.register.errorPopup.message2}
                </div>
            `, 5000);

          }

        } catch (error) {
            // console.error(error);
            setPassword('');
            setConfirmPassword('');
            showError(`
                <div>
                    <strong>${languages[language].header.register.errorPopup.title}</strong><br/>
                    ${languages[language].header.register.errorPopup.message}<br/>
                    ${languages[language].header.register.errorPopup.message2}
                </div>
            `, 5000);
        //   alert("Si è verificato un errore nella registrazione del tuo account. Per favore riprova tra un istante.");
        }

    };

    return (
        <div>
            <div className="space-y-6">
                    <form id="signUp-PasswordConfirm" className="space-y-4" onSubmit={handleSubmit}>
                        <MuiCustomTextField
                            theme={theme}
                            id="passwordSignUp"
                            label={languages[language].header.register.password}
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={handlePasswordChange}
                            required
                            fullWidth
                            className="w-1/2"
                            InputProps={{
                                endAdornment: (
                                <MuiCustomInputAdornment theme={theme} position="end">
                                    <MuiCustomIconButton theme={theme}
                                    aria-label="toggle password visibility"
                                    onClick={handleTogglePasswordVisibility}
                                    onMouseDown={handleMouseDownPassword}
                                    className=""
                                    >
                                        {showPassword ? <EyeVisibility /> : <EyeVisibilityOff />}
                                    </MuiCustomIconButton>
                                </MuiCustomInputAdornment>
                                ),
                            }}
                            />
                            <MuiCustomTextField
                                theme={theme}
                                id="confirmPassword"    
                                label={languages[language].header.register.confirmPassword}
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                required
                                fullWidth
                                className="w-1/2"
                                InputProps={{
                                    endAdornment: (
                                    <MuiCustomInputAdornment theme={theme} position="end">
                                        <MuiCustomIconButton
                                            theme={theme}
                                            aria-label="toggle password visibility"
                                            onClick={handleToggleConfirmPasswordVisibility}
                                            onMouseDown={handleMouseDownPassword}
                                            className=""
                                        >
                                        {showConfirmPassword ? <EyeVisibility /> : <EyeVisibilityOff />}
                                        </MuiCustomIconButton>
                                    </MuiCustomInputAdornment>
                                    ),
                                }}
                            />
                        <div className="button-wrapper">
                            <SignUpButton theme={theme} data-umami-event="newUser" type="submit" style={{ marginTop: '20px', alignSelf: 'center' }}>{languages[language].header.register.titleButton}</SignUpButton>
                        </div>

                    </form>
            </div>
        </div>
    );
}