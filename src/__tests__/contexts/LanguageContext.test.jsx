/**
 * Tests for LanguageContext
 * Language state management and persistence
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageContext, LanguageProvider } from '../../contexts/LanguageContext';

// Test component that uses the context
const TestConsumer = () => {
  const { language, setLanguage, toggleLanguage } = React.useContext(LanguageContext);
  
  return (
    <div>
      <span data-testid="language">{language}</span>
      <button data-testid="toggle" onClick={toggleLanguage}>Toggle</button>
      <button data-testid="set-it" onClick={() => setLanguage('it')}>Set IT</button>
      <button data-testid="set-en" onClick={() => setLanguage('en')}>Set EN</button>
    </div>
  );
};

describe('LanguageContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('LanguageProvider', () => {
    it('should provide default language as "en" when localStorage is empty', () => {
      localStorage.getItem.mockReturnValue(null);
      
      render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      );
      
      expect(screen.getByTestId('language')).toHaveTextContent('en');
    });

    it('should load saved language from localStorage', () => {
      localStorage.getItem.mockReturnValue('it');
      
      render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      );
      
      expect(screen.getByTestId('language')).toHaveTextContent('it');
    });

    it('should save language to localStorage when changed', async () => {
      const user = userEvent.setup();
      localStorage.getItem.mockReturnValue('en');
      
      render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      );
      
      await user.click(screen.getByTestId('set-it'));
      
      expect(localStorage.setItem).toHaveBeenCalledWith('pacifinance-language', 'it');
    });
  });

  describe('toggleLanguage', () => {
    it('should toggle from en to it', async () => {
      const user = userEvent.setup();
      localStorage.getItem.mockReturnValue('en');
      
      render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      );
      
      expect(screen.getByTestId('language')).toHaveTextContent('en');
      
      await user.click(screen.getByTestId('toggle'));
      
      expect(screen.getByTestId('language')).toHaveTextContent('it');
    });

    it('should toggle from it to en', async () => {
      const user = userEvent.setup();
      localStorage.getItem.mockReturnValue('it');
      
      render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      );
      
      expect(screen.getByTestId('language')).toHaveTextContent('it');
      
      await user.click(screen.getByTestId('toggle'));
      
      expect(screen.getByTestId('language')).toHaveTextContent('en');
    });
  });

  describe('setLanguage', () => {
    it('should set language to specified value', async () => {
      const user = userEvent.setup();
      localStorage.getItem.mockReturnValue('en');
      
      render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      );
      
      await user.click(screen.getByTestId('set-it'));
      
      expect(screen.getByTestId('language')).toHaveTextContent('it');
    });

    it('should persist language change to localStorage', async () => {
      const user = userEvent.setup();
      localStorage.getItem.mockReturnValue('en');
      
      render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      );
      
      await user.click(screen.getByTestId('set-it'));
      
      // Should be called twice - once on mount effect, once on setLanguageWithPersistence
      expect(localStorage.setItem).toHaveBeenCalledWith('pacifinance-language', 'it');
    });
  });

  describe('context value', () => {
    it('should provide language string', () => {
      localStorage.getItem.mockReturnValue('en');
      
      let contextValue;
      render(
        <LanguageProvider>
          <LanguageContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </LanguageContext.Consumer>
        </LanguageProvider>
      );
      
      expect(typeof contextValue.language).toBe('string');
    });

    it('should provide setLanguage function', () => {
      localStorage.getItem.mockReturnValue('en');
      
      let contextValue;
      render(
        <LanguageProvider>
          <LanguageContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </LanguageContext.Consumer>
        </LanguageProvider>
      );
      
      expect(typeof contextValue.setLanguage).toBe('function');
    });

    it('should provide toggleLanguage function', () => {
      localStorage.getItem.mockReturnValue('en');
      
      let contextValue;
      render(
        <LanguageProvider>
          <LanguageContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </LanguageContext.Consumer>
        </LanguageProvider>
      );
      
      expect(typeof contextValue.toggleLanguage).toBe('function');
    });
  });
});
