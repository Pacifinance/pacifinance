import React from 'react';
import { Header, Footer } from './sections/HeaderFooter';
import LandingContent from './sections/LandingContent';

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
