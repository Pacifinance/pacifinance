import React, {useEffect, useContext} from 'react';
import { UserContext } from './contexts/UserContext';
import styled from 'styled-components';
import Sidebar from './sections/Sidebar';
import Dashboard from './sections/Dashboard';

function DashboardPage() {

  const { userData, handleSetIsUpdated } = useContext(UserContext);

  // Chiamata per caricare i dati dell'utente
  const loadUserData = () => {
    handleSetIsUpdated(false); // Forza il re-render di UserProvider
  };

  useEffect(() => {
    loadUserData(); // Chiamata iniziale per caricare i dati dell'utente al caricamento della pagina
  }, []);

  // Matomo Tag Manager
  // React.useEffect(() => {
  //   var _mtm = window._mtm = window._mtm || [];
  //   _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
  //   var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  //   g.async=true; g.src='container_geUS8Fsk.js'; s.parentNode.insertBefore(g,s);
  // }, []);

  return (
    <Div>
      <Sidebar />
      <Dashboard />
    </Div>
  );
}

export default DashboardPage;

const Div = styled.div `
  position: relative;
`;
