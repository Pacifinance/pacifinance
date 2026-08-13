/** Coarse client platform detection, used to tailor UI hints (e.g. which
 * gesture opens dictation) without any network call. */
export function detectPlatform() {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ios';
  }
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

/** Whether the app is currently running installed (added to home screen /
 * launched as a standalone app) rather than in an ordinary browser tab.
 * `navigator.standalone` is the iOS Safari-specific flag; `display-mode`
 * is the standard media query every other platform (and modern Safari) uses. */
export function isStandalonePwa() {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches === true;
}
