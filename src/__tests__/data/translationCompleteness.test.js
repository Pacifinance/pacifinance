/**
 * Tests that all locale translation files have the same key structure as en.json.
 * This prevents runtime crashes from missing translation keys.
 * 
 * When a new key is added to en.json (the reference), this test will fail
 * for any locale file that doesn't have the corresponding key, reminding
 * developers to add translations for all supported languages.
 */

import { describe, it, expect } from 'vitest';
import en from '../../i18n/locales/en.json';
import itLocale from '../../i18n/locales/it.json';
import es from '../../i18n/locales/es.json';
import de from '../../i18n/locales/de.json';
import fr from '../../i18n/locales/fr.json';
import ptBR from '../../i18n/locales/pt-BR.json';

const locales = { it: itLocale, es, de, fr, 'pt-BR': ptBR };

// Use '→' as separator since JSON keys may contain dots (e.g. "virgin islands, u.s.")
const SEP = '→';

/**
 * Recursively collect all key paths from a nested object.
 * Arrays are treated as leaf values (not recursed into).
 * Uses '→' as a separator to avoid issues with dots inside JSON keys.
 */
function getAllKeyPaths(obj, prefix = '') {
    const keys = [];
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}${SEP}${key}` : key;
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            keys.push(...getAllKeyPaths(value, fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

/**
 * Get the value at a '→'-separated key path in a nested object.
 */
function getValueAtPath(obj, path) {
    const parts = path.split(SEP);
    let current = obj;
    for (const part of parts) {
        if (current === undefined || current === null) return undefined;
        current = current[part];
    }
    return current;
}

// Get all key paths from en.json (the reference)
const enKeyPaths = getAllKeyPaths(en);

describe('Translation files completeness', () => {
    it('en.json should have keys (sanity check)', () => {
        expect(enKeyPaths.length).toBeGreaterThan(100);
    });

    it('it.json should have all keys from en.json', () => {
        const itKeyPaths = getAllKeyPaths(itLocale);
        expect(itKeyPaths.length).toBeGreaterThanOrEqual(enKeyPaths.length);
    });

    // Test each locale against en.json
    for (const [localeName, localeData] of Object.entries(locales)) {
        describe(`${localeName}.json`, () => {
            it(`should have the same key structure as en.json`, () => {
                const localeKeyPaths = getAllKeyPaths(localeData);
                const missingKeys = enKeyPaths.filter(key => !localeKeyPaths.includes(key));

                if (missingKeys.length > 0) {
                    const missingPreview = missingKeys.slice(0, 20).join('\n  - ');
                    const moreMsg = missingKeys.length > 20 ? `\n  ... and ${missingKeys.length - 20} more` : '';
                    expect(missingKeys).toEqual(
                        [],
                        `${localeName}.json is missing ${missingKeys.length} keys:\n  - ${missingPreview}${moreMsg}`
                    );
                }

                expect(missingKeys).toEqual([]);
            });

            it(`should not have extra keys not in en.json`, () => {
                const localeKeyPaths = getAllKeyPaths(localeData);
                const extraKeys = localeKeyPaths.filter(key => !enKeyPaths.includes(key));

                if (extraKeys.length > 0) {
                    const extraPreview = extraKeys.slice(0, 20).join('\n  - ');
                    const moreMsg = extraKeys.length > 20 ? `\n  ... and ${extraKeys.length - 20} more` : '';
                    expect(extraKeys).toEqual(
                        [],
                        `${localeName}.json has ${extraKeys.length} extra keys not in en.json:\n  - ${extraPreview}${moreMsg}`
                    );
                }

                expect(extraKeys).toEqual([]);
            });

            it(`should have matching value types for all keys`, () => {
                const typeMismatches = [];
                for (const keyPath of enKeyPaths) {
                    const enValue = getValueAtPath(en, keyPath);
                    const localeValue = getValueAtPath(localeData, keyPath);

                    if (localeValue === undefined) continue; // Missing key handled by other test

                    const enType = Array.isArray(enValue) ? 'array' : typeof enValue;
                    const localeType = Array.isArray(localeValue) ? 'array' : typeof localeValue;

                    if (enType !== localeType) {
                        typeMismatches.push(
                            `${keyPath}: en=${enType}, ${localeName}=${localeType}`
                        );
                    }
                }

                if (typeMismatches.length > 0) {
                    expect(typeMismatches).toEqual(
                        [],
                        `Type mismatches in ${localeName}.json:\n  - ${typeMismatches.join('\n  - ')}`
                    );
                }

                expect(typeMismatches).toEqual([]);
            });

            it(`should have matching array lengths for all array keys`, () => {
                const lengthMismatches = [];
                for (const keyPath of enKeyPaths) {
                    const enValue = getValueAtPath(en, keyPath);
                    const localeValue = getValueAtPath(localeData, keyPath);

                    if (!Array.isArray(enValue) || !Array.isArray(localeValue)) continue;

                    if (enValue.length !== localeValue.length) {
                        lengthMismatches.push(
                            `${keyPath}: en has ${enValue.length} items, ${localeName} has ${localeValue.length} items`
                        );
                    }
                }

                if (lengthMismatches.length > 0) {
                    expect(lengthMismatches).toEqual(
                        [],
                        `Array length mismatches in ${localeName}.json:\n  - ${lengthMismatches.join('\n  - ')}`
                    );
                }

                expect(lengthMismatches).toEqual([]);
            });
        });
    }
});

describe('Translation files consistency (en ↔ it)', () => {
    it('en.json and it.json should have identical key sets', () => {
        const itKeyPaths = getAllKeyPaths(itLocale);
        
        const missingInIt = enKeyPaths.filter(key => !itKeyPaths.includes(key));
        const extraInIt = itKeyPaths.filter(key => !enKeyPaths.includes(key));

        expect(missingInIt).toEqual([]);
        expect(extraInIt).toEqual([]);
    });
});
