import React, { useState, useEffect } from 'react';
import { UserProvider } from './UserContext';
import { MockAuthProvider } from './MockAuthContext';
import DevToolbar from '../components/DevToolbar';

const DevModeProvider = ({ children }) => {
    const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);

    useEffect(() => {
        // Controlla se siamo in development mode
        const urlParams = new URLSearchParams(window.location.search);
        const hasDevParam = urlParams.get('dev') === 'true';
        const hasLocalStorageFlag = localStorage.getItem('pacifinance-dev-mode') === 'true';
        
        const devMode = import.meta.env.DEV && (hasDevParam || hasLocalStorageFlag);
        
        // console.log('DevModeProvider - import.meta.env.DEV:', import.meta.env.DEV);
        // console.log('DevModeProvider - hasDevParam:', hasDevParam);
        // console.log('DevModeProvider - hasLocalStorageFlag:', hasLocalStorageFlag);
        console.log('DevModeProvider - devMode result:', devMode);
        
        setIsDevelopmentMode(devMode);
        
        // Se è presente il parametro URL, salvalo nel localStorage
        if (hasDevParam) {
            localStorage.setItem('pacifinance-dev-mode', 'true');
        }
    }, []);

    // Toggle per development mode (solo in dev environment)
    const toggleDevMode = () => {
        if (import.meta.env.DEV) {
            const newMode = !isDevelopmentMode;
            setIsDevelopmentMode(newMode);
            localStorage.setItem('pacifinance-dev-mode', newMode.toString());
            window.location.reload(); // Ricarica per applicare il nuovo provider
        }
    };



    // console.log('DevModeProvider - isDevelopmentMode:', isDevelopmentMode);

    if (isDevelopmentMode) {
        return (
            <MockAuthProvider>
                {children}
                <DevToolbar 
                    isDevelopmentMode={isDevelopmentMode} 
                    toggleDevMode={toggleDevMode} 
                />
            </MockAuthProvider>
        );
    }

    return (
        <>
            {children}
            <DevToolbar 
                isDevelopmentMode={isDevelopmentMode} 
                toggleDevMode={toggleDevMode} 
            />
        </>
    );
};

export default DevModeProvider;