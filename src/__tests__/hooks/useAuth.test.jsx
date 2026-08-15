/**
 * useAuth Hook Tests
 *
 * Validates the unified auth hook that automatically selects
 * the correct provider (MockAuth in dev, UserContext in prod, fallback).
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';
import { UserContext } from '../../contexts/UserContext';
import MockAuthContext from '../../contexts/MockAuthContext';

describe('useAuth', () => {
  it('should return fallback values when no provider is present', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.userData).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.handleSetIsAuthenticated).toBe('function');
    expect(typeof result.current.handleSetIsUpdated).toBe('function');
    expect(typeof result.current.setUserData).toBe('function');
  });

  it('should return UserContext values when UserProvider is present', () => {
    const mockContextValue = {
      isAuthenticated: true,
      userData: { userId: 'from-user-context' },
      isLoading: false,
      isUpdated: true,
      handleSetIsAuthenticated: vi.fn(),
      handleSetIsUpdated: vi.fn(),
      setUserData: vi.fn(),
      error: null,
      retryFetch: vi.fn(),
    };

    const wrapper = ({ children }) => (
      <UserContext.Provider value={mockContextValue}>
        {children}
      </UserContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.userData?.userId).toBe('from-user-context');
  });

  it('should return MockAuthContext in development mode', () => {
    // Simulate dev mode
    vi.stubEnv('DEV', true);
    localStorage.getItem.mockImplementation((key) =>
      key === 'pacifinance-dev-mode' ? 'true' : null
    );

    const mockAuth = {
      isAuthenticated: true,
      userData: { userId: 'mock-user' },
      isLoading: false,
      handleSetIsAuthenticated: vi.fn(),
      handleSetIsUpdated: vi.fn(),
      setUserData: vi.fn(),
    };

    const wrapper = ({ children }) => (
      <MockAuthContext.Provider value={mockAuth}>
        {children}
      </MockAuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.userData?.userId).toBe('mock-user');

    // Restore
    vi.unstubAllEnvs();
  });

  it('fallback handleSetIsAuthenticated should be a no-op', () => {
    const { result } = renderHook(() => useAuth());
    // Should not throw
    expect(() => result.current.handleSetIsAuthenticated(true)).not.toThrow();
    expect(() => result.current.handleSetIsUpdated(false)).not.toThrow();
    expect(() => result.current.setUserData({})).not.toThrow();
  });

  it('should prefer UserContext over fallback when available', () => {
    const userCtx = {
      isAuthenticated: false,
      userData: null,
      isLoading: false,
      isUpdated: false,
      handleSetIsAuthenticated: vi.fn(),
      handleSetIsUpdated: vi.fn(),
      setUserData: vi.fn(),
      error: null,
      retryFetch: vi.fn(),
    };

    const wrapper = ({ children }) => (
      <UserContext.Provider value={userCtx}>
        {children}
      </UserContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    // Should get the real context (with retryFetch) rather than fallback
    expect(result.current).toHaveProperty('retryFetch');
    expect(result.current.retryFetch).toBe(userCtx.retryFetch);
  });
});
