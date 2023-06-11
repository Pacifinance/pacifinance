import React from 'react';
import styled from 'styled-components';
import Sidebar from './sections/Sidebar';
import RighSidebar from './sections/RightSidebar';
import Info from './sections/Info';
import ComingSoon from './components/ComingSoon';
function App() {
  return (
    <Div>
      <Sidebar />
      {/* <Info /> */}
      <ComingSoon />
      <RighSidebar />
    </Div>
  );
}

export default App;
const Div = styled.div `
position: relative;
`;