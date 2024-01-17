// Theme.js
import React, { useContext } from 'react';
import { createGlobalStyle } from 'styled-components';

import { languageContext } from './LanguageContext';
import languages from './languages.json';

// const { language } = useContext(languageContext);

export const themes = {
  light: {
    mode: 'light',
    jollyColor: '#b5ded1',
    primaryColor: '#F7F5FF', //#f5f5f5
    secondaryColor: '#079164',
    textColor: 'black',//#222629
    borderColor: '#079164',
    backgroundColor: '#f5f5f5',
    buttonBackgroundColor: '#079164',
    iconBackgroundColor: '#079164',
  },
  dark: {
    mode: 'dark',
    jollyColor: '#b5ded1', //maybe better white
    primaryColor: '#0d0f13', //black
    secondaryColor: '#079164',
    textColor: '#fff',
    borderColor: 'white',
    backgroundColor: '#222831', //#222831 o #3d3d3d 
    buttonBackgroundColor: '#079164 ',   // #FF8000 arancione o #59A52C verde o #6fca3a verde chiaro o #079164 (verde smeraldo)
    iconBackgroundColor: '#079164 ',
  },
};

export const primaryColor = '#079164';
export const secondaryColor = '#0d0f13';
export const backgroundColor = '#0d0f13';

export const getColorsBalances = (language) => ({
  [languages[language].assets.stocks]: '#FF6600',
  [languages[language].assets.etf]: '#a29bfe',
  [languages[language].assets.bank]: '#0D579B',
  [languages[language].assets.cash]: '#329239',
  [languages[language].assets.crypto]: '#d63031',
  [languages[language].assets.bitcoin]: '#F7B510',
  [languages[language].assets.digitalServices]: '#74b9ff',
});

export const getColorsIncExp = (language) => ({
  [languages[language].general.incomes]: '#079164',
  [languages[language].general.expenses]: '#FF0000',
  [languages[language].general.saved]: '#90EE90',
});

// export const GlobalStyle = createGlobalStyle`
//   body {
//     background-color: ${({ theme }) => theme.backgroundColor};
//     color: ${({ theme }) => theme.textColor};
//     // Add other global styles here
//   }
// `;