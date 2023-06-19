import React from 'react';
import styled from 'styled-components';
import ToggleModeButton from '../components/ToggleModeButton';
import { useNavigate } from "react-router-dom";


const Header = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/sign-in');
  };
  
  const handleSignUp = () => {
    navigate('/sign-up');
  };
  
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
  return (
    <ContainerFooter>
      <FooterText>UpsetFinance &copy; 2023. All rights reserved.</FooterText>
    </ContainerFooter>
  );
};

const ContainerHeader = styled.header`
  background-color: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.textColor};
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ContainerFooter = styled.footer`
  background-color: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.textColor};
  // padding-bottom: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20;
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.buttonBackground};
  color: ${(props) => props.theme.textColor};  
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

const FooterText = styled.p`
  font-size: 14px;
  // color: ${(props) => props.theme.textColor};
`;


export { Header, Footer };
