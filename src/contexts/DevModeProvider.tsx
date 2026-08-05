import React, { useState, useEffect } from 'react';
import { UserProvider } from './UserContext';
import { MockAuthProvider } from './MockAuthContext';
import DevToolbar from '../components/DevToolbar';

const DevModeProvider = ({ children }) => {
    const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);

    useEffect(() => {
        // Check if we're in development mode
        const urlParams = new URLSearchParams(window.location.search);
        const hasDevParam = urlParams.get('dev') === 'true';
        const hasLocalStorageFlag = localStorage.getItem('pacifinance-dev-mode') === 'true';
        
        const devMode = import.meta.env.DEV && (hasDevParam || hasLocalStorageFlag);
        
        // console.log('DevModeProvider - import.meta.env.DEV:', import.meta.env.DEV);
        // console.log('DevModeProvider - hasDevParam:', hasDevParam);
        // console.log('DevModeProvider - hasLocalStorageFlag:', hasLocalStorageFlag);
        // DevMode result logged only in development
        if (devMode) console.warn('DevModeProvider - devMode enabled');
        
        setIsDevelopmentMode(devMode);
        
        // If the URL parameter is present, save it to localStorage
        if (hasDevParam) {
            localStorage.setItem('pacifinance-dev-mode', 'true');
        }
    }, []);

    // Toggle for development mode (dev environment only)
    const toggleDevMode = () => {
        if (import.meta.env.DEV) {
            const newMode = !isDevelopmentMode;
            setIsDevelopmentMode(newMode);
            localStorage.setItem('pacifinance-dev-mode', newMode.toString());
            window.location.reload(); // Reload to apply the new provider
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