import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import AppRouter from './AppRouter';
import { initializeAnalytics } from './services/analyticsService';

void initializeAnalytics();

// Registrazione Service Worker per performance mobile
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .catch((error) => {
        console.warn('SW registration failed: ', error);
      });
  });
}

// Prevent pinch-to-zoom on iOS (which ignores user-scalable=no)
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());
document.addEventListener('gestureend', (e) => e.preventDefault());
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { PageProvider } from './contexts/PageContext';
import { PrivacyProvider } from './contexts/PrivacyContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { MediaQueryProvider } from './contexts/MediaQueryContext';
import { ToastProvider } from './contexts/ToastContext';
import { ServiceProvider } from './contexts/ServiceContext';
import DevModeProvider from './contexts/DevModeProvider';

createRoot(document.getElementById('root')).render(
  <ServiceProvider>
    <MediaQueryProvider>
      <LanguageProvider>
        <ThemeProvider>
          <DevModeProvider>
            <UserProvider>
              <CurrencyProvider>
                <PageProvider>
                  <PrivacyProvider>
                    <ToastProvider>
                      <React.StrictMode>
                        <Router>
                          <AppRouter />
                        </Router>
                      </React.StrictMode>
                    </ToastProvider>
                  </PrivacyProvider>
                </PageProvider>
              </CurrencyProvider>
            </UserProvider>
          </DevModeProvider>
        </ThemeProvider>
      </LanguageProvider>
    </MediaQueryProvider>
  </ServiceProvider>
)
