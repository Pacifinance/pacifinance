/**
 * Tests that every leaf key in en.json (the i18n reference locale) is actually
 * read somewhere in src/. Catches dead translation keys left behind by removed
 * or renamed features before they pile up in all 6 locale files.
 *
 * This is a companion to translationCompleteness.test.js, which checks the
 * locales stay structurally aligned with each other but not whether any of
 * those keys are still used.
 *
 * A leaf key counts as "used" if either:
 *   - the exact dotted path appears as `translations.a.b.c` (any mix of `.`/`?.`), or
 *   - the leaf's own property name appears anywhere as `.leafName` or ['leafName']/["leafName"]
 *     (covers the `const t = translations.section; t.leafName` aliasing pattern used
 *     throughout this codebase)
 *
 * Some namespaces are read via runtime bracket access with a variable key
 * (`translations.assets[assetKey]`) or fully enumerated with Object.entries/keys/values
 * (`tags.*`, `knowledge.*`) rather than ever appearing as a literal property access.
 * Those are listed in DYNAMIC_NAMESPACES/DYNAMIC_EXACT below (traced by hand against
 * the actual call sites) and are always treated as used.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import en from '../../i18n/locales/en.json';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.resolve(__dirname, '../../');

const DYNAMIC_NAMESPACES = [
    /^assets\./,
    /^months\./,
    /^graphs\.balanceExplorer\.groups\./,
    /^graphs\.balanceExplorer\.periods\./,
    /^graphs\.statsOutflows\.explorer\.periods\./,
    /^investments\.importWizard\.platforms\./,
    /^investments\.importWizard\.kinds\./,
    /^investments\.importWizard\.bankNames\./,
    /^marketPrices\.categories\./,
    /^marketPrices\.tradingView\.exchanges\./,
    /^pwaInstall\.steps\./,
    /^gamification\.badges\./,
    /^graphs\.insights\.diversification\./,
    /^graphs\.insights\.liquidity\./,
    /^graphs\.insights\.spendingRate\./,
    /^leaderboard\.rankings\.descriptions\./,
    /^leaderboard\.rankings\.motivational\./,
    /^dataImport\.bankNames\./,
    /^transactionPurpose\./,
    // Whole subtree enumerated via Object.entries/keys/values elsewhere
    // (src/data/tagTranslations.ts, src/sections/Knowledge.tsx) rather than
    // read leaf-by-leaf — every key under these is "used" in bulk.
    /^tags\./,
    /^knowledge\./,
];
// Leaf keys addressed via a runtime-built string path (e.g. `info.faq.question${i}`)
// resolved through a getTranslation(path) walker in src/sections/Info.tsx.
const DYNAMIC_EXACT = [
    /^info\.faq\.(question|answer)\d+$/,
];

function isDynamic(pathParts) {
    const dotted = pathParts.join('.');
    if (DYNAMIC_NAMESPACES.some((re) => re.test(dotted))) return true;
    if (DYNAMIC_EXACT.some((re) => re.test(dotted))) return true;
    if (pathParts[0] === 'insert' && pathParts.length === 3 && (pathParts[2] === 'editFailed' || pathParts[2] === 'successEdit')) return true;
    return false;
}

function flatten(obj, prefix = []) {
    const leaves = [];
    for (const [key, value] of Object.entries(obj)) {
        const p = [...prefix, key];
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            leaves.push(...flatten(value, p));
        } else {
            leaves.push(p);
        }
    }
    return leaves;
}

function collectSourceFiles(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'locales') continue; // skip the JSON locale files themselves
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            collectSourceFiles(full, out);
        } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
            out.push(full);
        }
    }
    return out;
}

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

describe('translation unused keys', () => {
    const leaves = flatten(en);
    const files = collectSourceFiles(SRC_ROOT);
    const allSource = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

    function exactPathUsed(pathParts) {
        const sep = String.raw`(?:\.|\?\.)`;
        const escaped = pathParts.map(escapeRegExp);
        const re = new RegExp(String.raw`translations${sep}${escaped.join(sep)}(?![a-zA-Z0-9_])`);
        return re.test(allSource);
    }

    function looseLeafUsed(leafName) {
        const escaped = escapeRegExp(leafName);
        const re = new RegExp(String.raw`(?:\.${escaped}(?![a-zA-Z0-9_])|\[['"]${escaped}['"]\])`);
        return re.test(allSource);
    }

    it('has at least one leaf key to check (sanity check for the scan itself)', () => {
        expect(leaves.length).toBeGreaterThan(100);
        expect(files.length).toBeGreaterThan(50);
    });

    it('every en.json leaf key is referenced somewhere in src/', () => {
        const unused = leaves
            .filter((pathParts) => !isDynamic(pathParts))
            .filter((pathParts) => !exactPathUsed(pathParts) && !looseLeafUsed(pathParts[pathParts.length - 1]))
            .map((pathParts) => pathParts.join('.'));

        if (unused.length > 0) {
            throw new Error(
                `Found ${unused.length} translation key(s) in en.json with no detected usage in src/:\n` +
                unused.map((k) => `  - ${k}`).join('\n') +
                '\n\nIf a key IS actually used via runtime bracket access or a dynamically-built path ' +
                '(e.g. `translations.section[variable]`), add its namespace to DYNAMIC_NAMESPACES/DYNAMIC_EXACT ' +
                'at the top of this test instead of ignoring this failure. Otherwise remove the dead key from ' +
                'all 6 locale files in src/i18n/locales/.'
            );
        }
    });
});
