import React, { useState, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import styled from 'styled-components';
// import { Title } from '@material-ui/icons';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';




const LandingContent = () => {
  const { theme } = useContext(ThemeContext);
  const { mode } = theme;

  //to elimnate the white row between the content and the footer put height: 81vh in the container
  const Container = styled.div`
    font-family: Roboto, sans-serif;
    height: 81vh; 
    background-color: ${theme.backgroundColor};
    color: ${theme.textColor};
  `;
  const Title = styled.h1`
    font-size: 48px;
    margin-bottom: 10px; /* Aggiungi qui il valore di spaziatura desiderato */
    text-align: center;

  `;

  const UpsetText = styled.span`
    color: ${theme.buttonBackgroundColor};
  `;

  const FinanceText = styled.span`
    color: ${theme.textColor};
  `;

  const CTAButton = styled.button`
    background-color: ${theme.buttonBackgroundColor};
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    font-size: 18px;
    cursor: pointer;
  `;
  const HeroSection = styled.section`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 60px;
  `;

  const HeroText = styled.div`
    max-width: 800px;
    p {
      margin-bottom: 20px; 
    }
    h1 {
      margin-bottom: 20px;
    }
  `;

  const HeroImage = styled.img`
    max-width: 600px;
    height: auto;
  `;

  const FeaturesSection = styled.section`
    display: grid;
    bottom: 0;
    grid-template-columns: repeat(3, 1fr);
    align-items: center;
    gap: 60px;
    padding: 60px;
    max-width: 1400px; /* Aggiungi una larghezza massima desiderata */
    margin: 0 auto; /* Centra orizzontalmente il contenitore */
  `;

  const Feature = styled.div`
    display: flex;
    align-items: center;
  `;

  const FeatureIcon = styled.div`
    background-color: ${theme.iconBackgroundColor};
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
    color: ${theme.jollyColor};
    text-color: ${theme.jollyColor};
  `;

  return (
    <Container mode={mode}>
      <Title>
        <UpsetText>Upset</UpsetText>
        <FinanceText>Finance</FinanceText>
      </Title>
      <HeroSection>
        <HeroText>
          <h1>Privacy, Sicurezza e Confronto</h1>
          <p>La piattaforma sicura e privacy oriented per la finanza personale.</p>
          <p>La prima piattaforma che ti permette di confrontarti con altri utenti <br></br>sia nel tuo settore che non, nel tuo paese o all'estero.</p>
          <p>Check del portafoglio, delle entrate e delle spese nel tempo.</p>
          <CTAButton>Scopri di più</CTAButton>
        </HeroText>
        {/* <HeroImage src="/path/to/hero-image.jpg" alt="Hero Image" /> */}
      </HeroSection>
      <FeaturesSection>
        <Feature>
          <FeatureIcon>
            <CheckCircleIcon />
          </FeatureIcon>
          <FeatureText>
            <h3>Facile da usare</h3>
            <p>Controlla i tuoi risparmi e i tuoi investimenti<br></br> in modo semplice e intuitivo.</p>
          </FeatureText>
        </Feature>
        <Feature>
          <FeatureIcon>
            <ShieldIcon />
          </FeatureIcon>
          <FeatureText>
            <h3>Sicurezza garantita</h3>
            <p>Dati sicuri, anonimi e non sensibili<br></br> La privacy dell'utente è la nostra priorità. </p>
          </FeatureText>
        </Feature>
        <Feature>
          <FeatureIcon>
            <LockIcon/>
          </FeatureIcon>
          <FeatureText>
            <h3>Professionale e affidabile</h3>
            <p>Servizi di confronto personale e con altri<br></br> utenti, mantenendo la tua privacy.</p>
          </FeatureText>
        </Feature>
      </FeaturesSection>
    </Container>
  );
};

//o lato, sans-serif;

export default LandingContent;
