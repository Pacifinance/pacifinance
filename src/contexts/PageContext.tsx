import React, { createContext, useState } from 'react';

export const IconContext = createContext();

export function PageProvider({ children }) {
  const [activeIcon, setActiveIcon] = useState(0);

  return (
    <IconContext.Provider value={{ activeIcon, setActiveIcon }}>
      {children}
    </IconContext.Provider>
  );
}

