import React from 'react';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import LandingPageImage from '../assets/LandingPage/PacifinanceArt2NoBg.png';
import {
  MyButton,
  Container,
  Title,
  PaciText,
  FinanceText,
  Subtitle,
  CentralSection,
  CentralText,
  CentralImage,
  FeaturesSection,
  Feature,
  FeatureIcon,
  FeatureText,
} from '../contexts/MyStyled';

const LandingContent = () => {

  
  

  return (
    <Container>
      <Title>
        <PaciText>Paci</PaciText>
        <FinanceText>Finance</FinanceText>
      </Title>
      <Subtitle>Personal, Privacy, Pacify</Subtitle>
      
      <CentralSection>
        <CentralText>
          <h1>Privacy, Sicurezza e Confronto</h1>
          <p>La piattaforma sicura e privacy oriented per la finanza personale.</p>
          <p>Potrai confrontarti con altri utenti sia nel tuo settore <br></br> che non, nel tuo paese o all'estero.</p>
          <p>Check del portafoglio, delle entrate e delle spese nel tempo.</p>
          <MyButton>Scopri di più</MyButton>
        </CentralText>
        <CentralImage src={LandingPageImage} alt="Pacifinance Art"/>
        
      </CentralSection>
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


// const {
  //   MyButton,
  //   Container,
  //   Title,
  //   PaciText,
  //   FinanceText,
  //   Subtitle,
  //   CentralSection,
  //   CentralText,
  //   CentralImage,
  //   FeaturesSection,
  //   Feature,
  //   FeatureIcon,
  //   FeatureText,
  // } = MyStyled();



