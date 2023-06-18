import React from 'react';
import styled from 'styled-components';
import Sidebar from './sections/Sidebar';
import Leaderboard from './sections/Leaderbord';
import ComingSoon from './components/ComingSoon';
function App() {
  return (
    <Div>
      <Sidebar />
      {/* <Leaderboard /> */}
      <ComingSoon />
    </Div>
  );
}

export default App;
const Div = styled.div `
position: relative;
`;