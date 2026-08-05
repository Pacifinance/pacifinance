// src/data/categoryColors.js

import { resolveTagKeyFromLocalized } from './tagTranslations';

export const incomeCategoryColors = {
  // Necessary/positive
  'Salary': 'rgba(39, 174, 96, 0.35)', // green: security, stability
  'Freelance income': 'rgba(52, 152, 219, 0.32)', // blue: trust, professionalism
  'Extra income': 'rgba(241, 196, 15, 0.32)', // yellow: energy, positivity
  'Gift': 'rgba(155, 89, 182, 0.28)', // purple: surprise, gift
  'Retirement': 'rgba(127, 140, 141, 0.28)', // gray: neutrality
  'Other': 'rgba(230, 126, 34, 0.32)', // orange: creativity
};

export const outflowCategoryColors = {
  // Necessary/positive
  'Food': 'rgba(39, 174, 96, 0.32)', // green: health, necessity
  'House': 'rgba(46, 196, 182, 0.32)', // teal: security, home
  'Health': 'rgba(231, 76, 60, 0.28)', // red: attention, health
  'Education': 'rgba(52, 152, 219, 0.32)', // blue: growth
  'Tax': 'rgba(52, 73, 94, 0.28)', // dark gray: obligation
  // Less necessary/discretionary
  'Shopping': 'rgba(241, 196, 15, 0.32)', // yellow: pleasure
  'Free time': 'rgba(155, 89, 182, 0.28)', // purple: leisure
  'Travelling': 'rgba(46, 204, 113, 0.32)', // light green: freedom
  'Vehicle': 'rgba(230, 126, 34, 0.32)', // orange: movement
  'Digital service': 'rgba(203, 243, 240, 0.32)', // light blue: technology
  'Gift': 'rgba(255, 99, 132, 0.28)', // pink/red: gift
  'Pets': 'rgba(255, 206, 86, 0.28)', // light yellow: affection
  'Personal project': 'rgba(255, 115, 0, 0.38)', // bright orange: creativity, motivation, emphasis
  'Investment': 'rgba(106, 90, 205, 0.32)', // blue-purple: financial growth
  'Transports': 'rgba(139, 69, 19, 0.32)', // brown: transportation
  'Other': 'rgba(127, 140, 141, 0.22)', // gray: other
};

// Helper function to get the color from a category key
export const getCategoryColor = (categoryKey, language) => {
  if (!categoryKey) return '#8884d8';

  const normalizedInput = String(categoryKey).trim();
  const resolvedLanguage = typeof language === 'string' ? language : undefined;
  
  // Try outflowCategoryColors first
  if (outflowCategoryColors[normalizedInput]) {
    return outflowCategoryColors[normalizedInput];
  }

  // Try incomeCategoryColors
  if (incomeCategoryColors[normalizedInput]) {
    return incomeCategoryColors[normalizedInput];
  }

  const canonicalOutflowKey = resolveTagKeyFromLocalized(normalizedInput, resolvedLanguage, 'expense');
  const canonicalIncomeKey = resolveTagKeyFromLocalized(normalizedInput, resolvedLanguage, 'income');
  const canonicalKey = canonicalOutflowKey || canonicalIncomeKey;
  
  // Fallback with other possible mappings
  const keyMappings = {
    'food': 'Food',
    'house': 'House',
    'health': 'Health',
    'education': 'Education',
    'tax': 'Tax',
    'shopping': 'Shopping',
    'freetime': 'Free time',
    'travelling': 'Travelling',
    'vehicle': 'Vehicle',
    'digitalservice': 'Digital service',
    'gift': 'Gift',
    'pets': 'Pets',
    'personalproject': 'Personal project',
    'investment': 'Investment',
    'transports': 'Transports',
    'other': 'Other',
    'salary': 'Salary',
    'freelanceincome': 'Freelance income',
    'extraincome': 'Extra income',
    'retirement': 'Retirement',
    'freelance income': 'Freelance income',
    'extra income': 'Extra income',
    'free time': 'Free time',
    'digital service': 'Digital service',
    'personal project': 'Personal project'
  };

  const normalizedNoSpaces = normalizedInput.toLowerCase().replace(/[^a-z0-9]/g, '');
  const canonicalNormalizedNoSpaces = canonicalKey ? canonicalKey.toLowerCase().replace(/[^a-z0-9]/g, '') : null;
  
  const mappedKey =
    (canonicalKey && (keyMappings[canonicalKey.toLowerCase()] || keyMappings[canonicalNormalizedNoSpaces])) ||
    keyMappings[normalizedInput.toLowerCase()] ||
    keyMappings[normalizedNoSpaces] ||
    keyMappings[normalizedInput];

  if (mappedKey && outflowCategoryColors[mappedKey]) {
    return outflowCategoryColors[mappedKey];
  }
  if (mappedKey && incomeCategoryColors[mappedKey]) {
    return incomeCategoryColors[mappedKey];
  }
  
  return outflowCategoryColors['Other'] || '#8884d8';
};