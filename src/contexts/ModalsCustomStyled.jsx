import React, { useContext } from 'react';
import styled from 'styled-components';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
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

  return {
    MuiCustomDialog,
    MuiCustomButton,
    MuiCustomDialogTitle,
    MuiCustomDialogContent,
    MuiCustomDialogContentText,
    MuiCustomDialogActions,
    MyGenericModal,
    MyGenericModalContent,
    MyButton,
    MyCloseButton,
  };
};

export default ModalsCustomStyled;
