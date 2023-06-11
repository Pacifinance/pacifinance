import React from 'react';
import styled from 'styled-components';
import Sidebar from './sections/Sidebar';
import RighSidebar from './sections/RightSidebar';
import InsertValues from './sections/InsertValues';
import ComingSoon from './components/ComingSoon';
function App() {
  return (
    <Div>
      <Sidebar />
      <InsertValues />
      {/* <ComingSoon /> */}
      <RighSidebar />
    </Div>
  );
}

export default App;
const Div = styled.div `
position: relative;
`;