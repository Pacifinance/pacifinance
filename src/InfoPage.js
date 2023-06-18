import React from 'react';
import styled from 'styled-components';
import Sidebar from './sections/Sidebar';
import Info from './sections/Info';
import ComingSoon from './components/ComingSoon';
function App() {
  return (
    <Div>
      <Sidebar />
      {/* <Info /> */}
      <ComingSoon />
    </Div>
  );
}

export default App;
const Div = styled.div `
position: relative;
`;