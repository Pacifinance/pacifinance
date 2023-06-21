import React, {useState, useContext} from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';
import ToggleModeButton from '../components/ToggleModeButton';
import { ThemeContext } from '../contexts/ThemeContext';
import { useNavigate } from "react-router-dom";
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import MuiCustomStyled from '../contexts/MuiCustomStyled';


const Header = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { mode } = theme;
  const [isModalOpen, setModalOpen] = useState(false);
 
  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
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
    border-color: ${(props) => (props.mode === 'dark' ? '#fff' : '#FF8000')};
    border-shadow: 0px 0px 10px 0px rgba(0,0,0,0.75);
    align-items: center;
    font-size: 16px;
    cursor: pointer;
  `;

  const Logo = styled.h1`
    font-size: 24px;
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

  const ModalSignInUp = styled.div`
    display: ${isModalOpen ? 'flex' : 'none'};
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
        <Logo>Logo</Logo>
        <ButtonContainer>
          <ToggleModeButton />
          <ButtonGroup>
            <Button id="openSignInModalButton" onClick={handleOpenModal}>Sign In</Button>
            <ModalSignInUp> 
              <ModalContent>
                  <span class="close" onClick={handleCloseModal}>&times;</span>
                  <SignInForm />
              </ModalContent>
            </ModalSignInUp>
            <Button id="openSignUpModalButton"onClick={handleOpenModal}>Sign Up</Button>
            <ModalSignInUp> 
              <ModalContent>
                  <span class="close" onClick={handleCloseModal}>&times;</span>
                  <SignUpForm />
              </ModalContent>
            </ModalSignInUp>
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
