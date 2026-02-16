/**
 * Tests for ToastNotification Component
 * Toast notification display
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ToastNotification from '../../components/ToastNotification';

describe('ToastNotification Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('visibility', () => {
    it('should not render when show is false', () => {
      const mockClose = vi.fn();
      render(
        <ToastNotification 
          message="Test message" 
          show={false} 
          onClose={mockClose}
        />
      );
      
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });

    it('should render when show is true', () => {
      const mockClose = vi.fn();
      render(
        <ToastNotification 
          message="Test message" 
          show={true} 
          onClose={mockClose}
        />
      );
      
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  describe('message display', () => {
    it('should display the message', () => {
      const mockClose = vi.fn();
      render(
        <ToastNotification 
          message="Success notification" 
          show={true} 
          onClose={mockClose}
        />
      );
      
      expect(screen.getByText('Success notification')).toBeInTheDocument();
    });

    it('should render HTML in message', () => {
      const mockClose = vi.fn();
      render(
        <ToastNotification 
          message="<strong>Bold</strong> text" 
          show={true} 
          onClose={mockClose}
        />
      );
      
      // Use getAllByText since multiple elements may contain the HTML
      const messageElements = screen.getAllByText((content, element) => {
        return element?.innerHTML?.includes('<strong>') ?? false;
      });
      expect(messageElements.length).toBeGreaterThan(0);
    });
  });

  describe('types', () => {
    it('should show success icon for success type', () => {
      const mockClose = vi.fn();
      render(
        <ToastNotification 
          message="Success" 
          type="success"
          show={true} 
          onClose={mockClose}
        />
      );
      
      // Should have success background color
      const toast = screen.getByText('Success').closest('.fixed');
      expect(toast).toHaveStyle({ backgroundColor: '#4CAF50' });
    });

    it('should show error icon for error type', () => {
      const mockClose = vi.fn();
      render(
        <ToastNotification 
          message="Error" 
          type="error"
          show={true} 
          onClose={mockClose}
        />
      );
      
      // Should have error background color
      const toast = screen.getByText('Error').closest('.fixed');
      expect(toast).toHaveStyle({ backgroundColor: '#f44336' });
    });

    it('should default to success type', () => {
      const mockClose = vi.fn();
      render(
        <ToastNotification 
          message="Default" 
          show={true} 
          onClose={mockClose}
        />
      );
      
      const toast = screen.getByText('Default').closest('.fixed');
      expect(toast).toHaveStyle({ backgroundColor: '#4CAF50' });
    });
  });

  describe('close button', () => {
    it('should have a close button', () => {
      const mockClose = vi.fn();
      render(
        <ToastNotification 
          message="Test" 
          show={true} 
          onClose={mockClose}
        />
      );
      
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', async () => {
      const mockClose = vi.fn();
      render(
        <ToastNotification 
          message="Test" 
          show={true} 
          onClose={mockClose}
        />
      );
      
      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);
      
      // Wait for animation timeout
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe('auto-close', () => {
    it('should auto-close after duration', async () => {
      const mockClose = vi.fn();
      render(
        <ToastNotification 
          message="Test" 
          duration={4000}
          show={true} 
          onClose={mockClose}
        />
      );
      
      // Advance past duration
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      
      // Wait for exit animation
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      expect(mockClose).toHaveBeenCalled();
    });

    it('should respect custom duration', async () => {
      const mockClose = vi.fn();
      render(
        <ToastNotification 
          message="Test" 
          duration={2000}
          show={true} 
          onClose={mockClose}
        />
      );
      
      // Should not close before duration
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      expect(mockClose).not.toHaveBeenCalled();
      
      // Should close after duration
      act(() => {
        vi.advanceTimersByTime(500);
      });
      
      // Wait for exit animation
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe('styling', () => {
    it('should have correct base styles', () => {
      const mockClose = vi.fn();
      render(
        <ToastNotification 
          message="Test" 
          show={true} 
          onClose={mockClose}
        />
      );
      
      const toast = screen.getByText('Test').closest('.fixed');
      expect(toast).toHaveStyle({
        padding: '16px'
      });
    });

    it('should have fixed positioning class', () => {
      const mockClose = vi.fn();
      render(
        <ToastNotification 
          message="Test" 
          show={true} 
          onClose={mockClose}
        />
      );
      
      const toast = screen.getByText('Test').closest('div.fixed');
      expect(toast).toBeInTheDocument();
    });
  });
});
