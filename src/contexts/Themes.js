// Theme.js
import { createGlobalStyle } from 'styled-components';

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

export const colorsBalances = {
  Azioni: '#FF6600',
  ETF: '#a29bfe',
  Banca: '#0D579B',
  Banconote: '#329239',
  Criptovalute: '#d63031',
  Bitcoin: '#F7B510',
  ServiziDigitali: '#74b9ff',
}

export const colorsIncExp = {
  Entrate: '#079164',
  Spese: '#FF0000',
  Risparmiato: '#90EE90',
}

// export const GlobalStyle = createGlobalStyle`
//   body {
//     background-color: ${({ theme }) => theme.backgroundColor};
//     color: ${({ theme }) => theme.textColor};
//     // Add other global styles here
//   }
// `;