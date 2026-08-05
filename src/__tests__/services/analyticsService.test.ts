import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  countBucket,
  hasAnalyticsConsent,
  initializeAnalytics,
  sanitizeAnalyticsProperties,
  trackAnalyticsEvent,
} from '../../services/analyticsService';

describe('analyticsService', () => {
  beforeEach(() => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    document.getElementById('pacifinance-umami')?.remove();
    delete (window as typeof window & { umami?: unknown }).umami;
  });

  it('defaults to no consent for missing or malformed preferences', () => {
    expect(hasAnalyticsConsent()).toBe(false);
    vi.mocked(localStorage.getItem).mockReturnValue('{invalid');
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('recognizes explicit analytics consent', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify({ preferences: { analytics: true } }));
    expect(hasAnalyticsConsent()).toBe(true);
  });

  it('drops sensitive, unsupported, and overly long event properties', () => {
    expect(sanitizeAnalyticsProperties({
      method: 'password',
      success: true,
      rows: 12,
      amount: 500,
      ticker: 'BTC',
      custom: 'x'.repeat(81),
      empty: null,
    })).toEqual({ method: 'password', success: true, rows: 12 });
  });

  it('does not track without analytics consent', () => {
    const track = vi.fn();
    (window as typeof window & { umami?: { track: typeof track } }).umami = { track };
    trackAnalyticsEvent('auth-sign-in-succeeded', { method: 'password' });
    expect(track).not.toHaveBeenCalled();
  });

  it('tracks sanitized properties after consent', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify({ preferences: { analytics: true } }));
    const track = vi.fn();
    (window as typeof window & { umami?: { track: typeof track } }).umami = { track };
    trackAnalyticsEvent('auth-sign-in-succeeded', { method: 'password', user_id: 'secret' });
    expect(track).toHaveBeenCalledWith('auth-sign-in-succeeded', { method: 'password' });
  });

  it('does not inject the tracker before consent', async () => {
    await expect(initializeAnalytics()).resolves.toBe(false);
    expect(document.getElementById('pacifinance-umami')).toBeNull();
  });

  it.each([
    [-1, '0'], [1, '1'], [5, '2-5'], [20, '6-20'], [100, '21-100'], [101, '100+'],
  ])('buckets %i as %s', (count, expected) => {
    expect(countBucket(count)).toBe(expected);
  });
});
