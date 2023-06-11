import React from 'react';
import styled from 'styled-components';
import Sidebar from './sections/Sidebar';
import RighSidebar from './sections/RightSidebar';
//import CheckPrice from './sections/CheckPrice';
import ComingSoon from './components/ComingSoon';

function App() {
  return (
    <Div>
      <Sidebar />
      {/* <CheckPrice /> */}
      <ComingSoon />
      <RighSidebar />
    </Div>
  );
}

export default App;
const Div = styled.div `
position: relative;
`;