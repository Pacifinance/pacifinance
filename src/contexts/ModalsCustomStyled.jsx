import React, { useContext } from 'react';
import styled from 'styled-components';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { IconButton, InputAdornment, TextField } from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import { ThemeContext } from './ThemeContext';

const ModalsCustomStyled = () => {
  const { theme } = useContext(ThemeContext);
  const { mode } = theme;

  const MuiCustomDialog = styled(Dialog)`
    // background-color: ${theme.backgroundColor};
    // color: ${theme.textColor};
    // border: 4px solid ${theme.buttonBackgroundColor};
  `;

  const MuiCustomButton = styled(Button)`
    background-color: ${theme.buttonBackgroundColor};
    color: ${theme.textColor};
    hover: ${theme.BackgroundColor};
  `;

  const MuiCustomDialogTitle = styled(DialogTitle)`
    font-family: Roboto, sans-serif;
    color: ${theme.buttonBackgroundColor};
  `;

  const MuiCustomDialogContent = styled(DialogContent)`
    // font-family: Roboto, sans-serif;
    // color: ${theme.textColor};
    // // background-color: ${theme.backgroundColor};
  `;

  const MuiCustomDialogContentText = styled(DialogContentText)`
    font-family: Roboto, sans-serif;
    color: ${theme.textColor};
  `;

  const MuiCustomDialogActions = styled(DialogActions)`
    // font-family: Roboto, sans-serif;
    // color: ${theme.textColor};
    // background-color: ${theme.backgroundColor};
  `;

  const MuiCustomTextField = styled(TextField)`
      && {
        // label.Mui-focused {
        //   color: blue;
        // }
        .MuiInput-underline:after {
          border-bottom-color: ${theme.buttonBackgroundColor};
        }
        .Mui-focused .MuiInput-underline:after {
          border-bottom-color: blue;
        }
      }
    `;

  const MuiCustomIconButton = styled(IconButton)`
  `;

  const MuiCustomInputAdornment = styled(InputAdornment)`
  `;

  const MuiCustomVisibility = styled(Visibility)`
  `;

  const MuiCustomVisibilityOff = styled(VisibilityOff)`
  `;

  const MuiCustomGrid = styled(Grid)`
  `;

  const MuiUseStyles = makeStyles((theme) => ({
    root: {
      width: '50%',
    },
    icon: {
      color: 'white',
    },
  }));

  const MyGenericModal = styled.div`
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
    border: 4px solid ${theme.jollyColor};
  `;

  const MyGenericModalContent = styled.div`
    background-color: ${theme.backgroundColor};
    margin: auto;
    max-width: 80%;
    max-height: 80%;
    padding: 20px;
    overflow: auto;
  `;

  const MyButton = styled.button`
    background-color: ${theme.buttonBackgroundColor};
    color: ${theme.textColor};  
    padding: 10px 20px;
    border-radius: 4px;
    border-color: ${mode === 'dark' ? '#fff' : '#000'};
    border-shadow: 0px 0px 10px 0px rgba(0,0,0,0.75);
    align-items: center;
    font-size: 16px;
    cursor: pointer;
  `;

  const MyCloseButton = styled.span`
    cursor: pointer;
    color: ${theme.textColor};
    background-color: ${theme.buttonBackgroundColor};
    border-radius: 4px;
    border: 1px solid ${mode === 'dark' ? '#fff' : '#000'};
    width: 20px; /* Aggiungi il valore desiderato per la lunghezza */
    height: 20px; /* Aggiungi il valore desiderato per l'altezza */
    text-align: center;
    display: inline-block;
    line-height: 20px;
    &:hover {
      color: #000;
    }
  `;

  const TitleDashboard = styled.h1 `
        color: ${theme.textColor};
        font-size: 2rem;
        font-weight: 400;
        margin-bottom: 2rem;
        margin-left: 2rem;
    `;

  return {
    MuiCustomDialog,
    MuiCustomButton,
    MuiCustomDialogTitle,
    MuiCustomDialogContent,
    MuiCustomDialogContentText,
    MuiCustomDialogActions,
    MuiCustomGrid,
    MuiCustomTextField,
    MuiCustomIconButton,
    MuiCustomInputAdornment,
    MuiCustomVisibility,
    MuiCustomVisibilityOff,
    MuiUseStyles,
    MyGenericModal,
    MyGenericModalContent,
    MyButton,
    MyCloseButton,
    TitleDashboard,
  };
};

export default ModalsCustomStyled;
