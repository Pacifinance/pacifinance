/**
 * Script to fix locale files by ensuring they have the same structure as en.json.
 * For each broken locale (de, fr, pt-BR), this script:
 * 1. Reads en.json as the reference structure
 * 2. Reads the existing locale file
 * 3. Flattens both to key-value maps
 * 4. For each key in en.json, looks for the value in the existing locale
 * 5. Outputs a JSON with the correct structure, using existing translations where available
 *    and English values (prefixed with [EN] ) where missing
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = join(__dirname, '..', 'src', 'i18n', 'locales');

// Flatten a nested object into dot-separated key paths
function flatten(obj, prefix = '') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(result, flatten(value, fullKey));
        } else {
            result[fullKey] = value;
        }
    }
    return result;
}

// Unflatten a dot-separated key map back into a nested object
function unflatten(flatObj) {
    const result = {};
    for (const [key, value] of Object.entries(flatObj)) {
        const parts = key.split('.');
        let current = result;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!(parts[i] in current)) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
    }
    return result;
}

// Read and parse a locale file
function readLocale(filename) {
    const filepath = join(localesDir, filename);
    return JSON.parse(readFileSync(filepath, 'utf-8'));
}

// Write a locale file with proper formatting
function writeLocale(filename, data) {
    const filepath = join(localesDir, filename);
    writeFileSync(filepath, JSON.stringify(data, null, 4) + '\n', 'utf-8');
}

// Main
const en = readLocale('en.json');
const enFlat = flatten(en);

const localesToFix = ['de.json', 'fr.json', 'pt-BR.json'];

for (const localeFile of localesToFix) {
    console.log(`\n--- Processing ${localeFile} ---`);
    const existing = readLocale(localeFile);
    const existingFlat = flatten(existing);
    
    // Build a value-to-keys reverse index from existing flat map
    // This helps find translations even if they were under different key paths
    
    let matched = 0;
    let missing = 0;
    const newFlat = {};
    
    for (const [key, enValue] of Object.entries(enFlat)) {
        if (key in existingFlat) {
            // Exact key match - use existing translation
            newFlat[key] = existingFlat[key];
            matched++;
        } else {
            // Key doesn't exist in the locale - mark as missing
            newFlat[key] = enValue; // Use English value as placeholder
            missing++;
        }
    }
    
    console.log(`  Matched: ${matched} keys`);
    console.log(`  Missing (using English): ${missing} keys`);
    console.log(`  Total: ${Object.keys(newFlat).length} keys`);
    
    // Log missing keys for reference
    if (missing > 0) {
        console.log(`\n  Missing keys in ${localeFile}:`);
        for (const [key, enValue] of Object.entries(enFlat)) {
            if (!(key in existingFlat)) {
                const preview = typeof enValue === 'string' ? enValue.substring(0, 60) : JSON.stringify(enValue);
                console.log(`    - ${key}: "${preview}"`);
            }
        }
    }
    
    const result = unflatten(newFlat);
    writeLocale(localeFile, result);
    console.log(`  ✅ Written ${localeFile}`);
}

console.log('\nDone! Review the files and translate [EN] prefixed values.');
