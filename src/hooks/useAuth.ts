import { useContext, useMemo } from 'react';
import { UserContext } from '../contexts/UserContext';
import MockAuthContext from '../contexts/MockAuthContext';

/** Check if demo session is active via sessionStorage */
const isDemoSession = () => sessionStorage.getItem('pacifinance-demo') === 'true';

// Unified hook that automatically uses the right provider
export const useAuth = () => {
    const isDevelopmentMode = useMemo(() => {
        return import.meta.env.DEV && 
               (localStorage.getItem('pacifinance-dev-mode') === 'true' ||
                window.location.search.includes('dev=true'));
    }, []);

    // Access the contexts directly without try/catch
    // useContext returns undefined/null when the Provider isn't in the tree
    const mockAuth = useContext(MockAuthContext);
    const userContext = useContext(UserContext);

    return useMemo(() => {
        if (isDevelopmentMode && mockAuth) {
            // When demo session is active and UserContext has entered demo mode,
            // prefer UserContext so all demo features (disabled buttons, fake
            // services, demo data) work correctly even in dev mode.
            if (isDemoSession() && userContext?.isDemoMode) {
                return {
                    ...userContext,
                    isDemoMode: true,
                    // On demo logout, also deauthenticate mockAuth so that
                    // PublicRoute won't redirect back to dashboard.
                    handleSetIsAuthenticated: (value) => {
                        userContext.handleSetIsAuthenticated(value);
                        if (!value) {
                            mockAuth.handleSetIsAuthenticated(false);
                        }
                    },
                };
            }

            // Wrap handleSetIsAuthenticated so that demo login/logout is
            // routed to UserContext (which has the demo logic), while normal
            // dev-mode auth continues to use MockAuth.
            const wrappedHandleSetIsAuthenticated = (value) => {
                if (isDemoSession() && userContext) {
                    userContext.handleSetIsAuthenticated(value);
                } else {
                    mockAuth.handleSetIsAuthenticated(value);
                }
            };

            return {
                ...mockAuth,
                handleSetIsAuthenticated: wrappedHandleSetIsAuthenticated,
                isDemoMode: false,
            };
        } else if (userContext) {
            return {
                ...userContext,
                isDemoMode: userContext.isDemoMode || false,
            };
        } else {
            // Full fallback
            return {
                isAuthenticated: false,
                userData: null,
                isLoading: false,
                handleSetIsAuthenticated: () => {},
                handleSetIsUpdated: () => {},
                setUserData: () => {},
                isDevelopment: isDevelopmentMode,
                isDemoMode: false
            };
        }
    }, [isDevelopmentMode, mockAuth, userContext]);
};