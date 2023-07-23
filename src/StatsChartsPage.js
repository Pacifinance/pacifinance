import React from 'react';
import styled from 'styled-components';
import Sidebar from './sections/Sidebar';
import StatsCharts from './sections/StatsCharts';
function App() {
  return (
    <Div>
      <Sidebar />
      <StatsCharts />
    </Div>
  );
}

export default App;
const Div = styled.div `
position: relative;
`;