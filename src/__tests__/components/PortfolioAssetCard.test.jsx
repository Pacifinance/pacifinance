/**
 * PortfolioAssetCard Component Tests
 *
 * Validates that:
 *  - Renders name, value, pills and badge
 *  - Renders the progress bar only when progressPercent is a number
 *  - Shows the details toggle only when there are subEntries/extraInfo
 *  - Expands/collapses details on toggle click, swapping the label
 *  - Renders subEntries and the "more" label when expanded
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { BsCash } from 'react-icons/bs';
import PortfolioAssetCard from '../../components/PortfolioAssetCard';

const theme = {
  mode: 'light',
  backgroundColor: '#f5f5f5',
  textColor: '#333',
  buttonBackgroundColor: '#079164',
};

const renderCard = (props = {}) => {
  const defaultProps = {
    theme,
    icon: BsCash,
    color: '#079164',
    name: 'Conto Corrente',
    value: '€1,000.00',
    showDetailsLabel: 'Show details',
    hideDetailsLabel: 'Hide details',
  };
  return render(
    <ThemeProvider theme={theme}>
      <PortfolioAssetCard {...defaultProps} {...props} />
    </ThemeProvider>
  );
};

describe('PortfolioAssetCard', () => {
  it('renders the asset name and value', () => {
    renderCard();
    expect(screen.getByText('Conto Corrente')).toBeTruthy();
    expect(screen.getByText('€1,000.00')).toBeTruthy();
  });

  it('renders pills when provided', () => {
    renderCard({ pills: ['Bank', 'EUR'] });
    expect(screen.getByText('Bank')).toBeTruthy();
    expect(screen.getByText('EUR')).toBeTruthy();
  });

  it('renders the badge next to the value when provided', () => {
    renderCard({ badge: '+3.2%' });
    expect(screen.getByText('+3.2%')).toBeTruthy();
  });

  it('renders the progress bar when progressPercent is a number', () => {
    const { container } = renderCard({ progressPercent: 42 });
    const fill = container.querySelector('.progress-fill');
    expect(fill).toBeTruthy();
    expect(fill.style.width).toBe('42%');
  });

  it('clamps progressPercent between 0 and 100', () => {
    const { container } = renderCard({ progressPercent: 150 });
    expect(container.querySelector('.progress-fill').style.width).toBe('100%');
  });

  it('does not render the progress bar when progressPercent is null', () => {
    const { container } = renderCard({ progressPercent: null });
    expect(container.querySelector('.progress-track')).toBeNull();
  });

  it('does not render a details toggle when there are no details', () => {
    renderCard();
    expect(screen.queryByText('Show details')).toBeNull();
  });

  it('renders a details toggle when subEntries are provided', () => {
    renderCard({
      subEntries: [{ id: 1, label: 'Sub Account', value: '€500.00' }],
    });
    expect(screen.getByText('Show details')).toBeTruthy();
  });

  it('expands details and swaps the label on click', () => {
    renderCard({
      subEntries: [{ id: 1, label: 'Sub Account', value: '€500.00' }],
      subEntriesMoreLabel: '+2 more',
    });

    fireEvent.click(screen.getByText('Show details'));

    expect(screen.getByText('Hide details')).toBeTruthy();
    expect(screen.getByText('Sub Account')).toBeTruthy();
    expect(screen.getByText('€500.00')).toBeTruthy();
    expect(screen.getByText('+2 more')).toBeTruthy();
  });

  it('renders a details toggle when only extraInfo is provided', () => {
    renderCard({ extraInfo: <div>Extra context</div> });

    expect(screen.getByText('Show details')).toBeTruthy();

    fireEvent.click(screen.getByText('Show details'));

    expect(screen.getByText('Extra context')).toBeTruthy();
  });

  it('renders actions when provided', () => {
    renderCard({ actions: <button>Manage</button> });
    expect(screen.getByText('Manage')).toBeTruthy();
  });
});
