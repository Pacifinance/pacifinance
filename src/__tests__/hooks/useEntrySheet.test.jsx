import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useEntrySheet } from '../../hooks/useEntrySheet';

const wrapper = (initial) => ({ children }) => (
  <MemoryRouter initialEntries={[initial]}>{children}</MemoryRouter>
);

const useEntryWithLocation = () => ({ ...useEntrySheet(), location: useLocation() });

describe('useEntrySheet', () => {
  it('reads a valid ?add= entry and month from the URL', () => {
    const { result } = renderHook(useEntryWithLocation, { wrapper: wrapper('/it/dashboard?add=balance&month=8-2026') });
    expect(result.current.entry).toBe('balance');
    expect(result.current.entryMonth).toEqual({ month: 8, year: 2026 });
  });

  it('ignores unknown entry values', () => {
    const { result } = renderHook(useEntryWithLocation, { wrapper: wrapper('/it/dashboard?add=hack') });
    expect(result.current.entry).toBeNull();
  });

  it('opens and closes an entry while keeping the page and other params', () => {
    const { result } = renderHook(useEntryWithLocation, { wrapper: wrapper('/it/transactions?section=income') });
    act(() => result.current.openEntry('balance', { month: { month: 7, year: 2026 } }));
    expect(result.current.location.pathname).toBe('/it/transactions');
    expect(result.current.entry).toBe('balance');
    expect(result.current.location.search).toContain('section=income');
    expect(result.current.location.search).toContain('month=7-2026');

    act(() => result.current.closeEntry());
    expect(result.current.entry).toBeNull();
    expect(result.current.location.search).toBe('?section=income');
  });
});
