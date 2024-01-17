import React, { createContext, useState } from 'react';

export const PrivacyContext = createContext();

export const PrivacyProvider = ({ children }) => {
  const [isHidden, setIsHidden] = useState(true);

  const toggleHidden = () => {
    setIsHidden(!isHidden);
  };

  return (
    <PrivacyContext.Provider value={{ isHidden, toggleHidden }}>
      {children}
    </PrivacyContext.Provider>
  );
};