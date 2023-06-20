import React from 'react';
import { Header, Footer } from './sections/HeaderFooter';
import LandingContent from './sections/LandingContent';
// import { ThemeProvider } from './contexts/ThemeContext';


function LandingPage() {
  return (
    <div>
        <Header />
        <LandingContent />
        <Footer />
    </div>
  );
}

export default LandingPage;
