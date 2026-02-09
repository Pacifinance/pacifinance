import { useContext, useMemo } from 'react';
import { UserContext } from '../contexts/UserContext';
import MockAuthContext from '../contexts/MockAuthContext';

// Hook unificato che usa automaticamente il provider giusto
export const useAuth = () => {
    const isDevelopmentMode = useMemo(() => {
        return import.meta.env.DEV && 
               (localStorage.getItem('pacifinance-dev-mode') === 'true' ||
                window.location.search.includes('dev=true'));
    }, []);

    // Accedi direttamente ai context senza try/catch
    // useContext ritorna undefined/null quando il Provider non è nell'albero
    const mockAuth = useContext(MockAuthContext);
    const userContext = useContext(UserContext);

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