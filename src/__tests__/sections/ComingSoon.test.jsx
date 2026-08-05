/**
 * Tests for ComingSoon Component
 * Coming soon placeholder component
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import ComingSoon from '../../sections/ComingSoon';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Wrapper component with all required contexts
const TestWrapper = ({ children }) => (
  <LanguageProvider>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </LanguageProvider>
);

describe('ComingSoon Component', () => {
  describe('rendering', () => {
    it('should render the component', () => {
      render(
        <TestWrapper>
          <ComingSoon />
        </TestWrapper>
      );
      
      // Should have the title
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should render the title', () => {
      render(
        <TestWrapper>
          <ComingSoon />
        </TestWrapper>
      );
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveClass('coming-soon-title');
    });

    it('should render the subtitle', () => {
      render(
        <TestWrapper>
          <ComingSoon />
        </TestWrapper>
      );
      
      const subtitle = screen.getByRole('heading', { level: 2 });
      expect(subtitle).toBeInTheDocument();
      expect(subtitle).toHaveClass('coming-soon-subtitle');
    });
  });

  describe('content', () => {
    it('should display coming soon text', () => {
      render(
        <TestWrapper>
          <ComingSoon />
        </TestWrapper>
      );
      
      // The text should be from languages.json - either Italian or English
      const title = screen.getByRole('heading', { level: 1 });
      expect(title.textContent.length).toBeGreaterThan(0);
    });

    it('should display working on it text', () => {
      render(
        <TestWrapper>
          <ComingSoon />
        </TestWrapper>
      );
      
      const subtitle = screen.getByRole('heading', { level: 2 });
      expect(subtitle.textContent.length).toBeGreaterThan(0);
    });
  });

  describe('styling', () => {
    it('should have correct structure', () => {
      render(
        <TestWrapper>
          <ComingSoon />
        </TestWrapper>
      );
      
      const title = screen.getByRole('heading', { level: 1 });
      const subtitle = screen.getByRole('heading', { level: 2 });
      
      // Both should be in the same container
      expect(title.parentElement).toBe(subtitle.parentElement);
    });
  });
});
