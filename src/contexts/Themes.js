// Theme.js
import { createGlobalStyle } from 'styled-components';

export const themes = {
  light: {
    mode: 'light',
    jollyColor: '#6fca3a',
    primaryColor: '#fff',
    textColor: 'black',//#222629
    backgroundColor: '#fff',
    buttonBackgroundColor: '#079164',
    iconBackgroundColor: '#079164',
  },
  dark: {
    mode: 'dark',
    jollyColor: 'white',
    primaryColor: '#0d0f13', //black
    textColor: '#fff',
    backgroundColor: '#222831', //#222831 o #3d3d3d 
    buttonBackgroundColor: '#079164 ',   // #FF8000 arancione o #59A52C verde o #6fca3a verde chiaro o #079164 (verde smeraldo)
    iconBackgroundColor: '#079164 ',
  },
};

export const primaryColor = '#079164';
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