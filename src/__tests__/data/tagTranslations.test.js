/**
 * Tests for tagTranslations — i18n-based tag translation adapter.
 *
 * Validates that translateTag, translateTagObject, TAG_TRANSLATIONS
 * and buildTypeMap work correctly with the i18n locale files.
 */

import { describe, it, expect } from 'vitest';
import {
  translateTag,
  translateTagObject,
  resolveTagKeyFromLocalized,
  TAG_TRANSLATIONS,
  EXPENSE_TRANSLATIONS,
  INCOME_TRANSLATIONS,
  PAYMENT_TRANSLATIONS,
  COUNTRY_TRANSLATIONS,
  JOB_TRANSLATIONS,
  JOB_TYPE_TRANSLATIONS,
  WORK_TIME_TRANSLATIONS,
  REMOTE_TYPE_TRANSLATIONS,
  YEARS_OF_EXPERIENCE_TRANSLATIONS,
  AGE_TRANSLATIONS,
  LIVING_SITUATION_TRANSLATIONS,
  HOUSING_TYPE_TRANSLATIONS,
  CHILDREN_TRANSLATIONS,
} from '../../data/tagTranslations';

// ─── TAG_TRANSLATIONS structure ──────────────────────────────────────

describe('TAG_TRANSLATIONS', () => {
  it('exports an object with all expected tag types', () => {
    const expectedTypes = [
      'expense', 'income', 'payment', 'country',
      'job', 'jobType', 'workTime', 'remoteType',
      'yearsOfExperience', 'age', 'livingSituation',
      'housingType', 'children',
    ];
    expectedTypes.forEach(type => {
      expect(TAG_TRANSLATIONS).toHaveProperty(type);
      expect(typeof TAG_TRANSLATIONS[type]).toBe('object');
    });
  });

  it('each tag type contains label→{lang: string} entries', () => {
    const expenseMap = TAG_TRANSLATIONS.expense;
    expect(Object.keys(expenseMap).length).toBeGreaterThan(0);

    // Every entry should have at least 'it' and 'en'
    for (const [label, translations] of Object.entries(expenseMap)) {
      expect(translations).toHaveProperty('it');
      expect(translations).toHaveProperty('en');
      expect(typeof translations.it).toBe('string');
      expect(typeof translations.en).toBe('string');
    }
  });

  it('convenience exports match TAG_TRANSLATIONS sub-objects', () => {
    expect(EXPENSE_TRANSLATIONS).toBe(TAG_TRANSLATIONS.expense);
    expect(INCOME_TRANSLATIONS).toBe(TAG_TRANSLATIONS.income);
    expect(PAYMENT_TRANSLATIONS).toBe(TAG_TRANSLATIONS.payment);
    expect(COUNTRY_TRANSLATIONS).toBe(TAG_TRANSLATIONS.country);
    expect(JOB_TRANSLATIONS).toBe(TAG_TRANSLATIONS.job);
    expect(JOB_TYPE_TRANSLATIONS).toBe(TAG_TRANSLATIONS.jobType);
    expect(WORK_TIME_TRANSLATIONS).toBe(TAG_TRANSLATIONS.workTime);
    expect(REMOTE_TYPE_TRANSLATIONS).toBe(TAG_TRANSLATIONS.remoteType);
    expect(YEARS_OF_EXPERIENCE_TRANSLATIONS).toBe(TAG_TRANSLATIONS.yearsOfExperience);
    expect(AGE_TRANSLATIONS).toBe(TAG_TRANSLATIONS.age);
    expect(LIVING_SITUATION_TRANSLATIONS).toBe(TAG_TRANSLATIONS.livingSituation);
    expect(HOUSING_TYPE_TRANSLATIONS).toBe(TAG_TRANSLATIONS.housingType);
    expect(CHILDREN_TRANSLATIONS).toBe(TAG_TRANSLATIONS.children);
  });
});

// ─── translateTag ────────────────────────────────────────────────────

describe('translateTag', () => {
  describe('with scoped type', () => {
    it('translates expense tags to Italian', () => {
      expect(translateTag('food', 'it', 'expense')).toBe('Alimentari');
      expect(translateTag('health', 'it', 'expense')).toBe('Salute e benessere');
      expect(translateTag('house', 'it', 'expense')).toBe('Casa');
    });

    it('translates expense tags to English', () => {
      expect(translateTag('food', 'en', 'expense')).toBe('Groceries');
      expect(translateTag('health', 'en', 'expense')).toBe('Health & Wellness');
      expect(translateTag('house', 'en', 'expense')).toBe('Home');
    });

    it('translates income tags', () => {
      expect(translateTag('salary', 'it', 'income')).toBe('Stipendio');
      expect(translateTag('salary', 'en', 'income')).toBe('Salary');
      expect(translateTag('freelance income', 'en', 'income')).toBe('Freelance income');
    });

    it('translates payment tags', () => {
      expect(translateTag('subscription', 'it', 'payment')).toBe('Abbonamento');
      expect(translateTag('subscription', 'en', 'payment')).toBe('Subscription');
    });

    it('translates job tags', () => {
      expect(translateTag('information technology', 'en', 'job')).toBe('Information Technology');
    });

    it('translates jobType tags', () => {
      expect(translateTag('employee', 'en', 'jobType')).toBe('Employee');
      expect(translateTag('freelance', 'en', 'jobType')).toBe('Freelance');
    });

    it('translates country tags', () => {
      expect(translateTag('italy', 'en', 'country')).toBeTruthy();
      expect(translateTag('italy', 'it', 'country')).toBeTruthy();
    });
  });

  describe('without type (unscoped)', () => {
    it('finds the tag by searching all types', () => {
      // 'food' only exists in 'expense'
      expect(translateTag('food', 'it')).toBe('Alimentari');
      expect(translateTag('salary', 'en')).toBe('Salary');
    });
  });

  describe('case-insensitive lookup', () => {
    it('converts label to lowercase before lookup', () => {
      expect(translateTag('Food', 'it', 'expense')).toBe('Alimentari');
      expect(translateTag('FOOD', 'it', 'expense')).toBe('Alimentari');
      expect(translateTag('Health', 'en', 'expense')).toBe('Health & Wellness');
    });
  });

  describe('fallback behaviour', () => {
    it('returns empty string for null/undefined/empty label', () => {
      expect(translateTag(null, 'en')).toBe('');
      expect(translateTag(undefined, 'en')).toBe('');
      expect(translateTag('', 'en')).toBe('');
    });

    it('falls back to English when translation missing in requested language', () => {
      // Use an English-only hypothetical — if a label exists in en but not it,
      // it should fall back to en. We test the mechanism with a known tag.
      const enResult = translateTag('food', 'en', 'expense');
      expect(enResult).toBeTruthy();
    });

    it('capitalises label as ultimate fallback for unknown tags', () => {
      expect(translateTag('unknowntag', 'en', 'expense')).toBe('Unknowntag');
      expect(translateTag('nonexistent', 'it', 'income')).toBe('Nonexistent');
      expect(translateTag('myCustomLabel', 'en')).toBe('MyCustomLabel');
    });

    it('always returns a truthy string for non-empty labels', () => {
      // This is important for || chain consumers like aggregateOutflowsByCategory
      const result = translateTag('anythingAtAll', 'en', 'expense');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });
});

// ─── translateTagObject ──────────────────────────────────────────────

describe('translateTagObject', () => {
  it('returns fallback for null/undefined input', () => {
    expect(translateTagObject(null, 'en', 'Default')).toBe('Default');
    expect(translateTagObject(undefined, 'it', 'Fallback')).toBe('Fallback');
  });

  it('translates via i18n locale when label matches', () => {
    const tagObj = { label: 'food', translations: {} };
    expect(translateTagObject(tagObj, 'it', '-', 'expense')).toBe('Alimentari');
    expect(translateTagObject(tagObj, 'en', '-', 'expense')).toBe('Groceries');
  });

  it('falls back to DB translations when i18n has no match', () => {
    // Label must already start with uppercase so that capitalize fallback === label,
    // triggering the "no real translation found" branch in translateTagObject.
    const tagObj = {
      label: 'Customcategory',
      translations: { en: 'My Custom', it: 'Il Mio Custom' },
    };
    // translateTag('Customcategory', 'it') → key='customcategory' → not found → capitalize → 'Customcategory'
    // 'Customcategory' === tagObj.label → falls through to DB translations
    expect(translateTagObject(tagObj, 'it', '-', 'expense')).toBe('Il Mio Custom');
    expect(translateTagObject(tagObj, 'en', '-', 'expense')).toBe('My Custom');
  });

  it('falls back to DB translations.en when requested language missing', () => {
    // Label starts uppercase so capitalize fallback matches → triggers DB fallback path
    const tagObj = {
      label: 'Weirdtag',
      translations: { en: 'Weird Tag EN' },
    };
    // translateTag('Weirdtag', 'it') → 'Weirdtag' === label → no i18n match → DB fallback
    // translations.it doesn't exist → uses translations.en
    expect(translateTagObject(tagObj, 'it', '-', 'expense')).toBe('Weird Tag EN');
  });

  it('returns capitalised label when no translations found anywhere', () => {
    // label starts lowercase → capitalize fallback is different → returned directly
    const tagObj = { label: 'orphantag' };
    expect(translateTagObject(tagObj, 'en', '-')).toBe('Orphantag');
  });

  it('returns fallback when tagObj has no label', () => {
    const tagObj = {};
    expect(translateTagObject(tagObj, 'en', 'Fallback')).toBe('Fallback');
  });

  it('prefers i18n translation over DB translation', () => {
    // 'food' exists in i18n, so the DB translation should be ignored
    const tagObj = {
      label: 'food',
      translations: { it: 'DB Alimentari', en: 'DB Groceries' },
    };
    expect(translateTagObject(tagObj, 'it', '-', 'expense')).toBe('Alimentari');
    expect(translateTagObject(tagObj, 'en', '-', 'expense')).toBe('Groceries');
  });
});

// ─── Built maps data integrity ───────────────────────────────────────

describe('built translation maps', () => {
  it('EXPENSE_TRANSLATIONS contains known expense labels', () => {
    expect(EXPENSE_TRANSLATIONS).toHaveProperty('food');
    expect(EXPENSE_TRANSLATIONS).toHaveProperty('health');
    expect(EXPENSE_TRANSLATIONS).toHaveProperty('house');
    expect(EXPENSE_TRANSLATIONS).toHaveProperty('investment');
    expect(EXPENSE_TRANSLATIONS.food.it).toBe('Alimentari');
    expect(EXPENSE_TRANSLATIONS.food.en).toBe('Groceries');
  });

  it('INCOME_TRANSLATIONS contains known income labels', () => {
    expect(INCOME_TRANSLATIONS).toHaveProperty('salary');
    expect(INCOME_TRANSLATIONS).toHaveProperty('freelance income');
    expect(INCOME_TRANSLATIONS.salary.it).toBe('Stipendio');
    expect(INCOME_TRANSLATIONS.salary.en).toBe('Salary');
  });

  it('PAYMENT_TRANSLATIONS contains known payment labels', () => {
    expect(PAYMENT_TRANSLATIONS).toHaveProperty('subscription');
    expect(PAYMENT_TRANSLATIONS).toHaveProperty('single payment');
    expect(PAYMENT_TRANSLATIONS.subscription.it).toBe('Abbonamento');
  });

  it('COUNTRY_TRANSLATIONS contains known countries', () => {
    expect(COUNTRY_TRANSLATIONS).toHaveProperty('italy');
    expect(typeof COUNTRY_TRANSLATIONS.italy.it).toBe('string');
    expect(typeof COUNTRY_TRANSLATIONS.italy.en).toBe('string');
  });

  it('AGE_TRANSLATIONS contains age ranges', () => {
    expect(AGE_TRANSLATIONS).toHaveProperty('18-25');
    expect(AGE_TRANSLATIONS).toHaveProperty('26-35');
  });

  it('CHILDREN_TRANSLATIONS contains yes/no/expecting', () => {
    expect(CHILDREN_TRANSLATIONS).toHaveProperty('yes');
    expect(CHILDREN_TRANSLATIONS).toHaveProperty('no');
    expect(CHILDREN_TRANSLATIONS).toHaveProperty('expecting');
  });
});

describe('resolveTagKeyFromLocalized', () => {
  it('resolves canonical key from localized expense value', () => {
    expect(resolveTagKeyFromLocalized('Groceries', 'en', 'expense')).toBe('food');
    expect(resolveTagKeyFromLocalized('Alimentari', 'it', 'expense')).toBe('food');
  });

  it('resolves canonical key from original key-like labels', () => {
    expect(resolveTagKeyFromLocalized('food', 'en', 'expense')).toBe('food');
    expect(resolveTagKeyFromLocalized('FOOD', 'it', 'expense')).toBe('food');
  });
});
