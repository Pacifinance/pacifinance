import React, {useState, useContext} from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleModeButton from '../components/ToggleModeButton';
import { IconButton, InputAdornment, TextField } from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import { ThemeContext } from './ThemeContext';

export const useTheme = () => {
  const { theme } = useContext(ThemeContext);
  const { mode } = theme;
  const [isOpenSignIn, setIsOpenSignIn] = useState(false);
  const [isOpenSignUp, setIsOpenSignUp] = useState(false);
  return { theme, mode, isOpenSignIn, setIsOpenSignIn, isOpenSignUp, setIsOpenSignUp };
};



export const MuiCustomDialog = styled(Dialog)`
  && {
    // background-color: ${(props) => props.theme.backgroundColor};
    // color: ${(props) => props.theme.textColor};
    // border: 4px solid ${(props) => props.theme.buttonBackgroundColor};
  }
`;

export const MuiCustomButton = styled(Button)`
  && {
    background-color: ${(props) => props.theme.buttonBackgroundColor};
    color: ${(props) => props.theme.textColor};
    hover: ${(props) => props.theme.BackgroundColor};
  }
`;

export const MuiCustomDialogTitle = styled(DialogTitle)`
  && {
    font-family: Roboto, sans-serif;
    color: ${(props) => props.theme.buttonBackgroundColor};
  }
`;

export const MuiCustomDialogContent = styled(DialogContent)`
  && {
    // font-family: Roboto, sans-serif;
    // color: ${(props) => props.theme.textColor};
    // // background-color: ${(props) => props.theme.backgroundColor};
  }
`;

export const MuiCustomDialogContentText = styled(DialogContentText)`
  && {
    font-family: Roboto, sans-serif;
    color: ${(props) => props.theme.textColor};
  }
`;

export const MuiCustomDialogActions = styled(DialogActions)`
  && {
    // font-family: Roboto, sans-serif;
    // color: ${(props) => props.theme.textColor};
    // background-color: ${(props) => props.theme.backgroundColor};
  }
`;

export const MuiCustomTextField = styled(TextField)`
    && {
        label.Mui-focused {
          color: white;
        }
        .MuiInput-underline:after {
          border-bottom-color: ${(props) => props.theme.buttonBackgroundColor};
        }
        .Mui-focused .MuiInput-underline:after {
          border-bottom-color: blue;
        }
    }
  `;

export const MuiCustomIconButton = styled(IconButton)`
`;

export const MuiCustomInputAdornment = styled(InputAdornment)`
`;

export const MuiCustomVisibility = styled(Visibility)`
`;

export const MuiCustomVisibilityOff = styled(VisibilityOff)`
`;

export const MuiCustomGrid = styled(Grid)`
`;

export const MuiUseStyles = makeStyles((theme) => ({
  root: {
    width: '50%',
  },
  icon: {
    color: 'white',
  },
}));

export const Section = styled.section `
      font-family: Roboto, sans-serif; 
      margin-left: 6vw;
      padding: 2rem;
      height: 100vh;
      background-color: ${(props) => props.theme.backgroundColor};
      .grid{ 
          margin-top: 2rem;
          z-index: 2;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
      
      }
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
  border-radius: 4px;
  border: 4px solid ${(props) => props.theme.jollyColor};
`;

export const MyGenericModalContent = styled.div`
  background-color: ${(props) => props.theme.backgroundColor};
  margin: auto;
  max-width: 80%;
  max-height: 80%;
  padding: 20px;
  overflow: auto;
`;

export const MyButton = styled.button`
  background-color: ${(props) => props.theme.buttonBackgroundColor};
  color: white;  
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  // border-color: ${(props) => props.mode === 'dark' ? '#fff' : '#000'};
  // border-shadow: 0px 0px 10px 0px rgba(0,0,0,0.75);
  align-items: center;
  font-size: 16px;
  cursor: pointer;
`;

export const MyCloseButton = styled.span`
  background-color: ${(props) => props.theme.buttonBackgroundColor};
  color: white;
  border: none;
  border-radius: 4px;
  width: 20px; 
  height: 20px; 
  text-align: center;
  display: inline-block;
  line-height: 20px;
  &:hover {
    color: #000;
  }
  cursor: pointer;
`;

export const TitleDashboard = styled.h1 `
      color: ${(props) => props.theme.textColor};
      font-size: 2rem;
      font-weight: 400;
      margin-bottom: 2rem;
      margin-left: 2rem;
  `;

export const SignIn = styled.div`
  font-family: Roboto, sans-serif;
  
  .sign-in-page {
    background-color: ${(props) => props.theme.backgroundColor};
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
    color: ${(props) => props.theme.textColor};
    margin-bottom: 20px;
  }

  .icon-with-text {
    display: flex;
    color: ${(props) => props.theme.buttonBackgroundColor};
    align-items: center; /* Allinea verticalmente gli elementi */
    margin-bottom: 50px;
  }
  
  .icon-with-text h4 {
    color: ${(props) => props.theme.buttonBackgroundColor};
    margin-left: 10px; /* Aggiungi uno spazio tra l'icona e il testo */
  }

  .sign-in-form label {
    color: ${(props) => props.theme.textColor};
    margin-bottom: 8px;
  }

  .sign-in-form input {
    padding: 8px;
    border: none;
    background-color: transparent;
    color: ${(props) => props.theme.textColor};
    margin-bottom: 16px;
  }

  .sign-in-form input::placeholder {
    color: ${(props) => props.theme.textColor};
  }

  .button-wrapper {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    margin-top: 20px;
  }
`;

export const SignInButton = styled(MyButton)`
  margin-right: 40%;
`;

export const ContainerHeader = styled.header`
  background-color: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.textColor};
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Logo = styled.h1`
  font-size: 0px;
  img {
    width: 90px;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

export const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const ModalSignIn = styled(MyGenericModal)`
  display: ${(props) => props.isOpenSignIn ? 'flex' : 'none'};
`;

export const ModalSignUp = styled(MyGenericModal)`
  display: ${(props) => props.isOpenSignUp ? 'flex' : 'none'};
`;

export const ContainerFooter = styled.footer`
  background-color: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.textColor};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
`;

export const FooterText = styled.p`
  font-size: 14px;
`;

export const SignUp = styled.div`
      font-family: Roboto, sans-serif;
      
      .signUp-page {
          background-color: ${(props) => props.theme.backgroundColor};
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
          color: ${(props) => props.theme.textColor};
          margin-bottom: 20px;
      }

      .icon-with-text {
          display: flex;
          color: ${(props) => props.theme.buttonBackgroundColor};
          align-items: center; /* Allinea verticalmente gli elementi */
          margin-bottom: 50px;
        }
        
      .icon-with-text h4 {
          color: ${(props) => props.theme.buttonBackgroundColor};
          margin-left: 10px; /* Aggiungi uno spazio tra l'icona e il testo */
      }

      .input-wrapper {
          position: relative;
      }
        
  
      .signUp-form label {
          color: ${(props) => props.theme.textColor};
          margin-bottom: 8px;
      }
  
      .signUp-form input {
          padding: 8px;
          border: none;
          background-color: transparent;
          color: ${(props) => props.theme.textColor};
          margin-bottom: 16px;
      }
  
      .signUp-form input::placeholder {
          color: ${(props) => props.theme.textColor};
      }
  
      // .signUp-form button {
      //     // padding: 8px 16px;
      //     background-color: ${(props) => props.theme.buttonBackgroundColor}};
      //     color: ${(props) => props.theme.textColor};
      //     // border: none;
      //     cursor: pointer;
      // }

      .button-wrapper {
          display: flex;
          justify-content: flex-end;
          width: 100%;
          margin-top: 20px;
        }

      
      
  `;

  export const SignUpButton = styled(MyButton)`
          margin-right: 40%;
  <`;

  export const ModifiedTitleDashboard = styled(TitleDashboard)`
  font-size: 2rem;
  font-weight: bold;
  text-align: left; 
  margin-top: 70px; 
  margin-left: 6vw;
`;

export const MySecondaryButton = styled(MyButton)`
  font-size: 1.2rem;
`;

export const SecondaryTitle = styled.h2 `
      font-size: 1rem;
      color: ${(props) => props.theme.textColor};
      margin-left: 2rem;
`;

export const TitleLastAdds = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${(props) => props.theme.textColor};
  margin-top: 20px;
  margin-bottom: 20px;
  margin-left: 6vw;
`;

export const TitleSection = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${(props) => props.theme.textColor};
  margin-top: 40px;
  margin-bottom: 20px;
  margin-left: 6vw;
`;

export const StyledSection = styled.div`
  font-family: Roboto, sans-serif; 
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  background-color: ${(props) => props.theme.backgroundColor};
  .grid{ 
    margin-top: 2rem;
    z-index: 2;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;

}`;

export const StyledInputs = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 100%;
  height: 100%;
  margin-top: 40px;
  margin-bottom: 20px;
  margin-left: 6vw;
  color: ${(props) => props.theme.textColor};

  label {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-weight: bold;
    font-size: 1.2rem;
    margin-right: 20px;
    margin-left: 20px;
  }

  input {
    margin-top: 10px;
    font-size: 1.2rem;
    padding: 5px;
  }

  button {
    margin-top: 10px;
    font-size: 1.2rem;
    padding: 5px;
  }
`;

export const StyledTable = styled.table`
  border-collapse: collapse;
  width: 50%;
  background-color: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.textColor};
  margin-bottom: 20px;
  margin-left: 6vw;

  td, th {
    border: 1px solid black;
    padding: 5px;
    text-align: center;
    background-color: ${(props) => props.theme.backgroundColor};
  }

  th {
    background-color: ${(props) => props.theme.backgroundColor};
  }
`;

export const StyledAddSection = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 100%;
  margin-bottom: 20px;
  margin-top: 40px;
  margin-left: 6vw;
  color: ${(props) => props.theme.textColor};

  label {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-weight: bold;
    font-size: 1.2rem;
    margin-right: 20px;
  }

  input {
    margin-top: 10px;
    font-size: 1.2rem;
    padding: 5px;
  }

  button {
    margin-top: 10px;
    font-size: 1.2rem;
    padding: 5px;
  }
`;

export const StyledLastAdds = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${(props) => props.theme.textColor};
  margin-bottom: 20px;
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
    margin-bottom: 10px;
  }

  button {
    font-size: 1.2rem;
    padding: 5px;
    background-color: ${(props) => props.theme.backgroundColor};
  }
`;

export const Container = styled.div`
  font-family: Roboto, sans-serif;
  height: 100%; 
  background-color: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.textColor};
  padding-bottom: 105px;
`;
export const Title = styled.h1`
  font-size: 60px;
  margin-bottom: 5px; /* Aggiungi qui il valore di spaziatura desiderato */
  text-align: center;

`;

export const Subtitle = styled.h2`
  font-size: 14px;
  margin-bottom: 5px;
  text-align: center;
  color: ${(props) => props.theme.buttonBackgroundColor};
`;

export const PaciText = styled.span`
  color: ${(props) => props.theme.buttonBackgroundColor};
`;

export const FinanceText = styled.span`
  color: ${(props) => props.theme.textColor};
`;

export const CentralSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: 5%;
  // margin-top: 2%;
  margin-bottom: 0.5%;
  // padding: 60px;
`;

export const CentralText = styled.div`
  max-width: 800px;
  // text-align: center;
  p {
    margin-bottom: 20px; 
  }
  h1 {
    margin-bottom: 20px;
  }
`;

export const CentralImage = styled.img`
  max-width: 600px;
  height: auto;
  margin-right: 3%;
`;

export const FeaturesSection = styled.section`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  bottom: 0;
  gap: 60px;
  // padding: 60px;
  max-width: 1400px; /* Aggiungi una larghezza massima desiderata */
  margin: 0 auto; /* Centra orizzontalmente il contenitore */
`;

export const Feature = styled.div`
  display: flex;
  align-items: center;
`;

export const FeatureIcon = styled.div`
  background-color: ${(props) => props.theme.iconBackgroundColor};
  color: white;
  padding: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

export const FeatureText = styled.div`
  margin-left: 20px;
`;

export const Icon = styled.div`
  /* Aggiungi qui l'icona desiderata */
  color: ${(props) => props.theme.jollyColor};
  text-color: ${(props) => props.theme.jollyColor};
`;

export const SidebarToggleModeButton = styled(ToggleModeButton)`
      padding: 6px 10px;
      font-size: 16px;
      gap: 2px;
`;

export const SidebarSection = styled.section`
    font-family: Roboto, sans-serif;
    position: fixed;
    left: 0;
    background-color: ${(props) => props.theme.backgroundColor};
    height: 100vh;
    width: 6vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 2rem 0;
    gap: 2rem;
    .top{
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
        .links {
        
            ul {
            
                margin-bottom: 0.5rem;

                .active {
                    border-right: 0.2rem solid black;
                }
                
                .active a {
                    color: ${(props) => props.theme.buttonBackgroundColor};
                }
                
                .active svg {
                    color: ${(props) => props.theme.buttonBackgroundColor};
                }
                  
                
                li{
                    display: flex;
                    justify-content: center;
                    border-right: 0.2rem solid transparent;
                    margin: 1rem 0;
                    list-style-type: none;
                    a {   
                        text-decoration: none;
                        color: ${(props) => props.theme.textColor};
                        font-size: 1.6rem;
                        gap: 0 0.4rem;;
                    }
                    .noti{
                        display: flex;
                        margin-left: 21px;
                        span {
                            background-color: red;
                            font-size: 0.5rem;
                            border-radius: 50%;
                            padding: 2px 5px 2px 5px;
                            color: ${(props) => props.theme.textColor};
                            margin-bottom: 19px;
                            margin-top: -10px;
                        }
                    }
                    transition: 0.3s ease-in-out;
                    &:hover{
                        a {
                            color: ${(props) => props.theme.buttonBackgroundColor};
                        }
                    }
                
                }
            
            }
        }
    }
    .toggle-button {
        margin-left: 2rem; /* Distanza dal bordo sinistro */
        font-size: 1rem; /* Dimensioni del pulsante */
    }

    .notification{
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-left: 0.5rem;
        /*padding: 0.5rem 1rem;*/
        .font_icon{
            font-size: 1.5rem;
        }

        svg{
            color: ${(props) => props.theme.textColor};
        }

        .image {
            display: flex;
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
        }

        .bell-icon {
            font-size: 2rem; /* Imposta la grandezza desiderata */
        }

        
        .dropdown-container {
            position: relative;
        }
        
        .dropdown-header {
            cursor: pointer;
        }
        
        .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            width: 200px;
            background-color: #fff;
            border: 2px solid #ccc;
            border-radius: 4px;
            padding: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .dropdown-option {
            padding: 6px;
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
            margin-top: 8px;
            color: #dc3545;
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
            width: 400px;
            padding: 20px;
            background-color: white;
            border: 2px solid orange;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        }
        
        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.8);
        }
    }

    `
    ;

// const MyStyled = () => {
//   
//   const [isOpenSignIn, setIsOpenSignIn] = useState(false);
//   const [isOpenSignUp, setIsOpenSignUp] = useState(false);


//   const MuiCustomDialog = styled(Dialog)`
//     && {
//       // background-color: ${theme.backgroundColor};
//       // color: ${theme.textColor};
//       // border: 4px solid ${theme.buttonBackgroundColor};
//     }
//   `;

//   const MuiCustomButton = styled(Button)`
//     && {
//       background-color: ${theme.buttonBackgroundColor};
//       color: ${theme.textColor};
//       hover: ${theme.BackgroundColor};
//     }
//   `;

//   const MuiCustomDialogTitle = styled(DialogTitle)`
//     && {
//       font-family: Roboto, sans-serif;
//       color: ${theme.buttonBackgroundColor};
//     }
//   `;

//   const MuiCustomDialogContent = styled(DialogContent)`
//     && {
//       // font-family: Roboto, sans-serif;
//       // color: ${theme.textColor};
//       // // background-color: ${theme.backgroundColor};
//     }
//   `;

//   const MuiCustomDialogContentText = styled(DialogContentText)`
//     && {
//       font-family: Roboto, sans-serif;
//       color: ${theme.textColor};
//     }
//   `;

//   const MuiCustomDialogActions = styled(DialogActions)`
//     && {
//       // font-family: Roboto, sans-serif;
//       // color: ${theme.textColor};
//       // background-color: ${theme.backgroundColor};
//     }
//   `;

//   const MuiCustomTextField = styled(TextField)`
//       && {
//           label.Mui-focused {
//             color: white;
//           }
//           .MuiInput-underline:after {
//             border-bottom-color: ${theme.buttonBackgroundColor};
//           }
//           .Mui-focused .MuiInput-underline:after {
//             border-bottom-color: blue;
//           }
//       }
//     `;

//   const MuiCustomIconButton = styled(IconButton)`
//   `;

//   const MuiCustomInputAdornment = styled(InputAdornment)`
//   `;

//   const MuiCustomVisibility = styled(Visibility)`
//   `;

//   const MuiCustomVisibilityOff = styled(VisibilityOff)`
//   `;

//   const MuiCustomGrid = styled(Grid)`
//   `;

//   const MuiUseStyles = makeStyles((theme) => ({
//     root: {
//       width: '50%',
//     },
//     icon: {
//       color: 'white',
//     },
//   }));

//   const Section = styled.section `
//         font-family: Roboto, sans-serif; 
//         margin-left: 6vw;
//         padding: 2rem;
//         height: 100vh;
//         background-color: ${theme.backgroundColor};
//         .grid{ 
//             margin-top: 2rem;
//             z-index: 2;
//             width: 100%;
//             display: flex;
//             flex-direction: column;
//             gap: 1rem;
        
//         }
//   `;

//   const MyGenericModal = styled.div`
//     align-items: center;
//     justify-content: center;
//     pointer-events: 'none';
//     position: fixed;
//     z-index: 1;
//     left: 0;
//     top: 0;
//     width: 100%;
//     height: 100%;
//     overflow: auto;
//     background-color: rgba(0, 0, 0, 0.5);
//     border-radius: 4px;
//     border: 4px solid ${theme.jollyColor};
//   `;

//   const MyGenericModalContent = styled.div`
//     background-color: ${theme.backgroundColor};
//     margin: auto;
//     max-width: 80%;
//     max-height: 80%;
//     padding: 20px;
//     overflow: auto;
//   `;

//   const MyButton = styled.button`
//     background-color: ${theme.buttonBackgroundColor};
//     color: white;  
//     padding: 10px 20px;
//     border: none;
//     border-radius: 4px;
//     // border-color: ${mode === 'dark' ? '#fff' : '#000'};
//     // border-shadow: 0px 0px 10px 0px rgba(0,0,0,0.75);
//     align-items: center;
//     font-size: 16px;
//     cursor: pointer;
//   `;

//   const MyCloseButton = styled.span`
//     background-color: ${theme.buttonBackgroundColor};
//     color: white;
//     border: none;
//     border-radius: 4px;
//     width: 20px; 
//     height: 20px; 
//     text-align: center;
//     display: inline-block;
//     line-height: 20px;
//     &:hover {
//       color: #000;
//     }
//     cursor: pointer;
//   `;

//   const TitleDashboard = styled.h1 `
//         color: ${theme.textColor};
//         font-size: 2rem;
//         font-weight: 400;
//         margin-bottom: 2rem;
//         margin-left: 2rem;
//     `;

//   const SignIn = styled.div`
//     font-family: Roboto, sans-serif;
    
//     .sign-in-page {
//       background-color: ${theme.backgroundColor};
//       height: 50vh;
//       display: flex;
//       justify-content: center;
//       align-items: center;
//     }
  
//     .sign-in-form {
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//     }
  
//     .sign-in-form h1 {
//       color: ${theme.textColor};
//       margin-bottom: 20px;
//     }

//     .icon-with-text {
//       display: flex;
//       color: ${theme.buttonBackgroundColor};
//       align-items: center; /* Allinea verticalmente gli elementi */
//       margin-bottom: 50px;
//     }
    
//     .icon-with-text h4 {
//       color: ${theme.buttonBackgroundColor};
//       margin-left: 10px; /* Aggiungi uno spazio tra l'icona e il testo */
//     }
  
//     .sign-in-form label {
//       color: ${theme.textColor};
//       margin-bottom: 8px;
//     }
  
//     .sign-in-form input {
//       padding: 8px;
//       border: none;
//       background-color: transparent;
//       color: ${theme.textColor};
//       margin-bottom: 16px;
//     }
  
//     .sign-in-form input::placeholder {
//       color: ${theme.textColor};
//     }

//     .button-wrapper {
//       display: flex;
//       justify-content: flex-end;
//       width: 100%;
//       margin-top: 20px;
//     }
//   `;

//   const SignInButton = styled(MyButton)`
//     margin-right: 40%;
//   `;

//   const ContainerHeader = styled.header`
//     background-color: ${theme.backgroundColor};
//     color: ${theme.textColor};
//     padding: 20px;
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//   `;

//   const Logo = styled.h1`
//     font-size: 0px;
//     img {
//       width: 90px;
//     }
//   `;

//   const ButtonGroup = styled.div`
//     display: flex;
//     gap: 10px;
//   `;

//   const ButtonContainer = styled.div`
//     display: flex;
//     align-items: center;
//     gap: 10px;
//   `;

//   const ModalSignIn = styled(MyGenericModal)`
//     display: ${isOpenSignIn ? 'flex' : 'none'};
//   `;

//   const ModalSignUp = styled(MyGenericModal)`
//     display: ${isOpenSignUp ? 'flex' : 'none'};
//   `;

//   const ContainerFooter = styled.footer`
//     background-color: ${theme.backgroundColor};
//     color: ${theme.textColor};
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     padding: 20px;
//     position: fixed;
//     bottom: 0;
//     left: 0;
//     width: 100%;
//   `;
  
//   const FooterText = styled.p`
//     font-size: 14px;
//   `;

//   const SignUp = styled.div`
//         font-family: Roboto, sans-serif;
        
//         .signUp-page {
//             background-color: ${theme.backgroundColor};
//             height: 50vh;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//         }
    
//         .signUp-form {
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//         }

//         .signUp-form h1 {
//             color: ${theme.textColor};
//             margin-bottom: 20px;
//         }

//         .icon-with-text {
//             display: flex;
//             color: ${theme.buttonBackgroundColor};
//             align-items: center; /* Allinea verticalmente gli elementi */
//             margin-bottom: 50px;
//           }
          
//         .icon-with-text h4 {
//             color: ${theme.buttonBackgroundColor};
//             margin-left: 10px; /* Aggiungi uno spazio tra l'icona e il testo */
//         }

//         .input-wrapper {
//             position: relative;
//         }
          
    
//         .signUp-form label {
//             color: ${theme.textColor};
//             margin-bottom: 8px;
//         }
    
//         .signUp-form input {
//             padding: 8px;
//             border: none;
//             background-color: transparent;
//             color: ${theme.textColor};
//             margin-bottom: 16px;
//         }
    
//         .signUp-form input::placeholder {
//             color: ${theme.textColor};
//         }
    
//         // .signUp-form button {
//         //     // padding: 8px 16px;
//         //     background-color: ${theme.buttonBackgroundColor}};
//         //     color: ${theme.textColor};
//         //     // border: none;
//         //     cursor: pointer;
//         // }

//         .button-wrapper {
//             display: flex;
//             justify-content: flex-end;
//             width: 100%;
//             margin-top: 20px;
//           }

        
        
//     `;

//     const SignUpButton = styled(MyButton)`
//             margin-right: 40%;
//     <`;

//     const ModifiedTitleDashboard = styled(TitleDashboard)`
//     font-size: 2rem;
//     font-weight: bold;
//     text-align: left; 
//     margin-top: 70px; 
//     margin-left: 6vw;
//   `;

//   const MySecondaryButton = styled(MyButton)`
//     font-size: 1.2rem;
//   `;

//   const SecondaryTitle = styled.h2 `
//         font-size: 1rem;
//         color: ${theme.textColor};
//         margin-left: 2rem;
//   `;

//   const TitleLastAdds = styled.h2`
//     font-size: 1.5rem;
//     font-weight: bold;
//     color: ${theme.textColor};
//     margin-top: 20px;
//     margin-bottom: 20px;
//     margin-left: 6vw;
//   `;

//   const TitleSection = styled.h2`
//     font-size: 1.5rem;
//     font-weight: bold;
//     color: ${theme.textColor};
//     margin-top: 40px;
//     margin-bottom: 20px;
//     margin-left: 6vw;
//   `;

//   const StyledSection = styled.div`
//     font-family: Roboto, sans-serif; 
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     width: 100%;
//     background-color: ${theme.backgroundColor};
//     .grid{ 
//       margin-top: 2rem;
//       z-index: 2;
//       width: 100%;
//       display: flex;
//       flex-direction: column;
//       gap: 1rem;
  
//   }`;

//   const StyledInputs = styled.div`
//     display: flex;
//     justify-content: space-evenly;
//     width: 100%;
//     height: 100%;
//     margin-top: 40px;
//     margin-bottom: 20px;
//     margin-left: 6vw;
//     color: ${theme.textColor};

//     label {
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       font-weight: bold;
//       font-size: 1.2rem;
//       margin-right: 20px;
//       margin-left: 20px;
//     }

//     input {
//       margin-top: 10px;
//       font-size: 1.2rem;
//       padding: 5px;
//     }

//     button {
//       margin-top: 10px;
//       font-size: 1.2rem;
//       padding: 5px;
//     }
//   `;

//   const StyledTable = styled.table`
//     border-collapse: collapse;
//     width: 50%;
//     background-color: ${theme.backgroundColor};
//     color: ${theme.textColor};
//     margin-bottom: 20px;
//     margin-left: 6vw;

//     td, th {
//       border: 1px solid black;
//       padding: 5px;
//       text-align: center;
//       background-color: ${theme.backgroundColor};
//     }

//     th {
//       background-color: ${theme.backgroundColor};
//     }
//   `;

//   const StyledAddSection = styled.div`
//     display: flex;
//     justify-content: space-evenly;
//     width: 100%;
//     margin-bottom: 20px;
//     margin-top: 40px;
//     margin-left: 6vw;
//     color: ${theme.textColor};

//     label {
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       font-weight: bold;
//       font-size: 1.2rem;
//       margin-right: 20px;
//     }

//     input {
//       margin-top: 10px;
//       font-size: 1.2rem;
//       padding: 5px;
//     }

//     button {
//       margin-top: 10px;
//       font-size: 1.2rem;
//       padding: 5px;
//     }
//   `;

//   const StyledLastAdds = styled.div`
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     color: ${theme.textColor};
//     margin-bottom: 20px;
//     margin-left: 6vw;
//     width: 100%;

//     ul {
//       list-style: none;
//       padding: 0;
//       margin: 0;
//       width: 100%;
//     }

//     li {
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       width: 100%;
//       margin-bottom: 10px;
//     }

//     button {
//       font-size: 1.2rem;
//       padding: 5px;
//       background-color: ${theme.backgroundColor};
//     }
//   `;

//   const Container = styled.div`
//     font-family: Roboto, sans-serif;
//     height: 100%; 
//     background-color: ${theme.backgroundColor};
//     color: ${theme.textColor};
//     padding-bottom: 105px;
//   `;
//   const Title = styled.h1`
//     font-size: 60px;
//     margin-bottom: 5px; /* Aggiungi qui il valore di spaziatura desiderato */
//     text-align: center;

//   `;

//   const Subtitle = styled.h2`
//     font-size: 14px;
//     margin-bottom: 5px;
//     text-align: center;
//     color: ${theme.buttonBackgroundColor};
//   `;

//   const PaciText = styled.span`
//     color: ${theme.buttonBackgroundColor};
//   `;

//   const FinanceText = styled.span`
//     color: ${theme.textColor};
//   `;

//   const CentralSection = styled.section`
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     margin-left: 5%;
//     // margin-top: 2%;
//     margin-bottom: 0.5%;
//     // padding: 60px;
//   `;

//   const CentralText = styled.div`
//     max-width: 800px;
//     // text-align: center;
//     p {
//       margin-bottom: 20px; 
//     }
//     h1 {
//       margin-bottom: 20px;
//     }
//   `;

//   const CentralImage = styled.img`
//     max-width: 600px;
//     height: auto;
//     margin-right: 3%;
//   `;

//   const FeaturesSection = styled.section`
//     display: grid;
//     grid-template-columns: repeat(3, 1fr);
//     align-items: center;
//     bottom: 0;
//     gap: 60px;
//     // padding: 60px;
//     max-width: 1400px; /* Aggiungi una larghezza massima desiderata */
//     margin: 0 auto; /* Centra orizzontalmente il contenitore */
//   `;

//   const Feature = styled.div`
//     display: flex;
//     align-items: center;
//   `;

//   const FeatureIcon = styled.div`
//     background-color: ${theme.iconBackgroundColor};
//     color: white;
//     padding: 20px;
//     border-radius: 50%;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     font-size: 24px;
//   `;

//   const FeatureText = styled.div`
//     margin-left: 20px;
//   `;

//   const Icon = styled.div`
//     /* Aggiungi qui l'icona desiderata */
//     color: ${theme.jollyColor};
//     text-color: ${theme.jollyColor};
//   `;

//   const SidebarToggleModeButton = styled(ToggleModeButton)`
//         padding: 6px 10px;
//         font-size: 16px;
//         gap: 2px;
//   `;

//   const SidebarSection = styled.section`
//       font-family: Roboto, sans-serif;
//       position: fixed;
//       left: 0;
//       background-color: ${theme.backgroundColor};
//       height: 100vh;
//       width: 6vw;
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       justify-content: space-between;
//       padding: 2rem 0;
//       gap: 2rem;
//       .top{
//           display: flex;
//           flex-direction: column;
//           gap: 1.5rem;
//           width: 100%;
//           .links {
          
//               ul {
              
//                   margin-bottom: 0.5rem;

//                   .active {
//                       border-right: 0.2rem solid black;
//                   }
                  
//                   .active a {
//                       color: ${theme.buttonBackgroundColor};
//                   }
                  
//                   .active svg {
//                       color: ${theme.buttonBackgroundColor};
//                   }
                    
                  
//                   li{
//                       display: flex;
//                       justify-content: center;
//                       border-right: 0.2rem solid transparent;
//                       margin: 1rem 0;
//                       list-style-type: none;
//                       a {   
//                           text-decoration: none;
//                           color: ${theme.textColor};
//                           font-size: 1.6rem;
//                           gap: 0 0.4rem;;
//                       }
//                       .noti{
//                           display: flex;
//                           margin-left: 21px;
//                           span {
//                               background-color: red;
//                               font-size: 0.5rem;
//                               border-radius: 50%;
//                               padding: 2px 5px 2px 5px;
//                               color: ${theme.textColor};
//                               margin-bottom: 19px;
//                               margin-top: -10px;
//                           }
//                       }
//                       transition: 0.3s ease-in-out;
//                       &:hover{
//                           a {
//                               color: ${theme.buttonBackgroundColor};
//                           }
//                       }
                  
//                   }
              
//               }
//           }
//       }
//       .toggle-button {
//           margin-left: 2rem; /* Distanza dal bordo sinistro */
//           font-size: 1rem; /* Dimensioni del pulsante */
//       }

//       .notification{
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           margin-left: 0.5rem;
//           /*padding: 0.5rem 1rem;*/
//           .font_icon{
//               font-size: 1.5rem;
//           }

//           svg{
//               color: ${theme.textColor};
//           }

//           .image {
//               display: flex;
//               gap: 1rem;
//               img{
//                   height: 2.5rem;
//                   width: 2.5rem;
//                   border-radius: 3rem;
//               }
//           }

//           .account-image {
//               height: 2rem;
//               width: 2rem;
//               border-radius: 3rem;
//               background-color: white; /* Imposta il colore di sfondo dell'immagine */
//           }

//           .bell-icon {
//               font-size: 2rem; /* Imposta la grandezza desiderata */
//           }

          
//           .dropdown-container {
//               position: relative;
//           }
          
//           .dropdown-header {
//               cursor: pointer;
//           }
          
//           .dropdown-menu {
//               position: absolute;
//               top: 100%;
//               left: 0;
//               width: 200px;
//               background-color: #fff;
//               border: 2px solid #ccc;
//               border-radius: 4px;
//               padding: 8px;
//               box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//           }
          
//           .dropdown-option {
//               padding: 6px;
//               cursor: pointer;
//           }
          
//           .dropdown-option:hover {
//               background-color: #f5f5f5;
//           }
          
//           .dropdown-option.selected {
//               background-color: #007bff;
//               color: #fff;
//           }
          
//           .dropdown-option.logout {
//               margin-top: 8px;
//               color: #dc3545;
//           }

//           .popup-container {
//               position: fixed;
//               top: 0;
//               left: 0;
//               width: 100%;
//               height: 100%;
//               display: flex;
//               align-items: center;
//               justify-content: center;
//           }
          
//           .popup-window {
//               width: 400px;
//               padding: 20px;
//               background-color: white;
//               border: 2px solid orange;
//               border-radius: 10px;
//               box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
//           }
          
//           .overlay {
//               position: fixed;
//               top: 0;
//               left: 0;
//               width: 100%;
//               height: 100%;
//               background-color: rgba(255, 255, 255, 0.8);
//           }
//       }

//       `
//       ;


//   return {
//     Section,
//     SidebarSection,
//     SidebarToggleModeButton,
//     MyButton,
//     MyCloseButton,
//     TitleDashboard,
//     SignIn,
//     SignInButton,
//     ModalSignIn,
//     ModalSignUp,
//     setIsOpenSignIn,
//     setIsOpenSignUp,
//     ContainerHeader,
//     Logo,
//     ButtonGroup,
//     ButtonContainer,
//     ContainerFooter,
//     FooterText,
//     SignUp,
//     SignUpButton,
//     MyGenericModal,
//     MyGenericModalContent,
//     ModifiedTitleDashboard,
//     MySecondaryButton,
//     SecondaryTitle,
//     TitleLastAdds,
//     TitleSection,
//     StyledSection,
//     StyledInputs,
//     StyledTable,
//     StyledAddSection,
//     StyledLastAdds,
//     Container,
//     Title,
//     Subtitle,
//     PaciText,
//     FinanceText,
//     CentralSection,
//     CentralText,
//     CentralImage,
//     FeaturesSection,
//     Feature,
//     FeatureIcon,
//     FeatureText,
//     Icon,
//     MuiCustomDialog,
//     MuiCustomButton,
//     MuiCustomDialogTitle,
//     MuiCustomDialogContent,
//     MuiCustomDialogContentText,
//     MuiCustomDialogActions,
//     MuiCustomGrid,
//     MuiCustomTextField,
//     MuiCustomIconButton,
//     MuiCustomInputAdornment,
//     MuiCustomVisibility,
//     MuiCustomVisibilityOff,
//     MuiUseStyles,
    
//   };
// };

// export default MyStyled;
