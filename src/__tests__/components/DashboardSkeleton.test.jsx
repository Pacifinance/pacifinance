/**
 * DashboardSkeleton Component Tests
 *
 * Validates that:
 *  - Renders without crashing in both light and dark themes
 *  - Contains skeleton placeholder elements
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import DashboardSkeleton from '../../components/DashboardSkeleton';

const lightTheme = {
  mode: 'light',
  backgroundColor: '#f5f5f5',
  textColor: '#333',
  buttonBackgroundColor: '#079164',
};

const darkTheme = {
  mode: 'dark',
  backgroundColor: '#222831',
  textColor: '#e0e0e0',
  buttonBackgroundColor: '#079164',
};

describe('DashboardSkeleton', () => {
  it('renders without crashing in light theme', () => {
    const { container } = render(
      <ThemeProvider theme={lightTheme}>
        <DashboardSkeleton />
      </ThemeProvider>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders without crashing in dark theme', () => {
    const { container } = render(
      <ThemeProvider theme={darkTheme}>
        <DashboardSkeleton />
      </ThemeProvider>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('contains multiple skeleton placeholder elements', () => {
    const { container } = render(
      <ThemeProvider theme={darkTheme}>
        <DashboardSkeleton />
      </ThemeProvider>
    );
    // Should have multiple divs for skeleton placeholders
    const divs = container.querySelectorAll('div');
    expect(divs.length).toBeGreaterThan(5);
  });
});
