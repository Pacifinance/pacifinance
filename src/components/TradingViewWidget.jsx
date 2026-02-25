import React, { useEffect, useRef, memo, useState } from 'react';
import styled from 'styled-components';

/* ═══════════════════════════════════════════════════════════════
   TradingView Embed Widget – Generic Wrapper
   
   Renders any TradingView embeddable widget by injecting the
   official TradingView script into a container element.
   
   Free to use with attribution (automatically included).
   Supports: locale, colorTheme, and all official widget options.
   
   Widget types:
   - mini-symbol-overview : compact card with price + mini chart
   - symbol-overview      : larger widget with chart tabs
   - advanced-chart       : full interactive trading chart
   - technical-analysis   : buy/sell/neutral gauge
   - symbol-profile       : company/ETF profile & description
   - market-overview      : multi-symbol list with chart
   ═══════════════════════════════════════════════════════════════ */

const WIDGET_SCRIPTS = {
  'mini-symbol-overview': 'embed-widget-mini-symbol-overview.js',
  'symbol-overview':      'embed-widget-symbol-overview.js',
  'advanced-chart':       'embed-widget-advanced-chart.js',
  'technical-analysis':   'embed-widget-technical-analysis.js',
  'symbol-profile':       'embed-widget-symbol-profile.js',
  'market-overview':      'embed-widget-market-overview.js',
};

/** Preload TradingView CDN connections + a specific widget script */
export function preloadTradingViewScripts(widgetType = 'mini-symbol-overview') {
  if (typeof document === 'undefined') return;

  // Preconnect to TradingView CDN origins (saves DNS + TLS handshake)
  ['https://s3.tradingview.com', 'https://s.tradingview.com'].forEach(origin => {
    if (!document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });

  // Preload the widget JS bundle so it's cached before first widget renders
  const scriptFile = WIDGET_SCRIPTS[widgetType];
  if (scriptFile) {
    const scriptUrl = `https://s3.tradingview.com/external-embedding/${scriptFile}`;
    if (!document.querySelector(`link[rel="preload"][href="${scriptUrl}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = scriptUrl;
      link.as = 'script';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  }
}

/* ─── Styled Container ─── */

const WidgetContainer = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  border-radius: ${p => p.$borderRadius || '0'};
  opacity: ${p => (p.$hidden ? 0 : 1)};
  transition: opacity 0.35s ease;

  /* Ensure TradingView copyright link blends subtly */
  .tradingview-widget-copyright {
    font-size: 0.6rem !important;
    opacity: 0.45;
    text-align: center;
    padding: 0.15rem 0 !important;

    a {
      color: inherit !important;
      text-decoration: none !important;
    }
  }
`;

const LoadingSkeleton = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
  background: ${p => p.$dark
    ? 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 100%)'
    : 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 100%)'
  };
  animation: tvPulse 1.6s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;

  @keyframes tvPulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
`;

/* ═══════════════════════════════════════════════════════════════
   Core Widget Component
   ═══════════════════════════════════════════════════════════════ */

const TradingViewWidget = memo(({
  type,
  config,
  height,
  style,
  className,
  nonInteractive = false,
  borderRadius,
  onReady,
  onError,
  showSkeleton = false,
}) => {
  const containerRef = useRef(null);
  const configStr = JSON.stringify(config);
  const [loaded, setLoaded] = useState(false);
  const readyFiredRef = useRef(false);

  /* ─── Keep callbacks in refs so the main effect never re-runs
         when the parent re-renders with new inline arrow functions ─── */
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !WIDGET_SCRIPTS[type]) return;

    readyFiredRef.current = false;
    setLoaded(false);

    // Clear any previous widget
    container.innerHTML = '';

    // TradingView requires this specific container structure
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    if (height) {
      const h = typeof height === 'number' ? `${height}px` : height;
      widgetDiv.style.height = h;
    }
    container.appendChild(widgetDiv);

    // Create and inject the widget script
    const script = document.createElement('script');
    script.src = `https://s3.tradingview.com/external-embedding/${WIDGET_SCRIPTS[type]}`;
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = configStr;
    container.appendChild(script);

    /* ─── Error-detection state ─── */
    let errorFired = false;
    let secondaryTimer;
    let messageHandler;
    let contentObserver;

    const fireError = () => {
      if (errorFired) return;
      errorFired = true;
      if (messageHandler) window.removeEventListener('message', messageHandler);
      if (contentObserver) contentObserver.disconnect();
      clearTimeout(secondaryTimer);
      onErrorRef.current?.();
    };

    const markReady = () => {
      if (readyFiredRef.current) return;
      readyFiredRef.current = true;
      setLoaded(true);
      onReadyRef.current?.();
    };

    /* ─── Helpers: detect error text in a DOM subtree (outside iframe) ─── */
    const ERROR_PATTERNS = [
      'invalid symbol',
      'only available on tradingview',
      'symbol is not available',
      'non è disponibile',
    ];
    const hasErrorText = (root) => {
      const nodes = root.querySelectorAll
        ? [root, ...root.querySelectorAll('*')]
        : [root];
      for (const el of nodes) {
        if (el.tagName === 'IFRAME' || el.tagName === 'SCRIPT') continue;
        const txt = (el.textContent || '').toLowerCase();
        if (ERROR_PATTERNS.some(p => txt.includes(p))) return true;
      }
      return false;
    };

    /* ─── MutationObserver: wait for iframe creation ─── */
    const observer = new MutationObserver(() => {
      const iframe = container.querySelector('iframe');
      if (iframe) {
        markReady();
        observer.disconnect();

        /* === SECONDARY ERROR DETECTION AFTER IFRAME LOADS === */
        const iframeId = iframe.name || iframe.id || '';

        // A) Listen for postMessage error signals from TradingView
        messageHandler = (event) => {
          if (errorFired) return;
          const origin = event.origin || '';
          if (!origin.includes('tradingview.com')) return;
          let d;
          try {
            d = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          } catch { return; }
          if (iframeId && d?.id && d.id !== iframeId) return;
          const n = String(d?.name || '').toLowerCase();
          const t = String(d?.type || '').toLowerCase();
          if (n.includes('error') || n.includes('no-data') || n.includes('invalid') ||
              t === 'error' || d?.error === true) {
            fireError();
          }
        };
        window.addEventListener('message', messageHandler);

        // B) Keep observing the container for error elements outside the iframe
        contentObserver = new MutationObserver(() => {
          if (errorFired) return;
          if (hasErrorText(container)) fireError();
        });
        contentObserver.observe(container, {
          childList: true,
          subtree: true,
          characterData: true,
        });

        // C) Scheduled check after 5s: inspect accessible attributes + DOM text
        secondaryTimer = setTimeout(() => {
          if (errorFired) return;
          const title = (iframe.getAttribute('title') || '').toLowerCase();
          const ariaLabel = (iframe.getAttribute('aria-label') || '').toLowerCase();
          if ([title, ariaLabel].some(a => ERROR_PATTERNS.some(p => a.includes(p)))) {
            fireError();
            return;
          }
          if (hasErrorText(container)) {
            fireError();
            return;
          }
          // Cleanup — no error detected
          if (messageHandler) window.removeEventListener('message', messageHandler);
          if (contentObserver) contentObserver.disconnect();
        }, 5000);
      }
    });
    observer.observe(container, { childList: true, subtree: true });

    // Fallback timeout: if no iframe after 12s, fire onError
    const timer = setTimeout(() => {
      if (!readyFiredRef.current) {
        observer.disconnect();
        fireError();
      }
    }, 12000);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
      clearTimeout(secondaryTimer);
      if (messageHandler) window.removeEventListener('message', messageHandler);
      if (contentObserver) contentObserver.disconnect();
      if (container) container.innerHTML = '';
    };
    // ⚠️ Only re-run when widget identity changes (type/config/height).
    // Callbacks are accessed via refs — never trigger re-mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, configStr, height]);

  const isDark = config?.colorTheme === 'dark';

  return (
    <WidgetContainer
      $borderRadius={borderRadius}
      $hidden={showSkeleton && !loaded}
      className={className || ''}
      style={{
        ...style,
        ...(nonInteractive ? { pointerEvents: 'none' } : {}),
      }}
    >
      {showSkeleton && !loaded && (
        <LoadingSkeleton $dark={isDark} style={{ minHeight: height || 150 }} />
      )}
      <div
        ref={containerRef}
        className="tradingview-widget-container"
        style={{ width: '100%', minHeight: height || 'auto' }}
      />
    </WidgetContainer>
  );
});

TradingViewWidget.displayName = 'TradingViewWidget';

/* ─── Lazy placeholder ─── */

const LazyPlaceholder = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
`;

/* ═══════════════════════════════════════════════════════════════
   Lazy Wrapper – Uses IntersectionObserver to only render
   widget when it enters the viewport (with 200px margin).
   ═══════════════════════════════════════════════════════════════ */

const LazyTradingViewWidget = memo((props) => {
  const [isVisible, setIsVisible] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!isVisible) {
    return (
      <LazyPlaceholder
        ref={sentinelRef}
        style={{ minHeight: props.height || 150 }}
      />
    );
  }

  return <TradingViewWidget {...props} />;
});

LazyTradingViewWidget.displayName = 'LazyTradingViewWidget';

export default TradingViewWidget;
export { LazyTradingViewWidget };
