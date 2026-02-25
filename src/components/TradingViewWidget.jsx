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

/* ─── Styled Container ─── */

const WidgetContainer = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  border-radius: ${p => p.$borderRadius || '0'};

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
}) => {
  const containerRef = useRef(null);
  const configStr = JSON.stringify(config);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !WIDGET_SCRIPTS[type]) return;

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

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [type, configStr, height]);

  return (
    <WidgetContainer
      $borderRadius={borderRadius}
      className={className || ''}
      style={{
        ...style,
        ...(nonInteractive ? { pointerEvents: 'none' } : {}),
      }}
    >
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
