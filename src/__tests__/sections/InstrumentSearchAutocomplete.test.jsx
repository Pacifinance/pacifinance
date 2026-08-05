/**
 * Tests for InstrumentSearchAutocomplete's two-stage debounce: a fast,
 * local-catalog-only pass for responsiveness, and a slower pass (only after
 * typing has actually paused) that also consults the external provider.
 * Typing a 12-character ISIN one keystroke at a time must not fire a
 * provider-backed search on every intermediate fragment — see
 * server/src/libs/providers/openfigiProvider.ts's rate limit.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import { LanguageContext } from '../../contexts/LanguageContext';
import InstrumentSearchAutocomplete from '../../sections/InstrumentSearchAutocomplete';

const searchInstruments = vi.fn();
const createManualInstrument = vi.fn();

vi.mock('../../hooks/useDemoServices', () => ({
  useDemoServices: () => ({
    investmentService: {
      searchInstruments: (...args) => searchInstruments(...args),
      createManualInstrument: (...args) => createManualInstrument(...args),
    },
  }),
}));

const translations = {
  investments: {
    search: {
      placeholder: 'Search by name or symbol...',
      loading: 'Searching...',
      noResults: 'No results',
      verifiedBadge: 'Verified',
      addManual: 'Add "{query}" as unverified',
      addManualHint: "Won't be verified.",
      provider: { openfigi: 'Verified with OpenFIGI', coingecko: 'Verified with CoinGecko', manual: 'Manually entered' },
    },
  },
};

const theme = { mode: 'light', textColor: '#000' };

function renderAutocomplete(props = {}) {
  const onSelect = vi.fn();
  const utils = render(
    <ThemeContext.Provider value={{ theme }}>
      <LanguageContext.Provider value={{ language: 'en', translations }}>
        <InstrumentSearchAutocomplete assetKey="stocks" onSelect={onSelect} {...props} />
      </LanguageContext.Provider>
    </ThemeContext.Provider>,
  );
  return { ...utils, onSelect };
}

describe('InstrumentSearchAutocomplete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    searchInstruments.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires only a local-only search (no `source`) shortly after typing, before the longer provider pause', async () => {
    renderAutocomplete();
    const input = screen.getByPlaceholderText('Search by name or symbol...');
    fireEvent.change(input, { target: { value: 'AAPL' } });

    await act(async () => { vi.advanceTimersByTime(150); });

    expect(searchInstruments).toHaveBeenCalledTimes(1);
    expect(searchInstruments).toHaveBeenCalledWith({ query: 'AAPL', kind: 'stock', limit: 15 });
  });

  it('only fires the provider-backed search once, for the final value, when typing an ISIN one keystroke at a time', async () => {
    renderAutocomplete();
    const input = screen.getByPlaceholderText('Search by name or symbol...');

    // Simulate typing "US0378331005" in bursts faster than either debounce window.
    const partials = ['U', 'US', 'US0', 'US03', 'US037', 'US0378331005'];
    for (const partial of partials) {
      fireEvent.change(input, { target: { value: partial } });
      await act(async () => { vi.advanceTimersByTime(50); });
    }

    // Let both debounces settle for the final value.
    await act(async () => { vi.advanceTimersByTime(700); });

    const providerCalls = searchInstruments.mock.calls.filter(([params]) => 'source' in params);
    expect(providerCalls).toHaveLength(1);
    expect(providerCalls[0][0]).toEqual({ query: 'US0378331005', kind: 'stock', limit: 15, source: 'figi' });
  });

  it('eventually fires the provider-backed search after a real pause', async () => {
    renderAutocomplete();
    const input = screen.getByPlaceholderText('Search by name or symbol...');
    fireEvent.change(input, { target: { value: 'US0378331005' } });

    await act(async () => { vi.advanceTimersByTime(700); });

    expect(searchInstruments).toHaveBeenCalledWith({ query: 'US0378331005', kind: 'stock', limit: 15, source: 'figi' });
  });

  it('clears results and query on selection', async () => {
    searchInstruments.mockResolvedValue([{ id: 1, kind: 'stock', symbol: 'AAPL', name: 'Apple Inc', verified: true }]);
    const { onSelect } = renderAutocomplete();
    const input = screen.getByPlaceholderText('Search by name or symbol...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'AAPL' } });

    await act(async () => { vi.advanceTimersByTime(700); });

    fireEvent.click(screen.getByText('Apple Inc', { exact: false }));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ symbol: 'AAPL' }));
    expect(input.value).toBe('');
  });
});
