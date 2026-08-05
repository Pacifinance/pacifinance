import type {BrowserPushSubscription} from '../services/notificationService';

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
  return existing || registration.pushManager.subscribe({userVisibleOnly: true, applicationServerKey: decodeVapidKey(publicKey)});
}

export async function disableWebPush(): Promise<string | null> {
  if (!supportsWebPush()) return null;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return null;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  return endpoint;
}
