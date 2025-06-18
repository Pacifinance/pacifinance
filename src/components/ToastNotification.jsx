
import React, { useState, useEffect } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';

const ToastNotification = ({ 
  message, 
  type = 'success', // 'success' or 'error'
  duration = 4000, 
  onClose,
  show = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsExiting(false);
      
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? '#4CAF50' : '#f44336';
  const Icon = isSuccess ? CheckCircleIcon : ErrorIcon;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transform transition-all duration-300 ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
      style={{
        backgroundColor: bgColor,
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        maxWidth: '400px',
        minWidth: '300px'
      }}
    >
      <div className="flex items-start space-x-3">
        <Icon className="flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div 
            className="text-sm font-medium"
            dangerouslySetInnerHTML={{ __html: message }}
          />
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black hover:bg-opacity-20 transition-colors"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
