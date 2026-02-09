/**
 * Tests for useScrollNavigation Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Mock useLocalizedNavigate
const mockNavigate = vi.fn();
vi.mock('../../hooks/useLocalizedNavigate', () => ({
  useLocalizedNavigate: () => mockNavigate,
}));

// Import after mocks
import { useScrollNavigation } from '../../hooks/useScrollNavigation';

const wrapper = ({ children, initialRoute = '/it/dashboard' }) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    {children}
  </MemoryRouter>
);

const createWrapper = (initialRoute = '/it/dashboard') => {
  return ({ children }) => wrapper({ children, initialRoute });
};

describe('useScrollNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock document height
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useScrollNavigation(true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isNavigating).toBe(false);
    expect(result.current.showTriggerZone).toBe(false);
    expect(result.current.triggerDirection).toBeNull();
    expect(result.current.triggerProgress).toBe(0);
    expect(result.current.isAutoScrolling).toBe(false);
  });

  it('should return correct currentPageIndex for /dashboard', () => {
    const { result } = renderHook(() => useScrollNavigation(true), {
      wrapper: createWrapper('/it/dashboard'),
    });

    expect(result.current.currentPageIndex).toBe(0);
  });

  it('should return correct currentPageIndex for /charts-statistics', () => {
    const { result } = renderHook(() => useScrollNavigation(true), {
      wrapper: createWrapper('/it/charts-statistics'),
    });

    expect(result.current.currentPageIndex).toBe(1);
  });

  it('should return correct currentPageIndex for /insert-values', () => {
    const { result } = renderHook(() => useScrollNavigation(true), {
      wrapper: createWrapper('/it/insert-values'),
    });

    expect(result.current.currentPageIndex).toBe(2);
  });

  it('should return correct currentPageIndex for /comparison', () => {
    const { result } = renderHook(() => useScrollNavigation(true), {
      wrapper: createWrapper('/it/comparison'),
    });

    expect(result.current.currentPageIndex).toBe(3);
  });

  it('should return -1 for pages not in the cycle', () => {
    const { result } = renderHook(() => useScrollNavigation(true), {
      wrapper: createWrapper('/it/profile'),
    });

    expect(result.current.currentPageIndex).toBe(-1);
  });

  it('should return totalPages as 4', () => {
    const { result } = renderHook(() => useScrollNavigation(true), {
      wrapper: createWrapper(),
    });

    expect(result.current.totalPages).toBe(4);
  });

  it('should be disabled when enabled=false', () => {
    const { result } = renderHook(() => useScrollNavigation(false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isScrollNavigationEnabled).toBe(false);
  });

  it('should have cancelTrigger and dismissTrigger functions', () => {
    const { result } = renderHook(() => useScrollNavigation(true), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.cancelTrigger).toBe('function');
    expect(typeof result.current.dismissTrigger).toBe('function');
    expect(typeof result.current.navigateManually).toBe('function');
  });

  it('should reset trigger zone on cancelTrigger call', () => {
    const { result } = renderHook(() => useScrollNavigation(true), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.cancelTrigger();
    });

    expect(result.current.showTriggerZone).toBe(false);
    expect(result.current.triggerDirection).toBeNull();
    expect(result.current.triggerProgress).toBe(0);
  });

  it('should handle language-prefixed paths correctly', () => {
    // Test with Italian prefix
    const { result: itResult } = renderHook(() => useScrollNavigation(true), {
      wrapper: createWrapper('/it/dashboard'),
    });
    expect(itResult.current.currentPageIndex).toBe(0);

    // Test with English prefix
    const { result: enResult } = renderHook(() => useScrollNavigation(true), {
      wrapper: createWrapper('/en/dashboard'),
    });
    expect(enResult.current.currentPageIndex).toBe(0);
  });
});
