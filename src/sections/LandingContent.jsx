import React, { useState, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import styled from 'styled-components';




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
    max-width: 500px;
    p {
      margin-bottom: 10px; /* Aggiungi qui il valore di spaziatura desiderato */
    }
    h1 {
      margin-bottom: 10px; /* Aggiungi qui il valore di spaziatura desiderato */
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
    gap: 30px;
    padding: 60px;
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
  `;

  return (
    <Container mode={mode}>
      <HeroSection>
        <HeroText>
          <h1>Benvenuto in UpsetFinance</h1>
          <p>La piattaforma sicura per controllare i tuoi risparmi, le pese e gli investimenti.</p>
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
            <p>Controlla i tuoi risparmi e i tuoi investimenti in modo semplice e intuitivo.</p>
          </FeatureText>
        </Feature>
        <Feature>
          <FeatureIcon>
            <Icon className="icon" />
          </FeatureIcon>
          <FeatureText>
            <h3>Sicurezza garantita</h3>
            <p>Crittografiamo i tuoi dati personali e finanziari.</p>
          </FeatureText>
        </Feature>
        <Feature>
          <FeatureIcon>
            <Icon className="icon" />
          </FeatureIcon>
          <FeatureText>
            <h3>Professionale e affidabile</h3>
            <p>Offriamo servizi di controllo e confronto di alta qualità.</p>
          </FeatureText>
        </Feature>
      </FeaturesSection>
    </Container>
  );
};

//o lato, sans-serif;

export default LandingContent;
