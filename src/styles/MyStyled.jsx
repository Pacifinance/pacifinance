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
  font-family: Roboto, sans-serif;
  margin-left: 6vw;
  padding-top: 2em;
  height: 100vh;
  background-color: ${(props) => (props.theme.backgroundColor)};

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    margin-left: 0vw;
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
    color: ${(props) => (props.theme.textColor)};
    font-size: 2rem;
    font-weight: 400;
    margin-bottom: 2rem;
    margin-left: 3%;

    /* For screens with a maximum width of 768px (e.g. mobile devices) */
    @media (max-width: 768px) {
      font-size: 1.5rem;
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
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
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
  z-index: 9999;

  .dropdown-header {
    cursor: pointer;
  }

  .dropdown-menu {
    position: absolute;
    top: 80%;
    left: 2em;
    width: 10em;
    background-color: #fff;
    border: 0.1em solid #ccc;
    border-radius: 0.2em;
    padding: 0.4em;
    box-shadow: 0em 0.1em 0.2em rgba(0, 0, 0, 0.1);
    z-index: 9999;

  }

  .dropdown-option {
    padding: 0.3em;
    cursor: pointer;
  }

  .dropdown-option:hover {
    background-color: #f5f5f5;
  }

  .dropdown-option.selected {
    background-color: #007bff;
    color: #fff;
  }

  .dropdown-option.logout {
    margin-top: 0.4em;
    color: #dc3545;
  }

  @media (min-width: 768px) {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;

    .dropdown-menu {
      top: 100%;
      margin-right: 0vw;
      background-color: #fff;
      border: 0.1em solid #ccc;
      border-radius: 0.2em;
      padding: 0.4em;
      box-shadow: 0em 0.1em 0.2em rgba(0, 0, 0, 0.1);
    }

  }

`;

export const Notification = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -1em;
  gap: 0.2rem;
  .font_icon{
      font-size: 1.5rem;
  }

  svg{
      color: ${(props) => (props.theme.textColor)};
  }

  .image {
      display: flex;
      justify-content: center;
      gap: 1rem;
      img{
          height: 2.5rem;
          width: 2.5rem;
          border-radius: 3rem;
      }
  }

  .account-image {
      height: 2rem;
      width: 2rem;
      border-radius: 3rem;
      background-color: white; /* Imposta il colore di sfondo dell'immagine */
      cursor: pointer;

  }

  .popup-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
  }

  .popup-window {
      width: 20em;
      padding: 1em;
      margin-left: 1em;
      background-color: white;
      border: 0.1em solid orange;
      border-radius: 0.5em;
      box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.5);
  }

  .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.8);
  }

  @media (max-width: 768px) {
    position: absolute;
    top: 1.3em;
    right: 4.2em;
    gap: 0.1rem;

    .account-image {
        height: 1.2rem;
        width: 1.2rem;
        background-color: white; /* Imposta il colore di sfondo dell'immagine */
        margin-top: 0.7em;
        margin-left: 2em;
    }

    .bell-icon {
        font-size: 1.5rem; /* Imposta la grandezza desiderata */
    }

    .popup-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 50%;
      height: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .popup-window {
      width: 10em;
      padding: 0.5em;
      background-color: white;
      border: 0.1em solid orange;
      border-radius: 0.5em;
      box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.5);
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 50%;
      height: 50%;
      background-color: rgba(255, 255, 255, 0.8);
    }
  }
`;

export const Top = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: row;
    gap: 0.01rem;
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
  font-family: Roboto, sans-serif;
  // overflow: auto;
  position: fixed;
  left: 0;
  background-color: ${(props) => (props.theme.backgroundColor)};
  height: 100vh;
  width: 6vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 0;
  gap: 2rem;

  /* Style for mobile */
  @media (max-width: 768px) {
    position: sticky;
    // bottom: 0; 
    margin-right: 2em;
    width: 100%;
    height: 8vh;
    flex-direction: row;
    padding: 1em 1.5em; 
    gap: 1em;
    justify-content: space-between;

    .active {
        margin-right: 1em; /* Personalizza il margine inferiore per aumentare lo spazio tra le icone nei tooltip */
    }
  }  
  `
  ;

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
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-left: 6vw;
    margin-bottom: 1em;

    .analytic {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 0.5rem 1rem;
      border-radius: 1rem;
      margin-right: 1rem;
      color: black;
      background-color: white;
      transition: 0.5s ease-in-out;
      height: 7.5em;
      width: 7.5em;
      border: 0.15em solid ${(props) => props.theme.buttonBackgroundColor};
      overflow: hidden; /* Impedisce al contenuto di strabordare */

      .design {
        display: flex;
        justify-content: center;
        align-items: center;

        .logo {
          display: flex;
          justify-content: center;
          align-items: center;

          svg {
            font-size: 1.5rem;
          }
        }
      }
      .transfer {
          font-size: 0.8em;
      }
      .transfer, .money {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: ${secondaryColor};
      }
    }

    @media (max-width: 768px) {
      justify-content: center; /* Centra gli elementi .analytic orizzontalmente */
      flex-wrap: wrap; /* Permette agli elementi .analytic di andare a capo */
      .analytic {
        height: 8em;
        margin: 0.5em; /* Aggiunge spazio intorno per evitare che gli elementi si tocchino */
        padding: 0.5rem 1rem;
        width: 45%; /* Imposta la larghezza per far stare due elementi per riga */
        max-width: 20em; /* Opzionale: limita la larghezza massima per evitare che gli elementi diventino troppo grandi */

        .design .logo svg {
          font-size: 1.2rem;
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
    h2{
      color: ${(props) => props.theme.textColor} !important;
    }

    p{
      color: ${(props) => props.theme.textColor} !important;
      margin: 0.5rem 0;
      font-size: 1.1rem;
    }
    ol {
      list-style: none;
      padding-left: 0;
    }
    li {
      color: #ffffff;
      margin: 0.5rem 0;
      font-size: 1.1rem;
    }
  `;

export const StyledRankingPage = styled.div`
  // text-align: center;
  height: 100%;
  padding: 3.8rem;
  background-color: ${(props) => props.theme.rankingInfoBackgroundColor};
`;

export const StyledInfoPage = styled.div`
  // text-align: center;
  height: 100%;
  padding: 3.8rem;
  background-color: ${(props) => props.theme.rankingInfoBackgroundColor}; 
`;

export const CenteredRankings = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

export const CenteredInfo = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-left: 25em;
  margin-right: 25em;

  h2{
    color: ${(props) => props.theme.textColor} !important;
  }

  p{
    color: ${(props) => props.theme.textColor} !important;
  }

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    margin-left: 10em;
    margin-right: 10em;
  }
`;

export const RankingsTitle = styled.h1`
  text-align: center;
  color: ${themes.dark.buttonBackgroundColor};
  font-size: 1.2em;
  font-weight: bold;
  margin-top: 1.5em;
  margin-bottom: 1.5em;
`;

export const InfoTitle = styled.h1`
  text-align: center;
  color: ${themes.dark.buttonBackgroundColor};
  font-size: 1.6em;
  font-weight: bold;
  margin-top: 2em;
  margin-bottom: 0.8em;
`;

export const StyledSelectContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledLabel = styled.label`
  text-align: left;
  font-size: 1em;
  color: ${(props) => (props.theme.textColor)};
  margin-right: 0.5em;
  display: inline-block; 
  vertical-align: middle; /* Facoltativo: per allineare verticalmente */

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    text-align: center;
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
  align-items: center; /* centra gli elementi orizzontalmente */
  min-height: 100vh;
  background-color: ${themes.light.backgroundColor};

  .coming-soon-title {
    font-size: 4rem;
    font-weight: bold;
    text-align: center; /* centra il testo orizzontalmente */
  }

  .coming-soon-subtitle {
    font-size: 1.5rem;
    font-weight: normal;
    text-align: center; /* centra il testo orizzontalmente */
  }

  @media (max-width: 768px) {
    .coming-soon-title {
      font-size: 4rem;
      font-weight: bold;
      text-align: center; /* centra il testo orizzontalmente */
    }

    .coming-soon-subtitle {
      font-size: 1rem;
      font-weight: normal;
      text-align: center; /* centra il testo orizzontalmente */
    }
  }
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