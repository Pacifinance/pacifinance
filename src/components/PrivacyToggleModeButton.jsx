import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const PrivacyToggleModeButton = ({ mode, toggleHidden, isHidden }) => {

  return (
    <ButtonToggle mode={mode} data-umami-event="setPrivacy" onClick={toggleHidden} >
      {isHidden ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
    </ButtonToggle>
  );
};

export default PrivacyToggleModeButton;


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