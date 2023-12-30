import React, { useContext } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import LandingPageImage from '../assets/LandingPage/PacifinanceArt2NoBg.webp';
import CookieBanner from '../components/CookieBanner';
import { LanguageContext } from '../contexts/LanguageContext';
import languages from '../contexts/languages.json';
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

export default function LandingContent({theme}) {
  const { language } = useContext(LanguageContext);
  

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
            <h1>{languages[language].landing.sectionTitle}</h1>
            <p>{languages[language].landing.descriptionRow1}</p>
            <p dangerouslySetInnerHTML={{ __html: languages[language].landing.descriptionRow2 }}></p>
            <p>{languages[language].landing.descriptionRow3}</p>
            <MyButton theme={theme}>{languages[language].landing.discoverButton}</MyButton>
          </CentralText>
          <CentralImage src={LandingPageImage} width="100%" height="100%" alt="Pacifinance Art" draggable="false" onContextMenu={(e) => e.preventDefault()}/>
          
        </CentralSection>
        <FeaturesSection theme={theme}>
          <Feature theme={theme}>
            <FeatureIcon theme={theme}>
              <CheckCircleIcon />
            </FeatureIcon>
            <FeatureText theme={theme}>
              <h3>{languages[language].landing.point1.title}</h3>
              <p dangerouslySetInnerHTML={{ __html: languages[language].landing.point1.description }}></p>
            </FeatureText>
          </Feature>
          <Feature theme={theme}>
            <FeatureIcon theme={theme}>
              <ShieldIcon />
            </FeatureIcon>
            <FeatureText theme={theme}>
              <h3>{languages[language].landing.point2.title}</h3>
              <p dangerouslySetInnerHTML={{ __html: languages[language].landing.point2.description }}></p>
            </FeatureText>
          </Feature>
          <Feature theme={theme}>
            <FeatureIcon theme={theme}>
              <LockIcon/>
            </FeatureIcon>
            <FeatureText theme={theme}>
              <h3>{languages[language].landing.point3.title}</h3>
              <p dangerouslySetInnerHTML={{ __html: languages[language].landing.point3.description }}></p>
            </FeatureText>
          </Feature>
        </FeaturesSection>
      </LandingPageContainer>
  );
};



