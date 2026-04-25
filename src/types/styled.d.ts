/**
 * Module augmentation: teach styled-components about our theme shape.
 *
 * After this file, every `styled.*` component in `.ts/.tsx` files
 * automatically infers `props.theme` as `PacifinanceTheme` — no generic
 * needed at the call-site.
 *
 * @module types/styled
 */

import 'styled-components';
import type { PacifinanceTheme } from './theme';

declare module 'styled-components' {
  export interface DefaultTheme extends PacifinanceTheme {}
}
