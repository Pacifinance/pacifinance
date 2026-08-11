import React from 'react';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import LogoPacifinance from '../assets/brand/logo-mark.webp';

export default function LogoPaci() {
  const navigate = useLocalizedNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div style={{
      padding: '8px',
      borderRadius: '12px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-2px) scale(1.05)';
      e.target.style.boxShadow = '0 8px 25px rgba(7, 145, 100, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0) scale(1)';
      e.target.style.boxShadow = 'none';
    }}
    onClick={handleLogoClick}>
      <img
        src={LogoPacifinance}
        alt="Pacifinance Logo"
        style={{
          height: '48px',
          width: '48px',
          borderRadius: '8px',
          transition: 'all 0.3s ease'
        }}
      />
    </div>
  );
}