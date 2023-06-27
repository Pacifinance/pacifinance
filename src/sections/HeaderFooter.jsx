import React, {useState, useContext} from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';
import ToggleModeButton from '../components/ToggleModeButton';
import { ThemeContext } from '../contexts/ThemeContext';
import { useNavigate } from "react-router-dom";
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import MuiCustomStyled from '../contexts/MuiCustomStyled';
import LogoPaci from '../assets/Brand/PacifinanceLogoPNG.png';


const Header = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { mode } = theme;
  // const [isModalOpen, setModalOpen] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
 
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

  const Button = styled.button`
    background-color: ${theme.buttonBackgroundColor};
    color: ${theme.textColor};  
    padding: 10px 20px;
    border-radius: 4px;
    border-color: ${mode === 'dark' ? '#fff' : '#000'};
    border-shadow: 0px 0px 10px 0px rgba(0,0,0,0.75);
    align-items: center;
    font-size: 16px;
    cursor: pointer;
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

  const ModalSignIn = styled.div`
    display: ${isSignIn ? 'flex' : 'none'};
    align-items: center;
    justify-content: center;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.5);
  `;

  const ModalSignUp = styled.div`
    display: ${isSignUp ? 'flex' : 'none'};
    align-items: center;
    justify-content: center;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.5);
  `;

  const ModalContent = styled.div`
    background-color: ${theme.backgroundColor};
    margin: auto;
    max-width: 80%;
    max-height: 80%;
    padding: 20px;
    overflow: auto;
  `;

    
    return (
      <ContainerHeader>
        <Logo>
          <img src={LogoPaci} alt="Pacifinance Logo" />
        </Logo>
        <ButtonContainer>
          <ToggleModeButton />
          <ButtonGroup>
            <Button id="openSignInModalButton" onClick={handleOpenSignIn}>Sign In</Button>
            <ModalSignIn> 
              <ModalContent>
                  <span class="close" onClick={handleCloseSignIn}>&times;</span>
                  <SignInForm />
              </ModalContent>
            </ModalSignIn>
            <Button id="openSignUpModalButton"onClick={handleOpenSignUp}>Sign Up</Button>
            <ModalSignUp> 
              <ModalContent>
                  <span class="close" onClick={handleCloseSignUp}>&times;</span>
                  <SignUpForm />
              </ModalContent>
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
      <FooterText>UpsetFinance &copy; 2023. All rights reserved.</FooterText>
    </ContainerFooter>
  );
};


export { Header, Footer };
