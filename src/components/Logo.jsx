import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogoPacifinance from '../assets/Brand/PacifinanceLogoPNG3NoBg.webp';

export default function LogoPaci() {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <img
      src={LogoPacifinance}
      alt="PaciFinance Logo"
      className="h-16 w-16 cursor-pointer"
      onClick={handleLogoClick}
    />
  );
}