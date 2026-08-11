/**
 * Tests for Logo Component
 * Logo display and navigation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { LanguageContext } from '../../contexts/LanguageContext';

// Mock the navigate function
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock the logo image
vi.mock('../assets/Brand/PacifinanceLogoPNG3NoBg.webp', () => ({
  default: 'mock-logo.webp'
}));

import LogoPaci from '../../components/Logo';

// Wrapper with LanguageContext
const Wrapper = ({ children }) => {
  const value = {
    language: 'en',
    translations: {},
    setLanguage: vi.fn(),
    toggleLanguage: vi.fn()
  };

  return (
    <MemoryRouter>
      <LanguageContext.Provider value={value}>
        {children}
      </LanguageContext.Provider>
    </MemoryRouter>
  );
};

describe('Logo Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('rendering', () => {
    it('should render the logo', () => {
      render(<LogoPaci />, { wrapper: Wrapper });
      
      const logo = screen.getByAltText('Pacifinance Logo');
      expect(logo).toBeInTheDocument();
    });

    it('should have correct alt text', () => {
      render(<LogoPaci />, { wrapper: Wrapper });
      
      const logo = screen.getByAltText('Pacifinance Logo');
      expect(logo).toHaveAttribute('alt', 'Pacifinance Logo');
    });

    it('should have src attribute', () => {
      render(<LogoPaci />, { wrapper: Wrapper });
      
      const logo = screen.getByAltText('Pacifinance Logo');
      expect(logo).toHaveAttribute('src');
    });
  });

  describe('navigation', () => {
    it('should navigate to home on click', () => {
      render(<LogoPaci />, { wrapper: Wrapper });
      
      const logo = screen.getByAltText('Pacifinance Logo');
      fireEvent.click(logo.parentElement);
      
      expect(mockNavigate).toHaveBeenCalledWith('/en', undefined);
    });

    it('should navigate only once per click', () => {
      render(<LogoPaci />, { wrapper: Wrapper });
      
      const logo = screen.getByAltText('Pacifinance Logo');
      fireEvent.click(logo.parentElement);
      
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('styling', () => {
    it('should have cursor pointer on container', () => {
      render(<LogoPaci />, { wrapper: Wrapper });
      
      const logo = screen.getByAltText('Pacifinance Logo');
      const container = logo.parentElement;
      
      expect(container).toHaveStyle({ cursor: 'pointer' });
    });
  });

  describe('hover interactions', () => {
    it('should handle mouse enter event', () => {
      render(<LogoPaci />, { wrapper: Wrapper });
      
      const logo = screen.getByAltText('Pacifinance Logo');
      const container = logo.parentElement;
      
      // Should not throw on hover
      fireEvent.mouseEnter(container);
    });

    it('should handle mouse leave event', () => {
      render(<LogoPaci />, { wrapper: Wrapper });
      
      const logo = screen.getByAltText('Pacifinance Logo');
      const container = logo.parentElement;
      
      // Should not throw on hover leave
      fireEvent.mouseEnter(container);
      fireEvent.mouseLeave(container);
    });
  });
});
