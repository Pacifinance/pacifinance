import React, {useState, useContext} from 'react';
import styled from 'styled-components';
import ToggleModeButton from '../components/ToggleModeButton';
import { ThemeContext } from '../contexts/ThemeContext';
import { useNavigate } from "react-router-dom";


const Header = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { mode } = theme;


  const handleSignIn = () => {
    navigate('/sign-in');
  };
  
  const handleSignUp = () => {
    navigate('/sign-up');
  };

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
    border: none;
    border-radius: 4px;
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

  
  return (
    <ContainerHeader>
      <Logo>UpsetFinance</Logo>
      <ToggleModeButton />
      <ButtonGroup>
        <Button primary onClick={handleSignIn}>Sign In</Button>
        <Button onClick={handleSignUp}>Sign Up</Button>
      </ButtonGroup>
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
