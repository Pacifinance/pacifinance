/**
 * Utility functions for sorting tags and options based on language
 */
import { translateTag } from '../data/tagTranslations';

/**
 * Sorts an array of tags by their translation in the specified language.
 * Uses local translations (tagTranslations.js) as primary source.
 * @param {Array} tags - Array of tag objects with label property
 * @param {string} language - Language code ('it' or 'en')
 * @param {string} [type] - Optional tag type for scoped translation lookup
 * @returns {Array} Sorted array of tags
 */
export const sortTagsByLanguage = (tags, language, type) => {
  if (!tags || !Array.isArray(tags)) return [];
  
  // Find "Other" option (usually has index 9999)
  const otherOption = tags.find(tag => tag.index === 9999);
  const otherTags = tags.filter(tag => tag.index !== 9999);
  
  // Sort by translation for the specified language (local translations first)
  const sortedTags = otherTags.sort((a, b) => {
    const aTranslation = translateTag(a.label, language, type) || a.translations?.[language] || '';
    const bTranslation = translateTag(b.label, language, type) || b.translations?.[language] || '';
    return aTranslation.localeCompare(bTranslation, language, {
      sensitivity: 'base',
      numeric: true
    });
  });
  
  // Add "Other" option at the end if it exists
  if (otherOption) {
    sortedTags.push(otherOption);
  }
  
  return sortedTags;
};

/**
 * Sorts an array of simple options by their label
 * @param {Array} options - Array of option objects with label property
 * @param {string} language - Language code for locale-specific sorting
 * @returns {Array} Sorted array of options
 */
export const sortOptionsByLabel = (options, language) => {
  if (!options || !Array.isArray(options)) return [];
  
  return options.sort((a, b) => {
    const aLabel = a.label || '';
    const bLabel = b.label || '';
    return aLabel.localeCompare(bLabel, language, {
      sensitivity: 'base',
      numeric: true
    });
  });
};

/**
 * Sorts month options keeping the chronological order
 * Month options should not be sorted alphabetically but remain in chronological order
 * @param {Array} monthOptions - Array of month options
 * @returns {Array} Original array (months should stay in chronological order)
 */
export const sortMonthOptions = (monthOptions) => {
  // Months should remain in chronological order, not alphabetically sorted
  return monthOptions;
};