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
    <ButtonToggle onClick={toggleMode} mode={mode}>
      {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </ButtonToggle>
  );
};

const ButtonToggle = styled.button`
  background-color: ${(props) => (props.mode === 'dark' ? '#222' : '#fff')};
  color: ${(props) => (props.mode === 'dark' ? '#fff' : '#222')};
  padding: 3px 3px; /* this for change the height and the width of the button */
  border-radius: 4px;
  // border-color: ${(props) => (props.mode === 'dark' ? '#fff' : '#000')};
  font-size: 8px;
  margin-right: 0.5em;
  cursor: pointer;
  display: flex;
  align-items: center;
  aria-label="toggle mode";

  svg {
    font-size: 3em; 
  }

  /* For screens with a maximum width of 768px (e.g. mobile devices) */
  @media (max-width: 768px) {
    padding: 0.5px 0.5px;
    font-size: 2px;

    svg {
      font-size: 7em; 
    }
  }
  `;

export default ToggleModeButton;



