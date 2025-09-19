import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './AppRouter';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { PageProvider } from './contexts/PageContext';
import { PrivacyProvider } from './contexts/PrivacyContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { MediaQueryProvider } from './contexts/MediaQueryContext';
import { ToastProvider } from './contexts/ToastContext';

createRoot(document.getElementById('root')).render(
  <MediaQueryProvider>
      <LanguageProvider>
        <ThemeProvider>
          <UserProvider>
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
          </UserProvider>
        </ThemeProvider>
      </LanguageProvider>
    </MediaQueryProvider>
)
