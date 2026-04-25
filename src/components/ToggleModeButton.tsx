import React from 'react';
import styled from 'styled-components';
import Brightness4Icon from '@mui/icons-material/Brightness3';
import LightModeIcon from '@mui/icons-material/LightMode';

const ToggleModeButton = ({ mode, toggleMode }) => {

  return (
    <ButtonToggle mode={mode} data-umami-event="setTheme" onClick={toggleMode} aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
      {mode === 'dark' ? <Brightness4Icon/> : <LightModeIcon /> }
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



