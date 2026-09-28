import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeContext } from '../../contexts/ThemeContext';
import { LanguageContext } from '../../contexts/LanguageContext';

// More recent items than one page (PAGE_SIZE = 5) — the case that used to
// leave the badge on forever.
vi.mock('../../data/roadmapData', () => {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return {
    default: Array.from({ length: 8 }, (_, index) => ({
      id: `item-${index}`,
      title: { it: `Novità ${index}`, en: `News ${index}` },
      description: { it: 'Descrizione', en: 'Description' },
      status: 'completed',
      category: 'feature',
      icon: '✨',
      completedDate: month,
    })),
  };
});

import WhatsNewBanner from '../../sections/WhatsNewBanner';

const theme = { mode: 'dark', textColor: '#fff', buttonBackgroundColor: '#079164', secondaryColor: '#22c55e' };

const renderBanner = () => render(
  <MemoryRouter>
    <ThemeContext.Provider value={{ theme }}>
      <LanguageContext.Provider value={{ language: 'en', translations: { whatsNew: { title: "What's New" } } }}>
        <WhatsNewBanner />
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  </MemoryRouter>,
);

describe('WhatsNewBanner', () => {
  beforeEach(() => {
    // The global test setup mocks localStorage with no-op fns — give it a real store.
    const store = {};
    localStorage.getItem.mockImplementation((key) => (key in store ? store[key] : null));
    localStorage.setItem.mockImplementation((key, value) => { store[key] = String(value); });
  });

  it('clears the badge for every recent item, not just the first page, when the panel is closed', () => {
    renderBanner();
    expect(screen.getByTestId('whats-new-badge')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("What's New"));
    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByTestId('whats-new-badge')).not.toBeInTheDocument();
  });

  it('also clears the badge when the panel is closed by clicking the icon again, and remembers it', () => {
    const { unmount } = renderBanner();
    const toggle = screen.getByLabelText("What's New");
    fireEvent.click(toggle);
    fireEvent.click(toggle);
    expect(screen.queryByTestId('whats-new-badge')).not.toBeInTheDocument();
    unmount();
    renderBanner();
    expect(screen.queryByTestId('whats-new-badge')).not.toBeInTheDocument();
  });
});
