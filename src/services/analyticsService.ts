type AnalyticsValue = string | number | boolean;
type AnalyticsProperties = Record<string, AnalyticsValue | null | undefined>;

interface UmamiClient {
  track: (eventName: string, properties?: Record<string, AnalyticsValue>) => void;
}

interface AnalyticsWindow extends Window {
  umami?: UmamiClient;
}

const SCRIPT_ID = 'pacifinance-umami';
const DEFAULT_SCRIPT_URL = '/stats/script.js';
const DEFAULT_WEBSITE_ID = '0399281d-9359-4537-89bf-e8f441b48836';
const BLOCKED_PROPERTY_NAMES = /(?:^|_)(?:amount|balance|description|email|file|filename|hash|id|name|note|password|price|recovery|ticker|token|username|value|xpub)(?:$|_)/i;

const getAnalyticsWindow = (): AnalyticsWindow | null =>
  typeof window === 'undefined' ? null : (window as AnalyticsWindow);

export const hasAnalyticsConsent = (): boolean => {
  if (typeof localStorage === 'undefined') return false;
  try {
    const saved = JSON.parse(localStorage.getItem('cookieConsent') ?? 'null') as {
      preferences?: { analytics?: boolean };
    } | null;
    return saved?.preferences?.analytics === true;
  } catch {
    return false;
  }
};

export const sanitizeAnalyticsProperties = (
  properties: AnalyticsProperties = {},
): Record<string, AnalyticsValue> => Object.fromEntries(
  Object.entries(properties).filter(
    (entry): entry is [string, AnalyticsValue] =>
      !BLOCKED_PROPERTY_NAMES.test(entry[0])
      && ['string', 'number', 'boolean'].includes(typeof entry[1])
      && (typeof entry[1] !== 'string' || entry[1].length <= 80),
  ),
);

export const initializeAnalytics = (): Promise<boolean> => {
  const analyticsWindow = getAnalyticsWindow();
  if (!analyticsWindow || !hasAnalyticsConsent()) return Promise.resolve(false);
  if (analyticsWindow.umami) return Promise.resolve(true);

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener('load', () => resolve(Boolean(analyticsWindow.umami)), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
    });
  }

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.defer = true;
  script.src = import.meta.env.VITE_UMAMI_SCRIPT_URL || DEFAULT_SCRIPT_URL;
  script.dataset.websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID || DEFAULT_WEBSITE_ID;
  document.head.appendChild(script);

  return new Promise((resolve) => {
    script.addEventListener('load', () => resolve(Boolean(analyticsWindow.umami)), { once: true });
    script.addEventListener('error', () => resolve(false), { once: true });
  });
};

export const trackAnalyticsEvent = (
  eventName: string,
  properties?: AnalyticsProperties,
): void => {
  if (!hasAnalyticsConsent()) return;
  getAnalyticsWindow()?.umami?.track(eventName, sanitizeAnalyticsProperties(properties));
};

export const countBucket = (count: number): string => {
  if (count <= 0) return '0';
  if (count === 1) return '1';
  if (count <= 5) return '2-5';
  if (count <= 20) return '6-20';
  if (count <= 100) return '21-100';
  return '100+';
};
