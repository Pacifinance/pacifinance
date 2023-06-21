import React, { useContext } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { styled as muiStyled } from '@mui/system';
import { ThemeContext } from './ThemeContext';

const MuiCustomStyled = () => {
  const { theme } = useContext(ThemeContext);
  const { mode } = theme;

  const CustomDialog = muiStyled(Dialog)`
    // background-color: ${theme.backgroundColor};
    // color: ${theme.textColor};
    // border: 4px solid ${theme.buttonBackgroundColor};
  `;

  const CustomButton = muiStyled(Button)`
    background-color: ${theme.buttonBackgroundColor};
    color: ${theme.textColor};
    hover: ${theme.BackgroundColor};
  `;

  const CustomDialogTitle = muiStyled(DialogTitle)`
    font-family: Roboto, sans-serif;
    color: ${theme.buttonBackgroundColor};
  `;

  const CustomDialogContent = muiStyled(DialogContent)`
    // font-family: Roboto, sans-serif;
    // color: ${theme.textColor};
    // // background-color: ${theme.backgroundColor};
  `;

  const CustomDialogContentText = muiStyled(DialogContentText)`
    font-family: Roboto, sans-serif;
    color: ${theme.textColor};
  `;

  const CustomDialogActions = muiStyled(DialogActions)`
    // font-family: Roboto, sans-serif;
    // color: ${theme.textColor};
    // background-color: ${theme.backgroundColor};
  `;

  return {
    CustomDialog,
    CustomButton,
    CustomDialogTitle,
    CustomDialogContent,
    CustomDialogContentText,
    CustomDialogActions,
  };
};

export default MuiCustomStyled;
