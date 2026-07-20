/**
 * PortfolioSection Component Tests
 *
 * Validates that:
 *  - Renders title, icon and children when expanded
 *  - Hides body content when collapsed
 *  - Shows the correct aria-label/title based on collapsed state
 *  - Calls onToggleCollapsed when the header is clicked
 *  - Renders the optional totalLabel only when provided
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { BsCash } from 'react-icons/bs';
import PortfolioSection from '../../components/PortfolioSection';

const theme = {
  mode: 'light',
  backgroundColor: '#f5f5f5',
  textColor: '#333',
  buttonBackgroundColor: '#079164',
};

const renderSection = (props = {}) => {
  const defaultProps = {
    theme,
    icon: BsCash,
    title: 'Liquidità',
    collapsed: false,
    onToggleCollapsed: vi.fn(),
    expandLabel: 'Expand section',
    collapseLabel: 'Collapse section',
    children: <div>Section body content</div>,
  };
  return render(
    <ThemeProvider theme={theme}>
      <PortfolioSection {...defaultProps} {...props} />
    </ThemeProvider>
  );
};

describe('PortfolioSection', () => {
  it('renders the title and children when expanded', () => {
    renderSection();
    expect(screen.getByText('Liquidità')).toBeTruthy();
    expect(screen.getByText('Section body content')).toBeTruthy();
  });

  it('hides children when collapsed', () => {
    renderSection({ collapsed: true });
    expect(screen.queryByText('Section body content')).toBeNull();
  });

  it('uses collapseLabel for aria-label/title when expanded', () => {
    renderSection({ collapsed: false });
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('Collapse section');
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('uses expandLabel for aria-label/title when collapsed', () => {
    renderSection({ collapsed: true });
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('Expand section');
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('calls onToggleCollapsed when the header is clicked', () => {
    const onToggleCollapsed = vi.fn();
    renderSection({ onToggleCollapsed });

    fireEvent.click(screen.getByRole('button'));

    expect(onToggleCollapsed).toHaveBeenCalledTimes(1);
  });

  it('does not render a total label when not provided', () => {
    const { container } = renderSection();
    expect(container.querySelector('.section-total')).toBeNull();
  });

  it('renders the total label when provided', () => {
    renderSection({ totalLabel: '€1,234.00' });
    expect(screen.getByText('€1,234.00')).toBeTruthy();
  });
});
