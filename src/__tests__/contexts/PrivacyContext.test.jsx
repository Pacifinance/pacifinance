/**
 * Tests for PrivacyContext
 * Privacy mode state management (hide/show values)
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrivacyContext, PrivacyProvider } from '../../contexts/PrivacyContext';

// Test component that uses the context
const TestConsumer = () => {
  const { isHidden, toggleHidden } = React.useContext(PrivacyContext);
  
  return (
    <div>
      <span data-testid="is-hidden">{isHidden ? 'hidden' : 'visible'}</span>
      <button data-testid="toggle" onClick={toggleHidden}>Toggle Privacy</button>
    </div>
  );
};

describe('PrivacyContext', () => {
  describe('PrivacyProvider', () => {
    it('should provide default isHidden as false', () => {
      render(
        <PrivacyProvider>
          <TestConsumer />
        </PrivacyProvider>
      );
      
      expect(screen.getByTestId('is-hidden')).toHaveTextContent('visible');
    });
  });

  describe('toggleHidden', () => {
    it('should toggle from visible to hidden', async () => {
      const user = userEvent.setup();
      
      render(
        <PrivacyProvider>
          <TestConsumer />
        </PrivacyProvider>
      );
      
      expect(screen.getByTestId('is-hidden')).toHaveTextContent('visible');
      
      await user.click(screen.getByTestId('toggle'));
      
      expect(screen.getByTestId('is-hidden')).toHaveTextContent('hidden');
    });

    it('should toggle from hidden back to visible', async () => {
      const user = userEvent.setup();
      
      render(
        <PrivacyProvider>
          <TestConsumer />
        </PrivacyProvider>
      );
      
      // Toggle to hidden
      await user.click(screen.getByTestId('toggle'));
      expect(screen.getByTestId('is-hidden')).toHaveTextContent('hidden');
      
      // Toggle back to visible
      await user.click(screen.getByTestId('toggle'));
      expect(screen.getByTestId('is-hidden')).toHaveTextContent('visible');
    });

    it('should maintain state through multiple toggles', async () => {
      const user = userEvent.setup();
      
      render(
        <PrivacyProvider>
          <TestConsumer />
        </PrivacyProvider>
      );
      
      // Initial: visible
      expect(screen.getByTestId('is-hidden')).toHaveTextContent('visible');
      
      // Toggle 1: hidden
      await user.click(screen.getByTestId('toggle'));
      expect(screen.getByTestId('is-hidden')).toHaveTextContent('hidden');
      
      // Toggle 2: visible
      await user.click(screen.getByTestId('toggle'));
      expect(screen.getByTestId('is-hidden')).toHaveTextContent('visible');
      
      // Toggle 3: hidden
      await user.click(screen.getByTestId('toggle'));
      expect(screen.getByTestId('is-hidden')).toHaveTextContent('hidden');
    });
  });

  describe('context value', () => {
    it('should provide isHidden boolean', () => {
      let contextValue;
      render(
        <PrivacyProvider>
          <PrivacyContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </PrivacyContext.Consumer>
        </PrivacyProvider>
      );
      
      expect(typeof contextValue.isHidden).toBe('boolean');
    });

    it('should provide toggleHidden function', () => {
      let contextValue;
      render(
        <PrivacyProvider>
          <PrivacyContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </PrivacyContext.Consumer>
        </PrivacyProvider>
      );
      
      expect(typeof contextValue.toggleHidden).toBe('function');
    });
  });
});
