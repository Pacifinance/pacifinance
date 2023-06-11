import React from 'react';
import styled from 'styled-components';
import Sidebar from './sections/Sidebar';
import RighSidebar from './sections/RightSidebar';
import Graphs from './sections/YourCharts';
function App() {
  return (
    <Div>
      <Sidebar />
      <Graphs />
      <RighSidebar />
    </Div>
  );
}

export default App;
const Div = styled.div `
position: relative;
`;