/**
 * Tests for MediaQueryContext
 * Responsive breakpoint management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import { MediaQueryContext, MediaQueryProvider } from '../../contexts/MediaQueryContext';

// Mock react-responsive
vi.mock('react-responsive', () => ({
  useMediaQuery: vi.fn()
}));

import { useMediaQuery } from 'react-responsive';

// Test component that uses the context
const TestConsumer = () => {
  const { isDesktopOrLaptop, isBigScreen, isTabletScreen, isMobileScreen, isPortrait, isRetina } = useContext(MediaQueryContext);
  
  return (
    <div>
      <span data-testid="desktop">{isDesktopOrLaptop ? 'desktop' : 'not-desktop'}</span>
      <span data-testid="big-screen">{isBigScreen ? 'big' : 'not-big'}</span>
      <span data-testid="tablet">{isTabletScreen ? 'tablet' : 'not-tablet'}</span>
      <span data-testid="mobile">{isMobileScreen ? 'mobile' : 'not-mobile'}</span>
      <span data-testid="portrait">{isPortrait ? 'portrait' : 'landscape'}</span>
      <span data-testid="retina">{isRetina ? 'retina' : 'not-retina'}</span>
    </div>
  );
};

describe('MediaQueryContext', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Context default values', () => {
    it('should have default values when no provider', () => {
      render(
        <MediaQueryContext.Consumer>
          {(value) => (
            <div>
              <span data-testid="default-desktop">{value.isDesktopOrLaptop ? 'true' : 'false'}</span>
              <span data-testid="default-mobile">{value.isMobile ? 'true' : 'false'}</span>
            </div>
          )}
        </MediaQueryContext.Consumer>
      );
      
      // Default values should be false
      expect(screen.getByTestId('default-desktop')).toHaveTextContent('false');
      expect(screen.getByTestId('default-mobile')).toHaveTextContent('false');
    });
  });

  describe('MediaQueryProvider - Desktop view', () => {
    it('should detect desktop correctly', () => {
      useMediaQuery.mockImplementation(({ query }) => {
        if (query.includes('min-width: 1224px')) return true;
        if (query.includes('max-width: 1224px')) return false;
        if (query.includes('max-width: 839px')) return false;
        return false;
      });

      render(
        <MediaQueryProvider>
          <TestConsumer />
        </MediaQueryProvider>
      );
      
      expect(screen.getByTestId('desktop')).toHaveTextContent('desktop');
      expect(screen.getByTestId('tablet')).toHaveTextContent('not-tablet');
      expect(screen.getByTestId('mobile')).toHaveTextContent('not-mobile');
    });
  });

  describe('MediaQueryProvider - Tablet view', () => {
    it('should detect tablet correctly', () => {
      useMediaQuery.mockImplementation(({ query }) => {
        if (query.includes('min-width: 1224px')) return false;
        if (query.includes('max-width: 1224px')) return true;
        if (query.includes('max-width: 839px')) return false;
        return false;
      });

      render(
        <MediaQueryProvider>
          <TestConsumer />
        </MediaQueryProvider>
      );
      
      expect(screen.getByTestId('desktop')).toHaveTextContent('not-desktop');
      expect(screen.getByTestId('tablet')).toHaveTextContent('tablet');
      expect(screen.getByTestId('mobile')).toHaveTextContent('not-mobile');
    });
  });

  describe('MediaQueryProvider - Mobile view', () => {
    it('should detect mobile correctly', () => {
      useMediaQuery.mockImplementation(({ query }) => {
        if (query.includes('min-width: 1224px')) return false;
        if (query.includes('max-width: 1224px')) return true;
        if (query.includes('max-width: 839px')) return true;
        return false;
      });

      render(
        <MediaQueryProvider>
          <TestConsumer />
        </MediaQueryProvider>
      );
      
      expect(screen.getByTestId('desktop')).toHaveTextContent('not-desktop');
      expect(screen.getByTestId('tablet')).toHaveTextContent('tablet');
      expect(screen.getByTestId('mobile')).toHaveTextContent('mobile');
    });
  });

  describe('MediaQueryProvider - Big screen', () => {
    it('should detect big screen correctly', () => {
      useMediaQuery.mockImplementation(({ query }) => {
        if (query.includes('min-width: 1824px')) return true;
        if (query.includes('min-width: 1224px')) return true;
        return false;
      });

      render(
        <MediaQueryProvider>
          <TestConsumer />
        </MediaQueryProvider>
      );
      
      expect(screen.getByTestId('big-screen')).toHaveTextContent('big');
    });
  });

  describe('MediaQueryProvider - Portrait orientation', () => {
    it('should detect portrait orientation', () => {
      useMediaQuery.mockImplementation(({ query }) => {
        if (query.includes('orientation: portrait')) return true;
        return false;
      });

      render(
        <MediaQueryProvider>
          <TestConsumer />
        </MediaQueryProvider>
      );
      
      expect(screen.getByTestId('portrait')).toHaveTextContent('portrait');
    });

    it('should detect landscape orientation', () => {
      useMediaQuery.mockImplementation(({ query }) => {
        if (query.includes('orientation: portrait')) return false;
        return false;
      });

      render(
        <MediaQueryProvider>
          <TestConsumer />
        </MediaQueryProvider>
      );
      
      expect(screen.getByTestId('portrait')).toHaveTextContent('landscape');
    });
  });

  describe('MediaQueryProvider - Retina display', () => {
    it('should detect retina display', () => {
      useMediaQuery.mockImplementation(({ query }) => {
        if (query.includes('min-resolution: 2dppx')) return true;
        return false;
      });

      render(
        <MediaQueryProvider>
          <TestConsumer />
        </MediaQueryProvider>
      );
      
      expect(screen.getByTestId('retina')).toHaveTextContent('retina');
    });

    it('should detect non-retina display', () => {
      useMediaQuery.mockImplementation(({ query }) => {
        if (query.includes('min-resolution: 2dppx')) return false;
        return false;
      });

      render(
        <MediaQueryProvider>
          <TestConsumer />
        </MediaQueryProvider>
      );
      
      expect(screen.getByTestId('retina')).toHaveTextContent('not-retina');
    });
  });

  describe('MediaQueryProvider - Multiple breakpoints', () => {
    it('should correctly handle all breakpoints for typical desktop', () => {
      useMediaQuery.mockImplementation(({ query }) => {
        if (query.includes('min-width: 1824px')) return false;
        if (query.includes('min-width: 1224px')) return true;
        if (query.includes('max-width: 1224px')) return false;
        if (query.includes('max-width: 839px')) return false;
        if (query.includes('orientation: portrait')) return false;
        if (query.includes('min-resolution: 2dppx')) return true;
        return false;
      });

      render(
        <MediaQueryProvider>
          <TestConsumer />
        </MediaQueryProvider>
      );
      
      expect(screen.getByTestId('desktop')).toHaveTextContent('desktop');
      expect(screen.getByTestId('big-screen')).toHaveTextContent('not-big');
      expect(screen.getByTestId('tablet')).toHaveTextContent('not-tablet');
      expect(screen.getByTestId('mobile')).toHaveTextContent('not-mobile');
      expect(screen.getByTestId('portrait')).toHaveTextContent('landscape');
      expect(screen.getByTestId('retina')).toHaveTextContent('retina');
    });

    it('should correctly handle all breakpoints for mobile portrait', () => {
      useMediaQuery.mockImplementation(({ query }) => {
        if (query.includes('min-width: 1824px')) return false;
        if (query.includes('min-width: 1224px')) return false;
        if (query.includes('max-width: 1224px')) return true;
        if (query.includes('max-width: 839px')) return true;
        if (query.includes('orientation: portrait')) return true;
        if (query.includes('min-resolution: 2dppx')) return true;
        return false;
      });

      render(
        <MediaQueryProvider>
          <TestConsumer />
        </MediaQueryProvider>
      );
      
      expect(screen.getByTestId('desktop')).toHaveTextContent('not-desktop');
      expect(screen.getByTestId('big-screen')).toHaveTextContent('not-big');
      expect(screen.getByTestId('tablet')).toHaveTextContent('tablet');
      expect(screen.getByTestId('mobile')).toHaveTextContent('mobile');
      expect(screen.getByTestId('portrait')).toHaveTextContent('portrait');
      expect(screen.getByTestId('retina')).toHaveTextContent('retina');
    });
  });
});
