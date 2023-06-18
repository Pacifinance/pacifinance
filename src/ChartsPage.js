import React from 'react';
import styled from 'styled-components';
import Sidebar from './sections/Sidebar';
import Graphs from './sections/YourCharts';
function App() {
  return (
    <Div>
      <Sidebar />
      <Graphs />
    </Div>
  );
}

export default App;
const Div = styled.div `
position: relative;
`;