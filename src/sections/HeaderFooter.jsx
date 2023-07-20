import React from 'react';
import ToggleModeButton from '../components/ToggleModeButton';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import LogoPaci from '../components/Logo';
import {
  useTheme,
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





function Header() {

  const { setIsOpenSignIn, setIsOpenSignUp } = useTheme();

  // const {
  //   MyGenericModalContent,
  //   MyCloseButton,
  //   MyButton,
  //   ButtonContainer,
  //   ButtonGroup,
  //   ContainerHeader,
  //   ModalSignIn,
  //   ModalSignUp,
  //   ContainerFooter,
  //   FooterText,
  //   setIsOpenSignIn,
  //   setIsOpenSignUp,
  // } = MyStyled();

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
      <ContainerHeader>
        <LogoPaci />
        <ButtonContainer>
          <ToggleModeButton />
          <ButtonGroup>
            <MyButton id="openSignInModalButton" onClick={handleOpenSignIn}>Sign In</MyButton>
            <ModalSignIn> 
              <MyGenericModalContent>
                  <MyCloseButton className="close" onClick={handleCloseSignIn}>&times;</MyCloseButton>
                  <SignInForm />
              </MyGenericModalContent>
            </ModalSignIn>
            <MyButton id="openSignUpModalButton"onClick={handleOpenSignUp}>Sign Up</MyButton>
            <ModalSignUp> 
              <MyGenericModalContent>
                  <MyCloseButton className="close" onClick={handleCloseSignUp}>&times;</MyCloseButton>
                  <SignUpForm />
              </MyGenericModalContent>
            </ModalSignUp>
          </ButtonGroup>
        </ButtonContainer>
      </ContainerHeader>

      
    );
  };

  function Footer() {
    // const {
    //   ContainerFooter,
    //   FooterText,
    // } = MyStyled();

  return (
    <ContainerFooter>
      <FooterText>Pacifinance &copy; 2023. All rights reserved.</FooterText>
    </ContainerFooter>
  );
};

export { Header, Footer };
