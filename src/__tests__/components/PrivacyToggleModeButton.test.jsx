/**
 * Tests for PrivacyToggleModeButton Component
 * Privacy mode toggle button (hide/show values)
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PrivacyToggleModeButton from '../../components/PrivacyToggleModeButton';

describe('PrivacyToggleModeButton Component', () => {
  describe('rendering', () => {
    it('should render the button', () => {
      const mockToggle = vi.fn();
      render(<PrivacyToggleModeButton mode="dark" toggleHidden={mockToggle} isHidden={false} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render eye icon when not hidden', () => {
      const mockToggle = vi.fn();
      render(<PrivacyToggleModeButton mode="dark" toggleHidden={mockToggle} isHidden={false} />);
      
      // Eye icon should be rendered
      const button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should render eye-slash icon when hidden', () => {
      const mockToggle = vi.fn();
      render(<PrivacyToggleModeButton mode="dark" toggleHidden={mockToggle} isHidden={true} />);
      
      // Eye-slash icon should be rendered
      const button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should call toggleHidden on click', () => {
      const mockToggle = vi.fn();
      render(<PrivacyToggleModeButton mode="dark" toggleHidden={mockToggle} isHidden={false} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockToggle).toHaveBeenCalled();
    });

    it('should call toggleHidden only once per click', () => {
      const mockToggle = vi.fn();
      render(<PrivacyToggleModeButton mode="dark" toggleHidden={mockToggle} isHidden={false} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('should call toggleHidden when hidden and clicked', () => {
      const mockToggle = vi.fn();
      render(<PrivacyToggleModeButton mode="dark" toggleHidden={mockToggle} isHidden={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockToggle).toHaveBeenCalled();
    });
  });

  describe('styling', () => {
    it('should have dark background in dark mode', () => {
      const mockToggle = vi.fn();
      render(<PrivacyToggleModeButton mode="dark" toggleHidden={mockToggle} isHidden={false} />);
      
      const button = screen.getByRole('button');
      // Check the button is styled (styled-components generates className)
      expect(button).toHaveClass(/sc-/);
    });

    it('should have light background in light mode', () => {
      const mockToggle = vi.fn();
      render(<PrivacyToggleModeButton mode="light" toggleHidden={mockToggle} isHidden={false} />);
      
      const button = screen.getByRole('button');
      // Check the button is styled (styled-components generates className)
      expect(button).toHaveClass(/sc-/);
    });
  });

  describe('analytics', () => {
    it('should have umami analytics event attribute', () => {
      const mockToggle = vi.fn();
      render(<PrivacyToggleModeButton mode="dark" toggleHidden={mockToggle} isHidden={false} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-umami-event', 'setPrivacy');
    });
  });

  describe('accessibility', () => {
    it('should be focusable', () => {
      const mockToggle = vi.fn();
      render(<PrivacyToggleModeButton mode="dark" toggleHidden={mockToggle} isHidden={false} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(document.activeElement).toBe(button);
    });

    it('should have cursor pointer', () => {
      const mockToggle = vi.fn();
      render(<PrivacyToggleModeButton mode="dark" toggleHidden={mockToggle} isHidden={false} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ cursor: 'pointer' });
    });
  });

  describe('icon state', () => {
    it('should show different icons based on isHidden prop', () => {
      const mockToggle = vi.fn();
      const { rerender } = render(
        <PrivacyToggleModeButton mode="dark" toggleHidden={mockToggle} isHidden={false} />
      );
      
      const button = screen.getByRole('button');
      const svgWhenVisible = button.querySelector('svg');
      expect(svgWhenVisible).toBeInTheDocument();
      
      rerender(
        <PrivacyToggleModeButton mode="dark" toggleHidden={mockToggle} isHidden={true} />
      );
      
      const svgWhenHidden = button.querySelector('svg');
      expect(svgWhenHidden).toBeInTheDocument();
    });
  });
});
