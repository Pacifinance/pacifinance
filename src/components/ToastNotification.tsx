
import React, { useState, useEffect, useContext } from 'react';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';

// Note: ToastContext.tsx mirrors these two constants locally (rather than
// importing them) so its "close all" positioning math stays correct even
// when this component is mocked wholesale in ToastContext's own tests.
const TOAST_BASE_BOTTOM = { mobile: 80, desktop: 16 };
const TOAST_SLOT_HEIGHT = { mobile: 68, desktop: 84 };

const ToastNotification = ({
  message,
  type = 'success', // 'success', 'warning' or 'error'
  duration = 4000,
  onClose,
  show = false,
  stackIndex = 0, // 0 = closest to the corner; each older stacked toast increments by 1
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const mediaQuery = useContext(MediaQueryContext);
  const isMobile = mediaQuery?.isMobileScreen ?? false;

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsExiting(false);
      
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const bgColor = type === 'success' ? '#4CAF50' : type === 'warning' ? '#f59e0b' : '#f44336';
  const Icon = type === 'success' ? CheckCircleIcon : type === 'warning' ? WarningIcon : ErrorIcon;

  // On mobile: position above BottomNavBar (60px + 16px gap), compact style
  const bottom = (isMobile ? TOAST_BASE_BOTTOM.mobile : TOAST_BASE_BOTTOM.desktop)
    + stackIndex * (isMobile ? TOAST_SLOT_HEIGHT.mobile : TOAST_SLOT_HEIGHT.desktop);

  const mobileStyles = isMobile ? {
    bottom: `${bottom}px`,
    right: '8px',
    left: '8px',
    maxWidth: 'none',
    minWidth: 'auto',
    padding: '10px 12px',
    fontSize: '0.85rem',
    borderRadius: '10px',
  } : {
    bottom: `${bottom}px`,
    right: '16px',
    maxWidth: '400px',
    minWidth: '300px',
    padding: '16px',
    borderRadius: '8px',
  };

  return (
    <div
      className={`fixed z-50 transform transition-all duration-300 ${
        isExiting 
          ? (isMobile ? 'translate-y-full opacity-0' : 'translate-x-full opacity-0') 
          : (isMobile ? 'translate-y-0 opacity-100' : 'translate-x-0 opacity-100')
      }`}
      style={{
        backgroundColor: bgColor,
        color: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        ...mobileStyles,
      }}
    >
      <div className="flex items-center" style={{ gap: isMobile ? '8px' : '12px' }}>
        <Icon className="flex-shrink-0" style={{ fontSize: isMobile ? '18px' : '24px' }} />
        <div className="flex-1" style={{ minWidth: 0 }}>
          <div 
            className="font-medium"
            style={{ fontSize: isMobile ? '0.8rem' : '0.875rem', lineHeight: 1.3 }}
            dangerouslySetInnerHTML={{ __html: message }}
          />
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-20 transition-colors"
        >
          <CloseIcon style={{ fontSize: isMobile ? '16px' : '20px' }} />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
