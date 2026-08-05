import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import BottomNavBar from '../../sections/BottomNavBar';
import { ThemeContext } from '../../contexts/ThemeContext';
import { LanguageContext } from '../../contexts/LanguageContext';

const lightTheme = { mode: 'light', backgroundColor: '#fff', textColor: '#1a1a1a', buttonBackgroundColor: '#22c55e' };
const darkTheme = { ...lightTheme, mode: 'dark', backgroundColor: '#0f172a', textColor: '#fff' };
const translations = {
  sidebar: {
    dashboard: 'Dashboard', statisticsShort: 'Statistiche', goalsShort: 'Obiettivi', more: 'Altro',
    comparison: 'Confronto', marketPrices: 'Prezzi di Mercato', knowledge: 'Conoscenza', info: 'Info',
    settings: { title: 'Impostazioni' }, mobileNavigation: 'Navigazione principale',
  },
  dashboard: { quickAdd: { title: 'Aggiunta rapida' } },
};

const renderNav = ({ theme = lightTheme, initialRoute = '/it/dashboard', onQuickAdd = vi.fn() } = {}) => render(
  <MemoryRouter initialEntries={[initialRoute]}>
    <ThemeContext.Provider value={{ theme }}>
      <LanguageContext.Provider value={{ translations, language: 'it' }}>
        <BottomNavBar onQuickAdd={onQuickAdd} />
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  </MemoryRouter>,
);

describe('BottomNavBar', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the four destinations and the central quick action', () => {
    renderNav();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Statistiche')).toBeInTheDocument();
    expect(screen.getByText('Obiettivi')).toBeInTheDocument();
    expect(screen.getByText('Altro')).toBeInTheDocument();
    expect(screen.getByLabelText('Aggiunta rapida')).toBeInTheDocument();
  });

  it('opens quick add from the central button', () => {
    const onQuickAdd = vi.fn();
    renderNav({ onQuickAdd });
    fireEvent.click(screen.getByLabelText('Aggiunta rapida'));
    expect(onQuickAdd).toHaveBeenCalledOnce();
  });

  it('opens More with secondary destinations', () => {
    renderNav();
    fireEvent.click(screen.getByText('Altro'));
    expect(screen.getByText('Confronto')).toBeInTheDocument();
    expect(screen.getByText('Prezzi di Mercato')).toBeInTheDocument();
    expect(screen.getByText('Conoscenza')).toBeInTheDocument();
    expect(screen.getByText('Impostazioni')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('anchors the More popup without horizontal transforms', () => {
    renderNav();
    fireEvent.click(screen.getByText('Altro'));
    const popup = screen.getByTestId('bottom-nav-more-popup');
    expect(popup.style.left).toBe('12px');
    expect(popup.style.right).toBe('12px');
    expect(popup.style.transform).toBe('');
  });

  it('shows and closes the backdrop', () => {
    renderNav();
    fireEvent.click(screen.getByText('Altro'));
    fireEvent.click(screen.getByTestId('bottom-nav-backdrop'));
    expect(screen.queryByText('Confronto')).not.toBeInTheDocument();
  });

  it('toggles More on repeated clicks', () => {
    renderNav();
    fireEvent.click(screen.getByText('Altro'));
    fireEvent.click(screen.getByText('Altro'));
    expect(screen.queryByText('Confronto')).not.toBeInTheDocument();
  });

  it('renders in dark theme', () => {
    renderNav({ theme: darkTheme });
    expect(document.querySelector('.bottom-nav-bar')).toBeInTheDocument();
  });
});
