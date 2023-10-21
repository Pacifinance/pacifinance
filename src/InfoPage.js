import React from 'react';
import styled from 'styled-components';
import Sidebar from './sections/Sidebar';
import ComingSoon from './components/ComingSoon';

function InfoPage() {
  
  // Matomo Tag Manager
  React.useEffect(() => {
    var _mtm = window._mtm = window._mtm || [];
    _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.async=true; g.src='{container_geUS8Fsk.js}'; s.parentNode.insertBefore(g,s);
  }, []);

  return (
    <Div>
      <Sidebar />
      {/* <Info /> */}
      <ComingSoon />
    </Div>
  );
}

export default InfoPage;
const Div = styled.div `
  position: relative;
`;