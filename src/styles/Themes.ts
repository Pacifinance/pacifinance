// Theme.js

export const themes = {
  light: {
    mode: 'light',
    jollyColor: '#b5ded1',
    primaryColor: '#e6f4f0', //#f5f5f5 //#fafafa (umami color) //#e6f4f0 (green light) #F7F5FF (old white)
    secondaryColor: '#079164',
    textColor: '#172033',
    borderColor: '#079164',
    backgroundColor: '#f5f5f5',
    buttonBackgroundColor: '#079164',
    iconBackgroundColor: '#079164',
    rankingInfoBackgroundColor: '#ececec',
    dangerColor: '#ef4444',
    successColor: '#10b981',
    warningColor: '#f59e0b',
  },
  dark: {
    mode: 'dark',
    jollyColor: '#b5ded1', //maybe better white
    primaryColor: '#18212d',
    secondaryColor: '#079164', //green
    textColor: '#f8fafc',
    borderColor: '#dbe4ee',
    backgroundColor: '#222831', //#222831 o #3d3d3d 
    buttonBackgroundColor: '#079164',   // #FF8000 arancione o #59A52C verde o #6fca3a verde chiaro o #079164 (verde smeraldo)
    iconBackgroundColor: '#079164',
    rankingInfoBackgroundColor: '#263244',
    dangerColor: '#ef4444',
    successColor: '#10b981',
    warningColor: '#f59e0b',
  },
};

export const primaryColor = '#079164';
export const secondaryColor = '#18212d';
export const backgroundColor = '#18212d';

export const getColorsBalances = (translations) => ({
  [translations.assets.stocks]: '#FF6600',
  [translations.assets.etf]: '#a29bfe',
  [translations.assets.bank]: '#0D579B',
  [translations.assets.cash]: '#329239',
  [translations.assets.crypto]: '#d63031',
  [translations.assets.bitcoin]: '#F7B510',
  [translations.assets.digitalServices]: '#74b9ff',
});

export const getColorsIncExp = (translations) => ({
  [translations.general.incomes]: '#079164',
  [translations.general.expenses]: '#FF0000',
  [translations.general.saved]: '#90EE90',
});

// export const GlobalStyle = createGlobalStyle`
//   body {
//     background-color: ${({ theme }) => theme.backgroundColor};
//     color: ${({ theme }) => theme.textColor};
//     // Add other global styles here
//   }
// `;
