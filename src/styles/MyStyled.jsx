import { primaryColor, secondaryColor, backgroundColor, themes } from './Themes';
import styled, { keyframes, css } from 'styled-components';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleModeButton from '../components/ToggleModeButton';
import PrivacyToggleModeButton from '../components/PrivacyToggleModeButton'; 
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { Calendar } from 'react-calendar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

// UNUSED STYLED COMPONENTS (commented out for future cleanup)
export const PageWrapper = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh; // Imposta l'altezza della pagina al 100% della viewport
  display: flex;

  @media (max-width: 768px) {
    width: auto;
    height: auto;
    display: block;

  }
`;

export const Section = styled.section `
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  margin-left: 0;
  padding-top: 2rem;
  min-height: 100vh;
  background-color: ${(props) => (props.theme.backgroundColor)};
  line-height: 1.6;

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    margin-left: 0;
    padding-top: 1rem;
  }
`;

export const SectionDashboard = styled.section`
    font-family: Roboto, sans-serif;
    background-color: ${(props) => (props.theme.backgroundColor)};
    width: 100%;
    min-height: 100vh;
    overflow-x: auto;
`;

export const MyGenericModal = styled.div`
  align-items: center;
  justify-content: center;
  pointer-events: 'none';
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 0.2em;
  border: 0.2em solid ${(props) => (props.theme.jollyColor)};
`;

export const MyGenericModalContent = styled.div`
  background-color: ${(props) => (props.theme.backgroundColor)};
  border-radius: 1em;
  margin: auto;
  max-width: auto;
  max-height: auto;
  padding: 1em;
  overflow: auto;
`;

export const MyButton = styled.button`
  background-color: ${(props) => (props.disabled ? 'lightgray' : props.theme.buttonBackgroundColor)};
  color: ${(props) => (props.disabled ? 'darkgray' : 'white')};  
  padding: 0.5em 1em;
  border: none;
  border-radius: 0.2em;
  align-items: center;
  font-size: 1em;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    padding: 0.2em 0.2em;
    border-radius: 0.2em;
    font-size: 1.1rem;
  }
`;

export const MyCloseButton = styled.span`
  background-color: ${(props) => (props.theme.buttonBackgroundColor)};
  color: white;
  border: none;
  border-radius: 0.2em;
  width: 1em; 
  height: 1em; 
  text-align: center;
  display: inline-block;
  line-height: 1em;
  &:hover {
    color: #000;
  }
  cursor: pointer;
`;

// Standard Page Title - White/Text Color
export const StandardPageTitle = styled.h1`
    font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
    color: ${(props) => (props.theme.textColor)};
    font-size: clamp(1.75rem, 3.5vw, 2.5rem);
    font-weight: 600;
    letter-spacing: -0.025em;
    line-height: 1.3;
    text-align: center;
    margin: 2rem auto;
    margin-bottom: 2rem;
    max-width: 1200px;

    @media (max-width: 768px) {
      margin: 1.5rem auto;
      margin-bottom: 1.5rem;
    }
`;

// Standard Page Title - Green/Primary Color
export const StandardPageTitleGreen = styled.h1`
    font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
    color: ${(props) => (props.theme.buttonBackgroundColor)};
    font-size: clamp(1.75rem, 3.5vw, 2.5rem);
    font-weight: 600;
    letter-spacing: -0.025em;
    line-height: 1.3;
    text-align: center;
    margin: 2rem auto;
    margin-bottom: 2rem;
    max-width: 1200px;

    @media (max-width: 768px) {
      margin: 1.5rem auto;
      margin-bottom: 1.5rem;
    }
`;

// Deprecated - use StandardPageTitle instead
export const TitleDashboard = styled.h1 `
    font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
    color: ${(props) => (props.theme.textColor)};
    font-size: clamp(1.75rem, 3.5vw, 2.5rem);
    font-weight: 600;
    letter-spacing: -0.025em;
    line-height: 1.3;
    margin-bottom: 2rem;

    /* For screens with a maximum width of 768px (e.g. mobile devices) */
    @media (max-width: 768px) {
      margin-bottom: 1.5rem;
    }
`;

// Deprecated - use StandardPageTitle instead
export const TitleStatsCharts = styled.h1 `
  color: ${(props) => (props.theme.textColor)};
  font-size: 2rem;
  font-weight: 400;
  margin-bottom: 2rem;
  margin-left: 6%;

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-left: 15%;
  }
`;

export const SignIn = styled.div`

  font-family: Roboto, sans-serif;

  .sign-in-page {
    background-color: ${(props) => (props.theme.backgroundColor)};
    height: 50vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .sign-in-form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .sign-in-form h1 {
    color: ${(props) => (props.theme.textColor)};
    margin-bottom: 1em;
  }

  .icon-with-text {
    display: flex;
    color: ${(props) => (props.theme.buttonBackgroundColor)};
    align-items: center; 
    margin-bottom: 2.5em;
  }

  .icon-with-text h4 {
    color: ${(props) => (props.theme.buttonBackgroundColor)};
    margin-left: 0.5em; 
  }

  .sign-in-form label {
    color: ${(props) => (props.theme.textColor)};
    margin-bottom: 0.4em;
  }

  .sign-in-form input {
    padding: 0.4em;
    border: none;
    background-color: transparent;
    color: ${(props) => (props.theme.textColor)};
    margin-bottom: 0.8em;
  }

  .sign-in-form input::placeholder {
    color: ${(props) => (props.theme.textColor)};
  }

  .button-wrapper {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    margin-top: 1em;
  }

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    width: 100vw;
    .sign-in-page {
      height: 40vh;
      width: 75vw;
      display: block;
      align-items: left;
    }

    .sign-in-form h1 {
      font-size: 1.2em; 
    }

    .icon-with-text h4 {
      font-size: 0.8em;
    }

    .sign-in-form label {
      font-size: 0.6em; 
    }

    .sign-in-form input {
      font-size: 0.6em; 
    }
  }
`;

export const ModalButton = styled(MyButton)`
  margin-right: 40%;
`;

/****************************** LANDING PAGE **************************************/
export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const ContainerHeader = styled.header`
  background-color: ${(props) => (props.theme.backgroundColor)};
  color: ${(props) => (props.theme.textColor)};
  height: 10vh;
  width: 100vw;
  padding: 2em;
  display: flex;
  align-items: center;
  justify-content: space-between;

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    height: 10vh;
    width: 100vw;
  }
`;

export const LandingPageContainer = styled.div`
  font-family: Roboto, sans-serif;
  top: 10vh;
  min-height: 80vh;
  bottom: 10vh;
  width: 100vw;
  background-color: ${(props) => (props.theme.backgroundColor)};
  color: ${(props) => (props.theme.textColor)};
  position: fixed;
  flex-grow: 1;

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    height: 200vh;
    width: 100vw;
    position: absolute;
  }
`;

export const ContainerFooter = styled.footer`
  background-color: ${(props) => (props.theme.backgroundColor)};
  color: ${(props) => (props.theme.textColor)};
  height: 10vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1em;
  bottom: 0;
  position: sticky;

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    height: 10vh;
    width: 100vw;
  }
`;

export const LogoStyled = styled.h1`
  font-size: 0em;
  img {
    width: 90px;
  }
  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    img {
      width: 40px;
    }
    margin-left: -5%;
    margin-right: 5%;
    margin-top: -1%;
  }

`;

export const CentralImage = styled.img`
  max-width: 25em;
  margin-right: 3%;
  draggable="false"

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    max-width: 10em;
    margin-right: 20%;
    margin-bottom: 5%;
  }
`;

export const Title = styled.h1`
  font-size: 3.5em;
  margin-bottom: 0.25em; 
  text-align: center;

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    font-size: 2em;
    margin-bottom: 0.25em;
  }

`;

export const Subtitle = styled.h2`
  font-size: 0.9em;
  text-align: center;
  color: ${(props) => (props.theme.buttonBackgroundColor)};

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
   margin-bottom: 5%;
   font-size: 0.6em; 
  }
`;

export const PaciText = styled.span`
  color: ${(props) => (props.theme.buttonBackgroundColor)};
`;

export const FinanceText = styled.span`
  color: ${(props) => (props.theme.textColor)};
`;

export const CentralSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: 5%;
  margin-bottom: 0.5%;

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    // flex-direction: column;
    margin-left: 5%;

  }
`;

export const CentralText = styled.div`
  max-width: 40em;
  // text-align: center;
  p {
    margin-bottom: 1em; 
  }
  h1 {
    margin-bottom: 1em;
  }

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    max-width: 12.5em;
    h1 {
      font-size: 2rem;
      margin-bottom: 5%;
      margin-top: 20%;
    }
    p {
      font-size: 1rem;
      margin-bottom: 5%; 
    }


  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5em;

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    gap: 0.2em;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5em;
`;

export const ModalSignIn = styled(MyGenericModal)`
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
`;

export const ModalSignUp = styled(MyGenericModal)`
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
`;

export const FooterText = styled.p`
  font-size: 0.9em;
`;

export const SignUp = styled.div`

      font-family: Roboto, sans-serif;

      .signUp-page {
          background-color: ${(props) => (props.theme.backgroundColor)};
          height: 50vh;
          display: flex;
          justify-content: center;
          align-items: center;
      }

      .signUp-form {
          display: flex;
          flex-direction: column;
          align-items: center;
      }

      .signUp-form h1 {
          color: ${(props) => (props.theme.textColor)};
          margin-bottom: 1em;
      }

      .icon-with-text {
          display: flex;
          color: ${(props) => (props.theme.buttonBackgroundColor)};
          align-items: center; /* Allinea verticalmente gli elementi */
          margin-bottom: 2.5em;
        }

      .icon-with-text h4 {
          color: ${(props) => (props.theme.buttonBackgroundColor)};
          margin-left: 0.5em; /* Aggiungi uno spazio tra l'icona e il testo */
      }

      .input-wrapper {
          position: relative;
      }


      .signUp-form label {
          color: ${(props) => (props.theme.textColor)};
          margin-bottom: 0.4em;
      }

      .signUp-form input {
          padding: 0.4em;
          border: none;
          background-color: transparent;
          color: ${(props) => (props.theme.textColor)};
          margin-bottom: 0.8em;
      }

      .signUp-form input::placeholder {
          color: ${(props) => (props.theme.textColor)};
      }

      // .signUp-form button {
      //     // padding: o.4em 0.8em;
      //     background-color: ${(props) => (props.theme.buttonBackgroundColor)};
      //     color: ${(props) => (props.theme.textColor)};
      //     // border: none;
      //     cursor: pointer;
      // }

      .button-wrapper {
          display: flex;
          justify-content: flex-end;
          width: 100%;
          margin-top: 1em;
        }



  `;

  export const SignUpButton = styled.button`
  background-color: ${(props) => (props.theme.secondaryColor)};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;

  &:hover {
    background-color: ${(props) => (props.theme.secondaryColor)}dd;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

  // Deprecated - use StandardPageTitle instead
export const ModifiedTitleDashboard = styled(TitleDashboard)`
    font-size: 2rem;
    font-weight: bold;
    text-align: left; 
    margin-top: 1em; 
    margin-left: 6vw;

    /* For screens with a maximum width of 768px (e.g. mobile devices) */
    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
`;

export const MySecondaryButton = styled(MyButton)`
  font-size: 1.2rem;
  margin-bottom: 1em;
  max-height: 3rem;

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 1em;
    margin-left: 0.2em;
    margin-top: 1em;
    max-height: 3rem;
  }
`;

export const SecondaryTitle = styled.h2 `
    font-size: 1.5rem;
    color: ${(props) => (props.theme.textColor)};
    margin-left: 5rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    padding: 1rem;

    /* For screens with a maximum width of 768px (e.g. mobile devices) */
    @media (max-width: 768px) {
      font-size: 0.75rem;
      margin-left: 0rem;
    }
`;

export const TitleLastAdds = styled.h2`
  font-size: 1rem;
  font-weight: bold;
  color: ${(props) => (props.theme.textColor)};
  margin-bottom: 0.5%;
  margin-left: 6vw;

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 1%;
    margin-left: 15vw;
    margin-top: 2%;
    select {
      font-size: 0.85em !important;
      padding: 2px 4px !important;
      min-width: 70px !important;
      height: 1.7em !important;
      line-height: 1.1 !important;
      margin-left: 4.5em !important;
    }
  }
`;

export const TitleSection = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${(props) => (props.theme.textColor)};
  margin-top: 2em;
  margin-bottom: 1em;
  margin-left: 6vw;

  @media (max-width: 768px) {
    font-size: 1rem;

  }

`;

export const StyledSection = styled.div`
  font-family: Roboto, sans-serif; 
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: ${(props) => (props.theme.backgroundColor)};
  overflow-x: hidden; // to hide the scroll bar
  // overflow-y: hidden; // to hide the scroll bar
  .grid{ 
    margin-top: 2rem;
    z-index: 2;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    @media (max-width: 768px) {
        margin-top: 3em;
    }
  }

  @media (max-width: 768px) {
    margin-top: 0em;
  }
`;

export const StyledSectionStats = styled.div`
  font-family: Roboto, sans-serif; 
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  background-color: ${(props) => (props.theme.backgroundColor)};
  padding: 0;
  margin: 0;

  .grid{ 
    margin-top: 2rem;
    z-index: 2;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    padding: 0;
    margin: 0;
  }
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 1em;
  margin-left: 1em;

  @media (max-width: 768px) {
    margin-right: 0.5em;
    margin-left: 0.5em;

    input {
      width: 10em; // Modifica la larghezza degli input per la visualizzazione mobile
      height: 3em; // Modifica l'altezza degli input per la visualizzazione mobile
      fontSize: 10px; // Modifica la dimensione del testo per la visualizzazione mobile
    }
  }
`;

export const StyledInputs = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
  height: 100%;
  margin-top: 1vw;
  margin-left: 5vw;
  color: ${(props) => props.theme.textColor};

  @media (max-width: 768px) {
    width: 40%; // Larghezza ridotta per adattarsi ai dispositivi mobili
    margin-top: 0.5em;
    margin-left: 0;
  }
`;

export const StyledCalendarInput = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 100%;
  height: 35%;
  margin-top: 1vw;
  margin-left: 5vw;
  color: black;
`;

export const inputStyle = {
  textAlign: "center",
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  color: "#333",
  outline: "none",
  width: "120px",
  marginBottom: "0.7em",

};

export const LabelContainer = styled.div`
  text-align: center;
  padding: 0.2em;
  background-color: white;
  border: 0.13em solid ${(props) => props.theme.buttonBackgroundColor};
  border-radius: 0.5em;
  outline: none;
  width: 15em;
  margin-bottom: 0.8em;

  @media (max-width: 768px) {
    width: 8em;
    margin-bottom: 0.5em;

  }
`;

export const LabelStyle = styled.label`{
  display: 'flex';
  alignItems: 'center';
  color: ${backgroundColor};
  height: '100%';
  fontWeight: 'bold';

  @media (max-width: 768px) {
    font-size: 1em;
  }

`;

// export const StyledInputs = styled.div`
//   display: flex;
//   justify-content: space-evenly;
//   width: 100%;
//   height: 100%;
//   margin-top: 1vw;
//   margin-left: 12vw;
//   color: ${(props) => (props.theme.textColor)};

//   label {
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     font-weight: bold;
//     font-size: 1.2rem;
//     margin-right: 1em;
//     margin-left: 1em;
//   }

//   input {
//     margin-top: 0.5em;
//     font-size: 1.2rem;
//     padding: 0.5em;
//   }

//   button {
//     margin-top: 0.5em;
//     font-size: 1.2rem;
//     padding: 0.5em;
//   }
// `;

export const StyledTable = styled.table`
  border-collapse: separate;
  border-spacing: 0;
  width: 50%;
  color: ${(props) => props.theme.textColor};
  margin-bottom: 5em;
  margin-left: 6vw;

  th {
    background-color: ${(props) => props.theme.buttonBackgroundColor};
    color: white;
    padding: 0.3em;
    &:first-child {
      border-top-left-radius: 10px;
    }
    &:last-child {
      border-top-right-radius: 10px;
    }
  }

  td, th {
    border: 1px solid ${(props) => props.theme.borderColor};
    text-align: center;
    padding: 0.3em;
  }

  tbody tr:hover {
    background-color: ${(props) => props.theme.jollyColor};
  }

  /* Responsive styles for mobile */
  @media (max-width: 600px) {
    width: 100% !important;
    min-width: 360px !important;
    th, td {
      font-size: 0.92em !important;
      padding: 4px 2px !important;
      min-width: 60px !important;
      line-height: 1.1 !important;
    }
    select, input, button {
      font-size: 0.95em !important;
      padding: 4px 2px !important;
    }
    .MuiInputBase-root, .MuiSelect-root {
      font-size: 0.95em !important;
    }
  }
`;

// export const StyledTable = styled.table`
//   border-collapse: collapse;
//   width: 50%;
//   background-color: ${(props) => (props.theme.backgroundColor)};
//   color: ${(props) => (props.theme.textColor)};
//   margin-bottom: 1em;
//   margin-left: 6vw;
//   overflow-y: auto; /* Enable vertical scroll */

//   td, th {
//     border: 0.025em solid black;
//     padding: 0.01em;
//     text-align: center;
//     background-color: ${(props) => (props.theme.backgroundColor)};
//   }

//   th {
//     background-color: ${(props) => (props.theme.backgroundColor)};
//   }
// `;

export const StyledAddSection = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 50%;
  margin-bottom: 1%;
  margin-top: 2%;
  margin-left: 6vw;
  color: ${(props) => (props.theme.textColor)};

  label {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-weight: bold;
    font-size: 1.2rem;
    margin-right: 1em;
  }

  input {
    margin-top: 0.5em;
    font-size: 1.2rem;
    padding: 0.4em;
  }

  button {
    margin-top: 0.5em;
    font-size: 1.2rem;
    padding: 0.5em;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    align-items: center;
    margin-left: 0;
    margin-top: 3em;

    label {
      margin-bottom: 0.5em;
    }

    input {
      width: 100%;
    }

    button {
      width: 50%;
    }
  }
`;

export const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 0.5em;
  color: #333;
  outline: none;
  font-size: 1rem;
`;

export const StyledLastAdds = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${(props) => (props.theme.textColor)};
  margin-bottom: 1em;
  margin-left: 6vw;
  width: 100%;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100%;
  }

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 0.5em;
  }

  button {
    font-size: 1.2rem;
    padding: 0.5em;
    background-color: ${(props) => (props.theme.backgroundColor)};
  }
`;

export const CapitalValue = styled.h1 `
    font-size: 2rem;
    color: ${(props) => (props.theme.textColor)};
    margin-top: 1rem;
    margin-left: 8rem;
    margin-bottom: 1rem;

    /* For screens with a maximum width of 768px (e.g. mobile devices) */
    @media (max-width: 768px) {
      font-size: 1rem;
      margin-left: 3%;
    }
`;

export const Container = styled.div`
  font-family: Roboto, sans-serif;
  height: 100%; 
  background-color: ${(props) => (props.theme.backgroundColor)};
  color: ${(props) => (props.theme.textColor)};
  padding-bottom: 5.25em;
`;

export const SectionADashboard = styled.section`
    font-family: Roboto, sans-serif;
    // display: flex; // questo risolve il problema del bianco ma bisogna incolonnare bene i contenuti
    background-color: ${(props) => (props.theme.backgroundColor)};
    width: 100%;
`;

export const FeaturesSection = styled.section`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-content: center;
  // align-items: center;
  margin-left: 6vw;
  gap: 3em;
  max-width: 100vw;

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    margin-left: 5vw;
    margin-top: 25vh;
    gap: 4em; 
    max_width: 100vw;
  }
`;

export const Feature = styled.div`
  display: flex;
  align-items: center;
`;

export const FeatureIcon = styled.div`
  background-color: ${(props) => (props.theme.iconBackgroundColor)};
  color: white;
  padding: 1em;
`;

export const FeatureText = styled.div`
  margin-left: 1em;
`;

export const Icon = styled.div`
  /* Aggiungi qui l'icona desiderata */
  color: ${(props) => (props.theme.jollyColor)};
  text-color: ${(props) => (props.theme.jollyColor)};
`;

export const SidebarToggleModeButton = styled(ToggleModeButton)`
      padding: 0.3em 0.5em;
      font-size: 0.8em;
      gap: 0.1em;

      /* For screens with a maximum width of 768px (e.g. mobile devices) */
      @media (max-width: 768px) {
        margin-top: 0.5em;
        padding: 1px 1px;
        font-size: 2px;

        svg {
          font-size: 2em; 
        }
      }
`;

export const SidebarPrivacyToggleModeButton = styled(PrivacyToggleModeButton)`
      padding: 0.3em 0.5em;
      font-size: 4px;
      gap: 0.1em;

      /* For screens with a maximum width of 768px (e.g. mobile devices) */

      @media (max-width: 768px) {
        margin-top: 0.5em;
        padding: 1px 1px;
        font-size: 2px;

        svg {
          font-size: 2em; 
        }
      }
`;



export const DropdownContainer = styled.div`
  position: relative;
  margin-bottom: 2em;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: center;

  .dropdown-header {
    cursor: pointer;
  }

  .dropdown-menu {
    position: absolute;
    top: 50px;
    right: -50px;
    width: 200px;
    background-color: ${({ theme }) => theme.backgroundColor};
    border: 2px solid ${({ theme }) => theme.buttonBackgroundColor};
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    z-index: 10001;
  }

  .dropdown-option {
    padding: 0.75rem;
    cursor: pointer;
    border-radius: 8px;
    margin-bottom: 0.25rem;
    transition: all 0.2s ease;
    color: ${({ theme }) => theme.textColor};
    width: 100%;
    text-align: left;
    border: none;
    background: transparent;
  }

  .dropdown-option:hover {
    background-color: ${({ theme }) => theme.buttonBackgroundColor};
    color: white;
    transform: scale(1.02);
  }

  .dropdown-option.logout {
    margin-top: 0.4em;
    color: #dc3545;
  }

  @media (max-width: 768px) {
    .dropdown-menu {
      position: fixed;
      top: 4rem;
      right: 1rem;
      left: auto;
      width: 180px;
    }
  }
`;

export const Notification = styled.div`
  position: relative;
  cursor: pointer;
  color: ${({ theme }) => theme.textColor};
  font-size: 1.5rem;
  padding: 0.25rem;
  border-radius: 50%;
  background: transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${({ theme }) => `${theme.buttonBackgroundColor}15`};
    transform: translateY(-2px) scale(1.05);
    box-shadow: ${({ theme }) => `0 4px 15px ${theme.buttonBackgroundColor}20`};
  }

  .account-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .account-image-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 2px solid ${({ theme }) => theme.buttonBackgroundColor};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    aspect-ratio: 1;
  }

  .account-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    filter: ${({ theme }) => theme.mode === 'dark' ? 'brightness(1.1)' : 'brightness(1)'};
  }

  @media (max-width: 768px) {
    font-size: 1.2rem;

    .account-image-wrapper {
      width: 37px;
      height: 37px;
    }
  }
`;

export const Top = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    padding: 0 1rem;
    gap: 1rem;
    flex: none;
  }
`;

export const Links = styled.div`
  ul {
      margin-bottom: 0.5rem;

      .active {
          border-right: 0.2rem solid ${(props) => (props.theme.textColor)};
      }

      .active a {
          color: ${(props) => (props.theme.buttonBackgroundColor)};
      }

      .active svg {
          color: ${(props) => (props.theme.buttonBackgroundColor)};

      }


      li{
          display: flex;
          justify-content: center;
          border-right: 0.2rem solid transparent;
          margin: 1rem 0;
          list-style-type: none;
          a {   
              text-decoration: none;
              color: ${(props) => (props.theme.textColor)};
              font-size: 1.6rem;
              gap: 0 0.4rem;;
          }
          .noti{
              display: flex;
              margin-left: 1.10em;
              span {
                  background-color: red;
                  font-size: 0.5rem;
                  border-radius: 50%;
                  padding: 0.1em 0.25em 0.1em 0.25em;
                  color: ${(props) => (props.theme.textColor)};
                  margin-bottom: 0.95em;
                  margin-top: -0.5em;
              }
          }
          transition: 0.3s ease-in-out;
          &:hover{
              a {
                  color: ${(props) => (props.theme.buttonBackgroundColor)};
              }
          }

      }

  }

  @media (max-width: 768px) {
    /* Modifica la disposizione dei link nel menu superiore */
    display: flex;
    margin-left: 4em;
    gap: 1rem;
    width: auto;
      ul {
        margin-bottom: 0.5rem;
        margin-top: 0.5rem;
        display: flex;
        list-style: none;
        padding: 0;
        .active {
            border-right: none;
        }
        li{
            margin: 0;
            a {
              font-size: 1.5rem; /* Riduci la dimensione del testo */
            }         
        }

      }
  }
`;

export const ToggleButton = styled.div`
  display: flex;
  justify-content: center;


  svg {
      font-size: 2.2em; 
  }

  @media (max-width: 768px) {
    position: absolute;
    top: 1.2em;
    right: 6em;
    svg {
      font-size: 7em; 
    }
  }
`;

export const SettingsToggleButton = styled.div`
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  margin: 0.5em;
  display: flex;
  padding: 0.5em 1em;
  border: 0.1em solid ${(props) => (props.theme.buttonBackgroundColor)};
  border-radius: 0.2em;
  justify-content: center;
  align-items: center;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    padding: 0.2em 0.2em;
    border-radius: 0.2em;
    font-size: 1.1rem;

    svg {
      font-size: em; 
    }
  }
`;



export const SidebarSection = styled.section`
  font-family: 'Roboto', sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  width: 5.5rem;
  height: 100vh;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? `linear-gradient(135deg, ${theme.backgroundColor} 0%, ${theme.backgroundColor}f0 100%)`
    : `linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)`};
  border-right: ${({ theme }) => theme.mode === 'dark' 
    ? `1px solid ${theme.buttonBackgroundColor}30`
    : '1px solid #e2e8f0'};
  box-shadow: ${({ theme }) => theme.mode === 'dark' 
    ? '4px 0 20px rgba(0, 0, 0, 0.3)' 
    : '4px 0 20px rgba(0, 0, 0, 0.08)'};
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 0;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.mode === 'dark' 
      ? `radial-gradient(circle at 50% 0%, ${theme.buttonBackgroundColor}10 0%, transparent 50%)`
      : `radial-gradient(circle at 50% 0%, ${theme.buttonBackgroundColor}05 0%, transparent 50%)`};
    pointer-events: none;
    z-index: -1;
  }

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    position: static;
    flex-direction: row;
    padding: 1rem 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  }
`;

  export const UpperSection = styled.div `
      display: flex;
      margin-top: 2rem;
      align-items: center;
      justify-content: center;
      z-index: -1; 

      .analytic {
          display: flex;
          position: relative;
          flex-direction: column;
          border-radius: 1rem;
          justify-content: center;
          align-items: center;
          padding: 1rem 2rem 1rem 2rem;
          text-align: center;
          font-size: 1.1rem;
          color: black;
          margin-right: 0%;
          margin-left: 3%;
          background-color: white;
          transition: 0.5s ease-in-out;
          height: 8.5em;
          width: 15em;
          border: 0.25em solid ${(props) => (props.theme.buttonBackgroundColor)};
          z-index: 0;
      }

      .title{
          h5{
              color: ${(props) => (props.theme.textColor)};
          }
      }

    /* For screens with a maximum width of 768px (e.g. mobile devices) */
    @media (max-width: 768px) {
      flex-direction: row;
      margin-right: 2;
      margin-left: 0;
      align-items: center;
      flex-wrap: nowrap;

      .analytic {
        width: 30%;
        height: 7.2em;
        margin: 0.5em;
      }
    }
  `;

  export const LowerSection = styled.div`
    display: flex;
    margin-top: 1rem;
    align-items: center;
    justify-content: center;

      .analytic {
          display: flex;
          position: relative;
          flex-direction: column; /* Imposta la direzione dei figli come colonna */
          align-items: center;
          justify-content: space-evenly;
          padding: 1rem 2rem 1rem 2rem;
          border-radius: 1rem;
          margin-right: 3%;
          margin-left: 3%;
          color: black;
          background-color: white;
          align-items: center;
          transition: 0.5s ease-in-out;
          width: 15em;
          height: 8em;
          border: 0.25em solid ${(props) => (props.theme.buttonBackgroundColor)};

          .design{
              display: flex;
              align-items: center;

              .logo {
                  background-color: white;
                  display: flex;
                  justify-content: center;
                  align-items: center;

                  svg {
                      font-size: 2rem;
                  }
              }
              .action {
                  margin-left: 4em;
                svg{
                    font-size: 1.5rem;
                }
              }

          }
          .transfer {
              margin-top: 1em;
              color: ${secondaryColor};
              font-size: 1.2rem;
          }
          .money {
              margin-top: 1em;
              font-size: 1rem;
          }
      }

      .title{
          h5{
              color: ${(props) => (props.theme.textColor)};
          }
      }

      @media (max-width: 768px) {
        flex-direction: row;
        align-items: center;
        flex-wrap: wrap;
        .analytic {
          width: 40%; /* Imposta la larghezza in percentuale per mostrare 2 elementi per riga */
          height: 7.2em;
          margin: 0.5em;
          margin-left: 1.3em;

          .design {
            .logo {
              svg {
                font-size: 1.7rem;
              }
            }
          }
        }
      }
  `;

  export const GraphsSection = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    margin-top: 8rem;
    margin-left: 6vw;
    margin-bottom: 2rem;


    .bar-chart-section {
      flex: 1; /*all the graphs will have the same width*/
      align-items: center;
      h2 {
        color: ${(props) => props.theme.textColor};
        text-align: center;

        margin-right: 6rem;
      }
    }

    .pie-chart-section {
      flex: 1;
      align-items: center;
      margin-left: 6rem;
      h2 {
        color: ${(props) => props.theme.textColor};
        text-align: center;
        margin-left: -8rem;
      }
      h1 {
        text-align: center;
        margin-bottom: 1rem;
      }
      p {
        text-align: center;
      }
      .noDataMessage {
        margin-left: 8rem;
      }
    }

    /* Mobile view */
    @media (max-width: 768px) {
      margin-top: 2em;
      margin-left: 0;
      flex-direction: column;

      .bar-chart-section {
        flex: none; /* Remove the flexible width */
        h2 {
          margin-left: 2.2rem;
          margin-right: 2rem;
        }
      }

      .pie-chart-section {
        flex: none; 

        h2 {
          margin-left: 0;
          margin-right: 5rem;
          font-size: 1.2rem;
          margin-top: 3rem;
        }
      } 
    }
`;

  export const SectionBalancesCharts = styled.section`
    h3 {
      text-align: center;
    }
    h5{
      text-align: center;
      color: grey;
      margin-bottom: 2rem;
    }
    .portfolio {
      color: black;
      width: 100%;
      .portfolio__details {
        display: flex;
        justify-content: space-between;
        margin: 1rem 0;
        div {
          display: flex;
          gap: 1rem;
          h5 {
            color: gray;
          }
        }
      }
      .portfolio__graph {
        height: 10rem;
        width: 100%;
        .recharts-default-tooltip {
          background-color: ${(props) => (props.theme.backgroundColor)} !important;
          border-color: black !important;
          color: white !important;
        }
      }
    }

    @media (max-width: 768px) {
      h5{
        margin-bottom: 2rem;
      }
    }

  `;

  export const WrapperAMonth = styled.div`
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      margin: 0 3em;

      .pie-chart-section {
          margin-top: 2.5em;
          margin-right: 2.5em;
      }
  `;

  export const SectionAMonth = styled.section`
  color: ${(props) => (props.theme.textColor)};
  background-color: ${(props) => (props.theme.backgroundColor)};
  padding: 1rem;
  margin: 1rem auto;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  width: 100%;

  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;

  .analytic {
    background: ${(props) => (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)')};
    border: 1px solid ${(props) => (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')};
    border-radius: 12px;
    padding: 1.5rem;
    flex: 1;
    min-width: 280px;
    max-width: 350px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .design {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .logo {
        font-size: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: ${(props) => (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')};
      }
    }

    .transfer {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      h6 {
        margin: 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: ${(props) => (props.theme.textColor)};
        opacity: 0.8;
      }
    }

    .money {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      h5 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: ${(props) => (props.theme.textColor)};
      }

      h6 {
        margin: 0;
        font-size: 0.75rem;
        font-weight: 500;
        color: ${(props) => (props.theme.textColor)};
        opacity: 0.7;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
    margin: 0.75rem auto;
    gap: 0.75rem;
    width: calc(100% - 1rem);

    .analytic {
      min-width: 100%;
      max-width: 100%;
      padding: 1rem;
      flex-direction: row;
      align-items: center;

      .design {
        flex-shrink: 0;

        .logo {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
        }
      }

      .transfer {
        flex: 1;
        margin-left: 1rem;

        h6 {
          font-size: 0.8rem;
        }
      }

      .money {
        flex-shrink: 0;
        text-align: right;

        h5 {
          font-size: 1.25rem;
        }

        h6 {
          font-size: 0.7rem;
        }
      }
    }
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
    width: calc(100% - 1rem);

    .analytic {
      padding: 0.75rem;

      .transfer {
        margin-left: 0.75rem;

        h6 {
          font-size: 0.75rem;
        }
      }

      .money {
        h5 {
          font-size: 1.1rem;
        }

        h6 {
          font-size: 0.65rem;
        }
      }
    }
  }
`;



  export const SectionInOut = styled.section`
    padding-bot: 2em;
    h5{
      color: grey;

    }
    h3{
      color: black;
      border-top: 0.05em solid grey;
      margin top: 0.5em;
    }

    .incomes {
        margin-top: 4rem;
        color: black;
        width: 100%;
        .incomes__details {
            display: flex;
            justify-content: space-between;
            margin: 1rem 1rem ;
            div {
                display: flex;
                gap: 1rem;
              color: grey;
            }
        }
        .incomes__graph {
            display: flex;
            justify-content: space-between;
            margin: 1rem 0;
            color: grey;
            table {
                border-collapse: collapse;
                width: 100%;
                td {
                    text-align: center;
                    padding: 0.25em;
                    justify-content: space-evenly;

                    img{
                    height: 2.5rem;
                    width: 2.5rem;
                    border-radius: 3rem;
                }

                }

            }
        }
    }
  `;

  export const PercentageOutflowsChartContainer = styled.div`
    padding-bot: 2em;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

  `;

  export const MySectionButton = styled.button`
    background-color: ${(props) => (props.theme.buttonBackgroundColor)};
    color: white;  
    padding: 0.5em 1em;
    border: 2px solid #079164;
    border-radius: 0.2em;
    boxShadow: 0px 0px 10px 3px rgba(0,0,0,0.75),
    align-items: center;
    font-size: 1em;
    cursor: pointer;

    /* For screens with a maximum width of 768px (e.g. mobile devices) */
    @media (max-width: 768px) {
      font-size: 0.8em;
    }
  `;

  export const StyledCalendar = styled(Calendar)`
      max-width: 17.5em;
      max-height: 15em;
      margin: 0 auto;
      border: 0.1em solid white;
      border-radius: 0.2em;

      background-color: ${(props) => (props.theme.backgroundColor)};
      font-family: Arial, sans-serif;

      .react-calendar__tile {
        flex: 1;
        padding: 0.25rem;
        height: 1rem; /* Modifica l'altezza delle celle qui */
        width: 1rem; /* Modifica la larghezza delle celle qui */
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.6rem; /* Modifica la dimensione del testo dei numeri dei giorni */
      }

      .react-calendar__tile--active {
        background-color: ${(props) => (props.theme.buttonBackgroundColor)};
        color: white;
      }

      .react-calendar__tile--active:enabled:hover,
      .react-calendar__tile--active:enabled:focus {
        background-color: ${(props) => (props.theme.buttonBackgroundColor)};
      }

      .react-calendar__navigation {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.1em 0;
      }
    `;

export const StyledRankingsSection = styled.div`
  background-color: ${(props) => props.theme.mode === 'light' ? props.theme.buttonBackgroundColor : props.theme.buttonBackgroundColor};
  color: ${(props) => props.theme.mode === 'light' ? 'white' : 'white'};
  border-radius: 0.5em;
  width: 25em;
  height: 5em;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0.1em;
  box-shadow: 0px 0px 10px 3px rgba(0,0,0,0.75);
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;

  h2 {
    font-size: 1em;
    margin-bottom: 0.2em;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    font-weight: 600;
  }

  p {
    font-size: 0.9em;
    margin: 0;
    text-align: center;
    font-weight: 500;
  }

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    width: 20em; 
    height: 4.5em;
    margin: 0.em;

    h2 {
      font-size: 0.9em;
    }

    p {
      font-size: 0.8em;
    }
  }
`;

export const StyledRankingPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2em;
  background-color: ${(props) => (props.theme.backgroundColor)};
  min-height: calc(100vh - 4em);
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    padding: 1em;
    min-height: calc(100vh - 2em);
  }
`;

export const StyledInfoPage = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background-color: ${(props) => props.theme.backgroundColor};

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const CenteredRankings = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

export const CenteredInfo = styled.div`
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;

  h2{
    font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
    color: ${(props) => props.theme.textColor} !important;
    font-size: clamp(1.25rem, 2.5vw, 1.5rem);
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.4;
    margin-bottom: 0.75rem;
  }

  p{
    font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
    color:${(props) => props.theme.textColor} !important;
    font-size: clamp(1rem, 2vw, 1.125rem);
    font-weight: 400;
    line-height: 1.7;
    letter-spacing: 0.01em;
    margin-bottom: 1rem;
  }

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    padding: 0 1rem;
    gap: 1.25rem;

    h2 {
      margin-bottom: 0.5rem;
    }

    p {
      margin-bottom: 0.75rem;
    }
  }
`;

// Deprecated - use StandardPageTitleGreen instead
export const RankingsTitle = styled.h1`
  text-align: center;
  color: ${(props) => (props.theme.textColor)};
  font-size: 1.5em;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.5em;
`;

// Deprecated - use StandardPageTitleGreen instead
export const InfoTitle = styled.h1`
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  text-align: center;
  color: ${({ theme }) => theme.buttonBackgroundColor};
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.2;
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
  }
`;

export const StyledSelectContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledLabel = styled.h1`
  color: ${(props) => (props.theme.textColor)};
  font-size: clamp(1rem, 2vw, 1.5rem);
  text-align: center;
  margin-bottom: 1.5em;
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  font-weight: 200;
  letter-spacing: -0.025em;

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    font-size: clamp(1.2rem, 5vw, 2rem);
    margin-bottom: 1.5em;
  }
`;

export const StyledMonth = styled.span`
  font-size: 1.2em; /* Imposta la dimensione del mese come desideri */
  color: /* Inserisci il colore desiderato */;
`;

export const StyledSelect = styled.select`
  color: white;
  background-color: transparent;
  border: 0.05em solid white;
  padding: 0.25em;
  border-radius: 0.25em;
  margin-right: 0.5em;

  option {
    background-color: ${themes.dark.backgroundColor}; /* Cambia lo sfondo dell'opzione */
    color: ${themes.dark.textColor}; /* Cambia il colore del testo dell'opzione */
  }

  option:hover {
    box-shadow: 0 0 0.5em 5em ${themes.dark.buttonBackgroundColor} inset;
  }

`;

export const StyledComingSoon = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${themes.light.backgroundColor};

  .coming-soon-title {
    font-size: 4rem;
    font-weight: bold;
    text-align: center;
  }

  .coming-soon-subtitle {
    font-size: 1.5rem;
    font-weight: normal;
    text-align: center;
  }

  @media (max-width: 768px) {
    .coming-soon-title {
      font-size: 4rem;
      font-weight: bold;
      text-align: center;
    }

    .coming-soon-subtitle {
      font-size: 1rem;
      font-weight: normal;
      text-align: center;
    }
  }
`;

// StyledLabel moderno e con bordo evidenziato SOLO per ranking
export const ModernStyledLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.7em;
  background: ${({ theme }) => theme.mode === 'dark' ? '#23272f' : '#e6f4ea'};
  border: 2px solid ${({ theme }) => theme.buttonBackgroundColor};
  border-radius: 1.2em;
  padding: 0.7em 1.3em;
  font-size: 1.1em;
  font-weight: 600;
  color: ${({ theme }) => theme.textColor};
  margin: 0.5em auto 1.2em auto;
  box-shadow: 0 2px 12px 0 ${({ theme }) => theme.buttonBackgroundColor}22;
`;

export const slideIn = keyframes`
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const slideOut = keyframes`
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
`;

export const StyledDateInput = styled.input`
  width: 10em; 
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: black;
  font-size: 16px;
`;

const CoffeeContainer = styled.div`
  display: flex;
  justify-content: center;
    align-items: center;
  margin: 2rem 0;

  /* Update Top component for mobile responsiveness */
  @media (max-width: 768px) {
    margin: 1.5rem 0;
  }
`;

const FAQContainer = styled.div`
  margin: 2rem 0;
`;

const FAQItem = styled.div`
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 12px;
  margin-bottom: 1rem;
  overflow: hidden;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)'};
  box-shadow: ${({ theme }) => theme.mode === 'dark' 
    ? '0 4px 15px rgba(0, 0, 0, 0.2)' 
    : '0 2px 10px rgba(0, 0, 0, 0.05)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.mode === 'dark' 
      ? '0 8px 25px rgba(0, 0, 0, 0.3)' 
      : '0 4px 20px rgba(0, 0, 0, 0.1)'};
  }
`;

const FAQQuestionButton = styled.button`
  width: 100%;
  padding: 1.5rem;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  font-size: clamp(1.125rem, 2.5vw, 1.25rem);
  font-weight: 600;
  color: ${({ theme }) => theme.textColor};
  line-height: 1.4;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.buttonBackgroundColor};
  }

  &:focus {
    outline: none;
    color: ${({ theme }) => theme.buttonBackgroundColor};
  }

  .icon {
    font-size: 1.5rem;
    font-weight: 300;
    transition: transform 0.3s ease;
    color: ${({ theme }) => theme.buttonBackgroundColor};

    ${({ $isOpen }) => $isOpen && `
      transform: rotate(45deg);
    `}
  }

  @media (max-width: 768px) {
    padding: 1.25rem;

    .icon {
      font-size: 1.25rem;
    }
  }
`;

const FAQAnswerContainer = styled.div`
  max-height: ${({ $isOpen }) => $isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-top: ${({ $isOpen, theme }) => $isOpen 
    ? `1px solid ${theme.mode === 'dark' ? '#374151' : '#e5e7eb'}` 
    : 'none'};
`;

const FAQAnswerContent = styled.div`
  padding: ${({ $isOpen }) => $isOpen ? '1.5rem' : '0 1.5rem'};

  @media (max-width: 768px) {
    padding: ${({ $isOpen }) => $isOpen ? '1.25rem' : '0 1.25rem'};
  }
`;

export const RankingPageSection = styled.section`
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  margin-left: 0;
  min-height: 100vh;
  background-color: ${(props) => (props.theme.backgroundColor)};
  line-height: 1.6;
`;

//****************************************************** MUI CUSTOM STYLED ******************************************************************* *//


export const MuiCustomDialog = styled(Dialog)`
  && {
    // background-color: ${(props) => (props.theme.backgroundColor)};
    // color: ${(props) => (props.theme.textColor)};
    // border: 0.2em solid ${(props) => (props.theme.buttonBackgroundColor)};
  }
`;

export const MuiFixedDimDialog = styled(Dialog)`
  && {
      width: 100%;
  }
`;

export const MuiCustomButton = styled(Button)`
  && {
    background-color: ${primaryColor};
    color: white;
    &:hover {
      background-color: ${backgroundColor}; 
    }
  }
`;

export const MuiCustomDialogTitle = styled(DialogTitle)`
  text-align: center;
  && {
    font-family: Roboto, sans-serif;
    color: ${primaryColor};
  }
`;

export const MuiCustomDialogContent = styled(DialogContent)`
  text-align: center;
  && {
    // font-family: Roboto, sans-serif;
    // color: black;
    // // background-color: ${(props) => (props.theme.backgroundColor)};
  }
`;

export const MuiCustomDialogProfileContent = styled(DialogContent)`
`;

export const MuiCustomDialogContentText = styled(DialogContentText)`
  // align-items: left !important;
  && {
    font-family: Roboto, sans-serif;
    color: black;
  }
`;

export const MuiCustomDialogActions = styled(DialogActions)`
  && {
    display: flex;
    justify-content: center; /* Center-align the buttons horizontally */
    align-items: center; /* Center-align the buttons vertically */
  }
`;

export const MuiCustomTextField = styled(TextField)`
  && {

      label.Mui-focused {
        color: ${(props) => (props.theme.buttonBackgroundColor)};
      }
      .MuiInput-underline:after {
        border-bottom-color: ${(props) => (props.theme.buttonBackgroundColor)};
      }
      .Mui-focused .MuiInput-underline:after {
        border-bottom-color: ${(props) => (props.theme.buttonBackgroundColor)};
      }
  }
  & input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px white inset;
    -webkit-text-fill-color: black;
  }
`;

export const MuiCustomIconButton = styled(IconButton)`
  && {
    color: ${props => props.theme.buttonBackgroundColor};
    margin-left: 0.5em;
  }

`;

export const MuiCustomInputAdornment = styled(InputAdornment)`
`;

export const EyeVisibility = styled(({ className }) => <FontAwesomeIcon className={className} icon={faEye} />)`

`;

export const EyeVisibilityOff = styled(({ className }) => <FontAwesomeIcon className={className} icon={faEyeSlash} />)`

`;

export const SignInButton = styled(MyButton)`
  margin-right: auto;
  margin-left: auto;
  margin-top: 1.5em;
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
`;
export { FAQContainer, FAQItem, FAQQuestionButton, FAQAnswerContainer, FAQAnswerContent };