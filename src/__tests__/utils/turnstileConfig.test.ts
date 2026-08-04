import {describe, expect, it} from 'vitest';
import {normalizeTurnstileSiteKey} from '../../utils/turnstileConfig';

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
