/**
 * Tests for BottomNavBar Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import BottomNavBar from '../../components/BottomNavBar';
import { ThemeContext } from '../../contexts/ThemeContext';
import { LanguageContext } from '../../contexts/LanguageContext';

// Theme mocks
const lightTheme = {
  mode: 'light',
  backgroundColor: '#ffffff',
  textColor: '#1a1a1a',
  buttonBackgroundColor: '#22c55e',
};

const darkTheme = {
  mode: 'dark',
  backgroundColor: '#0f172a',
  textColor: '#ffffff',
  buttonBackgroundColor: '#22c55e',
};

// Mock translations
const mockTranslations = {
  sidebar: {
    insert: 'Inserisci',
    more: 'Altro',
    chartsStatistics: 'Grafici',
    comparison: 'Confronto',
    knowledge: 'Conoscenza',
    info: 'Info',
    account: { title: 'Profilo' },
    goalsLimits: 'Obiettivi',
    settings: { title: 'Impostazioni' },
    logout: 'Logout',
  },
};

const renderBottomNavBar = ({
  theme = lightTheme,
  language = 'it',
  initialRoute = '/it/dashboard',
  handleLogout = vi.fn(),
} = {}) => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ThemeContext.Provider value={{ theme }}>
        <LanguageContext.Provider
          value={{
            language,
            translations: mockTranslations,
            setLanguage: vi.fn(),
            toggleLanguage: vi.fn(),
          }}
        >
          <BottomNavBar handleLogout={handleLogout} />
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    </MemoryRouter>
  );
};

describe('BottomNavBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all 4 navigation buttons', () => {
    renderBottomNavBar();
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Inserisci')).toBeInTheDocument();
    expect(screen.getByText('Altro')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('should highlight the active tab based on current route', () => {
    renderBottomNavBar({ initialRoute: '/it/dashboard' });
    
    const dashboardButton = screen.getByText('Dashboard').closest('button');
    // Active button should have the primary color
    expect(dashboardButton).toBeInTheDocument();
  });

  it('should open More menu on click', () => {
    renderBottomNavBar();
    
    const moreButton = screen.getByText('Altro').closest('button');
    fireEvent.click(moreButton);
    
    // Popup should appear with menu items
    expect(screen.getByText('Grafici')).toBeInTheDocument();
    expect(screen.getByText('Confronto')).toBeInTheDocument();
    expect(screen.getByText('Conoscenza')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('anchors the More popup without a competing horizontal transform', () => {
    renderBottomNavBar();

    fireEvent.click(screen.getByText('Altro').closest('button'));

    const popup = screen.getByTestId('bottom-nav-more-popup');
    expect(popup.style.left).toBe('12px');
    expect(popup.style.right).toBe('12px');
    expect(popup.style.margin).toBe('0px auto');
    expect(popup.style.transform).toBe('');
  });

  it('should open Account menu on click', () => {
    renderBottomNavBar();
    
    const accountButton = screen.getByText('Account').closest('button');
    fireEvent.click(accountButton);
    
    // Account popup should appear
    expect(screen.getByText('Profilo')).toBeInTheDocument();
    expect(screen.getByText('Obiettivi')).toBeInTheDocument();
    expect(screen.getByText('Impostazioni')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should close More menu when Account is clicked', () => {
    renderBottomNavBar();
    
    // Open More menu
    fireEvent.click(screen.getByText('Altro').closest('button'));
    expect(screen.getByText('Grafici')).toBeInTheDocument();
    
    // Click Account — More menu should close
    fireEvent.click(screen.getByText('Account').closest('button'));
    expect(screen.queryByText('Grafici')).not.toBeInTheDocument();
  });

  it('should call handleLogout when Logout is clicked', () => {
    const handleLogout = vi.fn();
    renderBottomNavBar({ handleLogout });
    
    // Open Account menu
    fireEvent.click(screen.getByText('Account').closest('button'));
    
    // Click Logout
    fireEvent.click(screen.getByText('Logout'));
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it('should show backdrop overlay when popup is open', () => {
    renderBottomNavBar();
    
    fireEvent.click(screen.getByText('Altro').closest('button'));
    
    // Backdrop should be present (it's rendered by createPortal)
    const backdrop = document.querySelector('[data-testid="bottom-nav-backdrop"]');
    expect(backdrop).toBeInTheDocument();
  });

  it('should close popup when backdrop is clicked', () => {
    renderBottomNavBar();
    
    fireEvent.click(screen.getByText('Altro').closest('button'));
    expect(screen.getByText('Grafici')).toBeInTheDocument();
    
    // Click backdrop to close
    const backdrop = document.querySelector('[data-testid="bottom-nav-backdrop"]');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(screen.queryByText('Grafici')).not.toBeInTheDocument();
    }
  });

  it('should render with dark theme', () => {
    renderBottomNavBar({ theme: darkTheme });
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    // Nav bar should exist
    const navBar = document.querySelector('.bottom-nav-bar');
    expect(navBar).toBeInTheDocument();
  });

  it('should toggle More menu on repeated clicks', () => {
    renderBottomNavBar();
    
    const moreButton = screen.getByText('Altro').closest('button');
    
    // First click opens
    fireEvent.click(moreButton);
    expect(screen.getByText('Grafici')).toBeInTheDocument();
    
    // Second click closes
    fireEvent.click(moreButton);
    expect(screen.queryByText('Grafici')).not.toBeInTheDocument();
  });
});
