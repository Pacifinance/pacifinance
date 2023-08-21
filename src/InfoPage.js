import React from 'react';
import styled from 'styled-components';
import Sidebar from './sections/Sidebar';
import ComingSoon from './components/ComingSoon';
// import Info from './sections/Info';

function InfoPage() {
  return (
    <Div>
      <Sidebar />
      {/* <Info /> */}
      <ComingSoon />
    </Div>
  );
}

export default InfoPage;
const Div = styled.div `
  position: relative;
`;