/**
 * Quick test script to verify i18n system works correctly
 * Run with: node src/i18n/test-i18n.js
 */

import { getTranslations, getAvailableLanguages } from './index.js';

console.log('🔍 Testing i18n System...\n');

// Test 1: Check available languages
console.log('1️⃣ Available languages:');
const languages = getAvailableLanguages();
console.log('   ', languages);
console.log('   ✅ Expected: ["it", "en"]\n');

// Test 2: Get Italian translations
console.log('2️⃣ Italian translations:');
const itTranslations = getTranslations('it');
console.log('   ', 'Has general section:', !!itTranslations?.general);
console.log('   ', 'Has assets section:', !!itTranslations?.assets);
console.log('   ', 'Has months section:', !!itTranslations?.months);
console.log('   ', 'Example text:', itTranslations?.general?.ok || 'N/A');
console.log('   ✅ All sections should be present\n');

// Test 3: Get English translations
console.log('3️⃣ English translations:');
const enTranslations = getTranslations('en');
console.log('   ', 'Has general section:', !!enTranslations?.general);
console.log('   ', 'Has assets section:', !!enTranslations?.assets);
console.log('   ', 'Has months section:', !!enTranslations?.months);
console.log('   ', 'Example text:', enTranslations?.general?.ok || 'N/A');
console.log('   ✅ All sections should be present\n');

// Test 4: Fallback to English
console.log('4️⃣ Fallback test:');
const unsupportedLang = getTranslations('fr'); // French not supported
console.log('   ', 'Fallback to English:', unsupportedLang === enTranslations);
console.log('   ✅ Should fallback to English for unsupported languages\n');

// Test 5: Structure comparison
console.log('5️⃣ Structure comparison:');
const itKeys = Object.keys(itTranslations || {}).sort();
const enKeys = Object.keys(enTranslations || {}).sort();
const sameStructure = JSON.stringify(itKeys) === JSON.stringify(enKeys);
console.log('   ', 'IT keys:', itKeys);
console.log('   ', 'EN keys:', enKeys);
console.log('   ', 'Same structure:', sameStructure);
console.log('   ✅ Both languages should have same top-level keys\n');

console.log('✅ i18n System Test Complete!');
console.log('\n📝 Note: If you see "null" or missing sections, run:');
console.log('   cd src/i18n && node extract-languages.js');
console.log('   to generate the locale JSON files from languages.json\n');
