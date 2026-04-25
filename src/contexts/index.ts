/**
 * Contexts barrel. Import via `@contexts`.
 *
 * @module contexts
 */

export { CurrencyContext, CurrencyProvider } from './CurrencyContext';
export { default as DevModeProvider } from './DevModeProvider';
export { LanguageContext, LanguageProvider } from './LanguageContext';
export { MediaQueryContext, MediaQueryProvider } from './MediaQueryContext';
export { DemoAuthContext, DemoAuthProvider, useDemoAuth } from './DemoAuthContext';
export { MockAuthProvider, useMockAuth, mockUserData, default as MockAuthContext } from './MockAuthContext';
export { IconContext, PageProvider } from './PageContext';
export { PrivacyContext, PrivacyProvider } from './PrivacyContext';
export { ServiceContext, ServiceProvider, useServices, createServices } from './ServiceContext';
export { ThemeContext, ThemeProvider } from './ThemeContext';
export { ToastProvider, useToast } from './ToastContext';
export { UserContext, UserProvider } from './UserContext';
