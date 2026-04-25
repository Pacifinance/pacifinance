/**
 * Generic utility types reused across the app.
 *
 * @module types/common
 */

/** Value or null. */
export type Nullable<T> = T | null;

/** Value, null, or undefined — useful for optional API fields. */
export type Maybe<T> = T | null | undefined;

/** Branded string — prevents accidental mixing of differently-semanticised strings. */
export type Brand<T, B extends string> = T & { readonly __brand: B };

export type CurrencyCode = Brand<string, 'CurrencyCode'>;
export type LanguageCode = Brand<string, 'LanguageCode'>;
export type IsoDateString = Brand<string, 'IsoDateString'>;

/** Simple async state envelope used by hooks that fetch. */
export interface AsyncState<T, E = Error> {
  data: T | null;
  loading: boolean;
  error: E | null;
}

/** A `{ key, value }` tuple as returned by tag lookups and profile fields. */
export interface KeyValue<K = number, V = string> {
  key: K;
  value: V;
}

/** Dictionary shorthand. */
export type Dict<V = unknown> = Record<string, V>;

/** Prettify a mapped / intersected type for readable IDE tooltips. */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};
