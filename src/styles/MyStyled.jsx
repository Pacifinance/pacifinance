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

export const SectionDashboard = styled.section `
  // font-family: Roboto, sans-serif;
  // margin-left: 6vw;
  // padding-top: 2em;
  // height: 100%;
  background-color: ${(props) => (props.theme.backgroundColor)};

  // /* For screens with a maximum width of 768px (e.g. mobile devices) */
  // @media (max-width: 768px) {
  //   margin-left: 0vw;
  //   height: 300vh;
  // }
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

  export const SignUpButton = styled(MyButton)`
    margin-right: auto;
    margin-left: auto;
    margin-top: 1.5em;
  `;

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
  height: 100%;
  background-color: ${(props) => (props.theme.backgroundColor)};
  overflow-x: hidden; // to hide the scroll bar
  overflow-y: hidden; // to hide the scroll bar
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
    margin-left: 3%;
    margin-bottom: 1rem;

    /* For screens with a maximum width of 768px (e.g. mobile devices) */
    @media (max-width: 768px) {
      font-size: 1rem;
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
    max-width: 100vw;
  }`

export const Feature = styled.div`
  display: flex;