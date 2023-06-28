import React, { useContext } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../contexts/ThemeContext';
import Brightness4Icon from '@material-ui/icons/Brightness3';
import Brightness7Icon from '@material-ui/icons/Brightness7';

const ToggleModeButton = () => {
  // Utilizza il contesto del tema
  const { theme, toggleMode } = useContext(ThemeContext);

  // Estrai il tema corrente
  const { mode } = theme;


  return (
    <Button onClick={toggleMode} mode={mode}>
      {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </Button>
  );
};

const Button = styled.button`
    background-color: ${(props) => (props.mode === 'dark' ? '#222' : '#fff')};
    color: ${(props) => (props.mode === 'dark' ? '#fff' : '#222')};
    padding: 1px 1px; /* this for change the height and the width of the button */
    border-radius: 4px;
    border-color: ${(props) => (props.mode === 'dark' ? '#fff' : '#000')};
    font-size: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
  `;

export default ToggleModeButton;
