import React, { useState, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import styled from 'styled-components';
// import { Title } from '@material-ui/icons';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import LandingPageImage from '../assets/LandingPage/PacifinanceArt2NoBg.png';




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
    font-size: 60px;
    margin-bottom: 10px; /* Aggiungi qui il valore di spaziatura desiderato */
    text-align: center;

  `;

  const Subtitle = styled.h2`
    font-size: 14px;
    margin-bottom: 20px;
    text-align: center;
    color: ${theme.buttonBackgroundColor};
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
  const CentralSection = styled.section`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-left: 5%;
    margin-top: 2%;
    margin-bottom: 0.5%;
    // padding: 60px;
  `;

  const CentralText = styled.div`
    max-width: 800px;
    // text-align: center;
    p {
      margin-bottom: 20px; 
    }
    h1 {
      margin-bottom: 20px;
    }
  `;

  const CentralImage = styled.img`
    max-width: 600px;
    height: auto;
    margin-right: 3%;
  `;

  const FeaturesSection = styled.section`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: center;
    bottom: 0;
    gap: 60px;
    // padding: 60px;
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
        <UpsetText>Paci</UpsetText>
        <FinanceText>Finance</FinanceText>
        <Subtitle>Personal, Privacy, Pacify</Subtitle>
      </Title>
      <CentralSection>
        <CentralText>
          <h1>Privacy, Sicurezza e Confronto</h1>
          <p>La piattaforma sicura e privacy oriented per la finanza personale.</p>
          <p>Potrai confrontarti con altri utenti sia nel tuo settore <br></br> che non, nel tuo paese o all'estero.</p>
          <p>Check del portafoglio, delle entrate e delle spese nel tempo.</p>
          <CTAButton>Scopri di più</CTAButton>
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




// import React, { useState, useContext } from 'react';
// import { ThemeContext } from '../contexts/ThemeContext';
// import styled from 'styled-components';
// import LockIcon from '@mui/icons-material/Lock';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import ShieldIcon from '@mui/icons-material/Shield';

// const LandingContent = () => {
//   const { theme } = useContext(ThemeContext);
//   const { mode } = theme;

//   const Container = styled.div`
//     font-family: 'Roboto', sans-serif;
//     height: 100vh;
//     background-image: url('/path/to/background-image.jpg');
//     background-size: cover;
//     background-position: center;
//     color: ${theme.textColor};
//   `;

//   const Title = styled.h1`
//     font-size: 48px;
//     margin-bottom: 10px;
//     text-align: center;
//     color: ${theme.buttonBackgroundColor};
//   `;

//   const Subtitle = styled.h2`
//     font-size: 36px;
//     margin-bottom: 20px;
//     text-align: center;
//     color: ${theme.buttonBackgroundColor};
//   `;

//   const FeaturesSection = styled.section`
//     display: grid;
//     grid-template-columns: repeat(3, 1fr);
//     gap: 60px;
//     padding: 60px;
//     max-width: 1400px;
//     margin: 0 auto;
//     background-color: ${theme.backgroundColor};
//     border-radius: 10px;
//     box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
//   `;

//   const Feature = styled.div`
//     display: flex;
//     align-items: center;
//     margin-bottom: 20px;
//   `;

//   const FeatureIcon = styled.div`
//     background-color: ${theme.buttonBackgroundColor};
//     color: white;
//     padding: 20px;
//     border-radius: 50%;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     font-size: 24px;
//     margin-right: 20px;
//   `;

//   const FeatureText = styled.div`
//     margin-left: 20px;
//   `;

//   const Icon = styled.div`
//     color: ${theme.jollyColor};
//   `;

//   const CTAButton = styled.button`
//     background-color: ${theme.buttonBackgroundColor};
//     color: white;
//     padding: 12px 24px;
//     border: none;
//     border-radius: 4px;
//     font-size: 18px;
//     cursor: pointer;
//     margin-top: 40px;
//     display: block;
//     margin-left: auto;
//     margin-right: auto;
//   `;

//   return (
//     <Container mode={mode}>
//       <Title>Paci Finance</Title>
//       <Subtitle>La piattaforma sicura e privacy oriented per la finanza personale</Subtitle>
//       <FeaturesSection>
//         <Feature>
//           <FeatureIcon>
//             <CheckCircleIcon />
//           </FeatureIcon>
//           <FeatureText>
//             <h3>Facile da usare</h3>
//             <p>Controlla i tuoi risparmi e i tuoi investimenti in modo semplice e intuitivo.</p>
//           </FeatureText>
//         </Feature>
//         <Feature>
//           <FeatureIcon>
//             <ShieldIcon />
//           </FeatureIcon>
//           <FeatureText>
//             <h3>Sicurezza garantita</h3>
//             <p>Dati sicuri, anonimi e non sensibili. La privacy dell'utente è la nostra priorità.</p>
//           </FeatureText>
//         </Feature>
//         <Feature>
//           <FeatureIcon>
//             <LockIcon />
//           </FeatureIcon>
//           <FeatureText>
//             <h3>Confronto con altri utenti</h3>
//             <p>Confrontati con altri utenti sia nel tuo settore che non, sia nel tuo paese che all'estero.</p>
//           </FeatureText>
//         </Feature>
//       </FeaturesSection>
//       <CTAButton>Scopri di più</CTAButton>
//     </Container>
//   );
// };

// export default LandingContent;



