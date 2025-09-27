import React, { useState } from 'react';

const DevToolbar = ({ isDevelopmentMode, toggleDevMode }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!import.meta.env.DEV) return null;

    const DevPanel = () => (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#2c3e50',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '12px',
            zIndex: 9999,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            minWidth: '250px',
            userSelect: 'none'
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '10px',
                borderBottom: '1px solid #34495e',
                paddingBottom: '8px'
            }}>
                <strong>🛠️ DEV TOOLS</strong>
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    {isExpanded ? '−' : '+'}
                </button>
            </div>
            
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>Mode:</span>
                <button
                    onClick={toggleDevMode}
                    style={{
                        background: isDevelopmentMode ? '#27ae60' : '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: '15px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 'bold'
                    }}
                >
                    {isDevelopmentMode ? '🧪 MOCK' : '🔒 PROD'}
                </button>
            </div>

            {isExpanded && (
                <div style={{ marginTop: '10px', fontSize: '11px' }}>
                    <div style={{ marginBottom: '8px', color: '#bdc3c7' }}>
                        <strong>Quick Actions:</strong>
                    </div>
                    <button
                        onClick={() => localStorage.clear()}
                        style={{
                            background: '#e67e22',
                            color: 'white',
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '10px',
                            marginRight: '5px'
                        }}
                    >
                        Clear Storage
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            background: '#3498db',
                            color: 'white',
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '10px'
                        }}
                    >
                        Reload
                    </button>
                    <div style={{ marginTop: '8px', color: '#95a5a6', fontSize: '10px' }}>
                        Environment: {import.meta.env.MODE}<br/>
                        Mock Auth: {isDevelopmentMode ? 'ON' : 'OFF'}
                    </div>
                </div>
            )}
        </div>
    );

    const MinimizedButton = () => (
        <div
            onClick={() => setIsExpanded(true)}
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: isDevelopmentMode ? '#27ae60' : '#e74c3c',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                zIndex: 9999,
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                userSelect: 'none'
            }}
        >
            {isDevelopmentMode ? '🧪' : '🔒'}
        </div>
    );

    return isExpanded ? <DevPanel /> : <MinimizedButton />;
};

export default DevToolbar;