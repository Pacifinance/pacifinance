import React, {useEffect, useContext} from 'react';
import { UserContext } from '../contexts/UserContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { ThemeContext } from '../contexts/ThemeContext';
import styled from 'styled-components';
import Sidebar from '../sections/Sidebar';

// import CheckPrice from '../sections/CheckPrice';
import ComingSoon from '../components/ComingSoon';

function CheckPricesPage() {
  // const { theme } = useContext(ThemeContext);
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useContext(UserContext);
  // const { isHidden, toggleHidden } = useContext(PrivacyContext);

  useEffect(() => {
    handleSetIsUpdated(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Matomo Tag Manager
  // React.useEffect(() => {
  //   var _mtm = window._mtm = window._mtm || [];
  //   _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
  //   var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  //   g.async=true; g.src='https://cdn.matomo.cloud/pacifinance.matomo.cloud/container_geUS8Fsk.js'; s.parentNode.insertBefore(g,s);
  // }, [])

  return (
    <Div>
      <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />
      <ComingSoon />
      {/* <CheckPrice /> */}
    </Div>
  );
}

export default CheckPricesPage;
const Div = styled.div `
position: relative;
`;