/**
 * Tests for useLocalizedNavigate Hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { LanguageContext } from '../../contexts/LanguageContext';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock context provider wrapper
const createWrapper = (language = 'en') => {
  return ({ children }) => {
    const value = {
      language,
      translations: {},
      setLanguage: vi.fn(),
      toggleLanguage: vi.fn()
    };

    return (
      <BrowserRouter>
        <LanguageContext.Provider value={value}>
          {children}
        </LanguageContext.Provider>
      </BrowserRouter>
    );
  };
};

describe('useLocalizedNavigate', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should add language prefix to navigation path', () => {
    const { result } = renderHook(() => useLocalizedNavigate(), {
      wrapper: createWrapper('it')
    });

    result.current('/dashboard');
    expect(mockNavigate).toHaveBeenCalledWith('/it/dashboard', undefined);
  });

  it('should handle different languages', () => {
    const { result } = renderHook(() => useLocalizedNavigate(), {
      wrapper: createWrapper('en')
    });

    result.current('/profile');
    expect(mockNavigate).toHaveBeenCalledWith('/en/profile', undefined);
  });

  it('should preserve query strings', () => {
    const { result } = renderHook(() => useLocalizedNavigate(), {
      wrapper: createWrapper('it')
    });

    result.current('/insert-values?section=balance');
    expect(mockNavigate).toHaveBeenCalledWith('/it/insert-values?section=balance', undefined);
  });

  it('should pass through navigation options', () => {
    const { result } = renderHook(() => useLocalizedNavigate(), {
      wrapper: createWrapper('it')
    });

    const options = { replace: true, state: { from: 'home' } };
    result.current('/dashboard', options);
    expect(mockNavigate).toHaveBeenCalledWith('/it/dashboard', options);
  });

  it('should handle numeric values (back navigation)', () => {
    const { result } = renderHook(() => useLocalizedNavigate(), {
      wrapper: createWrapper('it')
    });

    result.current(-1);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
