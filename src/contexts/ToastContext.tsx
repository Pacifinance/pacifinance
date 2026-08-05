
import React, { createContext, useContext, useState } from 'react';
import ToastNotification from '../sections/ToastNotification';
import { MediaQueryContext } from './MediaQueryContext';
import { LanguageContext } from './LanguageContext';

const ToastContext = createContext();

// Cap concurrent on-screen toasts — extras stay queued in state (and start
// their own auto-dismiss timer only once they're actually rendered), so a
// burst of notifications never fully covers the screen.
const MAX_VISIBLE_TOASTS = 4;

// Mirrors ToastNotification's own positioning constants (kept separate,
// rather than imported, so this file doesn't depend on that component's
// internals — it's mocked wholesale in ToastContext's tests).
const TOAST_BASE_BOTTOM = { mobile: 80, desktop: 16 };
const TOAST_SLOT_HEIGHT = { mobile: 68, desktop: 84 };

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const mediaQuery = useContext(MediaQueryContext);
  const { translations } = useContext(LanguageContext) || {};
  const isMobile = mediaQuery?.isMobileScreen ?? false;

  const showToast = (message, type = 'success', duration = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast = { id, message, type, duration };

    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const closeAllToasts = () => setToasts([]);

  const showSuccess = (message, duration = 4000) => {
    showToast(message, 'success', duration);
  };

  const showError = (message, duration = 4000) => {
    showToast(message, 'error', duration);
  };

  const showWarning = (message, duration = 4000) => {
    showToast(message, 'warning', duration);
  };

  const visibleToasts = toasts.slice(-MAX_VISIBLE_TOASTS);
  const stackSize = visibleToasts.length;

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, closeAllToasts }}>
      {children}
      {visibleToasts.map((toast, index) => (
        <ToastNotification
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          show={true}
          stackIndex={stackSize - 1 - index}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      {stackSize > 1 && (
        <button
          onClick={closeAllToasts}
          className="fixed z-50"
          style={{
            bottom: `${(isMobile ? TOAST_BASE_BOTTOM.mobile : TOAST_BASE_BOTTOM.desktop)
              + stackSize * (isMobile ? TOAST_SLOT_HEIGHT.mobile : TOAST_SLOT_HEIGHT.desktop)}px`,
            right: isMobile ? '8px' : '16px',
            border: 'none',
            borderRadius: '999px',
            padding: '4px 12px',
            fontSize: '0.72rem',
            fontWeight: 700,
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          {translations?.general?.closeAllNotifications || 'Close all'}
        </button>
      )}
    </ToastContext.Provider>
  );
};
