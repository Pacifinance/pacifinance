import React, { useState } from 'react';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { useAuth } from '../hooks/useAuth';
import LogoPacifinance from '../assets/brand/logo-mark.webp';

export default function LogoPaci() {
  const navigate = useLocalizedNavigate();
  const { isAuthenticated } = useAuth();
  const [hovered, setHovered] = useState(false);

  const handleLogoClick = () => {
    // Signed-in users click the logo expecting to stay in the app (the
    // standard SaaS pattern), not get bounced out to the marketing page.
    navigate(isAuthenticated ? '/dashboard' : '/');
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleLogoClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleLogoClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      <img
        src={LogoPacifinance}
        alt="Pacifinance Logo"
        style={{
          height: '40px',
          width: '40px',
          borderRadius: '8px',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: hovered ? 'scale(1.06)' : 'scale(1)',
        }}
      />
      <span
        style={{
          fontWeight: 700,
          fontSize: '1.15rem',
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
          transition: 'opacity 0.2s ease',
          opacity: hovered ? 0.75 : 1,
        }}
      >
        Pacifinance
      </span>
    </div>
  );
}
