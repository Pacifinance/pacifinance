import { useContext, useMemo, useCallback } from 'react';
import { UserContext } from '../contexts/UserContext';
import { useMockAuth } from '../contexts/MockAuthContext';

// Hook unificato che usa automaticamente il provider giusto
export const useAuth = () => {
    const isDevelopmentMode = useMemo(() => {
        return import.meta.env.DEV && 
               (localStorage.getItem('pacifinance-dev-mode') === 'true' ||
                window.location.search.includes('dev=true'));
    }, []);

    // Ottieni i context in modo safe
    let mockAuth = null;
    let userContext = null;
    
    try {
        mockAuth = useMockAuth();
    } catch (error) {
        // MockAuth non disponibile
    }
    
    try {
        userContext = useContext(UserContext);
    } catch (error) {
        // UserContext non disponibile
    }

    return useMemo(() => {
        if (isDevelopmentMode && mockAuth) {
            return mockAuth;
        } else if (userContext) {
            return userContext;
        } else {
            // Fallback completo
            return {
                isAuthenticated: false,
                userData: null,
                isLoading: false,
                handleSetIsAuthenticated: () => {},
                handleSetIsUpdated: () => {},
                setUserData: () => {},
                isDevelopment: isDevelopmentMode
            };
        }
    }, [isDevelopmentMode, mockAuth, userContext]);
};