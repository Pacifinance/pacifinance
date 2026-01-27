/**
 * Tests for Logo Component
 * Logo display and navigation
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

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

describe('Logo Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('rendering', () => {
    it('should render the logo', () => {
      render(
        <MemoryRouter>
          <LogoPaci />
        </MemoryRouter>
      );
      
      const logo = screen.getByAltText('PaciFinance Logo');
      expect(logo).toBeInTheDocument();
    });

    it('should have correct alt text', () => {
      render(
        <MemoryRouter>
          <LogoPaci />
        </MemoryRouter>
      );
      
      const logo = screen.getByAltText('PaciFinance Logo');
      expect(logo).toHaveAttribute('alt', 'PaciFinance Logo');
    });

    it('should have src attribute', () => {
      render(
        <MemoryRouter>
          <LogoPaci />
        </MemoryRouter>
      );
      
      const logo = screen.getByAltText('PaciFinance Logo');
      expect(logo).toHaveAttribute('src');
    });
  });

  describe('navigation', () => {
    it('should navigate to home on click', () => {
      render(
        <MemoryRouter>
          <LogoPaci />
        </MemoryRouter>
      );
      
      const logo = screen.getByAltText('PaciFinance Logo');
      fireEvent.click(logo.parentElement);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should navigate only once per click', () => {
      render(
        <MemoryRouter>
          <LogoPaci />
        </MemoryRouter>
      );
      
      const logo = screen.getByAltText('PaciFinance Logo');
      fireEvent.click(logo.parentElement);
      
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('styling', () => {
    it('should have cursor pointer on container', () => {
      render(
        <MemoryRouter>
          <LogoPaci />
        </MemoryRouter>
      );
      
      const logo = screen.getByAltText('PaciFinance Logo');
      const container = logo.parentElement;
      
      expect(container).toHaveStyle({ cursor: 'pointer' });
    });
  });

  describe('hover interactions', () => {
    it('should handle mouse enter event', () => {
      render(
        <MemoryRouter>
          <LogoPaci />
        </MemoryRouter>
      );
      
      const logo = screen.getByAltText('PaciFinance Logo');
      const container = logo.parentElement;
      
      // Should not throw on hover
      fireEvent.mouseEnter(container);
    });

    it('should handle mouse leave event', () => {
      render(
        <MemoryRouter>
          <LogoPaci />
        </MemoryRouter>
      );
      
      const logo = screen.getByAltText('PaciFinance Logo');
      const container = logo.parentElement;
      
      // Should not throw on hover leave
      fireEvent.mouseEnter(container);
      fireEvent.mouseLeave(container);
    });
  });
});
