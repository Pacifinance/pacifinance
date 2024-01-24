import React, { useState, useContext } from 'react';
import ToggleModeButton from '../components/ToggleModeButton';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import LogoPaci from '../components/Logo';
import { LanguageContext } from '../contexts/LanguageContext';
import languages from '../contexts/languages.json';
// import MyStyled from '../contexts/MyStyled';
import {
  // useTheme,
  MyGenericModal,
  MyGenericModalContent,
  MyCloseButton,
  MyButton,
  ButtonContainer,
  ButtonGroup,
  ContainerHeader,
  ContainerFooter,
  FooterText,
  ModalSignIn,
  ModalSignUp,
} from '../contexts/MyStyled';

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
        <ContainerHeader theme={theme}>
          <LogoPaci />
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
        </ContainerHeader> 
    );
  };

function Footer({theme}) {
  const { language } = useContext(LanguageContext);

  return (
    <ContainerFooter theme={theme}>
      <FooterText theme={theme}>{languages[language].footer.rights}</FooterText>
    </ContainerFooter>
  );
};

export { Header, Footer };
