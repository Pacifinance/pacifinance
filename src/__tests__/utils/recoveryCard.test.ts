import {afterEach, describe, expect, it} from 'vitest';
import {buildRecoveryDeepLink, parseRecoveryDeepLink} from '../../utils/recoveryCard';

describe('recovery card deep links', () => {
  const originalUrl = window.location.href;

  afterEach(() => window.history.replaceState({}, '', originalUrl));

  it('targets the localized authentication route and keeps credentials in the fragment', () => {
    window.history.replaceState({}, '', '/it/auth');

    const link = buildRecoveryDeepLink({userId: '354830', base32: 'W57G-3TB6-P9P9-QK5E'});

    expect(link).toBe(`${window.location.origin}/it/auth#recover&id=354830&code=W57G-3TB6-P9P9-QK5E`);
    expect(new URL(link).search).toBe('');
  });

  it('uses the active language and round-trips encoded recovery data', () => {
    window.history.replaceState({}, '', '/pt-BR/auth');

    const link = buildRecoveryDeepLink({userId: 'user + 1', base32: 'CODE/ONE'});

    expect(link).toContain('/pt-BR/auth#recover&');
    expect(parseRecoveryDeepLink(new URL(link).hash)).toEqual({userId: 'user + 1', base32: 'CODE/ONE'});
  });
});
