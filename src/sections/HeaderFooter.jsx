import React, { useState, useContext, useEffect } from "react";
import ToggleModeButton from "../components/ToggleModeButton";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LogoPaci from "../components/Logo";
import { LanguageContext } from "../contexts/LanguageContext";
import { UserContext } from "../contexts/UserContext";
import languages from "../data/languages.json";
// import MyStyled from '../contexts/MyStyled';
import {
  // useTheme,
  MyGenericModalContent,
  MyCloseButton,
  MyButton,
  ButtonContainer,
  ButtonGroup,
  ModalSignIn,
  ModalSignUp,
} from "../styles/MyStyled";

// const ModalSignIn = styled(MyGenericModal)`
//   display: ${({ isOpenSignIn }) => isOpenSignIn ? 'flex' : 'none'};
// `;

// const ModalSignUp = styled(MyGenericModal)`
//   display: ${({ isOpenSignUp }) => isOpenSignUp ? 'flex' : 'none'};
// `;

function Header({
  theme,
  mode,
  toggleMode,
  toggleLanguage: propToggleLanguage,
}) {
  // const { setIsOpenSignIn, setIsOpenSignUp } = useTheme();
  const { setUserData, handleSetIsAuthenticated } = useContext(UserContext);
  const [isOpenSignIn, setIsOpenSignIn] = useState(false);
  const [isOpenSignUp, setIsOpenSignUp] = useState(false);
  const { language, toggleLanguage } = useContext(LanguageContext);

  // Use prop toggleLanguage if provided, otherwise use context
  const handleLanguageToggle = propToggleLanguage || toggleLanguage;
  const [username, setUsername] = useState("913418");
  const [password, setPassword] = useState("vbwifc9u");
  const [showDemoButton, setShowDemoButton] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDemoButton(true);
    }, 3000); // Cambia 3000 con il numero di millisecondi di ritardo desiderato

    return () => clearTimeout(timer);
  }, []);

  const handleOpenSignIn = () => {
    setIsOpenSignIn(true);
  };

  const handleOpenSignUp = () => {
    setIsOpenSignUp(true);
  };

  const handleCloseSignIn = () => {
    setIsOpenSignIn(false);
  };

  const handleCloseSignUp = () => {
    setIsOpenSignUp(false);
  };

  const DemoLogin = async (event) => {
    event.preventDefault();
    try {
      handleSetIsAuthenticated(false); //to be sure that the user will se his data
      //navigate('/dashboard'); //must be commented for production
      //username could be user_id o username
      const response = await axios.post(
        "/login",
        { user_id: username, password: password },
        { withCredentials: true },
      ); //the path in the db is called login
      if (response.status === 200) {
        handleSetIsAuthenticated(true); // Imposta l'autenticazione dell'utente su true
        navigate("/dashboard"); //direct redirect
        //window.umami.trackEvent('signIn', 'SignIn');
      } else {
        // handleOpenModal();

        console.log("Error in the demo login");
      }
    } catch (error) {
      // console.error(error);
      setUsername("");
      setPassword("");
      // handleOpenModal();
    }
  };

  return (
    <div
      className="w-full h-auto flex flex-col items-start relative"
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      <div
        className="flex-auto w-full flex p-4 md:p-2 items-center justify-between"
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
        }}
      >
        <LogoPaci />
        <div className="flex flex-row md:mr-10">
          {showDemoButton && (
            <button
              data-umami-event="tryDemo"
              className={`animate-slide-down border-2 border-white rounded-xl md:rounded items-center text-base cursor-pointer bg-paciGreen text-white p-0.5 text-xs md:text-lg md:px-4 shadow-xl mr-2 md:mr-20`}
              onClick={DemoLogin}
            >
              {" "}
              {languages[language].header.demo.titleButton}
            </button>
          )}
          <ButtonContainer>
            <ToggleModeButton mode={mode} toggleMode={toggleMode} />

            <MyButton
              theme={theme}
              data-umami-event="setLanguage"
              onClick={handleLanguageToggle}
            >
              {language === "it" ? "IT" : "EN"}
            </MyButton>
            <ButtonGroup theme={theme}>
              <MyButton
                theme={theme}
                id="openSignInModalButton"
                onClick={handleOpenSignIn}
              >
                {languages[language].header.login.titleButton}
              </MyButton>
              <ModalSignIn theme={theme} $isOpen={isOpenSignIn}>
                <MyGenericModalContent theme={theme}>
                  <MyCloseButton
                    theme={theme}
                    className="close"
                    onClick={handleCloseSignIn}
                  >
                    &times;
                  </MyCloseButton>
                  <SignInForm theme={theme} />
                </MyGenericModalContent>
              </ModalSignIn>
              <MyButton theme={theme} id="openSignUpModalButton" disabled>
                {languages[language].header.register.titleButton}
              </MyButton>{" "}
              {/*Put this before "disabled" onClick={handleOpenSignUp} and eliminate disabled*/}
              <ModalSignUp theme={theme} $isOpen={isOpenSignUp}>
                <MyGenericModalContent theme={theme}>
                  <MyCloseButton
                    theme={theme}
                    className="close"
                    onClick={handleCloseSignUp}
                  >
                    &times;
                  </MyCloseButton>
                  <SignUpForm theme={theme} />
                </MyGenericModalContent>
              </ModalSignUp>
            </ButtonGroup>
          </ButtonContainer>
        </div>
      </div>
    </div>
  );
}

function Footer({ theme }) {
  const { language } = useContext(LanguageContext);

  return (
    <div
      className="flex-auto left-0 w-full bottom-0 h-18 p-2 flex z-10 fixed items-end justify-center"
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      <p className="text-xs md:text-base">
        {languages[language].footer.rights}
      </p>
    </div>
  );
}

export { Header, Footer };
