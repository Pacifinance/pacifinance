import React from 'react';
import { useMediaQuery } from 'react-responsive';

// Create a context with default values
export const MediaQueryContext = React.createContext({
  isDesktopOrLaptop: false,
  isBigScreen: false,
  isTablet: false,
  isMobile: false,
  isPortrait: false,
  isRetina: false,
});




export const MediaQueryProvider = ({ children }) => {
    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' });
    const isBigScreen = useMediaQuery({ query: '(min-width: 1824px)' });
    const isTabletScreen = useMediaQuery({ query: '(max-width: 1224px)' });
    const isMobileScreen = useMediaQuery({ query: '(max-width: 839px)' });
    const isPortrait = useMediaQuery({ query: '(orientation: portrait)' });
    const isRetina = useMediaQuery({ query: '(min-resolution: 2dppx)' });
  
    return (
      <MediaQueryContext.Provider value={{ isDesktopOrLaptop, isBigScreen, isTabletScreen, isMobileScreen, isPortrait, isRetina }}>
        {children}
      </MediaQueryContext.Provider>
    );
};

export default MediaQueryProvider;