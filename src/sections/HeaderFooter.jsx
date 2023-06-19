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
    <Container>
      <Logo>UpsetFinance</Logo>
      <ToggleModeButton />
      <ButtonGroup>
        <Button primary onClick={handleSignIn}>Sign In</Button>
        <Button onClick={handleSignUp}>Sign Up</Button>
      </ButtonGroup>
    </Container>
  );
};

const Footer = () => {
  return (
    <Container>
      <FooterText>UpsetFinance &copy; 2023. All rights reserved.</FooterText>
    </Container>
  );
};

const Container = styled.header`
  background-color: ${(props) => props.theme.backgroundColor};
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

// Header = styled.header`
//   background-color: ${(props) => props.theme.backgroundColor};
//   color: white;
//   padding: 20px;
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
// `;

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

// Footer = styled.footer`
//   background-color: black;
//   color: white;
//   padding: 20px;
//   text-align: center;
// `;

const FooterText = styled.p`
  font-size: 14px;
`;


export { Header, Footer };
