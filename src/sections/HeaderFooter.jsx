import React, {useState, useContext} from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';
import ToggleModeButton from '../components/ToggleModeButton';
import { ThemeContext } from '../contexts/ThemeContext';
import { useNavigate } from "react-router-dom";
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import ModalsCustomStyled from '../contexts/ModalsCustomStyled';
import LogoPaci from '../components/Logo';



const Header = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { mode } = theme;
  // const [isModalOpen, setModalOpen] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const {
    MyGenericModal,
    MyGenericModalContent,
    MyCloseButton,
    MyButton,
    MuiCustomDialog,
    MuiCustomButton,
    MuiCustomDialogTitle,
    MuiCustomDialogContent,
    MuiCustomDialogContentText,
    MuiCustomDialogActions,
    
  } = ModalsCustomStyled();
 
  const handleOpenSignIn = () => {
    setIsSignIn(true);
  };

  const handleOpenSignUp = () => {
    setIsSignUp(true);
  };

  const handleCloseSignIn= () => {
    setIsSignIn(false);
  };

  const handleCloseSignUp= () => {
    setIsSignUp(false);
  };


  // const handleSignIn = () => {
  //   navigate('/sign-in');
  // };
  
  // const handleSignUp = () => {
  //   navigate('/sign-up');
  // };

  const ContainerHeader = styled.header`
    background-color: ${theme.backgroundColor};
    color: ${theme.textColor};
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  `;

  const Logo = styled.h1`
    font-size: 0px;
    img {
      width: 90px;
    }
  `;

  const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
  `;

  const ButtonContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
  `;

  const ModalSignIn = styled(MyGenericModal)`
    display: ${isSignIn ? 'flex' : 'none'};
  `;

  const ModalSignUp = styled(MyGenericModal)`
    display: ${isSignUp ? 'flex' : 'none'};
  `;

    
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

const Footer = () => {
  const { theme } = useContext(ThemeContext);
  const { mode } = theme;

  const ContainerFooter = styled.footer`
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: ${theme.backgroundColor};
    color: ${theme.textColor};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;

  const FooterText = styled.p`
    font-size: 14px;
  `;

  return (
    <ContainerFooter>
      <FooterText>Pacifinance &copy; 2023. All rights reserved.</FooterText>
    </ContainerFooter>
  );
};


export { Header, Footer };
