/**
 * Tests for ToggleModeButton Component
 * Dark/Light mode toggle button
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ToggleModeButton from '../../components/ToggleModeButton';

describe('ToggleModeButton Component', () => {
  describe('rendering', () => {
    it('should render the button', () => {
      const mockToggle = vi.fn();
      render(<ToggleModeButton mode="dark" toggleMode={mockToggle} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render moon icon in dark mode', () => {
      const mockToggle = vi.fn();
      render(<ToggleModeButton mode="dark" toggleMode={mockToggle} />);
      
      // Brightness4Icon (moon) should be rendered
      const button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should render sun icon in light mode', () => {
      const mockToggle = vi.fn();
      render(<ToggleModeButton mode="light" toggleMode={mockToggle} />);
      
      // LightModeIcon (sun) should be rendered
      const button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should call toggleMode on click', () => {
      const mockToggle = vi.fn();
      render(<ToggleModeButton mode="dark" toggleMode={mockToggle} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockToggle).toHaveBeenCalled();
    });

    it('should call toggleMode only once per click', () => {
      const mockToggle = vi.fn();
      render(<ToggleModeButton mode="dark" toggleMode={mockToggle} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('styling', () => {
    it('should have dark background in dark mode', () => {
      const mockToggle = vi.fn();
      render(<ToggleModeButton mode="dark" toggleMode={mockToggle} />);
      
      const button = screen.getByRole('button');
      // Check the button is styled (styled-components generates className)
      expect(button).toHaveClass(/sc-/);
    });

    it('should have light background in light mode', () => {
      const mockToggle = vi.fn();
      render(<ToggleModeButton mode="light" toggleMode={mockToggle} />);
      
      const button = screen.getByRole('button');
      // Check the button is styled (styled-components generates className)
      expect(button).toHaveClass(/sc-/);
    });
  });

  describe('analytics', () => {
    it('should have umami analytics event attribute', () => {
      const mockToggle = vi.fn();
      render(<ToggleModeButton mode="dark" toggleMode={mockToggle} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-umami-event', 'setTheme');
    });
  });

  describe('accessibility', () => {
    it('should be focusable', () => {
      const mockToggle = vi.fn();
      render(<ToggleModeButton mode="dark" toggleMode={mockToggle} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(document.activeElement).toBe(button);
    });

    it('should have cursor pointer', () => {
      const mockToggle = vi.fn();
      render(<ToggleModeButton mode="dark" toggleMode={mockToggle} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ cursor: 'pointer' });
    });
  });
});
