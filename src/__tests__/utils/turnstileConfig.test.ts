import {describe, expect, it} from 'vitest';
import {normalizeTurnstileSiteKey, isTurnstileTestSiteKey} from '../../utils/turnstileConfig';

describe('normalizeTurnstileSiteKey', () => {
  it('returns null for a missing value', () => {
    expect(normalizeTurnstileSiteKey(undefined)).toBeNull();
  });

  it('rejects redacted and placeholder values', () => {
    expect(normalizeTurnstileSiteKey('[SENSITIVE]')).toBeNull();
    expect(normalizeTurnstileSiteKey('your-site-key')).toBeNull();
  });

  it('removes accidental surrounding quotes and whitespace', () => {
    expect(normalizeTurnstileSiteKey('  "0x4AAAA-valid-public-site-key"  ')).toBe('0x4AAAA-valid-public-site-key');
  });

  it('keeps a configured public site key unchanged', () => {
    expect(normalizeTurnstileSiteKey('0x4AAAA-valid-public-site-key')).toBe('0x4AAAA-valid-public-site-key');
  });
});

describe('isTurnstileTestSiteKey', () => {
  it('recognizes all of Cloudflare\'s published test sitekeys', () => {
    expect(isTurnstileTestSiteKey('1x00000000000000000000AA')).toBe(true);
    expect(isTurnstileTestSiteKey('2x00000000000000000000AB')).toBe(true);
    expect(isTurnstileTestSiteKey('1x00000000000000000000BB')).toBe(true);
    expect(isTurnstileTestSiteKey('2x00000000000000000000BB')).toBe(true);
    expect(isTurnstileTestSiteKey('3x00000000000000000000FF')).toBe(true);
  });

  it('rejects a real site key, null, and non-string values', () => {
    expect(isTurnstileTestSiteKey('0x4AAAA-valid-public-site-key')).toBe(false);
    expect(isTurnstileTestSiteKey(null)).toBe(false);
    expect(isTurnstileTestSiteKey(undefined)).toBe(false);
  });
});
