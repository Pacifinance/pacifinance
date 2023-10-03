import React, {useContext} from 'react';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import LandingPageImage from '../assets/LandingPage/PacifinanceArt2NoBg.webp';
import { ThemeContext } from '../contexts/ThemeContext';
import CookieBanner from '../components/CookieBanner';
import {
  MyButton,
  LandingPageContainer,
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

export default function LandingContent() {

  const { theme } = useContext(ThemeContext);
  

  return (
      <LandingPageContainer theme={theme}>
        <CookieBanner />
        <Title theme={theme}>
          <PaciText theme={theme}>Paci</PaciText>
          <FinanceText theme={theme}>Finance</FinanceText>
        </Title>
        <Subtitle theme={theme}>Personal, Privacy, Pacify</Subtitle>
        
        <CentralSection theme={theme}>
          <CentralText theme={theme}>
            <h1>Privacy, Sicurezza e Confronto</h1>
            <p>La piattaforma sicura e privacy oriented per la finanza personale.</p>
            <p>Potrai confrontarti con altri utenti sia nel tuo settore <br></br> che non, nel tuo paese o all'estero.</p>
            <p>Check del portafoglio, delle entrate e delle spese nel tempo.</p>
            <MyButton theme={theme}>Scopri di più</MyButton>
          </CentralText>
          <CentralImage src={LandingPageImage} alt="Pacifinance Art" draggable="false" onContextMenu={(e) => e.preventDefault()}/>
          
        </CentralSection>
        <FeaturesSection theme={theme}>
          <Feature theme={theme}>
            <FeatureIcon theme={theme}>
              <CheckCircleIcon />
            </FeatureIcon>
            <FeatureText theme={theme}>
              <h3>Facile da usare</h3>
              <p>Controlla i tuoi risparmi e i tuoi investimenti<br></br> in modo semplice e intuitivo.</p>
            </FeatureText>
          </Feature>
          <Feature theme={theme}>
            <FeatureIcon theme={theme}>
              <ShieldIcon />
            </FeatureIcon>
            <FeatureText theme={theme}>
              <h3>Sicurezza garantita</h3>
              <p>Dati sicuri, anonimi e non sensibili<br></br> La privacy dell'utente è la nostra priorità. </p>
            </FeatureText>
          </Feature>
          <Feature theme={theme}>
            <FeatureIcon theme={theme}>
              <LockIcon/>
            </FeatureIcon>
            <FeatureText theme={theme}>
              <h3>Professionale e affidabile</h3>
              <p>Servizi di confronto personale e con altri<br></br> utenti, mantenendo la tua privacy.</p>
            </FeatureText>
          </Feature>
        </FeaturesSection>
      </LandingPageContainer>
  );
};



