/**
 * Tests for LocalizedLink Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { LocalizedLink } from '../../components/LocalizedLink';
import { LanguageContext } from '../../contexts/LanguageContext';

// Mock context provider
const MockLanguageProvider = ({ language = 'en', children }) => {
  const value = {
    language,
    translations: {},
    setLanguage: vi.fn(),
    toggleLanguage: vi.fn()
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

describe('LocalizedLink', () => {
  it('should render link with language prefix', () => {
    render(
      <BrowserRouter>
        <MockLanguageProvider language="it">
          <LocalizedLink to="/dashboard">Dashboard</LocalizedLink>
        </MockLanguageProvider>
      </BrowserRouter>
    );

    const link = screen.getByText('Dashboard');
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('/it/dashboard');
  });

  it('should handle different languages', () => {
    render(
      <BrowserRouter>
        <MockLanguageProvider language="en">
          <LocalizedLink to="/profile">Profile</LocalizedLink>
        </MockLanguageProvider>
      </BrowserRouter>
    );

    const link = screen.getByText('Profile');
    expect(link.getAttribute('href')).toBe('/en/profile');
  });

  it('should preserve query strings', () => {
    render(
      <BrowserRouter>
        <MockLanguageProvider language="it">
          <LocalizedLink to="/insert-values?section=balance">Insert</LocalizedLink>
        </MockLanguageProvider>
      </BrowserRouter>
    );

    const link = screen.getByText('Insert');
    expect(link.getAttribute('href')).toBe('/it/insert-values?section=balance');
  });

  it('should pass through additional props', () => {
    render(
      <BrowserRouter>
        <MockLanguageProvider language="en">
          <LocalizedLink 
            to="/dashboard" 
            className="custom-class"
            data-testid="custom-link"
          >
            Dashboard
          </LocalizedLink>
        </MockLanguageProvider>
      </BrowserRouter>
    );

    const link = screen.getByTestId('custom-link');
    expect(link).toHaveClass('custom-class');
  });
});
