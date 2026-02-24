/**
 * Tag Translations — thin adapter over i18n locale files.
 *
 * The SINGLE SOURCE OF TRUTH for tag display names now lives in:
 *   src/i18n/locales/it.json  →  tags.*
 *   src/i18n/locales/en.json  →  tags.*
 *
 * This module reads from the i18n system and exposes the same public API
 * that the rest of the codebase already relies on (translateTag, translateTagObject,
 * TAG_TRANSLATIONS, and individual *_TRANSLATIONS constants).
 *
 * Usage (unchanged):
 *   import { translateTag } from '../data/tagTranslations';
 *   const text = translateTag('food', 'it', 'expense'); // → 'Alimentari'
 *
 * @module data/tagTranslations
 */

import languages from '../i18n';
import { getAvailableLanguages } from '../i18n';

// ─── Build legacy { label: { lang: string } } maps from i18n locale data ────

const langCodes = getAvailableLanguages();  // ['it', 'en', ...]

const normalizeLookupValue = (value) => String(value ?? '')
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]/g, '');

/**
 * For a given tag type, build a map:  label → { lang: translatedString, ... }
 * by scanning every locale's  tags[type]  section.
 */
const buildTypeMap = (type) => {
  const map = {};
  for (const lang of langCodes) {
    const tags = (languages[lang]?.tags ?? {})[type] ?? {};
    for (const [label, value] of Object.entries(tags)) {
      if (!map[label]) map[label] = {};
      map[label][lang] = value;
    }
  }
  return map;
};

const buildReverseTypeMap = (type) => {
  const reverseMap = {};

  for (const lang of langCodes) {
    const tags = (languages[lang]?.tags ?? {})[type] ?? {};
    if (!reverseMap[lang]) reverseMap[lang] = {};

    for (const [label, value] of Object.entries(tags)) {
      const normalizedLabel = normalizeLookupValue(label);
      const normalizedValue = normalizeLookupValue(value);

      if (normalizedLabel) reverseMap[lang][normalizedLabel] = label;
      if (normalizedValue) reverseMap[lang][normalizedValue] = label;
    }
  }

  return reverseMap;
};

// Pre-built per-type maps (evaluated once at import time)
const EXPENSE_TRANSLATIONS            = buildTypeMap('expense');
const INCOME_TRANSLATIONS             = buildTypeMap('income');
const PAYMENT_TRANSLATIONS            = buildTypeMap('payment');
const JOB_TRANSLATIONS                = buildTypeMap('job');
const JOB_TYPE_TRANSLATIONS           = buildTypeMap('jobType');
const WORK_TIME_TRANSLATIONS          = buildTypeMap('workTime');
const REMOTE_TYPE_TRANSLATIONS        = buildTypeMap('remoteType');
const YEARS_OF_EXPERIENCE_TRANSLATIONS = buildTypeMap('yearsOfExperience');
const AGE_TRANSLATIONS                = buildTypeMap('age');
const LIVING_SITUATION_TRANSLATIONS   = buildTypeMap('livingSituation');
const HOUSING_TYPE_TRANSLATIONS       = buildTypeMap('housingType');
const CHILDREN_TRANSLATIONS           = buildTypeMap('children');
const COUNTRY_TRANSLATIONS            = buildTypeMap('country');

const EXPENSE_REVERSE_TRANSLATIONS = buildReverseTypeMap('expense');
const INCOME_REVERSE_TRANSLATIONS = buildReverseTypeMap('income');

// ─── Master Map ──────────────────────────────────────────────────────

export const TAG_TRANSLATIONS = {
  expense:           EXPENSE_TRANSLATIONS,
  income:            INCOME_TRANSLATIONS,
  payment:           PAYMENT_TRANSLATIONS,
  country:           COUNTRY_TRANSLATIONS,
  job:               JOB_TRANSLATIONS,
  jobType:           JOB_TYPE_TRANSLATIONS,
  workTime:          WORK_TIME_TRANSLATIONS,
  remoteType:        REMOTE_TYPE_TRANSLATIONS,
  yearsOfExperience: YEARS_OF_EXPERIENCE_TRANSLATIONS,
  age:               AGE_TRANSLATIONS,
  livingSituation:   LIVING_SITUATION_TRANSLATIONS,
  housingType:       HOUSING_TYPE_TRANSLATIONS,
  children:          CHILDREN_TRANSLATIONS,
};

const TAG_REVERSE_TRANSLATIONS = {
  expense: EXPENSE_REVERSE_TRANSLATIONS,
  income: INCOME_REVERSE_TRANSLATIONS,
};

// ─── Public API ──────────────────────────────────────────────────────

// Direct i18n lookup (preferred — reads from locale JSON at runtime)
const lookupFromLocale = (label, language, type) => {
  const tags = languages[language]?.tags ?? {};
  if (type && tags[type]) {
    const val = tags[type][label];
    if (val) return val;
  }
  // Unscoped: search every type section
  for (const section of Object.values(tags)) {
    if (section && section[label]) return section[label];
  }
  return null;
};

/**
 * Translate a tag label.
 *
 * @param {string} label    The tag's `label` field (lowercase key from DB)
 * @param {string} language Current language code (e.g. 'it', 'en')
 * @param {string} [type]   Optional tag type for scoped lookup (e.g. 'expense', 'income').
 *                           If omitted, searches all types (slower, but convenient).
 * @returns {string} Translated string, or the original label capitalised as fallback.
 */
export const translateTag = (label, language, type) => {
  if (!label) return '';
  const key = label.toLowerCase();

  // Primary: read directly from i18n locale data
  const found = lookupFromLocale(key, language, type);
  if (found) return found;

  // Fallback to English locale
  if (language !== 'en') {
    const enFallback = lookupFromLocale(key, 'en', type);
    if (enFallback) return enFallback;
  }

  // Ultimate fallback: capitalise first letter
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/**
 * Translate a tag object (with `.label` and optionally `.translations`).
 * Prefers local translations; falls back to DB `.translations` field.
 *
 * Drop-in replacement for the old `getTranslation()` helper.
 *
 * @param {Object|null} tagObj   Tag object (must have `.label`)
 * @param {string}      language Current language code
 * @param {string}      fallback Fallback if nothing matches
 * @param {string}      [type]   Optional tag type
 * @returns {string}
 */
export const translateTagObject = (tagObj, language, fallback, type) => {
  if (!tagObj) return fallback;

  // 1) Try i18n locale translations by label
  if (tagObj.label) {
    const local = translateTag(tagObj.label, language, type);
    if (local && local !== tagObj.label) return local;
  }

  // 2) Fall back to DB translations (backward compat)
  if (tagObj.translations) {
    if (tagObj.translations[language]) return tagObj.translations[language];
    if (tagObj.translations.en) return tagObj.translations.en;
    if (tagObj.translations.it) return tagObj.translations.it;
  }

  // 3) Label capitalised or fallback
  if (tagObj.label) return tagObj.label.charAt(0).toUpperCase() + tagObj.label.slice(1);
  return fallback;
};

export const resolveTagKeyFromLocalized = (value, language, type) => {
  const normalizedValue = normalizeLookupValue(value);
  if (!normalizedValue) return null;

  const typeMap = type ? { [type]: TAG_REVERSE_TRANSLATIONS[type] } : TAG_REVERSE_TRANSLATIONS;
  const languagePriority = [];

  if (language) languagePriority.push(language);
  languagePriority.push('en', 'it');

  for (const lang of langCodes) {
    if (!languagePriority.includes(lang)) {
      languagePriority.push(lang);
    }
  }

  for (const reverseMapByLanguage of Object.values(typeMap)) {
    if (!reverseMapByLanguage) continue;

    for (const lang of languagePriority) {
      const key = reverseMapByLanguage[lang]?.[normalizedValue];
      if (key) return key;
    }
  }

  return null;
};

// ─── Convenience Exports ─────────────────────────────────────────────

export { EXPENSE_TRANSLATIONS, INCOME_TRANSLATIONS, PAYMENT_TRANSLATIONS };
export { COUNTRY_TRANSLATIONS, JOB_TRANSLATIONS, JOB_TYPE_TRANSLATIONS };
export { WORK_TIME_TRANSLATIONS, REMOTE_TYPE_TRANSLATIONS, YEARS_OF_EXPERIENCE_TRANSLATIONS };
export { AGE_TRANSLATIONS, LIVING_SITUATION_TRANSLATIONS, HOUSING_TYPE_TRANSLATIONS, CHILDREN_TRANSLATIONS };
