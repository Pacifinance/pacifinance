import type { PacifinanceTheme } from '../types/theme';

/**
 * Shared background treatment for every authenticated page: the flat
 * `theme.backgroundColor` plus one subtle brand-green glow, top-right.
 *
 * Before this existed, pages had picked their own one-off gradients
 * (an extra blue glow on the dashboard, a green ellipse on stats, a
 * diagonal near-black gradient on the roadmap, nothing at all elsewhere) -
 * all with slightly different colors/positions/intensities. Use this
 * instead of inventing a new gradient per page, so the app reads as one
 * product rather than a new theme every click.
 *
 * Returns just the CSS `background` value (not the declaration), so it
 * works both in a styled-component (`` background: ${p => appBackgroundValue(p.theme)}; ``)
 * and in an inline style object (`{ background: appBackgroundValue(theme) }`).
 */
export const appBackgroundValue = (theme: PacifinanceTheme) =>
  `radial-gradient(1100px 650px at 100% -5%, ${theme.secondaryColor}${theme.mode === 'dark' ? '1a' : '10'}, transparent 60%), ${theme.backgroundColor}`;

export default appBackgroundValue;
