import {beforeEach, describe, expect, it, vi} from 'vitest';
import {enableWebPush} from '../../utils/pushNotifications';

const publicKey = `B${'A'.repeat(86)}`;

const installBrowserMocks = (existing: PushSubscription | null, subscribe: ReturnType<typeof vi.fn>) => {
  Object.defineProperty(window, 'Notification', {
    configurable: true,
    value: {requestPermission: vi.fn().mockResolvedValue('granted')},
  });
  Object.defineProperty(window, 'PushManager', {configurable: true, value: class PushManager {}});
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: {ready: Promise.resolve({pushManager: {getSubscription: vi.fn().mockResolvedValue(existing), subscribe}})},
  });
};

describe('enableWebPush', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
  });

  it('keeps an existing subscription when an older installation has no recorded VAPID key', async () => {
    const existing = {unsubscribe: vi.fn()} as unknown as PushSubscription;
    const subscribe = vi.fn();
    installBrowserMocks(existing, subscribe);

    await expect(enableWebPush(publicKey)).resolves.toBe(existing);
    expect(subscribe).not.toHaveBeenCalled();
    expect(existing.unsubscribe).not.toHaveBeenCalled();
  });

  it('replaces a subscription when the recorded VAPID key changed', async () => {
    const existing = {unsubscribe: vi.fn().mockResolvedValue(true)} as unknown as PushSubscription;
    const replacement = {} as PushSubscription;
    const subscribe = vi.fn().mockResolvedValue(replacement);
    vi.mocked(localStorage.getItem).mockReturnValue('old-key');
    installBrowserMocks(existing, subscribe);

    await expect(enableWebPush(publicKey)).resolves.toBe(replacement);
    expect(existing.unsubscribe).toHaveBeenCalledOnce();
    expect(subscribe).toHaveBeenCalledOnce();
    expect(localStorage.setItem).toHaveBeenCalledWith('pacifinance_push_public_key', publicKey);
  });
});
