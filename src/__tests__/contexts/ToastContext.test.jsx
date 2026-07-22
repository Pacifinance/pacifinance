/**
 * Tests for ToastContext
 * Toast notification management
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from '../../contexts/ToastContext';

// Mock ToastNotification component to avoid complex testing of the actual component
vi.mock('../../components/ToastNotification', () => ({
  default: ({ message, type, show, onClose }) => (
    show ? (
      <div data-testid={`toast-${type}`} data-message={message}>
        {message}
        <button onClick={onClose} data-testid="close-toast">Close</button>
      </div>
    ) : null
  )
}));

// Test component that uses the context
const TestConsumer = ({ message }) => {
  const { showSuccess, showError, showWarning } = useToast();

  return (
    <div>
      <button
        data-testid="show-success"
        onClick={() => showSuccess(message || 'Success message')}
      >
        Show Success
      </button>
      <button
        data-testid="show-error"
        onClick={() => showError(message || 'Error message')}
      >
        Show Error
      </button>
      <button
        data-testid="show-warning"
        onClick={() => showWarning(message || 'Warning message')}
      >
        Show Warning
      </button>
    </div>
  );
};

describe('ToastContext', () => {
  describe('useToast hook', () => {
    it('should throw error when used outside ToastProvider', () => {
      // Suppress console.error for this test
      const consoleError = console.error;
      console.error = () => {};
      
      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useToast must be used within a ToastProvider');
      
      console.error = consoleError;
    });
  });

  describe('ToastProvider', () => {
    it('should render children correctly', () => {
      render(
        <ToastProvider>
          <div data-testid="child">Child content</div>
        </ToastProvider>
      );
      
      expect(screen.getByTestId('child')).toHaveTextContent('Child content');
    });

    it('should provide showSuccess function', () => {
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>
      );
      
      expect(screen.getByTestId('show-success')).toBeInTheDocument();
    });

    it('should provide showError function', () => {
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>
      );
      
      expect(screen.getByTestId('show-error')).toBeInTheDocument();
    });
  });

  describe('showSuccess', () => {
    it('should show success toast when triggered', async () => {
      render(
        <ToastProvider>
          <TestConsumer message="Operation completed!" />
        </ToastProvider>
      );
      
      const successButton = screen.getByTestId('show-success');
      
      await act(async () => {
        successButton.click();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('toast-success')).toBeInTheDocument();
      });
    });

    it('should display correct message in success toast', async () => {
      render(
        <ToastProvider>
          <TestConsumer message="Custom success message" />
        </ToastProvider>
      );
      
      const successButton = screen.getByTestId('show-success');
      
      await act(async () => {
        successButton.click();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('toast-success')).toHaveTextContent('Custom success message');
      });
    });
  });

  describe('showError', () => {
    it('should show error toast when triggered', async () => {
      render(
        <ToastProvider>
          <TestConsumer message="Something went wrong!" />
        </ToastProvider>
      );
      
      const errorButton = screen.getByTestId('show-error');
      
      await act(async () => {
        errorButton.click();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('toast-error')).toBeInTheDocument();
      });
    });

    it('should display correct message in error toast', async () => {
      render(
        <ToastProvider>
          <TestConsumer message="Custom error message" />
        </ToastProvider>
      );
      
      const errorButton = screen.getByTestId('show-error');
      
      await act(async () => {
        errorButton.click();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('toast-error')).toHaveTextContent('Custom error message');
      });
    });
  });

  describe('showWarning', () => {
    it('should show warning toast when triggered', async () => {
      render(
        <ToastProvider>
          <TestConsumer message="Please double-check this!" />
        </ToastProvider>
      );

      const warningButton = screen.getByTestId('show-warning');

      await act(async () => {
        warningButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('toast-warning')).toHaveTextContent('Please double-check this!');
      });
    });
  });

  describe('multiple toasts', () => {
    it('should show multiple toasts', async () => {
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>
      );
      
      const successButton = screen.getByTestId('show-success');
      const errorButton = screen.getByTestId('show-error');
      
      await act(async () => {
        successButton.click();
        errorButton.click();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('toast-success')).toBeInTheDocument();
        expect(screen.getByTestId('toast-error')).toBeInTheDocument();
      });
    });
  });

  describe('toast removal', () => {
    it('should remove toast when close is triggered', async () => {
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>
      );
      
      const successButton = screen.getByTestId('show-success');
      
      await act(async () => {
        successButton.click();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('toast-success')).toBeInTheDocument();
      });
      
      const closeButton = screen.getByTestId('close-toast');
      
      await act(async () => {
        closeButton.click();
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('toast-success')).not.toBeInTheDocument();
      });
    });
  });
});
