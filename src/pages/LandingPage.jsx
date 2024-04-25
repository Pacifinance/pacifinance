import React, {useEffect, useContext} from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { Header, Footer } from '../sections/HeaderFooter';
import LandingContent from '../sections/LandingContent';
import { PageContainer } from '../styles/MyStyled';

export default function LandingPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { mode } = theme;

  return (
    <div className= "w-full flex overflow-auto min-h-screen items-center flex-col">
      {/* <PageContainer> */}
        <Header theme={theme} mode={mode} toggleMode={toggleMode}/>
        <LandingContent theme={theme}/>
        <Footer theme={theme}/>
      {/* </PageContainer> */}
    </div>
    
  );
}

  // Chiamata per caricare i dati dell'utente
  // const loadUserData = () => {
  //   handleSetIsUpdated(false); // Forza il re-render di UserProvider
  // };

  // useEffect(() => {
  //   loadUserData(); // Chiamata iniziale per caricare i dati dell'utente al caricamento della pagina
  // }, []);

  // Matomo Tag Manager
  // React.useEffect(() => {
  //   var _mtm = window._mtm = window._mtm || [];
  //   _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
  //   var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  //   g.async=true; g.src='https://cdn.matomo.cloud/pacifinance.matomo.cloud/container_geUS8Fsk.js'; s.parentNode.insertBefore(g,s);
  // }, [])

