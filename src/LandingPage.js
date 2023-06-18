import React from 'react';
import styled from 'styled-components';
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/sign-in');
  };

  const handleSignUp = () => {
    navigate('/sign-up');
  };

  return (
    <Container>
      <Header>
        <Logo>UpsetFinance</Logo>
        <ButtonGroup>
          <Button primary onClick={handleSignIn}>Sign In</Button>
          <Button onClick={handleSignUp}>Sign Up</Button>
        </ButtonGroup>
      </Header>
      <HeroSection>
        <HeroText>
          <h1>Benvenuto in UpsetFinance</h1>
          <p>La piattaforma sicura per controllare i tuoi risparmi e i tuoi investimenti.</p>
          <p>Per segnare le tue spese e gestirle al meglio.</p>
          <p>La prima piattaforma che ti permette di confrontarti con altri utenti nel tuo settore, nel tuo paese o all'estero.</p>
          <CTAButton>Scopri di più</CTAButton>
        </HeroText>
        <HeroImage src="/path/to/hero-image.jpg" alt="Hero Image" />
      </HeroSection>
      <FeaturesSection>
        <Feature>
          <FeatureIcon>
            <Icon className="icon" />
          </FeatureIcon>
          <FeatureText>
            <h3>Facile da usare</h3>
            <p>Gestisci i tuoi investimenti in modo semplice e intuitivo.</p>
          </FeatureText>
        </Feature>
        <Feature>
          <FeatureIcon>
            <Icon className="icon" />
          </FeatureIcon>
          <FeatureText>
            <h3>Sicurezza garantita</h3>
            <p>Proteggiamo i tuoi dati personali e finanziari.</p>
          </FeatureText>
        </Feature>
        <Feature>
          <FeatureIcon>
            <Icon className="icon" />
          </FeatureIcon>
          <FeatureText>
            <h3>Professionale e affidabile</h3>
            <p>Offriamo servizi finanziari di alta qualità.</p>
          </FeatureText>
        </Feature>
      </FeaturesSection>
      <Footer>
        <FooterText>UpsetFinance &copy; 2023. All rights reserved.</FooterText>
      </Footer>
    </Container>
  );
};

const Container = styled.div`
  font-family: Arial, sans-serif;
`;

const Header = styled.header`
  background-color: black;
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.h1`
  font-size: 24px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  background-color: ${(props) => (props.primary ? 'orange' : 'white')};
  color: ${(props) => (props.primary ? 'white' : 'black')};
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
`;

const HeroSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60px;
`;

const HeroText = styled.div`
  max-width: 500px;
`;

const CTAButton = styled.button`
  background-color: orange;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
`;

const HeroImage = styled.img`
  max-width: 600px;
  height: auto;
`;

const FeaturesSection = styled.section`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  padding: 60px;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
`;

const FeatureIcon = styled.div`
  background-color: orange;
  color: white;
  padding: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const FeatureText = styled.div`
  margin-left: 20px;
`;

const Icon = styled.div`
  /* Aggiungi qui l'icona desiderata */
`;

const Footer = styled.footer`
  background-color: black;
  color: white;
  padding: 20px;
  text-align: center;
`;

const FooterText = styled.p`
  font-size: 14px;
`;

export default LandingPage;
