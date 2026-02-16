/**
 * PageContext Tests
 *
 * Validates the minimal PageProvider/IconContext.
 */

import { describe, it, expect } from 'vitest';
import React, { useContext } from 'react';
import { render, screen, act } from '@testing-library/react';
import { IconContext, PageProvider } from '../../contexts/PageContext';

const TestConsumer = () => {
  const { activeIcon, setActiveIcon } = useContext(IconContext);
  return (
    <div>
      <span data-testid="active-icon">{activeIcon}</span>
      <button data-testid="set-icon" onClick={() => setActiveIcon(3)}>Set 3</button>
    </div>
  );
};

describe('PageContext (IconContext)', () => {
  it('should default activeIcon to 0', () => {
    render(
      <PageProvider>
        <TestConsumer />
      </PageProvider>
    );
    expect(screen.getByTestId('active-icon')).toHaveTextContent('0');
  });

  it('should update activeIcon via setActiveIcon', () => {
    render(
      <PageProvider>
        <TestConsumer />
      </PageProvider>
    );

    act(() => {
      screen.getByTestId('set-icon').click();
    });

    expect(screen.getByTestId('active-icon')).toHaveTextContent('3');
  });
});
