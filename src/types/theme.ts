/**
 * Pacifinance theme contract.
 *
 * Keep in sync with the objects exported from `src/styles/Themes.jsx`.
 * When this interface changes, styled-components automatically picks up the
 * new shape via `styled.d.ts` which augments `DefaultTheme`.
 *
 * @module types/theme
 */

export type ThemeMode = 'light' | 'dark';

export interface PacifinanceTheme {
  mode: ThemeMode;
  jollyColor: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  borderColor: string;
  backgroundColor: string;
  buttonBackgroundColor: string;
  iconBackgroundColor: string;
  rankingInfoBackgroundColor: string;
}
