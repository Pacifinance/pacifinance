
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import languages from '../data/languages.json';

export default function AuthButton() {
  const { theme } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

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
