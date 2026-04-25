/**
 * Locale schema — derived from the canonical `en.json` at compile-time.
 *
 * Any code that does `translations.foo.bar` will now be type-checked
 * against the real keys present in `en.json`. Add a key there, get
 * autocomplete everywhere; remove a key, break the build at every use-site.
 *
 * @module types/locale
 */

import en from '../i18n/locales/en.json';

/** Full recursive shape of the translation tree. */
export type LocaleSchema = typeof en;

/** Top-level namespaces (e.g. `'dashboard' | 'settings' | ...`). */
export type LocaleNamespace = keyof LocaleSchema;
