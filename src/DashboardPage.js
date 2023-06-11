import React from 'react';
import styled from 'styled-components';
import Sidebar from './sections/Sidebar';
// import RighSidebar from './sections/RightSidebar';
import Dashboard from './sections/Dashboard';
function App() {
  return (
    <Div>
      <Sidebar />
      <Dashboard />
      {/* <RighSidebar /> */}
    </Div>
  );
}

export default App;
const Div = styled.div `
position: relative;
`;
