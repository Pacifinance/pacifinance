import React from 'react';
import { Header, Footer } from './sections/HeaderFooter';
import LandingContent from './sections/LandingContent';
// import { PageWrapper } from './contexts/MyStyled';


export default function LandingPage() {
  return (
    <div>
      <Header />
      <LandingContent />
      <Footer />
    </div>
    
  );
}

