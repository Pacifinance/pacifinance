
import React, { useContext } from 'react';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { ThemeContext } from '../contexts/ThemeContext';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function AuthButton() {
  const { theme } = useContext(ThemeContext);

  const navigate = useLocalizedNavigate();

  const handleAuthClick = () => {
    navigate('/auth');
  };

  return (
    <button
      onClick={handleAuthClick}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
      style={{
        backgroundColor: theme.secondaryColor,
        color: 'white'
      }}
      data-umami-event="header-auth-click"
    >
      <AccountCircleIcon fontSize="small" />
      <span>Access Account</span>
    </button>
  );
}
