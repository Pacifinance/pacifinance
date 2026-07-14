// Generatore di URL per Open Graph images dinamiche
export const generateOGImage = (language, title) => {
  const baseUrl = "https://pacifinance.com/api/og";
  const params = new URLSearchParams({
    title: title,
    language: language,
    theme: "financial"
  });
  
  return `${baseUrl}?${params.toString()}`;
};

// Metadata per social sharing ottimizzati
export const getSocialMetadata = (language) => {
  const isItalian = language === 'it';
  
  return {
    title: isItalian 
      ? "Unifica le Tue Finanze - Dashboard Multi-Piattaforma Pacifinance"
      : "Unify Your Finances - Pacifinance Multi-Platform Dashboard",
    
    description: isItalian
      ? "Unifica le tue finanze in un'unica piattaforma. Traccia conti di diverse banche, confronta spese anonimamente e gestisci investimenti."
      : "Unify your finances in one platform. Track accounts across multiple banks, compare spending anonymously, and manage investments.",
    
    image: "https://pacifinance.com/PacifinanceLogoPNG3NoBg.webp",
    
    keywords: isItalian
      ? "unificare finanze, dashboard multi-piattaforma, gestione finanziaria, confronto anonimo, tracciamento spese, portafoglio investimenti"
      : "unify finances, multi-platform dashboard, financial management, anonymous comparison, expense tracking, investment portfolio",
    
    locale: isItalian ? "it_IT" : "en_US",
    alternateLocale: isItalian ? "en_US" : "it_IT",
    
    twitterCard: {
      card: "summary_large_image",
      site: "@pacifinance",
      creator: "@pacifinance"
    }
  };
};