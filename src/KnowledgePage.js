import React from 'react';
import styled from 'styled-components';
import Sidebar from './sections/Sidebar';
import Knowledge from './sections/Knowledge';
import ComingSoon from './components/ComingSoon';
function App() {
  return (
    <Div>
      <Sidebar />
      {/* <Knowledge /> */}
      <ComingSoon />
    </Div>
  );
}

export default App;
const Div = styled.div `
  position: relative;
`;