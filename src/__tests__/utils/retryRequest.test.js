import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '../../utils/retryRequest';

describe('withRetry', () => {
  it('returns the result on the first successful attempt without delay', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, { baseDelayMs: 0 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on a network error (no response) and eventually succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce('ok');

    const result = await withRetry(fn, { baseDelayMs: 0 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries on a 5xx response up to the configured limit, then throws', async () => {
    const error = { response: { status: 503 } };
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn, { retries: 2, baseDelayMs: 0 })).rejects.toBe(error);
    expect(fn).toHaveBeenCalledTimes(3); // initial attempt + 2 retries
  });

  it('does not retry a 4xx response (not transient)', async () => {
    const error = { response: { status: 400 } };
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn, { baseDelayMs: 0 })).rejects.toBe(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
