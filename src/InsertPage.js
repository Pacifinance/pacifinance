import React from 'react';
import styled from 'styled-components';
import Sidebar from './sections/Sidebar';
import InsertValues from './sections/InsertValues';

function InsertPage() {
  return (
    <Div>
      <Sidebar />
      <InsertValues />
    </Div>
  );
}

export default InsertPage;
const Div = styled.div `
  position: relative;
`;