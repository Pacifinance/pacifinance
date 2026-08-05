import type {BrowserPushSubscription} from '../services/notificationService';

const PUSH_PUBLIC_KEY_STORAGE = 'pacifinance_push_public_key';

const decodeVapidKey = (value: string): Uint8Array => {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const decoded = atob((value + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
};

export const supportsWebPush = () => typeof window !== 'undefined'
  && 'Notification' in window
  && 'serviceWorker' in navigator
  && 'PushManager' in window;

export const serializePushSubscription = (subscription: PushSubscription): BrowserPushSubscription => {
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) throw new Error('Invalid push subscription');
  return {endpoint: json.endpoint, keys: {p256dh: json.keys.p256dh, auth: json.keys.auth}};
};

export async function enableWebPush(publicKey: string): Promise<PushSubscription> {
  if (!supportsWebPush() || !publicKey) throw new Error('Push notifications are unavailable');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission denied');
  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  let previousPublicKey: string | null = null;
  try { previousPublicKey = localStorage.getItem(PUSH_PUBLIC_KEY_STORAGE); } catch { /* storage can be disabled */ }

  // A valid browser subscription is reusable and must be sent to the API again:
  // deleting it on every click can leave permission granted but no subscription
  // when subscribe() subsequently fails. Only replace it when we know the VAPID
  // key changed; older installations have no stored key, so preserving their
  // working subscription is the safe migration path.
  if (existing && (!previousPublicKey || previousPublicKey === publicKey)) return existing;
  if (existing) {
    const removed = await existing.unsubscribe();
    if (!removed) throw new Error('Existing push subscription could not be replaced');
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: decodeVapidKey(publicKey.trim()),
  });
  try { localStorage.setItem(PUSH_PUBLIC_KEY_STORAGE, publicKey); } catch { /* storage can be disabled */ }
  return subscription;
}

export async function disableWebPush(): Promise<string | null> {
  if (!supportsWebPush()) return null;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return null;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  try { localStorage.removeItem(PUSH_PUBLIC_KEY_STORAGE); } catch { /* storage can be disabled */ }
  return endpoint;
}
