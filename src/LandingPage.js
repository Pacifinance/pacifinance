import React from 'react';
import styled from 'styled-components';
// import Sidebar from './sections/Sidebar';
// import RighSidebar from './sections/RightSidebar';
import Landing from './sections/LandingPage';
import ComingSoon from './components/ComingSoon';
function App() {
  return (
    <Div>
    
      {/* <Leaderboard /> */}
      <ComingSoon />
      
    </Div>
  );
}

export default App;
const Div = styled.div `
position: relative;
`;