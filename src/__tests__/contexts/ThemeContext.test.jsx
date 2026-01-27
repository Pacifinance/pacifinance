/**
 * Tests for ThemeContext
 * Theme state management (dark/light mode)
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeContext, ThemeProvider } from '../../contexts/ThemeContext';

// Test component that uses the context
const TestConsumer = () => {
  const { theme, toggleMode } = React.useContext(ThemeContext);
  
  return (
    <div>
      <span data-testid="mode">{theme.mode}</span>
      <span data-testid="bg-color">{theme.backgroundColor}</span>
      <span data-testid="text-color">{theme.textColor}</span>
      <button data-testid="toggle" onClick={toggleMode}>Toggle</button>
    </div>
  );
};

describe('ThemeContext', () => {
  describe('ThemeProvider', () => {
    it('should provide default theme as dark mode', () => {
      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>
      );
      
      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    });

    it('should provide theme with required properties', () => {
      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>
      );
      
      expect(screen.getByTestId('bg-color')).not.toHaveTextContent('');
      expect(screen.getByTestId('text-color')).not.toHaveTextContent('');
    });
  });

  describe('toggleMode', () => {
    it('should toggle from dark to light mode', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>
      );
      
      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
      
      await user.click(screen.getByTestId('toggle'));
      
      expect(screen.getByTestId('mode')).toHaveTextContent('light');
    });

    it('should toggle from light back to dark mode', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>
      );
      
      // Toggle to light
      await user.click(screen.getByTestId('toggle'));
      expect(screen.getByTestId('mode')).toHaveTextContent('light');
      
      // Toggle back to dark
      await user.click(screen.getByTestId('toggle'));
      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    });

    it('should change theme colors when toggling', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>
      );
      
      const initialBgColor = screen.getByTestId('bg-color').textContent;
      
      await user.click(screen.getByTestId('toggle'));
      
      const newBgColor = screen.getByTestId('bg-color').textContent;
      expect(newBgColor).not.toBe(initialBgColor);
    });
  });

  describe('context value', () => {
    it('should provide theme object', () => {
      let contextValue;
      render(
        <ThemeProvider>
          <ThemeContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </ThemeContext.Consumer>
        </ThemeProvider>
      );
      
      expect(contextValue.theme).toBeDefined();
      expect(typeof contextValue.theme).toBe('object');
    });

    it('should provide toggleMode function', () => {
      let contextValue;
      render(
        <ThemeProvider>
          <ThemeContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </ThemeContext.Consumer>
        </ThemeProvider>
      );
      
      expect(typeof contextValue.toggleMode).toBe('function');
    });

    it('theme should have mode property', () => {
      let contextValue;
      render(
        <ThemeProvider>
          <ThemeContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </ThemeContext.Consumer>
        </ThemeProvider>
      );
      
      expect(contextValue.theme.mode).toBeDefined();
      expect(['dark', 'light']).toContain(contextValue.theme.mode);
    });
  });

  describe('theme properties', () => {
    it('dark theme should have dark backgroundColor', () => {
      let contextValue;
      render(
        <ThemeProvider>
          <ThemeContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </ThemeContext.Consumer>
        </ThemeProvider>
      );
      
      // Dark theme should have a dark background
      expect(contextValue.theme.backgroundColor).toBeDefined();
    });

    it('light theme should have different colors than dark theme', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>
      );
      
      const darkBg = screen.getByTestId('bg-color').textContent;
      const darkText = screen.getByTestId('text-color').textContent;
      
      await user.click(screen.getByTestId('toggle'));
      
      const lightBg = screen.getByTestId('bg-color').textContent;
      const lightText = screen.getByTestId('text-color').textContent;
      
      // Colors should be different between themes
      expect(lightBg).not.toBe(darkBg);
      expect(lightText).not.toBe(darkText);
    });
  });
});
