import React, { useState, useContext } from 'react';
import ToggleModeButton from '../components/ToggleModeButton';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import LogoPaci from '../components/Logo';
import { LanguageContext } from '../contexts/LanguageContext';
import languages from '../data/languages.json';
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
} from '../styles/MyStyled';

// const ModalSignIn = styled(MyGenericModal)`
  //   display: ${({ isOpenSignIn }) => isOpenSignIn ? 'flex' : 'none'};
  // `;

  // const ModalSignUp = styled(MyGenericModal)`
  //   display: ${({ isOpenSignUp }) => isOpenSignUp ? 'flex' : 'none'};
  // `;

function Header({theme, mode, toggleMode}) {
  // const { setIsOpenSignIn, setIsOpenSignUp } = useTheme();
  const [isOpenSignIn, setIsOpenSignIn] = useState(false);
  const [isOpenSignUp, setIsOpenSignUp] = useState(false);
  const { language, toggleLanguage } = useContext(LanguageContext);

  const handleOpenSignIn = () => {
    setIsOpenSignIn(true);
  };

  const handleOpenSignUp = () => {
    setIsOpenSignUp(true);
  };

  const handleCloseSignIn= () => {
    setIsOpenSignIn(false);
  };

  const handleCloseSignUp= () => {
    setIsOpenSignUp(false);
  };

    
    return (
      <div 
        className="w-full h-auto flex flex-col items-start relative"
        style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
      >
        <div className="flex-auto w-full flex p-4 md:p-2 items-center justify-between"
          style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
          <LogoPaci />
          <div className="flex flex-row md:mr-10">
            <ButtonContainer >
              <ToggleModeButton mode={mode} toggleMode={toggleMode}/>
              <MyButton theme={theme} data-umami-event="setLanguage" onClick={toggleLanguage}>
                {language === 'it' ? 'IT' : 'EN'} 
              </MyButton>
              <ButtonGroup theme={theme}>
                <MyButton theme={theme} id="openSignInModalButton" onClick={handleOpenSignIn}>{languages[language].header.login.titleButton}</MyButton>
                <ModalSignIn theme={theme} isOpen={isOpenSignIn}> 
                  <MyGenericModalContent theme={theme}>
                      <MyCloseButton theme={theme} className="close" onClick={handleCloseSignIn}>&times;</MyCloseButton>
                      <SignInForm theme={theme} />
                  </MyGenericModalContent>
                </ModalSignIn>
                <MyButton theme={theme} id="openSignUpModalButton" disabled>{languages[language].header.register.titleButton}</MyButton> {/*Put this before "disabled" onClick={handleOpenSignUp} and eliminate disabled*/}
                <ModalSignUp theme={theme} isOpen={isOpenSignUp}> 
                  <MyGenericModalContent theme={theme}>
                      <MyCloseButton theme={theme} className="close" onClick={handleCloseSignUp}>&times;</MyCloseButton>
                      <SignUpForm theme={theme} />
                  </MyGenericModalContent>
                </ModalSignUp>
              </ButtonGroup>
            </ButtonContainer> 
          </div>
        </div>
      </div>
    );
  };

function Footer({theme}) {
  const { language } = useContext(LanguageContext);

  return (
    <div 
      className="flex-auto left-0 w-full bottom-0 h-18 p-2 flex z-10 fixed items-end justify-center"
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    > 
      <p className="text-xs md:text-base">{languages[language].footer.rights}</p>
    </div>
  );
};

export { Header, Footer };
